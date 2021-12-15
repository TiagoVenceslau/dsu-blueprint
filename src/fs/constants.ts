/**
 * @namespace dsu-blueprint.filesystem.constants
 * @memberOf dsu-blueprint.filesystem
 */

/**
 * Reflection Keys for FileSystem
 *
 * @enum DsuFsKeys
 *
 * @category Constants
 */
export const DsuFsKeys = {
    MOUNT_FS: "mountFS",
    ADD_FILE_FS: 'addFileFS',
    ADD_FOLDER_FS: 'addFolderFS'
}
/**
 * @enum FSOptions
 * @category Constants
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