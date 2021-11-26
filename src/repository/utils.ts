import {DSUCallback, DSUMultipleCallback, OpenDSURepository} from "./repository";
import {DsuKeys, DSUModel, DSUOperation} from "../model";
import {DSU, ErrCallback, getAnchoringOptionsByDSUType, getKeySsiSpace, getResolver, KeySSI, KeySSIType} from "../opendsu";
import {
    Callback, criticalCallback, CriticalError, Err,
    errorCallback,
    getAllPropertyDecorators,
    getClassDecorators,
    LoggedError
} from "@tvenceslau/db-decorators/lib";
import {DSUCreationHandler, DSUFactoryMethod} from "./types";
import {getDSUOperationsRegistry} from "./registry";
import {ModelKeys} from "@tvenceslau/decorator-validation/lib";

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

     handleCreationPropertyDecorators.call(this, model, creation || [],  (err: Err, models: T[], dsus?: DSU[], keySSIs?:[]) => {
        if (err)
            return callback(err);

        handleDSUClassDecorators.call(this, model, fallbackDomain, ...args, (err: Err, updatedModel?: T, dsu?: DSU, keySSI?: KeySSI, isBatchMode: boolean = false) => {
            if (err || !updatedModel || !dsu || !keySSI)
                return callback(err || new CriticalError("Invalid Results"));

            const cb = function(err: Err, ...argz: any[]){
                if (err)
                    return isBatchMode ? dsu.cancelBatch(() => {
                        criticalCallback(err, callback);
                    }) : criticalCallback(err, callback);
                return isBatchMode ? dsu.commitBatch((e?: Err) => {
                    if (e)
                        return dsu.cancelBatch(() =>{
                            criticalCallback(e, callback);
                        });
                    callback(undefined, ...argz);
                }) : callback(undefined, ...argz);
            }

            if (isBatchMode)
                dsu.beginBatch();

            handleEditingPropertyDecorators.call(this, updatedModel, dsu, editing || [], (err: Err, otherModel: T, otherDSU: DSU, otherKeySSI: KeySSI) => {
                if (err || !otherModel || !otherDSU || !otherKeySSI)
                    return cb(err || new Error("Invalid Results"));
                cb(undefined, otherModel, otherDSU, otherKeySSI);
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

export function handleCreationPropertyDecorators<T extends DSUModel>(this: OpenDSURepository<T>, model: T, decorators: any[], ...args: (any | DSUMultipleCallback<T>)[]){
    const callback: DSUMultipleCallback<T> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const dsuOperationsRegistry = getDSUOperationsRegistry();

    const self : OpenDSURepository<T> = this;

    const accumulator: {model: DSUModel[], dsu: DSU[], keySSI: KeySSI[]} = {
        model: [],
        dsu: [],
        keySSI: []
    }

    const decoratorIterator = function<T>(decoratorsCopy: any[], callback: Callback){
        const decorator = decoratorsCopy.shift();
        if (!decorator)
            return callback(undefined, ...Object.values(accumulator));

        let handler: DSUCreationHandler | undefined = dsuOperationsRegistry.get(decorator.props.dsu, decorator.prop, decorator.props.operation) as DSUCreationHandler;

        if (!handler)
            return criticalCallback(`No handler found for ${decorator.props.dsu} - ${decorator.prop} - ${decorator.props.operation}`, callback);

        handler.call(self, model[decorator.prop], decorator.props, (err: Err, newModel?: DSUModel, dsu?: DSU, keySSI?: KeySSI) => {
            if (err || !newModel || !dsu || !keySSI)
                return criticalCallback(err || new Error(`Missing Results`), callback);
            accumulator.model.push(newModel);
            accumulator.dsu.push(dsu);
            accumulator.keySSI.push(keySSI);
            decoratorIterator(decoratorsCopy, callback);
        });

    }

    decoratorIterator(decorators.slice(), (err, models: T[], dsus: DSU[], keySSIs: KeySSI[]) => {
        if (err)
            return callback(err);
        callback(undefined, models, dsus, keySSIs)
    });
}

export function handleEditingPropertyDecorators<T extends DSUModel>(this: OpenDSURepository<T>, model: T, dsu: DSU, decorators: any[], ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const decoratorIterator = function(decoratorsCopy: any[], callback: Callback){
        const decorator = decoratorsCopy.shift();
        if (!decorator)
            return callback(); // TODO

    }

    decoratorIterator(decorators.slice(), (err) => {
        if (err)
            return callback(err);
    });
}

export function handleDSUPropertyDecorators<T extends DSUModel>(model: T, decorators: any[], ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const decoratorIterator = function(prop: string, decorators: any, callback: Callback): void {
        const decorator = decorators.shift();
        if (!decorator)
            return callback(); // TODO
        if (decorator.key === ModelKeys.MODEL)
            return decoratorIterator(prop, decorators, callback);

        // TODO
    }

    const propIterator = function(propsCopy: string[], callback: Callback): void {
        const prop = propsCopy.shift();
        if (!prop)
            return callback();
        decoratorIterator(prop, decorators.slice(), (err) => {
            if (err)
                return callback(err);
            propIterator(propsCopy, callback);
        });
    }

    propIterator(decorators, (err) => {
        if (err)
            return callback(err);
        callback(); // TODO
    });
}