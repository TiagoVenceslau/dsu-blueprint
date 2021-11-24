import {
    AnchoringOptsOrDSUCallback, DSU, ErrCallback,
    KeySSI,
    SimpleDSUCallback
} from "../opendsu/types";
import {DSUModel} from "../model";
import {DSUCallback, OpenDSURepository} from "./repository";
import {ModelCallback} from "@tvenceslau/db-decorators/lib";

export type ArraySSISpecificArgs = [vn: string, hint: string];

export type WalletSSISpecificArgs = [hint: string];

export type SeedSSISpecificArgs = [specificString: string, control: string, vn: string, hint: string];

export type DSUFactoryMethod = (keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback) => void;

export type DSUCreationHandler = <T extends DSUModel>(this: OpenDSURepository<T>, model: T, props: {}, callback: ModelCallback<T>) => void;

export type DSUEditingHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsu: DSU, keySSI: KeySSI, callback: DSUCallback<T>) => void;

export type DSUOperationHandler = DSUCreationHandler | DSUEditingHandler;