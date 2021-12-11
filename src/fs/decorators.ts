import {DSUEditMetadata, DsuKeys, DSUOperation} from "../core/model";
import {DSU, DSUIOOptions, getKeySSIApi} from "../core/opendsu";
import {getFS, getPath} from "./utils";
import {Callback, criticalCallback, DBOperations, Err, OperationKeys} from "@tvenceslau/db-decorators/lib";
import {getDSUOperationsRegistry} from "../core/repository/registry";
import {DSUCache, DSUCallback, DSUEditingHandler, OpenDSURepository, ReadCallback} from "../core/repository";
import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";
import {DsuFsKeys, FSOptions} from "./constants";

const getFsKey = (key: string) => DsuKeys.REFLECT + key;

/**
 *
 * @param {string} app the name of the folder in the workspace where the seed file is located;
 * @param {boolean} [derive] decides if derives the SSI or not. defaults to false
 * @param {string} [mountPath] defines the mount path, overriding the property name;
 * @param {string} [mountOptions] sets the {@link DSUIOOptions} fot the mount operation
 *
 * @function dsuFS
 *
 * @decorator
 * @namespace decorators
 * @module filesystem
 */
export const dsuFS = (app: string, derive: boolean = false, mountPath?: string, mountOptions?: DSUIOOptions) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getFsKey(DsuFsKeys.MOUNT_FS),
        {
            operation: DSUOperation.EDITING,
            phase: DBOperations.CREATE,
            app: app,
            derive: derive,
            options: mountOptions,
            dsuPath: mountPath ? mountPath : propertyKey
        },
        target,
        propertyKey
    );

    const handler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: any, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T>): void {
        const {props} = decorator;
        const {dsuPath, options, derive, app} = props;
        const seedPath = getPath().join(this.pathAdaptor, app, FSOptions.seedFileName);

        const handleOperation = function(seedPath: string, dsuPath: string, callback: Callback){
            getFS().readFile(seedPath, undefined, (err, keySSI) => {
                if (err || !keySSI)
                    return criticalCallback(err || new Error(`Missing data`), callback);
                try {
                    keySSI = getKeySSIApi().parse(keySSI.toString());
                    if (derive)
                        keySSI = keySSI.derive();

                } catch (e){
                    return criticalCallback(`Could not parse KeySSI for App ${app}`, callback);
                }
                dsu.mount(dsuPath, keySSI.getIdentifier(), options, (err) => {
                    if (err)
                        return criticalCallback(err, callback);
                    callback(undefined, obj, dsu)
                })
            });
        }
        if (!seedPath.match(/[\\/]\*[\\/]/))
            return handleOperation(seedPath, dsuPath, callback);

        let basePath = seedPath.split("*");
        getFS().readdir(basePath[0], undefined, (err, folders) => {
            if (err || !folders || !folders.length)
                return criticalCallback(err || new Error(`Could not find referenced folders`), callback);

            const mountIterator = function(folders: string[], callback: Callback){
                const folder = folders.shift();
                if (!folder)
                    return callback();
                handleOperation(getPath().join(basePath[0], folder, basePath[1]), `${dsuPath}/${folder}`, (err) => {
                    if (err)
                        return criticalCallback(err, callback);
                    mountIterator(folders, callback);
                });
            }

            mountIterator(folders.slice(), (err) => {
                if (err)
                    return callback(err);
                callback(undefined, obj, dsu);
            });
        });
    }

    getDSUOperationsRegistry().register(handler, DSUOperation.EDITING, OperationKeys.CREATE, target, propertyKey);
}

/**
 * @param {string} fsPath the source path for the file in the filesystem
 * @param {string} [dsuPath]  defines the path in the dsu where to store the file overriding the property name;
 * @param {string} [options] sets the {@link DSUIOOptions} fot the write operation
 *
 * @function addFileFS
 *
 * @decorator
 * @namespace decorators
 * @module filesystem
 */
export const addFileFS = (fsPath: string, dsuPath?: string, options?: DSUIOOptions) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getFsKey(DsuFsKeys.ADD_FILE_FS),
        {
            operation: DSUOperation.EDITING,
            phase: DBOperations.CREATE,
            fsPath: fsPath,
            dsuPath: dsuPath ? dsuPath : propertyKey,
            options: options
        },
        target,
        propertyKey
    );

    const handler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: T | {}, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T> | ReadCallback): void {
        const {props} = decorator;
        let {dsuPath, fsPath, options} = props;
        fsPath = getPath().join(this.pathAdaptor, fsPath);
        dsu.addFile(fsPath, dsuPath, options, err => {
            if (err)
                return criticalCallback(err, callback);
            callback(undefined, obj as T, dsu);
        });
    }

    getDSUOperationsRegistry().register(handler, DSUOperation.EDITING, OperationKeys.CREATE, target, propertyKey);
}

/**
 * @param {string} [fsPath] the source path for the file in the filesystem. defaults to property key
 * @param {string} [dsuPath]  defines the path in the dsu where to store the file overriding the property name;
 * @param {string} [options] sets the {@link DSUIOOptions} fot the write operation
 *
 * @function addFolderFS
 *
 * @decorator
 * @namespace decorators
 * @module filesystem
 */
export const addFolderFS = (fsPath?: string, dsuPath?: string, options?: DSUIOOptions) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getFsKey(DsuFsKeys.ADD_FOLDER_FS),
        {
            operation: DSUOperation.EDITING,
            phase: DBOperations.CREATE,
            fsPath: fsPath ? fsPath : propertyKey,
            dsuPath: dsuPath ? dsuPath : propertyKey,
            options: options
        },
        target,
        propertyKey
    );

    const handler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: T | {}, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T> | ReadCallback): void {
        const {props} = decorator;
        let {dsuPath, fsPath, options} = props;
        fsPath = getPath().join(this.pathAdaptor, fsPath);
        dsu.addFolder(fsPath, dsuPath, options, err => {
            if (err)
                return criticalCallback(err, callback);
            callback(undefined, obj as T, dsu);
        });
    }

    getDSUOperationsRegistry().register(handler, DSUOperation.EDITING, OperationKeys.CREATE, target, propertyKey);
}