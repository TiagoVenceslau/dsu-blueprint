import {DSUCallback, DSUKey, OpenDSURepository} from "./repository";
import {ArrayDSU, DbDsuBlueprint, SeedDSU, WalletDSU} from "../model";
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

    create(model: ArrayDSU, ...args: any[]) {
        super.create(model, ...args);
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

    create(model: WalletDSU, ...args: any[]) {
        super.create(model, ...args);
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

export class DbDSURepository extends OpenDSURepository<DbDsuBlueprint>{
    constructor(){
        super(DbDsuBlueprint);
    }

    create(model: DbDsuBlueprint, callback: DSUCallback<DbDsuBlueprint>) {
        super.create(model, callback);
    }

    delete(key: DSUKey, callback: ErrCallback) {
        super.delete(key, callback);
    }

    read(key: DSUKey, callback: DSUCallback<DbDsuBlueprint>) {
        super.read(key, callback);
    }

    update(key: DSUKey, model: DbDsuBlueprint, callback: DSUCallback<DbDsuBlueprint>) {
        super.update(key, model, callback);
    }
}