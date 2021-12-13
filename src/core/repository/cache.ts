import {DSU} from "../opendsu";
import {DSUModel} from "../model";
import {createObjectToValueChain, getValueFromValueChain} from "./utils";
import {KeySSI} from "../opendsu/apis/keyssi";

/**
 * @namespace core.repository.cache
 * @memberOf core.repository
 */

/**
 * Stores recursively created DSUs in order for later operations to reference them (mounting, etc)
 *
 * @class DSUCache
 *
 * @memberOf core.repository.cache
 */
export class DSUCache<T extends DSUModel>{
    private _cache: {[indexer: string]: {[indexer: string]: {dsu: DSU, keySSI: KeySSI}[]}} = {};

    /**
     * caches the DSU, by associating it with the {@param obj}'s name, and {@param propKey}
     *
     * @param {T} obj
     * @param {string} propKey
     * @param {DSU} dsu
     * @param {KeySSI} keySSI
     * @param {string} [parent] only meant to be used by bound objects resulting from {@link DSUCache#bindToParent}
     *
     * @memberOf DSUCache
     */
    cache(obj: T, propKey: string, dsu: DSU, keySSI: KeySSI, parent?: string): void{
        const name = obj.constructor.name;
        const chain = `${parent ? `${parent}.` : ''}${name}.${propKey}`;
        createObjectToValueChain(this._cache, chain, {
            dsu: dsu,
            keySSI: keySSI
        });
    }

    /**
     * returns the cached {@link DSU}
     *
     * @param {T | string} obj
     * @param {string} propKey
     * @param {string} [parent] only meant to be used by bound objects resulting from {@link DSUCache#bindToParent} to reverse the hierarchical structure
     *
     * @memberOf DSUCache
     */
    get(obj: T | string, propKey: string, parent?: string): {dsu: DSU, keySSI: KeySSI}[] | undefined {
        const name: string = typeof  obj === 'string' ? obj : (obj.name || obj.constructor.name);
        const chain = `${parent ? `${parent}.` : ''}${name}.${propKey}`;
        try {
            return getValueFromValueChain(this._cache, chain);
        } catch (e) {
            try {
                const split: string[]  = chain.split('.');
                const parents = split.splice(split.length - 3, 3)
                const args = [split.pop(), parents.pop()] as string[];
                // @ts-ignore
                return this.get(...args, split.join('.'));
            } catch (e) {
                return undefined;
            }
        }
    }

    /**
     *
     * @param {T} parentModel
     * @param {string} propKey
     * @return a {@link isDSUCache} validatable {@link DSUCache} bound to the {@param parentModel}s name and {@prop propKey} to enable recursive storage
     *
     * @memberOf DSUCache
     */
    bindToParent(parentModel: T, propKey: string): DSUCache<T> {
        const self: DSUCache<T> = this;
        const name: string = parentModel.name || parentModel.constructor.name;
        const chain = `${name}.${propKey}`;
        const proxyObj = {
            cache: (obj: T, propKey: string, dsu: DSU, keySSI: KeySSI) => self.cache.call(self, obj, propKey, dsu, keySSI, chain),
            get: (obj: T, propKey: string) => self.get.call(self, obj, propKey, chain),
            bindToParent: (parentModel: T, propKey: string) => self.bindToParent.call(self, parentModel, propKey)
        }

        return proxyObj as DSUCache<T>;
    }
}

/**
 * Because of the binding, this method should be used instead of 'instanceof DSUCache'
 *
 * @param {any} obj
 *
 * @function isDSUCache
 *
 * @memberOf core.repository.cache
 */
export function isDSUCache(obj: any){
    return obj && obj.get && obj.bindToParent && obj.cache;
}