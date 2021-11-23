import {Err} from "@tvenceslau/db-decorators/lib";

export type ObjectCallback = (err?: Err, object?: any) => void;
export type ErrCallback = (err?: Err) => void;

export interface OpenDSU {
    loadApi(api: string): {[indexer: string]: any}
}

export interface KeySSI{
    // From Docs
    autoload(identifier: string): void;
    cast(newType: string): void;
    clone(): KeySSI;
    getAnchorId(): string;
    getControl(): string;
    getDLDomain(): string;
    getDSURepresentationName(): string;
    getHint(): string;
    getIdentifier(plain?: boolean): string;
    getName(): string;
    getRelatedType(ssiType: string, callback: KeySSICallback): void;
    getSpecificationString(): string;
    getVn(): string;
    load(subtype: string, dlDomain: string, subtypeSpecificString: string, control: string, vn: string, hint: string): void;
}

export type GenericCallback<T> = (err?: Err, result?: T, ...args: any[]) => void;

export type KeySSICallback = GenericCallback<KeySSI>;

export type DSUIOOptions = {
    embedded?: boolean,
    encrypt?: boolean,
    ignoreMounts?: boolean,
    recursive?: boolean
}

export const DefaultIOOptions: DSUIOOptions = {
    embedded: false,
    encrypt: true,
    ignoreMounts: true,
    recursive: true
}

export type IoOptionsOrCallback<T> = DSUIOOptions | GenericCallback<T>;
export type IoOptionsOrErrCallback = DSUIOOptions | ErrCallback;

export interface DSU {
    directAccessEnabled: boolean;

    enableDirectAccess(callback: ErrCallback): void;

    // From Docs
    getCreationSSI(plain?: boolean): string
    getKeySSIAsObject(keySSIType?: string, callback?: KeySSICallback): void
    getKeySSIAsString(keySSIType?: string, callback?: GenericCallback<string>): void

    // Mounting
    // getManifest(): void
    getSSIForMount(mountPoint: string, callback: GenericCallback<string>): void;
    listMountedDSUs(mountPoint: string, callback: GenericCallback<any[]>): void;
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

export interface DSUStorage extends DSU {
    getObject(path: string, callback: ObjectCallback): void;
    setObject(path: string, data: any, callback: ErrCallback): void;
}

export enum KeySSIType {
    TEST = "test"
}