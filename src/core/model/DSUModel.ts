import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";
import {constructFromObject} from "@tvenceslau/db-decorators/lib";


export class DSUModel extends DBModel{
    constructor(dsuModel?: DSUModel | {}) {
        super();
        constructFromObject<DSUModel>(this, dsuModel);
    }
}