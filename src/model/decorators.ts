import {model, ModelKeys} from "@tvenceslau/decorator-validation/lib";
import {DSU, DSUAnchoringOptions, DSUIOOptions, KeySSI, KeySSIType} from "../opendsu/types";
import {DsuKeys, DSUOperation} from "./constants";
import {DSUModel} from "./DSUModel";
import {getDSUOperationsRegistry, getRepoRegistry} from "../repository/registry";
import {
    DSUCache,
    DSUCallback,
    DSUCreationHandler,
    DSUEditingHandler, fromCache,
    OpenDSURepository
} from "../repository";
import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";
import {criticalCallback, CriticalError, Err, ModelCallback} from "@tvenceslau/db-decorators/lib";

const getDSUModelKey = (key: string) => DsuKeys.REFLECT + key;

/**
 * Defines a class as a DSU class for serialization purposes
 *
 * @prop {string | undefined} [domain] the DSU domain. default to undefined. when undefined, its the repository that controls the domain;
 * @prop {KeySSIType} [keySSIType] the KeySSI type used to anchor the DSU
 * @prop {string[] | undefined} [specificKeyArgs]  OpenDSU related arguments, specific to each KeySSI implementation. {@link getKeySSIFactory}
 * @prop {DSUAnchoringOptions | undefined} [options] defaults to undefined. decides if batchMode is meant to be used for this DSU
 * @prop {boolean} [batchMode] defaults to true. decides if batchMode is meant to be used for this DSU
 * @prop {string[]} [props] any object properties that must be passed to the KeySSI generation function (eg: for Array SSIs)
 * @decorator DSUBlueprint
 * @namespace decorators
 * @memberOf model
 */
export const DSUBlueprint = (domain: string | undefined = undefined, keySSIType: KeySSIType = KeySSIType.SEED, specificKeyArgs: string[] | undefined = undefined, options: DSUAnchoringOptions | undefined = undefined, batchMode: boolean = true, ...props: string[]) => (original: Function) => {
    getRepoRegistry().register(original.name);
    return model(ModelKeys.MODEL, {
        dsu: {
            domain: domain,
            keySSIType: keySSIType,
            batchMode: batchMode,
            specificKeyArgs: specificKeyArgs,
            props: props && props.length ? props : undefined
        }
    })(original);
}

export type DSUCreationMetadata = {
    [indexer: string]: any;

    dsu: string
    derive: boolean | number,
    dsuPath: string
    ,
}

/**
 *
 * @typedef T extends DSUModel
 * @param {{new: T}} dsu
 * @param {boolean | number} [derive] decides if the resulting mount uses the Seed or the Read (or how many times it derives the key)
 * @param {string} [mountPath] defines the mount path, overriding the property name;
 * @param {any[]} [args] optional KeySSI generation params
 *
 * @decorator dsu
 * @namespace decorators
 * @memberOf model
 */
export function dsu<T extends DSUModel>(dsu: {new(): T}, derive: boolean | number = false, mountPath?: string, ...args: any[]) {
    getRepoRegistry().register<OpenDSURepository<T>>(dsu);
    return (target: T, propertyKey: string) => {
        const dsuPath = mountPath ? mountPath : propertyKey;

        const metadata: DSUCreationMetadata = {
            operation: DSUOperation.CREATION,
            dsu: target.constructor.name,
            derive: derive,
            dsuPath: dsuPath
        }

        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.DSU),
            metadata,
            target,
            propertyKey
        );

        fromCache<T>(dsu, derive, dsuPath)(target, propertyKey);

        const handler: DSUCreationHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUCreationMetadata, callback: ModelCallback<T>): void {
            const {dsu} = decorator;

            const repo = getRepoRegistry().get<OpenDSURepository<T>>(dsu)
            if (!repo)
                    throw new CriticalError(`Cannot find ${model.constructor.name} repository`);
            repo.create(model, (err: Err, newModel: T, dsu: DSU, keySSI: KeySSI) => {
                if (err)
                    return callback(err);

                // dsuCache.cache(newModel, propertyKey, dsu, keySSI);
                callback(undefined, newModel, dsu, keySSI);
            });
        }

        getDSUOperationsRegistry().register(handler, DSUOperation.CREATION, target, propertyKey);
    }
}

export type DSUEditMetadata = {
    [indexer: string]: any;

    operation: string
    key?: string,
    grouped?: boolean,
    grouping?: string
    dsuPath: string
    ,
}

/**
 *
 * @param {string} [dsuFilePath] defines the mount path. defaults to {@link DsuKeys#DEFAULT_DSU_PATH}
 *
 * @decorator dsu
 * @namespace decorators
 * @memberOf model
 */
export function dsuFile(dsuPath: string = DsuKeys.DEFAULT_DSU_PATH) {
    return (target: any, propertyKey: string) => {
        const metadata: DSUEditMetadata = {
            operation: DSUOperation.EDITING,
            key: DsuKeys.DSU_FILE,
            grouped: true,
            grouping: dsuPath,
            dsuPath: dsuPath
        };

        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.DSU_FILE),
            metadata,
            target,
            propertyKey
        );

        const handler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: any, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T>): void {
            const {dsuPath} = decorator;
            dsu.writeFile(dsuPath, JSON.stringify(obj), (err: Err) => {
                if (err)
                    return criticalCallback(err, callback);
                callback(undefined, obj, dsu);
            })
        }

        getDSUOperationsRegistry().register(handler, DSUOperation.EDITING, target, propertyKey);
    }
}

/**
 *
 * @param {string} keySSI the KeySSI to mount
 * @param {string} [mountPath] defines the mount path. defaults to the property key
 * @param {DSUIOOptions} [options]
 * @param {any[]} [args] optional params. meant for extending decorators
 *
 * @decorator dsu
 * @namespace decorators
 * @memberOf model
 */
export function mount(keySSI: string, mountPath?: string, options?: DSUIOOptions, ...args: any[]) {
    return (target: any, propertyKey: string) => {
        mountPath = mountPath ? mountPath : target[propertyKey];

        if (!mountPath)
            throw new CriticalError(`Missing mount path`);

        const metadata: DSUEditMetadata = {
            operation: DSUOperation.EDITING,
            dsuPath: mountPath,
            options: options,
            args: args
        };

        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.MOUNT),
            metadata,
            target,
            propertyKey
        );

        const handler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: T, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T>): void {
            const {keySSI, dsuPath, options} = decorator;
            dsu.mount(dsuPath, keySSI, options, err => {
                if (err)
                    return criticalCallback(err, callback);
                callback(undefined, obj, dsu);
            })
        }

        getDSUOperationsRegistry().register(handler, DSUOperation.EDITING, target, propertyKey);
    }
}