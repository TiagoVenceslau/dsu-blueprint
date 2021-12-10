import {CriticalError} from "@tvenceslau/db-decorators/lib";
import {DSUAnchoringOptions, OpenDSU} from "./types";
import {ResolverApi} from "./apis/resolver";
import {KeyssiApi, KeySSIType} from "./apis/keyssi";
import {HttpApi} from "./apis/http";

/**
 * Handles the integration with the OpenDSU Framework
 * @namespace openDSU
 * @memberOf dsu-blueprint
 */

let openDSU: OpenDSU;

/**
 * @return OpenDSU the {@link OpenDSU} object;
 * @throws {CriticalError} when it fails to load
 * @namespace OpenDSU
 */
export function getOpenDSU(): OpenDSU {
    if (!openDSU){
        try{
            openDSU = require('opendsu');
        } catch (e) {
            throw new CriticalError(`Could not load OpenDSU`)
        }
    }

    return openDSU;
}

let resolver: ResolverApi;


/**
 * @return ResolverApi the {@link ResolverApi} object;
 * @throws {CriticalError} when it fails to load
 * @namespace OpenDSU
 */
export function getResolver(): ResolverApi{
    if (!resolver)
        try {
            resolver = getOpenDSU().loadApi('resolver') as ResolverApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Resolver: ${e.message | e}`);
        }

    return resolver;
}

let keyssi: KeyssiApi;

/**
 * @return KeyssiApi the {@link KeyssiApi} object;
 * @throws {CriticalError} when it fails to load
 * @namespace OpenDSU
 */
export function getKeySsiSpace(): KeyssiApi{
    if (!keyssi)
        try {
            keyssi = getOpenDSU().loadApi('keyssi') as KeyssiApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU KeySSI Space: ${e.message | e}`);
        }

    return keyssi;
}
let $$Cache: any = undefined;

export function get$$(){
    if (!$$Cache)
        try {
            // @ts-ignore
            $$Cache = $$;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU $$ Space: ${e.message | e}`);
        }

    return $$Cache;
}

let httpDSU: any = undefined;

export function getHttp(){
    if (!httpDSU)
        try {
            httpDSU =  getOpenDSU().loadApi('http') as HttpApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Http Space: ${e.message | e}`);
        }

    return httpDSU;
}

export function getAnchoringOptionsByDSUType(type: KeySSIType, ...args: any[]): DSUAnchoringOptions | undefined {
    switch(type){
        case KeySSIType.WALLET:
            const seed: string = args.pop();
            if (!seed)
                throw new CriticalError(`Wallet DSUs need a KeySSi to mount`);
            return {dsuTypeSSI: seed};
        default:
            return undefined;
    }
}