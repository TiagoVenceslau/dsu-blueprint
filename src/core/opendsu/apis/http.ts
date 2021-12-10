import {Callback} from "@tvenceslau/db-decorators/lib";

export interface HttpApi {
    fetch(url: string, options?: {}): Promise<any>;
    doGet(url: string, options: {} | undefined, callback: Callback): void;
    doPost(url: string, options: {} | undefined, callback: Callback): void;
    doPut(url: string, options: {} | undefined, callback: Callback): void;
}