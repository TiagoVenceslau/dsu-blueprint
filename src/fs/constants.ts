/**
 * @namespace filesystem.constants
 * @memberOf filesystem
 */

/**
 * Reflection Keys for FileSystem
 *
 * @enum DsuFsKeys
 *
 * @memberOf filesystem.constants
 */
export const DsuFsKeys = {
    MOUNT_FS: "mountFS",
    ADD_FILE_FS: 'addFileFS',
    ADD_FOLDER_FS: 'addFolderFS'
}
/**
 * @enum FSOptions
 * @memberOf filesystem.constants
 */
export const FSOptions  = {
    // publicSecretsKey: '-$Identity-',
    // environmentKey: "-$Environment-",
    // basePath: "",
    // stripBasePathOnInstall: false,
    // walletPath: "",
    // hosts: "",
    seedFileName: "seed",
    // appsFolderName: "apps",
    // appFolderName: "app",
    // codeFolderName: "code",
    // initFile: "init.file",
    // environment: {},
    slots:{
        primary: "wallet-patch",
        secondary: "apps-patch"
    }
}