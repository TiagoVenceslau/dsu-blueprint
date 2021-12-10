import {DSU, ObjectCallback, OpenDSURepository} from "../core";
import {getFS, getPath} from "../fs";
import {Callback, criticalCallback, Err} from "@tvenceslau/db-decorators/lib";
import {CliOptions} from "./types";
import {KeySSI} from "../core/opendsu/apis/keyssi";

/**
 * Overrides any custom options passed in process args into the default options provided
 *
 * @param {any} defaultOpts the default options to the overwritten when necessary
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

/**
 * Builds a DSU from a transpiled {@link DSUBlueprint} file or Updates it
 * @param {CliOptions} config the cli options
 * @param {Callback} callback
 * @function
 * @namespace cli
 */
export function buildOrUpdate(config: CliOptions, callback: Callback){
    let blueprintFile;
    try {
        blueprintFile = require(config.blueprint);
    } catch (e) {
        return criticalCallback(e, callback);
    }
    const BLUEPRINT = blueprintFile.default;
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