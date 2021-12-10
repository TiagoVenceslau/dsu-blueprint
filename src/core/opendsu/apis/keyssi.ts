import {GenericCallback} from "../types";

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

export interface sReadSSI extends KeySSI {

}

export interface ArraySSI extends KeySSI {

}

export interface WalletSSI extends KeySSI {
}

export type KeySSICallback = GenericCallback<KeySSI>;

export enum KeySSIType {
    SEED = "seed",
    ARRAY = "array",
    CONST = "const",
    WALLET = "wallet"
}

export interface KeyssiApi {
    createArraySSI(domain: string, args?: string[], vn?: string, hint?: string): ArraySSI;
    createTemplateSeedSSI(domain: string, specificString?: string, control?: string, vn?: string, hint?: string): SeedSSI;
    createTemplateWalletSSI(domain: string, credentials?: string[], hint?: string): WalletSSI;
    createTemplateKeySSI(ssiType: string, domain: string, specificString?: string, control?: string, vn?: string, hint?: string): KeySSI;
    createSeedSSI(domain: string, vn?: string | KeySSICallback, hint?: string | KeySSICallback, callback?: KeySSICallback): SeedSSI;
    parse(ssiString: string, options?: {}): KeySSI
}