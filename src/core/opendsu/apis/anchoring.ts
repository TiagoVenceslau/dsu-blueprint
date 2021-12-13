import {KeySSI} from "./keyssi";
import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * Interface representing the OpenDSU 'anchoring' Api Space
 *
 * @interface AnchoringApi
 *
 * @memberOf core.opendsu.api
 */
export interface AnchoringApi {
    createAnchor(dsuKeySSI: KeySSI, callback: Callback): void;
    createNFT(nftKeySSI: KeySSI, callback: Callback): void;
    appendToAnchor(dsuKeySSI: KeySSI, newShlSSI: KeySSI, previousShlSSI: KeySSI, zkpValue: any, callback: Callback): void;
    transferTokenOwnership(nftKeySSI: KeySSI, ownershipSSI: KeySSI, callback: Callback): void;
    getAllVersions(keySSI: KeySSI, authToken: string, callback: Callback): void;
    getLastVersion(keySSI: KeySSI, authToken: string, callback: Callback): void;
    getLatestVersion(domain: string, ...args: any[]): any;
}