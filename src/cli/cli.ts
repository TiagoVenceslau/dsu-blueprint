import {DSU, DSUModel, KeySSI, ObjectCallback, OpenDSURepository} from "../core";
import {Callback, criticalCallback, CriticalError, Err, info} from "@tvenceslau/db-decorators/lib";
import {getFS, getPath} from "../fs";

/**
 * Overrides any custom options passed in process args into the default options provided
 *
 * @param {[indexer:string]: any} defaultOpts the default options to the overwritten when necessary
 * @param {string} args the process.argv
 *
 * @function
 * @namespace cli
 * @memberOf dsu-blueprint
 */
export function argParser(defaultOpts: {[indexer: string]: any}, args: string[]){
    let config = JSON.parse(JSON.stringify(defaultOpts));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);
    args.forEach(arg => {
        if (arg.includes('=')){
            let splits = arg.split('=');
            if (notation.indexOf(splits[0]) !== -1) {
                let result
                try {
                    result = eval(splits[1]);
                } catch (e) {
                    result = splits[1];
                }
                config[splits[0].substring(2)] = result;
            }
        }
    });
    return config;
}

export function parseEnvJS(strEnv: string): {}{
    return JSON.parse(strEnv.replace(/^export\sdefault\s/, ''));
}

export function getEnvJs(app: string, pathToApps: string, callback: ObjectCallback){
    const appPath = getPath().join(process.cwd(), pathToApps, "trust-loader-config", app, "loader", "environment.js");
    getFS().readFile(appPath, undefined, (err: Err, data: Buffer) => {
        if (err)
            return callback(`Could not find Application ${app} at ${{appPath}} : ${err}`);
        return callback(undefined, parseEnvJS(data.toString()));
    });
}

export function build(config: CliOptions, callback: Callback){
    let blueprintFile;
    try{
        blueprintFile = require(getPath().join('../../', config.blueprint));
    } catch (e) {
        return criticalCallback(e, callback);
    }

    const {BLUEPRINT} = blueprintFile;
    if (!BLUEPRINT)
        return criticalCallback(`Could not find BLUEPRINT export`, callback);

    const blueprint = new BLUEPRINT();

    const repo = new OpenDSURepository(BLUEPRINT, config.domain, config.pathAdaptor || './');

    repo.create(blueprint, (err: Err, newModel: typeof BLUEPRINT, dsu: DSU, keySSI: KeySSI) => {
        if (err)
            return callback(err);
        callback(undefined, newModel, dsu, keySSI);
    });
}

export type CliOptions = {
    action: CliActions,
    domain?: string,
    blueprint: string,
    pathAdaptor: string,
    pathToPskNode: string
}

export enum CliActions {
    BUILD = 'build',
    UPDATE = 'update'
}

const defaultOptions: CliOptions = {
    action: CliActions.BUILD,
    domain: "default",
    blueprint: "./build/build.js",
    pathAdaptor: '../../',
    pathToPskNode: '../privatesky/psknode/bundles/pskruntime.js'
}

const config: CliOptions = argParser(defaultOptions, process.argv);

const pskNodePath = require('path').join(config.pathAdaptor, config.pathToPskNode);

let opendsu;
try{
    const psknode = require(pskNodePath);
    opendsu = require('opendsu');
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
        build(config, resultCallback);
        break;
    case CliActions.UPDATE:
    default:
        throw new CriticalError(`Not implemented yet`);
}