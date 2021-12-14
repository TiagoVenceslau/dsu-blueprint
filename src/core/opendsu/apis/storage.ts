import {DSU, ErrCallback, ObjectCallback} from "../types";

/**
 * @namespace dsu-blueprint.core.opendsu.api.storage
 * @memberOf dsu-blueprint.core.opendsu.api
 */

/**
 * @interface DSUStorage
 *
 * @memberOf dsu-blueprint.core.opendsu.api.storage
 */
export interface DSUStorage extends DSU {
    getObject(path: string, callback: ObjectCallback): void;
    getItem(path: string, callback: ObjectCallback): void;
    setObject(path: string, data: any, callback: ErrCallback): void;
    setItem(path: string, data: any, callback: ErrCallback): void;
    uploadFile(path: string, file: any, options: any, callback: ErrCallback): void;
    uploadMultipleFiles(path: string, files: any[], options: any, callback: ErrCallback): void;
    deleteObjects(objects: [], callback: ErrCallback): void;
    removeFile(path: string, callback: ErrCallback): void;
    removeFiles(paths: string[], callback: ErrCallback): void;
}

/**
 * Interface representing the OpenDSU 'storage' Api Space
 *
 * @interface StorageApi
 *
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface StorageApi {
    getStorage: () => DSUStorage;
}

