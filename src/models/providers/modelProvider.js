"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModelProvider = void 0;
/**
 * 基础提供者抽象类
 * 提供一些通用实现
 */
var BaseModelProvider = /** @class */ (function () {
    function BaseModelProvider() {
    }
    BaseModelProvider.prototype.testConnection = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // 发送一个简单的测试请求
                        return [4 /*yield*/, this.generate('Hello', config)];
                    case 1:
                        // 发送一个简单的测试请求
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Connection test failed for ".concat(this.name, ":"), error_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BaseModelProvider.prototype.validateConfig = function (config) {
        // 基础验证：API密钥不能为空
        return !!config.apiKey && config.apiKey.trim().length > 0;
    };
    BaseModelProvider.prototype.getConfigHint = function () {
        return "\u8BF7\u8BBE\u7F6E".concat(this.name, "\u7684API\u5BC6\u94A5");
    };
    /**
     * 通用HTTP请求方法
     */
    BaseModelProvider.prototype.makeRequest = function (url_1, data_1, headers_1) {
        return __awaiter(this, arguments, void 0, function (url, data, headers, timeout) {
            var axios, proxyConfig, httpProxy, httpsProxy, proxyUrl, proxyUrl, axiosConfig, response, error_2, errorDetails;
            if (timeout === void 0) { timeout = 60000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        axios = require('axios');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        proxyConfig = {};
                        httpProxy = process.env.http_proxy || process.env.HTTP_PROXY;
                        httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
                        // 调试信息：记录网络配置
                        console.log("[CodeLine] Making request to: ".concat(url));
                        console.log("[CodeLine] Proxy config - http: ".concat(httpProxy || 'none', ", https: ").concat(httpsProxy || 'none'));
                        console.log("[CodeLine] Timeout: ".concat(timeout, "ms"));
                        if (httpsProxy) {
                            proxyUrl = new URL(httpsProxy);
                            proxyConfig.host = proxyUrl.hostname;
                            proxyConfig.port = proxyUrl.port ? parseInt(proxyUrl.port) : (proxyUrl.protocol === 'https:' ? 443 : 80);
                            proxyConfig.protocol = proxyUrl.protocol;
                            console.log("[CodeLine] Using HTTPS proxy: ".concat(proxyConfig.host, ":").concat(proxyConfig.port));
                        }
                        else if (httpProxy) {
                            proxyUrl = new URL(httpProxy);
                            proxyConfig.host = proxyUrl.hostname;
                            proxyConfig.port = proxyUrl.port ? parseInt(proxyUrl.port) : (proxyUrl.protocol === 'https:' ? 443 : 80);
                            proxyConfig.protocol = proxyUrl.protocol;
                            console.log("[CodeLine] Using HTTP proxy: ".concat(proxyConfig.host, ":").concat(proxyConfig.port));
                        }
                        axiosConfig = __assign({ headers: headers, timeout: timeout }, (Object.keys(proxyConfig).length > 0 ? { proxy: proxyConfig } : {}));
                        // 对于中国用户，尝试设置更宽松的SSL验证
                        if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
                            console.log("[CodeLine] Disabling SSL certificate verification (NODE_TLS_REJECT_UNAUTHORIZED=0)");
                            axiosConfig.httpsAgent = new (require('https').Agent)({ rejectUnauthorized: false });
                        }
                        console.log("[CodeLine] Sending request with config:", {
                            url: url,
                            timeout: axiosConfig.timeout,
                            hasProxy: Object.keys(proxyConfig).length > 0,
                            sslDisabled: !!axiosConfig.httpsAgent
                        });
                        return [4 /*yield*/, axios.post(url, data, axiosConfig)];
                    case 2:
                        response = _a.sent();
                        console.log("[CodeLine] Request successful, status: ".concat(response.status));
                        if (response.status >= 200 && response.status < 300) {
                            return [2 /*return*/, response.data];
                        }
                        else {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error("[CodeLine] Request failed:", error_2);
                        if (error_2.response) {
                            errorDetails = {
                                status: error_2.response.status,
                                data: error_2.response.data,
                                headers: error_2.response.headers
                            };
                            console.error("[CodeLine] API Error details:", errorDetails);
                            throw new Error("API Error: ".concat(error_2.response.status, " - ").concat(JSON.stringify(error_2.response.data)));
                        }
                        else if (error_2.request) {
                            // 请求已发送但没有收到响应
                            console.error("[CodeLine] No response received. Request was sent but no response.");
                            console.error("[CodeLine] Error code: ".concat(error_2.code, ", message: ").concat(error_2.message));
                            throw new Error("Network Error: No response received. Please check your network connection and proxy settings. Error details: ".concat(error_2.code || 'unknown', " - ").concat(error_2.message));
                        }
                        else {
                            // 请求设置错误
                            console.error("[CodeLine] Request setup error:", error_2.message);
                            throw new Error("Request Error: ".concat(error_2.message));
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return BaseModelProvider;
}());
exports.BaseModelProvider = BaseModelProvider;
