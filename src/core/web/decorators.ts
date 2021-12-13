import {
    DSUClassCreationMetadata,
    DSUCreationMetadata,
    DSUEditMetadata, dsuFile,
    DsuKeys,
    DSUModel,
    DSUOperation,
    getDSUModelKey,
    mount
} from "../model";
import {ConstantsApi, DSU, DSUIOOptions, getConstantsApi, getKeySSIApi, getOpenDSU, KeySSI} from "../opendsu";
import {
    all,
    Callback,
    criticalCallback,
    DBOperations, debug,
    Err,
    ModelCallback,
    OperationKeys
} from "@tvenceslau/db-decorators/lib";
import {
    DSUCache,
    DSUPreparationHandler, handleKeyDerivation,
    OpenDSURepository
} from "../repository";
import {getDSUOperationsRegistry} from "../repository/registry";
import {getWebService} from "./services";
import {getPropertyDecorators, getValidatorRegistry, ValidationKeys} from "@tvenceslau/decorator-validation/lib";
import URLValidator from "@tvenceslau/decorator-validation/lib/validation/Validators/URLValidator";

/**
 * Metadata passed to {@link DSUPreparationHandler}s
 *
 * @typedef DSUEditMetadata
 * @memberOf core.web
 */

export type DSUPreparationMetadata = {
    [indexer: string]: any;

    operation: string
    phase: string[],
    prop: string,
    dsuPath?: string,
}

/**
 * Performs a Get request to the supplied url with the supplied options and stores the result in the model under the decorated property
 *
 * Acts during the {@link DSUOperation.PREPARATION} phase;
 *
 * @param {string} url
 * @param {boolean} [toJson] defaults to false. if true, tries to parse the result to json
 * @param {{}} [options] options to be passed to the get request
 *
 * @decorator fromURL
 *
 * @category Decorators
 */
export function fromURL(url: string, toJson: boolean = false, options?: {}){
    return (target: any, propertyKey: string) => {
        const metadata: DSUPreparationMetadata = {
            operation: DSUOperation.PREPARATION,
            phase: DBOperations.CREATE,
            prop: propertyKey,
            url: url,
            options: options,
            toJson: toJson
        }

        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.FROM_URL),
            metadata,
            target,
            propertyKey
        );

        const createHandler: DSUPreparationHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUPreparationMetadata, callback: ModelCallback<T>): void {
            const {prop, url, options, toJson} = decorator;

            const webService = getWebService();

            webService.doGet(url, options, (err: Err, result?: any) => {
                if (err || !result)
                    return criticalCallback(err || new Error(`No plausible response received from server`), callback);

                if (toJson)
                    try {
                        result = JSON.parse(result);
                    } catch (e) {
                        return criticalCallback(e as Error, callback);
                    }

                // @ts-ignore
                model[prop] = result;
                callback(undefined, model as T);
            });
        }

        getDSUOperationsRegistry().register(createHandler, DSUOperation.PREPARATION, OperationKeys.CREATE, target, propertyKey);

    }
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
 * @param {string} [keyOverride] and extension tool, to allow wallet decorator to use this one for himself
 * @param {any[]} [args] Not used in current implementation. Meant for extending decorators
 *
 * @decorator fromWeb
 *
 * @category Decorators
 */
export function fromWeb(appOrUrl: string, slot: "primary" | "secondary" | undefined, triggerMount: boolean = true, derive: boolean | number = false, mountPath?: string, mountOptions?: DSUIOOptions, keyOverride?: string, ...args: any[]) {
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
            args: args
        }

        Reflect.defineMetadata(
            getDSUModelKey(keyOverride || DsuKeys.FROM_WEB),
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
                    return criticalCallback(e as Error, callback);
                }

                try {
                    ssi = handleKeyDerivation(ssi, derive);
                } catch (e) {
                    return criticalCallback(e as Error, callback);
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
 * @decorator wallet
 *
 * @category Decorators
 *
 * @mermaid
 *  sequenceDiagram
 *      wallet->>fromWeb(app, "primary", false)
 */
export function wallet(app: string, derive: boolean = true) {
    return (target: any, propertyKey: string) => {
        fromWeb(app, "primary", false, derive, undefined, undefined, DsuKeys.WALLET)(target, propertyKey);
    }
}

/**
 * Writes the Environment configuration into a DSU (mandatory for for SSApps)
 *
 * The environment file will be saved in json format in the DSU
 *
 * @param {string} [fileName] defaults to {@link ConstantsApi.ENVIRONMENT_PATH}
 *
 * @decorator environment
 *
 * @category Decorators
 */
export function environment(fileName: string = "environment.js"){
    return (target: any, propertyKey: string) => {
        const name = target.constructor.name;
        const metadata: DSUPreparationMetadata = {
            operation: DSUOperation.PREPARATION,
            phase: DBOperations.CREATE,
            dsu: name,
            fileName: fileName,
            prop: propertyKey,
        }

        Reflect.defineMetadata(
            getDSUModelKey(DsuKeys.ENVIRONMENT),
            metadata,
            target,
            propertyKey
        );

        dsuFile(fileName.replace('json', 'js'))(target, propertyKey);

        const createHandler: DSUPreparationHandler = function<T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUPreparationMetadata, callback: ModelCallback<T>): void {
            const {prop, fileName} = decorator;

            let codeProp = getOpenDSU().constants.CODE_FOLDER;
            codeProp = codeProp.startsWith('/') ? codeProp.substring(1) : codeProp;

            const decorators: {prop: string | symbol, decorators: any[]} | undefined = getPropertyDecorators(DsuKeys.REFLECT, model, codeProp, true);
            if (!decorators)
                return criticalCallback(`Could not find wallet decorator`, callback);
            const walletDec = decorators.decorators.find(d => d.key === DsuKeys.WALLET);
            if (!walletDec)
                return criticalCallback(`Could not find wallet decorator`, callback);

            const appName = walletDec.props.appName;

            const ws = getWebService({
                walletPath: appName
            });

            all(`Retrieving Environment definition {0} for App {1}`, getConstantsApi().ENVIRONMENT_PATH, appName);
            ws.getEnvironmentFile(fileName, (err, env) => {
                if (err || !env)
                    return criticalCallback(err || new Error("Missing environment"), callback);
                debug(`Environment definition for App {0} is {1}`, appName, env);

                // @ts-ignore
                model[prop] = env;
                 callback(undefined, model);
            });
        }

        getDSUOperationsRegistry().register(createHandler, DSUOperation.PREPARATION, OperationKeys.CREATE, target, propertyKey);
    }
}