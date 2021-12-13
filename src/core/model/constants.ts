/**
 * Identifying keys for reflection operations and other constants
 *
 * @enum DsuKeys
 *
 * @memberOf core.model
 */
export enum DsuKeys {
    REFLECT = 'opendsu.blueprint.',
    DEFAULT_DSU_PATH = 'info.json',
    CONSTRUCTOR = "constructor",
    FROM_CACHE = 'fromCache',
    FROM_URL = 'fromURL',
    FROM_WEB = 'fromWeb',
    ENVIRONMENT = "environment",
    WALLET = "wallet",
    DSU = 'dsu',
    DSU_FILE = 'dsuFile',
    MOUNT = 'mount'
}

/**
 * Describe the 4 distinct stages of a DSUOperation on a {@link DSUBlueprint}:
 *  - PREPARATION: handles dependencies for the build process:
 *   - {@link fromWeb}: the the preparation phase retrieves the Seed from the Web, Sets up '@mount' to later perform the mounting operation
 *  - CREATION: handles the creation of all nested {@link DSU}s (typically from the {@link dsu} decorator)
 *  - CLASS: handles the creation of the actual 'end' {@link DSU} (typically from the {@link DSU} decorator)
 *  - EDITING: handles the editing of the end {@link DSU} and all its available operations:
 *   - {@link dsuFile}
 *   - {@link fromCache}
 *   - {@link mount}
 *
 *   Sequence Diagram for a Single {@link DSU} creation:
 *   @mermaid
 *      sequenceDiagram
 *          System->>Repository:create(DSUModel, ...keyArgs, callback)
 *          Repository->>RepositoryLoop:onCreate(DSUModel, callback)
 *          RepositoryLoop->>RepositoryUtils.createFromDecorators(DSUModel)
 *          RepositoryUtils->>DSUPhaseLoop:handleCreationDecorators(DSUModel, decorators, callback)
 *          loop CreationDecorators
 *             DSUPhaseLoop->>Repository:create(DSUModel, ...keyArgs, callback)
 *             Repository->>DSUPhaseLoop: Updated DSUModel, created DSU
 *             DSUPhaseLoop->>DSUPhaseLoop: Cache DSU
 *          end
 *          DSUPhaseLoop->>RepositoryUtils: Updated DSUModel and cached DSUs
 *          RepositoryUtils->>DSUPhaseLoop:handleClassDecorators(DSUModel, decorators, callback);
 *          DSUPhaseLoop->>RepositoryUtils: Updated DSUModel and DSU
 *          RepositoryUtils->>DSUPhaseLoop:handleEditDecorators(DSUModel, cachedDSUs, dsu, decorators, callback)
 *          loop EditDecorators
 *             DSUPhaseLoop->>DSU:edit()
 *          end
 *          DSUPhaseLoop->>RepositoryUtils: Final DSUModel, DSU and KeySSI
 *          RepositoryUtils->>RepositoryLoop:afterCreate(DSUModel, DSU, KeySSI, callback)
 *          RepositoryLoop->>Repository: Final DSUModel, DSU and KeySSI
 *          Repository->>System: Final DSUModel, DSU and KeySSI
 *
 *  * Note:
 *      - RepositoryLoop: Set of hooks one can use to attach functionality ('on'/'after' based decorators):
 *          - onCreate: Used to update server bound properties on the model and perform static and dynamic validation;
 *          - onRead: Not used;
 *          - onDelete: Not used;
 *          - onUpdate: Used to update server bound properties on the model and perform static, dynamic and versioned validation;
 *          - analog implementations for afterCreate, afterRead, afterDelete and afterUpdate...
 *      - RepositoryUtils: Functional Library Repositories depend on;
 *      - DSUPhaseLoop: Order in which the different decorators ares processed during a DSU Blueprint creation/update/read/delete process:
 *          - Creation decorators: property decorators that create new DSUs like {@link dsu}. Since these are nested, these run first and their success is mandatory to continue the operation;
 *          - Class decorators: {@link DSUBlueprint} decorators, responsible for creating the actual DSU from its Blueprint via {@link OpenDSURepository#create}
 *          - Edit decorators: property decorators that edit the recently created {@link DSU}:
 *              - {@link dsuFile}: writes files;
 *              - {@link fromCache}: mounts a previously created DSU
 *              - {@link fromWeb}: mounts a DSU from the ApiHub or WebService
 *              - {@link mount}: mounts a predefined KeySSI
 *              - also {@link FileSystem} related ones, {@link addFileFS}, etc...
 *       - DSU: the {@link DSU} object
 * @enum DSUOperationPhase
 *
 * @memberOf core.model
 */
export enum DSUOperationPhase {
    PREPARATION = 'preparation',
    CREATION = "creation",
    CLASS = 'class',
    EDITING = "editing"
}