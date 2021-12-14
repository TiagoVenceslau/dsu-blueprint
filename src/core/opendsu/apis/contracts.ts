import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * Interface representing the OpenDSU 'contracts' Api Space
 *
 * @interface ContractsApi
 *
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface ContractsApi {
    generateSafeCommand(domain: string, contractName: string, methodName: string, params: any, timestamp: any, callback: Callback): void;
    generateNoncedCommand(signerDID: any, domain: string, contractName: string, methodName: string, params: any, timestamp: any, callback: Callback): void;
    generateSafeCommandForSpecificServer(serverUrl: string, domain: string, contractName: string, methodName: string, params: any, callback: Callback): void;
    generateNoncedCommandForSpecificServer(serverUrl: string, signerDID: any, domain: string, contractName: string, methodName: string, params: any, timestamp: any, callback: Callback): void;
}