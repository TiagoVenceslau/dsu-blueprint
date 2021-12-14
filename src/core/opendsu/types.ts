import {Callback, Err} from "@tvenceslau/db-decorators/lib";
import { HttpApi } from "./apis/http";
import {KeySSI, KeyssiApi, KeySSICallback} from "./apis/keyssi";
import { ResolverApi } from "./apis/resolver";
import { SystemApi } from "./apis/system";
import {SecurityContextApi} from "./apis/sc";
import {W3cDIDApi} from "./apis/w3cdid";
import {DBApi} from "./apis/db";
import {EnclaveApi} from "./apis/enclave";
import {AnchoringApi} from "./apis/anchoring";
import {BdnsApi} from "./apis/bdns";
import {ConfigApi} from "./apis/config";
import {CacheApi} from "./apis/cache";
import {ContractsApi} from "./apis/contracts";
import {CrypoApi} from "./apis/crypto";
import {ErrorApi} from "./apis/error";
import {OpenDSUWorkersApi} from "./apis/workers";
import {OpenDSUUtilsApi} from "./apis/utils";
import {OAuthApi} from "./apis/oauth";
import {NotificationsApi} from "./apis/notifications";
import {MessageQueueApi} from "./apis/mq";
import {M2DsuApi} from "./apis/m2dsu";
import {StorageApi} from "./apis/storage";
import {ConstantsApi} from "./apis";

/**
 * @typedef ObjectCallback
 * @memberOf dsu-blueprint.core.opendsu
 */
export type ObjectCallback = (err?: Err, object?: any) => void;
/**
 * @typedef ErrCallback
 * @memberOf dsu-blueprint.core.opendsu
 */
export type ErrCallback = (err?: Err) => void;
/**
 * @typedef GenericCallback
 * @memberOf dsu-blueprint.core.opendsu
 */
export type GenericCallback<T> = (err?: Err, result?: T, ...args: any[]) => void;
/**
 * @typedef SimpleDSUCallback
 * @memberOf dsu-blueprint.core.opendsu
 */
export type SimpleDSUCallback = GenericCallback<DSU>;
/**
 * @typedef DSUIOOptions
 * @memberOf dsu-blueprint.core.opendsu
 */
export type DSUIOOptions = {
    embedded?: boolean,
    encrypt?: boolean,
    ignoreMounts?: boolean,
    recursive?: boolean
}

/**
 * @typedef DSUAnchoringOptions
 * @memberOf dsu-blueprint.core.opendsu
 */
export type DSUAnchoringOptions = {
    dsuTypeSSI?: string
}

/**
 * @constant
 * @memberOf dsu-blueprint.core.opendsu
 */
export const DefaultIOOptions: DSUIOOptions = {
    embedded: false,
    encrypt: true,
    ignoreMounts: true,
    recursive: true
}

/**
 * @interface
 * @memberOf dsu-blueprint.core.opendsu
 */
export interface DSUHandler{}
/**
 * @interface
 * @memberOf dsu-blueprint.core.opendsu
 */
export interface DSUFactory{
    create(keySSI: KeySSI, options: DSUIOOptions, callback: SimpleDSUCallback): void;
    load(keySSI: KeySSI, options: DSUIOOptions, callback: SimpleDSUCallback): void
}
/**
 * @typedef IoOptionsOrCallback
 * @memberOf dsu-blueprint.core.opendsu
 */
export type IoOptionsOrCallback<T> = DSUIOOptions | GenericCallback<T>;
/**
 * @typedef IoOptionsOrErrCallback
 * @memberOf dsu-blueprint.core.opendsu
 */
export type IoOptionsOrErrCallback = DSUIOOptions | ErrCallback;
/**
 * @typedef IoOptionsOrDSUCallback
 * @memberOf dsu-blueprint.core.opendsu
 */
export type IoOptionsOrDSUCallback = DSUIOOptions | SimpleDSUCallback;
/**
 * @typedef AnchoringOptsOrCallback
 * @memberOf dsu-blueprint.core.opendsu
 */
export type AnchoringOptsOrCallback<T> = DSUAnchoringOptions | GenericCallback<T>;
/**
 * @typedef AnchoringOptsOrErrCallback
 * @memberOf dsu-blueprint.core.opendsu
 */
export type AnchoringOptsOrErrCallback = DSUAnchoringOptions | ErrCallback;
/**
 * @typedef AnchoringOptsOrDSUCallback
 * @memberOf dsu-blueprint.core.opendsu
 */
export type AnchoringOptsOrDSUCallback = DSUAnchoringOptions | SimpleDSUCallback;


/**
 * Exposes an interface with the OpenDSU Archive APi
 *
 * @interface
 * @memberOf dsu-blueprint.core.opendsu
 */
export interface DSU {
    /**
     * @memberOf dsu-blueprint.DSU
     */
    directAccessEnabled: boolean;

    /**
     *
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    enableDirectAccess(callback: ErrCallback): void;

    // From Docs
    /**
     *
     * @param {boolean} plain
     *
     * @memberOf dsu-blueprint.DSU
     */
    getCreationSSI(plain?: boolean): string;

    /**
     *
     * @param {string | KeySSICallback} [keySSIType]
     * @param {KeySSICallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    getKeySSIAsObject(keySSIType?: string | KeySSICallback, callback?: KeySSICallback): void;

    /**
     *
     * @param {string | GenericCallback<string>} [keySSIType]
     * @param {GenericCallback<string>} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    getKeySSIAsString(keySSIType?: string | GenericCallback<string>, callback?: GenericCallback<string>): void;

    // Mounting
    // getManifest(): void
    /**
     *
     * @param {string} mountPoint
     * @param {GenericCallback<string>} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    getSSIForMount(mountPoint: string, callback: GenericCallback<string>): void;

    /**
     *
     * @param {string} mountPoint
     * @param {GenericCallback<{path: string, identifier: string[]}>} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    listMountedDSUs(mountPoint: string, callback: GenericCallback<{path: string, identifier: string}[]>): void;

    /**
     *
     * @param {string} mountingPoint
     * @param {string} archiveSSI
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    mount(mountingPoint: string, archiveSSI: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} mountPoint
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    unmount(mountPoint: string, callback: ErrCallback): void;

    // IO
    /**
     *
     * @param {string} dsuPath
     * @param {Callback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    getArchiveForPath(dsuPath: string, callback: Callback): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrCallback<string[]>} [options]
     * @param {GenericCallback<string[]>} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    listFiles(dsuPath: string, options?: IoOptionsOrCallback<string[]>, callback?: GenericCallback<string[]>): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrCallback<string[]>} [options]
     * @param {GenericCallback<string[]>} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    listFolders(dsuPath: string, options?: IoOptionsOrCallback<string[]>, callback?: GenericCallback<string[]>): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrCallback<{}>} [options]
     * @param {GenericCallback<{}>} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    readDir(dsuPath: string, options?: IoOptionsOrCallback<{}>, callback?: GenericCallback<{}>): void;

    /**
     *
     * @param {string} srcPath
     * @param {string} destPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    cloneFolder(srcPath: string, destPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    createFolder(dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    delete(dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} srcPath
     * @param {string} destPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    rename(srcPath: string, destPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} dsuPath
     * @param {any} data
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    appendToFile(dsuPath: string, data: any, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrCallback<any>} [options]
     * @param {GenericCallback<any>} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    createReadStream(dsuPath: string, options?: IoOptionsOrCallback<any>, callback?: GenericCallback<any>): void;

    /**
     *
     * @param {string} message
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    dsuLog(message: string, callback: ErrCallback): void;

    /**
     *
     * @param {string} path
     * @param {IoOptionsOrCallback<any>} [options]
     * @param {GenericCallback<any>} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    readFile(path: string, options?: IoOptionsOrCallback<any>, callback?: GenericCallback<any>): void;

    /**
     *
     * @param {string} path
     * @param {any} data
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    writeFile(path: string, data: any, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    // Batch
    /**
     *
     * @param {function(): any} batchFn
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    batch(batchFn: () => any, callback: ErrCallback): void;

    /**
     * @return {boolean}
     *
     * @memberOf dsu-blueprint.DSU
     */
    batchInProgress(): boolean;

    /**
     * @memberOf dsu-blueprint.DSU
     */
    beginBatch(): void;

    /**
     *
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    cancelBatch(callback: ErrCallback): void;

    /**
     *
     * @param {function(): any | ErrCallback} [onConflict]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    commitBatch(onConflict?: () => any | ErrCallback, callback?: ErrCallback): void;

    // FS
    /**
     *
     * @param {string} fsPath
     * @param {string} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    addFile(fsPath: string, dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} fsPath
     * @param {dsuPath} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    addFiles(fsPath: string[], dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} fsPath
     * @param {dsuPath} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    addFolder(fsPath: string, dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} fsPath
     * @param {dsuPath} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     * @memberOf dsu-blueprint.DSU
     */
    extractFile(fsPath: string, dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} fsPath
     * @param {dsuPath} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     */
    extractFolder(fsPath: string, dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
}

/**
 * Exposes an interface with the OpenDSU WalletDSU APi
 *
 * @interface WalletDsu
 *
 * @memberOf dsu-blueprint.core.opendsu
 */
export interface WalletDsu extends DSU {
    /**
     * @return {DSU}
     *
     * @memberOf dsu-blueprint.WalletDsu
     */
    getWritableDSU(): DSU;
}


/**
 * Exposes an interface with the OpenDSU APi
 *
 * @interface OpenDSU
 * @memberOf dsu-blueprint.core.opendsu
 */
export interface OpenDSU {
    /**
     * Constants Property
     * @memberOf dsu-blueprint.OpenDSU
     */
    constants: ConstantsApi;

    /**
     *
     * @param {string} api
     * @return {OpenDSUApi}
     *
     * @memberOf dsu-blueprint.OpenDSU
     */
    loadApi(api: string): OpenDSUApi;
}

/**
 * Exposes an Union Type will all mapped OpenDSU Apis
 *
 * @typedef OpenDSUApi
 * @memberOf dsu-blueprint.core.opendsu
 */
export type OpenDSUApi = StorageApi | M2DsuApi | MessageQueueApi | NotificationsApi | OAuthApi | OpenDSUWorkersApi | OpenDSUUtilsApi | AnchoringApi | ErrorApi | ResolverApi | KeyssiApi | SystemApi | HttpApi | SecurityContextApi | W3cDIDApi | DBApi | EnclaveApi | BdnsApi | ConfigApi | CacheApi | ContractsApi | CrypoApi;
