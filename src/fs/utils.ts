import {DSU, ObjectCallback} from "../core/opendsu/types";
import {Callback, Err} from "@tvenceslau/db-decorators/lib";
import {ConstantsApi, get$$} from "../core/opendsu";
import {DSUStorage} from "../core/opendsu/apis/storage";

/**
 * utils method to 'fake' a DSUStorage
 *
 * @param {DSU} originalDsu
 *
 * @namespace utils
 * @module filesystem
 */
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

/**
 * cache of node's fs object
 *
 * @namespace utils
 * @module filesystem
 */
let  _fileSystem: fs | undefined = undefined;

export type FsOptions = {encoding?: string, flag?: string, withFileTypes?: boolean};

/**
 * Interface with the used node fs methods
 *
 * @interface fs
 * @namespace utils
 * @module filesystem
 */
export interface fs {
    readdir(path: string, options: FsOptions | undefined, callback: Callback): void;
    readFile(path: string, options: FsOptions | undefined, callback: Callback): void;
    readFileSync(path: string, options?: FsOptions): Promise<string>;
    writeFile(path: string, data: any, options: FsOptions | undefined, callback: Callback): void;
    writeFileSync(path: string, data: any, options?: FsOptions): Promise<void>;
}

/**
 * Caches and returns node's fs object if the environment is right
 *
 * @return {fs}
 *
 * 
 * @namespace utils
 * @module filesystem
 */
export function getFS(): fs {
    if (get$$().environmentType !== 'nodejs')
        throw new Error("Wrong environment for this function. Please make sure you know what you are doing...");
    if (!_fileSystem)
        _fileSystem = require('fs') as fs;
    return _fileSystem;
}
/**
 * Interface with the used node path methods
 *
 * @interface fs
 * @namespace utils
 * @module filesystem
 */
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
 *
 * @return path
 *
 * 
 * @namespace utils
 * @module filesystem
 */
export function getPath(): path {
    if (get$$().environmentType !== 'nodejs')
        throw new Error("Wrong environment for this function. Please make sure you know what you are doing...");
    if (!_path)
        _path = require('path') as path;
    return _path;
}

/**
 *
 * @param {string} strEnv the contents of the environment.js file
 *
 * 
 * @module filesystem
 */
export function parseEnvJS(strEnv: string): {}{
    return JSON.parse(strEnv.replace(/^export\sdefault\s/, ''));
}

/**
 * Retrieves the environment file at {@link ConstantsApi#ENVIRONMENT_PATH} via the 'local' ApiHub
 *
 * @param {string} app the app name
 * @param {string} pathToApps
 * @param {ObjectCallback} callback
 *
 * 
 * @module filesystem
 */
export function getEnvJs(app: string, pathToApps: string, callback: ObjectCallback){
    const appPath = getPath().join(process.cwd(), pathToApps, "trust-loader-config", app, "loader", "environment.js");
    getFS().readFile(appPath, undefined, (err: Err, data: Buffer) => {
        if (err)
            return callback(`Could not find Application ${app} at ${{appPath}} : ${err}`);
        return callback(undefined, parseEnvJS(data.toString()));
    });
}