/**
 * Forked from PrivateSky
 * Provides an environment independent file service to the {@link AppBuilderService}
 * @memberOf dt
 * @function FileService
 */
import {Callback, CriticalError, Err} from "@tvenceslau/db-decorators/lib";
import {get$$, getHttp} from "../opendsu";

export type FileServiceOptions = {
    hosts: string,
    seedFileName: string,
    walletPath: string,
    slots: {
        primary: string,
        secondary: string
    }
}

export class FileService {
    protected options: FileServiceOptions;
    protected readonly isBrowser: boolean;

    constructor(options: FileServiceOptions){
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

    getWalletSeed(callback: Callback){
        this.getAppSeed(this.options.slots.primary, callback);
    }

    getAppSeed(appName: string, callback: Callback){
        const self = this;
        this.getFile(appName, this.options.seedFileName, (err: Err, data: any) => {
            if (err)
                return callback(err);
            self.Utf8ArrayToStr(data, callback);
        });
    }

    doGet(url: string, options: {} | undefined, callback: Callback){

        getHttp().fetch(url, {
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

module.exports = FileService;