import {DsuKeys, DSUOperation} from "../model/constants";
import {DSUEditMetadata, DSUModel} from "../model";
import {repository} from "@tvenceslau/db-decorators/lib/repository/decorators";
import {DSUEditingHandler} from "./types";
import {DSUCallback, OpenDSURepository} from "./repository";
import {DSUCache} from "./cache";
import {DSU, DSUIOOptions, KeySSI} from "../opendsu";
import {criticalCallback, CriticalError, warn} from "@tvenceslau/db-decorators/lib";
import {getDSUOperationsRegistry} from "./registry";

const getDSUModelKey = (key: string) => DsuKeys.REFLECT + key;

/**
 * @typedef T extends DSUModel
 * @param {{new: T}} model
 * @param {boolean} [derive] if the received DSU should have its KeySSI derived. defaults to false
 * @param {string} [mountPath] defines the mount path. defaults to the property key
 * @param {DSUIOOptions} [mountOptions] options to be passed to OpenDSU for the mounting operation
 *
 * @decorator fromCache
 * @namespace decorators
 * @memberOf model
 */
export function fromCache<T extends DSUModel>(model: {new(): T}, derive: boolean | number = false, mountPath?: string, mountOptions?: DSUIOOptions) {
    return (target: T, propertyKey: string) => {
        const metadata: DSUEditMetadata = {
            operation: DSUOperation.EDITING,
            derive: derive,
            options: mountOptions,
            dsuPath: mountPath ? mountPath : propertyKey,
        };
        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.FROM_CACHE),
            metadata,
            target,
            propertyKey
        );

        const handler: DSUEditingHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, parentDsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T>){
            const {dsuPath, options, derive} = decorator.props;

            const cached = dsuCache.get(model as T, decorator.prop);
            if (!cached)
                throw new CriticalError(`Could not find matching cached DSU`);
            if (cached.length > 1)
                warn(`Cached DSUs for this property exceed the ones allowed. using only the first one`);
            const {keySSI} = cached[0];

            const ssi = derive ? keySSI.derive().getIdentifier() : keySSI.getIdentifier();

            parentDsu.mount(dsuPath, ssi, options, (err) => {
                if (err)
                    return criticalCallback(err, callback);
                callback(undefined, model);
            });

        }

        getDSUOperationsRegistry().register(handler, DSUOperation.EDITING, target, propertyKey);

    }
}

/**
 * Defines a class as a DSU Repository (makes it injectable)
 *
 * @decorator dsuRepository
 * @namespace decorators
 * @memberOf model
 */
export function dsuRepository(...args: any[]){
    return (original: Function) => {
        return repository(...args)(original);
    }
}