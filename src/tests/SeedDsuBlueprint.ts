import {DBOperations, readonly, timestamp} from "@tvenceslau/db-decorators/lib";
import {maxlength, minlength, required, max, min, constructFromObject} from "@tvenceslau/decorator-validation/lib";
import {DSUBlueprint, dsuFile, DsuKeys, DSUModel} from "../core";

/**
 * @class SeedDSUBlueprint
 *
 * @category Tests
 */
@DSUBlueprint("default")
export class SeedDSUBlueprint extends DSUModel{

    @required()
    @minlength(5)
    @maxlength(15)
    @readonly()
    @dsuFile(DsuKeys.DEFAULT_DSU_PATH)
    name?: string = undefined;

    @max(15)
    @min(1)
    @dsuFile(DsuKeys.DEFAULT_DSU_PATH)
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