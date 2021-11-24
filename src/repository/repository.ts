import {DSUModel} from "../model";
import {
    AsyncRepositoryImp,
    Err,
    errorCallback,
    info,
    LoggedError, LOGGER_LEVELS,
    ModelCallback
} from "@tvenceslau/db-decorators/lib";
import {DSU, KeySSI} from "../opendsu/types";
import {createFromDecorators} from "./utils";

export type DSUKey = string | KeySSI;

export type DSUCallback<T extends DSUModel> = (err?: Err, model?: T, dsu?: DSU, keySSI?: KeySSI, ...args: any[]) => void;

export abstract class OpenDSURepository<T extends DSUModel> extends AsyncRepositoryImp<T>{

    constructor(clazz: {new (): T}){
        super(clazz);
    }

    create(model?: T, ...args: any[]): void {
        const callback: DSUCallback<T> = args.pop();
        if (!callback)
            throw new LoggedError(`Missing callback`, LOGGER_LEVELS.ERROR);
        if (!model)
            return errorCallback(`Missing Model`, callback);

        const errs = model.hasErrors();
        if (errs)
            return callback(errs.toString());

        info(`Creating {0} DSU from model {1}`, this.clazz, model.toString())

        createFromDecorators<T>(model, (err: Err, newModel, dsu, keySSI) => {
            if (err)
                return callback(err);
            if (!newModel || !dsu || !keySSI)
                return errorCallback(`Missing Arguments...`, callback);
            info(`{0} DSU created. Resulting Model: {1}, KeySSI: {2}`, this.clazz, newModel.toString(), keySSI?.getIdentifier());
            callback(undefined, newModel, dsu, keySSI);
        });
    }

    _create(model?: T, ...args: any[]){
        super._create(undefined, model, ...args);
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