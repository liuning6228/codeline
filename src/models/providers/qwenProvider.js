"use strict";
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
exports.QwenProvider = void 0;
var modelProvider_1 = require("./modelProvider");
/**
 * Qwen 模型提供者
 * 支持通义千问系列模型
 */
var QwenProvider = /** @class */ (function (_super) {
    __extends(QwenProvider, _super);
    function QwenProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'Qwen (通义千问)';
        _this.id = 'qwen';
        _this.supportedModels = [
            'qwen-max',
            'qwen-plus',
            'qwen-turbo',
            'qwen2.5-coder-32b-instruct',
            'qwen2.5-coder-7b-instruct',
            'qwen2.5-32b-instruct',
            'qwen2.5-7b-instruct'
        ];
        return _this;
    }
    QwenProvider.prototype.getDefaultConfig = function () {
        return {
            baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            model: 'qwen-max',
            temperature: 0.7,
            maxTokens: 4000
        };
    };
    QwenProvider.prototype.getConfigHint = function () {
        return '请设置阿里云通义千问API密钥（可在 https://dashscope.console.aliyun.com/apiKey 获取）';
    };
    QwenProvider.prototype.generate = function (prompt, config) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, data, url, result, content, modelName, usage;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.validateConfig(config)) {
                            throw new Error('Qwen配置无效：API密钥不能为空');
                        }
                        headers = {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer ".concat(config.apiKey)
                        };
                        data = {
                            model: config.model,
                            messages: [
                                {
                                    role: 'system',
                                    content: '你是一个专业的AI编程助手，擅长生成高质量的代码。请直接返回代码和必要的解释，不要包含额外的格式标记。'
                                },
                                {
                                    role: 'user',
                                    content: prompt
                                }
                            ],
                            temperature: config.temperature,
                            max_tokens: config.maxTokens,
                            stream: false
                        };
                        url = config.baseUrl.endsWith('/chat/completions')
                            ? config.baseUrl
                            : "".concat(config.baseUrl, "/chat/completions");
                        return [4 /*yield*/, this.makeRequest(url, data, headers)];
                    case 1:
                        result = _c.sent();
                        content = '';
                        modelName = config.model;
                        usage = undefined;
                        if (result.choices && ((_b = (_a = result.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content)) {
                            // OpenAI兼容格式
                            content = result.choices[0].message.content;
                            modelName = result.model || config.model;
                            if (result.usage) {
                                usage = {
                                    promptTokens: result.usage.prompt_tokens || result.usage.input_tokens || 0,
                                    completionTokens: result.usage.completion_tokens || result.usage.output_tokens || 0,
                                    totalTokens: result.usage.total_tokens ||
                                        ((result.usage.prompt_tokens || result.usage.input_tokens || 0) +
                                            (result.usage.completion_tokens || result.usage.output_tokens || 0))
                                };
                            }
                        }
                        else if (result.output && result.output.text) {
                            // Qwen原始格式
                            content = result.output.text;
                            modelName = config.model;
                            if (result.usage) {
                                usage = {
                                    promptTokens: result.usage.input_tokens || 0,
                                    completionTokens: result.usage.output_tokens || 0,
                                    totalTokens: (result.usage.input_tokens || 0) + (result.usage.output_tokens || 0)
                                };
                            }
                        }
                        else {
                            // 尝试其他常见格式
                            content = result.text || result.content || JSON.stringify(result);
                        }
                        return [2 /*return*/, {
                                content: content,
                                usage: usage,
                                model: modelName
                            }];
                }
            });
        });
    };
    QwenProvider.prototype.validateConfig = function (config) {
        // Qwen特定验证：检查模型是否受支持
        var isValidModel = this.supportedModels.includes(config.model);
        var hasApiKey = !!config.apiKey && config.apiKey.trim().length > 0;
        return hasApiKey && isValidModel;
    };
    return QwenProvider;
}(modelProvider_1.BaseModelProvider));
exports.QwenProvider = QwenProvider;
