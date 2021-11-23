import {Err} from "@tvenceslau/db-decorators/lib";

export type ObjectCallback = (err?: Err, object?: any) => void;
export type ErrCallback = (err?: Err) => void;

export interface OpenDSU {
    loadApi(api: string): {[indexer: string]: any}
}

export interface DSU {
    directAccessEnabled: boolean;

    enableDirectAccess(callback: ErrCallback): void;
    readFile(path: string, options?: {}, callback?: (err?: Err, data?: any) => void): void;
    writeFile(path: string, data: string, callback: ErrCallback): void;
}

export interface DSUStorage extends DSU {
    getObject(path: string, callback: ObjectCallback): void;
    setObject(path: string, data: any, callback: ErrCallback): void;
}