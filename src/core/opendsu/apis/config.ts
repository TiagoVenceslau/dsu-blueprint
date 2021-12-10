import {Callback} from "@tvenceslau/db-decorators/lib";

export interface ConfigApi {
    set(key: string, value: any): void;
    get(key: string): any;
    setEnv(key: string, value: any, callback: Callback): void,
    getEnv(key: string, callback: Callback): void;
    autoconfigFromEnvironment(environment: {}): void,
    disableLocalVault(): void
}