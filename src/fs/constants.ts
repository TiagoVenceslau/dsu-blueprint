/**
 * Reflection Keys for FileSystem
 *
 * @constant
 *
 * @category Constants
 * @memberOf filesystem
 */
export const DsuFsKeys = {
    MOUNT_FS: "mountFS",
    ADD_FILE_FS: 'addFileFS',
    ADD_FOLDER_FS: 'addFolderFS'
}
/**
 * @const
 * @namespace constants
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