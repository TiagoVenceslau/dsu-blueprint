import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * Interface representing the OpenDSU Config Api Space
 *
 * @interface ConfigApi
 * @memberOf core.opendsu.api
 */
export interface ConfigApi {
    /**
     *
     * @param key
     * @param value
     */
    set(key: string, value: any): void;

    /**
     *
     * @param key
     */
    get(key: string): any;

    /**
     *
     * @param key
     * @param value
     * @param callback
     */
    setEnv(key: string, value: any, callback: Callback): void,

    /**
     *
     * @param key
     * @param callback
     */
    getEnv(key: string, callback: Callback): void;

    /**
     *
     * @param environment
     */
    autoconfigFromEnvironment(environment: {}): void,

    /**
     *
     */
    disableLocalVault(): void
}