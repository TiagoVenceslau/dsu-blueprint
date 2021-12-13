import {Err} from "@tvenceslau/db-decorators/lib";

/**
 * @namespace core.opendsu.api.oauth
 * @memberOf core.opendsu.api
 */

/**
 * @interface OAuthStorage
 *
 * @memberOf core.opendsu.api.oauth
 */
export interface OAuthStorage {
    get(key: string): any;
    getJSON(key: string): {}
    set(key: string, value: any): void;
    setJSON(key: string, value: any): void;
    remove(key: string):void;
}

/**
 * @interface DecodedToken
 *
 * @memberOf core.opendsu.api.oauth
 */
export interface DecodedToken {
    header: string,
    payload: string,
    signature: any
}

/**
 * @interface OIDC
 *
 * @memberOf core.opendsu.api.oauth
 */
export interface OIDC {
    setPeriodicRefreshTimeout(): void;
    periodicRefresh(): void;
    reconcile(): void;
    getToken(decoded?: boolean): any;
    isAccessTokenInStorage(): boolean;
    isTokenSetExpiring(threshold: number): boolean;
    isCallbackPhaseActive(): boolean;
    refreshTokenSet(): void;
    refreshWithRefreshToken(): void;
    refreshWithIFrame(): void;
    refreshWithPopup(prompt: any): void;
    isRedirectInProgress(): boolean;
    beginAuthentication(): any;
    resumeAuthentication(): any;
    handleAuthorizationResponse(context: any, authorizationResponse: any): any;
    getInteraction(type: any): any;
    handleOAuthHttpResponse(response: any): any;
    updateStorageWithTokenSet(tokenSet: any): any;
    decodeToken(token: any): DecodedToken;
    cleanUpAuthorizationStorage(): void;
    cleanUpTokenStorage(): void;
    resetAuthentication(err: Err): any;
}

/**
 * Interface representing the OpenDSU 'oauth' Api Space
 *
 * @interface OAuthApi
 *
 * @memberOf core.opendsu.api
 */
export interface OAuthApi {
    createOIDC(options: {}): OIDC;
    getStorage: () => OAuthStorage;
    constants: {}
}