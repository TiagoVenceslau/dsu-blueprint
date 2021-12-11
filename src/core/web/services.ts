import {Callback, CriticalError, Err} from "@tvenceslau/db-decorators/lib";
import {get$$, getHttpApi} from "../opendsu";

/**
 * @type WebServiceOptions
 *
 * @category Services
 * @memberOf core.web
 */
export type WebServiceOptions = {
    hosts: string,
    seedFileName: string,
    walletPath: string,
    slots: {
        primary: string,
        secondary: string
    }
}

/**
 * Reference interface for a {@link WebService}
 *
 * @interface WebService
 * @category Services
 * @memberOf core.web
 */
export interface WebService {
    options: WebServiceOptions;

    getWalletSeed(callback: Callback): void;
    getAppSeed(appName: string | Callback, callback?: Callback): void;
    doGet(url: string, options: {} | undefined, callback: Callback): void;
    getFile(appName: string, fileName: string, callback: Callback): void;
    getFolderContentAsJSON(innerFolder: string, callback: Callback): void;
}

/**
 * Default implementation for a {@link WebService}
 *
 * @class WebServiceImp
 *
 * @category Services
 * @memberOf core.web
 */
export class WebServiceImp implements WebService {
    readonly options: WebServiceOptions;
    protected readonly isBrowser: boolean;

    /**
     *
     * @param {WebServiceOptions} options
     *
     * @constructor
     */
    constructor(options: WebServiceOptions){
        this.options = options;
        this.isBrowser = get$$().environmentType === 'browser';
    }

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
            return `http://${this.options.hosts}/${prefix}${this.options.walletPath}`;
        }
    }

    /**
     * Gets the seed in the primary slot
     *
     * @param {Callback} callback
     */
    getWalletSeed(callback: Callback){
        this.getAppSeed(this.options.slots.primary, callback);
    }

    /**
     * Gets the seed in the secondary slot
     *
     * @param {string} appName
     * @param {Callback} callback
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
     */
    doGet(url: string, options: {} | undefined, callback: Callback){

        getHttpApi().fetch(url, {
            method: 'GET'
        }).then((response: any) => {
            return response.arrayBuffer().then((data: ArrayBuffer) => {
                if (!response.ok)
                    return callback("array data failed")
                callback(undefined, data);
            }).catch((e: Err) => callback(e));
        }).catch((err: Err) => callback(err));
    }

    /**
     * Returns the content of a file as a uintArray
     *
     * @param {string} appName
     * @param {string} fileName
     * @param {function(err, Uint8Array)} callback
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
     * @param innerFolder
     * @param callback
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

let activeWebService: WebService;

/**
 * Retrieves the current {@link WebService}
 *
 * @param {WebServiceOptions} [options]
 * @return WebService
 *
 * @function
 *
 * @category Services
 * @memberOf core.web
 */
export function getWebService(options?: WebServiceOptions): WebService {
    if (!activeWebService)
        if (options)
            activeWebService = new WebServiceImp(options);
        else
            throw new CriticalError('No Options Supplied');
    return activeWebService;
}

/**
 * Replaces the current {@link WebService} implementation with the provided one
 *
 * @param {WebService} webService
 *
 * @function
 *
 * @category Services
 * @memberOf core.web
 */
export function setWebService(webService: WebService): void {
    activeWebService = webService;
}