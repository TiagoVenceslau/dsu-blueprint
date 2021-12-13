
/**
 * Interface representing the OpenDSU 'system' Api Space
 *
 * @interface SystemApi
 *
 * @memberOf core.opendsu.api
 */
export interface SystemApi {
    getEnvironmentVariable(name: string): any,
    setEnvironmentVariable(name: string, value: any): void,
    getFS(): any,
    getPath(): any,
    getBaseURL(): string
}