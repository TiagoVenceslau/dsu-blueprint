import {
    ErrCallback, GenericCallback
} from "../types";
import {Callback} from "@tvenceslau/db-decorators/lib";
import {KeySSI} from "./keyssi";
import {EnclaveCallback} from "./enclave";

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