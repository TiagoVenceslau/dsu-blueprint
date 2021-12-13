
/**
 * @namespace core.opendsu.api.workers
 * @memberOf core.opendsu.api
 */

/**
 * @interface WorkerPool
 *
 * @memberOf core.opendsu.api.workers
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
 * @memberOf core.opendsu.api
 */
export interface OpenDSUWorkersApi {
    createPool(options?: {}): WorkerPool;
    getFunctionsRegistry : {
        runSyncFunction(definition: {}): any,
        runSyncFunctionOnlyFromWorker(definition: {}): any
    }
}