import {DsuKeys} from "../model/constants";
import {DSUModel} from "../model";

const getDSUModelKey = (key: string) => DsuKeys.REFLECT + key;

/**
 * @typedef T extends DSUModel
 * @param {{new: T}} model
 * @param {boolean} [derive] if the received DSU should have its KeySSI derived. defaults to false
 * @param {string} [dsuFilePath] defines the mount path. defaults to the property key
 *
 * @decorator fromCache
 * @namespace decorators
 * @memberOf model
 */
export function fromCache<T extends DSUModel>(model: {new(): T}, derive: boolean = false, dsuFilePath?: string) {
    return (target: any, propertyKey: string) => {
        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.FROM_CACHE),
            {
                dsuFilePath: dsuFilePath ? dsuFilePath : propertyKey
            },
            target,
            propertyKey
        );
    }
}