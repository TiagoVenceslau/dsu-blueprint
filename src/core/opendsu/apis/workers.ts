
export interface WorkerPool {
    environment: string;

    runSyncFunction(apiSpaceName: string, functionName: string, ...params: any[]): any;
    runSyncFunctionOnlyByWorker(apiSpaceName: string, functionName: string, ...params: any[]): any;
}

export interface OpenDSUWorkers {
    createPool(options?: {}): WorkerPool;
    getFunctionsRegistry : {
        runSyncFunction(definition: {}): any,
        runSyncFunctionOnlyFromWorker(definition: {}): any
    }
}