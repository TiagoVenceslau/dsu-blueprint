import {model, ModelKeys} from "@tvenceslau/decorator-validation/lib";
import {DSU, DSUAnchoringOptions, KeySSI, KeySSIType} from "../opendsu/types";
import {DsuKeys, DSUOperation} from "./constants";
import {DSUModel} from "./DSUModel";
import {getDSUOperationsRegistry, getRepoRegistry} from "../repository/registry";
import {DSUCallback, OpenDSURepository} from "../repository";
import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";
import {criticalCallback, CriticalError, Err, ModelCallback} from "@tvenceslau/db-decorators/lib";

const getDSUModelKey = (key: string) => DsuKeys.REFLECT + key;

/**
 * Defines a class as a DSU class for serialization purposes
 *
 * @prop {string | undefined} [domain] the DSU domain. default to undefined. when undefined, its the repository that controls the domain;
 * @prop {KeySSIType} [keySSIType] the KeySSI type used to anchor the DSU
 * @prop {string[] | undefined} [specificKeyArgs]  OpenDSU related arguments, specific to each KeySSI implementation. {@link getKeySSIFactory}
 * @prop {DSUAnchoringOptions | undefined} [options] defaults to undefined. decides if batchMode is meant to be used for this DSU
 * @prop {boolean} [batchMode] defaults to true. decides if batchMode is meant to be used for this DSU
 * @prop {string[]} [props] any object properties that must be passed to the KeySSI generation function (eg: for Array SSIs)
 * @decorator DSUBlueprint
 * @namespace decorators
 * @memberOf model
 */
export const DSUBlueprint = (domain: string | undefined = undefined, keySSIType: KeySSIType = KeySSIType.SEED, specificKeyArgs: string[] | undefined = undefined, options: DSUAnchoringOptions | undefined = undefined, batchMode: boolean = true, ...props: string[]) => (original: Function) => {
    getRepoRegistry().register(original.name);
    return model(ModelKeys.MODEL, {
        dsu: {
            domain: domain,
            keySSIType: keySSIType,
            batchMode: batchMode,
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
                dsu: target.constructor.name,
                derive: derive,
                operation: DSUOperation.CREATION,
                mountPath: mountPath ? mountPath : propertyKey
            },
            target,
            propertyKey
        );

        getRepoRegistry().register<OpenDSURepository<T>>(dsu);

        getDSUOperationsRegistry().register(function(this: OpenDSURepository<T>, model: T, decorators: any[], callback: ModelCallback<T>): void {
            const repo = getRepoRegistry().get<OpenDSURepository<T>>(model.constructor.name)
            if (!repo)
                throw new CriticalError(`Cannot find ${model.constructor.name} repository`);
            repo.create(model, (err: Err, newModel: T, dsu: DSU, keySSI: KeySSI) => {
                if (err)
                    return callback(err);
                callback(undefined, newModel, dsu, keySSI);
            });
        }, DSUOperation.CREATION, target, propertyKey);
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
                dsuFilePath: dsuFilePath,
                grouping: dsuFilePath,
                operation: DSUOperation.EDITING
            },
            target,
            propertyKey
        );

        getDSUOperationsRegistry().register(function(this: OpenDSURepository<DBModel>, obj: any, dsu: DSU, keySSI: KeySSI, callback: DSUCallback<DBModel>): void {
            dsu.writeFile(dsuFilePath, JSON.stringify(obj), (err: Err) => {
                if (err)
                    return criticalCallback(err, callback);
                callback(undefined, obj, dsu, keySSI);
            })
        }, DSUOperation.EDITING, target, propertyKey);
    }
}