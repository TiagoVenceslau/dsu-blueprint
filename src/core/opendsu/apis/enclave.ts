import {GenericCallback} from "../types";
import {DSUDid} from "./w3cdid";
import {KeySSI, KeySSICallback} from "./keyssi";
import {DIDCallback} from "./crypto";

/**
 * @namespace dsu-blueprint.core.opendsu.api.enclave
 * @memberOf dsu-blueprint.core.opendsu.api
 */

/**
 * @interface DSUEnclave
 * @memberOf dsu-blueprint.core.opendsu.api.enclave
 */
export interface DSUEnclave {
    /**
     *
     * @param forDID
     * @param callback
     *
     * @methodOf DSUEnclave
     */
    getKeySSI(forDID: DSUDid, callback: KeySSICallback): void;

    /**
     * @methodOf DSUEnclave
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
 * @memberOf dsu-blueprint.core.opendsu.api.enclave
 */
export interface HighSecurityProxy{
    getDID(callback: DIDCallback): void;
}
/**
 * @interface ApiHubSecurityProxy
 *
 * @memberOf dsu-blueprint.core.opendsu.api.enclave
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
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface EnclaveApi {
    /**
     *
     * @param {KeySSI} keySSI
     * @param {DSUDid} did
     *
     * @return DSUEnclave
     *
     * @methodOf EnclaveApi
     */
    initialiseWalletDBEnclave(keySSI: KeySSI, did: DSUDid): DSUEnclave;
    /**
     * @return DSUEnclave
     *
     * @methodOf EnclaveApi
     */
    initialiseMemoryEnclave(): DSUEnclave;
    /**
     *
     * @param {string} domain
     * @param {DSUDid} did
     *
     * @return ApiHubSecurityProxy
     *
     * @methodOf EnclaveApi
     */
    initialiseAPIHUBProxy(domain: string, did: DSUDid): ApiHubSecurityProxy;
    /**
     *
     * @param {string} domain
     * @param {DSUDid} did
     *
     * @return HighSecurityProxy
     *
     * @methodOf EnclaveApi
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
     * @methodOf EnclaveApi
     */
    createEnclave(enclaveType: string, ...args: any[]): DSUEnclave;
    /**
     *
     * @param {string} enclaveType
     * @param {{new: DSUEnclave}} enclaveConstructor
     *
     * @methodOf EnclaveApi
     */
    registerEnclave(enclaveType: string, enclaveConstructor: {new(): DSUEnclave}): void;
}
