import {DsuFsKeys} from "./constants";

const getFsKey = (key: string) => DsuFsKeys.REFLECT + key;

/**
 *
 * @param {string} app the name of the folder in the workspace where the seed file is located;
 * @param {boolean} [derive] decides if derives the SSI or not. defaults to false
 * @param {string} [mountPath] defines the mount path, overriding the property name;
 *
 * @decorator on
 * @namespace decorators
 * @memberOf fs
 */
export const dsuFS = (app: string, derive: boolean = false, mountPath?: string) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getFsKey(DsuFsKeys.MOUNT_FS),
        {
            app: app,
            derive: derive,
            mountPath: mountPath ? mountPath : propertyKey
        },
        target,
        propertyKey
    );
}

/**
 * @param {string} fsPath the source path for the file in the filesystem
 * @param {string} [dsuPath]  defines the path in the dsu where to store the file overriding the property name;
 *
 * @decorator addFileFS
 * @namespace decorators
 * @memberOf fs
 */
export const addFileFS = (fsPath: string, dsuPath?: string) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getFsKey(DsuFsKeys.ADD_FILE_FS),
        {
            fsPath: fsPath,
            dsuPath: dsuPath ? dsuPath : propertyKey
        },
        target,
        propertyKey
    );
}

/**
 * @param {string} [fsPath] the source path for the file in the filesystem. defaults to property key
 * @param {string} [dsuPath]  defines the path in the dsu where to store the file overriding the property name;
 *
 * @decorator addFolderFS
 * @namespace decorators
 * @memberOf fs
 */
export const addFolderFS = (fsPath?: string, dsuPath?: string) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getFsKey(DsuFsKeys.ADD_FOLDER_FS),
        {
            fsPath: fsPath ? fsPath : propertyKey,
            dsuPath: dsuPath ? dsuPath : propertyKey
        },
        target,
        propertyKey
    );
}