import {DSUModel} from "../model";
import {
    AsyncRepositoryImp, debug,
    Err,
    errorCallback,
    LoggedError,
    ModelCallback
} from "@tvenceslau/db-decorators/lib";
import {DSU, KeySSI} from "../opendsu/types";
import {createFromDecorators} from "./utils";
import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";

export type DSUKey = string | KeySSI;

export type DSUCallback<T extends DBModel> = (err?: Err, model?: T, dsu?: DSU, keySSI?: KeySSI, ...args: any[]) => void;

export type DSUMultipleCallback<T extends DBModel> = (err?: Err, model?: T[], dsu?: DSU[], keySSI?: KeySSI[], ...args: any[]) => void;

export class OpenDSURepository<T extends DSUModel> extends AsyncRepositoryImp<T>{
    protected fallbackDomain: string;

    constructor(clazz: {new (): T}, domain: string = "default"){
        super(clazz);
        this.fallbackDomain = domain;
    }

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

    }

    read(key?: DSUKey, ...args: any[]): void {

    }

    update(key?: DSUKey, model?: T, ...args: any[]): void {

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
            return errorCallback(e, callback);
        }

        if (!keySSI)
            return errorCallback(`No KeySSI was generated`, callback);

        this.read(keySSI, callback);
    }
}