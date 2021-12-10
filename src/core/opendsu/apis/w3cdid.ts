import {Callback} from "@tvenceslau/db-decorators/lib";

export interface DSUDid{

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
