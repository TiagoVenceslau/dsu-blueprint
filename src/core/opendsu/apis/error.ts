import {Callback, Err} from "@tvenceslau/db-decorators/lib";
/**
 * Interface representing the OpenDSU 'error'' Api Space
 *
 * @interface ErrorApi
 *
 * @memberOf core.opendsu.api
 */
export interface ErrorApi {
    createOpenDSUErrorWrapper(message: string, err: Err, otherErrors?: []): void;
    reportUserRelevantError(message: string): void;
    reportUserRelevantWarning(message: string): void;
    reportUserRelevantInfo(message: string): void;
    reportDevRelevantInfo(message: string): void;
    observeUserRelevantMessages(type: any, callback: Callback): void;
    unobserveUserRelevantMessages(type: any, callback: Callback): void;
    OpenDSUSafeCallback(callback: Callback): void;
    registerMandatoryCallback(callback: Callback, timeout: number): void;
    printOpenDSUError(...args: any[]): void;
}