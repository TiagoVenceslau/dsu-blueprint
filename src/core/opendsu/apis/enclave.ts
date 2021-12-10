import {GenericCallback} from "../types";
import {DSUDid} from "./w3cdid";
import {KeySSI, KeySSICallback} from "./keyssi";
import {DIDCallback} from "./crypto";

export interface DSUEnclave {
    getKeySSI(forDID: DSUDid, callback: KeySSICallback): void;
    isInitialized(): boolean;

}

export type EnclaveCallback = GenericCallback<DSUEnclave>;


export interface HighSecurityProxy{
    getDID(callback: DIDCallback): void;
}
export interface ApiHubSecurityProxy{
    getDID(callback: DIDCallback): void;
    isInitialized(): boolean;
}

export interface EnclaveApi {
    initialiseWalletDBEnclave(keySSI: KeySSI, did: DSUDid): DSUEnclave;
    initialiseMemoryEnclave(): DSUEnclave;
    initialiseAPIHUBProxy(domain: string, did: DSUDid): ApiHubSecurityProxy;
    initialiseHighSecurityProxy(domain: string, did: DSUDid): HighSecurityProxy;
    // /**
    //  * @not implemented
    //  */
    // connectEnclave,
    createEnclave(enclaveType: string, ...args: any[]): DSUEnclave;
    registerEnclave(enclaveType: string, enclaveConstructor: any): void;
}
