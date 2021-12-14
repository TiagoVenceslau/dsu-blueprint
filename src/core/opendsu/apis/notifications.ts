import {DSUObservable} from "./mq";
import {KeySSI} from "./keyssi";
import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * Interface representing the OpenDSU 'notifications' Api Space
 *
 * @interface NotificationsApi
 *
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface NotificationsApi {
    publish(keySSI: KeySSI, message: string, timeout: number, callback: Callback): void;
    getObservableHandler(keySSI: KeySSI, timeout: number): DSUObservable;
    unsubscribe(observable: DSUObservable): void;
    isSubscribed(observable: DSUObservable): boolean;
}