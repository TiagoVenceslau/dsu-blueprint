import {constructFromObject, DBOperations, readonly, timestamp} from "@tvenceslau/db-decorators/lib";
import {maxlength, minlength, required} from "@tvenceslau/decorator-validation/lib";
import {DSUBlueprint, DSUModel} from "../core";

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