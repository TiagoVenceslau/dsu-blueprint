import {DSUCreationMetadata, DSUEditMetadata, DSUModel} from "../model";
import {
    AsyncRepositoryImp, criticalCallback, CriticalError, debug,
    Err,
    errorCallback,
    LoggedError,
    ModelCallback
} from "@tvenceslau/db-decorators/lib";
import {DSU, KeySSI} from "../opendsu/types";
import {createFromDecorators, readFromDecorators, safeParseKeySSI, updateFromDecorators} from "./utils";
import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";
import {repository} from "@tvenceslau/db-decorators/lib/repository/decorators";
import {getResolver} from "../opendsu";

export type DSUKey = string | KeySSI;

export type DSUCallback<T extends DBModel> = (err?: Err, model?: T, dsu?: DSU, keySSI?: KeySSI, ...args: any[]) => void;

export type ReadCallback = (err?: Err, model?: {[indexer: string]: any}, dsu?: DSU, keySSI?: KeySSI, ...args: any[]) => void;

export type DSUMultipleCallback<T extends DBModel> = (err?: Err, model?: T[], dsu?: DSU[], keySSI?: KeySSI[], ...args: any[]) => void;

export type DSUDecorator = DSUCreationDecorator | DSUEditDecorator;

export type DSUCreationDecorator = {
    key: string,
    prop: string,
    props: DSUCreationMetadata
}

export type DSUEditDecorator = {
    key: string,
    prop: string,
    props: DSUEditMetadata
}

/**
 * Provide the Base implementation to a global single OpenDSU Repository implementation
 * capable of, via the decorated properties of {@link DSUModel}s, handle all of the OpenDSU API related to CRUD operations
 * in a single, scalable, maintainable and declarative fashion
 **
 * @typedef T extends DSUModel
 * @class OpenDSURepository<T>
 * @extends AsyncRepositoryImp<T>
 * @namespace repository
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
    constructor(clazz: {new (): T}, domain: string = "default", pathAdaptor: string = './'){
        super(clazz);
        this.fallbackDomain = domain;
        this.pathAdaptor = pathAdaptor;
    }

    /**
     * Creates the corresponding {@link DSU} from the provided {@link DSUModel}
     * @param {T} model the {@link DSUModel}
     * @param {any[]} [args]
     */
    create(model?: T, ...args: any[]): void {
        const callback: DSUCallback<T> = args.pop();
        if (!callback)
            throw new LoggedError(`Missing callback`);
        if (!model)
            return errorCallback(new Error(`Missing Model`), callback);

        const errs = model.hasErrors();
        if (errs)
            return callback(errs.toString());

        debug(`Creating {0} DSU from model {1}`, this.clazz.name, model.toString())

        createFromDecorators.call(this, model, this.fallbackDomain, ...args, (err: Err, newModel: T | undefined, dsu: DSU | undefined, keySSI: KeySSI | undefined) => {
            if (err || !newModel || !dsu || !keySSI)
                return callback(err || new LoggedError(`Missing Arguments...`));
            debug(`{0} DSU created. Resulting Model: {1}, KeySSI: {2}`, this.clazz.name, newModel.toString(), keySSI.getIdentifier());
            callback(undefined, newModel, dsu, keySSI);
        });
    }

    createPrefix(model?: T, ...args: any[]){
        super.createPrefix(undefined, model, ...args);
    }

    delete(key?: DSUKey, ...args: any[]): void {
        const callback: DSUCallback<T> = args.pop();
        if (!callback)
            throw new LoggedError(`Missing callback`);

        const self = this;
        if (typeof key === 'string')
            return safeParseKeySSI(key, err => err
                ? errorCallback(err, callback)
                : self.delete(key, ...args, callback));
    }

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
                : self.read(key,  ...args, callback));

        debug(`Reading {0} DSU with SSI {1}`, this.clazz.name, key.getIdentifier());

        getResolver().loadDSU(key, (err, dsu) => {
            if (err || !dsu)
                return criticalCallback(err || new Error(`Missing DSU`), callback);
            readFromDecorators.call(self, dsu, (err: Err, model?: T, dsu?: DSU) => {
                if (err || !model || !dsu)
                    return callback(err || new CriticalError(`Missing results`));
                callback(undefined, model, dsu, key);
            });
        });
    }

    update(key?: DSUKey, model?: T, ...args: any[]): void {
        const callback: DSUCallback<T> = args.pop();
        if (!callback)
            throw new LoggedError(`Missing callback`);
        if (!model)
            return errorCallback(new Error(`Missing Model`), callback);

        const self = this;

        if (typeof key === 'string')
            return safeParseKeySSI(key, err => err
                ? errorCallback(err, callback)
                : self.update(key, model, ...args, callback));

        self.read(key, ...args, (err: Err, oldModel: T, dsu: DSU, keySSI: KeySSI) => {
            if (err)
                return criticalCallback(err, callback);

            debug(`Updating {0} DSU from model {1} to {2}`, this.clazz.name, oldModel.toString(), model.toString())

            updateFromDecorators.call(self, model, oldModel, dsu, (err?: Err, updatedModel?: T, updatedDsu?: DSU, updatedKeySSI?: KeySSI) => {
                if (err || !updatedModel || !updatedDsu || !updatedKeySSI)
                    return callback(err || new CriticalError(`Missing Results`));
                debug(`{0} DSU updated. Resulting Model: {1}, KeySSI: {2}`, this.clazz.name, updatedModel.toString(), keySSI.getIdentifier());
                callback(undefined, updatedModel, updatedDsu, updatedKeySSI);
            });
        });
    }
}

export abstract class OpenDSURepositoryDeterministic<T extends DSUModel> extends OpenDSURepository<T>{

    abstract generateKey(model: T, ...args: any[]): KeySSI;

    readDeterministic(model: T, ...args: any[]){
        const callback: ModelCallback<T> = args.pop();
        if (typeof callback !== 'function')
            throw new LoggedError(`Missing callback function`);
        let keySSI: KeySSI;
        try {
            keySSI = this.generateKey(model, ...args);
        } catch (e){
            return errorCallback(e as Error, callback);
        }

        if (!keySSI)
            return errorCallback(`No KeySSI was generated`, callback);

        this.read(keySSI, callback);
    }
}