import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * @namespace dsu-blueprint.core.opendsu.api.cache
 * @memberOf dsu-blueprint.core.opendsu.api
 */

/**
 * @interface OpenDSUCache
 * @memberOf dsu-blueprint.core.opendsu.api.cache
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
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface CacheApi {
    getCacheForVault(storeName: string, lifetime: any): OpenDSUCache,
    getMemoryCache(storeName: string): OpenDSUCache;
}