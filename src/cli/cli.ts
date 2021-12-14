import {DSU, DSUModel} from "../core";
import {CriticalError, Err, error, getLogger, info, LOGGER_LEVELS} from "@tvenceslau/db-decorators/lib";
import {CliActions, CliOptions} from "./types";
import {argParser, buildOrUpdate, mergeWithOpenDSUOptions, storeKeySSI} from "./toolkit";
import {KeySSI} from "../core/opendsu/apis/keyssi";

/**
 * Defaults options for the CLI interface
 *
 * @constant defaultOptions
 * @memberOf dsu-blueprint.cli
 */
const defaultOptions: CliOptions = {
    action: CliActions.BUILD,
    domain: "default",
    blueprint: "./build/build.js",
    seedFile: "seed",
    pathAdaptor: './',
    pathToOpenDSU: '../../../../../../privatesky/psknode/bundles/openDSU.js',

    loggerLevel: LOGGER_LEVELS.INFO
}

const config: CliOptions = mergeWithOpenDSUOptions(argParser(defaultOptions, process.argv));

getLogger().setLevel(config.loggerLevel || LOGGER_LEVELS.INFO);

const path = require('path');
const openDSUPath = path.join(config.pathAdaptor, config.pathToOpenDSU);

let opendsu;
try{
    opendsu = require(openDSUPath);
} catch (e) {
    throw new CriticalError(e as Error);
}

if (!opendsu)
    throw new CriticalError(`Could not load OpenDSU`);

/**
 *
 * @param {Err} err
 * @param {DSUModel} model
 * @param {DSU} dsu
 * @param {KeySSI} keySSI
 *
 * @function resultCallback
 * @memberOf dsu-blueprint.cli
 */
function resultCallback(err: Err, model?: DSUModel, dsu?: DSU, keySSI?: KeySSI){
    if (err || !model || !dsu || !keySSI)
        throw err || new Error("Missing Results");
    storeKeySSI(config, keySSI.getIdentifier(), (err) => {
        if (err)
            error("Could not save seed file: {0}", err);
        info(`{0} built via {1} with keySSI {2}`, path.basename(path.join(process.cwd(), config.pathAdaptor)), model.constructor.name, keySSI.getIdentifier());
    });
}

switch (config.action){
    case CliActions.BUILD:
        buildOrUpdate(config, resultCallback);
        break;
    case CliActions.INSTANTIATE:
    default:
        throw new CriticalError(`Not implemented yet`);
}