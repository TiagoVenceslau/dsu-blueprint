import {DSUEditMetadata, DsuKeys, DSUModel, DSUOperation, getDSUModelKey} from "../model";
import {DSU, DSUIOOptions} from "../opendsu";
import {criticalCallback, DBOperations, Err, OperationKeys, warn} from "@tvenceslau/db-decorators/lib";
import {DSUCache, DSUCallback, DSUEditingHandler, OpenDSURepository, ReadCallback} from "../repository";
import {getDSUOperationsRegistry} from "../repository/registry";
import {getWebService} from "./services";

/**
 * @param {string} appName the app name to look for in ApiHub
 * @param {"primary" | "secondary"} slot the slot where the seed can be found. 'primary' refers to the 'wallet slot' and secondary to the 'apps slot'. defaults to 'primary'
 * @param {string} [mountPath] defines the mount path. defaults to the property key
 * @param {DSUIOOptions} [mountOptions] options to be passed to OpenDSU for the mounting operation
 *
 * @decorator fromCache
 * @namespace decorators
 * @memberOf model
 */
export function fromWeb(appName: string, slot: "primary" | "secondary", mountPath?: string, mountOptions?: DSUIOOptions) {
    return (target: any, propertyKey: string) => {
        const metadata: DSUEditMetadata = {
            operation: DSUOperation.EDITING,
            phase: DBOperations.CREATE,
            options: mountOptions,
            dsuPath: mountPath ? mountPath : propertyKey,
            appName: appName,
            slot: slot
        };
        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.FROM_WEB),
            metadata,
            target,
            propertyKey
        );

        const createHandler: DSUEditingHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T | {}, parentDsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T> | ReadCallback){
            const {dsuPath, options, appName, slot} = decorator.props;

            const webService = getWebService();

            const method = slot === 'secondary' ? (...args: any[]) => webService.getAppSeed(appName, ...args) : webService.getWalletSeed;

            method((err: Err, ssi?: string) => {
                if (err || !ssi)
                    return criticalCallback(err || new Error(`Not KeySSI for ${appName} in slot ${slot} found`), callback);
                parentDsu.mount(dsuPath, ssi, options, (err) => {
                    if (err)
                        return criticalCallback(err, callback);
                    callback(undefined, model as T);
                });
            });
        }

        getDSUOperationsRegistry().register(createHandler, DSUOperation.EDITING, OperationKeys.CREATE, target, propertyKey);
    }
}