import {DSUCallback} from "./repository";
import {DsuKeys, DSUModel} from "../model";
import {getKeySsiSpace, getResolver} from "../opendsu";
import {KeySSI, KeySSIType} from "../opendsu/types";
import {
    errorCallback,
    getAllPropertyDecorators,
    getClassDecorators,
    LoggedError,
} from "@tvenceslau/db-decorators/lib";
import {ModelKeys} from "@tvenceslau/decorator-validation/lib";
import {DSUFactoryMethod} from "./types";



export function getDSUFactory(keySSI: KeySSI): DSUFactoryMethod{
    switch (keySSI.getName()) {
        case KeySSIType.ARRAY:
        case KeySSIType.WALLET:
            return getResolver().createDSUForExistingSSI;
        case KeySSIType.SEED:
            return getResolver().createDSU;
        default:
            throw new LoggedError(`Unsupported DSU Factory ${keySSI.getName()}`);
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


export function createFromDecorators<T extends DSUModel>(model: T, callback: DSUCallback<T>){
    const classDecorators: {key: string, props: any}[] = getClassDecorators(ModelKeys.REFLECT, model);

    if (classDecorators.length)
        return errorCallback(new Error(`No DSU decorator Found on Model`), callback);

    const {domain, keySSIType, specificKeyArgs, props} = classDecorators[0].props.dsu;

    let keySSI: KeySSI, dsuFactory: DSUFactoryMethod;

    try{
        const factory = getKeySSIFactory(keySSIType);

        const args: any[] = [domain];
        if (props)
            args.push(props);
        if (specificKeyArgs)
            args.push(...specificKeyArgs);

        keySSI = factory(...args);
        dsuFactory = getDSUFactory(keySSI);
    } catch (e){
        return errorCallback(e, callback);
    }

    dsuFactory(keySSI, undefined, (err, dsu) => {
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