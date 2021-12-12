import {Err} from "@tvenceslau/db-decorators/lib";
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
 * @memberOf core.opendsu
 */
export type ObjectCallback = (err?: Err, object?: any) => void;
/**
 * @typedef ErrCallback
 * @memberOf core.opendsu
 */
export type ErrCallback = (err?: Err) => void;
/**
 * @typedef GenericCallback
 * @memberOf core.opendsu
 */
export type GenericCallback<T> = (err?: Err, result?: T, ...args: any[]) => void;
/**
 * @typedef SimpleDSUCallback
 * @memberOf core.opendsu
 */
export type SimpleDSUCallback = GenericCallback<DSU>;
/**
 * @typedef DSUIOOptions
 * @memberOf core.opendsu
 */
export type DSUIOOptions = {
    embedded?: boolean,
    encrypt?: boolean,
    ignoreMounts?: boolean,
    recursive?: boolean
}

/**
 * @typedef DSUAnchoringOptions
 * @memberOf core.opendsu
 */
export type DSUAnchoringOptions = {
    dsuTypeSSI?: string
}

/**
 * @constant
 * @memberOf core.opendsu
 */
export const DefaultIOOptions: DSUIOOptions = {
    embedded: false,
    encrypt: true,
    ignoreMounts: true,
    recursive: true
}

/**
 * @interface
 * @memberOf core.opendsu
 */
export interface DSUHandler{}
/**
 * @interface
 * @memberOf core.opendsu
 */
export interface DSUFactory{
    create(keySSI: KeySSI, options: DSUIOOptions, callback: SimpleDSUCallback): void;
    load(keySSI: KeySSI, options: DSUIOOptions, callback: SimpleDSUCallback): void
}
/**
 * @typedef IoOptionsOrCallback
 * @memberOf core.opendsu
 */
export type IoOptionsOrCallback<T> = DSUIOOptions | GenericCallback<T>;
/**
 * @typedef IoOptionsOrErrCallback
 * @memberOf core.opendsu
 */
export type IoOptionsOrErrCallback = DSUIOOptions | ErrCallback;
/**
 * @typedef IoOptionsOrDSUCallback
 * @memberOf core.opendsu
 */
export type IoOptionsOrDSUCallback = DSUIOOptions | SimpleDSUCallback;
/**
 * @typedef AnchoringOptsOrCallback
 * @memberOf core.opendsu
 */
export type AnchoringOptsOrCallback<T> = DSUAnchoringOptions | GenericCallback<T>;
/**
 * @typedef AnchoringOptsOrErrCallback
 * @memberOf core.opendsu
 */
export type AnchoringOptsOrErrCallback = DSUAnchoringOptions | ErrCallback;
/**
 * @typedef AnchoringOptsOrDSUCallback
 * @memberOf core.opendsu
 */
export type AnchoringOptsOrDSUCallback = DSUAnchoringOptions | SimpleDSUCallback;


/**
 * Exposes an interface with the OpenDSU Archive APi
 *
 * @interface
 * @memberOf core.opendsu
 */
export interface DSU {
    directAccessEnabled: boolean;

    enableDirectAccess(callback: ErrCallback): void;

    // From Docs
    getCreationSSI(plain?: boolean): string
    getKeySSIAsObject(keySSIType?: string | KeySSICallback, callback?: KeySSICallback): void
    getKeySSIAsString(keySSIType?: string | GenericCallback<string>, callback?: GenericCallback<string>): void

    // Mounting
    // getManifest(): void
    getSSIForMount(mountPoint: string, callback: GenericCallback<string>): void;
    listMountedDSUs(mountPoint: string, callback: GenericCallback<{path: string, identifier: string}[]>): void;
    mount(mountingPoint: string, archiveSSI: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
    unmount(mountPoint: string, callback: ErrCallback): void;

    // IO
    getArchiveForPath(dsuPath: string, callback: ErrCallback): void;
    listFiles(dsuPath: string, options?: IoOptionsOrCallback<string[]>, callback?: GenericCallback<string[]>): void;
    listFolders(dsuPath: string, options?: IoOptionsOrCallback<string[]>, callback?: GenericCallback<string[]>): void;
    readDir(dsuPath: string, options?: IoOptionsOrCallback<{}>, callback?: GenericCallback<{}>): void;
    cloneFolder(srcPath: string, destPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
    createFolder(dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
    delete(dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
    rename(srcPath: string, destPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    appendToFile(dsuPath: string, data: any, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
    createReadStream(dsUpath: string, options?: IoOptionsOrCallback<any>, callback?: GenericCallback<any>): void;
    dsuLog(message: string, callback: ErrCallback): void;
    readFile(path: string, options?: IoOptionsOrCallback<any>, callback?: GenericCallback<any>): void;
    writeFile(path: string, data: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;

    // Batch
    batch(batchFn: () => any, callback: ErrCallback): void;
    batchInProgress(): boolean;
    beginBatch(): void;
    cancelBatch(callback: ErrCallback): void;
    commitBatch(onConflict?: () => any | ErrCallback, callback?: ErrCallback): void;

    // FS
    addFile(fsPath: string, dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
    addFiles(fsPath: string[], dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
    addFolder(fsPath: string, dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
    extractFile(fsPath: string, dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
    extractFolder(fsPath: string, dsuPath: string, options?: IoOptionsOrErrCallback, callback?: ErrCallback): void;
}
/**
 * Exposes an interface with the OpenDSU WalletDSU APi
 *
 * @interface
 * @memberOf core.opendsu
 */
export interface WalletDsu extends DSU {
    getWritableDSU(): DSU;
}


/**
 * Exposes an interface with the OpenDSU APi
 *
 * @interface
 * @memberOf core.opendsu
 */
export interface OpenDSU {
    constants: ConstantsApi;

    loadApi(api: string): OpenDSUApi;
}

/**
 * Exposes an Union Type will all mapped OpenDSU Apis
 *
 * @type OpenDSUApi
 * @memberOf core.opendsu
 */
export type OpenDSUApi = StorageApi | M2DsuApi | MessageQueueApi | NotificationsApi | OAuthApi | OpenDSUWorkersApi | OpenDSUUtilsApi | AnchoringApi | ErrorApi | ResolverApi | KeyssiApi | SystemApi | HttpApi | SecurityContextApi | W3cDIDApi | DBApi | EnclaveApi | BdnsApi | ConfigApi | CacheApi | ContractsApi | CrypoApi;
