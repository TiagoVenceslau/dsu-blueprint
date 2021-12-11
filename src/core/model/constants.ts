/**
 * Identifying keys for reflection operations and other constants
 *
 * @enum
 */
export enum DsuKeys {
    REFLECT = 'opendsu.blueprint.',
    DEFAULT_DSU_PATH = 'info.json',
    CONSTRUCTOR = "constructor",
    FROM_CACHE = 'fromCache',
    DSU = 'dsu',
    DSU_FILE = 'dsuFile',
    MOUNT = 'mount'
}

/**
 * Describe the 3 distinct stages of a DSUOperation on a {@link DSUBlueprint}:
 *  - CREATION: handles the creation of all nested {@link DSU}s (typically from the {@link dsu} decorator)
 *  - CLASS: handles the creation of the actual 'end' {@link DSU} (typically from the {@link DSU} decorator)
 *  - EDITING: handles the editing of the end {@link DSU} and all its available operations:
 *   - {@link dsuFile}
 *   - {@link fromCache}
 *   - {@link mount}
 *
 * @enum
 */
export enum DSUOperation {
    CREATION = "creation",
    CLASS = 'class',
    EDITING = "editing"
}