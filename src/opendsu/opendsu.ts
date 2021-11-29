import {CriticalError} from "@tvenceslau/db-decorators/lib";
import {DSUAnchoringOptions, Keyssi, KeySSIType, OpenDSU, Resolver} from "./types";

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

let resolver: Resolver;


/**
 * @return Resolver the {@link Resolver} object;
 * @throws {CriticalError} when it fails to load
 * @namespace OpenDSU
 */
export function getResolver(): Resolver{
    if (!resolver)
        try {
            resolver = getOpenDSU().loadApi('resolver') as Resolver;
        } catch (e){
            throw new CriticalError(`Could not load DSU Resolver: ${e.message | e}`);
        }

    return resolver;
}

let keyssi: Keyssi;

/**
 * @return Keyssi the {@link Keyssi} object;
 * @throws {CriticalError} when it fails to load
 * @namespace OpenDSU
 */
export function getKeySsiSpace(): Keyssi{
    if (!keyssi)
        try {
            keyssi = getOpenDSU().loadApi('keyssi') as Keyssi;
        } catch (e){
            throw new CriticalError(`Could not load DSU KeySSI Space: ${e.message | e}`);
        }

    return keyssi;
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