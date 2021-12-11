import {model} from "@tvenceslau/decorator-validation/lib";
import {DSU, DSUAnchoringOptions, DSUIOOptions} from "../opendsu/types";
import {DsuKeys, DSUOperation} from "./constants";
import {DSUModel} from "./DSUModel";
import {getDSUOperationsRegistry, getRepoRegistry} from "../repository/registry";
import {
    DSUCache,
    DSUCallback,
    DSUClassCreationHandler,
    DSUCreationHandler,
    DSUCreationUpdateHandler,
    DSUEditingHandler,
    fromCache,
    OpenDSURepository,
    ReadCallback
} from "../repository";
import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";
import {
    criticalCallback,
    CriticalError,
    DBOperations,
    Err,
    ModelCallback,
    OperationKeys
} from "@tvenceslau/db-decorators/lib";
import {KeySSI, KeySSISpecificArgs, KeySSIType} from "../opendsu/apis/keyssi";
import {ConstantsApi} from "../opendsu";
import {
    DSUPostProcess,
    getDSUFactoryRegistry,
    getKeySSIFactoryRegistry,
    KeySSIFactoryResponse
} from "../opendsu/factory";

/**
 * Builds the final DSU Reflection Key
 *
 * @function
 *
 * @param {string} key
 *
 * @return {string} the full key
 *
 * @memberOf core.model
 */
export const getDSUModelKey = (key: string) => DsuKeys.REFLECT + key;

/**
 * Metadata passed to {@link DSUClassCreationHandler}s
 *
 * @typedef DSUClassCreationMetadata
 * @memberOf core.model
 */
export type DSUClassCreationMetadata = {
    [indexer: string]: any;
    dsu: {
        operation: string,
        phase: string[],
        domain: string | undefined,
        keySSIType: KeySSIType,
        batchMode: boolean,
        specificKeyArgs: KeySSISpecificArgs | undefined,
        props: string[] | undefined
    }
    ,
}

/**
 * DSU Blueprint Decorator
 *
 * Defines a class as a DSU Blueprint, enabling:
 *  - Automatic CRUD operations, just by updating its corresponding {@link DSUModel} instance and running it through the appropriate {@link OpenDSURepository};
 *  - Automatic validations && easily extendable for added validations;
 *  - Automatic serialization -> transmission -> deserialization;
 *  - Controlled accesses: Ability easily to add business logic at key points of any CRUD operations
 *
 *  TODO:
 *  Because everything is declarative, the hash of the {@link DSUModel} class file string literal + the hash of the dsu-blueprint bundle file
 *  can be used stored as DSU metadata and serve as proof of authenticity in theory. I guess if we store this lib.
 *
 * Supported {@link KeySSIType}s:
 *  - {@link KeySSIType.SEED}: Expects:
 *      - keySsiType: {@link KeySSIType.SEED};
 *      - specificKeyArgs: {@link SeedSSISpecificArgs} | undefined;
 *      - props: none
 *  - {@link KeySSIType.ARRAY}: Expects:
 *      - keySsiType: {@link KeySSIType.ARRAY};
 *      - specificKeyArgs: {@link ArraySSISpecificArgs} | undefined;
 *      - props: {string[] | undefined} array of property names in the value chain notation {@link getValueFromValueChain} {@link createObjectToValueChain} that will be resolved from the {@link DSUModel}'s content and used to pass as {@link KeySSI} generation Arguments. <strong>Must resolve to strings</strong>
 *      - extra Key generation args {string[] | undefined} that are passed to the {@link OpenDSURepository}'s methods will be appended to the ones from the props and also used to generate the {@link KeySSI}
 *  - {@link KeySSIType.WALLET}: Expects:
 *      - keySsiType: {@link KeySSIType.WALLET};
 *      - specificKeyArgs: {@link WalletSSISpecificArgs} | undefined;
 *      - props: {string[] | undefined}: array of property names in the value chain notation {@link getValueFromValueChain} {@link createObjectToValueChain} that will be resolved from the {@link DSUModel}'s content and used to pass as {@link KeySSI} generation Arguments. <strong>Must resolve to strings</strong>
 *      - extra Key generation args {string[] | undefined} that are passed to the {@link OpenDSURepository}'s methods will be appended to the ones from the props and also used to generate the {@link KeySSI}
 *      - One Supported decorator under the {@link ConstantsApi#CODE_FOLDER} property key (defaults to 'code'). Supported decorators are:
 *          - {@link fromWeb};
 *          - {@link fromCache};
 *          - {@link mount}
 *
 * {@link OpenDSURepository} {@link OperationKeys}'s this decorator acts on:
 *  - {@link OperationKeys.CREATE}: Creates the {@link DSUBlueprint}:
 *      - Gets the keySSI and the {@link DSUFactoryMethod}'s {@link DSUAnchoringOptions} from the {@link KeySSIFactoryRegistry};
 *      - Creates the {@link DSU} via the {@link DSUFactoryRegistry#build}
 *  - {@link OperationKeys.READ}:
 *  - {@link OperationKeys.UPDATE}:
 *  - {@link OperationKeys.DELETE}:
 *
 *  {@link DSUOperation} phases this decorator acts on:
 *  - {@link DSUOperation.CLASS}:
 *
 * @prop {string | undefined} [domain] the DSU domain. default to undefined. when undefined, its the repository that controls the domain;
 * @prop {KeySSIType} [keySSIType] the KeySSI type used to anchor the DSU
 * @prop {KeySSISpecificArgs | undefined} [specificKeyArgs]  OpenDSU related arguments, specific to each KeySSI implementation.
 * @prop {DSUAnchoringOptions | undefined} [options] defaults to undefined.
 * @prop {boolean} [batchMode] defaults to true. decides if batchMode is meant to be used for this DSU
 * @prop {string[]} [props] any object properties that must be passed to the KeySSI generation function (eg: for Array SSIs)
 *
 * @function
 *
 * @category Decorators
 * @memberOf core.model
 */
export const DSUBlueprint = (domain: string | undefined = undefined, keySSIType: KeySSIType = KeySSIType.SEED, specificKeyArgs: KeySSISpecificArgs | undefined = undefined, options: DSUAnchoringOptions | undefined = undefined, batchMode: boolean = true, ...props: string[]) => (original: Function) => {
    getRepoRegistry().register(original.name);

    const createHandler: DSUClassCreationHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUClassCreationMetadata, ...keyGenArgs:  (string | DSUCallback<T>)[]){
        const callback: DSUCallback<T> = keyGenArgs.pop() as DSUCallback<T>;
        if (!callback)
            throw new CriticalError(`Missing Callback`);

        const {domain, keySSIType, specificKeyArgs, props, batchMode} = decorator.dsu;

        const keyArgs = [...(props || []), ...keyGenArgs] as string[];

        getKeySSIFactoryRegistry().build(this, model, keySSIType, domain || this.fallbackDomain, specificKeyArgs, keyArgs, (err: Err, response?: KeySSIFactoryResponse) => {
            if (err || !response)
                return criticalCallback(err || new Error(`Missing KeySSI factory response`), callback);
            const {keySSI, options} = response;

            getDSUFactoryRegistry().build(keySSI, options || {}, (err, dsu) => {
                if (err || !dsu)
                    return criticalCallback(err || new Error(`No DSU received`), callback);

                const postProcess: DSUPostProcess | undefined = getDSUFactoryRegistry().get(keySSIType, true) as DSUPostProcess;
                if (!postProcess)
                    return callback(undefined, model, dsu, batchMode);

                postProcess(dsu, (err, dsu) => {
                    if (err || !dsu)
                        return criticalCallback(err || new Error(`Missing PostProcessed DSU`), callback);
                    callback(undefined, model, dsu, batchMode);
                });
            });
        });
    }

    const updateHandler: DSUCreationUpdateHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, oldModel: T, dsuObj: DSU, decorator: any, callback: DSUCallback<T>): void {
        const {batchMode} = decorator.dsu;

        if (batchMode)
            dsuObj.beginBatch();

        callback(undefined, model, dsuObj);

    }

    const metadata: DSUClassCreationMetadata = {
        dsu: {
            domain: domain,
            keySSIType: keySSIType,
            batchMode: batchMode,
            specificKeyArgs: specificKeyArgs,
            props: props && props.length ? props : undefined,
            operation: DSUOperation.CLASS,
            phase: [OperationKeys.CREATE],
        }
    }

    return model({}, (instance) => {
        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.CONSTRUCTOR),
            metadata,
            instance.constructor
        );
        getDSUOperationsRegistry().register(createHandler, DSUOperation.CLASS, OperationKeys.CREATE, instance, DsuKeys.CONSTRUCTOR);
        getDSUOperationsRegistry().register(updateHandler, DSUOperation.CLASS, OperationKeys.UPDATE, instance, DsuKeys.CONSTRUCTOR);
    })(original);
}

/**
 * Metadata passed to {@link DSUCreationHandler}s
 *
 * @typedef DSUCreationMetadata
 * @memberOf core.model
 */
export type DSUCreationMetadata = {
    [indexer: string]: any;

    operation: string,
    phase: string[],
    dsu: string
    derive: boolean | number,
    options: DSUIOOptions | undefined,
    dsuPath: string
    ,
}

/**
 *
 *
 * @typedef T extends DSUModel
 *
 * @param {{new: T}} dsu
 * @param {boolean | number} [derive] decides if the resulting mount uses the Seed or the Read (or how many times it derives the key)
 * @param {string} [mountPath] defines the mount path, overriding the property name;
 * @param {DSUIOOptions} [mountOptions] defines the mount path, overriding the property name;
 * @param {string[]} [modelArgs] optional model KeySSI generation params
 * @param {any[]} [args] optional KeySSI generation params
 *
 * @function
 *
 * @category Decorators
 * @memberOf core.model
 */
export function dsu<T extends DSUModel>(dsu: {new(): T}, derive: boolean | number = false, mountPath?: string, mountOptions?: DSUIOOptions, modelArgs?: string[], ...args: any[]) {
    getRepoRegistry().register<OpenDSURepository<T>>(dsu);
    return (target: T, propertyKey: string) => {
        const dsuPath = mountPath ? mountPath : propertyKey;

        const metadata: DSUCreationMetadata = {
            operation: DSUOperation.CREATION,
            phase: DBOperations.CREATE,
            dsu: target.constructor.name,
            derive: derive,
            dsuPath: dsuPath,
            options: mountOptions,
            modelArgs: modelArgs,
            args: args
        };

        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.DSU),
            metadata,
            target,
            propertyKey
        );

        fromCache<T>(dsu, derive, dsuPath, mountOptions)(target, propertyKey);

        const createHandler: DSUCreationHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUCreationMetadata, ...keyGenArgs: (string | ModelCallback<T>)[]): void {
            const callback: ModelCallback<T> = keyGenArgs.pop() as ModelCallback<T>;
            if (!callback)
                throw new CriticalError("Missing Callback");
            const {dsu} = decorator;

            const repo = getRepoRegistry().get<OpenDSURepository<T>>(dsu)
            if (!repo)
                return criticalCallback(new Error(`Cannot find ${model.constructor.name} repository`), callback);

            repo.create(model, dsuCache, ...keyGenArgs, (err: Err, newModel: T, dsu: DSU, keySSI: KeySSI) => {
                if (err)
                    return callback(err);
                callback(undefined, newModel, dsu, keySSI);
            });
        }

        getDSUOperationsRegistry().register(createHandler, DSUOperation.CREATION, OperationKeys.CREATE, target, propertyKey);

        const updateHandler: DSUCreationUpdateHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, oldModel: T, dsuObj: DSU, decorator: any, callback: DSUCallback<T>): void {
            const {dsu, dsuPath} = decorator;

            const repo = getRepoRegistry().get<OpenDSURepository<T>>(dsu)
            if (!repo)
                return criticalCallback(new Error(`Cannot find ${model.constructor.name} repository`), callback);

            dsuObj.getSSIForMount(dsuPath, (err, keySSI) => {
                if (err || !keySSI)
                    return criticalCallback(err || new Error(`No KeySSI for specified mount`), callback);

                repo.update(keySSI, model, dsuCache, (err: Err, newModel: T, dsu: DSU, keySSI: KeySSI) => {
                    if (err)
                        return callback(err);
                    callback(undefined, newModel, dsu, keySSI);
                });
            });
        }

        getDSUOperationsRegistry().register(updateHandler, DSUOperation.CREATION, OperationKeys.UPDATE, target, propertyKey);

        const readHandler: DSUEditingHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T | {}, dsuObj: DSU, decorator: any, callback: DSUCallback<T> | ReadCallback): void {
            const {dsu, dsuPath, prop} = decorator;

            const repo = getRepoRegistry().get<OpenDSURepository<T>>(dsu)
            if (!repo)
                return criticalCallback(new Error(`Cannot find ${model.constructor.name} repository`), callback);

            dsuObj.getSSIForMount(dsuPath, (err, keySSI) => {
                if (err || !keySSI)
                    return criticalCallback(err || new Error(`No KeySSI for specified mount`), callback);

                repo.read(keySSI, (err: Err, newModel: T, dsu: DSU, keySSI: KeySSI) => {
                    if (err)
                        return callback(err);
                    // @ts-ignore
                    model[prop] = newModel;
                    callback(undefined, model as T, dsu, keySSI);
                });
            });
        }

        getDSUOperationsRegistry().register(readHandler, DSUOperation.EDITING, OperationKeys.READ, target, propertyKey);

        const deleteHandler: DSUCreationUpdateHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, oldModel: T, dsuObj: DSU, decorator: any, callback: DSUCallback<T>): void {
            const {dsu, dsuPath} = decorator;

            const repo = getRepoRegistry().get<OpenDSURepository<T>>(dsu)
            if (!repo)
                return criticalCallback(new Error(`Cannot find ${model.constructor.name} repository`), callback);

            dsuObj.getSSIForMount(dsuPath, (err, keySSI) => {
                if (err || !keySSI)
                    return criticalCallback(err || new Error(`No KeySSI for specified mount`), callback);

                repo.delete(keySSI, (err: Err, newModel: T, dsu: DSU, keySSI: KeySSI) => {
                    if (err)
                        return callback(err);

                    dsuObj.unmount(dsuPath, (err) => {
                        if (err)
                            return callback(err);
                        callback(undefined, newModel, dsu, keySSI);
                    });
                });
            });
        }

        getDSUOperationsRegistry().register(deleteHandler, DSUOperation.CREATION, OperationKeys.DELETE, target, propertyKey);
    }
}

export type DSUEditMetadata = {
    [indexer: string]: any;

    operation: string
    phase: string[],
    key?: string,
    grouped?: boolean,
    grouping?: string
    dsuPath: string
    ,
}

/**
 *
 * @param {string} [dsuPath] defines the mount path. defaults to {@link DsuKeys#DEFAULT_DSU_PATH}
 *
 * @decorator dsuFile
 * @namespace decorators
 * @memberOf model
 */
export function dsuFile(dsuPath: string = DsuKeys.DEFAULT_DSU_PATH) {
    return (target: any, propertyKey: string) => {
        const metadata: DSUEditMetadata = {
            operation: DSUOperation.EDITING,
            phase: DBOperations.ALL,
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

        const editingHandler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: any, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T>): void {
            const {value, props} = decorator;
            const {dsuPath} = props;
            dsu.writeFile(dsuPath, JSON.stringify(value), (err: Err) => {
                if (err)
                    return criticalCallback(err, callback);
                callback(undefined, obj, dsu);
            });
        }

        const readHandler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: {}, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T>): void {
            const {props} = decorator;
            const {dsuPath} = props;
            dsu.readFile(dsuPath, (err: Err, data: any) => {
                if (err || !data)
                    return criticalCallback(err || new Error("Missing Data"), callback);
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    return criticalCallback(e as Error, callback);
                }

                callback(undefined, Object.assign(obj, data), dsu);
            });
        }

        const deleteHandler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: T | {}, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T> | ReadCallback): void {
            const {props} = decorator;
            const {dsuPath} = props;
            dsu.delete(dsuPath, (err) => {
                if (err)
                    return criticalCallback(err, callback);
                callback(undefined, obj as T, dsu);
            });
        }

        getDSUOperationsRegistry().register(readHandler, DSUOperation.EDITING, OperationKeys.READ, target, propertyKey)
        getDSUOperationsRegistry().register(deleteHandler, DSUOperation.EDITING, OperationKeys.DELETE, target, propertyKey)
        DBOperations.CREATE_UPDATE.forEach(p => getDSUOperationsRegistry().register(editingHandler, DSUOperation.EDITING, p, target, propertyKey));
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
            phase: [OperationKeys.READ, OperationKeys.CREATE],
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

        const createHandler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: T | {}, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T> | ReadCallback): void {
            const {keySSI, dsuPath, options} = decorator;
            dsu.mount(dsuPath, keySSI, options, err => {
                if (err)
                    return criticalCallback(err, callback);
                callback(undefined, obj as T, dsu);
            });
        }

        const readHandler: DSUEditingHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T | {}, parentDsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T> | ReadCallback){
            const {dsuPath} = decorator.props;
            parentDsu.getSSIForMount(dsuPath, (err, keySSI) => {
                if (err || !keySSI)
                    return criticalCallback(err || new Error('Missing KeySSI'), callback);
                // @ts-ignore
                model[decorator.prop] = keySSI;
                callback(undefined, model as T, parentDsu);
            });
        }

        getDSUOperationsRegistry().register(createHandler, DSUOperation.EDITING, OperationKeys.CREATE, target, propertyKey);
        getDSUOperationsRegistry().register(readHandler, DSUOperation.EDITING, OperationKeys.READ, target, propertyKey);
    }
}