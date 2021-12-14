import {DSUDid} from "./w3cdid";
import {KeySSI} from "./keyssi";
import {Callback} from "@tvenceslau/db-decorators/lib";
/**
 * @namespace dsu-blueprint.core.opendsu.api.mq
 * @memberOf dsu-blueprint.core.opendsu.api
 */

/**
 * @interface DSUObservable
 *
 * @memberOf dsu-blueprint.core.opendsu.api.mq
 */
export interface DSUObservable {

}

/**
 * Interface representing the OpenDSU 'mq' Api Space
 *
 * @interface MessageQueueApi
 *
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface MessageQueueApi {
    send(keySSI: KeySSI, message: any, callback: Callback): void;
    getHandler(keySSI: KeySSI, timeout: number): DSUObservable;
    unsubscribe(keySSI: KeySSI, observable: any): void;
    getMQHandlerForDID(didDocument: DSUDid, domain: string, timeout: number): DSUObservable;
}