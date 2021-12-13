import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * Interface representing the OpenDSU 'bricking' Api Space
 *
 * @interface BrickingApi
 *
 * @memberOf core.opendsu.api
 */
export interface BrickingApi {
    getBrick(hashLinkSSI: any, authToken: string, callback: Callback): void;
    putBrick(domain: string, brick: ReadableStream, authToken: string, callback: Callback): void;
    getMultipleBricks(hashLinkSSIList: [], authToken: string, callback: Callback): void;
}