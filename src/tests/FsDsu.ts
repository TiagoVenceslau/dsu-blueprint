import {DBOperations, readonly, timestamp} from "@tvenceslau/db-decorators/lib";
import {constructFromObject, maxlength, minlength, required} from "@tvenceslau/decorator-validation/lib";
import {DSUBlueprint, DSUModel} from "../core";

/**
 * @class FSDSUModel
 *
 * @category Tests
 */
@DSUBlueprint(undefined)
export class FSDSUModel extends DSUModel{

    @required()
    @minlength(5)
    @maxlength(15)
    @readonly()
    name?: string = undefined;

    @timestamp(DBOperations.CREATE)
    createdOn?: Date = undefined;

    @timestamp()
    updatedOn?: Date = undefined;

    constructor(fsDsuModel: FSDSUModel | {}){
        super();
        constructFromObject(this, fsDsuModel);
    }
}