import {DsuKeys, DSUOperation} from "../model/constants";
import {DSUEditMetadata, DSUModel, getDSUModelKey} from "../model";
import {repository} from "@tvenceslau/db-decorators/lib/repository/decorators";
import {DSUEditingHandler} from "./types";
import {DSUCallback, OpenDSURepository, ReadCallback} from "./repository";
import {DSUCache} from "./cache";
import {DSU, DSUIOOptions, KeySSI} from "../opendsu";
import {criticalCallback, OperationKeys, warn} from "@tvenceslau/db-decorators/lib";
import {getDSUOperationsRegistry} from "./registry";
import {handleKeyDerivation} from "./utils";

/**
 * @namespace core.repository.decorators
 * @memberOf core.repository
 */

/**
 * @typedef T extends DSUModel
 * @param {{new: T}} model
 * @param {boolean} [derive] if the received DSU should have its KeySSI derived. defaults to false
 * @param {string} [mountPath] defines the mount path. defaults to the property key
 * @param {DSUIOOptions} [mountOptions] options to be passed to OpenDSU for the mounting operation
 *
 * @function fromCache
 *
 * @category decorators
 *
 * @memberOf core.repository.decorators
 */
export function fromCache<T extends DSUModel>(model: {new(): T}, derive: boolean | number = false, mountPath?: string, mountOptions?: DSUIOOptions) {
    return (target: T, propertyKey: string) => {
        const metadata: DSUEditMetadata = {
            operation: DSUOperation.EDITING,
            phase: [OperationKeys.CREATE, OperationKeys.READ],
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

        const createHandler: DSUEditingHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T | {}, parentDsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T> | ReadCallback){
            const {dsuPath, options, derive} = decorator.props;

            const cached = dsuCache.get(model as T, decorator.prop);
            if (!cached)
                return criticalCallback(new Error(`Could not find matching cached DSU`), callback);

            if (cached.length > 1)
                warn(`Cached DSUs for this property exceed the ones allowed. using only the first one`);
            let {keySSI} = cached[0];

            try {
                keySSI = handleKeyDerivation(keySSI, derive);
            } catch (e) {
                return criticalCallback(e, callback);
            }

            parentDsu.mount(dsuPath, keySSI.getIdentifier(), options, (err) => {
                if (err)
                    return criticalCallback(err, callback);
                callback(undefined, model as T);
            });
        }

        getDSUOperationsRegistry().register(createHandler, DSUOperation.EDITING, OperationKeys.CREATE, target, propertyKey);
    }
}

/**
 * Defines a class as a DSU Repository (makes it injectable)
 *
 * @function dsuRepository
 *
 * @category decorators
 *
 * @memberOf core.repository.decorators
 */
export function dsuRepository(...args: any[]){
    return (original: Function) => {
        return repository(...args)(original);
    }
}