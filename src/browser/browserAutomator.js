"use strict";
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
exports.BrowserAutomator = void 0;
var vscode = require("vscode");
var https = require("https");
var http = require("http");
var url_1 = require("url");
var BrowserAutomator = /** @class */ (function () {
    function BrowserAutomator() {
        this.isInitialized = false;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Browser');
    }
    /**
     * 初始化浏览器实例（轻量级HTTP客户端）
     */
    BrowserAutomator.prototype.initialize = function () {
        return __awaiter(this, arguments, void 0, function (options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                try {
                    this.outputChannel.show(true);
                    this.outputChannel.appendLine('🌐 Initializing lightweight browser client...');
                    this.isInitialized = true;
                    this.outputChannel.appendLine('✅ Browser client initialized');
                    return [2 /*return*/, true];
                }
                catch (error) {
                    this.outputChannel.appendLine("\u274C Browser initialization failed: ".concat(error.message));
                    vscode.window.showErrorMessage("Browser initialization failed: ".concat(error.message));
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 执行浏览器自动化序列（简化版）
     */
    BrowserAutomator.prototype.executeSequence = function (url, actions) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, results, error, initialized, targetUrl, i, action, result, actionError_1, duration, mainError_1, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        results = [];
                        if (!!this.isInitialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        initialized = _a.sent();
                        if (!initialized) {
                            return [2 /*return*/, {
                                    success: false,
                                    output: 'Browser initialization failed',
                                    error: 'Failed to initialize browser',
                                    actions: actions,
                                    duration: 0
                                }];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, , 10]);
                        targetUrl = url;
                        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                            targetUrl = 'https://' + targetUrl;
                        }
                        this.outputChannel.appendLine("\uD83C\uDF10 Processing URL: ".concat(targetUrl));
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < actions.length)) return [3 /*break*/, 8];
                        action = actions[i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        this.outputChannel.appendLine("\uD83D\uDD27 Executing action ".concat(i + 1, ": ").concat(action.type));
                        return [4 /*yield*/, this.executeAction(targetUrl, action)];
                    case 5:
                        result = _a.sent();
                        results.push(result);
                        return [3 /*break*/, 7];
                    case 6:
                        actionError_1 = _a.sent();
                        this.outputChannel.appendLine("\u274C Action ".concat(i + 1, " failed: ").concat(actionError_1.message));
                        error = "Action ".concat(i + 1, " (").concat(action.type, ") failed: ").concat(actionError_1.message);
                        return [3 /*break*/, 8];
                    case 7:
                        i++;
                        return [3 /*break*/, 3];
                    case 8:
                        duration = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: !error,
                                output: results.join('\n\n'),
                                error: error,
                                actions: actions,
                                duration: duration,
                                url: targetUrl
                            }];
                    case 9:
                        mainError_1 = _a.sent();
                        duration = Date.now() - startTime;
                        this.outputChannel.appendLine("\u274C Browser automation failed: ".concat(mainError_1.message));
                        return [2 /*return*/, {
                                success: false,
                                output: results.join('\n\n'),
                                error: mainError_1.message,
                                actions: actions,
                                duration: duration
                            }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行单个浏览器动作（简化版）
     */
    BrowserAutomator.prototype.executeAction = function (url, action) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, content, titleMatch, title, contentLength, pageContent, extracted, titleMatch_1, h1Match, searchText_1, lines, matchingLines, testResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = action.type;
                        switch (_a) {
                            case 'navigate': return [3 /*break*/, 1];
                            case 'extract': return [3 /*break*/, 3];
                            case 'test': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.fetchUrl(url)];
                    case 2:
                        content = _b.sent();
                        titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
                        title = titleMatch ? titleMatch[1].trim() : 'No title found';
                        contentLength = content.length;
                        return [2 /*return*/, "Navigated to: ".concat(url, "\nTitle: \"").concat(title, "\"\nContent length: ").concat(contentLength, " characters")];
                    case 3:
                        if (!action.selector) {
                            throw new Error('Extract action requires selector pattern');
                        }
                        return [4 /*yield*/, this.fetchUrl(url)];
                    case 4:
                        pageContent = _b.sent();
                        extracted = '';
                        if (action.selector.startsWith('title')) {
                            titleMatch_1 = pageContent.match(/<title[^>]*>([^<]+)<\/title>/i);
                            extracted = titleMatch_1 ? titleMatch_1[1].trim() : 'No title found';
                        }
                        else if (action.selector.startsWith('h1')) {
                            h1Match = pageContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
                            extracted = h1Match ? h1Match[1].trim() : 'No h1 found';
                        }
                        else if (action.selector.includes('text=')) {
                            searchText_1 = action.selector.split('text=')[1];
                            lines = pageContent.split('\n');
                            matchingLines = lines.filter(function (line) { return line.toLowerCase().includes(searchText_1.toLowerCase()); });
                            extracted = matchingLines.slice(0, 5).join('\n'); // 最多5行
                        }
                        else {
                            // 通用选择器（简化）
                            extracted = "Simple selector extraction for \"".concat(action.selector, "\" is limited.\nFor advanced extraction, full browser automation (Puppeteer) is required.");
                        }
                        return [2 /*return*/, "Extracted from ".concat(url, " using selector \"").concat(action.selector, "\":\n").concat(extracted)];
                    case 5: return [4 /*yield*/, this.testConnection(url)];
                    case 6:
                        testResult = _b.sent();
                        return [2 /*return*/, "Connection test for ".concat(url, ":\n").concat(testResult)];
                    case 7: throw new Error("Unsupported action type in lightweight browser: ".concat(action.type));
                }
            });
        });
    };
    /**
     * 获取URL内容
     */
    BrowserAutomator.prototype.fetchUrl = function (urlString) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var url = new url_1.URL(urlString);
                        var protocol = url.protocol === 'https:' ? https : http;
                        var options = {
                            hostname: url.hostname,
                            port: url.port || (url.protocol === 'https:' ? 443 : 80),
                            path: url.pathname + url.search,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 CodeLine/1.0'
                            }
                        };
                        var req = protocol.get(options, function (res) {
                            if (res.statusCode !== 200) {
                                reject(new Error("HTTP ".concat(res.statusCode)));
                                return;
                            }
                            var data = '';
                            res.setEncoding('utf8');
                            res.on('data', function (chunk) {
                                data += chunk;
                            });
                            res.on('end', function () {
                                resolve(data);
                            });
                        });
                        req.on('error', function (err) {
                            reject(err);
                        });
                        req.setTimeout(10000, function () {
                            req.destroy();
                            reject(new Error('Request timeout'));
                        });
                    })];
            });
        });
    };
    /**
     * 测试连接
     */
    BrowserAutomator.prototype.testConnection = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, duration, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        startTime = Date.now();
                        return [4 /*yield*/, this.fetchUrl(url)];
                    case 1:
                        _a.sent();
                        duration = Date.now() - startTime;
                        return [2 /*return*/, "\u2705 Connection successful\nResponse time: ".concat(duration, "ms")];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, "\u274C Connection failed: ".concat(error_1.message)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成浏览器自动化结果的HTML报告
     */
    BrowserAutomator.prototype.generateHtmlReport = function (result) {
        var statusClass = result.success ? 'browser-success' : 'browser-error';
        var statusIcon = result.success ? '✅' : '❌';
        var duration = result.duration ? "".concat(result.duration, "ms") : 'N/A';
        return "\n<div class=\"browser-result ".concat(statusClass, "\">\n  <div class=\"browser-header\">\n    <h3>").concat(statusIcon, " Browser Automation (Lightweight)</h3>\n    <div class=\"browser-meta\">\n      ").concat(result.url ? "<span>URL: ".concat(result.url, "</span>") : '', "\n      <span>Duration: ").concat(duration, "</span>\n      <span>Actions: ").concat(result.actions.length, "</span>\n    </div>\n  </div>\n  \n  ").concat(result.url ? "\n  <div class=\"browser-url\">\n    <strong>URL:</strong> <code>".concat(this.escapeHtml(result.url), "</code>\n  </div>\n  ") : '', "\n  \n  <div class=\"browser-actions\">\n    <h4>Actions Executed:</h4>\n    <ol>\n      ").concat(result.actions.map(function (action, index) { return "\n        <li>\n          <code>".concat(action.type, "</code>\n          ").concat(action.selector ? " | Selector: <code>".concat(action.selector, "</code>") : '', "\n          ").concat(action.text ? " | Text: \"".concat(action.text, "\"") : '', "\n          ").concat(action.url ? " | URL: ".concat(action.url) : '', "\n        </li>\n      "); }).join(''), "\n    </ol>\n  </div>\n  \n  <div class=\"browser-output\">\n    <h4>Output:</h4>\n    <pre>").concat(this.escapeHtml(result.output || '(no output)'), "</pre>\n  </div>\n  \n  ").concat(result.error ? "\n  <div class=\"browser-error-output\">\n    <h4>Error:</h4>\n    <pre>".concat(this.escapeHtml(result.error), "</pre>\n  </div>\n  ") : '', "\n  \n  <div class=\"browser-note\">\n    <p><strong>Note:</strong> This is a lightweight browser implementation using HTTP requests only.</p>\n    <p>For full browser automation (clicking, typing, screenshots), Puppeteer integration is required.</p>\n  </div>\n</div>");
    };
    /**
     * 执行简单的网页抓取
     */
    BrowserAutomator.prototype.scrapePage = function (url, selectors) {
        return __awaiter(this, void 0, void 0, function () {
            var pageContent, results, _i, _a, _b, key, selector, titleMatch, tag, regex, match, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.fetchUrl(url)];
                    case 1:
                        pageContent = _c.sent();
                        results = {};
                        for (_i = 0, _a = Object.entries(selectors); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], selector = _b[1];
                            if (selector === 'title') {
                                titleMatch = pageContent.match(/<title[^>]*>([^<]+)<\/title>/i);
                                results[key] = titleMatch ? titleMatch[1].trim() : 'No title found';
                            }
                            else if (selector.startsWith('h')) {
                                tag = selector;
                                regex = new RegExp("<".concat(tag, "[^>]*>([^<]+)</").concat(tag, ">"), 'i');
                                match = pageContent.match(regex);
                                results[key] = match ? match[1].trim() : "No ".concat(tag, " found");
                            }
                            else {
                                results[key] = "Selector \"".concat(selector, "\" requires full browser automation");
                            }
                        }
                        return [2 /*return*/, results];
                    case 2:
                        error_2 = _c.sent();
                        throw new Error("Scraping failed: ".concat(error_2.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 测试浏览器连接和功能
     */
    BrowserAutomator.prototype.testBrowser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testUrl, result, success, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.outputChannel.appendLine('🧪 Testing browser functionality...');
                        testUrl = 'https://httpbin.org/html';
                        return [4 /*yield*/, this.testConnection(testUrl)];
                    case 1:
                        result = _a.sent();
                        this.outputChannel.appendLine(result);
                        success = result.includes('✅');
                        if (success) {
                            this.outputChannel.appendLine('✅ Browser test passed');
                        }
                        else {
                            this.outputChannel.appendLine('❌ Browser test failed');
                        }
                        return [2 /*return*/, success];
                    case 2:
                        error_3 = _a.sent();
                        this.outputChannel.appendLine("\u274C Browser test failed: ".concat(error_3.message));
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 关闭浏览器（清理资源）
     */
    BrowserAutomator.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.outputChannel.appendLine('🔒 Browser client closed');
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取浏览器状态
     */
    BrowserAutomator.prototype.getStatus = function () {
        return {
            initialized: this.isInitialized,
            lightweight: true,
            outputChannel: this.outputChannel !== null
        };
    };
    BrowserAutomator.prototype.escapeHtml = function (text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
    };
    return BrowserAutomator;
}());
exports.BrowserAutomator = BrowserAutomator;
