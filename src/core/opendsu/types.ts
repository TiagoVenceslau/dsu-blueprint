import {Callback, Err} from "@tvenceslau/db-decorators/lib";
import {DSUCallback} from "../repository";

export type ObjectCallback = (err?: Err, object?: any) => void;
export type ErrCallback = (err?: Err) => void;

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

// DSUs

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

export interface WalletDsu extends DSU {
    getWritableDSU(): DSU;
}

// OpenDSU Apis

export interface OpenDSU {
    loadApi(api: string): {[indexer: string]: any}
}

export interface ResolverApi {
    createDSU(keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback): void;
    createDSUForExistingSSI(keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback): void;
    getDSUHandler(keySSI: KeySSI) : DSUHandler;
    invalidateDSUCache(keySSI: KeySSI): void;
    loadDSU(keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback): void;
    registerDSUFactory(type: string, factory: DSUFactory): void;
}

export interface KeyssiApi {
    createArraySSI(domain: string, args?: string[], vn?: string, hint?: string): ArraySSI;
    createTemplateSeedSSI(domain: string, specificString?: string, control?: string, vn?: string, hint?: string): SeedSSI;
    createTemplateWalletSSI(domain: string, credentials?: string[], hint?: string): WalletSSI;
    createTemplateKeySSI(ssiType: string, domain: string, specificString?: string, control?: string, vn?: string, hint?: string): KeySSI;
    createSeedSSI(domain: string, vn?: string | KeySSICallback, hint?: string | KeySSICallback, callback?: KeySSICallback): SeedSSI;
    parse(ssiString: string, options?: {}): KeySSI
}

export interface SystemApi {
    getEnvironmentVariable(name: string): any,
    setEnvironmentVariable(name: string, value: any): void,
    getFS(): any,
    getPath(): any,
    getBaseURL(): string
}

export interface HttpApi {
    fetch(url: string, options?: {}): Promise<any>;
    doGet(url: string, options: {} | undefined, callback: Callback): void;
    doPost(url: string, options: {} | undefined, callback: Callback): void;
    doPut(url: string, options: {} | undefined, callback: Callback): void;
}

export interface DSUSecurityContext{
    registerDID(didDocument: any, callback: Callback): void
    addPrivateKeyForDID(didDocument: any, privateKey: any, callback: Callback): void;
    registerKeySSI(forDID: any, keySSI: KeySSI, callback: Callback): void;
    signForKeySSI(forDID: any, keySSI: KeySSI, data: any, callback: Callback): void;
    signAsDid(didDocument: any, data: any, callback: Callback): void;
    verifyForDID(didDocument: any, data: any, signature: any, callback: Callback): void;
    encryptForDID(senderDIDDocument: any, receiverDIDDocument: any, message: any, callback: Callback): void;
    decryptAsDID(didDocument: any, encryptedMessage: any, callback: Callback): void;
    isInitialized(): boolean;
    getDB(callback: Callback): void;
    getDSU(callback: Callback): void;
    getMainEnclaveDB(asDID: any, callback: Callback): void;
    getSharedEnclaveDB(asDID: any, callback: Callback): void;
}

export interface SecurityContextApi{
    getMainDSU(mainDSU: DSU): void,
    setMainDSU(callback: SimpleDSUCallback): void,
    getVaultDomain(callback: GenericCallback<string>): void,
    getSecurityContext(): DSUSecurityContext,
    refreshSecurityContext() : DSUSecurityContext,
    getDIDDomain(callback: GenericCallback<string>): void,
    securityContextIsInitialised(): boolean
}

export interface CryptographicSkillsApi {
    registerSkills(didMethod: string, skills: any): void;
    applySkills(didMethod: string, skillName: string, ...args: any[]): any;
    NAMES: {}
}

export interface W3cDIDApi{
    createIdentity(didMethod: string, ...args: any[]): any;
    resolveDID(identifier: any, callback: Callback): void;
    registerDIDMethod(method: any, implementation: any): void;
    CryptographicSkills: CryptographicSkillsApi
}

export type DSUDbRecord = {[indexer: string]: any};

export type RecordCallback = GenericCallback<DSUDbRecord>;
export type MultipleRecordCallback = GenericCallback<DSUDbRecord[]>;

export interface DSUDatabase {
    getAllRecords(tableName: string, callback: MultipleRecordCallback): void;
    addIndex(tableName: string, callback: Callback): void;
    filter(tableName: string, query: string[], sort: string | undefined, limit: number | undefined, callback: MultipleRecordCallback): void;
    query(tableName: string, query: string[], sort: string | undefined, limit: number | undefined, callback: MultipleRecordCallback): void;
    insertRecord(tableName: string, key: string | number, record: {}, callback: RecordCallback): void;
    updateRecord(tableName: string, key: string | number, record: {}, callback: RecordCallback): void;
    getRecord(tableName: string, key: string | number, callback: RecordCallback): void;
    deleteRecord(tableName: string, key: string | number, callback: RecordCallback): void;
    getHistory(tableName: string, key: string | number, callback: Callback): void;
    getRecordedVersions(record: DSUDbRecord): [];
    getIndexedFields(tableName: string, callback: Callback): void;

    // Simple key-pair db methods
    writeKey(key: string | number, value: any, callback: ErrCallback): void;
    readKey(key: string | number, callback: Callback): void;

    // Batch Methods
    beginBatch(): void;
    cancelBatch(callback: ErrCallback): void;
    commitBatch(onConflict?: () => any | ErrCallback, callback?: ErrCallback): void;
}

export type DBCallback = GenericCallback<DSUDatabase>;

export interface DSUEnclave {
    getKeySSI(forDID: any, callback: KeySSICallback): void;
    isInitialized(): boolean;

}

export type EnclaveCallback = GenericCallback<DSUEnclave>;

export interface DBApi {
    getBasicDB(storageStrategy?: any, conflictSolvingStrategy?: any): DSUDatabase;

    /**
     *
     * @param {KeySSI} keySSI
     * @param {string} dbName
     * @deprecated
     */
    getWalletDB(keySSI: KeySSI, dbName: string): DSUDatabase;
    getSimpleWalletDB(dbName: string): DSUDatabase,
    // /**
    //  * @not implemented
    //  */
    // getMultiUserDB,
    getSharedDB(keySSI: KeySSI, dbName: string): DSUDatabase,
    getInMemoryDB(): DSUDatabase,

    // /**
    //  * @not implemented
    //  */
    // getEnclaveDB(): void,
    getMainEnclaveDB(callback: DBCallback): void
    getMainEnclave(callback: EnclaveCallback): void
    mainEnclaveIsInitialised(): boolean,
    getSharedEnclave(callback: EnclaveCallback): void
    getSharedEnclaveDB(callback: DBCallback): void
}

export interface HighSecurityProxy{
    getDID(callback: Callback): void;
}
export interface ApiHubSecurityProxy{
    getDID(callback: Callback): void;
    isInitialized(): boolean;
}

export interface EnclaveApi {
    initialiseWalletDBEnclave(keySSI: KeySSI, did: any): DSUEnclave;
    initialiseMemoryEnclave(): DSUEnclave;
    initialiseAPIHUBProxy(domain: string, did: any): ApiHubSecurityProxy;
    initialiseHighSecurityProxy(domain: string, did: any): HighSecurityProxy;
    // /**
    //  * @not implemented
    //  */
    // connectEnclave,
    createEnclave(enclaveType: string, ...args: any[]): DSUEnclave;
    registerEnclave(enclaveType: string, enclaveConstructor: any): void;
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