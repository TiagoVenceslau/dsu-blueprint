import {model, ModelKeys} from "@tvenceslau/decorator-validation/lib";
import {KeySSIType} from "../opendsu/types";

/**
 * Defines a class as a Model class for serialization purposes
 *
 * @prop {string} [domain] the DSU domain. default to 'default'
 * @prop {KeySSIType} [keySSIType] the KeySSI type used to anchor the DSU
 * @prop {boolean} [batchMode] defaults to true. decides if batchMode is meant to be used for this DSU
 * @prop {string[]} [props] any object properties that must be passed to the KeySSI generation function (eg: for Array SSIs)
 * @decorator DSU
 * @namespace decorators
 * @memberOf model
 */
export const DSU = (domain: string = "default", keySSIType: KeySSIType = KeySSIType.SEED, batchMode: boolean = true, ...props: string[]) => (original: Function) => {
    return model(ModelKeys.MODEL, {
        dsu: {
            domain: domain,
            keySSIType: keySSIType,
            props: props
        }
    })(original);
}