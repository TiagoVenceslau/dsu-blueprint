import {DSUModel} from "./DSUModel";
import {IRegistry} from "@tvenceslau/decorator-validation/lib/utils/registry";

/**
 * @typedef DSUModelFactory
 * @memberOf dsu-blueprint.core.model
 */
export type DSUModelFactory = {new(): DSUModel}

/**
 * @class DSUModelRegistryImp
 * @implements IRegistry<DSUModelFactory>
 */
export class DSUModelRegistryImp implements IRegistry<DSUModelFactory>{
    private cache: {[indexer: string]: DSUModelFactory} = {};

    /**
     *
     * @param {string} key
     * @param {any[]} args
     * @return {DSUModelFactory | undefined}
     */
    get<DSUModelFactory>(key: any, ...args: any[]): DSUModelFactory | undefined {
        if (!(key in this.cache))
            return;
        // @ts-ignore
        return this.cache[key];
    }

    /**
     *
     * @param {DSUModelFactory} obj
     */
    register<DSUModelFactory>(obj: DSUModelFactory): void {
        // @ts-ignore
        if (!(obj.constructor.name in this.cache))
            { // @ts-ignore
                this.cache[obj.constructor.name] = obj;
            }
    }
}

let activeDSUModelRegistry: IRegistry<DSUModelFactory>;

/**
 * @function getDSUModelRegistry
 *
 * @memberOf dsu-blueprint.core.model
 */
export function getDSUModelRegistry(){
    if (!activeDSUModelRegistry)
        activeDSUModelRegistry = new DSUModelRegistryImp();
    return activeDSUModelRegistry;
}

/**
 *
 * @param {IRegistry<DSUModelFactory>} dsuModelRegistry
 *
 * @function setDSUModelRegistry
 *
 * @memberOf dsu-blueprint.core.model
 */
export function setDSUModelRegistry(dsuModelRegistry: IRegistry<DSUModelFactory>){
    activeDSUModelRegistry = dsuModelRegistry;
}