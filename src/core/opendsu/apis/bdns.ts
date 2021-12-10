import {Callback} from "@tvenceslau/db-decorators/lib";

export interface BdnsApi {
    getRawInfo(dlDomain: string, callback: Callback): void;
    getBrickStorages(dlDomain: string, callback: Callback): void;
    getAnchoringServices(dlDomain: string, callback: Callback): void;
    getContractServices(dlDomain: string, callback: Callback): void;
    getReplicas(dlDomain: string, callback: Callback): void;
    getNotificationsEndpoints(dlDomain: string, callback: Callback): void;
    getMQEndpoints(dlDomain: string, callback: Callback): void;
    setBDNSHosts(dnHosts: any): void;
}