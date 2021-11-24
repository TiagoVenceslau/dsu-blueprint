import {DSUCallback} from "./repository";
import {DsuKeys, DSUModel} from "../model";
import {getAnchoringOptionsByDSUType, getKeySsiSpace, getResolver} from "../opendsu";
import {KeySSI, KeySSIType} from "../opendsu/types";
import {
    errorCallback,
    getAllPropertyDecorators,
    getClassDecorators,
    LoggedError, LOGGER_LEVELS,
} from "@tvenceslau/db-decorators/lib";
import {ModelKeys} from "@tvenceslau/decorator-validation/lib";
import {DSUFactoryMethod} from "./types";



export function getDSUFactory(keySSI: KeySSI): DSUFactoryMethod{
    switch (keySSI.getTypeName()) {
        case KeySSIType.ARRAY:
        case KeySSIType.WALLET:
            return getResolver().createDSUForExistingSSI;
        case KeySSIType.SEED:
            return getResolver().createDSU;
        default:
            throw new LoggedError(`Unsupported DSU Factory ${keySSI.getTypeName()}`);
    }
}

export function getKeySSIFactory(type: KeySSIType): (...args: any[]) => KeySSI{
    switch (type){
        case KeySSIType.ARRAY:
            return getKeySsiSpace().createArraySSI;
        case KeySSIType.WALLET:
            return getKeySsiSpace().createTemplateWalletSSI;
        case KeySSIType.SEED:
            return getKeySsiSpace().createTemplateSeedSSI;
        default:
            throw new LoggedError(`Unsupported KeySSI Type ${type}`);
    }
}

/**
 *
 * Creates a DSU from its matching {@link DSUModel}'s decorations
 *
 * @typedef T extends DSUModel
 * @param {T} model
 * @param {string} fallbackDomain The domain to be used when its not defined in the DSU Blueprint
 * @param {any[] | DSUCallback<T>[]} args key generation args when required (for Array SSIs for instance).
 *      The last arg will be considered to be the callback;
 */
export function createFromDecorators<T extends DSUModel>(model: T, fallbackDomain: string, ...args: (any | DSUCallback<T>)[]){
    const callback: DSUCallback<T> = args.pop();
    if (!callback)
        throw new LoggedError(`Missing callback`);

    const classDecorators: {key: string, props: any}[] = getClassDecorators(ModelKeys.REFLECT, model);

    if (!classDecorators.length)
        return errorCallback(new Error(`No DSU decorator Found on Model`), callback);

    let {domain, keySSIType, specificKeyArgs, props} = classDecorators[0].props.dsu;

    let keySSI: KeySSI, dsuFactory: DSUFactoryMethod;

    try{
        const factory = getKeySSIFactory(keySSIType);

        const keyArgs: any[] = [domain || fallbackDomain];
        if (!props){
            if (args && args.length)
                keyArgs.push(args);
        } else {
            if (args)
                props.push(...args);
            keyArgs.push(props);
        }

        if (specificKeyArgs && specificKeyArgs.length)
            keyArgs.push(...specificKeyArgs);

        keySSI = factory(...keyArgs);
        dsuFactory = getDSUFactory(keySSI);
    } catch (e){
        return errorCallback(e, callback);
    }

    const options = getAnchoringOptionsByDSUType(keySSI.getTypeName() as KeySSIType);

    dsuFactory(keySSI, options, (err, dsu) => {
        if (err)
            return callback(err);
        if (!dsu)
            return errorCallback(`No DSU received`, callback);

        const propDecorators: {[indexer: string]: any[]} | undefined = getAllPropertyDecorators<T>(model as T, DsuKeys.REFLECT);

        if (propDecorators)
            Object.keys(propDecorators).forEach(key => {
                console.log(propDecorators[key]);
            });
        dsu.getKeySSIAsObject((err, keySSI) => {
            if (err)
                return errorCallback(err, callback);
            callback(undefined, model, dsu, keySSI);
        });
    });
}