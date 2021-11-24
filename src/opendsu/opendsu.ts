import {LoggedError, LOGGER_LEVELS} from "@tvenceslau/db-decorators/lib";
import {DSUAnchoringOptions, Keyssi, KeySSIType, OpenDSU, Resolver} from "./types";

let openDSU: OpenDSU;

export function getOpenDSU(){
    if (!openDSU){
        try{
            openDSU = require('opendsu');
        } catch (e) {
            throw new LoggedError(`Could not load OpenDSU`, LOGGER_LEVELS.CRITICAL)
        }
    }

    return openDSU;
}

let resolver: Resolver;

export function getResolver(){
    if (!resolver)
        try {
            resolver = getOpenDSU().loadApi('resolver') as Resolver;
        } catch (e){
            throw new LoggedError(`Could not load DSU Resolver: ${e.message | e}`, LOGGER_LEVELS.CRITICAL);
        }

    return resolver;
}

let keyssi: Keyssi;

export function getKeySsiSpace(){
    if (!keyssi)
        try {
            keyssi = getOpenDSU().loadApi('keyssi') as Keyssi;
        } catch (e){
            throw new LoggedError(`Could not load DSU KeySSI Space: ${e.message | e}`, LOGGER_LEVELS.CRITICAL);
        }

    return keyssi;
}

export function getAnchoringOptionsByDSUType(type: KeySSIType): DSUAnchoringOptions | undefined {
    switch(type){
        case KeySSIType.WALLET:
            return {dsuTypeSSI: KeySSIType.SEED};
        default:
            return undefined;
    }
}