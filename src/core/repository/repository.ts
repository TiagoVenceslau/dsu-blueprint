import {DSUCreationMetadata, DSUEditMetadata, DSUModel} from "../model";
import {
    AsyncRepositoryImp, criticalCallback, CriticalError, debug,
    Err,
    errorCallback,
    LoggedError,
    ModelCallback
} from "@tvenceslau/db-decorators/lib";
import {DSU} from "../opendsu/types";
import {createFromDecorators, readFromDecorators, safeParseKeySSI, updateFromDecorators} from "./utils";
import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";
import {getResolverApi} from "../opendsu";
import ModelErrorDefinition from "@tvenceslau/decorator-validation/lib/Model/ModelErrorDefinition";
import {getModelRegistry} from "@tvenceslau/decorator-validation/lib";
import {DSUCache, isDSUCache} from "./cache";
import {KeySSI} from "../opendsu/apis/keyssi";


/**
 * @typedef DSUKey
 * @memberOf core.repository
 */
export type DSUKey = string | KeySSI;

/**
 * @typedef T extends DBModel
 * @typedef DSUCallback<T>
 * @memberOf core.repository
 */
export type DSUCallback<T extends DBModel> = (err?: Err, model?: T, dsu?: DSU, ...args: any[]) => void;

/**
 * @typedef ReadCallback
 * @memberOf core.repository
 */
export type ReadCallback = (err?: Err, model?: {[indexer: string]: any}, dsu?: DSU, keySSI?: KeySSI, ...args: any[]) => void;

/**
 * @typedef DSUMultipleCallback
 * @memberOf core.repository
 */
export type DSUMultipleCallback<T extends DBModel> = (err?: Err, model?: T[], dsu?: DSU[], keySSI?: KeySSI[], ...args: any[]) => void;

/**
 * @typedef DSUDecorator Union of {@link DSUCreationDecorator} with {@link DSUEditDecorator}
 * @memberOf core.repository
 */
export type DSUDecorator = DSUCreationDecorator | DSUEditDecorator;

/**
 * @typedef DSUCreationDecorator
 * @memberOf core.repository
 */
export type DSUCreationDecorator = {
    key: string,
    prop: string,
    props: DSUCreationMetadata
}

/**
 * @typedef DSUEditDecorator
 * @memberOf core.repository
 */
export type DSUEditDecorator = {
    key: string,
    prop: string,
    props: DSUEditMetadata
}

/**
 * Provide the Base implementation to a global single OpenDSU Repository implementation
 * capable of, via the decorated properties of {@link DSUModel}s, handle all of the OpenDSU API related to CRUD operations
 * in a single, scalable, maintainable and declarative fashion, supporting:
 *  - Automatic CRUD operations, just by updating its corresponding {@link DSUModel} instance and running it through the appropriate {@link OpenDSURepository};
 *  - Automatic validations && easily extendable for added validations;
 *  - Controlled accesses: Ability easily to add business logic at key points of any CRUD operations
 *
 * @typedef T extends DSUModel
 *
 * @class OpenDSURepository<T>
 * @extends AsyncRepositoryImp<T>
 *
 * @memberOf core.repository
 */
export class OpenDSURepository<T extends DSUModel> extends AsyncRepositoryImp<T>{
    protected fallbackDomain: string;
    protected pathAdaptor: string;

    /**
     * @constructor
     * @param {{new: T}} clazz the class the repository will instantiate
     * @param {string} domain the anchoring domain
     * @param {string} [pathAdaptor] only required for Filesystem operations and is meant to handle the relative path differences when necessary. Must point to the folder where './privatesky' is available
     */
    constructor(clazz: {new(...args: any[]): T}, domain: string = "default", pathAdaptor: string = './'){
        super(clazz);
        this.fallbackDomain = domain;
        this.pathAdaptor = pathAdaptor;
    }

    /**
     * Creates the corresponding {@link DSU} from the provided {@link DSUBlueprint} decorated {@link DSUModel}
     *
     * @param {T} model the {@link DSUModel}
     * @param {DSUCache} [dsuCache] if building during a nested transaction, the dsuCache needs to be passed along
     * @param {any[]} [args]
     *
     * @methodOf OpenDSURepository
     */
    // @ts-ignore
    create(model?: T, dsuCache?: DSUCache<T> | any, ...args: any[]): void {
        if (!isDSUCache(dsuCache)){
            args.unshift(dsuCache);
            dsuCache = undefined;
        }

        const callback: DSUCallback<T> = args.pop();
        if (!callback)
            throw new LoggedError(`Missing callback`);
        if (!model)
            return criticalCallback(new Error(`Missing Model`), callback);

        const errs: ModelErrorDefinition | undefined = model.hasErrors();
        if (errs)
            return callback(new Error(errs.toString()));

        debug(`Creating {0} DSU from model {1}`, this.clazz.name, model.toString())

        const instance = getModelRegistry().build(model);
        createFromDecorators.call(this, instance, dsuCache, ...args, (err: Err, newModel: T | undefined, dsu: DSU | undefined, keySSI: KeySSI | undefined) => {
            if (err || !newModel || !dsu || !keySSI)
                return callback(err || new LoggedError(`Missing Arguments...`));
            debug(`{0} DSU created. Resulting Model: {1}, KeySSI: {2}`, this.clazz.name, newModel.toString(), keySSI.getIdentifier());
            callback(undefined, newModel, dsu, keySSI);
        });
    }

    /**
     * Override to disable the key param on {@link AsyncRepositoryImp#createPrefix} method
     * @see AsyncRepositoryImp#createPrefix
     * @override
     *
     * @methodOf OpenDSURepository
     */
    createPrefix(model?: T, ...args: any[]){
        super.createPrefix(undefined, model, ...args);
    }

    /**
     * Deletes the corresponding {@link DSU} from the provided {@link DSUBlueprint} decorated {@link DSUModel}
     *
     * @param {DSUKey} key
     * @param {any[]} args
     *
     * @methodOf OpenDSURepository
     */
    delete(key?: DSUKey, ...args: any[]): void {
        const callback: DSUCallback<T> = args.pop();
        if (!callback)
            throw new LoggedError(`Missing callback`);

        const self = this;
        if (typeof key === 'string')
            return safeParseKeySSI(key, err => err
                ? errorCallback(err, callback)
                : self.delete.call(self, key, ...args, callback));
    }

    /**
     * Reads the corresponding {@link DSU} from the provided {@link DSUBlueprint} decorated {@link DSUModel}
     *
     * @param {DSUKey} key
     * @param {any[]} args
     *
     * @methodOf OpenDSURepository
     */
    read(key?: DSUKey, ...args: any[]): void {
        const callback: DSUCallback<T> = args.pop();
        if (!callback)
            throw new LoggedError(`Missing callback`);
        if (!key)
            return criticalCallback(`Missing Key`, callback);

        const self = this;
        if (typeof key === 'string')
            return safeParseKeySSI(key, err => err
                ? errorCallback(err, callback)
                : self.read.call(self, key,  ...args, callback));

        debug(`Reading {0} DSU with SSI {1}`, this.clazz.name, key.getIdentifier());

        getResolverApi().loadDSU(key, (err, dsu) => {
            if (err || !dsu)
                return criticalCallback(err || new Error(`Missing DSU`), callback);
            readFromDecorators.call(self, dsu, (err: Err, model?: T, dsu?: DSU) => {
                if (err || !model || !dsu)
                    return callback(err || new CriticalError(`Missing results`));
                callback(undefined, model, dsu, key);
            });
        });
    }

    /**
     * Updates the corresponding {@link DSU} from the provided {@link DSUBlueprint} decorated {@link DSUModel}
     *
     * @param {DSUKey} key
     * @param {T} model the {@link DSUModel}
     * @param {DSUCache} [dsuCache] if building during a nested transaction, the dsuCache needs to be passed along
     * @param {any[]} [args]
     *
     * @methodOf OpenDSURepository
     */
    update(key?: DSUKey, model?: T, dsuCache?: DSUCache<T> | any, ...args: any[]): void {
        if (!isDSUCache(dsuCache)){
            args.unshift(dsuCache);
            dsuCache = undefined;
        }

        const callback: DSUCallback<T> = args.pop();
        if (!callback)
            throw new LoggedError(`Missing callback`);
        if (!model)
            return errorCallback(new Error(`Missing Model`), callback);

        const self = this;

        if (typeof key === 'string')
            return safeParseKeySSI(key, err => err
                ? errorCallback(err, callback)
                : self.update.call(self, key, model, dsuCache, ...args, callback));

        self.read(key, ...args, (err: Err, oldModel: T, dsu: DSU, keySSI: KeySSI) => {
            if (err)
                return criticalCallback(err, callback);

            const errors: ModelErrorDefinition | undefined = model.hasErrors(oldModel);
            if (errors)
                return callback(new Error(errors.toString()));

            debug(`Updating {0} DSU from model {1} to {2}`, this.clazz.name, oldModel.toString(), model.toString())
            const instance = getModelRegistry().build(model);
            updateFromDecorators.call(self, instance, oldModel, dsu, dsuCache, (err?: Err, updatedModel?: T, updatedDsu?: DSU) => {
                if (err || !updatedModel || !updatedDsu)
                    return callback(err || new CriticalError(`Missing Results`));
                debug(`{0} DSU updated. Resulting Model: {1}, KeySSI: {2}`, this.clazz.name, updatedModel.toString(), keySSI.getIdentifier());
                callback(undefined, updatedModel, updatedDsu, key);
            });
        });
    }
}