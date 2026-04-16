export declare enum ClineErrorType {
    Auth = "auth",
    Network = "network",
    RateLimit = "rateLimit",
    Balance = "balance"
}
interface ErrorDetails {
    status?: number;
    request_id?: string;
    code?: string;
    modelId?: string;
    providerId?: string;
    message?: string;
    details?: any;
}
export declare class ClineError extends Error {
    readonly title = "ClineError";
    readonly _error: ErrorDetails;
    constructor(message: string, details?: ErrorDetails);
    static parse(error: any): ClineError;
    static getErrorType(err: ClineError): ClineErrorType | undefined;
}
export declare class AuthInvalidTokenError extends Error {
    constructor(message?: string);
}
export {};
//# sourceMappingURL=ClineError.d.ts.map