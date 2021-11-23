import {DSUCallback, DSUKey, OpenDSURepository} from "./repository";
import {ArrayDSU, SeedDSU, WalletDSU} from "../model";
import {ErrCallback} from "../opendsu/types";

export class SeedDSURepository extends OpenDSURepository<SeedDSU>{
    constructor(){
        super(SeedDSU);
    }

    create(model: SeedDSU, callback: DSUCallback<SeedDSU>) {
        super.create(model, callback);
    }

    delete(key: DSUKey, callback: ErrCallback) {
        super.delete(key, callback);
    }

    read(key: DSUKey, callback: DSUCallback<SeedDSU>) {
        super.read(key, callback);
    }

    update(key: DSUKey, model: SeedDSU, callback: DSUCallback<SeedDSU>) {
        super.update(key, model, callback);
    }
}

export class ArrayDSURepository extends OpenDSURepository<ArrayDSU>{
    constructor(){
        super(ArrayDSU);
    }

    create(model: ArrayDSU, callback: DSUCallback<ArrayDSU>) {
        super.create(model, callback);
    }

    delete(key: DSUKey, callback: ErrCallback) {
        super.delete(key, callback);
    }

    read(key: DSUKey, callback: DSUCallback<ArrayDSU>) {
        super.read(key, callback);
    }

    update(key: DSUKey, model: ArrayDSU, callback: DSUCallback<ArrayDSU>) {
        super.update(key, model, callback);
    }
}

export class WalletDSURepository extends OpenDSURepository<WalletDSU>{
    constructor(){
        super(WalletDSU);
    }

    create(model: WalletDSU, callback: DSUCallback<WalletDSU>) {
        super.create(model, callback);
    }

    delete(key: DSUKey, callback: ErrCallback) {
        super.delete(key, callback);
    }

    read(key: DSUKey, callback: DSUCallback<WalletDSU>) {
        super.read(key, callback);
    }

    update(key: DSUKey, model: WalletDSU, callback: DSUCallback<WalletDSU>) {
        super.update(key, model, callback);
    }
}