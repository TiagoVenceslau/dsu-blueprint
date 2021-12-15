import {Callback, criticalCallback, CriticalError, Err} from "@tvenceslau/db-decorators/lib";
import {get$$, getConstantsApi, getHttpApi, getSystemApi} from "../opendsu";
import {parseEnvJS} from "../../fs";

/**
 * @typedef WebServiceOptions
 *
 * @memberOf dsu-blueprint.core.web
 */
export type WebServiceOptions = {
    /**
     * defaults to the result of {@link SystemApi#getBaseURL}
     */
    hosts: string,
    /**
     * defaults to 'seed'
     */
    seedFileName: string,
    /**
     * not sure
     */
    walletPath: string,
    /**
     * defaults to 'wallet-patch'
     */
    primaryslot: string,
    /**
     * defaults to 'apps-patch'
     */
    secondaryslot: string

}

/**
 * Reference interface for a {@link WebService}
 *
 * @interface WebService
 */
export interface WebService {
    options: WebServiceOptions;

    getWalletSeed(callback: Callback): void;
    getAppSeed(appName: string | Callback, callback?: Callback): void;
    doGet(url: string, options: {} | undefined, callback: Callback): void;
    getFile(appName: string, fileName: string, callback: Callback): void;
    getFolderContentAsJSON(innerFolder: string, callback: Callback): void;
    getEnvironmentFile(envFileName?: string | Callback, callback?: Callback): void;
}

/**
 * Merges the provided options (if any) with the currently defined configuration from OpenDSU
 *
 * @param {WebServiceOptions | undefined} options
 *
 * @function mergeWebServiceOptions
 *
 */
export function mergeWebServiceOptions(options?: WebServiceOptions | {}): WebServiceOptions {
    return Object.assign({},
        {
            hosts: getSystemApi().getBaseURL(),
            seedFileName: "seed",
            walletPath: "",
            primaryslot: "wallet-patch",
            secondaryslot: "apps-patch"
        }, options || {}) as WebServiceOptions;
}

/**
 * Default implementation for a {@link WebService}
 *
 * @class WebServiceImp
 *
 */
export class WebServiceImp implements WebService {
    readonly options: WebServiceOptions;
    protected readonly isBrowser: boolean;

    /**
     *
     * @param {WebServiceOptions} [options]
     */
    constructor(options?: WebServiceOptions | {}){
        this.options = mergeWebServiceOptions(options);
        this.isBrowser = get$$().environmentType === getConstantsApi().ENVIRONMENT_TYPES.BROWSER_ENVIRONMENT_TYPE;
    }

    /**
     *
     * @param prefix
     * @private
     **/
    private constructUrlBase(prefix?: string){
        let url, protocol, host;
        prefix = prefix || "";
        let appName = '';
        if (this.isBrowser){
            // @ts-ignore
            let location = window.location;
            const paths = location.pathname.split("/");
            while (paths.length > 0) {
                if (paths[0] === "") {
                    paths.shift();
                } else {
                    break;
                }
            }
            appName = paths[0];
            protocol = location.protocol;
            host = location.host;
            url = `${protocol}//${host}/${prefix}${appName}`;
            return url;
        } else {
            return `${this.options.hosts}/${prefix}${this.options.walletPath}`;
        }
    }

    /**
     *
     * @param {string} envFileName
     * @param {Callback} callback
     *
     */
    getEnvironmentFile(envFileName?: string | Callback, callback?: Callback): void {
        if (!callback){
            callback = envFileName as Callback;
            envFileName = undefined;
        }

        let a = getConstantsApi()

        const url = this.constructUrlBase() + '/loader' + (envFileName ? ((envFileName as string).startsWith('/') ? envFileName : '/' + envFileName) : getConstantsApi().ENVIRONMENT_PATH);

        this.doGet(url, undefined, (err, data) => {
            if (err || !data)
                return criticalCallback(err || new Error(`Missing Dta`), callback as Callback);
            let env;
            try {
                env = parseEnvJS(data.toString())
            } catch (e) {
                return criticalCallback(e as Error, callback as Callback);
            }

            (callback as Callback)(undefined, env);
        });
    }

    /**
     * Gets the seed in the primary slot
     *
     * @param {Callback} callback
     *
     */
    getWalletSeed(callback: Callback){
        this.getAppSeed(this.options.primaryslot, callback);
    }

    /**
     * Gets the seed in the secondary slot
     *
     * @param {string} appName
     * @param {Callback} callback
     *
     */
    getAppSeed(appName: string, callback: Callback){
        const self = this;
        this.getFile(appName, this.options.seedFileName, (err: Err, data: any) => {
            if (err)
                return callback(err);
            self.Utf8ArrayToStr(data, callback);
        });
    }

    /**
     * Performs a fetch request
     *
     * @param {string} url
     * @param {{} | undefined} options
     * @param {Callback} callback
     *
     */
    doGet(url: string, options: {} | undefined, callback: Callback){
        getHttpApi().fetch(url, {
            method: 'GET'
        }).then((response: any) => {
            return response.arrayBuffer().then((data: ArrayBuffer) => {
                if (!response.ok)
                    return criticalCallback(new Error("array data failed"), callback);
                callback(undefined, data);
            }).catch((e: Err) => criticalCallback(e as Error, callback));
        }).catch((err: Err) => criticalCallback(err as Error, callback));
    }

    /**
     * Returns the content of a file as a uintArray
     *
     * @param {string} appName
     * @param {string} fileName
     * @param {function(err, Uint8Array)} callback
     *
     */
    getFile(appName: string, fileName: string, callback: Callback){
        const suffix = `${appName}/${fileName}`;
        const base = this.constructUrlBase();
        const joiner = suffix !== '/' && base[base.length - 1] !== '/' && suffix[0] !== '/'
            ? '/'
            : '';

        let url = base + joiner + suffix;
        this.doGet(url,undefined, callback);
    };

    /**
     * Requests a folder content in JSON format from the ApiHib
     *
     * @param {string} innerFolder
     * @param {Callback} callback
     *
     */
    getFolderContentAsJSON(innerFolder: string, callback: Callback){
        const url = this.constructUrlBase("directory-summary/") + (innerFolder ? `/${innerFolder}` : '') ;
        this.doGet(url, undefined, (err, data) => {
            if (err)
                return callback(err);
            this.Utf8ArrayToStr(data, callback);
        });
    }

    /**
     * Util method to convert Utf8Arrays to Strings in the browser
     * (simpler methods fail for big content jsons)
     * @param {Uint8Array} array
     * @param {function(err, string)} callback
     *
     */
    private Utf8ArrayToStr(array: Uint8Array, callback: Callback) {
        if (!this.isBrowser)
            return callback(undefined, array.toString());
        const bb: Blob = new Blob([array]);
        const f: FileReader = new FileReader();
        f.onload = function(e) {
            if (!e.target || !e.target.result)
                return callback(new CriticalError(`No result found`))
            callback(undefined, e.target.result);
        };
        f.readAsText(bb);
    }
}

/**
 * Retrieves a new  {@link WebService}
 *
 * @param {WebServiceOptions | {}} [options]
 * @return WebService
 *
 * @function getWebService
 *
 * @memberOf dsu-blueprint.core.web
 */
export function getWebService(options?: WebServiceOptions | {}): WebService {
    return new WebServiceImp(options);
}