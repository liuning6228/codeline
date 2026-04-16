"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeCompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
/**
 * CodeLine代码补全提供者
 * 提供AI驱动的智能代码补全建议
 */
class CodeCompletionProvider {
    modelAdapter;
    projectAnalyzer;
    options;
    cache = new Map();
    isGenerating = false;
    lastRequestTime = 0;
    constructor(modelAdapter, projectAnalyzer, options) {
        this.modelAdapter = modelAdapter;
        this.projectAnalyzer = projectAnalyzer;
        // 默认配置
        this.options = {
            enabled: true,
            triggerDelay: 300,
            maxItems: 10,
            useCache: true,
            cacheTTL: 60000, // 1分钟
            useEnhancedContext: true,
            supportedLanguages: [
                'typescript', 'javascript', 'typescriptreact', 'javascriptreact',
                'python', 'java', 'go', 'rust', 'cpp', 'csharp'
            ],
            showAISuggestions: true,
            minConfidence: 0.3,
            ...options
        };
    }
    /**
     * VS Code API: 提供补全项
     */
    async provideCompletionItems(document, position, token, context) {
        // 检查是否启用
        if (!this.options.enabled) {
            return [];
        }
        // 检查是否支持当前语言
        if (!this.options.supportedLanguages.includes(document.languageId)) {
            return [];
        }
        // 避免频繁请求
        const now = Date.now();
        if (now - this.lastRequestTime < 100) { // 100ms防抖
            return [];
        }
        this.lastRequestTime = now;
        try {
            // 创建补全上下文
            const completionContext = this.createCompletionContext(document, position);
            // 检查缓存
            const cacheKey = this.generateCacheKey(document, position);
            if (this.options.useCache) {
                const cached = this.cache.get(cacheKey);
                if (cached && now - cached.timestamp < this.options.cacheTTL) {
                    console.log(`CodeLine: Using cached completions for ${cacheKey}`);
                    return cached.items;
                }
            }
            // 获取基础补全项（语言服务器提供的基础补全）
            const baseItems = await this.getBaseCompletions(document, position);
            // 获取AI生成的补全项
            const aiItems = await this.getAICompletions(completionContext, token);
            // 合并结果
            const allItems = [...baseItems, ...aiItems].slice(0, this.options.maxItems);
            // 更新缓存
            if (this.options.useCache && allItems.length > 0) {
                this.cache.set(cacheKey, {
                    items: allItems,
                    timestamp: now
                });
            }
            return allItems;
        }
        catch (error) {
            console.error('CodeLine: Error generating completions:', error);
            // 返回空数组而不是抛出错误，避免影响正常的补全功能
            return [];
        }
    }
    /**
     * VS Code API: 解析补全项（添加更多信息）
     */
    async resolveCompletionItem(item, token) {
        // 如果是AI生成的补全项，可以添加更多说明
        if (item.detail?.includes('(AI)')) {
            // 这里可以添加更详细的文档说明
            if (!item.documentation) {
                item.documentation = new vscode.MarkdownString('AI-generated suggestion based on your code context');
            }
        }
        return item;
    }
    /**
     * 创建补全上下文
     */
    createCompletionContext(document, position) {
        const line = document.lineAt(position.line).text;
        const wordRange = document.getWordRangeAtPosition(position);
        const currentWord = wordRange ? document.getText(wordRange) : '';
        // 获取代码片段上下文（前5行）
        const snippetContext = [];
        const startLine = Math.max(0, position.line - 5);
        for (let i = startLine; i <= position.line; i++) {
            snippetContext.push(document.lineAt(i).text);
        }
        return {
            document,
            position,
            currentLine: line,
            currentWord,
            filePath: document.uri.fsPath,
            snippetContext,
            languageId: document.languageId
        };
    }
    /**
     * 生成缓存键
     */
    generateCacheKey(document, position) {
        const line = document.lineAt(position.line).text;
        const wordRange = document.getWordRangeAtPosition(position);
        const currentWord = wordRange ? document.getText(wordRange) : '';
        return `${document.uri.toString()}:${position.line}:${position.character}:${currentWord}:${line}`;
    }
    /**
     * 获取基础补全项（来自语言服务器或内置）
     */
    async getBaseCompletions(document, position) {
        // 这里可以集成语言服务器的补全
        // 目前返回空数组，后续可以扩展
        return [];
    }
    /**
     * 获取AI生成的补全项
     */
    async getAICompletions(context, token) {
        // 检查是否显示AI建议
        if (!this.options.showAISuggestions) {
            return [];
        }
        // 检查模型是否就绪
        if (!this.modelAdapter.isReady()) {
            console.log('CodeLine: Model adapter not ready, skipping AI completions');
            return [];
        }
        // 避免重复生成
        if (this.isGenerating) {
            return [];
        }
        this.isGenerating = true;
        try {
            // 获取项目上下文（如果需要）
            let enhancedContext;
            if (this.options.useEnhancedContext) {
                try {
                    enhancedContext = await this.projectAnalyzer.analyzeEnhancedWorkspace(context.filePath);
                    context.enhancedContext = enhancedContext;
                }
                catch (error) {
                    console.warn('CodeLine: Failed to get enhanced context:', error);
                }
            }
            // 生成AI提示词
            const prompt = this.generateAIPrompt(context);
            // 调用AI模型，为代码补全使用特定配置
            const response = await this.modelAdapter.generate(prompt, {
                maxTokens: 500,
                temperature: 0.3 // 较低的温度以获得更确定的输出
            });
            // 解析AI响应
            const suggestions = this.parseAIResponse(response.content, context);
            // 转换为VS Code补全项
            const completionItems = suggestions
                .filter(suggestion => suggestion.confidence >= this.options.minConfidence)
                .map(suggestion => this.createCompletionItem(suggestion, context));
            return completionItems;
        }
        catch (error) {
            console.error('CodeLine: Error generating AI completions:', error);
            return [];
        }
        finally {
            this.isGenerating = false;
        }
    }
    /**
     * 生成AI提示词
     */
    generateAIPrompt(context) {
        const { currentLine, currentWord, snippetContext, languageId } = context;
        const languageMap = {
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
        const languageName = languageMap[languageId] || languageId;
        return `You are a code completion assistant. Provide 3-5 relevant code completion suggestions for the following context:

Language: ${languageName}
Current line: "${currentLine}"
Current word: "${currentWord}"
Previous lines:
${snippetContext.slice(0, -1).map((line, i) => `  ${i + 1}. ${line}`).join('\n')}

Please provide suggestions in this format:
1. [LABEL] - [INSERT_TEXT] - [DESCRIPTION] - [TYPE: function|type|import|variable|method|class|other] - [CONFIDENCE: 0.0-1.0]

Example for JavaScript:
1. console.log - console.log($0) - Logs message to console - TYPE: function - CONFIDENCE: 0.9
2. map - .map(item => {}) - Array map method - TYPE: method - CONFIDENCE: 0.8

Suggestions only, no explanations.`;
    }
    /**
     * 解析AI响应
     */
    parseAIResponse(response, context) {
        const suggestions = [];
        const lines = response.split('\n').filter(line => line.trim());
        for (const line of lines) {
            // 解析格式: [LABEL] - [INSERT_TEXT] - [DESCRIPTION] - [TYPE: ...] - [CONFIDENCE: ...]
            const match = line.match(/^\s*\d+\.\s+(.+?)\s+-\s+(.+?)\s+-\s+(.+?)\s+-\s+TYPE:\s*(.+?)\s+-\s+CONFIDENCE:\s*([0-9.]+)/i);
            if (match) {
                const [, label, insertText, explanation, type, confidenceStr] = match;
                const confidence = parseFloat(confidenceStr);
                if (!isNaN(confidence) && confidence >= this.options.minConfidence) {
                    suggestions.push({
                        code: insertText,
                        explanation,
                        confidence,
                        type: type,
                        context: `AI suggestion for "${context.currentWord}"`
                    });
                }
            }
        }
        return suggestions;
    }
    /**
     * 创建VS Code补全项
     */
    createCompletionItem(suggestion, context) {
        const item = new vscode.CompletionItem(suggestion.code, this.getCompletionItemKind(suggestion.type));
        item.detail = `${suggestion.explanation} (AI)`;
        item.documentation = new vscode.MarkdownString(suggestion.context || 'AI-generated suggestion');
        // 设置排序文本，使AI建议出现在合适的位置
        item.sortText = `z_ai_${(1 - suggestion.confidence).toFixed(3)}`;
        // 如果是代码片段，添加占位符
        if (suggestion.code.includes('$0') || suggestion.code.includes('${')) {
            item.insertText = new vscode.SnippetString(suggestion.code);
        }
        else {
            item.insertText = suggestion.code;
        }
        return item;
    }
    /**
     * 根据建议类型获取补全项类型
     */
    getCompletionItemKind(type) {
        const map = {
            'function': vscode.CompletionItemKind.Function,
            'type': vscode.CompletionItemKind.TypeParameter,
            'import': vscode.CompletionItemKind.Module,
            'variable': vscode.CompletionItemKind.Variable,
            'method': vscode.CompletionItemKind.Method,
            'class': vscode.CompletionItemKind.Class,
            'other': vscode.CompletionItemKind.Text
        };
        return map[type] || vscode.CompletionItemKind.Text;
    }
    /**
     * 更新配置选项
     */
    updateOptions(options) {
        this.options = { ...this.options, ...options };
        console.log('CodeLine: Updated completion options', this.options);
    }
    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
        console.log('CodeLine: Cleared completion cache');
    }
    /**
     * 启用/禁用补全提供者
     */
    setEnabled(enabled) {
        this.options.enabled = enabled;
        console.log(`CodeLine: Completion provider ${enabled ? 'enabled' : 'disabled'}`);
    }
}
exports.CodeCompletionProvider = CodeCompletionProvider;
//# sourceMappingURL=codeCompletionProvider.js.map