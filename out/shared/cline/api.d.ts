declare enum CLINE_API_AUTH_ENDPOINTS {
    AUTH = "/api/v1/auth/authorize",
    REFRESH_TOKEN = "/api/v1/auth/refresh"
}
declare enum CLINE_API_ENDPOINT_V1 {
    TOKEN_EXCHANGE = "/api/v1/auth/token",
    USER_INFO = "/api/v1/users/me",
    ACTIVE_ACCOUNT = "/api/v1/users/active-account",
    REMOTE_CONFIG = "/api/v1/organizations/{id}/remote-config",
    API_KEYS = "/api/v1/organizations/{id}/api-keys"
}
export declare const CLINE_API_ENDPOINT: {
    TOKEN_EXCHANGE: CLINE_API_ENDPOINT_V1.TOKEN_EXCHANGE;
    USER_INFO: CLINE_API_ENDPOINT_V1.USER_INFO;
    ACTIVE_ACCOUNT: CLINE_API_ENDPOINT_V1.ACTIVE_ACCOUNT;
    REMOTE_CONFIG: CLINE_API_ENDPOINT_V1.REMOTE_CONFIG;
    API_KEYS: CLINE_API_ENDPOINT_V1.API_KEYS;
    AUTH: CLINE_API_AUTH_ENDPOINTS.AUTH;
    REFRESH_TOKEN: CLINE_API_AUTH_ENDPOINTS.REFRESH_TOKEN;
};
export {};
//# sourceMappingURL=api.d.ts.map