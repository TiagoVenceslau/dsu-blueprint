import {model, ModelKeys} from "@tvenceslau/decorator-validation/lib";
import {KeySSIType} from "../opendsu/types";
import {DsuKeys} from "./constants";
import {DSUModel} from "./DSUModel";

const getDSUModelKey = (key: string) => DsuKeys.REFLECT + key;

/**
 * Defines a class as a DSU class for serialization purposes
 *
 * @prop {string | undefined} [domain] the DSU domain. default to undefined. when undefined, its the repository that controls the domain;
 * @prop {KeySSIType} [keySSIType] the KeySSI type used to anchor the DSU
 * @prop {string[] | undefined} [specificKeyArgs]  OpenDSU related arguments, specific to each KeySSI implementation. {@link getKeySSIFactory}
 * @prop {boolean} [batchMode] defaults to true. decides if batchMode is meant to be used for this DSU
 * @prop {string[]} [props] any object properties that must be passed to the KeySSI generation function (eg: for Array SSIs)
 * @decorator DSU
 * @namespace decorators
 * @memberOf model
 */
export const DSU = (domain: string | undefined = undefined, keySSIType: KeySSIType = KeySSIType.SEED, specificKeyArgs: string[] | undefined = undefined, batchMode: boolean = true, ...props: string[]) => (original: Function) => {
    return model(ModelKeys.MODEL, {
        dsu: {
            domain: domain,
            keySSIType: keySSIType,
            specificKeyArgs: specificKeyArgs,
            props: props && props.length ? props : undefined
        }
    })(original);
}

/**
 *
 * @typedef T extends DSUModel
 * @param {{new: T}} dsu
 * @param{boolean} [derive] decides if the resulting mount uses the Seed or the Read
 * @param {string} [mountPath] defines the mount path, overriding the property name;
 * @param {any[]} [args] optional KeySSI generation params
 *
 * @decorator dsu
 * @namespace decorators
 * @memberOf model
 */
export function dsu<T extends DSUModel>(dsu: {new(): T}, derive: boolean = false, mountPath?: string, ...args: any[]) {
    return (target: T, propertyKey: string) => {
        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.DSU),
            {
                mountPath: mountPath ? mountPath : propertyKey
            },
            target,
            propertyKey
        );
    }
}

/**
 *
 * @param {string} [dsuFilePath] defines the mount path. defaults to {@link DsuKeys#DEFAULT_DSU_PATH}
 *
 * @decorator dsu
 * @namespace decorators
 * @memberOf model
 */
export function dsuFile(dsuFilePath: string = DsuKeys.DEFAULT_DSU_PATH) {
    return (target: any, propertyKey: string) => {
        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.DSU_FILE),
            {
                dsuFilePath: dsuFilePath
            },
            target,
            propertyKey
        );
    }
}