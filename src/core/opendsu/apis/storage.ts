import {DSU, ErrCallback, ObjectCallback} from "../types";

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

export interface StorageApi {
    getStorage: () => DSUStorage;
}

