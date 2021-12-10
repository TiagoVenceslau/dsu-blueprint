/**
 * Accepted params to the cli interface
 * @namespace cli
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
     * used in conjunction with {@link pathToOpenDSU}
     *
     * prefixes {@link pathToOpenDSU} in older to control the path, depending on where the cli file is located
     * defaults to '../../../../../' (when it's ran from 'node_modules/@tvenceslau/dsu-blueprint/lib/cli')
     */
    pathAdaptor: string,
    /**
     * used in conjunction with {@link pathAdaptor}
     *
     * set's the relative path to the OpenDSU bundle file.
     * defaults to '../privatesky/psknode/bundles/openDSU.js'
     */
    pathToOpenDSU: string
}

/**
 * Available Actions the Cli supports
 * @namespace cli
 */
export enum CliActions {
    /**
     * Builds Or Updates a DSU from a blueprint file
     * (will delete the contents of the DSU beforehand)
     */
    BUILD = 'build',
    UPDATE = 'update'
}