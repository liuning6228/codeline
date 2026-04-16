"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRequestyServiceStringUrl = exports.toRequestyServiceUrl = void 0;
const REQUESTY_BASE_URL = "https://router.requesty.ai/v1";
const replaceCname = (baseUrl, type) => {
    if (type === "router") {
        return baseUrl;
    }
    else {
        return baseUrl.replace("router", type).replace("v1", "");
    }
};
const toRequestyServiceUrl = (baseUrl, service = "router") => {
    const url = replaceCname(baseUrl || REQUESTY_BASE_URL, service);
    try {
        return new URL(url);
    }
    catch (e) {
        return undefined;
    }
};
exports.toRequestyServiceUrl = toRequestyServiceUrl;
const toRequestyServiceStringUrl = (baseUrl, service = "router") => {
    return (0, exports.toRequestyServiceUrl)(baseUrl, service)?.toString();
};
exports.toRequestyServiceStringUrl = toRequestyServiceStringUrl;
//# sourceMappingURL=requesty.js.map