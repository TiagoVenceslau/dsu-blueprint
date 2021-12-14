import {
    ConstantsApi,
    DSU,
    DSUCallback,
    DSUModel,
    ErrCallback,
    getConstantsApi,
    getResolverApi,
    OpenDSURepository, safeParseKeySSI
} from "../core";
import {Callback, criticalCallback, debug, Err} from "@tvenceslau/db-decorators/lib";
import {CliOptions} from "./types";
import {KeySSI} from "../core/opendsu/apis/keyssi";
import fs, {NoParamCallback} from "fs";
import path from "path";
import {getFS, getPath} from "../fs";
import {Key} from "readline";

/**
 * @namespace cli.toolkit
 * @memberOf cli
 */

/**
 * @enum defaultOptions
 * @memberOf cli.toolkit
 */
export const defaultOptions = {
    anchoring: "default",
    publicSecretsKey: '-$Identity-',
    environmentKey: "-$Environment-",
    basePath: "",
    stripBasePathOnInstall: false,
    walletPath: "",
    hosts: "",
    hint: undefined,
    vault: "vault",
    seedFileName: "seed",
    appsFolderName: "apps",
    appFolderName: "app",
    codeFolderName: "code",
    initFile: "init.file",
    environment: {},
    primaryslot: "wallet-patch",
    secondaryslot: "apps-patch"

}

/**
 * Overrides any custom options passed in process args into the default options provided
 *
 * @param {any} defaultOpts the default options to the overwritten when necessary
 * @param {string} args the process.argv
 *
 * @return {CliOptions} updated options
 *
 * @function argParser
 *
 * @memberOf cli.toolkit
 */
export function argParser(defaultOpts: CliOptions, args: string[]){
    let config = JSON.parse(JSON.stringify(defaultOpts));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);

    const regex = /^--\w+=.*$/gm;

    args.forEach(arg => {
        if (arg.match(regex)){
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
        } else {
            config.extraArgs = config.extraArgs || [];
            config.extraArgs.push(arg);
        }
    });
    return config;
}

/**
 *
 * @param {CliOptions} options
 *
 * @function mergeWithOpenDSUOptions
 *
 * @memberOf cli.toolkit
 */
export function mergeWithOpenDSUOptions(options: CliOptions){
    const constants: ConstantsApi = getConstantsApi();
    return Object.assign({}, defaultOptions, {
        vault: constants.DOMAINS.VAULT,
        appsFolderName: constants.APPS_FOLDER,
        appFolderName: constants.APP_FOLDER,
        codeFolderName: constants.CODE_FOLDER
    }, options)
}

/**
 * Stores the resulting Seed File
 *
 * @param {CliOptions} config
 * @param {string} data the seed in string format
 * @param {Callback} callback
 *
 * @function storeKeySSI
 * @memberOf cli.toolkit
 */
export function storeKeySSI(config: CliOptions, data: string, callback: Callback){
    getFS().writeFile(getPath().join(config.pathAdaptor, config.seedFile), data, undefined, callback)
}

/**
 * Tries to get the Seed File
 *
 * @param {CliOptions} config
 * @param {Callback} callback
 *
 * @function getCurrentKeySSI
 * @memberOf cli.toolkit
 */
export function getCurrentKeySSI(config: CliOptions, callback: Callback){
    getFS().readFile(getPath().join(config.pathAdaptor, config.seedFile),  undefined, (err, data) => err
        ? callback(err)
        : callback(undefined, data.toString()));
}

/**
 * Retrieves the {@link DSUBlueprint} from the path defined the the config
 *
 * @param {CliOptions} config
 * @param {Callback} callback
 *
 * @function getBlueprint
 * @memberOf cli.toolkit
 */
export function getBlueprint(config: CliOptions, callback: Callback){
    let blueprintFile;
    try {
        blueprintFile = require(config.blueprint);
    } catch (e) {
        return criticalCallback(e as Error, callback);
    }
    const BLUEPRINT = blueprintFile.default;
    if (!BLUEPRINT)
        return criticalCallback(`Could not find BLUEPRINT export`, callback);
    callback(undefined, BLUEPRINT);
}

/**
 * If there is already a seed file, deletes and rebuilds that {@link DSU},
 * otherwise creates a new one
 *
 * @param {CliOptions} config
 * @param {Callback} callback
 *
 * @function buildOrUpdate
 * @memberOf cli.toolkit
 */
export function buildOrUpdate(config: CliOptions, callback: DSUCallback<DSUModel>): void{
    getCurrentKeySSI(config, (err: Err, ssi?: string) => {
        if (err || !ssi){
            debug(err ? err.toString() : 'Could not read SSI from file. Creating new instance of {0}', config.walletPath);
            return buildDSU(config, callback);
        }

        safeParseKeySSI(ssi, (err, keySSI?: KeySSI) => {
            if (err || !keySSI){
                debug(err ? err.toString() : 'Could not parse SSI from file contents {0}. Creating new instance of {1}', config.walletPath, ssi);
                return buildDSU(config, callback);
            }
            getResolverApi().loadDSU(keySSI, (err, dsu) => {
                if (err || !dsu)
                    return criticalCallback(`Could not load DSU from KeySSI ${ssi}. Aborting the creation of ${config.walletPath}`, callback);
                dsu.delete('/', (err) => {
                    if (err)
                        return criticalCallback(`Could not delete ${config.walletPath} current DSU. Aborting`, callback);

                });
            });
        });
    });
}

/**
 * Builds a DSU from a transpiled {@link DSUBlueprint} file or Updates it
 * @param {CliOptions} config the cli options
 * @param {DSUCallback<DSUModel>} callback
 *
 * @function buildDSU
 * 
 * @emberOf cli.toolkit
 */
export function buildDSU(config: CliOptions, callback: DSUCallback<DSUModel>): void{
    getBlueprint(config, (err, Blueprint) => {
        if (err)
            return criticalCallback(err, callback);

        const model = config.dsumodel || {};
        const blueprint: DSUModel = new Blueprint(model);
        const keyGenArgs = config.extraArgs || [];

        const repo = new OpenDSURepository(Blueprint, config.domain, config.pathAdaptor || './');
        repo.create(blueprint, ...keyGenArgs, (err: Err, newModel: DSUModel, dsu: DSU, keySSI: KeySSI) => {
            if (err)
                return callback(err);
            callback(undefined, newModel, dsu, keySSI);
        });
    });
}

/**
 * Builds a DSU from a transpiled {@link DSUBlueprint} file or Updates it
 * @param {CliOptions} config the cli options
 * @param {KeySSI} keySSI the {@link KeySSI} of the {@link DSU} to update
 * @param {DSUCallback<DSUModel>} callback
 *
 * @function updateDSU
 *
 * @emberOf cli.toolkit
 */
export function updateDSU(config: CliOptions, keySSI: KeySSI, callback: DSUCallback<DSUModel>): void{
    getBlueprint(config, (err, Blueprint) => {
        if (err)
            return criticalCallback(err, callback);

        const model = config.dsumodel || {};
        const blueprint: DSUModel = new Blueprint(model);
        const keyGenArgs = config.extraArgs || [];

        const repo = new OpenDSURepository(Blueprint, config.domain, config.pathAdaptor || './');
        repo.update(keySSI, blueprint, ...keyGenArgs, (err: Err, newModel: DSUModel, dsu: DSU, keySSI: KeySSI) => {
            if (err)
                return callback(err);
            callback(undefined, newModel, dsu, keySSI);
        });
    });
}