import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * @namespace core.opendsu.api.w3cdid
 * @memberOf core.opendsu.api
 */

/**
 * @interface DSUDid
 *
 * @memberOf core.opendsu.api.w3cdid
 */
export interface DSUDid{

}
/**
 * @interface CryptographicSkillsApi
 *
 * @memberOf core.opendsu.api.w3cdid
 */
export interface CryptographicSkillsApi {
    registerSkills(didMethod: string, skills: any): void;
    applySkills(didMethod: string, skillName: string, ...args: any[]): any;
    NAMES: {}
}

/**
 * Interface representing the OpenDSU 'w3cdid' Api Space
 *
 * @interface W3cDIDApi
 *
 * @memberOf core.opendsu.api
 */
export interface W3cDIDApi{
    createIdentity(didMethod: string, ...args: any[]): any;
    resolveDID(identifier: any, callback: Callback): void;
    registerDIDMethod(method: any, implementation: any): void;
    CryptographicSkills: CryptographicSkillsApi
}
