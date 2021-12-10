export interface SystemApi {
    getEnvironmentVariable(name: string): any,
    setEnvironmentVariable(name: string, value: any): void,
    getFS(): any,
    getPath(): any,
    getBaseURL(): string
}