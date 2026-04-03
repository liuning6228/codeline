"use strict";
/**
 * 浏览器自动化适配器
 * 将现有的 BrowserAutomator 模块适配到统一的工具接口
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.BrowserAutomatorAdapter = void 0;
var browserAutomator_1 = require("../../browser/browserAutomator");
var ToolAdapter_1 = require("./ToolAdapter");
/**
 * 浏览器自动化适配器
 */
var BrowserAutomatorAdapter = /** @class */ (function (_super) {
    __extends(BrowserAutomatorAdapter, _super);
    function BrowserAutomatorAdapter(context) {
        var _this = _super.call(this, 'browser-automator', 'Browser Automator', 'Automate web browser interactions: navigation, content extraction, testing', '1.0.0', 'CodeLine Team', ['browser', 'web', 'automation', 'scraping', 'testing', 'navigation'], {
            mode: {
                type: 'string',
                description: 'Browser automation mode',
                required: true,
                validation: function (value) { return ['navigate', 'extract', 'test', 'sequence'].includes(value); },
                default: 'navigate',
            },
            url: {
                type: 'string',
                description: 'URL to navigate to or process',
                required: true,
            },
            actions: {
                type: 'array',
                description: 'Sequence of browser actions (for sequence mode)',
                required: false,
            },
            selector: {
                type: 'string',
                description: 'CSS selector for extraction/testing',
                required: false,
            },
            text: {
                type: 'string',
                description: 'Text content for testing',
                required: false,
            },
            waitForSelector: {
                type: 'string',
                description: 'Wait for selector to appear',
                required: false,
            },
            waitForNavigation: {
                type: 'boolean',
                description: 'Wait for navigation to complete',
                required: false,
                default: false,
            },
            evaluateFn: {
                type: 'string',
                description: 'JavaScript function to evaluate on page',
                required: false,
            },
            outputFormat: {
                type: 'string',
                description: 'Output format',
                required: false,
                validation: function (value) { return !value || ['text', 'html', 'json'].includes(value); },
                default: 'text',
            },
            timeout: {
                type: 'number',
                description: 'Timeout in milliseconds',
                required: false,
                default: 30000,
            },
            userAgent: {
                type: 'string',
                description: 'Custom user agent string',
                required: false,
            },
        }) || this;
        _this.browserAutomator = new browserAutomator_1.BrowserAutomator();
        return _this;
    }
    /**
     * 检查权限 - 浏览器自动化需要特别注意
     */
    BrowserAutomatorAdapter.prototype.checkPermissions = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            var url, mode;
            return __generator(this, function (_a) {
                url = params.url, mode = params.mode;
                // 检查URL安全性
                if (url && !this.isUrlSafe(url)) {
                    return [2 /*return*/, {
                            allowed: false,
                            reason: "Unsafe URL detected: ".concat(url),
                            requiresUserConfirmation: true,
                            confirmationPrompt: "The URL ".concat(url, " may be unsafe. Are you sure you want to access it?"),
                        }];
                }
                // 检查模式安全性
                if (mode === 'sequence') {
                    return [2 /*return*/, {
                            allowed: true,
                            requiresUserConfirmation: true,
                            confirmationPrompt: "Browser automation sequence may perform multiple actions. Are you sure you want to proceed?",
                        }];
                }
                // 需要用户确认浏览器自动化
                return [2 /*return*/, {
                        allowed: true,
                        requiresUserConfirmation: true,
                        confirmationPrompt: "Are you sure you want to automate browser interaction with ".concat(url, "?"),
                    }];
            });
        });
    };
    /**
     * 验证参数
     */
    BrowserAutomatorAdapter.prototype.validateParameters = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            var mode, url, actions, selector, text, i, action, sanitizedParams;
            return __generator(this, function (_a) {
                mode = params.mode, url = params.url, actions = params.actions, selector = params.selector, text = params.text;
                // 基本验证
                if (!mode) {
                    return [2 /*return*/, {
                            valid: false,
                            error: 'Mode is required',
                        }];
                }
                // URL验证
                if (!url) {
                    return [2 /*return*/, {
                            valid: false,
                            error: 'URL is required',
                        }];
                }
                // 模式特定验证
                switch (mode) {
                    case 'navigate':
                        // 只需要URL
                        break;
                    case 'extract':
                        if (!selector) {
                            return [2 /*return*/, {
                                    valid: false,
                                    error: 'Selector is required for extract mode',
                                }];
                        }
                        break;
                    case 'test':
                        if (!selector && !text) {
                            return [2 /*return*/, {
                                    valid: false,
                                    error: 'Either selector or text is required for test mode',
                                }];
                        }
                        break;
                    case 'sequence':
                        if (!actions || !Array.isArray(actions) || actions.length === 0) {
                            return [2 /*return*/, {
                                    valid: false,
                                    error: 'Actions array is required for sequence mode',
                                }];
                        }
                        // 验证每个动作
                        for (i = 0; i < actions.length; i++) {
                            action = actions[i];
                            if (!action.type) {
                                return [2 /*return*/, {
                                        valid: false,
                                        error: "Action at index ".concat(i, " is missing type"),
                                    }];
                            }
                        }
                        break;
                    default:
                        return [2 /*return*/, {
                                valid: false,
                                error: "Invalid mode: ".concat(mode),
                            }];
                }
                sanitizedParams = __assign(__assign({}, params), { outputFormat: params.outputFormat || 'text', timeout: params.timeout || 30000, waitForNavigation: params.waitForNavigation !== undefined ? params.waitForNavigation : false });
                // 确保URL有协议
                if (sanitizedParams.url && !sanitizedParams.url.startsWith('http://') && !sanitizedParams.url.startsWith('https://')) {
                    sanitizedParams.url = 'https://' + sanitizedParams.url;
                }
                return [2 /*return*/, {
                        valid: true,
                        sanitizedParams: sanitizedParams,
                    }];
            });
        });
    };
    /**
     * 执行浏览器自动化
     */
    BrowserAutomatorAdapter.prototype.execute = function (params, context, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, mode, url, actions, browserOptions, browserResult, extractedData, _a, testActions, i, progressValue, pageInfo, output, titleMatch, contentLengthMatch, duration, error_1, duration;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        mode = params.mode, url = params.url, actions = params.actions;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 12, , 13]);
                        // 报告开始进度
                        this.reportProgress(onProgress, {
                            type: 'browser_automation_start',
                            progress: 0.1,
                            message: 'Starting browser automation',
                            data: { mode: mode, url: url },
                        });
                        browserOptions = {
                            timeout: params.timeout,
                            userAgent: params.userAgent,
                        };
                        browserResult = void 0;
                        extractedData = void 0;
                        _a = mode;
                        switch (_a) {
                            case 'navigate': return [3 /*break*/, 2];
                            case 'extract': return [3 /*break*/, 4];
                            case 'test': return [3 /*break*/, 6];
                            case 'sequence': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 2:
                        this.reportProgress(onProgress, {
                            type: 'browser_navigating',
                            progress: 0.3,
                            message: "Navigating to: ".concat(url),
                        });
                        return [4 /*yield*/, this.browserAutomator.executeSequence(url, [{
                                    type: 'navigate',
                                    url: url,
                                    waitForNavigation: params.waitForNavigation,
                                }])];
                    case 3:
                        browserResult = _b.sent();
                        return [3 /*break*/, 11];
                    case 4:
                        this.reportProgress(onProgress, {
                            type: 'browser_extracting',
                            progress: 0.3,
                            message: "Extracting content from: ".concat(url),
                            data: { selector: params.selector },
                        });
                        return [4 /*yield*/, this.browserAutomator.executeSequence(url, [{
                                    type: 'extract',
                                    url: url,
                                    selector: params.selector,
                                    outputFormat: params.outputFormat,
                                }])];
                    case 5:
                        browserResult = _b.sent();
                        // 尝试解析提取的数据
                        if (browserResult.success && browserResult.output) {
                            try {
                                if (params.outputFormat === 'json') {
                                    extractedData = JSON.parse(browserResult.output);
                                }
                                else {
                                    extractedData = browserResult.output;
                                }
                            }
                            catch (e) {
                                // 无法解析，保持原始输出
                                extractedData = browserResult.output;
                            }
                        }
                        return [3 /*break*/, 11];
                    case 6:
                        this.reportProgress(onProgress, {
                            type: 'browser_testing',
                            progress: 0.3,
                            message: "Testing on: ".concat(url),
                        });
                        testActions = [{
                                type: 'test',
                                url: url,
                                selector: params.selector,
                                text: params.text,
                                waitForSelector: params.waitForSelector,
                            }];
                        if (params.evaluateFn) {
                            testActions.push({
                                type: 'test',
                                evaluateFn: params.evaluateFn,
                            });
                        }
                        return [4 /*yield*/, this.browserAutomator.executeSequence(url, testActions)];
                    case 7:
                        browserResult = _b.sent();
                        return [3 /*break*/, 11];
                    case 8:
                        this.reportProgress(onProgress, {
                            type: 'browser_sequence_start',
                            progress: 0.2,
                            message: "Executing sequence of ".concat(actions.length, " actions"),
                            data: { actionCount: actions.length },
                        });
                        return [4 /*yield*/, this.browserAutomator.executeSequence(url, actions)];
                    case 9:
                        // 执行动作序列
                        browserResult = _b.sent();
                        // 报告序列进度
                        if (actions.length > 1) {
                            for (i = 0; i < actions.length; i++) {
                                progressValue = 0.2 + (0.6 * (i + 1)) / actions.length;
                                this.reportProgress(onProgress, {
                                    type: 'browser_sequence_progress',
                                    progress: progressValue,
                                    message: "Action ".concat(i + 1, "/").concat(actions.length, " complete"),
                                    data: {
                                        index: i,
                                        total: actions.length,
                                        actionType: actions[i].type,
                                    },
                                });
                            }
                        }
                        return [3 /*break*/, 11];
                    case 10: throw new Error("Unsupported mode: ".concat(mode));
                    case 11:
                        pageInfo = undefined;
                        if (browserResult.success && browserResult.output) {
                            output = browserResult.output;
                            titleMatch = output.match(/Title:\s*"([^"]+)"/i) || output.match(/<title[^>]*>([^<]+)<\/title>/i);
                            contentLengthMatch = output.match(/Content length:\s*(\d+)/i);
                            pageInfo = {
                                url: browserResult.url || url,
                                title: titleMatch ? titleMatch[1].trim() : undefined,
                                contentLength: contentLengthMatch ? parseInt(contentLengthMatch[1]) : output.length,
                                contentType: params.outputFormat || 'text/html',
                            };
                        }
                        // 报告完成进度
                        this.reportProgress(onProgress, {
                            type: 'browser_automation_complete',
                            progress: 1.0,
                            message: "Browser automation ".concat(browserResult.success ? 'completed' : 'failed'),
                            data: {
                                success: browserResult.success,
                                url: browserResult.url || url,
                            },
                        });
                        duration = Date.now() - startTime;
                        // 返回结果
                        if (browserResult.success) {
                            return [2 /*return*/, this.createSuccessResult({
                                    result: browserResult,
                                    extractedData: extractedData,
                                    pageInfo: pageInfo,
                                }, duration, {
                                    mode: mode,
                                    url: browserResult.url || url,
                                    actionCount: mode === 'sequence' ? actions.length : 1,
                                })];
                        }
                        else {
                            return [2 /*return*/, this.createErrorResult("Browser automation failed: ".concat(browserResult.error || 'Unknown error'), duration, {
                                    mode: mode,
                                    url: browserResult.url || url,
                                    error: browserResult.error,
                                })];
                        }
                        return [3 /*break*/, 13];
                    case 12:
                        error_1 = _b.sent();
                        duration = Date.now() - startTime;
                        this.reportProgress(onProgress, {
                            type: 'browser_automation_error',
                            progress: 1.0,
                            message: "Browser automation failed: ".concat(error_1.message),
                        });
                        return [2 /*return*/, this.createErrorResult("Browser automation failed: ".concat(error_1.message), duration, {
                                mode: mode,
                                url: url,
                            })];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查是否为只读操作
     */
    BrowserAutomatorAdapter.prototype.isReadOnly = function (context) {
        return true; // 浏览器自动化通常是只读的（除非有表单提交等操作）
    };
    /**
     * 获取显示名称
     */
    BrowserAutomatorAdapter.prototype.getDisplayName = function (params) {
        var mode = (params === null || params === void 0 ? void 0 : params.mode) || 'navigate';
        var modeNames = {
            navigate: 'Browser Navigation',
            extract: 'Content Extraction',
            test: 'Browser Testing',
            sequence: 'Automation Sequence',
        };
        return modeNames[mode] || 'Browser Automation';
    };
    /**
     * 获取活动描述
     */
    BrowserAutomatorAdapter.prototype.getActivityDescription = function (params) {
        var mode = params.mode, url = params.url;
        switch (mode) {
            case 'navigate':
                return "Navigating to: ".concat(url);
            case 'extract':
                return "Extracting content from: ".concat(url);
            case 'test':
                return "Testing on: ".concat(url);
            case 'sequence':
                return "Executing automation sequence on: ".concat(url);
            default:
                return "Browser automation: ".concat(mode);
        }
    };
    /**
     * 检查URL安全性
     */
    BrowserAutomatorAdapter.prototype.isUrlSafe = function (url) {
        try {
            var urlObj = new URL(url);
            var hostname = urlObj.hostname.toLowerCase();
            // 不安全的主机名或协议
            var unsafePatterns = [
                /localhost/i,
                /127\.0\.0\.1/i,
                /192\.168\./i,
                /10\./i,
                /172\.(1[6-9]|2[0-9]|3[0-1])\./i,
                /\.internal$/i,
                /\.local$/i,
            ];
            for (var _i = 0, unsafePatterns_1 = unsafePatterns; _i < unsafePatterns_1.length; _i++) {
                var pattern = unsafePatterns_1[_i];
                if (pattern.test(hostname)) {
                    return false;
                }
            }
            // 检查协议
            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                return false;
            }
            return true;
        }
        catch (error) {
            // URL解析失败
            return false;
        }
    };
    /**
     * 工厂方法：创建浏览器自动化适配器
     */
    BrowserAutomatorAdapter.create = function (context) {
        return new BrowserAutomatorAdapter(context);
    };
    return BrowserAutomatorAdapter;
}(ToolAdapter_1.BaseToolAdapter));
exports.BrowserAutomatorAdapter = BrowserAutomatorAdapter;
