import {DSUEditMetadata, DsuKeys, DSUModel, DSUOperation, getDSUModelKey} from "../model";
import {DSU, DSUIOOptions} from "../opendsu";
import {Callback, criticalCallback, DBOperations, Err, OperationKeys, warn} from "@tvenceslau/db-decorators/lib";
import {DSUCache, DSUCallback, DSUEditingHandler, OpenDSURepository, ReadCallback} from "../repository";
import {getDSUOperationsRegistry} from "../repository/registry";
import {getWebService} from "./services";
import {getValidatorRegistry, ValidationKeys} from "@tvenceslau/decorator-validation/lib";
import URLValidator from "@tvenceslau/decorator-validation/lib/validation/Validators/URLValidator";

/**
 * Depending on whether and url or an app name is supplied:
 *  - App Name: Communicates with ApiHub to get seeds from SSApps installed in that ApiHub instance:
 *      - slot 'primary': gets the seed file from the App's 'wallet-patch' folder;
 *      - slot 'secondary' gets the seed file from the App's {@link Constan}
 *
 * @param {string} appOrUrl the app name to look for in ApiHub or the URL to an endpoint to call
 * @param {"primary" | "secondary" | undefined} slot the slot where the seed can be found. 'primary' refers to the 'wallet slot' and secondary to the 'apps slot'. defaults to 'primary' and is mandatory when an App Name is provided. is discarded if a URL is detected in the appName
 * @param {string} [mountPath] defines the mount path. defaults to the property key
 * @param {DSUIOOptions} [mountOptions] options to be passed to OpenDSU for the mounting operation
 *
 * @decorator fromCache
 * @namespace web
 */
export function fromWeb(appOrUrl: string, slot: "primary" | "secondary" | undefined, mountPath?: string, mountOptions?: DSUIOOptions) {
    return (target: any, propertyKey: string) => {
        const metadata: DSUEditMetadata = {
            operation: DSUOperation.EDITING,
            phase: DBOperations.CREATE,
            options: mountOptions,
            dsuPath: mountPath ? mountPath : propertyKey,
            appName: appOrUrl,
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

            const urlValidator = getValidatorRegistry().get(ValidationKeys.URL) as URLValidator || new URLValidator();

            const errs = urlValidator.hasErrors(appName);

            if (!errs && !slot)
                return criticalCallback(new Error(`App name supplied with no slot`), callback);

            const method = errs
                ? (slot === 'secondary' ? (callback: Callback) => webService.getAppSeed(appName, callback) : webService.getWalletSeed)
                : (callback: Callback) => getWebService().doGet(appName, undefined, callback);

            method((err: Err, ssi?: any) => {
                if (err || !ssi)
                    return criticalCallback(err || new Error(`Not KeySSI for ${appName} in slot ${slot} found`), callback);
                ssi = typeof ssi !== 'string' ? ssi.toString() : ssi;
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