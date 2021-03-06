import {DSU} from "../types";
import {Callback} from "@tvenceslau/db-decorators/lib";

/**
 * @namespace dsu-blueprint.core.opendsu.api.m2dsu
 * @memberOf dsu-blueprint.core.opendsu.api
 */

/**
 * @interface MappingEngine
 *
 * @memberOf dsu-blueprint.core.opendsu.api.m2dsu
 */
export interface MappingEngine{
    digestMessages(messages: any): any;
}

/**
 * @interface MessagePipe
 *
 * @memberOf dsu-blueprint.core.opendsu.api.m2dsu
 */
export interface MessagePipe {
    queue: [];

    addInQueue(message: any): void;
    onNewGroup(callback: Callback): void;
}

/**
 * @interface ErrMap
 *
 * @memberOf dsu-blueprint.core.opendsu.api.m2dsu
 */
export interface ErrMap {
    errorTypes: {};

    newCustomError(errorObj: any, detailsObj: any): any;
    getErrorKeyByCode(errCode: any): any;
    getErrorKeyByMessage(errMessage: string): any;
    addNewErrorType(key: string, code: any, message: string, detailsFn: Function): void;
}

/**
 * Interface representing the OpenDSU 'm2dsu' Api Space
 *
 * @interface M2DsuApi
 *
 * @memberOf dsu-blueprint.core.opendsu.api
 */
export interface M2DsuApi {
    getMappingEngine(persistenceDSU: DSU, options: {}): MappingEngine;
    getMessagesPipe(): MessagePipe;
    getErrorsMap(): ErrMap;
    defineMapping(matchFunction: Function, mappingFunction: Function): void;
    defineApi(name: string, implementation: Function): void;
}