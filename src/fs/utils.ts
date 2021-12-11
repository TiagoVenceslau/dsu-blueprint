import {DSU, ObjectCallback} from "../core/opendsu/types";
import {Callback, Err} from "@tvenceslau/db-decorators/lib";
import {get$$} from "../core/opendsu";
import {DSUStorage} from "../core/opendsu/apis/storage";

export function impersonateDSUStorage(originalDsu: DSU): DSUStorage {
    const dsu: DSUStorage = originalDsu as DSUStorage;
    dsu.directAccessEnabled = false;
    dsu.enableDirectAccess = (callback: Callback) => callback();

    const setObject = function(path: string, data: any, callback: Callback) {
        try {
            dsu.writeFile(path, JSON.stringify(data), callback);
        } catch (e) {
            callback("setObject failed", e);
        }
    }

    const getObject = function(path: string, callback: ObjectCallback) {
        dsu.readFile(path, (err: Err, data: any) => {
            if (err)
                return callback("getObject failed" ,err);

            try{
                data = JSON.parse(data);
            } catch (e){
                return callback(`Could not parse JSON ${data.toString()}`, e);
            }
            callback(undefined, data);
        });
    }
    dsu.getObject = getObject;
    dsu.setObject = setObject;
    return dsu;
}

export function jsonStringifyReplacer(key: string, value: any){
    if(key === 'manager' && value.constructor.name)
        return value.constructor.name;
    if (key === 'serialNumbers')
        return value.join(', ');
    return value;
}

/**
 * cache of node's fs object
 * @memberOf utils
 */
let  _fileSystem: fs | undefined = undefined;

export type FsOptions = {encoding?: string, flag?: string, withFileTypes?: boolean};

export interface fs {
    readdir(path: string, options: FsOptions | undefined, callback: Callback): void;
    readFile(path: string, options: FsOptions | undefined, callback: Callback): void;
    readFileSync(path: string, options?: FsOptions): Promise<string>;
    writeFile(path: string, data: any, options: FsOptions | undefined, callback: Callback): void;
    writeFileSync(path: string, data: any, options?: FsOptions): Promise<void>;
}

/**
 * Caches and returns node's fs object if the environment is right
 * @return {fs}
 * @memberOf utils
 */
export function getFS(): fs {
    if (get$$().environmentType !== 'nodejs')
        throw new Error("Wrong environment for this function. Please make sure you know what you are doing...");
    if (!_fileSystem)
        _fileSystem = require('fs') as fs;
    return _fileSystem;
}

export interface path {
    sep: string;

    join(...args: string[]): string;
    basename(path: string): string;
    dirname(path: string): string;
    resolve(...paths: string[]): string;
}

let  _path: path | undefined = undefined;

/**
 * Caches and returns node's fs object if the environment is right
 * @return {path}
 * @memberOf utils
 */
export function getPath(): path {
    if (get$$().environmentType !== 'nodejs')
        throw new Error("Wrong environment for this function. Please make sure you know what you are doing...");
    if (!_path)
        _path = require('path') as path;
    return _path;
}