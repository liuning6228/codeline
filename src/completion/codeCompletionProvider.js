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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeCompletionProvider = void 0;
var vscode = require("vscode");
/**
 * CodeLine代码补全提供者
 * 提供AI驱动的智能代码补全建议
 */
var CodeCompletionProvider = /** @class */ (function () {
    function CodeCompletionProvider(modelAdapter, projectAnalyzer, options) {
        this.cache = new Map();
        this.isGenerating = false;
        this.lastRequestTime = 0;
        this.modelAdapter = modelAdapter;
        this.projectAnalyzer = projectAnalyzer;
        // 默认配置
        this.options = __assign({ enabled: true, triggerDelay: 300, maxItems: 10, useCache: true, cacheTTL: 60000, useEnhancedContext: true, supportedLanguages: [
                'typescript', 'javascript', 'typescriptreact', 'javascriptreact',
                'python', 'java', 'go', 'rust', 'cpp', 'csharp'
            ], showAISuggestions: true, minConfidence: 0.3 }, options);
    }
    /**
     * VS Code API: 提供补全项
     */
    CodeCompletionProvider.prototype.provideCompletionItems = function (document, position, token, context) {
        return __awaiter(this, void 0, void 0, function () {
            var now, completionContext, cacheKey, cached, baseItems, aiItems, allItems, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 检查是否启用
                        if (!this.options.enabled) {
                            return [2 /*return*/, []];
                        }
                        // 检查是否支持当前语言
                        if (!this.options.supportedLanguages.includes(document.languageId)) {
                            return [2 /*return*/, []];
                        }
                        now = Date.now();
                        if (now - this.lastRequestTime < 100) { // 100ms防抖
                            return [2 /*return*/, []];
                        }
                        this.lastRequestTime = now;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        completionContext = this.createCompletionContext(document, position);
                        cacheKey = this.generateCacheKey(document, position);
                        if (this.options.useCache) {
                            cached = this.cache.get(cacheKey);
                            if (cached && now - cached.timestamp < this.options.cacheTTL) {
                                console.log("CodeLine: Using cached completions for ".concat(cacheKey));
                                return [2 /*return*/, cached.items];
                            }
                        }
                        return [4 /*yield*/, this.getBaseCompletions(document, position)];
                    case 2:
                        baseItems = _a.sent();
                        return [4 /*yield*/, this.getAICompletions(completionContext, token)];
                    case 3:
                        aiItems = _a.sent();
                        allItems = __spreadArray(__spreadArray([], baseItems, true), aiItems, true).slice(0, this.options.maxItems);
                        // 更新缓存
                        if (this.options.useCache && allItems.length > 0) {
                            this.cache.set(cacheKey, {
                                items: allItems,
                                timestamp: now
                            });
                        }
                        return [2 /*return*/, allItems];
                    case 4:
                        error_1 = _a.sent();
                        console.error('CodeLine: Error generating completions:', error_1);
                        // 返回空数组而不是抛出错误，避免影响正常的补全功能
                        return [2 /*return*/, []];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * VS Code API: 解析补全项（添加更多信息）
     */
    CodeCompletionProvider.prototype.resolveCompletionItem = function (item, token) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                // 如果是AI生成的补全项，可以添加更多说明
                if ((_a = item.detail) === null || _a === void 0 ? void 0 : _a.includes('(AI)')) {
                    // 这里可以添加更详细的文档说明
                    if (!item.documentation) {
                        item.documentation = new vscode.MarkdownString('AI-generated suggestion based on your code context');
                    }
                }
                return [2 /*return*/, item];
            });
        });
    };
    /**
     * 创建补全上下文
     */
    CodeCompletionProvider.prototype.createCompletionContext = function (document, position) {
        var line = document.lineAt(position.line).text;
        var wordRange = document.getWordRangeAtPosition(position);
        var currentWord = wordRange ? document.getText(wordRange) : '';
        // 获取代码片段上下文（前5行）
        var snippetContext = [];
        var startLine = Math.max(0, position.line - 5);
        for (var i = startLine; i <= position.line; i++) {
            snippetContext.push(document.lineAt(i).text);
        }
        return {
            document: document,
            position: position,
            currentLine: line,
            currentWord: currentWord,
            filePath: document.uri.fsPath,
            snippetContext: snippetContext,
            languageId: document.languageId
        };
    };
    /**
     * 生成缓存键
     */
    CodeCompletionProvider.prototype.generateCacheKey = function (document, position) {
        var line = document.lineAt(position.line).text;
        var wordRange = document.getWordRangeAtPosition(position);
        var currentWord = wordRange ? document.getText(wordRange) : '';
        return "".concat(document.uri.toString(), ":").concat(position.line, ":").concat(position.character, ":").concat(currentWord, ":").concat(line);
    };
    /**
     * 获取基础补全项（来自语言服务器或内置）
     */
    CodeCompletionProvider.prototype.getBaseCompletions = function (document, position) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里可以集成语言服务器的补全
                // 目前返回空数组，后续可以扩展
                return [2 /*return*/, []];
            });
        });
    };
    /**
     * 获取AI生成的补全项
     */
    CodeCompletionProvider.prototype.getAICompletions = function (context, token) {
        return __awaiter(this, void 0, void 0, function () {
            var enhancedContext, error_2, prompt_1, response, suggestions, completionItems, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 检查是否显示AI建议
                        if (!this.options.showAISuggestions) {
                            return [2 /*return*/, []];
                        }
                        // 检查模型是否就绪
                        if (!this.modelAdapter.isReady()) {
                            console.log('CodeLine: Model adapter not ready, skipping AI completions');
                            return [2 /*return*/, []];
                        }
                        // 避免重复生成
                        if (this.isGenerating) {
                            return [2 /*return*/, []];
                        }
                        this.isGenerating = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, 8, 9]);
                        enhancedContext = void 0;
                        if (!this.options.useEnhancedContext) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.projectAnalyzer.analyzeEnhancedWorkspace(context.filePath)];
                    case 3:
                        enhancedContext = _a.sent();
                        context.enhancedContext = enhancedContext;
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.warn('CodeLine: Failed to get enhanced context:', error_2);
                        return [3 /*break*/, 5];
                    case 5:
                        prompt_1 = this.generateAIPrompt(context);
                        return [4 /*yield*/, this.modelAdapter.generate(prompt_1, {
                                maxTokens: 500,
                                temperature: 0.3 // 较低的温度以获得更确定的输出
                            })];
                    case 6:
                        response = _a.sent();
                        suggestions = this.parseAIResponse(response.content, context);
                        completionItems = suggestions
                            .filter(function (suggestion) { return suggestion.confidence >= _this.options.minConfidence; })
                            .map(function (suggestion) { return _this.createCompletionItem(suggestion, context); });
                        return [2 /*return*/, completionItems];
                    case 7:
                        error_3 = _a.sent();
                        console.error('CodeLine: Error generating AI completions:', error_3);
                        return [2 /*return*/, []];
                    case 8:
                        this.isGenerating = false;
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成AI提示词
     */
    CodeCompletionProvider.prototype.generateAIPrompt = function (context) {
        var currentLine = context.currentLine, currentWord = context.currentWord, snippetContext = context.snippetContext, languageId = context.languageId;
        var languageMap = {
            'typescript': 'TypeScript',
            'javascript': 'JavaScript',
            'typescriptreact': 'TypeScript React',
            'javascriptreact': 'JavaScript React',
            'python': 'Python',
            'java': 'Java',
            'go': 'Go',
            'rust': 'Rust',
            'cpp': 'C++',
            'csharp': 'C#'
        };
        var languageName = languageMap[languageId] || languageId;
        return "You are a code completion assistant. Provide 3-5 relevant code completion suggestions for the following context:\n\nLanguage: ".concat(languageName, "\nCurrent line: \"").concat(currentLine, "\"\nCurrent word: \"").concat(currentWord, "\"\nPrevious lines:\n").concat(snippetContext.slice(0, -1).map(function (line, i) { return "  ".concat(i + 1, ". ").concat(line); }).join('\n'), "\n\nPlease provide suggestions in this format:\n1. [LABEL] - [INSERT_TEXT] - [DESCRIPTION] - [TYPE: function|type|import|variable|method|class|other] - [CONFIDENCE: 0.0-1.0]\n\nExample for JavaScript:\n1. console.log - console.log($0) - Logs message to console - TYPE: function - CONFIDENCE: 0.9\n2. map - .map(item => {}) - Array map method - TYPE: method - CONFIDENCE: 0.8\n\nSuggestions only, no explanations.");
    };
    /**
     * 解析AI响应
     */
    CodeCompletionProvider.prototype.parseAIResponse = function (response, context) {
        var suggestions = [];
        var lines = response.split('\n').filter(function (line) { return line.trim(); });
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            // 解析格式: [LABEL] - [INSERT_TEXT] - [DESCRIPTION] - [TYPE: ...] - [CONFIDENCE: ...]
            var match = line.match(/^\s*\d+\.\s+(.+?)\s+-\s+(.+?)\s+-\s+(.+?)\s+-\s+TYPE:\s*(.+?)\s+-\s+CONFIDENCE:\s*([0-9.]+)/i);
            if (match) {
                var label = match[1], insertText = match[2], explanation = match[3], type = match[4], confidenceStr = match[5];
                var confidence = parseFloat(confidenceStr);
                if (!isNaN(confidence) && confidence >= this.options.minConfidence) {
                    suggestions.push({
                        code: insertText,
                        explanation: explanation,
                        confidence: confidence,
                        type: type,
                        context: "AI suggestion for \"".concat(context.currentWord, "\"")
                    });
                }
            }
        }
        return suggestions;
    };
    /**
     * 创建VS Code补全项
     */
    CodeCompletionProvider.prototype.createCompletionItem = function (suggestion, context) {
        var item = new vscode.CompletionItem(suggestion.code, this.getCompletionItemKind(suggestion.type));
        item.detail = "".concat(suggestion.explanation, " (AI)");
        item.documentation = new vscode.MarkdownString(suggestion.context || 'AI-generated suggestion');
        // 设置排序文本，使AI建议出现在合适的位置
        item.sortText = "z_ai_".concat((1 - suggestion.confidence).toFixed(3));
        // 如果是代码片段，添加占位符
        if (suggestion.code.includes('$0') || suggestion.code.includes('${')) {
            item.insertText = new vscode.SnippetString(suggestion.code);
        }
        else {
            item.insertText = suggestion.code;
        }
        return item;
    };
    /**
     * 根据建议类型获取补全项类型
     */
    CodeCompletionProvider.prototype.getCompletionItemKind = function (type) {
        var map = {
            'function': vscode.CompletionItemKind.Function,
            'type': vscode.CompletionItemKind.TypeParameter,
            'import': vscode.CompletionItemKind.Module,
            'variable': vscode.CompletionItemKind.Variable,
            'method': vscode.CompletionItemKind.Method,
            'class': vscode.CompletionItemKind.Class,
            'other': vscode.CompletionItemKind.Text
        };
        return map[type] || vscode.CompletionItemKind.Text;
    };
    /**
     * 更新配置选项
     */
    CodeCompletionProvider.prototype.updateOptions = function (options) {
        this.options = __assign(__assign({}, this.options), options);
        console.log('CodeLine: Updated completion options', this.options);
    };
    /**
     * 清除缓存
     */
    CodeCompletionProvider.prototype.clearCache = function () {
        this.cache.clear();
        console.log('CodeLine: Cleared completion cache');
    };
    /**
     * 启用/禁用补全提供者
     */
    CodeCompletionProvider.prototype.setEnabled = function (enabled) {
        this.options.enabled = enabled;
        console.log("CodeLine: Completion provider ".concat(enabled ? 'enabled' : 'disabled'));
    };
    return CodeCompletionProvider;
}());
exports.CodeCompletionProvider = CodeCompletionProvider;
