import {
    DSUCallback,
    DSUCreationDecorator,
    DSUDecorator,
    DSUEditDecorator,
    DSUMultipleCallback,
    OpenDSURepository
} from "./repository";
import {DSUCreationMetadata, DsuKeys, DSUModel, DSUOperation} from "../model";
import {
    DSU,
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

/**
 * Util method to retrieve the proper {@link DSU} factory method according to the {@link KeySSI} type
 * @param {KeySSI} keySSI
 * @namespace repository
 */
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

/**
 * Util method to retrieve the proper {@link KeySSI} factory method according to the {@link KeySSIType}
 * @param {KeySSIType} type
 * @return {Function} KeySSI factory method
 * @namespace repository
 */
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
 * Util method that handles the {@link DSU}'s batch operation close
 *
 * @param {Err} err
 * @param {DSU} dsu
 * @param {any[]} args
 *      The last arg will be considered to be the {@link Callback};
 *
 * @function
 * @namespace repository
 */
export function batchCallback(err: Err, dsu: DSU, ...args: any[]){
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
 * Creates a DSU from its matching {@link DSUModel}'s decorations
 *
 * @typedef T extends DSUModel
 * @param {T} model {@link DSUBlueprint} decorated {@link DSUModel}
 * @param {string} fallbackDomain The domain to be used when its not defined in the DSU Blueprint
 * @param {any[] | DSUCallback[]} keyGenArgs key generation args when required (for Array SSIs for instance). The last arg will be considered to be the {@link DSUCallback<T>};
 *
 * @function
 * @namespace repository
 */
export function createFromDecorators<T extends DSUModel>(this: OpenDSURepository<T>, model: T, fallbackDomain: string,  ...keyGenArgs: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = keyGenArgs.pop();
    if (!callback)
        throw new CriticalError(`Missing callback`);

    const splitDecorators: {creation?: DSUCreationDecorator[], editing?: DSUEditDecorator[]} | undefined = splitDSUDecorators<T>(model);

    if (!splitDecorators)
        return handleDSUClassDecorators.call(this, model, fallbackDomain, ...keyGenArgs, (err?: Err, newModel?: T, dsu?: DSU, keySSI?: KeySSI) => {
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

        handleDSUClassDecorators.call(this, model, fallbackDomain, ...keyGenArgs, (err: Err, updatedModel?: T, dsu?: DSU, keySSI?: KeySSI, isBatchMode: boolean = false) => {
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

/**
 * Will create a {@link DSU} based on the definitions of the {@link DSUBlueprint}
 *
 * @param {T} model {@link DSUBlueprint} decorated {@link DSUModel}
 * @param {string} fallbackDomain The repository's fallback anchoring domain when not defined by the {@link DSUBlueprint}
 * @param {string[]} [args] parameters to be passed to the KeyGeneration Function, after the ones originated from the {@link DSUModel}'s properties, as defined in the {@link DSUBlueprint}
 *       The last arg will be considered to be the {@link DSUCallback<T>};
 *
 * @function
 * @namespace repository
 */
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
        return errorCallback(e as Error, callback);
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

/**
 * Splits the Attribute decorators between their matching {@link DSUOperation}
 * @param {T} model
 * @return {{creation: DSUCreationDecorator[], editing: DSUEditDecorator[]}} split decorators
 *
 * @function
 * @namespace repository
 */
export function splitDSUDecorators<T extends DSUModel>(model: T) : {creation?: DSUCreationDecorator[], editing?: DSUEditDecorator[]} | undefined{
    const propDecorators: {[indexer: string]: any[]} | undefined = getAllPropertyDecorators<T>(model as T, DsuKeys.REFLECT);
    if (!propDecorators)
        return;
    return Object.keys(propDecorators).reduce((accum: {creation?: DSUCreationDecorator[], editing?: DSUEditDecorator[]} | undefined, key) => {
        const decorators: DSUDecorator[] = propDecorators[key].filter(dec => dec.key !== ModelKeys.TYPE);
        if (!decorators || ! decorators.length)
            return accum;
        const addToAccum = function(decorator: DSUDecorator){
            if (!accum)
                accum = {};

            decorator = Object.assign({}, decorator, {prop: key});

            switch(decorator.props.operation){
                case DSUOperation.CREATION:
                    accum.creation = accum.creation || [];
                    accum.creation.push(decorator as DSUCreationDecorator);
                    break;
                case DSUOperation.EDITING:
                    accum.editing = accum.editing || [];
                    accum.editing.push(decorator as DSUEditDecorator);
                    break;
                default:
                    throw new LoggedError(`Invalid DSU Operation provided ${decorator.props.operation}`);
            }
        }

        decorators.forEach(addToAccum);
        return accum;
    }, undefined);
}

/**
 * Util type to describe the results of DSU creation operations
 *
 * @type DSUCreationResults
 * @namespace repository
 */
export type DSUCreationResults = {[indexer: string]: {model: DSUModel, dsu: DSU, keySSI: KeySSI}[]};

/**
 * Handles the {@link DSU} creation operations, as tagged by the attribute decorators
 *
 * @param {DSUCache} dsuCache the current {@link DSUCache}
 * @param {T} model {@link DSUBlueprint} decorated {@link DSUModel}
 * @param {any} decorators
 * @param {any[]} [args]
 *       The last arg will be considered to be the {@link DSUMultipleCallback<T>};
 *
 * @function
 * @namespace repository
 */
export function handleCreationPropertyDecorators<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorators: DSUDecorator[], ...args: (any | DSUMultipleCallback<T>)[]){
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

/**
 * Handles the {@link DSU} edition operations, as tagged by the attribute decorators
 *
 * @param {DSUCache} dsuCache the current {@link DSUCache}
 * @param {T} model {@link DSUBlueprint} decorated {@link DSUModel}
 * @param {DSU} dsu teh {@link DSU} object
 * @param {any} decorators
 * @param {any[]} [args]
 *       The last arg will be considered to be the {@link DSUCallback<T>};
 *
 * @function
 * @namespace repository
 */
export function handleEditingPropertyDecorators<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, dsu: DSU, decorators: DSUEditDecorator[], ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new CriticalError(`Missing callback`);

    const dsuOperationsRegistry = getDSUOperationsRegistry();

    const self : OpenDSURepository<T> = this;

    const splitDecorators: {grouped: {[indexer: string]: any}, single: DSUEditDecorator[]} = decorators.reduce((accum: any, dec: DSUEditDecorator) => {
        if (!dec.props.grouped){
            accum.single = accum.single || [];
            accum.single.push(dec)
            return accum;
        }
        accum.grouped = accum.grouped || {};
        if (!dec.props || !dec.props.key || !dec.props.grouping)
            return criticalCallback(new Error(`Missing Decorator properties`), callback);

        accum.grouped[dec.props.key] = accum.grouped[dec.props.key] || {};

        if (accum.grouped[dec.props.key][dec.props.grouping]){
            const newPropValue: {[indexer: string] : any} = {};
            newPropValue[dec.prop] = model[dec.prop];
            Object.assign(accum.grouped[dec.props.key][dec.props.grouping].value, newPropValue);
        } else {
            const newPropValue: {[indexer: string] : any} = {};
            newPropValue[dec.prop] = model[dec.prop];
            accum.grouped[dec.props.key][dec.props.grouping] = Object.assign({}, dec, {
                    value: newPropValue
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

    const grouped = Object.keys(splitDecorators.grouped || {}).reduce((accum, k) => {
        // @ts-ignore
        accum.push(...Object.values(splitDecorators.grouped[k]))
        return accum;
    }, []);

    decoratorIterator(grouped, model, (err: Err, newModel: T) => {
        if (err)
            return callback(err);
        decoratorIterator((splitDecorators.single || []).slice(), newModel,(err: Err, newModel: T) => {
            if (err)
                return callback(err);
            callback(undefined, newModel);
        });
    });
}