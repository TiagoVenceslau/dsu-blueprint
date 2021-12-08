import {
    AnchoringOptsOrDSUCallback, DSU,
    KeySSI,
    SimpleDSUCallback
} from "../opendsu/types";
import {DSUModel} from "../model";
import {DSUCallback, OpenDSURepository, ReadCallback} from "./repository";
import {DSUCache} from "./cache";

export type ArraySSISpecificArgs = [vn: string, hint: string];

export type WalletSSISpecificArgs = [hint: string];

export type SeedSSISpecificArgs = [specificString: string, control: string, vn: string, hint: string];

export type DSUFactoryMethod = (keySSI: KeySSI, options?: AnchoringOptsOrDSUCallback, callback?: SimpleDSUCallback) => void;

export type DSUCreationHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: any, callback: DSUCallback<T>) => void;

export type DSUCreationUpdateHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, oldModel: T, dsu: DSU, decorator: any, callback: DSUCallback<T>) => void;

export type DSUEditingHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T | {[indexer: string]: any}, dsu: DSU, decorator: any, callback: DSUCallback<T> | ReadCallback) => void;

export type DSUOperationHandler = DSUCreationHandler | DSUEditingHandler | DSUCreationUpdateHandler;