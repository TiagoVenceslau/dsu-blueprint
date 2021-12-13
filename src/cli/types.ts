import {ConstantsApi} from "../core";

/**
 * Accepted params to the cli interface
 *
 * all of them can be overwritten in the cli, for eg:
 *
 * @typedef CliOptions
 * @memberOf cli
 *
 * @example
 * NodeJS:
 * $ node ./node_modules/@tvenceslau/lib/cli --action='build' --domain='some domain'
 *
 * Via NPM:
 * For a script: "build": "node ./node_modules/@tvenceslau/lib/cli --action='build' --domain='some domain'"
 *
 * you can add params or override already present ones by:
 * $ npm run build -- --action='other action' --domain='some other domain'
 */
export type CliOptions = {
    /**
     * one of {@link CliActions}. defaults to {@link CliActions.BUILD}
     */
    action: CliActions,
    /**
     * the domain to anchor the dsu
     */
    domain?: string,
    /**
     * The location of the transpiled build Blueprint file. defaults to './build/build.js'
     */
    blueprint: string,
    /**
     * The name of the KeySSI containing file after a build. defaults to "seed"
     */
    seedFile: string,
    /**
     * used in conjunction with {@link pathToOpenDSU}
     *
     * relative path adaptor pointing to folder with Seed File and the root to the Blueprint path
     *
     * also prefixes {@link pathToOpenDSU}, so they must be matched in older to control the path, depending on where the cli file is located
     * defaults to './'
     */
    pathAdaptor: string,
    /**
     * used in conjunction with {@link pathAdaptor}
     *
     * set's the relative path to the OpenDSU bundle file.
     * defaults to '../../../../../../privatesky/psknode/bundles/openDSU.js' (when it's ran from 'node_modules/@tvenceslau/dsu-blueprint/lib/cli')
     */
    pathToOpenDSU: string,

    /**
     * The Base path the SSApp will run on. defaults to ""
     */
    basePath?: string,
    /**
     * Option to delete the basePath from environment.json upon instantiation. defaults to false
     */
    stripBasePathOnInstall?: boolean,
    /**
     * Path to wallet seed? defaults to ''
     */
    walletPath?: string,
    /**
     * to override the host
     */
    hosts?: "",
    /**
     * hint
     */
    hint?: undefined,
    /**
     * vault domain name. defaults to {@link ConstantsApi#DOMAINS#VAULT}
     */
    vault?: "vault",
    /**
     * apps folder name. defaults to {@link ConstantsApi#APPS_FOLDER}
     */
    appsFolderName?: string,
    /**
     * app folder name. defaults to {@link ConstantsApi#APP_FOLDER}
     */
    appFolderName?: string,
    /**
     * code folder name. defaults to {@link ConstantsApi#CODE_FOLDER}
     */
    codeFolderName?: string,
    /**
     * placeholder for the environment
     *
     * if passed as string will be parsed into json
     */
    environment?: {} | string,
    /**
     * Primary Slot path defaults to 'wallet-patch'
     */
    primaryslot?: string,
    /**
     * Secondary Slot path defaults to 'apps-patch'
     */
    secondaryslot?: string
}

/**
 * Available Actions the Cli supports
 *
 * @enum CliActions
 *
 * @memberOf cli
 */
export enum CliActions {
    /**
     * Builds Or Updates a DSU from a blueprint file
     * (will delete the contents of the DSU beforehand)
     */
    BUILD = 'build',
    UPDATE = 'update'
}