import {constructFromObject, DBOperations, readonly, timestamp} from "@tvenceslau/db-decorators/lib";
import {maxlength, minlength, required, max, min} from "@tvenceslau/decorator-validation/lib";
import {DSUBlueprint, DSUModel} from "../core";

@DSUBlueprint("default")
export class SeedDSUModel extends DSUModel{

    @required()
    @minlength(5)
    @maxlength(15)
    @readonly()
    name?: string = undefined;

    @max(15)
    @min(1)
    count?: number = undefined;

    @timestamp(DBOperations.CREATE)
    createdOn?: Date = undefined;

    @timestamp()
    updatedOn?: Date = undefined;

    constructor(seedDSuModel?: SeedDSUModel | {}){
        super();
        constructFromObject(this, seedDSuModel);
    }
}