import {
    DSUClassCreationMetadata,
    DSUCreationMetadata,
    DSUEditMetadata,
    DsuKeys,
    DSUModel,
    DSUOperation,
    getDSUModelKey,
    mount
} from "../model";
import {ConstantsApi, DSU, DSUIOOptions} from "../opendsu";
import {
    Callback,
    criticalCallback,
    DBOperations,
    Err,
    ModelCallback,
    OperationKeys
} from "@tvenceslau/db-decorators/lib";
import {
    DSUCache,
    DSUCallback,
    DSUCreationHandler,
    DSUEditingHandler, DSUPreparationHandler,
    OpenDSURepository,
    ReadCallback
} from "../repository";
import {getDSUOperationsRegistry} from "../repository/registry";
import {getWebService} from "./services";
import {getValidatorRegistry, ValidationKeys} from "@tvenceslau/decorator-validation/lib";
import URLValidator from "@tvenceslau/decorator-validation/lib/validation/Validators/URLValidator";

/**
 * Metadata passed to {@link DSUPreparationHandler}s
 *
 * @typedef DSUEditMetadata
 * @memberOf core.model
 */

export type DSUPreparationMetadata = {
    [indexer: string]: any;

    operation: string
    phase: string[],
    prop: string,
    dsuPath: string,
}

/**
 * Depending on whether and url or an app name is supplied:
 *  - App Name: Communicates with ApiHub to get seeds from SSApps installed in that ApiHub instance:
 *      - slot 'primary': gets the seed file from the App's 'wallet-patch' folder;
 *      - slot 'secondary' gets the seed file from the App's {@link ConstantsApi#APP_FOLDER}
 *
 * @todo Implement a new 'Preparation phase' where we can run this, before creating the actual dsu. @fromCache could also benefit from this by also piggybaking on the @mount
 *
 * Retrieves the Seed during the {@link DSUOperation.CREATION} operation and {@link DBOperations.CREATE} phases
 * and stores in the in object under the matching property key
 *
 * calls {@link mount} on this property to mount the seed during the {@link DSUOperation.EDITING} operation;
 *
 * @param {string} appOrUrl the app name to look for in ApiHub or the URL to an endpoint to call
 * @param {"primary" | "secondary" | undefined} slot the slot where the seed can be found. 'primary' refers to the 'wallet slot' and secondary to the 'apps slot'. defaults to 'primary' and is mandatory when an App Name is provided. is discarded if a URL is detected in the appName
 * @param {boolean| number} [derive] defines how many (if any) times the KeySSI will be Derived before use
 * @param {string} [mountPath] defines the mount path. defaults to the property key
 * @param {DSUIOOptions} [mountOptions] options to be passed to OpenDSU for the mounting operation
 * @param {any[]} [args] Not used in current implementation. Meant for extending decorators
 *
 * @category Decorators
 * @memberOf core.web
 */
export function fromWeb(appOrUrl: string, slot: "primary" | "secondary" | undefined, derive: boolean | number = false, mountPath?: string, mountOptions?: DSUIOOptions, ...args: any[]) {
    return (target: any, propertyKey: string) => {
        mountPath =  mountPath ? mountPath : propertyKey;

        mount(mountPath, mountOptions)(target, propertyKey);

        const metadata: DSUPreparationMetadata = {
            operation: DSUOperation.PREPARATION,
            phase: DBOperations.CREATE,
            prop: propertyKey,
            derive: derive,
            appName: appOrUrl,
            slot: slot,
            dsuPath: mountPath,
            options: mountOptions,
            args: args
        }

        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.FROM_WEB),
            metadata,
            target,
            propertyKey
        );

        const createHandler: DSUPreparationHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUPreparationMetadata, callback: ModelCallback<T>): void {
            const {prop} = decorator;
            const {appName, slot} = decorator.props;

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
                // @ts-ignore
                model[prop] = ssi;
                callback(undefined, model as T);
            });
        }

        getDSUOperationsRegistry().register(createHandler, DSUOperation.PREPARATION, OperationKeys.CREATE, target, propertyKey);
    }
}