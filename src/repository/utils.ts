import {DSUCallback} from "./repository";
import {DsuKeys, DSUModel} from "../model";
import {getOpenDSU} from "../opendsu";
import {Keyssi, Resolver} from "../opendsu/types";
import {getAllPropertyDecorators, getClassDecorators, LoggedError, LOGGER_LEVELS} from "@tvenceslau/db-decorators/lib";
import {ModelKeys} from "@tvenceslau/decorator-validation/lib";

let resolver: Resolver;

export function getResolver(){
    if (!resolver)
        try {
            resolver = getOpenDSU().loadApi('resolver') as Resolver;
        } catch (e){
            throw new LoggedError(`Could not load DSU Resolver: ${e.message | e}`, LOGGER_LEVELS.CRITICAL);
        }

    return resolver;
}

let keyssi: Keyssi;

export function getKeySsiSpace(){
    if (!keyssi)
        try {
            keyssi = getOpenDSU().loadApi('keyssi') as Keyssi;
        } catch (e){
            throw new LoggedError(`Could not load DSU KeySSI Space: ${e.message | e}`, LOGGER_LEVELS.CRITICAL);
        }

    return keyssi;
}


export function createFromDecorators<T extends DSUModel>(model: T, callback: DSUCallback<T>){
    const classDecorators: {key: string, props: any}[] = getClassDecorators(ModelKeys.REFLECT, model);
    const propDecorators: {[indexer: string]: any[]} | undefined = getAllPropertyDecorators<T>(model as T, DsuKeys.REFLECT);

    classDecorators.forEach(cd => {
        console.log(cd);
    });
    if (propDecorators)
        Object.keys(propDecorators).forEach(key => {
            console.log(propDecorators[key]);
        });

    callback();
}