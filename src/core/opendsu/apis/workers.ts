
/**
 * @namespace dsu-blueprint.core.opendsu.api.workers
 * @memberOf dsu-blueprint.core.opendsu.api
 */

/**
 * @interface WorkerPool
 *
 * @memberOf dsu-blueprint.core.opendsu.api.workers
 */
export interface WorkerPool {
    environment: string;

    runSyncFunction(apiSpaceName: string, functionName: string, ...params: any[]): any;
    runSyncFunctionOnlyByWorker(apiSpaceName: string, functionName: string, ...params: any[]): any;
}

/**
 * Interface representing the OpenDSU 'workers' Api Space
 *
 * @interface OpenDSUWorkersApi
 *
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface OpenDSUWorkersApi {
    createPool(options?: {}): WorkerPool;
    getFunctionsRegistry : {
        runSyncFunction(definition: {}): any,
        runSyncFunctionOnlyFromWorker(definition: {}): any
    }
}