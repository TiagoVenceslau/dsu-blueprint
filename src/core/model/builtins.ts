import {DSUModel} from "./DSUModel";
import {dsu, DSUBlueprint} from "./decorators";
import {constructFromObject} from "@tvenceslau/db-decorators/lib";
import {KeySSIType} from "../opendsu/apis/keyssi";
import {fromWeb} from "../web";
import {ConstantsApi} from "../opendsu";

/**
 * Built In {@link DSUBlueprint} for the Base KeySSI type {@link SeedSSI}
 *
 * This class is decorated via {@link DSUBlueprint} with:
 *  - domain: undefined;
 *  - keySSIType: {@link KeySSIType.SEED}
 *
 * @class SeedDSU
 *
 * @memberOf core.model
 */
@DSUBlueprint(undefined, KeySSIType.SEED)
export class SeedDSU extends DSUModel{

}

/**
 * Built In {@link DSUBlueprint} for the Base KeySSI type {@link WalletSSI}
 *
 * This class is decorated via {@link DSUBlueprint} with:
 *  - domain: undefined;
 *  - keySSIType: {@link KeySSIType.Wallet}
 *
 * @class WalletDSU
 *
 * @memberOf core.model
 */
@DSUBlueprint(undefined, KeySSIType.WALLET)
export class WalletDSU extends DSUModel{
    /**
     * Placeholder where the wallet code will be mounted.
     * Property name <strong> has to be</strong> {@link ConstantsApi#CODE_FOLDER}
     */
    @fromWeb('dsu-blueprint', "primary")
    code?: string = undefined;
}

/**
 * Built In {@link DSUBlueprint} for the Base KeySSI type {@link ArraySSI}
 *
 * This class is decorated via {@link DSUBlueprint} with:
 *  - domain: undefined;
 *  - keySSIType: {@link KeySSIType.ARRAY}
 *
 * @class ArrayDSU
 *
 * @memberOf core.model
 */
@DSUBlueprint(undefined, KeySSIType.ARRAY)
export class ArrayDSU extends DSUModel{

}

/**
 * Built In {@link DSUBlueprint} for a {@link DBApi} database
 *
 * This class is decorated via {@link DSUBlueprint} with:
 *  - domain: undefined;
 *  - keySSIType: {@link KeySSIType.SEED}
 *
 * @class DbDsuBlueprint
 *
 * @memberOf core.model
 */
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