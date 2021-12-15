import DBModel from "@tvenceslau/db-decorators/lib/model/DBModel";
import {constructFromObject} from "@tvenceslau/decorator-validation/lib";

/**
 * Base implementation for a DSU Model
 *
 * @extends DBModel
 *
 * @class DSUModel
 */
export class DSUModel extends DBModel{
    constructor(dsuModel?: DSUModel | {}) {
        super();
        constructFromObject<DSUModel>(this, dsuModel);
    }
}