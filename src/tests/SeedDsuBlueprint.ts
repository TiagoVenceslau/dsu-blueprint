import {constructFromObject, DBOperations, readonly, timestamp} from "@tvenceslau/db-decorators/lib";
import {maxlength, minlength, required, max, min} from "@tvenceslau/decorator-validation/lib";
import {DSUBlueprint, dsuFile, DSUModel} from "../core";

@DSUBlueprint("default")
export class SeedDSUBlueprint extends DSUModel{

    @required()
    @minlength(5)
    @maxlength(15)
    @readonly()
    @dsuFile("info.json")
    name?: string = undefined;

    @max(15)
    @min(1)
    @dsuFile("info.json")
    count?: number = undefined;

    @timestamp(DBOperations.CREATE)
    @dsuFile("__metadata.json")
    createdOn?: Date = undefined;

    @timestamp()
    @dsuFile("metadata.json")
    updatedOn?: Date = undefined;

    constructor(seedDSuModel?: SeedDSUBlueprint | {}){
        super();
        constructFromObject(this, seedDSuModel);
    }
}