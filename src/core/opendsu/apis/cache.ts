import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * @namespace core.opendsu.api.cache
 * @memberOf core.opendsu.api
 */

/**
 * @interface OpenDSUCache
 * @memberOf core.opendsu.api.cache
 */
export interface OpenDSUCache {
    get(key: string, callback: Callback): void;
    put(key: string, value: any, callback: Callback): void
}

/**
 * Interface representing the OpenDSU 'cache' Api Space
 *
 * @interface CacheApi
 *
 * @memberOf core.opendsu.api
 */
export interface CacheApi {
    getCacheForVault(storeName: string, lifetime: any): OpenDSUCache,
    getMemoryCache(storeName: string): OpenDSUCache;
}