import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";
import {constructFromObject} from "@tvenceslau/db-decorators/lib";

/**
 * Base implementation for a DSU Model
 *
 * @extends DBModel
 *
 * @class DSUModel
 *
 * @memberOf core.model
 */
export class DSUModel extends DBModel{
    constructor(dsuModel?: DSUModel | {}) {
        super();
        constructFromObject<DSUModel>(this, dsuModel);
    }
}