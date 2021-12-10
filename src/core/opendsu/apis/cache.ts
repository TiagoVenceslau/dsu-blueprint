import {Callback} from "@tvenceslau/db-decorators/lib";

export interface OpenDSUCache {
    get(key: string, callback: Callback): void;
    put(key: string, value: any, callback: Callback): void
}

export interface CacheApi {
    getCacheForVault(storeName: string, lifetime: any): OpenDSUCache,
    getMemoryCache(storeName: string): OpenDSUCache;
}