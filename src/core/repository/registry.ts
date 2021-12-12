import {DSUOperationHandler} from "./types";
import {OpenDSURepository} from "./repository";
import {DSUModel} from "../model";
import {IRegistry} from "@tvenceslau/decorator-validation/lib/utils/registry";
import {all, CriticalError, debug} from "@tvenceslau/db-decorators/lib";

/**
 * @namespace core.repository.registry
 * @memberOf core.repository
 */

/**
 * Stores and handles all {@link DSUOperationHandler}s
 *
 * @class DSUOperationRegistry
 *
 * @implements {IRegistry<DSUOperationHandler>}
 *
 * @memberOf core.repository.registry
 */
export class DSUOperationRegistry implements IRegistry<DSUOperationHandler>{
    private cache: { [indexer: string]: any } = {};

    /**
     * Retrieves a {@link DSUOperationHandler}
     *
     * @param {string} targetName the {@link DSUModel}'s name
     * @param {string} propKey the {@link DSUModel}'s property name
     * @param {string} operation the {@link DBOpe}
     * @param {string} phase
     * @return DSUOperationHandler | undefined
     */
    get<DSUOperationHandler>(targetName: string, propKey: string, operation: string, phase: string): DSUOperationHandler | undefined {
        try{
            all(`[{0}] - Trying to retrieve a DSUOperationHandler under {1}.`, this.constructor.name, [targetName, propKey, operation, phase].join(' | '))
            return this.cache[targetName][propKey][operation][phase];
        } catch (e: any){
            debug(e);
            return undefined;
        }
    }

    /**
     * Registers a {@link DSUOperationHandler}
     *
     * @param {DSUOperationHandler} handler
     * @param {string} operation on of {@link DBKeys}
     * @param {DSUOperation} phase
     * @param {any} target
     * @param {string} propKey
     */
    register<DSUOperationHandler>(handler: DSUOperationHandler, operation: string, phase: string, target: { [indexer: string]: any }, propKey: string | symbol): void {
        const name = target.constructor.name;
        if (!this.cache[name])
            this.cache[name] = {};
        if (!this.cache[name][propKey])
            this.cache[name][propKey] = {};
        if (!this.cache[name][propKey][operation])
            this.cache[name][propKey][operation] = {};
        if (this.cache[name][propKey][operation][phase]){
            debug(`[{0}] - Trying to register a second DSUOperation handler under {1}. Ignoring!`, this.constructor.name, [name,propKey, operation, phase].join(' | '));
            return;
        }
        this.cache[name][propKey][operation][phase] = handler;
        all(`[{0}] - Registration of DSUOperation handler under {1} successful`, this.constructor.name, [name,propKey, operation, phase].join(' | '))
    }
}

let actingDSUOperationsRegistry: IRegistry<DSUOperationHandler>;

/**
 * Returns the current {@link DSUOperationRegistry}
 *
 * @function getDSUOperationSRegistry
 * 
 * @return IRegistry<DSUOperationHandler>, defaults to {@link DSUOperationRegistry}
 * @memberOf core.repository.registry
 */
export function getDSUOperationsRegistry(): IRegistry<DSUOperationHandler> {
    if (!actingDSUOperationsRegistry)
        actingDSUOperationsRegistry = new DSUOperationRegistry();
    return actingDSUOperationsRegistry;
}

/**
 * Returns the current DSUOperationsRegistry
 * 
 * @prop {IRegistry<DSUOperationHandler>} dsuOperationsRegistry the new implementation of Registry
 *
 * @function setDSUOperationsRegistry
 *
 * @memberOf core.repository.registry
 */
export function setDSUOperationsRegistry(operationsRegistry: IRegistry<DSUOperationHandler>){
    actingDSUOperationsRegistry = operationsRegistry;
}

/**
 * @typedef OpenDSURepo
 * @memberOf core.repository.registry
 */
export type OpenDSURepo = OpenDSURepository<DSUModel>;
/**
 * @typedef OpenDSURepoFactory
 * @memberOf core.repository.registry
 */
export type OpenDSURepoFactory = {new(): OpenDSURepo}

/**
 * @class RepositoryRegistry
 *
 * @implements IRegistry
 *
 * @memberOf core.repository.registry
 */
export class RepositoryRegistry implements IRegistry<OpenDSURepo>{
    private cache: { [indexer: string]: any } = {};

    /**
     * Retrieves an {@link OpenDSURepo}
     *
     * @param {{new: DSUModel}} clazz
     * @return {OpenDSURepo | undefined}
     */
    get<OpenDSURepo>(clazz: {new(): DSUModel} | string): OpenDSURepo | undefined {
        const name = typeof clazz === 'string' ? clazz : (clazz.constructor ? clazz.constructor.name : clazz.name);
        try{
            return this.cache[name].instance || this.instantiateRepo(clazz as {new(): DSUModel});
        } catch (e){
            return undefined;
        }
    }

    /**
     * Instantiates an {@link OpenDSURepo}
     *
     * @param {{new: DSUModel}} clazz
     * @param {OpenDSURepoFactory} [repo]
     * @private
     */
    private instantiateRepo(clazz: {new(): DSUModel}, repo?: OpenDSURepoFactory): OpenDSURepository<DSUModel>{
        const name = clazz.constructor ? clazz.constructor.name : clazz.name;
        try {
            const instance = repo ? new repo() : new OpenDSURepository<DSUModel>(clazz);
            this.cache[name] = {
                repo: name,
                instance: instance
            }
            return instance;
        } catch (e){
            throw new CriticalError(e as Error);
        }
    }

    /**
     *
     * @param {{new: DSUModel} | Function | string} clazz
     * @param {OpenDSURepoFactory} [repo]
     * @param {boolean} [isCustom] defaults to false
     */
    // @ts-ignore
    register<OpenDSURepo>(clazz: {new(): DSUModel} | string | Function, repo?: OpenDSURepoFactory, isCustom: boolean = false): void {
        const name = typeof clazz === 'string' ? clazz : (clazz.constructor && clazz.constructor.name !== 'Function' ? clazz.constructor.name : clazz.name);
        if (!this.cache[name] || isCustom)
            this.cache[name] = {
                repo: repo,
                instance: undefined
            };
    }
}

let actingRepoRegistry: RepositoryRegistry;

/**
 * Returns the current {@link IRegistry<OpenDSURepo>y}
 * 
 * @return RepositoryRegistry
 *
 * @function getRepoRegistry
 *
 * @memberOf core.repository.registry
 */
export function getRepoRegistry(): RepositoryRegistry {
    if (!actingRepoRegistry)
        actingRepoRegistry = new RepositoryRegistry();
    return actingRepoRegistry;
}

/**
 * Returns the current DSURegistry
 * 
 * @prop {RepositoryRegistry} dsuOperationsRegistry the new implementation of Registry
 *
 * @function setRepoRegistry
 *
 * @memberOf core.repository.registry
 */
export function setRepoRegistry(repoRegistry: RepositoryRegistry){
    actingRepoRegistry = repoRegistry;
}