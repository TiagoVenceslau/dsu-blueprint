import {DSU, DSUStorage, ObjectCallback} from "../opendsu/types";
import {Callback, Err} from "@tvenceslau/db-decorators/lib";

export function impersonateDSUStorage(originalDsu: DSU): DSUStorage {
    const dsu = originalDsu as DSUStorage;
    dsu.directAccessEnabled = false;
    dsu.enableDirectAccess = (callback) => callback();

    const setObject = function(path: string, data: any, callback: Callback) {
        try {
            dsu.writeFile(path, JSON.stringify(data), callback);
        } catch (e) {
            callback("setObject failed", e);
        }
    }

    const getObject = function(path: string, callback: ObjectCallback) {
        dsu.readFile(path, (err: Err, data: any) => {
            if (err)
                return callback("getObject failed" ,err);

            try{
                data = JSON.parse(data);
            } catch (e){
                return callback(`Could not parse JSON ${data.toString()}`, e);
            }
            callback(undefined, data);
        });
    }
    dsu.getObject = getObject;
    dsu.setObject = setObject;
    return dsu;
}

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

export function parseEnvJS(strEnv: string){
    return JSON.parse(strEnv.replace(/^export\sdefault\s/, ''));
}

export function getEnvJs(app: string, pathToApps: string, callback: ObjectCallback){
    const appPath = require('path').join(process.cwd(), pathToApps, "trust-loader-config", app, "loader", "environment.js");
    require('fs').readFile(appPath, (err: Err, data: Buffer) => {
        if (err)
            return callback(`Could not find Application ${app} at ${{appPath}} : ${err}`);
        return callback(undefined, parseEnvJS(data.toString()));
    });
}

export function jsonStringifyReplacer(key: string, value: any){
    if(key === 'manager' && value.constructor.name)
        return value.constructor.name;
    if (key === 'serialNumbers')
        return value.join(', ');
    return value;
}