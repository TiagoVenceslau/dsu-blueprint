import {DSUCallback, DSUMultipleCallback, OpenDSURepository} from "./repository";
import {DsuKeys, DSUModel, DSUOperation} from "../model";
import {
    DSU,
    ErrCallback,
    GenericCallback,
    getAnchoringOptionsByDSUType,
    getKeySsiSpace,
    getResolver,
    KeySSI,
    KeySSIType
} from "../opendsu";
import {
    Callback, criticalCallback, CriticalError, Err,
    errorCallback,
    getAllPropertyDecorators,
    getClassDecorators,
    LoggedError
} from "@tvenceslau/db-decorators/lib";
import {DSUCreationHandler, DSUEditingHandler, DSUFactoryMethod} from "./types";
import {getDSUOperationsRegistry} from "./registry";
import {ModelKeys} from "@tvenceslau/decorator-validation/lib";
import {DSUCache} from "./cache";
import {KeyType} from "crypto";

export function getDSUFactory(keySSI: KeySSI): DSUFactoryMethod{
    switch (keySSI.getTypeName()) {
        case KeySSIType.ARRAY:
        case KeySSIType.WALLET:
            return getResolver().createDSUForExistingSSI;
        case KeySSIType.SEED:
            return getResolver().createDSU;
        default:
            throw new LoggedError(`Unsupported DSU Factory ${keySSI.getTypeName()}`);
    }
}

export function getKeySSIFactory(type: KeySSIType): (...args: any[]) => KeySSI{
    switch (type){
        case KeySSIType.ARRAY:
            return getKeySsiSpace().createArraySSI;
        case KeySSIType.WALLET:
            return getKeySsiSpace().createTemplateWalletSSI;
        case KeySSIType.SEED:
            return getKeySsiSpace().createTemplateSeedSSI;
        default:
            throw new LoggedError(`Unsupported KeySSI Type ${type}`);
    }
}


const batchCallback = function(err: Err, dsu: DSU, ...args: any[]){
    const callback: Callback = args.pop();
    if (!callback)
        throw new CriticalError(`Missing callback`);

    if (err)
        return dsu.batchInProgress() ? dsu.cancelBatch(() => {
            criticalCallback(err, callback);
        }) : criticalCallback(err, callback);
    return dsu.batchInProgress() ? dsu.commitBatch((e?: Err) => {
        if (e)
            return dsu.cancelBatch(() =>{
                criticalCallback(e, callback);
            });
        callback(undefined, ...args);
    }) : callback(undefined, ...args);
}

/**
 *
 * Creates a DSU from its matching {@link DSUModel}'s decorations
 *
 * @typedef T extends DSUModel
 * @param {T} model
 * @param {string} fallbackDomain The domain to be used when its not defined in the DSU Blueprint
 * @param {any[] | DSUCallback<T>[]} args key generation args when required (for Array SSIs for instance).
 *      The last arg will be considered to be the callback;
 */
export function createFromDecorators<T extends DSUModel>(this: OpenDSURepository<T>, model: T, fallbackDomain: string, ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new CriticalError(`Missing callback`);

    const splitDecorators: {creation?: {}[], editing?: {}[]} | undefined = splitDSUDecorators<T>(model);

    if (!splitDecorators)
        return handleDSUClassDecorators.call(this, model, fallbackDomain, ...args, (err?: Err, newModel?: T, dsu?: DSU, keySSI?: KeySSI) => {
            if (err || !newModel || !dsu || !keySSI)
                return callback(err || new CriticalError(`Invalid results`));
            callback(undefined, newModel, dsu, keySSI);
        });

    const {creation, editing} = splitDecorators;

    const dsuCache: DSUCache<T> = new DSUCache<T>();

    handleCreationPropertyDecorators.call(this, dsuCache, model, creation || [],  (err: Err, results?: DSUCreationResults) => {
        if (err || !results)
            return callback(err || new CriticalError(`Invalid Results`));

        Object.keys(results).forEach(k => {
            results[k].forEach(result => {
                dsuCache.cache(model, k, result.dsu, result.keySSI)
            })
        })

        handleDSUClassDecorators.call(this, model, fallbackDomain, ...args, (err: Err, updatedModel?: T, dsu?: DSU, keySSI?: KeySSI, isBatchMode: boolean = false) => {
            if (err || !updatedModel || !dsu || !keySSI)
                return callback(err || new CriticalError("Invalid Results"));

            if (isBatchMode)
                dsu.beginBatch();

            handleEditingPropertyDecorators.call(this, dsuCache as DSUCache<DSUModel>, updatedModel, dsu, editing || [], (err: Err, otherModel: T) => {
                if (err || !otherModel)
                    return batchCallback(err || new Error("Invalid Results"), dsu, callback);
                batchCallback(undefined, dsu, otherModel, dsu, keySSI, callback);
            });
        });
    });
}

export function handleDSUClassDecorators<T extends DSUModel>(this: OpenDSURepository<T>, model: T, fallbackDomain: string, ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const classDecorators: {key: string, props: any}[] = getClassDecorators(ModelKeys.REFLECT, model);

    if (!classDecorators.length)
        return criticalCallback(new Error(`No DSU decorator Found on Model`), callback);

    let {domain, keySSIType, specificKeyArgs, props, batchMode} = classDecorators[0].props.dsu;

    let keySSI: KeySSI, dsuFactory: DSUFactoryMethod;

    try{
        const factory = getKeySSIFactory(keySSIType);

        const keyArgs: any[] = [domain || fallbackDomain];
        if (!props){
            if (args && args.length)
                keyArgs.push(args);
        } else {
            if (args)
                props.push(...args);
            keyArgs.push(props);
        }

        if (specificKeyArgs && specificKeyArgs.length)
            keyArgs.push(...specificKeyArgs);

        keySSI = factory(...keyArgs);
        dsuFactory = getDSUFactory(keySSI);
    } catch (e){
        return errorCallback(e, callback);
    }

    const options = getAnchoringOptionsByDSUType(keySSI.getTypeName() as KeySSIType);

    dsuFactory(keySSI, options, (err, dsu) => {
        if (err || !dsu)
            return criticalCallback(err || new Error(`No DSU received`), callback);

        dsu.getKeySSIAsObject((err, keySSI) => {
            if (err)
                return errorCallback(err, callback);
            callback(undefined, model, dsu, keySSI, batchMode);
        });
    });
}

export function splitDSUDecorators<T extends DSUModel>(model: T) : {creation?: any[], editing?: any[]} | undefined{
    const propDecorators: {[indexer: string]: any[]} | undefined = getAllPropertyDecorators<T>(model as T, DsuKeys.REFLECT);
    if (!propDecorators)
        return;
    return Object.keys(propDecorators).reduce((accum: {creation?: any[], editing?: any[]} | undefined, key) => {
        const decorators: {key: string, props: any}[] = propDecorators[key].filter(dec => dec.key !== ModelKeys.TYPE);
        if (!decorators || ! decorators.length)
            return accum;
        const addToAccum = function(decorator: {key: string, props: {operation: string}}){
            if (!accum)
                accum = {};

            decorator = Object.assign({}, decorator, {prop: key});

            switch(decorator.props.operation){
                case DSUOperation.CREATION:
                    accum.creation = accum.creation || [];
                    accum.creation.push(decorator);
                    break;
                case DSUOperation.EDITING:
                    accum.editing = accum.editing || [];
                    accum.editing.push(decorator);
                    break;
                default:
                    throw new LoggedError(`Invalid DSU Operation provided ${decorator.props.operation}`);
            }
        }

        decorators.forEach(addToAccum);
        return accum;
    }, undefined);
}

export type DSUCreationResults = {[indexer: string]: {model: DSUModel, dsu: DSU, keySSI: KeySSI}[]};

export function handleCreationPropertyDecorators<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorators: any[], ...args: (any | DSUMultipleCallback<T>)[]){
    const callback: DSUMultipleCallback<DSUModel> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const dsuOperationsRegistry = getDSUOperationsRegistry();

    const self : OpenDSURepository<T> = this;

    const results: DSUCreationResults = {};

    const decoratorIterator = function<T>(decoratorsCopy: any[], callback: Callback){
        const decorator = decoratorsCopy.shift();
        if (!decorator)
            return callback(undefined, results);

        let handler: DSUCreationHandler | undefined = dsuOperationsRegistry.get(decorator.props.dsu, decorator.prop, decorator.props.operation) as DSUCreationHandler;

        if (!handler)
            return criticalCallback(`No handler found for ${decorator.props.dsu} - ${decorator.prop} - ${decorator.props.operation}`, callback);

        handler.call(self, dsuCache, model[decorator.prop], decorator.props, (err: Err, newModel?: DSUModel, dsu?: DSU, keySSI?: KeySSI) => {
            if (err || !newModel || !dsu || !keySSI)
                return criticalCallback(err || new Error(`Missing Results`), callback);

            results[decorator.prop] = results[decorator.prop] || [];
            results[decorator.prop].push(({
                model: newModel,
                dsu: dsu,
                keySSI: keySSI
            }));

            decoratorIterator(decoratorsCopy, callback);
        });

    }

    decoratorIterator(decorators.slice(), (err, results) => {
        if (err)
            return callback(err);
        callback(undefined, results)
    });
}

export function handleEditingPropertyDecorators<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, dsu: DSU, decorators: any[], ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const dsuOperationsRegistry = getDSUOperationsRegistry();

    const self : OpenDSURepository<T> = this;

    const splitDecorators: {grouped: {[indexer: string]: any}, single: any[]} = decorators.reduce((accum, dec) => {
        if (!dec.props.grouped){
            accum.single = accum.single || [];
            accum.single.push(dec)
            return accum;
        }
        accum.grouped = accum.grouped || {};
        accum.grouped[dec.props.key] = accum.grouped[dec.props.key] || {};
        accum.grouped[dec.props.key][dec.prop] = accum.grouped[dec.props.key][dec.prop] || {};

        if (accum.grouped[dec.props.key][dec.prop][dec.grouping]){
            const newPropValue: {[indexer: string] : any} = {};
            newPropValue[dec.prop] = model[dec.prop];
            Object.assign(accum.grouped[dec.props.key][dec.prop][dec.grouping], {
                value: newPropValue
            });
        } else {
            Object.assign({}, dec, {
                value: model[dec.prop]
            });
        }
        return accum;
    }, {});

    const decoratorIterator = function(decoratorsCopy: any[], newModel: T, callback: Callback){
        const decorator = decoratorsCopy.shift();
        if (!decorator)
            return callback(undefined, newModel);

        let handler: DSUEditingHandler | undefined = dsuOperationsRegistry.get(newModel.constructor.name, decorator.prop, decorator.props.operation) as DSUEditingHandler;

        if (!handler)
            return criticalCallback(new Error(`No handler found for ${decorator.props.dsu} - ${decorator.prop} - ${decorator.props.operation}`), callback);

        handler.call(self, dsuCache, model, dsu, decorator, (err: Err, newModel?: DSUModel) => {
            if (err || !newModel)
                return criticalCallback(err || new Error(`Missing Results`), callback);

            decoratorIterator(decoratorsCopy, newModel as T, callback);
        });
    }

    decoratorIterator((splitDecorators.grouped || []).slice(), model, (err: Err, newModel: T) => {
        if (err)
            return callback(err);
        decoratorIterator((splitDecorators.single || []).slice(), newModel,(err: Err, newModel: T) => {
            if (err)
                return callback(err);
            callback(undefined, newModel);
        });
    });
}