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
 */
export interface DSU {
    /**
     */
    directAccessEnabled: boolean;

    /**
     *
     * @param {ErrCallback} callback
     *
     */
    enableDirectAccess(callback: ErrCallback): void;

    // From Docs
    /**
     *
     * @param {boolean} plain
     *
     */
    getCreationSSI(plain?: boolean): string;

    /**
     *
     * @param {string | KeySSICallback} [keySSIType]
     * @param {KeySSICallback} callback
     *
     */
    getKeySSIAsObject(keySSIType?: string | KeySSICallback, callback?: KeySSICallback): void;

    /**
     *
     * @param {string | GenericCallback<string>} [keySSIType]
     * @param {GenericCallback<string>} callback
     *
     */
    getKeySSIAsString(keySSIType?: string | GenericCallback<string>, callback?: GenericCallback<string>): void;

    // Mounting
    // getManifest(): void
    /**
     *
     * @param {string} mountPoint
     * @param {GenericCallback<string>} callback
     *
     */
    getSSIForMount(mountPoint: string, callback: GenericCallback<string>): void;

    /**
     *
     * @param {string} mountPoint
     * @param {GenericCallback<{path: string, identifier: string[]}>} callback
     *
     */
    listMountedDSUs(mountPoint: string, callback: GenericCallback<{path: string, identifier: string}[]>): void;

    /**
     *
     * @param {string} mountingPoint
     * @param {string} archiveSSI
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     */
    mount(mountingPoint: string, archiveSSI: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} mountPoint
     * @param {ErrCallback} callback
     *
     */
    unmount(mountPoint: string, callback: ErrCallback): void;

    // IO
    /**
     *
     * @param {string} dsuPath
     * @param {Callback} callback
     *
     */
    getArchiveForPath(dsuPath: string, callback: Callback): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrCallback<string[]>} [options]
     * @param {GenericCallback<string[]>} callback
     *
     */
    listFiles(dsuPath: string, options?: IoOptionsOrCallback<string[]>, callback?: GenericCallback<string[]>): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrCallback<string[]>} [options]
     * @param {GenericCallback<string[]>} callback
     *
     */
    listFolders(dsuPath: string, options?: IoOptionsOrCallback<string[]>, callback?: GenericCallback<string[]>): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrCallback<{}>} [options]
     * @param {GenericCallback<{}>} callback
     *
     */
    readDir(dsuPath: string, options?: IoOptionsOrCallback<{}>, callback?: GenericCallback<{}>): void;

    /**
     *
     * @param {string} srcPath
     * @param {string} destPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     */
    cloneFolder(srcPath: string, destPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     */
    createFolder(dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     */
    delete(dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} srcPath
     * @param {string} destPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     */
    rename(srcPath: string, destPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} dsuPath
     * @param {any} data
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     */
    appendToFile(dsuPath: string, data: any, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} dsuPath
     * @param {IoOptionsOrCallback<any>} [options]
     * @param {GenericCallback<any>} callback
     *
     */
    createReadStream(dsuPath: string, options?: IoOptionsOrCallback<any>, callback?: GenericCallback<any>): void;

    /**
     *
     * @param {string} message
     * @param {ErrCallback} callback
     *
     */
    dsuLog(message: string, callback: ErrCallback): void;

    /**
     *
     * @param {string} path
     * @param {IoOptionsOrCallback<any>} [options]
     * @param {GenericCallback<any>} callback
     *
     */
    readFile(path: string, options?: IoOptionsOrCallback<any>, callback?: GenericCallback<any>): void;

    /**
     *
     * @param {string} path
     * @param {any} data
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     */
    writeFile(path: string, data: any, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    // Batch
    /**
     *
     * @param {function(): any} batchFn
     * @param {ErrCallback} callback
     *
     */
    batch(batchFn: () => any, callback: ErrCallback): void;

    /**
     * @return {boolean}
     *
     */
    batchInProgress(): boolean;

    /**
     */
    beginBatch(): void;

    /**
     *
     * @param {ErrCallback} callback
     *
     */
    cancelBatch(callback: ErrCallback): void;

    /**
     *
     * @param {function(): any | ErrCallback} [onConflict]
     * @param {ErrCallback} callback
     *
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
     */
    addFile(fsPath: string, dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} fsPath
     * @param {dsuPath} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     */
    addFiles(fsPath: string[], dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} fsPath
     * @param {dsuPath} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
     */
    addFolder(fsPath: string, dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    /**
     *
     * @param {string} fsPath
     * @param {dsuPath} dsuPath
     * @param {IoOptionsOrErrCallback} [options]
     * @param {ErrCallback} callback
     *
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
 */
export interface WalletDsu extends DSU {
    /**
     * @return {DSU}
     *
     */
    getWritableDSU(): DSU;
}


/**
 * Exposes an interface with the OpenDSU APi
 *
 * @interface OpenDSU
 */
export interface OpenDSU {
    /**
     * Constants Property
     */
    constants: ConstantsApi;

    /**
     *
     * @param {string} api
     * @return {OpenDSUApi}
     *
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
