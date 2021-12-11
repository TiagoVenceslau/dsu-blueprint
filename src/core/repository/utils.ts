import {
    DSUCallback,
    DSUCreationDecorator,
    DSUDecorator,
    DSUEditDecorator,
    DSUMultipleCallback,
    OpenDSURepository
} from "./repository";
import {DsuKeys, DSUModel, DSUOperation, WalletDSU} from "../model";
import {
    DSU, DSUAnchoringOptions,
    getKeySSIApi,
    getResolverApi, WalletDsu,
} from "../opendsu";
import {
    all,
    Callback, criticalCallback, CriticalError, Err,
    getAllPropertyDecorators,
    getClassDecorators,
    LoggedError, OperationKeys
} from "@tvenceslau/db-decorators/lib";
import {
    DSUClassCreationHandler,
    DSUCreationHandler,
    DSUCreationUpdateHandler,
    DSUEditingHandler,
} from "./types";
import {getDSUOperationsRegistry} from "./registry";
import {ModelKeys} from "@tvenceslau/decorator-validation/lib";
import {DSUCache} from "./cache";
import {KeySSI, KeySSIType} from "../opendsu/apis/keyssi";

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

export function safeParseKeySSI(keySSI: string, callback: Callback){
    let key: KeySSI;
    try{
        key = getKeySSIApi().parse(keySSI);
    } catch (e) {
        return callback(e as Error);
    }
    callback(undefined, key);
}

/**
 * Creates a DSU from its matching {@link DSUModel}'s decorations
 *
 * @typedef T extends DSUModel
 * @param {T} model {@link DSUBlueprint} decorated {@link DSUModel}
 * @param {DSUCache<T> | undefined} [dsuCache] undefined for new transactions, inherited otherwise
 * @param {any[] | DSUCallback[]} keyGenArgs key generation args when required (for Array SSIs for instance). The last arg will be considered to be the {@link DSUCallback<T>};
 *
 * @function
 * @namespace repository
 */
export function createFromDecorators<T extends DSUModel>(this: OpenDSURepository<T>, model: T, dsuCache: DSUCache<T> | undefined, ...keyGenArgs: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = keyGenArgs.pop();
    if (!callback)
        throw new CriticalError(`Missing callback`);

    const splitDecorators: {creation?: DSUCreationDecorator[], editing?: DSUEditDecorator[]} | undefined = splitDSUDecorators<T>(model);

    dsuCache = dsuCache || new DSUCache<T>();

    const cb = function(err: Err, newModel?: T, dsu?: DSU){
        if (err || !newModel || !dsu)
            return callback(err || new CriticalError(`Invalid results`));
        dsu.getKeySSIAsObject((err: Err, keySSI?: KeySSI) => {
            if (err || !keySSI)
                return criticalCallback(err || new Error("Missing KeySSI"), callback);
            callback(undefined, newModel, dsu, keySSI);
        });
    }

    if (!splitDecorators)
        return handleDSUClassDecorators.call(this, dsuCache, model, OperationKeys.CREATE, ...keyGenArgs, (err?: Err, newModel?: T, dsu?: DSU, keySSI?: KeySSI) => {
            if (err || !newModel || !dsu)
                return cb(err || new CriticalError(`Invalid results`));
            batchCallback(undefined, dsu, newModel, dsu, cb);
        });

    const {creation, editing} = splitDecorators;

    handleCreationPropertyDecorators.call(this, dsuCache, model, creation || [],  (err: Err) => {
        if (err)
            return callback(err);

        handleDSUClassDecorators.call(this, dsuCache as DSUCache<T>, model, OperationKeys.CREATE, ...keyGenArgs, (err: Err, updatedModel?: T, dsu?: DSU, isBatchMode: boolean = false) => {
            if (err || !updatedModel || !dsu)
                return callback(err || new CriticalError("Invalid Results"));

            if (isBatchMode)
                dsu.beginBatch();

            handleEditingPropertyDecorators.call(this, dsuCache as DSUCache<DSUModel>, updatedModel, dsu, editing || [], OperationKeys.CREATE, (err: Err, otherModel: T) => {
                if (err || !otherModel)
                    return batchCallback(err || new Error("Invalid Results"), dsu, cb);
                batchCallback(undefined, dsu, otherModel, dsu, cb);
            });
        });
    });
}

/**
 * Will create a {@link DSU} based on the definitions of the {@link DSUBlueprint}
 *
 * @param {DSUCache} dsuCache
 * @param {T} model {@link DSUBlueprint} decorated {@link DSUModel}
 * @param {OperationKeys} [operation] accepts {@link OperationKeys.CREATE} or {@link OperationKeys.UPDATE}. defaults to the first
 * @param {string[]} [args] parameters to be passed to the KeyGeneration Function, after the ones originated from the {@link DSUModel}'s properties, as defined in the {@link DSUBlueprint}
 *       The last arg will be considered to be the {@link DSUCallback<T>};
 *
 * @function
 * @namespace repository
 */
export function handleDSUClassDecorators<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, operation: string = OperationKeys.CREATE, ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const decorator: {key: string, props: any} | undefined = getClassDecorators(DsuKeys.REFLECT, model).find(d => d.key === DsuKeys.CONSTRUCTOR);

    if (!decorator)
        return criticalCallback(new Error(`No DSUBlueprint decorator Found on Model`), callback);

    const handler: DSUClassCreationHandler = getDSUOperationsRegistry().get(model.constructor.name, DsuKeys.CONSTRUCTOR, DSUOperation.CLASS, OperationKeys.CREATE) as DSUClassCreationHandler;
    if (!handler)
        return criticalCallback(`No handler found for ${decorator.props.dsu} - ${decorator.key} - ${decorator.props.dsu.operation}`, callback);

    const {batchMode} = decorator.props.dsu

    all(`[{0}] - calling DSU Property Creation Handler for model {1}`, this.constructor.name, model);
    handler.call(this, dsuCache, model, decorator.props, ...args, (err: Err, newModel?: DSUModel, dsu?: DSU) => {
        if (err || !newModel || !dsu)
            return criticalCallback(err || new Error("Missing Results"), callback);
        all(`[{0}] - calling DSU Class Creation Handler for model {1} finished`, this.constructor.name, model.constructor.name);
        callback(undefined, newModel as T, dsu, batchMode);
    });
}

/**
 * Splits the Attribute decorators between their matching {@link DSUOperation}
 * @param {T} model
 * @param {string} [phase]
 * @return {{creation: DSUCreationDecorator[], editing: DSUEditDecorator[]}} split decorators
 *
 * @function
 * @namespace repository
 */
export function splitDSUDecorators<T extends DSUModel>(model: T, phase: string = OperationKeys.CREATE) : {creation?: DSUCreationDecorator[], editing?: DSUEditDecorator[]} | undefined{
    const propDecorators: {[indexer: string]: any[]} | undefined = getAllPropertyDecorators<T>(model as T, DsuKeys.REFLECT);
    if (!propDecorators)
        return;
    return Object.keys(propDecorators).reduce((accum: {creation?: DSUCreationDecorator[], editing?: DSUEditDecorator[]} | undefined, key) => {
        const decorators: DSUDecorator[] = propDecorators[key].filter(dec => dec.key !== ModelKeys.TYPE && dec.props.phase && dec.props.phase.indexOf(phase) !== -1);
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

        let handler: DSUCreationHandler | undefined = dsuOperationsRegistry.get(decorator.props.dsu, decorator.prop, decorator.props.operation, decorator.props.phase) as DSUCreationHandler;

        if (!handler)
            return criticalCallback(`No handler found for ${decorator.props.dsu} - ${decorator.prop} - ${decorator.props.operation}`, callback);

        const {modelArgs, args} = decorator.props;

        const keyGenArgs: string[] = modelArgs ? getValueFromValueChain(model, ...modelArgs) : [];
        if (args)
            keyGenArgs.push(...args);

        all(`[{0}] - calling DSU Property Creation Handler for model {1}'s {2} property`, self.constructor.name, model, decorator.prop);
        handler.call(self, dsuCache.bindToParent(model, decorator.prop), model[decorator.prop], decorator.props, ...keyGenArgs, (err: Err, newModel?: DSUModel, dsu?: DSU, keySSI?: KeySSI) => {
            if (err || !newModel || !dsu || !keySSI)
                return criticalCallback(err || new Error(`Missing Results`), callback);

            dsuCache.cache(model, decorator.prop, dsu, keySSI)
            all(`[{0}] - DSU Property Creation Handler for model {1}'s {2} property finished`, self.constructor.name, model.constructor.name, decorator.prop);
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
 * given a chain like 'a.b.c', and a model:
 * <pre>
 *     {
 *         a: {
 *             b: {
 *                 c: "value"
 *             }
 *         }
 *     }
 * </pre>
 *
 * this method will return "value"
 *
 * @param {{}} model
 * @param {string[]} chains
 * @throws CriticalError if the value is not found in the object
 */
export function getValueFromValueChain(model: {[indexer: string]: any}, ...chains: string[]): any[]{
    return chains.map(c => {
        const split = c.split('.');

        let result: any = model;

        try {
            split.forEach(s => {
                result = result[s];
            });
        } catch (e) {
            throw new Error(`Could not resolve value chain ${c}`);
        }

        return result;
    });
}

/**
 * Inverse of {@link getValueFromValueChain}.
 * given a {@param chain} like 'a.b.c' and an {@param obj} like {} and a value 'value'
 * will output:
 * <pre>
 *     {
 *         a: {
 *             b: {
 *                 c: 'value'
 *             }
 *         }
 *     }
 * </pre>
 *
 * @param obj
 * @param chain
 * @param value
 */
export function createObjectToValueChain(obj: {[indexer: string]: any}, chain: string, value: any): {} {
    const split = chain.split(".");
    let inner = obj;
    split.forEach((s, i) => {
        if (i === split.length - 1){
            inner[s] = value;
            return;
        }
        inner[s] = inner[s] || {};
        inner = inner[s];
    });

    return obj;
}

/**
 * Handles the {@link DSU} edition operations, as tagged by the attribute decorators
 *
 * @param {DSUCache} dsuCache the current {@link DSUCache}
 * @param {T | {}} model {@link DSUBlueprint} decorated {@link DSUModel} or an object for {@link OperationKeys.READ} operations
 * @param {DSU} dsu teh {@link DSU} object
 * @param {any} decorators
 * @param {string} [phase] defaults to {@link OperationKeys.CREATE}
 * @param {any[]} [args]
 *       The last arg will be considered to be the {@link DSUCallback<T>};
 *
 * @function
 * @namespace repository
 */
export function handleEditingPropertyDecorators<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T | {[indexer: string]: any}, dsu: DSU, decorators: DSUEditDecorator[], phase: string = OperationKeys.CREATE, ...args: (any | DSUCallback<T>)[]){
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

    const decoratorIterator = function(decoratorsCopy: any[], newModel: T | {}, callback: Callback){
        const decorator = decoratorsCopy.shift();
        if (!decorator)
            return callback(undefined, newModel);

        let handler: DSUEditingHandler | undefined = dsuOperationsRegistry.get(newModel.constructor.name, decorator.prop, decorator.props.operation, phase) as DSUEditingHandler;

        if (!handler)
            return criticalCallback(new Error(`No handler found for ${newModel.constructor.name} - ${decorator.prop} - ${decorator.props.operation}`), callback);

        all(`[{0}] - calling DSU Property Editing Handler for model {1}'s {2} property;`, self.constructor.name, model, decorator.prop);
        handler.call(self, dsuCache, newModel, dsu, decorator, (err: Err, newModel?: DSUModel) => {
            if (err || !newModel)
                return criticalCallback(err || new Error(`Missing Results`), callback);
            all(`[{0}] - DSU Property Creation Handler for model {1}'s {2} property finished`, self.constructor.name, model.constructor.name, decorator.prop);
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

export function handleUpdateCreationPropertyDecorator<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, oldModel: T, dsu: DSU, decorators: DSUDecorator[], ...args: (any | DSUMultipleCallback<T>)[]){
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

        let handler: DSUCreationUpdateHandler | undefined = dsuOperationsRegistry.get(decorator.props.dsu, decorator.prop, decorator.props.operation, OperationKeys.UPDATE) as DSUCreationUpdateHandler;

        if (!handler)
            return criticalCallback(`No handler found for ${decorator.props.dsu} - ${decorator.prop} - ${decorator.props.operation} - ${OperationKeys.UPDATE}`, callback);

        handler.call(self, dsuCache, model[decorator.prop], oldModel[decorator.prop], dsu, decorator.props, (err: Err, newModel?: DSUModel, dsu?: DSU, keySSI?: KeySSI) => {
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

export function readFromDecorators<T extends DSUModel>(this: OpenDSURepository<T>, dsu: DSU, ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new CriticalError(`Missing callback`);

    const model = new this.clazz() as T;

    const splitDecorators: {creation?: DSUCreationDecorator[], editing?: DSUEditDecorator[]} | undefined = splitDSUDecorators<T>(model, OperationKeys.READ);
    if (!splitDecorators)
        return callback(undefined, model, dsu);

    const {editing} = splitDecorators;

    const self = this;
    const dsuCache: DSUCache<T> = new DSUCache<T>();

    handleEditingPropertyDecorators.call(self, dsuCache, model, dsu, editing || [], OperationKeys.READ,(err: Err, newModel: {} | T) => {
        if (err || !newModel)
            return callback(err || new CriticalError('Missing results'));

        try {
            // @ts-ignore
            newModel = new self.clazz(newModel) as T;
        } catch (e) {
            return criticalCallback(e as Error, callback);
        }
        callback(undefined, newModel as T, dsu);
    });
}

export function updateFromDecorators<T extends DSUModel>(this: OpenDSURepository<T>, model: T, oldModel: T, dsu: DSU, dsuCache: DSUCache<T>, ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new CriticalError(`Missing callback`);

    const splitDecorators: {creation?: DSUCreationDecorator[], editing?: DSUEditDecorator[]} | undefined = splitDSUDecorators<T>(model, OperationKeys.UPDATE);
    if (!splitDecorators)
        return callback(undefined, model, dsu);

    const self = this;

    dsuCache = dsuCache || new DSUCache<T>();

    handleUpdateCreationPropertyDecorator.call(self, dsuCache, model, oldModel, dsu, splitDecorators.creation || [], (err: Err, results?: DSUCreationResults) => {
        if (err || !results)
            return callback(err || new Error(`Missing Results`));

        Object.keys(results).forEach(k => {
            results[k].forEach(result => {
                dsuCache.cache(model, k, result.dsu, result.keySSI)
            })
        })

        handleDSUClassDecorators.call(self, dsuCache, model, OperationKeys.UPDATE, (err: Err, newModel?: T, dsu?: DSU) => {
            if (err || ! newModel || !dsu)
                return callback(err || new Error(`Missing results`));
            handleEditingPropertyDecorators.call(self, dsuCache, model, dsu, splitDecorators.editing || [], OperationKeys.UPDATE, (err: Err, otherModel: T) => {
                if (err || !otherModel)
                    return batchCallback(err || new Error("Invalid Results"), dsu, callback);
                batchCallback(undefined, dsu, otherModel, dsu, callback);
            });
        });
    });
}

export function handleDSUTypes(keySSIType: KeySSIType, dsu: DSU): DSU {
    switch (keySSIType) {
        case KeySSIType.WALLET:
            const wallet = dsu as WalletDsu;
            return wallet.getWritableDSU() as DSU;
        default:
            return dsu as DSU;
    }
}

export function getAnchoringOptionsByDSUType(type: KeySSIType, ...args: any[]): DSUAnchoringOptions | undefined {
    switch(type){
        case KeySSIType.WALLET:
            const seed: string = args.pop();
            if (!seed)
                throw new CriticalError(`Wallet DSUs need a KeySSi to mount`);
            return {dsuTypeSSI: seed};
        default:
            return undefined;
    }
}