import {
    ErrCallback, GenericCallback
} from "../types";
import {Callback} from "@tvenceslau/db-decorators/lib";
import {KeySSI} from "./keyssi";
import {EnclaveCallback} from "./enclave";

/**
 * @namespace core.opendsu.api.db
 * @memberOf core.opendsu.api
 */

/**
 * @typedef DSUDbRecord
 * @memberOf core.opendsu.api.db
 */
export type DSUDbRecord = {[indexer: string]: any};

/**
 * @typedef RecordCallback
 * @memberOf core.opendsu.api.db
 */
export type RecordCallback = GenericCallback<DSUDbRecord>;

/**
 * @typedef MultipleRecordCallback
 * @memberOf core.opendsu.api.db
 */
export type MultipleRecordCallback = GenericCallback<DSUDbRecord[]>;

/**
 * @interface DSUDatabase
 * @memberOf core.opendsu.api.db
 */
export interface DSUDatabase {
    /**
     *
     * @param {string} tableName
     * @param {MultipleRecordCallback} callback
     *
     * @memberOf DSUDatabase
     */
    getAllRecords(tableName: string, callback: MultipleRecordCallback): void;

    /**
     *
     * @param {string} tableName
     * @param {RecordCallback} callback
     *
     * @memberOf DSUDatabase
     */
    addIndex(tableName: string, callback: Callback): void;

    /**
     *
     * @param {string} tableName
     * @param {string[]} query
     * @param {string | undefined} sort
     * @param {string | undefined} limit
     * @param {MultipleRecordCallback} callback
     *
     * @memberOf DSUDatabase
     */
    filter(tableName: string, query: string[], sort: string | undefined, limit: number | undefined, callback: MultipleRecordCallback): void;

    /**
     *
     * @param {string} tableName
     * @param {string[]} query
     * @param {string | undefined} sort
     * @param {string | undefined} limit
     * @param {MultipleRecordCallback} callback
     *
     * @memberOf DSUDatabase
     */
    query(tableName: string, query: string[], sort: string | undefined, limit: number | undefined, callback: MultipleRecordCallback): void;

    /**
     *
     * @param {string} tableName
     * @param {string | number} key
     * @param {DSUDbRecord} record
     * @param {RecordCallback} callback
     *
     * @memberOf DSUDatabase
     */
    insertRecord(tableName: string, key: string | number, record: {}, callback: RecordCallback): void;

    /**
     *
     * @param {string} tableName
     * @param {string | number} key
     * @param {DSUDbRecord} record
     * @param {RecordCallback} callback
     *
     * @memberOf DSUDatabase
     */
    updateRecord(tableName: string, key: string | number, record: {}, callback: RecordCallback): void;
    /**
     *
     * @param {string} tableName
     * @param {string | number} key
     * @param {RecordCallback} callback
     *
     * @memberOf DSUDatabase
     */
    getRecord(tableName: string, key: string | number, callback: RecordCallback): void;

    /**
     *
     * @param {string} tableName
     * @param {string | number} key
     * @param {RecordCallback} callback
     *
     * @memberOf DSUDatabase
     */
    deleteRecord(tableName: string, key: string | number, callback: RecordCallback): void;

    /**
     *
     * @param {string} tableName
     * @param {string | number} key
     * @param {Callback} callback
     *
     * @memberOf DSUDatabase
     */
    getHistory(tableName: string, key: string | number, callback: Callback): void;

    /**
     *
     * @param {DSUDbRecord} record
     *
     * @memberOf DSUDatabase
     */
    getRecordedVersions(record: DSUDbRecord): any[];

    /**
     *
     * @param {string} tableName
     * @param {Callback} callback
     *
     * @memberOf DSUDatabase
     */
    getIndexedFields(tableName: string, callback: Callback): void;

    // Simple key-pair db methods
    /**
     *
     * @param {string | number} key
     * @param {any} value
     * @param {ErrCallback} callback
     *
     * @memberOf DSUDatabase
     */
    writeKey(key: string | number, value: any, callback: ErrCallback): void;

    /**
     *
     * @param {string | number} key
     * @param {Callback} callback
     *
     * @memberOf DSUDatabase
     */
    readKey(key: string | number, callback: Callback): void;

    // Batch Methods
    /**
     * @memberOf DSUDatabase
     */
    beginBatch(): void;

    /**
     *
     * @param {ErrCallback} callback
     * @memberOf DSUDatabase
     *
     */
    cancelBatch(callback: ErrCallback): void;

    /**
     *
     * @param {function(): any} onConflict
     * @param {ErrCallback} callback
     *
     * @memberOf DSUDatabase
     */
    commitBatch(onConflict?: () => any | ErrCallback, callback?: ErrCallback): void;
}

/**
 * @typedef DBCallback
 * @memberOf core.opendsu.api.db
 */
export type DBCallback = GenericCallback<DSUDatabase>;

/**
 * Interface representing the OpenDSU 'db' Api Space
 *
 * @interface DBApi
 *
 * @memberOf core.opendsu.api
 */
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