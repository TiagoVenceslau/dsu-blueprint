import {DSUModel} from "./DSUModel";
import {dsu, DSU} from "./decorators";
import {KeySSIType} from "../opendsu/types";
import {constructFromObject} from "@tvenceslau/db-decorators/lib";

@DSU(undefined, KeySSIType.SEED)
export class SeedDSU extends DSUModel{

}

@DSU(undefined, KeySSIType.WALLET)
export class WalletDSU extends DSUModel{

}

@DSU(undefined, KeySSIType.ARRAY)
export class ArrayDSU extends DSUModel{

}

@DSU(undefined, KeySSIType.SEED)
export class DbDsuBlueprint extends DSUModel{

    @dsu<SeedDSU>(SeedDSU)
    data?: SeedDSU = undefined;

    constructor(blueprint?: DbDsuBlueprint | {}) {
        super();
        constructFromObject<DbDsuBlueprint>(this, blueprint);
    }
}