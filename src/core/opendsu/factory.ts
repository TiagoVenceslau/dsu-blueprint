import {IRegistry} from "@tvenceslau/decorator-validation/lib/utils/registry";
import {
    criticalCallback,
    CriticalError,
    debug,
    LoggedError,
} from "@tvenceslau/db-decorators/lib";
import {OpenDSURepository} from "../repository";
import {DsuKeys, DSUModel} from "../model";
import {
    AnchoringOptsOrDSUCallback,
    DSU,
    DSUAnchoringOptions,
    GenericCallback,
    SimpleDSUCallback,
    WalletDsu
} from "./types";
import {ArraySSI, KeySSI, KeySSIType, SeedSSI, WalletSSI} from "./apis";
import {getKeySSIApi, getOpenDSU, getResolverApi} from "./opendsu";
import {getPropertyDecorators} from "@tvenceslau/decorator-validation/lib";

/**
 * @namespace OpenDSU.factory
 */

export type KeySSIFactory = (this: OpenDSURepository<DSUModel>, model: DSUModel, domain: string, specificKeyArgs: string[] | undefined, keyGenArgs: string[], callback: KeySSIFactoryCallback) => void;

export type DSUFactoryMethod = (keySSI: KeySSI, options: AnchoringOptsOrDSUCallback | undefined, callback?: SimpleDSUCallback) => void;

export type DSUPostProcess = (dsu: DSU, callback: SimpleDSUCallback) => void;

export type KeySSIFactoryResponse = {
    options: DSUAnchoringOptions | undefined,
    keySSI: KeySSI
}

export type KeySSIFactoryCallback = GenericCallback<KeySSIFactoryResponse>;

/**
 * Provides the base implementation for Factory Registries
 *
 * @class FactoryRegistryImp
 *
 * @abstract
 * @implements IRegistry<any>
 *
 * @memberOf OpenDSU.factory
 */
export abstract class FactoryRegistry<T> implements IRegistry<T>{
    protected supportedTypes: string[] = [];
    protected factories: {[indexer: string]: T} = {};

    isTypeAvailable(keySSIType: string, ...args: any[]): boolean {
        return this.supportedTypes.indexOf(keySSIType) !== -1;
    }

    getAvailableTypes(...args: any[]): string[] {
        return this.supportedTypes;
    }

    /**
     * Returns a registered KeySSI factory
     *
     * @param {string} keySSIType
     * @param {any[]} [args] for extensions purposes. not used in this implementation
     * @return {T | undefined}
     */
    get(keySSIType: string, ...args: any[]): T | undefined {
        return this.factories[keySSIType];
    }

    /**
     * Registers a factory associated with the {@param keySSIType};
     *
     * @param {T} factory
     * @param {string} keySSIType
     * @param {any[]} [args] for extensions purposes. not used in this implementation
     *
     * @throws CriticalError if a factory had previously been registered for that keySSiType
     */
    register(factory: T, keySSIType: string, ...args: any[]): void {
        if (this.isTypeAvailable(keySSIType))
            throw new CriticalError(`KeySSI Factory for the ${keySSIType} type already registered`);
        this.supportedTypes.push(keySSIType);
        this.factories[keySSIType] = factory;
    }
}

/**
 * Registry class to hold the various KeySSI factory methods and properly apply validation to the received arguments
 *
 * @class KeySSIFactoryRegistry
 * @memberOf OpenDSU.factory
 */
export class KeySSIFactoryRegistry extends FactoryRegistry<KeySSIFactory>{
    /**
     * Creates a new KeySSI from the provided params
     *
     * @param {OpenDSURepository} repository
     * @param {DSUModel} model
     * @param {string} keySSIType
     * @param {string} domain
     * @param {string[] | undefined} specificKeyArgs
     * @param {string[]} keyGenArgs
     * @param {GenericCallback<KeySSIFactoryResponse>} callback
     */
    build(repository: OpenDSURepository<DSUModel>, model: DSUModel, keySSIType: string, domain: string, specificKeyArgs: string[] | undefined, keyGenArgs: string[], callback: KeySSIFactoryCallback): void {
        const factory: KeySSIFactory | undefined = this.get(keySSIType);
        if (!factory)
            return criticalCallback(new Error(`Could not find a KeySSI Factory for ${keySSIType}`), callback);
        factory.call(repository, model, domain, specificKeyArgs, keyGenArgs, callback);
    }

    /**
     * @param {string} keySSIType
     *
     * @see FactoryRegistry#get
     * @override
     */
    get(keySSIType: string): KeySSIFactory | undefined {
        return super.get(keySSIType);
    }

    /**
     * When dsuFactory is defined, with trigger a call to {@link DSUFactoryRegistry#register} with the dsuFactory and dsuPostProcess as arguments
     *
     * @param {KeySSIFactory} factory
     * @param {string} keySSIType
     * @param {DSUFactoryMethod} [dsuFactory]
     * @param {DSUPostProcess} [dsuPostProcess]
     *
     * @see FactoryRegistry#register
     * @override
     */
    register(factory: KeySSIFactory, keySSIType: string, dsuFactory: DSUFactoryMethod | undefined, dsuPostProcess?: DSUPostProcess) {
        super.register(factory, keySSIType);
        if (dsuFactory)
            getDSUFactoryRegistry().register(dsuFactory, keySSIType, dsuPostProcess);
    }
}

let keySSIFactoryRegistry: KeySSIFactoryRegistry;

/**
 *
 * @function
 * @memberOf OpenDSU.factory
 */
export function getKeySSIFactoryRegistry(): KeySSIFactoryRegistry {
    if (!keySSIFactoryRegistry)
        keySSIFactoryRegistry = new KeySSIFactoryRegistry();
    return keySSIFactoryRegistry;
}

/**
 * Handles the various {@link DSUFactoryMethod}
 *
 * @class DSUFactoryRegistry
 * @extends FactoryRegistry
 * @memberOf OpenDSU.factory
 */
export class DSUFactoryRegistry extends FactoryRegistry<DSUFactoryMethod>{
    private postProcesses: {[indexer: string]: DSUPostProcess} = {};
    /**
     *
     * When postProcess is true, will refer to {@link DSUPostProcess} if they exist
     *
     * @param {string} keySSIType
     * @param {boolean} [postProcess] defaults to false
     */
    isTypeAvailable(keySSIType: string, postProcess: boolean = false): boolean {
        const typeAvailable = super.isTypeAvailable(keySSIType);
        return postProcess ? typeAvailable && !!this.postProcesses[keySSIType] : typeAvailable;
    }
    /**
     * When postProcess is true, will refer to {@link DSUPostProcess}s if they exist
     *
     * @param {boolean} [postProcess] defaults to false
     */
    getAvailableTypes(postProcess: boolean = false): string[] {
        return postProcess ? super.getAvailableTypes().filter(type => !!this.postProcesses[type]) : super.getAvailableTypes();
    }
    /**
     * When postProcess is true, will return a stored {@link DSUPostProcess} if it exists
     *
     * @param {string} keySSIType
     * @param {boolean} [postProcess] defaults to false
     *
     * @see FactoryRegistry#get
     * @override
     */
    // @ts-ignore
    get(keySSIType: string, postProcess: boolean = false): DSUFactoryMethod | DSUPostProcess | undefined {
        return postProcess ? this.postProcesses[keySSIType] : super.get(keySSIType);
    }

    /**
     * Builds a DSU from the provided {@link KeySSI}
     *
     * @param {KeySSI} keySSI
     * @param {DSUAnchoringOptions} options
     * @param {SimpleDSUCallback} callback
     */
    build(keySSI: KeySSI, options: DSUAnchoringOptions, callback: SimpleDSUCallback): void {
        const keySSIType = keySSI.getTypeName();
        const factory: DSUFactoryMethod | undefined = this.get(keySSIType) as DSUFactoryMethod;
        if (!factory)
            return criticalCallback(new Error(`Could not find a DSU Factory for ${keySSIType}`), callback);
        factory(keySSI, options, callback);
    }
    /**
     * When postProcess is defined, will also store the {@link DSUPostProcess}
     *
     * @param {DSUFactoryMethod} factory
     * @param {string} keySSIType
     * @param {DSUPostProcess} [postProcess]
     *
     * @see FactoryRegistry#register
     * @override
     */
    register(factory: DSUFactoryMethod, keySSIType: string, postProcess?: DSUPostProcess) {
        super.register(factory, keySSIType);
        if (postProcess)
            if (this.isTypeAvailable(keySSIType, true))
                throw new CriticalError(`PostProcess Already Registered for KeySSIType ${keySSIType}`);
            else
                this.postProcesses[keySSIType] = postProcess;
    }
}

let dsuFactoryRegistry: DSUFactoryRegistry;

export function getDSUFactoryRegistry(): DSUFactoryRegistry {
    if (!dsuFactoryRegistry)
        dsuFactoryRegistry = new DSUFactoryRegistry();
    return dsuFactoryRegistry;
}

/**
 * Util method to retrieve the proper {@link KeySSI} factory method according to the {@link KeySSIType}
 * @param {KeySSIType} type
 * @return {Function} KeySSI factory method
 *
 * @function
 * @memberOf OpenDSU.factory
 */
export function getKeySSIFactoryFromType(type: KeySSIType): KeySSIFactory{
    switch (type){
        case KeySSIType.ARRAY:
            return function(this: OpenDSURepository<DSUModel>, model: DSUModel, domain: string, specificKeyArgs: string[] | undefined, keyGenArgs: string[] | undefined, callback: KeySSIFactoryCallback){
                if (!domain || !Array.isArray(keyGenArgs) || !keyGenArgs.length)
                    return criticalCallback(new Error('Missing parameters'), callback);
                let keySSI: ArraySSI;

                const args: any[] = [domain, keyGenArgs, ...(specificKeyArgs || [])];

                try{
                    // @ts-ignore
                    keySSI = getKeySSIApi().createArraySSI(...args) as ArraySSI;
                } catch (e) {
                    return criticalCallback(new Error(`Could not create ArraySSI with args: ${args.join(' | ')}`), callback);
                }

                callback(undefined, {
                    keySSI: keySSI,
                    options: undefined
                });
            }
        case KeySSIType.WALLET:
            return function(this: OpenDSURepository<DSUModel>, model: DSUModel, domain: string, specificKeyArgs: string[] | undefined, keyGenArgs: string[] | undefined, callback: KeySSIFactoryCallback){
                if (!domain || !Array.isArray(keyGenArgs) || !keyGenArgs.length)
                    return criticalCallback(new Error('Missing parameters'), callback);

                const codePath = getOpenDSU().constants.CODE_FOLDER;

                const decorators = getPropertyDecorators(DsuKeys.REFLECT, model,
                    codePath.startsWith('/') ? codePath.substring(1) : codePath,
                    true);


                const args: any[] = [domain, keyGenArgs, ...(specificKeyArgs || [])];

                let seed: string = "";
                let keySSI: WalletSSI;

                try{
                    // @ts-ignore
                    keySSI = getKeySSIApi().createTemplateWalletSSI(...args) as WalletSSI;
                } catch (e) {
                    return criticalCallback(new Error(`Could not create WalletSSI with args: ${args.join(' | ')}`), callback);
                }

                callback(undefined, {
                    keySSI: keySSI,
                    options: {
                        dsuTypeSSI: seed
                    }
                });
            }
        case KeySSIType.SEED:
            return function(this: OpenDSURepository<DSUModel>, model: DSUModel, domain: string, specificKeyArgs: string[] | undefined, keyGenArgs: string[] | undefined, callback: KeySSIFactoryCallback) {
                if (!domain)
                    return criticalCallback(new Error('Missing parameters'), callback);
                if (keyGenArgs && keyGenArgs.length)
                    debug(`SeedSSi Factory function provided with KeyGen parameters. These will be discarded`);

                let keySSI: SeedSSI;

                const args: any[] = [domain, ...(specificKeyArgs || [])];

                try{
                    // @ts-ignore
                    keySSI = getKeySSIApi().createTemplateSeedSSI(...args) as SeedSSI;
                } catch (e) {
                    return criticalCallback(new Error(`Could not create SeedSSI with args: ${args.join(' | ')}`), callback);
                }

                callback(undefined, {
                    keySSI: keySSI,
                    options: undefined
                });
            }
        default:
            throw new LoggedError(`Unsupported KeySSI Type ${type}`);
    }
}

/**
 * Util method to retrieve the proper {@link DSU} factory method according to the {@link KeySSI} type
 * @param {KeySSIType} keySSIType
 *
 * @function
 * @memberOf OpenDSU.factory
 */
export function getDSUFactoryFromType(keySSIType: KeySSIType): DSUFactoryMethod {
    switch (keySSIType) {
        case KeySSIType.ARRAY:
        case KeySSIType.WALLET:
            return getResolverApi().createDSUForExistingSSI;
        case KeySSIType.SEED:
            return getResolverApi().createDSU;
        default:
            throw new LoggedError(`Unsupported DSU Factory ${keySSIType}`);
    }
}

/**
 * Util method to retrieve the proper {@link DSU} factory method according to the {@link KeySSI} type
 * @param {KeySSIType} keySSIType
 *
 * @return {DSUPostProcess | undefined}
 *
 * @function
 * @memberOf OpenDSU.factory
 */
export function getDSUPostProcess(keySSIType: KeySSIType): DSUPostProcess | undefined {
    switch (keySSIType) {
        case KeySSIType.WALLET:
            return (dsu: DSU, callback: SimpleDSUCallback) => {
                let writableDSU: DSU;
                try{
                    writableDSU = (dsu as WalletDsu).getWritableDSU();
                } catch (e) {
                    return criticalCallback(e as Error, callback)
                }
                callback(undefined, writableDSU);
            }
        default:
            return undefined;
    }
}

/**
 * @constant
 * @memberOf OpenDSU.factory
 */
export const DefaultSupportedKeySSIFactories = {
    ARRAY: KeySSIType.ARRAY,
    SEED: KeySSIType.SEED,
    WALLET: KeySSIType.WALLET
}

/**
 * @function
 * @memberOf OpenDSU.factory
 */
export function loadDefaultKeySSIFactories(): void {
    Object.values(DefaultSupportedKeySSIFactories).forEach(type =>
        getKeySSIFactoryRegistry().register(getKeySSIFactoryFromType(type as KeySSIType), type, getDSUFactoryFromType(type), getDSUPostProcess(type)));
}
