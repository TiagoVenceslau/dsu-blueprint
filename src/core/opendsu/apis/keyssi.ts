import {GenericCallback} from "../types";

/**
 * @namespace core.opendsu.api.keyssi
 * @memberOf core.opendsu.api
 */

/**
 * @interface KeySSI
 *
 * @memberOf core.opendsu.api.keyssi
 */
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

/**
 * @interface SeedSSI
 *
 * @memberOf core.opendsu.api.keyssi
 */
export interface SeedSSI extends KeySSI {

}
/**
 * @interface sReadSSI
 *
 * @memberOf core.opendsu.api.keyssi
 */

export interface sReadSSI extends KeySSI {

}

/**
 * @interface ArraySSI
 *
 * @memberOf core.opendsu.api.keyssi
 */
export interface ArraySSI extends KeySSI {

}

/**
 * @interface WalletSSI
 *
 * @memberOf core.opendsu.api.keyssi
 */
export interface WalletSSI extends KeySSI {
}

/**
 * @interface ConstSSI
 *
 * @memberOf core.opendsu.api.keyssi
 */
export interface ConstSSI extends KeySSI {
}

/**
 * @typedef ArraySSISpecificArgs
 * @memberOf core.opendsu.api.keyssi
 */
export type ArraySSISpecificArgs = [vn: string, hint: string];
/**
 * @typedef WalletSSISpecificArgs
 * @memberOf core.opendsu.api.keyssi
 */
export type WalletSSISpecificArgs = [hint: string];
/**
 * @typedef SeedSSISpecificArgs
 * @memberOf core.opendsu.api.keyssi
 */
export type SeedSSISpecificArgs = [specificString: string, control: string, vn: string, hint: string];
/**
 * @typedef KeySSISpecificArgs
 * @memberOf core.opendsu.api.keyssi
 */
export type KeySSISpecificArgs = ArraySSISpecificArgs | WalletSSISpecificArgs | SeedSSISpecificArgs;
/**
 * @typedef KeySSICallback
 * @memberOf core.opendsu.api.keyssi
 */
export type KeySSICallback = GenericCallback<KeySSI>;

/**
 * @enum KeySSIType
 * @memberOf core.opendsu.api.keyssi
 */
export enum KeySSIType {
    SEED = "seed",
    ARRAY = "array",
    CONST = "const",
    WALLET = "wallet",
    sREAD = "sread"
}

/**
 * Interface representing the OpenDSU 'keyssi' Api Space
 *
 * @interface KeyssiApi
 *
 * @memberOf core.opendsu.api
 */
export interface KeyssiApi {
    createArraySSI(domain: string, args?: string[], vn?: string, hint?: string): ArraySSI;
    createTemplateSeedSSI(domain: string, specificString?: string, control?: string, vn?: string, hint?: string): SeedSSI;
    createTemplateWalletSSI(domain: string, credentials?: string[], hint?: string): WalletSSI;
    createTemplateKeySSI(ssiType: string, domain: string, specificString?: string, control?: string, vn?: string, hint?: string): KeySSI;
    createSeedSSI(domain: string, vn?: string | KeySSICallback, hint?: string | KeySSICallback, callback?: KeySSICallback): SeedSSI;
    parse(ssiString: string, options?: {}): KeySSI
}