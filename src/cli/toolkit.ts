import {ConstantsApi, DSU, DSUCallback, DSUModel, getConstantsApi, OpenDSURepository} from "../core";
import {criticalCallback, Err} from "@tvenceslau/db-decorators/lib";
import {CliOptions} from "./types";
import {KeySSI} from "../core/opendsu/apis/keyssi";

/**
 * @namespace cli.toolkit
 * @memberOf cle
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
 * Builds a DSU from a transpiled {@link DSUBlueprint} file or Updates it
 * @param {CliOptions} config the cli options
 * @param {DSUCallback<DSUModel>} callback
 *
 * @function buildOrUpdate
 * 
 * @emberOf cli.toolkit
 */
export function buildOrUpdate(config: CliOptions, callback: DSUCallback<DSUModel>): void{
    let blueprintFile;
    try {
        blueprintFile = require(config.blueprint);
    } catch (e) {
        return criticalCallback(e as Error, callback);
    }
    const BLUEPRINT = blueprintFile.default;
    if (!BLUEPRINT)
        return criticalCallback(`Could not find BLUEPRINT export`, callback);

    const blueprint: DSUModel = new BLUEPRINT();

    const repo = new OpenDSURepository(BLUEPRINT, config.domain, config.pathAdaptor || './');

    repo.create(blueprint, (err: Err, newModel: DSUModel, dsu: DSU, keySSI: KeySSI) => {
        if (err)
            return callback(err);
        callback(undefined, newModel, dsu, keySSI);
    });
}