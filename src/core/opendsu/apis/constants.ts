/**
 * Environment Types
 *
 * @interface EnvironmentTypes
 * @namespace OpenDSU.api.constants
 * @memberOf OpenDSU.api
 */
export interface EnvironmentTypes {
    /**
     * Environment Type Browser. defaults to 'browser'
     */
    BROWSER_ENVIRONMENT_TYPE: string,
    /**
     * Environment Type Mobile. defaults to 'mobile-browser'
     */
    MOBILE_BROWSER_ENVIRONMENT_TYPE: string,
    /**
     * Environment Type Web Worker. defaults to 'web-worker'
     */
    WEB_WORKER_ENVIRONMENT_TYPE: string,
    /**
     * Environment Type Service Worker. defaults to 'service-worker'
     */
    SERVICE_WORKER_ENVIRONMENT_TYPE: string,
    /**
     * Environment Type Isolated. defaults to 'isolate'
     */
    ISOLATE_ENVIRONMENT_TYPE: string,
    /**
     * Environment Type Thread. defaults to 'thread'
     */
    THREAD_ENVIRONMENT_TYPE: string,
    /**
     * Environment Type NodeJs. defaults to 'nodejs'
     */
    NODEJS_ENVIRONMENT_TYPE: string,
}

/**
 * Interface representing the OpenDSU Constants
 *
 * @interface ConstantsApi
 * @memberOf OpenDSU.api
 */
export interface ConstantsApi {
    /**
     * Environment Types. defaults to {@link ENVIRONMENT_TYPES}
     */
    ENVIRONMENT_TYPES: EnvironmentTypes,
    /**
     * the default code folder in ssapps. defaults to '/code'
     */
    CODE_FOLDER: string,
    /**
     * the default constitution folder in ssapps. defaults to '/code/constitution'
     */
    CONSTITUTION_FOLDER: string,
    /**
     * the default blockchain. defaults to '/blockchain'
     */
    BLOCKCHAIN_FOLDER: string,
    /**
     * the default app folder in ssapps. defaults to '/app'
     */
    APP_FOLDER: string,
    /**
     * the default path to the identity file. defaults to './domain_identity'
     */
    DOMAIN_IDENTITY_FILE: string,
    /**
     * the default assets folder in ssapps. defaults to '/assets'
     */
    ASSETS_FOLDER: string,
    /**
     * the default transactions folder in Apihub. defaults to '/transactions'
     */
    TRANSACTIONS_FOLDER: string,
    /**
     * the default apps folder in Wallet ssapps. defaults to '/apps'
     */
    APPS_FOLDER: string,
    /**
     * the default data folder. defaults to '/data'
     */
    DATA_FOLDER: string,
    /**
     * the default manifest file path in ssapps. defaults to '/manifest'
     */
    MANIFEST_FILE: string,
    /**
     * the BDNS ROOT HOST system config variable. defaults to 'BDNS_ROOT_HOSTS'
     */
    BDNS_ROOT_HOSTS: string,
    /**
     * the default environment file path in ssapps. defaults to '/environment.json'
     */
    ENVIRONMENT_PATH: string,
    /**
     * The security context KeySSI name. defaults to 'scKeySSI'
     */
    SECURITY_CONTEXT_KEY_SSI: string,
    /**
     * the default vault domains. defaults to 'vaultDomain'
     */
    VAULT_DOMAIN: string,
    /**
     * defaults to 'domain'
     */
    DOMAIN: string,
    /**
     * defaults to 'didDomain'
     */
    DID_DOMAIN: string,
    /**
     * main enclave types
     */
    MAIN_ENCLAVE: {
        /**
         * Keyword for main Enclave Type. defaults to 'enclaveType'
         */
        TYPE: string,
        /**
         * DID main enclave type name. defaults to 'enclaveDID'
         */
        DID: string,
        /**
         * KeySSI main enclave type name. defaults to 'enclaveKeySSI'
         */
        KEY_SSI: string
    },
    /**
     * shared enclave types
     */
    SHARED_ENCLAVE: {
        /**
         * Keyword for Enclave Type. defaults to 'sharedEnclaveType'
         */
        TYPE: string,
        /**
         * Shared DID enclave type name. defaults to 'sharedEnclaveDID'
         */
        DID: string,
        /**
         * Shared KeySSI enclave type name. defaults to 'sharedEnclaveDID'
         */
        KEY_SSI: string,
    },
    /**
     * enclave types
     */
    ENCLAVE_TYPES: {
        /**
         * Wallet enclave type name. defaults to 'WalletDBEnclave'
         */
        WALLET_DB_ENCLAVE: string,
        /**
         * Memory enclave type name. defaults to 'MemoryEnclave'
         */
        MEMORY_ENCLAVE: string,
        /**
         * Apihub enclave type name. defaults to 'ApihubEnclave'
         */
        APIHUB_ENCLAVE: string,
        /**
         * High Security enclave type name. defaults to 'HighSecurityEnclave'
         */
        HIGH_SECURITY_ENCLAVE: string
    },
    /**
     * cache types
     */
    CACHE: {
        /**
         * Filesystem cache type. defaults to 'fs'
         */
        FS: string,
        /**
         * Memory cache type. defaults to 'memory'
         */
        MEMORY: string,
        /**
         * Indexed DB cache type. defaults to 'cache.indexedDB'
         */
        INDEXED_DB: string,
        /**
         * Vault cache type. defaults to 'cache.vaultType'
         */
        VAULT_TYPE: string,
        /**
         * Base Folder for fs caching. defaults to 'internal-volume/cache'
         */
        BASE_FOLDER: string,
        /**
         * Base folder config. defaults to 'fsCache.baseFolder'
         */
        BASE_FOLDER_CONFIG_PROPERTY: string,
        /**
         * Encrypted bricks cache type. defaults to 'encrypted-bricks-cache'
         */
        ENCRYPTED_BRICKS_CACHE: string,
        /**
         * Anchoring cache type. defaults to 'anchoring-cache'
         */
        ANCHORING_CACHE: string,
        /**
         * no cache type. defaults to 'no-cache'
         */
        NO_CACHE: string
    },
    /**
     * Domain keywords
     */
    DOMAINS: {
        /**
         * Name for Vault domain. defaults to 'vault'
         */
        VAULT: string
    },
    /**
     * Vault domain definitions
     */
    VAULT:{
        /**
         * Name for bricks. defaults to 'bricks'
         */
        BRICKS_STORE: string,
        /**
         * Name for anchors. defaults to 'anchors'
         */
        ANCHORS_STORE: string
    },
    /**
     * Name for Vault domain. defaults to 'brickDomain'
     */
    BRICKS_DOMAIN_KEY: string,
    /**
     * Loader Environments
     */
    LOADER_ENVIRONMENT_JSON:{
        /**
         * Agent keyword. defaults to 'agent'
         */
        AGENT: "agent",
        /**
         * server agent. defaults to 'server'
         */
        SERVER: "server",
        /**
         * vault agent. defaults to 'vault'
         */
        VAULT: "vault",
        /**
         * mobile agent. defaults to 'mobile'
         */
        MOBILE: "mobile",
    },
    /**
     * Boot config file name. defaults to 'boot-cfg.json'
     */
    BOOT_CONFIG_FILE: string,
    KEY_SSIS: () => any,
    CRYPTO_FUNCTION_TYPES: () => any
}