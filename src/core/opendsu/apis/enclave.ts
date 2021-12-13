import {GenericCallback} from "../types";
import {DSUDid} from "./w3cdid";
import {KeySSI, KeySSICallback} from "./keyssi";
import {DIDCallback} from "./crypto";

/**
 * @namespace core.opendsu.api.enclave
 * @memberOf core.opendsu.api
 */

/**
 * @interface DSUEnclave
 * @memberOf core.opendsu.api.enclave
 */
export interface DSUEnclave {
    /**
     *
     * @param forDID
     * @param callback
     *
     * @memberOf DSUEnclave
     */
    getKeySSI(forDID: DSUDid, callback: KeySSICallback): void;

    /**
     * @memberOf DSUEnclave
     */
    isInitialized(): boolean;

}

/**
 * @typedef EnclaveCallback
 *
 * @memberOf  core.opendsu.api.enclave
 */
export type EnclaveCallback = GenericCallback<DSUEnclave>;

/**
 * @interface HighSecurityProxy
 *
 * @memberOf core.opendsu.api.enclave
 */
export interface HighSecurityProxy{
    getDID(callback: DIDCallback): void;
}
/**
 * @interface ApiHubSecurityProxy
 *
 * @memberOf core.opendsu.api.enclave
 */
export interface ApiHubSecurityProxy{
    getDID(callback: DIDCallback): void;
    isInitialized(): boolean;
}

/**
 * Interface representing the OpenDSU 'enclave' Api Space
 *
 * @interface EnclaveApi
 *
 * @memberOf core.opendsu.api
 */
export interface EnclaveApi {
    /**
     *
     * @param {KeySSI} keySSI
     * @param {DSUDid} did
     *
     * @return DSUEnclave
     *
     * @memberOf EnclaveApi
     */
    initialiseWalletDBEnclave(keySSI: KeySSI, did: DSUDid): DSUEnclave;
    /**
     * @return DSUEnclave
     *
     * @memberOf EnclaveApi
     */
    initialiseMemoryEnclave(): DSUEnclave;
    /**
     *
     * @param {string} domain
     * @param {DSUDid} did
     *
     * @return ApiHubSecurityProxy
     *
     * @memberOf EnclaveApi
     */
    initialiseAPIHUBProxy(domain: string, did: DSUDid): ApiHubSecurityProxy;
    /**
     *
     * @param {string} domain
     * @param {DSUDid} did
     *
     * @return HighSecurityProxy
     *
     * @memberOf EnclaveApi
     */
    initialiseHighSecurityProxy(domain: string, did: DSUDid): HighSecurityProxy;
    // /**
    //  * @not implemented
    //  */
    // connectEnclave,
    /**
     *
     * @param {string} enclaveType
     * @param {any[]} args
     *
     * @return DSUEnclave
     *
     * @memberOf EnclaveApi
     */
    createEnclave(enclaveType: string, ...args: any[]): DSUEnclave;
    /**
     *
     * @param {string} enclaveType
     * @param {{new: DSUEnclave}} enclaveConstructor
     *
     * @memberOf EnclaveApi
     */
    registerEnclave(enclaveType: string, enclaveConstructor: {new(): DSUEnclave}): void;
}
