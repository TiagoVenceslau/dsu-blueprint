import {LoggedError, LOGGER_LEVELS} from "@tvenceslau/db-decorators/lib";
import {OpenDSU} from "./types";

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