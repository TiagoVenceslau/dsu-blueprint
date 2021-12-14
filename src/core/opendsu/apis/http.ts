import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * Interface representing the OpenDSU 'httpe' Api Space
 *
 * @interface HttpApi
 *
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface HttpApi {
    fetch(url: string, options?: {}): Promise<any>;
    doGet(url: string, options: {} | undefined, callback: Callback): void;
    doPost(url: string, options: {} | undefined, callback: Callback): void;
    doPut(url: string, options: {} | undefined, callback: Callback): void;
}