import {DSU, DSUModel} from "../core";
import {Callback, CriticalError, Err, error, info} from "@tvenceslau/db-decorators/lib";
import {CliActions, CliOptions} from "./types";
import {argParser, buildOrUpdate} from "./utils";
import {KeySSI} from "../core/opendsu/apis/keyssi";

/**
 * Defaults options for the CLI interface
 *
 * @const
 * @module cli
 */
const defaultOptions: CliOptions = {
    action: CliActions.BUILD,
    domain: "default",
    blueprint: "./build/build.js",
    seedFile: "seed",
    pathAdaptor: './',
    pathToOpenDSU: '../../../../../../privatesky/psknode/bundles/openDSU.js'
}

const config: CliOptions = argParser(defaultOptions, process.argv);
const fs = require('fs'), path = require('path');
const openDSUPath = path.join(config.pathAdaptor, config.pathToOpenDSU);

let opendsu;
try{
    opendsu = require(openDSUPath);
} catch (e) {
    throw new CriticalError(e as Error);
}

if (!opendsu)
    throw new CriticalError(`Could not load OpenDSU`);

function storeKeySSI(data: string, callback: Callback){
    fs.writeFile(path.join(config.pathAdaptor, config.seedFile), data, callback)
}

function resultCallback(err: Err, model?: DSUModel, dsu?: DSU, keySSI?: KeySSI){
    if (err || !model || !dsu || !keySSI)
        throw err || new Error("Missing Results");
    storeKeySSI(keySSI.getIdentifier(), (err) => {
        if (err)
            error("Could not save seed file: {0}", err);
        info(`{0} built via {1} with keySSI {2}`, path.basename(path.join(process.cwd(), config.pathAdaptor)), model.constructor.name, keySSI.getIdentifier());
    });
}

switch (config.action){
    case CliActions.BUILD:
        buildOrUpdate(config, resultCallback);
        break;
    case CliActions.UPDATE:
    default:
        throw new CriticalError(`Not implemented yet`);
}