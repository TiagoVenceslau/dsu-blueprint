import {
    DSU
} from "../opendsu/types";
import {DSUClassCreationMetadata, DSUCreationMetadata, DSUModel} from "../model";
import {DSUCallback, OpenDSURepository, ReadCallback} from "./repository";
import {DSUCache} from "./cache";
import {ModelCallback} from "@tvenceslau/db-decorators/lib";

export type DSUCreationHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUCreationMetadata, ...keyGenArgs: (string | ModelCallback<T>)[]) => void;

export type DSUClassCreationHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUClassCreationMetadata, ...keyGenArgs: (string | DSUCallback<T>)[]) => void;

export type DSUCreationUpdateHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, oldModel: T, dsu: DSU, decorator: any, callback: DSUCallback<T>) => void;

export type DSUEditingHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T | {[indexer: string]: any}, dsu: DSU, decorator: any, callback: DSUCallback<T> | ReadCallback) => void;

export type DSUOperationHandler = DSUCreationHandler | DSUEditingHandler | DSUCreationUpdateHandler | DSUClassCreationHandler;