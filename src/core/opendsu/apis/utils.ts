/**
 * Interface representing the OpenDSU 'util' Api Space
 *
 * @interface OpenDSUUtilsApi
 *
 * @memberOf core.opendsu.api
 */
export interface OpenDSUUtilsApi {
    bindAutoPendingFunctions(obj: any, exceptionList: []): void;
}