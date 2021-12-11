import {CriticalError} from "@tvenceslau/db-decorators/lib";
import {DSUAnchoringOptions, OpenDSU} from "./types";
import {ResolverApi} from "./apis/resolver";
import {KeyssiApi, KeySSIType} from "./apis/keyssi";
import {HttpApi} from "./apis/http";
import {SecurityContextApi, SystemApi} from "./apis";

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
export function getResolverApi(): ResolverApi{
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
export function getKeySSIApi(): KeyssiApi{
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

let httpApi: HttpApi;

export function getHttpApi(): HttpApi{
    if (!httpApi)
        try {
            httpApi =  getOpenDSU().loadApi('http') as HttpApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Http Space: ${e.message | e}`);
        }

    return httpApi;
}

let scApi: SecurityContextApi;

export function getSCApi(): SecurityContextApi{
    if (!scApi)
        try {
            scApi =  getOpenDSU().loadApi('sc') as SecurityContextApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Security Context Space: ${e.message | e}`);
        }

    return scApi;
}

let systemApi: SystemApi;

export function getSystemApi(): SystemApi {
    if (!systemApi)
        try {
            systemApi =  getOpenDSU().loadApi('system') as SystemApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU System Space: ${e.message | e}`);
        }

    return systemApi;
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