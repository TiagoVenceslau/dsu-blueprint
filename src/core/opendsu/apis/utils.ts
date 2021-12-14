/**
 * Interface representing the OpenDSU 'util' Api Space
 *
 * @interface OpenDSUUtilsApi
 *
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface OpenDSUUtilsApi {
    bindAutoPendingFunctions(obj: any, exceptionList: []): void;
}