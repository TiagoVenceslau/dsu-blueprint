import {DSU, KeySSI} from "../opendsu";
import {DSUModel} from "../model";

export class DSUCache<T extends DSUModel>{
    private _cache: {[indexer: string]: {[indexer: string]: {dsu: DSU, keySSI: KeySSI}[]}} = {};

    cache(obj: T, propKey: string, dsu: DSU, keySSI: KeySSI){
        const name = obj.constructor.name;
        this._cache[name] = this._cache[name] || {};
        this._cache[name][propKey] = this._cache[name][propKey] || [];
        this._cache[name][propKey].push({
            dsu: dsu,
            keySSI: keySSI
        })
    }

    get(obj: T, propKey: string): {dsu: DSU, keySSI: KeySSI}[] | undefined {
        try {
            const name = obj.name || obj.constructor.name;
            return this._cache[name][propKey];
        } catch (e) {
            return undefined
        }
    }
}