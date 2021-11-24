import {IRegistry} from "@tvenceslau/db-decorators/lib";
import {DSUOperationHandler} from "./types";

export class DSUOperationRegistry implements IRegistry<DSUOperationHandler>{
    private cache: { [indexer: string]: any } = {};

    get<DSUOperationHandler>(targetName: string, propKey: string, operation: string): DSUOperationHandler | undefined {
        try{
            return this.cache[targetName][propKey][operation];
        } catch (e){
            return undefined;
        }
    }

    register<DSUOperationHandler>(handler: DSUOperationHandler, operation: string, target: { [indexer: string]: any }, propKey: string | symbol): void {
        const name = target.constructor.name;
        if (!this.cache[name])
            this.cache[name] = {};
        if (!this.cache[name][propKey])
            this.cache[name][propKey] = {};
        if (this.cache[name][propKey][operation])
            return;
        this.cache[name][propKey][operation] = handler;
    }
}

let actingDSUOperationsRegistry: IRegistry<DSUOperationHandler>;

/**
 * Returns the current {@link DSUOperationsRegistry}
 * @function getDSUOperationsRegistry
 * @return IRegistry<DSUOperationHandler>, defaults to {@link DSUOperationsRegistry}
 * @memberOf operations
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
 * @memberOf operations
 */
export function setDSUOperationsRegistry(operationsRegistry: IRegistry<DSUOperationHandler>){
    actingDSUOperationsRegistry = operationsRegistry;
}