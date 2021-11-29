import {Callback, Err} from "@tvenceslau/db-decorators/lib";

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
    getTypeName(): string;
    getRelatedType(ssiType: string, callback: KeySSICallback): void;
    getSpecificationString(): string;
    getVn(): string;
    load(subtype: string, dlDomain: string, subtypeSpecificString: string, control: string, vn: string, hint: string): void;

    // Undocumented?? really?
    derive(): KeySSI;
}

export interface SeedSSI extends KeySSI {

}

export interface ArraySSI extends KeySSI {

}

export interface WalletSSI extends KeySSI {
    getWritableDSU(): DSU;
}

export type GenericCallback<T> = (err?: Err, result?: T, ...args: any[]) => void;

export type KeySSICallback = GenericCallback<KeySSI>;

export type SimpleDSUCallback = GenericCallback<DSU>;

export type DSUIOOptions = {
    embedded?: boolean,
    encrypt?: boolean,
    ignoreMounts?: boolean,
    recursive?: boolean
}

export type DSUAnchoringOptions = {
    dsuTypeSSI?: string
}

export const DefaultIOOptions: DSUIOOptions = {
    embedded: false,
    encrypt: true,
    ignoreMounts: true,
    recursive: true
}

export interface DSUHandler{}
export interface DSUFactory{}

export type IoOptionsOrCallback<T> = DSUIOOptions | GenericCallback<T>;
export type IoOptionsOrErrCallback = DSUIOOptions | ErrCallback;
export type IoOptionsOrDSUCallback = DSUIOOptions | SimpleDSUCallback;

export type AnchoringOptsOrCallback<T> = DSUAnchoringOptions | GenericCallback<T>;
export type AnchoringOptsOrErrCallback = DSUAnchoringOptions | ErrCallback;
export type AnchoringOptsOrDSUCallback = DSUAnchoringOptions | SimpleDSUCallback;

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

export interface Resolver {
    createDSU(keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback): void;
    createDSUForExistingSSI(keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback): void;
    getDSUHandler(keySSI: KeySSI) : DSUHandler;
    invalidateDSUCache(keySSI: KeySSI): void;
    loadDSU(keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback): void;
    registerDSUFactory(type: string, factory: DSUFactory): void;
}

export interface Keyssi{
    createArraySSI(domain: string, args?: string[], vn?: string, hint?: string): ArraySSI;
    createTemplateSeedSSI(domain: string, specificString?: string, control?: string, vn?: string, hint?: string): SeedSSI;
    createTemplateWalletSSI(domain: string, credentials?: string[], hint?: string): WalletSSI;
    createTemplateKeySSI(ssiType: string, domain: string, specificString?: string, control?: string, vn?: string, hint?: string): KeySSI;
    createSeedSSI(domain: string, vn?: string | KeySSICallback, hint?: string | KeySSICallback, callback?: KeySSICallback): SeedSSI;
    parse(ssiString: string, options?: {}): KeySSI
}

export interface HttpDSU{
    fetch(url: string, options?: {}): Promise<any>;
    doGet(url: string, options: {} | undefined, callback: Callback): void;
    doPost(url: string, options: {} | undefined, callback: Callback): void;
    doPut(url: string, options: {} | undefined, callback: Callback): void;
}

export interface DSUStorage extends DSU {
    getObject(path: string, callback: ObjectCallback): void;
    setObject(path: string, data: any, callback: ErrCallback): void;
}

export enum KeySSIType {
    SEED = "seed",
    ARRAY = "array",
    CONST = "const",
    WALLET = "wallet"
}