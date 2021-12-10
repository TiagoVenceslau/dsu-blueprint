import {DSUModel} from "./DSUModel";
import {dsu, DSUBlueprint} from "./decorators";
import {constructFromObject} from "@tvenceslau/db-decorators/lib";
import {KeySSIType} from "../opendsu/apis/keyssi";

@DSUBlueprint(undefined, KeySSIType.SEED)
export class SeedDSU extends DSUModel{

}

@DSUBlueprint(undefined, KeySSIType.WALLET)
export class WalletDSU extends DSUModel{

}

@DSUBlueprint(undefined, KeySSIType.ARRAY)
export class ArrayDSU extends DSUModel{

}

@DSUBlueprint(undefined, KeySSIType.SEED)
export class DbDsuBlueprint extends DSUModel{

    @dsu<SeedDSU>(SeedDSU)
    data?: SeedDSU = undefined;

    constructor(blueprint?: DbDsuBlueprint | {}) {
        super();
        constructFromObject<DbDsuBlueprint>(this, blueprint);
        this.data = new SeedDSU(this.data);
    }
}