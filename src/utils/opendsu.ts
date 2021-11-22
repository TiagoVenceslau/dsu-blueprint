import {critical} from "@tvenceslau/db-decorators/lib";

let openDSU;

if (!openDSU){
    try{
        // @ts-ignore
        openDSU = require('opendsu');
    } catch (e){
        critical(`Could not load OpenDSU`);
    }
}

export const opendsu = openDSU;