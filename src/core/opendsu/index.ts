import {KeySSI} from "./apis/keyssi";
import {Callback} from "@tvenceslau/db-decorators/lib";

export * from './opendsu';
export * from './types';

export interface AnchoringAPI {
    createAnchor(dsuKeySSI: KeySSI, callback: Callback): void;
    createNFT(nftKeySSI: KeySSI, callback: Callback): void;
    appendToAnchor(dsuKeySSI: KeySSI, newShlSSI: KeySSI, previousShlSSI: KeySSI, zkpValue: any, callback: Callback): void;
    transferTokenOwnership(nftKeySSI: KeySSI, ownershipSSI: KeySSI, callback: Callback): void;
    getAllVersions(keySSI: KeySSI, authToken: string, callback: Callback): void
    getLastVersion(keySSI: KeySSI, authToken: string, callback: Callback): void;
    getLatestVersion(domain: string, ...args: any[]): any;
}