import {DsuFsKeys} from "./constants";
import {DSUEditMetadata, DSUOperation} from "../model";
import {DSU, DSUIOOptions, getKeySsiSpace} from "../opendsu";
import {getFS} from "./utils";
import {criticalCallback, CriticalError, Err} from "@tvenceslau/db-decorators/lib";
import {getDSUOperationsRegistry} from "../repository/registry";
import {DSUCache, DSUCallback, DSUEditingHandler, OpenDSURepository} from "../repository";
import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";

const getFsKey = (key: string) => DsuFsKeys.REFLECT + key;

/**
 *
 * @param {string} app the name of the folder in the workspace where the seed file is located;
 * @param {boolean} [derive] decides if derives the SSI or not. defaults to false
 * @param {string} [mountPath] defines the mount path, overriding the property name;
 * @param {string} [mountOptions] sets the {@link DSUIOOptions} fot the mount operation
 *
 * @decorator dsuFS
 * @namespace decorators
 * @memberOf fs
 */
export const dsuFS = (app: string, derive: boolean = false, mountPath?: string, mountOptions?: DSUIOOptions) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getFsKey(DsuFsKeys.MOUNT_FS),
        {
            operation: DSUOperation.EDITING,
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
        getFS().readFile(app, undefined, (err, keySSI) => {
            if (err || !keySSI)
                return criticalCallback(err || new Error(`Missing data`), callback);
            try {
                keySSI = getKeySsiSpace().parse(keySSI.toString());
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

    getDSUOperationsRegistry().register(handler, DSUOperation.EDITING, target, propertyKey);
}

/**
 * @param {string} fsPath the source path for the file in the filesystem
 * @param {string} [dsuPath]  defines the path in the dsu where to store the file overriding the property name;
 * @param {string} [options] sets the {@link DSUIOOptions} fot the write operation
 *
 * @decorator addFileFS
 * @namespace decorators
 * @memberOf fs
 */
export const addFileFS = (fsPath: string, dsuPath?: string, options?: DSUIOOptions) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getFsKey(DsuFsKeys.ADD_FILE_FS),
        {
            fsPath: fsPath,
            dsuPath: dsuPath ? dsuPath : propertyKey,
            options: options
        },
        target,
        propertyKey
    );

    const handler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: T, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T>): void {
        const {props} = decorator;
        const {dsuPath, fsPath, options} = props;
        dsu.addFile(fsPath, dsuPath, options, err => {
            if (err)
                return criticalCallback(err, callback);
            callback(undefined, obj, dsu);
        })
    }

    getDSUOperationsRegistry().register(handler, DSUOperation.EDITING, target, propertyKey);
}

/**
 * @param {string} [fsPath] the source path for the file in the filesystem. defaults to property key
 * @param {string} [dsuPath]  defines the path in the dsu where to store the file overriding the property name;
 * @param {string} [options] sets the {@link DSUIOOptions} fot the write operation
 *
 * @decorator addFolderFS
 * @namespace decorators
 * @memberOf fs
 */
export const addFolderFS = (fsPath?: string, dsuPath?: string, options?: DSUIOOptions) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getFsKey(DsuFsKeys.ADD_FOLDER_FS),
        {
            fsPath: fsPath ? fsPath : propertyKey,
            dsuPath: dsuPath ? dsuPath : propertyKey,
            options: options
        },
        target,
        propertyKey
    );

    const handler: DSUEditingHandler = function<T extends DBModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, obj: T, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T>): void {
        const {props} = decorator;
        const {dsuPath, fsPath, options} = props;
        dsu.addFolder(fsPath, dsuPath, options, err => {
            if (err)
                return criticalCallback(err, callback);
            callback(undefined, obj, dsu);
        })
    }

    getDSUOperationsRegistry().register(handler, DSUOperation.EDITING, target, propertyKey);
}