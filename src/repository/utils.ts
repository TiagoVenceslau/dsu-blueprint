import {DSUCallback} from "./repository";
import {DsuKeys, DSUModel, DSUOperation} from "../model";
import {DSU, getAnchoringOptionsByDSUType, getKeySsiSpace, getResolver} from "../opendsu";
import {KeySSI, KeySSIType} from "../opendsu/types";
import {
    Callback, criticalCallback, Err,
    errorCallback,
    getAllPropertyDecorators,
    getClassDecorators,
    LoggedError,
} from "@tvenceslau/db-decorators/lib";
import {ModelKeys} from "@tvenceslau/decorator-validation/lib";
import {DSUCreationHandler, DSUFactoryMethod} from "./types";
import {getDSUOperationsRegistry} from "./registry";



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
export function createFromDecorators<T extends DSUModel>(model: T, fallbackDomain: string, ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const splitDecorators: {creation?: {}[], editing?: {}[]} | undefined = splitDSUDecorators<T>(model);

    if (!splitDecorators)
        return handleDSUClassDecorators(model, fallbackDomain, ...args, (err?: Err, newModel?: T, dsu?: DSU, keySSI?: KeySSI) => {
            if (err || !newModel || !dsu || !keySSI)
                return errorCallback(err || new Error(`Invalid results`), callback);
            callback(undefined, newModel, dsu, keySSI);
        });

    const {creation, editing} = splitDecorators;

    handleCreationPropertyDecorators<T>(model, creation || [], ...args, (err: Err) => {
        if (err)
            return criticalCallback(err, callback);

        handleDSUClassDecorators<T>(model, fallbackDomain, ...args, (err: Err, updatedModel?: T, dsu?: DSU, keySSI?: KeySSI, isBatchMode: boolean = false) => {
            if (err || !updatedModel || !dsu || !keySSI)
                return criticalCallback(err || new Error("Invalid Results"), callback);

            const cb = function(err: Err, ...args: any[]){
                if (err)
                    return isBatchMode ? dsu.cancelBatch(_ => {
                        criticalCallback(err, callback);
                    }) : criticalCallback(err, callback);
                return isBatchMode ? dsu.commitBatch((e?: Err) => {
                    if (e)
                        return dsu.cancelBatch(_ =>{
                            callback(e);
                        });
                    callback(undefined, ...args);
                }) : callback(undefined, ...args);
            }

            handleEditingPropertyDecorators(updatedModel, dsu, editing || [], (err: Err, otherModel: T, otherDSU: DSU, otherKeySSI: KeySSI) => {
                if (err)
                    return criticalCallback(err, callback);
                cb(undefined, otherModel, otherDSU, otherKeySSI);
            });
        });
    });
    //
    // const classDecorators: {key: string, props: any}[] = getClassDecorators(ModelKeys.REFLECT, model);
    //
    // if (!classDecorators.length)
    //     return errorCallback(new Error(`No DSU decorator Found on Model`), callback);
    //
    // let {domain, keySSIType, specificKeyArgs, props} = classDecorators[0].props.dsu;
    //
    // let keySSI: KeySSI, dsuFactory: DSUFactoryMethod;
    //
    // try{
    //     const factory = getKeySSIFactory(keySSIType);
    //
    //     const keyArgs: any[] = [domain || fallbackDomain];
    //     if (!props){
    //         if (args && args.length)
    //             keyArgs.push(args);
    //     } else {
    //         if (args)
    //             props.push(...args);
    //         keyArgs.push(props);
    //     }
    //
    //     if (specificKeyArgs && specificKeyArgs.length)
    //         keyArgs.push(...specificKeyArgs);
    //
    //     keySSI = factory(...keyArgs);
    //     dsuFactory = getDSUFactory(keySSI);
    // } catch (e){
    //     return errorCallback(e, callback);
    // }
    //
    // const options = getAnchoringOptionsByDSUType(keySSI.getTypeName() as KeySSIType);
    //
    // dsuFactory(keySSI, options, (err, dsu) => {
    //     if (err)
    //         return callback(err);
    //     if (!dsu)
    //         return errorCallback(`No DSU received`, callback);
    //
    //     const propDecorators: {[indexer: string]: any[]} | undefined = getAllPropertyDecorators<T>(model as T, DsuKeys.REFLECT);
    //
    //     if (propDecorators)
    //         Object.keys(propDecorators).forEach(key => {
    //             propDecorators[key].forEach((dec) => {
    //                 if (dec.key === ModelKeys.MODEL)
    //                     return;
    //
    //             });
    //         });
    //     dsu.getKeySSIAsObject((err, keySSI) => {
    //         if (err)
    //             return errorCallback(err, callback);
    //         callback(undefined, model, dsu, keySSI);
    //     });
    // });
}

export function handleDSUClassDecorators<T extends DSUModel>(model: T, fallbackDomain: string, ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const classDecorators: {key: string, props: any}[] = getClassDecorators(ModelKeys.REFLECT, model);

    if (!classDecorators.length)
        return errorCallback(new Error(`No DSU decorator Found on Model`), callback);

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
        if (err)
            return callback(err);
        if (!dsu)
            return errorCallback(`No DSU received`, callback);

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
        const decorators: {key: string, operation: string}[] = propDecorators[key];
        if (!decorators || ! decorators.length)
            return accum;

        const addToAccum = function(decorator: {key: string, operation: string}){
            if (!accum)
                accum = {};

            if (decorator.operation === DSUOperation.CREATION){
                accum.creation = accum.creation || [];
                accum.creation.push(decorator);
            } else {
                accum.editing = accum.creation || [];
                accum.editing.push(decorator);
            }
        }

        decorators.forEach(addToAccum);
        return accum;
    }, undefined);
}

export function handleCreationPropertyDecorators<T extends DSUModel>(model: T, decorators: any[], ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const dsuOperationsRegistry = getDSUOperationsRegistry();

    const decoratorIterator = function(decoratorsCopy: any[], callback: Callback){
        const decorator = decoratorsCopy.shift();
        if (!decorator)
            return callback(); // TODO

        const handler: DSUCreationHandler | undefined = dsuOperationsRegistry.get(decorator.props.dsu, decorator.key, decorator.props.operation);

        if (!handler)
            return criticalCallback(`No handler found for ${decorator.props.dsu} - ${decorator.key} - ${decorator.props.operation}`, callback);
        // TODO
        // handler<T>(model, decorator.props, (err: Err, newModel: T) => {
        //     if (err)
        //         return criticalCallback(err, callback);
        //
        // });

    }

    decoratorIterator(decorators.slice(), (err) => {
        if (err)
            return callback(err);

        // TODO
    });
}

export function handleEditingPropertyDecorators<T extends DSUModel>(model: T, dsu: DSU, decorators: any[], ...args: (any | DSUCallback<T>)[]){
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