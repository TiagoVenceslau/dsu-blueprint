/**
 * DSU Blueprint
 *
 * A decorator based approach to OpenDSU creation and management
 *
 * @module dsu-blueprint
 */




/**
 * Sequence Diagram for a Single {@link DSU} creation:
 * @class Teest
 *
 * @memberOf dsu-blueprint
 *
 * @mermaid
 *      sequenceDiagram
 *          System->>Repository:create(DSUModel, ...keyArgs, callback)
 *          Repository->>RepositoryLoop:onCreate(DSUModel, callback)
 *          RepositoryLoop->>RepositoryUtils.createFromDecorators(DSUModel)
 *          RepositoryUtils->>DSUPhaseLoop:handleCreationDecorators(DSUModel, decorators, callback)
 *          loop CreationDecorators
 *              DSUPhaseLoop->>Repository:create(DSUModel, ...keyArgs, callback)
 *              Repository->>DSUPhaseLoop: Updated DSUModel, created DSU
 *              DSUPhaseLoop->>DSUPhaseLoop: Cache DSU
 *          end
 *          DSUPhaseLoop->>RepositoryUtils: Updated DSUModel and cached DSUs
 *          RepositoryUtils->>DSUPhaseLoop:handleClassDecorators(DSUModel, decorators, callback);
 *          DSUPhaseLoop->>RepositoryUtils: Updated DSUModel and DSU
 *          RepositoryUtils->>DSUPhaseLoop:handleEditDecorators(DSUModel, cachedDSUs, dsu, decorators, callback)
 *          loop EditDecorators
 *              DSUPhaseLoop->>DSU:edit()
 *          end
 *          DSUPhaseLoop->>RepositoryUtils: Final DSUModel, DSU and KeySSI
 *          RepositoryUtils->>RepositoryLoop:afterCreate(DSUModel, DSU, KeySSI, callback)
 *          RepositoryLoop->>Repository: Final DSUModel, DSU and KeySSI
 *          Repository->>System: Final DSUModel, DSU and KeySSI
 */
export class Teest{}


export * from './core';
export * from './fs';

