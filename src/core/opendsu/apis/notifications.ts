import {DSUObservable} from "./mq";
import {KeySSI} from "./keyssi";
import {Callback} from "@tvenceslau/db-decorators/lib";


export interface NotificationsApi {
    publish(keySSI: KeySSI, message: string, timeout: number, callback: Callback): void;
    getObservableHandler(keySSI: KeySSI, timeout: number): DSUObservable;
    unsubscribe(observable: DSUObservable): void;
    isSubscribed(observable: DSUObservable): boolean;
}