import {AnchoringOptsOrDSUCallback, DSUFactory, DSUHandler, SimpleDSUCallback} from "../types";
import {KeySSI} from "./keyssi";

/**
 * Interface representing the OpenDSU 'resolver' Api Space
 *
 * @interface ResolverApi
 *
 * @memberOf core.opendsu.api
 */
export interface ResolverApi {
    createDSU(keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback): void;
    createDSUForExistingSSI(keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback): void;
    getDSUHandler(keySSI: KeySSI) : DSUHandler;
    invalidateDSUCache(keySSI: KeySSI): void;
    loadDSU(keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback): void;
    registerDSUFactory(type: string, factory: DSUFactory): void;
}