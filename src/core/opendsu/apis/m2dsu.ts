import {DSU} from "../types";
import {Callback} from "@tvenceslau/db-decorators/lib";

export interface MappingEngine{
    digestMessages(messages: any): any;
}

export interface MessagePipe {
    queue: [];

    addInQueue(message: any): void;
    onNewGroup(callback: Callback): void;
}

export interface ErrMap {
    errorTypes: {};

    newCustomError(errorObj: any, detailsObj: any): any;
    getErrorKeyByCode(errCode: any): any;
    getErrorKeyByMessage(errMessage: string): any;
    addNewErrorType(key: string, code: any, message: string, detailsFn: Function): void;
}

export interface M2DsuApi {
    getMappingEngine(persistenceDSU: DSU, options: {}): MappingEngine;
    getMessagesPipe(): MessagePipe;
    getErrorsMap(): ErrMap;
    defineMapping(matchFunction: Function, mappingFunction: Function): void;
    defineApi(name: string, implementation: Function): void;
}