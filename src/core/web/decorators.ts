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
import {ConstantsApi, DSU, DSUIOOptions, getKeySSIApi, KeySSI} from "../opendsu";
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
    DSUEditingHandler, DSUPreparationHandler, handleKeyDerivation,
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
 **
 * Retrieves the Seed during the {@link DSUOperation.CREATION} operation and {@link DBOperations.CREATE} phases
 * and stores in the in object under the matching property key
 *
 * calls {@link mount} on this property to mount the seed during the {@link DSUOperation.EDITING} operation;
 *
 * @param {string} appOrUrl the app name to look for in ApiHub or the URL to an endpoint to call
 * @param {"primary" | "secondary" | undefined} slot the slot where the seed can be found. 'primary' refers to the 'wallet slot' and secondary to the 'apps slot'. defaults to 'primary' and is mandatory when an App Name is provided. is discarded if a URL is detected in the appName
 * @param {boolean} [triggerMount] Decides if the DSU retrieved will be mounted or not. defaults to true. all following params require this to be true to be used
 * @param {boolean| number} [derive] defines how many (if any) times the KeySSI will be Derived before use (only used when {@param triggerMount} is true)
 * @param {string} [mountPath] defines the mount path. defaults to the property key
 * @param {DSUIOOptions} [mountOptions] options to be passed to OpenDSU for the mounting operation
 * @param {any[]} [args] Not used in current implementation. Meant for extending decorators
 *
 * @function fromWeb
 *
 * @category Decorators
 * @memberOf core.web
 */
export function fromWeb(appOrUrl: string, slot: "primary" | "secondary" | undefined, triggerMount: boolean = true, derive: boolean | number = false, mountPath?: string, mountOptions?: DSUIOOptions, ...args: any[]) {
    return (target: any, propertyKey: string) => {
        mountPath =  mountPath ? mountPath : propertyKey;
        if (triggerMount)
            mount(mountPath, false, mountOptions, ...args);

        const name = target.constructor.name;
        const metadata: DSUPreparationMetadata = {
            operation: DSUOperation.PREPARATION,
            phase: DBOperations.CREATE,
            dsu: name,
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
            const {prop, appName, slot, derive} = decorator;

            const webService = getWebService({
                walletPath: appName
            });

            const urlValidator = getValidatorRegistry().get(ValidationKeys.URL) as URLValidator || new URLValidator();

            const errs = urlValidator.hasErrors(appName);

            if (!errs && !slot)
                return criticalCallback(new Error(`App name supplied with no slot`), callback);

            const method = errs
                ? (slot === 'secondary' ? (callback: Callback) => webService.getAppSeed.call(webService, appName, callback) : webService.getWalletSeed.bind(webService))
                : (callback: Callback) => webService.doGet.call(webService, appName, undefined, callback);

            method((err: Err, ssi?: any) => {
                if (err || !ssi)
                    return criticalCallback(err || new Error(`Not KeySSI for ${appName} in slot ${slot} found`), callback);
                ssi = typeof ssi !== 'string' ? ssi.toString() : ssi;

                try {
                    ssi = getKeySSIApi().parse(ssi) as KeySSI;
                } catch (e) {
                    return criticalCallback(e, callback);
                }

                try {
                    ssi = handleKeyDerivation(ssi, derive);
                } catch (e) {
                    return criticalCallback(e, callback);
                }
                // @ts-ignore
                model[prop] = ssi.getIdentifier();
                callback(undefined, model as T);
            });
        }

        getDSUOperationsRegistry().register(createHandler, DSUOperation.PREPARATION, OperationKeys.CREATE, target, propertyKey);
    }
}

/**
 * Retrieves the Wallet Seed from ApiHub and stores in the {@link ConstantsApi#CODE_FOLDER} property
 *
 * Wrapper decorator around {@link fromWeb(app, "primary", false)}
 *
 * @param {string} app the app name to look for in ApiHub
 * @param {boolean} [derive] If the KeySSI should be derived (how many times). defaults to true
 *
 * @function wallet
 *
 * @category Decorators
 * @memberOf core.web
 *
 * @mermaid
 *  sequenceDiagram
 *      actor wallet
 *      actor fromWeb
 *      wallet->>fromWeb(app, "primary", false)
 */
export function wallet(app: string, derive: boolean = true) {
    return (target: any, propertyKey: string) => {
        fromWeb(app, "primary", false, derive)(target, propertyKey);
    }
}