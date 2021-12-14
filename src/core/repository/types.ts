import {
    DSU
} from "../opendsu/types";
import {DSUClassCreationMetadata, DSUCreationMetadata, DSUEditMetadata, DSUModel} from "../model";
import {DSUCallback, DSUEditDecorator, OpenDSURepository, ReadCallback} from "./repository";
import {DSUCache} from "./cache";
import {ModelCallback} from "@tvenceslau/db-decorators/lib";
import {DSUPreparationMetadata} from "../web";

/**
 * @typedef DSUPreparationHandler
 * @memberOf dsu-blueprint.core.repository
 */
export type DSUPreparationHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUPreparationMetadata, callback: ModelCallback<T>) => void;

/**
 * @typedef DSUCreationHandler
 * @memberOf dsu-blueprint.core.repository
 */
export type DSUCreationHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUCreationMetadata, ...keyGenArgs: (string | ModelCallback<T>)[]) => void;
/**
 * @typedef DSUClassCreationHandler
 * @memberOf dsu-blueprint.core.repository
 */
export type DSUClassCreationHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, decorator: DSUClassCreationMetadata, ...keyGenArgs: (string | DSUCallback<T>)[]) => void;
/**
 * @typedef DSUCreationUpdateHandler
 * @memberOf dsu-blueprint.core.repository
 */
export type DSUCreationUpdateHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T, oldModel: T, dsu: DSU, decorator: any, callback: DSUCallback<T>) => void;
/**
 * @typedef DSUEditingHandler
 * @memberOf dsu-blueprint.core.repository
 */
export type DSUEditingHandler = <T extends DSUModel>(this: OpenDSURepository<T>, dsuCache: DSUCache<T>, model: T | {[indexer: string]: any}, dsu: DSU, decorator: DSUEditMetadata, callback: DSUCallback<T> | ReadCallback) => void;
/**
 * @typedef DSUOperationHandler Union of {@link DSUCreationHandler}, {@link DSUEditingHandler}, {@link DSUCreationUpdateHandler} and {@link DSUClassCreationHandler}
 * @memberOf dsu-blueprint.core.repository
 */
export type DSUOperationHandler = DSUCreationHandler | DSUEditingHandler | DSUCreationUpdateHandler | DSUClassCreationHandler | DSUPreparationHandler;