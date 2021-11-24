import {IoOptionsOrDSUCallback, KeySSI, SimpleDSUCallback} from "../opendsu/types";

export type ArraySSISpecificArgs = [vn: string, hint: string];

export type WalletSSISpecificArgs = [hint: string];

export type SeedSSISpecificArgs = [specificString: string, control: string, vn: string, hint: string];

export type DSUFactoryMethod = (keySSI: KeySSI, options?: IoOptionsOrDSUCallback, callback?: SimpleDSUCallback) => void;