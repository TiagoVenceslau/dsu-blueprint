import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * @namespace dsu-blueprint.core.opendsu.api.w3cdid
 * @memberOf dsu-blueprint.core.opendsu.api
 */

/**
 * @interface DSUDid
 *
 * @memberOf dsu-blueprint.core.opendsu.api.w3cdid
 */
export interface DSUDid{

}
/**
 * @interface CryptographicSkillsApi
 *
 * @memberOf dsu-blueprint.core.opendsu.api.w3cdid
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
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface W3cDIDApi{
    createIdentity(didMethod: string, ...args: any[]): any;
    resolveDID(identifier: any, callback: Callback): void;
    registerDIDMethod(method: any, implementation: any): void;
    CryptographicSkills: CryptographicSkillsApi
}
