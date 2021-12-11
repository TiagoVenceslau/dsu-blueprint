import {DSUModel} from "./DSUModel";
import {IRegistry} from "@tvenceslau/decorator-validation/lib/utils/registry";

export type DSUModelFactory = {new(): DSUModel}

export class DSUModelRegistryImp implements IRegistry<DSUModelFactory>{
    private cache: {[indexer: string]: DSUModelFactory} = {};

    get<DSUModelFactory>(key: any, ...args: any[]): DSUModelFactory | undefined {
        if (!(key in this.cache))
            return;
        // @ts-ignore
        return this.cache[key];
    }

    register<DSUModelFactory>(obj: DSUModelFactory): void {
        // @ts-ignore
        if (!(obj.constructor.name in this.cache))
            { // @ts-ignore
                this.cache[obj.constructor.name] = obj;
            }
    }
}

let activeDSUModelRegistry: IRegistry<DSUModelFactory>;

export function getDSUModelRegistry(){
    if (!activeDSUModelRegistry)
        activeDSUModelRegistry = new DSUModelRegistryImp();
    return activeDSUModelRegistry;
}

export function setDSUModelRegistry(dsuModelRegistry: IRegistry<DSUModelFactory>){
    activeDSUModelRegistry = dsuModelRegistry;
}