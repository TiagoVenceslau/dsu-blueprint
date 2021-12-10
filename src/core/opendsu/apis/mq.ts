import {DSUDid} from "./w3cdid";
import {KeySSI} from "./keyssi";
import {Callback} from "@tvenceslau/db-decorators/lib";

export interface DSUObservable {

}

export interface MessageQueueApi {
    send(keySSI: KeySSI, message: any, callback: Callback): void;
    getHandler(keySSI: KeySSI, timeout: number): DSUObservable;
    unsubscribe(keySSI: KeySSI, observable: any): void;
    getMQHandlerForDID(didDocument: DSUDid, domain: string, timeout: number): DSUObservable;
}