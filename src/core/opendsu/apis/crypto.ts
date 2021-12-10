import {Callback} from "@tvenceslau/db-decorators/lib";
import {GenericCallback} from "../types";
import {DSUDid} from "./w3cdid";
import {KeySSI, SeedSSI, sReadSSI} from "./keyssi";

export interface AuthToken {}

export interface JWT {

}

export type DIDCallback = GenericCallback<DSUDid>;
export type TokenCallback = GenericCallback<AuthToken>;

export interface CrypoApi {
    getCryptoFunctionForKeySSI(keySSI: KeySSI, crytoFunctionTime: any): void;
    // /**
    //  * @obsolete
    //  */
    // hash,
    // /**
    //  * @obsolete
    //  */
    // hashSync,
    generateRandom(length: number): string;
    encrypt(data: any, encryptionKey: any): any;
    decrypt(data: any, encryptionKey: any): any;
    sign(keySSI: KeySSI, data: any, callback: Callback): any;
    convertDerSignatureToASN1(derSignature: any): any;
    verifySignature(keySSI: KeySSI, data: any, signature: any, publicKey: any, callback: Callback): any;
    generateEncryptionKey(keySSI: KeySSI, callback: Callback): void;
    // /**
    //  * @obsolete
    //  */
    // encode,
    // /**
    //  * @obsolete
    //  */
    // decode,
    encodeBase58(data: any): string,
    decodeBase58(data: string): any,
    sha256(dataObj: {}): string;
    createJWT(seedSSI: SeedSSI, scope: any, credentials: any, options: any, callback: Callback): JWT;
    verifyJWT(jwt: JWT, rootOfTrustVerificationStrategy: any, callback: Callback): void;
    createCredential(issuerSeedSSI: SeedSSI, credentialSubjectsReadSSI: sReadSSI, callback: Callback): void;
    createAuthToken(holderSeedSSI: SeedSSI, scope: any, credential: any, callback: TokenCallback): void;
    verifyAuthToken(jwt: JWT, listOfIssuers: [], callback: Callback): void;
    createPresentationToken(holderSeedSSI: SeedSSI, scope: any, credential: any, callback: TokenCallback): void;
    getReadableSSI(identity: any): any;
    parseJWTSegments(jwt: JWT, callback: Callback): void;
    createBloomFilter(options: {}): any;
    JWT_ERRORS: {};
    deriveEncryptionKey(password: string): any;
    convertPrivateKey(rawPrivateKey: any, outputFormat: any): any;
    convertPublicKey(rawPublicKey: any, outputFormat: any, curveName: string): any;
    ecies_encrypt_ds(senderKeySSI: KeySSI, receiverKeySSI: KeySSI, data: any): any;
    ecies_decrypt_ds(receiverKeySSI: KeySSI, data: any): any;
    createJWTForDID(did: DSUDid, scope: any, credentials: any, options: any, callback: TokenCallback): void;
    verifyDID_JWT(jwt: JWT, rootOfTrustVerificationStrategy: any, callback: Callback): void;
    verifyDIDAuthToken(jwt: JWT, listOfIssuers: [], callback: Callback): void;
    createAuthTokenForDID(holderDID: DSUDid, scope: any, credential: any, callback: Callback): void;
    createCredentialForDID(did: DSUDid, credentialSubjectDID: DSUDid, callback: Callback): void;
    base64UrlEncodeJOSE(data: any): string;
    sha256JOSE(data: any, encoding: any): string;
    // joseAPI: require("pskcrypto").joseAPI
}
