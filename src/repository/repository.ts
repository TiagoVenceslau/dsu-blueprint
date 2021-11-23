import {DSUModel} from "../model";
import {AsyncRepositoryImp, errorCallback, LoggedError, ModelCallback} from "@tvenceslau/db-decorators/lib";
import {KeySSI} from "../opendsu/types";

export type DSUKey = string | KeySSI;

export abstract class OpenDSURepository<T extends DSUModel> extends AsyncRepositoryImp<T>{

    create(key?: DSUKey, model?: T, ...args: any[]): void {

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