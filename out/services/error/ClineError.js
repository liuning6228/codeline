"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthInvalidTokenError = exports.ClineError = exports.ClineErrorType = void 0;
// Simplified ClineError implementation for build purposes
const ClineAccount_1 = require("../../shared/ClineAccount");
var ClineErrorType;
(function (ClineErrorType) {
    ClineErrorType["Auth"] = "auth";
    ClineErrorType["Network"] = "network";
    ClineErrorType["RateLimit"] = "rateLimit";
    ClineErrorType["Balance"] = "balance";
})(ClineErrorType || (exports.ClineErrorType = ClineErrorType = {}));
const RATE_LIMIT_PATTERNS = [/status code 429/i, /rate limit/i, /too many requests/i, /quota exceeded/i, /resource exhausted/i];
// Simple serializeError replacement
function serializeError(err) {
    if (!err)
        return {};
    if (typeof err === 'object') {
        return {
            message: err.message || String(err),
            name: err.name,
            stack: err.stack,
            ...err
        };
    }
    return { message: String(err) };
}
class ClineError extends Error {
    title = "ClineError";
    _error;
    constructor(message, details) {
        super(message);
        this._error = details || {};
    }
    static parse(error) {
        if (error instanceof ClineError) {
            return error;
        }
        const serialized = serializeError(error);
        const details = {
            message: serialized.message,
            status: serialized.status || serialized.statusCode,
            code: serialized.code,
            request_id: serialized.request_id || serialized.requestId,
            modelId: serialized.modelId,
            providerId: serialized.providerId,
            details: serialized.details
        };
        return new ClineError(details.message || "Unknown error", details);
    }
    static getErrorType(err) {
        const { code, status, details } = err._error;
        const message = (err._error?.message || err.message || JSON.stringify(err._error))?.toLowerCase();
        // Check balance error first (most specific)
        if (code === "insufficient_credits" && typeof details?.current_balance === "number") {
            return ClineErrorType.Balance;
        }
        // Check auth errors
        const isAuthStatus = status !== undefined && status > 400 && status < 429;
        if (code === "ERR_BAD_REQUEST" || isAuthStatus) {
            return ClineErrorType.Auth;
        }
        if (message) {
            // Check for specific error codes/messages if applicable
            const authErrorRegex = [/(?:in)?valid[-_ ]?(?:api )?(?:token|key)/i, /authentication[-_ ]?failed/i, /unauthorized/i];
            if (message?.includes(ClineAccount_1.CLINE_ACCOUNT_AUTH_ERROR_MESSAGE) || authErrorRegex.some((regex) => regex.test(message))) {
                return ClineErrorType.Auth;
            }
            // Check rate limit patterns
            const lowerMessage = message.toLowerCase();
            if (RATE_LIMIT_PATTERNS.some((pattern) => pattern.test(lowerMessage))) {
                return ClineErrorType.RateLimit;
            }
        }
        return undefined;
    }
}
exports.ClineError = ClineError;
// For compatibility with imports expecting AuthInvalidTokenError
class AuthInvalidTokenError extends Error {
    constructor(message = "Invalid authentication token") {
        super(message);
        this.name = "AuthInvalidTokenError";
    }
}
exports.AuthInvalidTokenError = AuthInvalidTokenError;
//# sourceMappingURL=ClineError.js.map