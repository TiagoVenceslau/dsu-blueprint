import {CriticalError} from "@tvenceslau/db-decorators/lib";
import {OpenDSU} from "./types";
import {ResolverApi} from "./apis/resolver";
import {KeyssiApi} from "./apis/keyssi";
import {HttpApi} from "./apis/http";
import {BdnsApi, ConfigApi, ConstantsApi, CrypoApi, DBApi, EnclaveApi, SecurityContextApi, SystemApi} from "./apis";
import {loadDefaultKeySSIFactories} from "./factory";

let openDSU: OpenDSU;

/**
 * performs some forced lazy initialization and returns the {@link OpenDSU} object
 *
 * @return OpenDSU the {@link OpenDSU} object;
 * @throws {CriticalError} when it fails to load
 *
 * @function getOpenDSU
 *
 * @memberOf core.opendsu
 */
export function getOpenDSU(): OpenDSU {
    if (!openDSU){
        try{
            openDSU = require('opendsu');
            loadDefaultKeySSIFactories();
        } catch (e) {
            throw new CriticalError(`Could not load OpenDSU`)
        }
    }

    return openDSU;
}

let resolver: ResolverApi;

/**
 * @return ResolverApi the {@link ResolverApi} object;
 * @throws {CriticalError} when it fails to load
 *
 * @function geResolverApi
 *
 * @memberOf core.opendsu
 */
export function getResolverApi(): ResolverApi{
    if (!resolver)
        try {
            resolver = getOpenDSU().loadApi('resolver') as ResolverApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Resolver: ${e.message | e}`);
        }

    return resolver;
}

let keyssi: KeyssiApi;

/**
 * @return KeyssiApi the {@link KeyssiApi} object;
 * @throws {CriticalError} when it fails to load
 *
 * @function getKeySSIApi
 *
 * @memberOf core.opendsu
 */
export function getKeySSIApi(): KeyssiApi{
    if (!keyssi)
        try {
            keyssi = getOpenDSU().loadApi('keyssi') as KeyssiApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU KeySSI Space: ${e.message | e}`);
        }

    return keyssi;
}

let $$Cache: any = undefined;

/**
 * @return any the OpenDSU $$ object;
 * @throws {CriticalError} when it fails to load
 *
 * @function get$$
 *
 * @memberOf core.opendsu
 */
export function get$$(){
    if (!$$Cache)
        try {
            // @ts-ignore
            $$Cache = $$;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU $$ Space: ${e.message | e}`);
        }

    return $$Cache;
}

let httpApi: HttpApi;

/**
 * @return HttpApi
 * @throws {CriticalError} when it fails to load
 *
 * @function getHttpApi
 *
 * @memberOf core.opendsu
 */
export function getHttpApi(): HttpApi{
    if (!httpApi)
        try {
            httpApi =  getOpenDSU().loadApi('http') as HttpApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Http Space: ${e.message | e}`);
        }

    return httpApi;
}

let scApi: SecurityContextApi;

/**
 * @return SecurityContextApi
 * @throws {CriticalError} when it fails to load
 *
 * @function getSCApi
 *
 * @memberOf core.opendsu
 */
export function getSCApi(): SecurityContextApi{
    if (!scApi)
        try {
            scApi =  getOpenDSU().loadApi('sc') as SecurityContextApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Security Context Space: ${e.message | e}`);
        }

    return scApi;
}

let systemApi: SystemApi;

/**
 * @return SystemApi
 * @throws {CriticalError} when it fails to load
 *
 * @function getSystemApi
 *
 * @memberOf core.opendsu
 */
export function getSystemApi(): SystemApi {
    if (!systemApi)
        try {
            systemApi =  getOpenDSU().loadApi('system') as SystemApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU System Space: ${e.message | e}`);
        }

    return systemApi;
}

let constantsApi: ConstantsApi;

/**
 * @return ConstantsApi
 * @throws {CriticalError} when it fails to load
 *
 * @function getConstantsApi
 *
 * @memberOf core.opendsu
 */
export function getConstantsApi(): ConstantsApi {
    if (!constantsApi)
        try {
            constantsApi =  getOpenDSU().constants;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Constants Space: ${e.message | e}`);
        }

    return constantsApi;
}

let BDNSApi: BdnsApi;

/**
 * @return BdnsApi
 * @throws {CriticalError} when it fails to load
 *
 * @function getBdnsApi
 *
 * @memberOf core.opendsu
 */
export function getBdnsApi(): BdnsApi {
    if (!BDNSApi)
        try {
            BDNSApi =  getOpenDSU().loadApi('bdns') as BdnsApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Bdns Space: ${e.message | e}`);
        }

    return BDNSApi;
}

let configApi: ConfigApi;

/**
 * @return ConfigApi
 * @throws {CriticalError} when it fails to load
 *
 * @function getConfigApi
 *
 * @memberOf core.opendsu
 */
export function getConfigApi(): ConfigApi {
    if (!configApi)
        try {
            configApi =  getOpenDSU().loadApi('config') as ConfigApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Config Space: ${e.message | e}`);
        }

    return configApi;
}

let dbApi: DBApi;

/**
 * @return DBApi
 * @throws {CriticalError} when it fails to load
 *
 * @function getDBApi
 *
 * @memberOf core.opendsu
 */
export function getDBApi(): DBApi {
    if (!dbApi)
        try {
            dbApi =  getOpenDSU().loadApi('db') as DBApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU DB Space: ${e.message | e}`);
        }

    return dbApi;
}

let enclaveApi: EnclaveApi;

/**
 * @return EnclaveApi
 * @throws {CriticalError} when it fails to load
 *
 * @function getEnclaveApi
 *
 * @memberOf core.opendsu
 */
export function getEnclaveApi(): EnclaveApi {
    if (!enclaveApi)
        try {
            enclaveApi =  getOpenDSU().loadApi('enclave') as EnclaveApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Enclave Space: ${e.message | e}`);
        }

    return enclaveApi;
}

let cryptoApi: CrypoApi;

/**
 * @return CryptoApi
 * @throws {CriticalError} when it fails to load
 *
 * @function getCryptoApi
 *
 * @memberOf core.opendsu
 */
export function getCrypoApi(): CrypoApi {
    if (!cryptoApi)
        try {
            cryptoApi =  getOpenDSU().loadApi('crypto') as CrypoApi;
        } catch (e: any){
            throw new CriticalError(`Could not load DSU Config Space: ${e.message | e}`);
        }

    return cryptoApi;
}