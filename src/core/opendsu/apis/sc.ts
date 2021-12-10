import {Callback} from "@tvenceslau/db-decorators/lib";
import {DSU, GenericCallback, SimpleDSUCallback} from "../types";
import {DSUDid} from "./w3cdid";
import {KeySSI} from "./keyssi";

export interface DSUSecurityContext{
    registerDID(didDocument: DSUDid, callback: Callback): void
    addPrivateKeyForDID(didDocument: DSUDid, privateKey: any, callback: Callback): void;
    registerKeySSI(forDID: DSUDid, keySSI: KeySSI, callback: Callback): void;
    signForKeySSI(forDID: DSUDid, keySSI: KeySSI, data: any, callback: Callback): void;
    signAsDid(didDocument: DSUDid, data: any, callback: Callback): void;
    verifyForDID(didDocument: DSUDid, data: any, signature: any, callback: Callback): void;
    encryptForDID(senderDIDDocument: DSUDid, receiverDIDDocument: DSUDid, message: any, callback: Callback): void;
    decryptAsDID(didDocument: DSUDid, encryptedMessage: any, callback: Callback): void;
    isInitialized(): boolean;
    getDB(callback: Callback): void;
    getDSU(callback: Callback): void;
    getMainEnclaveDB(asDID: DSUDid, callback: Callback): void;
    getSharedEnclaveDB(asDID: DSUDid, callback: Callback): void;
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

