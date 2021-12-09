import {DSUOperationHandler} from "./types";
import {DSU} from "../opendsu";
import {OpenDSURepository} from "./repository";
import {DSUModel} from "../model";
import {IRegistry} from "@tvenceslau/decorator-validation/lib/utils/registry";
import {all, CriticalError} from "@tvenceslau/db-decorators/lib";
import {getModelRegistry} from "@tvenceslau/decorator-validation/lib";

export class DSUOperationRegistry implements IRegistry<DSUOperationHandler>{
    private cache: { [indexer: string]: any } = {};

    get<DSUOperationHandler>(targetName: string, propKey: string, operation: string, phase: string): DSUOperationHandler | undefined {
        try{
            return this.cache[targetName][propKey][operation][phase];
        } catch (e){
            all(e);
            return undefined;
        }
    }

    register<DSUOperationHandler>(handler: DSUOperationHandler, operation: string, phase: string, target: { [indexer: string]: any }, propKey: string | symbol): void {
        const name = target.constructor.name;
        if (!this.cache[name])
            this.cache[name] = {};
        if (!this.cache[name][propKey])
            this.cache[name][propKey] = {};
        if (!this.cache[name][propKey][operation])
            this.cache[name][propKey][operation] = {};
        if (this.cache[name][propKey][operation][phase])
            return;
        this.cache[name][propKey][operation][phase] = handler;
    }
}

let actingDSUOperationsRegistry: IRegistry<DSUOperationHandler>;

/**
 * Returns the current {@link DSUOperationRegistry}
 * @function getDSUOperationsRegistry
 * @return IRegistry<DSUOperationHandler>, defaults to {@link DSUOperationRegistry}
 * @memberOf repository
 */
export function getDSUOperationsRegistry(): IRegistry<DSUOperationHandler> {
    if (!actingDSUOperationsRegistry)
        actingDSUOperationsRegistry = new DSUOperationRegistry();
    return actingDSUOperationsRegistry;
}

/**
 * Returns the current DSUOperationsRegistry
 * @function getDSUOperationsRegistry
 * @prop {IRegistry<DSUOperationHandler>} dsuOperationsRegistry the new implementation of Registry
 * @memberOf repository
 */
export function setDSUOperationsRegistry(operationsRegistry: IRegistry<DSUOperationHandler>){
    actingDSUOperationsRegistry = operationsRegistry;
}

export class DSURegistry implements IRegistry<DSU>{
    private cache: { [indexer: string]: any } = {};

    get<DSU>(name: string): DSU | undefined {
        try{
            return this.cache[name].dsu;
        } catch (e){
            all(e);
            return undefined;
        }
    }

    register<DSU>(dsu: DSU, name: string): void {
        if (!this.cache[name])
            this.cache[name] = {
                dsu: dsu
            };
    }
}

let actingDSURegistry: IRegistry<DSU>;

/**
 * Returns the current {@link DSURegistry}
 * @function getDSUOperationsRegistry
 * @return IRegistry<DSUOModel>, defaults to {@link DSURegistry}
 * @memberOf repository
 */
export function getDSURegistry(): IRegistry<DSU> {
    if (!actingDSURegistry)
        actingDSUOperationsRegistry = new DSURegistry();
    return actingDSURegistry;
}

/**
 * Returns the current DSURegistry
 * @function getDSURegistry
 * @prop {IRegistry<DSU>} dsuOperationsRegistry the new implementation of Registry
 * @memberOf repository
 */
export function setDSURegistry(dsuRegistry: IRegistry<DSU>){
    actingDSURegistry = dsuRegistry;
}

export type OpenDSURepo = OpenDSURepository<DSUModel>;

export type OpenDSURepoFactory = {new(): OpenDSURepo}

export class RepositoryRegistry implements IRegistry<OpenDSURepo>{
    private cache: { [indexer: string]: any } = {};

    get<OpenDSURepo>(clazz: {new(): DSUModel} | string): OpenDSURepo | undefined {
        const name = typeof clazz === 'string' ? clazz : (clazz.constructor ? clazz.constructor.name : clazz.name);
        try{
            return this.cache[name].instance || this.instantiateRepo(clazz as {new(): DSUModel});
        } catch (e){
            return undefined;
        }
    }

    private instantiateRepo(clazz: {new(): DSUModel}, repo?: OpenDSURepoFactory): OpenDSURepository<DSUModel>{
        const name = clazz.constructor ? clazz.constructor.name : clazz.name;
        try {
            // if (typeof clazz === 'string')
            //     clazz = getModelRegistry().get(clazz);
            const instance = repo ? new repo() : new OpenDSURepository<DSUModel>(clazz);
            this.cache[name] = {
                repo: name,
                instance: instance
            }
            return instance;
        } catch (e){
            throw new CriticalError(e);
        }
    }

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
 * @function getDSUOperationsRegistry
 * @return RepositoryRegistry
 * @memberOf repository
 */
export function getRepoRegistry(): RepositoryRegistry {
    if (!actingRepoRegistry)
        actingRepoRegistry = new RepositoryRegistry();
    return actingRepoRegistry;
}

/**
 * Returns the current DSURegistry
 * @function getDSURegistry
 * @prop {RepositoryRegistry} dsuOperationsRegistry the new implementation of Registry
 * @memberOf repository
 */
export function setRepoRegistry(repoRegistry: RepositoryRegistry){
    actingRepoRegistry = repoRegistry;
}