import {DSU, DSUModel, KeySSI} from "../core";
import {CriticalError, Err, info} from "@tvenceslau/db-decorators/lib";
import {CliActions, CliOptions} from "./types";
import {argParser, buildOrUpdate} from "./utils";

const defaultOptions: CliOptions = {
    action: CliActions.BUILD,
    domain: "default",
    blueprint: "./build/build.js",
    pathAdaptor: '../../../../../', // this assumes this is running from node_modules/@tvenceslau/dsu-blueprint/lib/cli
    pathToOpenDSU: '../privatesky/psknode/bundles/openDSU.js'
}

const config: CliOptions = argParser(defaultOptions, process.argv);

const openDSUPath = require('path').join(config.pathAdaptor, config.pathToOpenDSU);

let opendsu;
try{
    opendsu = require(openDSUPath);
} catch (e) {
    throw new CriticalError(e);
}

if (!opendsu)
    throw new CriticalError(`Could not load OpenDSU`);

function resultCallback(err: Err, model: DSUModel, dsu: DSU, keySSI: KeySSI){
    if (err)
        throw err;
    info(`DSU {0} built with keySSI {1}`, model.constructor.name, keySSI.getIdentifier());
}

switch (config.action){
    case CliActions.BUILD:
        buildOrUpdate(config, resultCallback);
        break;
    case CliActions.UPDATE:
    default:
        throw new CriticalError(`Not implemented yet`);
}