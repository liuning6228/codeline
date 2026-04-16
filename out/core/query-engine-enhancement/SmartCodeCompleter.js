"use strict";
/**
 * SmartCodeCompleter - 智能代码补全器
 *
 * 基于上下文分析提供智能代码补全建议：
 * 1. 上下文感知的补全建议
 * 2. API和方法智能提示
 * 3. 错误自动修复建议
 * 4. 代码片段补全
 * 5. 类型推断和提示
 */
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
exports.SmartCodeCompleter = void 0;
exports.createSmartCodeCompleter = createSmartCodeCompleter;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const CodeContextEnhancer_1 = require("./CodeContextEnhancer");
/**
 * 智能代码补全器
 */
class SmartCodeCompleter {
    contextEnhancer;
    codeGenerator;
    debugAnalyzer;
    config;
    languageConfigs = {
        typescript: {
            keywords: [
                'abstract', 'as', 'asserts', 'async', 'await', 'break', 'case', 'catch',
                'class', 'const', 'continue', 'debugger', 'declare', 'default', 'delete',
                'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
                'from', 'function', 'get', 'if', 'implements', 'import', 'in', 'instanceof',
                'interface', 'is', 'keyof', 'let', 'module', 'namespace', 'never', 'new',
                'null', 'of', 'package', 'private', 'protected', 'public', 'readonly',
                'require', 'return', 'set', 'static', 'super', 'switch', 'this', 'throw',
                'true', 'try', 'type', 'typeof', 'undefined', 'unique', 'unknown', 'var',
                'void', 'while', 'with', 'yield'
            ],
            commonSnippets: [
                { label: 'console.log', insertText: 'console.log(${1:message});' },
                { label: 'function', insertText: 'function ${1:name}(${2:params}) {\n\t${3:// code}\n}' },
                { label: 'arrow function', insertText: 'const ${1:name} = (${2:params}) => {\n\t${3:// code}\n};' },
                { label: 'if statement', insertText: 'if (${1:condition}) {\n\t${2:// code}\n}' },
                { label: 'try-catch', insertText: 'try {\n\t${1:// code}\n} catch (error) {\n\t${2:// handle error}\n}' },
            ],
            importPatterns: [
                'import',
                'from',
                'require',
                'export',
            ],
        },
        javascript: {
            keywords: [
                'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
                'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
                'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'return',
                'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void',
                'while', 'with', 'yield'
            ],
            commonSnippets: [
                { label: 'console.log', insertText: 'console.log(${1:message});' },
                { label: 'function', insertText: 'function ${1:name}(${2:params}) {\n\t${3:// code}\n}' },
                { label: 'arrow function', insertText: 'const ${1:name} = (${2:params}) => {\n\t${3:// code}\n};' },
            ],
            importPatterns: [
                'import',
                'from',
                'require',
                'export',
            ],
        },
        python: {
            keywords: [
                'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
                'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
                'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
                'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
                'try', 'while', 'with', 'yield'
            ],
            commonSnippets: [
                { label: 'print', insertText: 'print(${1:message})' },
                { label: 'def function', insertText: 'def ${1:name}(${2:params}):\n\t${3:pass}' },
                { label: 'class', insertText: 'class ${1:ClassName}:\n\tdef __init__(self${2:, params}):\n\t\t${3:pass}' },
                { label: 'if statement', insertText: 'if ${1:condition}:\n\t${2:pass}' },
                { label: 'try-except', insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as e:\n\t${3:pass}' },
            ],
            importPatterns: [
                'import',
                'from',
            ],
        },
    };
    constructor(workspaceRoot, config) {
        this.contextEnhancer = new CodeContextEnhancer_1.CodeContextEnhancer(workspaceRoot);
        this.config = {
            maxItems: 50,
            minConfidence: 0.3,
            enableSmartSuggestions: true,
            enableErrorFixes: true,
            enableSnippets: true,
            enableTypeInference: true,
            contextDepth: 'normal',
            languageConfigs: this.languageConfigs,
            ...config,
        };
    }
    /**
     * 设置代码生成器（可选）
     */
    setCodeGenerator(generator) {
        this.codeGenerator = generator;
    }
    /**
     * 设置调试分析器（可选）
     */
    setDebugAnalyzer(analyzer) {
        this.debugAnalyzer = analyzer;
    }
    /**
     * 获取代码补全
     */
    async getCompletions(context) {
        const startTime = Date.now();
        try {
            // 1. 分析当前上下文
            const analysis = await this.analyzeContext(context);
            // 2. 生成基础补全项
            let items = await this.generateBasicCompletions(context, analysis);
            // 3. 生成智能建议（如果启用）
            if (this.config.enableSmartSuggestions) {
                const smartItems = await this.generateSmartSuggestions(context, analysis);
                items = [...items, ...smartItems];
            }
            // 4. 生成错误修复（如果启用且需要）
            if (this.config.enableErrorFixes && this.debugAnalyzer) {
                const errorFixItems = await this.generateErrorFixes(context);
                items = [...items, ...errorFixItems];
            }
            // 5. 过滤和排序
            items = this.filterAndSortCompletions(items, context);
            // 6. 限制数量
            items = items.slice(0, this.config.maxItems);
            const analysisTime = Date.now() - startTime;
            return {
                success: true,
                items,
                incomplete: items.length >= this.config.maxItems,
                analysis: {
                    analysisTime,
                    contextDepth: this.config.contextDepth,
                    analyzersUsed: this.getAnalyzersUsed(),
                    suggestionsGenerated: items.length,
                    suggestionsFiltered: 0, // 简化，实际应该计算
                },
            };
        }
        catch (error) {
            return {
                success: false,
                items: [],
                analysis: {
                    analysisTime: Date.now() - startTime,
                    contextDepth: this.config.contextDepth,
                    analyzersUsed: [],
                    suggestionsGenerated: 0,
                    suggestionsFiltered: 0,
                },
                error: error.message,
            };
        }
    }
    /**
     * 分析上下文
     */
    async analyzeContext(context) {
        const filePath = context.filePath;
        const cursorPosition = context.cursorPosition;
        const fileContent = context.fileContent;
        const currentLine = context.currentLine;
        // 检测编程语言
        const language = this.detectLanguage(filePath, context.editorState?.languageId);
        // 获取当前单词
        const currentWord = this.getCurrentWord(currentLine, cursorPosition.character);
        // 获取行前缀和后缀
        const linePrefix = currentLine.substring(0, cursorPosition.character);
        const lineSuffix = currentLine.substring(cursorPosition.character);
        // 分析语句类型
        const isImportStatement = this.isImportStatement(linePrefix, language);
        const isTypeAnnotation = this.isTypeAnnotation(linePrefix, language);
        const isFunctionCall = this.isFunctionCall(linePrefix, language);
        const isPropertyAccess = this.isPropertyAccess(linePrefix, language);
        // 获取查询上下文（如果深度分析）
        let queryContext;
        if (this.config.contextDepth !== 'shallow' && fs.existsSync(filePath)) {
            try {
                queryContext = await this.contextEnhancer.getQueryContext(`Completions at line ${cursorPosition.line + 1}, character ${cursorPosition.character + 1}`);
            }
            catch (error) {
                // 忽略上下文分析错误
            }
        }
        return {
            language,
            queryContext,
            currentWord,
            linePrefix,
            lineSuffix,
            isImportStatement,
            isTypeAnnotation,
            isFunctionCall,
            isPropertyAccess,
        };
    }
    /**
     * 检测编程语言
     */
    detectLanguage(filePath, editorLanguageId) {
        // 优先使用编辑器语言ID
        if (editorLanguageId) {
            return editorLanguageId.toLowerCase();
        }
        // 根据文件扩展名检测
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.ts':
            case '.tsx':
                return 'typescript';
            case '.js':
            case '.jsx':
                return 'javascript';
            case '.py':
                return 'python';
            case '.java':
                return 'java';
            case '.cpp':
            case '.cc':
            case '.cxx':
                return 'cpp';
            case '.c':
                return 'c';
            case '.cs':
                return 'csharp';
            case '.php':
                return 'php';
            case '.rb':
                return 'ruby';
            case '.go':
                return 'go';
            case '.rs':
                return 'rust';
            default:
                return 'typescript'; // 默认
        }
    }
    /**
     * 获取当前单词
     */
    getCurrentWord(line, cursorPosition) {
        // 找到光标前的单词开始位置
        let start = cursorPosition;
        while (start > 0 && this.isWordCharacter(line.charAt(start - 1))) {
            start--;
        }
        // 找到光标后的单词结束位置
        let end = cursorPosition;
        while (end < line.length && this.isWordCharacter(line.charAt(end))) {
            end++;
        }
        return line.substring(start, end);
    }
    /**
     * 检查字符是否为单词字符
     */
    isWordCharacter(char) {
        return /[a-zA-Z0-9_$]/.test(char);
    }
    /**
     * 检查是否为导入语句
     */
    isImportStatement(linePrefix, language) {
        const prefix = linePrefix.trim();
        switch (language) {
            case 'typescript':
            case 'javascript':
                return prefix.startsWith('import ') || prefix.startsWith('from ');
            case 'python':
                return prefix.startsWith('import ') || prefix.startsWith('from ');
            default:
                return false;
        }
    }
    /**
     * 检查是否为类型注解
     */
    isTypeAnnotation(linePrefix, language) {
        if (language !== 'typescript') {
            return false;
        }
        const prefix = linePrefix.trim();
        return prefix.endsWith(': ') || prefix.endsWith(':');
    }
    /**
     * 检查是否为函数调用
     */
    isFunctionCall(linePrefix, language) {
        const prefix = linePrefix.trim();
        return prefix.endsWith('(') || prefix.endsWith('.');
    }
    /**
     * 检查是否为属性访问
     */
    isPropertyAccess(linePrefix, language) {
        const prefix = linePrefix.trim();
        return prefix.endsWith('.');
    }
    /**
     * 生成基础补全项
     */
    async generateBasicCompletions(context, analysis) {
        const items = [];
        const { language, currentWord, isImportStatement } = analysis;
        // 1. 关键字补全
        if (currentWord.length === 0 || this.config.languageConfigs[language]?.keywords.some(k => k.startsWith(currentWord))) {
            const keywords = this.config.languageConfigs[language]?.keywords || [];
            for (const keyword of keywords) {
                if (currentWord.length === 0 || keyword.startsWith(currentWord)) {
                    items.push({
                        label: keyword,
                        type: 'keyword',
                        insertText: keyword,
                        confidence: 0.9,
                        isSmartSuggestion: false,
                    });
                }
            }
        }
        // 2. 代码片段补全
        if (this.config.enableSnippets) {
            const snippets = this.config.languageConfigs[language]?.commonSnippets || [];
            for (const snippet of snippets) {
                if (currentWord.length === 0 || snippet.label.toLowerCase().includes(currentWord.toLowerCase())) {
                    items.push({
                        label: snippet.label,
                        type: 'snippet',
                        detail: 'Code snippet',
                        insertText: snippet.insertText,
                        confidence: 0.8,
                        isSmartSuggestion: false,
                    });
                }
            }
        }
        // 3. 导入补全（如果是导入语句）
        if (isImportStatement) {
            const importItems = await this.generateImportCompletions(context, analysis);
            items.push(...importItems);
        }
        return items;
    }
    /**
     * 生成导入补全项
     */
    async generateImportCompletions(context, analysis) {
        const items = [];
        const { language, queryContext } = analysis;
        // 常见的导入项
        const commonImports = {
            typescript: [
                { name: 'react', description: 'React library' },
                { name: 'vue', description: 'Vue.js library' },
                { name: 'axios', description: 'HTTP client' },
                { name: 'lodash', description: 'Utility library' },
                { name: 'moment', description: 'Date library' },
                { name: 'express', description: 'Web framework' },
                { name: '@types/node', description: 'Node.js type definitions' },
            ],
            javascript: [
                { name: 'react', description: 'React library' },
                { name: 'vue', description: 'Vue.js library' },
                { name: 'axios', description: 'HTTP client' },
                { name: 'lodash', description: 'Utility library' },
                { name: 'moment', description: 'Date library' },
            ],
            python: [
                { name: 'numpy', description: 'Numerical computing' },
                { name: 'pandas', description: 'Data analysis' },
                { name: 'requests', description: 'HTTP library' },
                { name: 'flask', description: 'Web framework' },
                { name: 'django', description: 'Web framework' },
                { name: 'pytest', description: 'Testing framework' },
            ],
        };
        const imports = commonImports[language] || [];
        for (const imp of imports) {
            items.push({
                label: imp.name,
                type: 'import',
                detail: imp.description,
                insertText: imp.name,
                confidence: 0.7,
                isSmartSuggestion: false,
            });
        }
        // 从项目上下文中添加导入
        if (queryContext?.project?.files) {
            const projectFiles = queryContext.project.files.slice(0, 10); // 限制数量
            for (const file of projectFiles) {
                if (file.name.endsWith('.ts') || file.name.endsWith('.js') || file.name.endsWith('.tsx') || file.name.endsWith('.jsx')) {
                    const moduleName = file.name.replace(/\.[^/.]+$/, ''); // 移除扩展名
                    items.push({
                        label: `./${moduleName}`,
                        type: 'import',
                        detail: `Local module: ${file.path}`,
                        insertText: `'./${moduleName}'`,
                        confidence: 0.6,
                        isSmartSuggestion: true,
                    });
                }
            }
        }
        return items;
    }
    /**
     * 生成智能建议
     */
    async generateSmartSuggestions(context, analysis) {
        const items = [];
        const { language, queryContext, currentWord, linePrefix, isFunctionCall, isPropertyAccess } = analysis;
        // 1. 基于上下文的函数/方法建议
        if ((isFunctionCall || isPropertyAccess) && queryContext?.currentFile) {
            const functionSuggestions = await this.generateFunctionSuggestions(context, queryContext);
            items.push(...functionSuggestions);
        }
        // 2. 基于项目结构的建议
        if (queryContext?.project) {
            const projectSuggestions = await this.generateProjectSuggestions(context, queryContext);
            items.push(...projectSuggestions);
        }
        // 3. 类型推断建议（对于TypeScript）
        if (language === 'typescript' && this.config.enableTypeInference) {
            const typeSuggestions = await this.generateTypeSuggestions(context, analysis);
            items.push(...typeSuggestions);
        }
        return items;
    }
    /**
     * 生成函数建议
     */
    async generateFunctionSuggestions(context, queryContext) {
        const items = [];
        const currentFile = queryContext.currentFile;
        if (!currentFile) {
            return items;
        }
        // 添加当前文件的函数
        for (const func of currentFile.functions) {
            items.push({
                label: func.name,
                type: 'function',
                detail: `Function in ${currentFile.filePath}`,
                documentation: func.documentation || `Function ${func.name}`,
                insertText: func.name,
                confidence: 0.8,
                isSmartSuggestion: true,
            });
        }
        // 添加当前文件的方法
        for (const cls of currentFile.classes) {
            for (const method of cls.methods) {
                items.push({
                    label: method.name,
                    type: 'method',
                    detail: `Method in ${cls.name}`,
                    documentation: `Method ${method.name}`,
                    insertText: method.name,
                    confidence: 0.7,
                    isSmartSuggestion: true,
                });
            }
        }
        return items;
    }
    /**
     * 生成项目建议
     */
    async generateProjectSuggestions(context, queryContext) {
        const items = [];
        const project = queryContext.project;
        if (!project) {
            return items;
        }
        // 添加项目中的常见模式
        // 这里可以扩展为基于项目统计的智能建议
        return items;
    }
    /**
     * 生成类型建议
     */
    async generateTypeSuggestions(context, analysis) {
        const items = [];
        const { linePrefix, queryContext } = analysis;
        // 常见的TypeScript类型
        const commonTypes = [
            'string', 'number', 'boolean', 'any', 'void', 'null', 'undefined',
            'object', 'Array', 'Promise', 'Date', 'Error', 'RegExp', 'Map', 'Set',
        ];
        // 检查是否在类型注解位置
        if (linePrefix.includes(':') || linePrefix.includes(':')) {
            for (const type of commonTypes) {
                items.push({
                    label: type,
                    type: 'type',
                    detail: 'TypeScript type',
                    insertText: type,
                    confidence: 0.9,
                    isSmartSuggestion: true,
                });
            }
            // 添加项目中的自定义类型
            if (queryContext?.currentFile?.interfaces) {
                for (const iface of queryContext.currentFile.interfaces) {
                    items.push({
                        label: iface.name,
                        type: 'interface',
                        detail: `Interface: ${iface.name}`,
                        insertText: iface.name,
                        confidence: 0.7,
                        isSmartSuggestion: true,
                    });
                }
            }
            if (queryContext?.currentFile?.types) {
                for (const typeDef of queryContext.currentFile.types) {
                    items.push({
                        label: typeDef.name,
                        type: 'type',
                        detail: `Type alias: ${typeDef.name}`,
                        insertText: typeDef.name,
                        confidence: 0.7,
                        isSmartSuggestion: true,
                    });
                }
            }
        }
        return items;
    }
    /**
     * 生成错误修复
     */
    async generateErrorFixes(context) {
        const items = [];
        if (!this.debugAnalyzer) {
            return items;
        }
        // 分析当前行的潜在错误
        try {
            // 这里可以扩展为分析当前上下文中的错误
            // 目前提供一些通用的错误修复建议
            const commonFixes = [
                {
                    label: 'Add missing semicolon',
                    type: 'error_fix',
                    detail: 'Fix syntax error',
                    insertText: ';',
                    confidence: 0.6,
                    isSmartSuggestion: true,
                },
                {
                    label: 'Add missing import',
                    type: 'error_fix',
                    detail: 'Add required import',
                    insertText: "import { } from '';",
                    confidence: 0.5,
                    isSmartSuggestion: true,
                },
                {
                    label: 'Fix typo',
                    type: 'error_fix',
                    detail: 'Potential typo correction',
                    insertText: '', // 实际应该基于上下文
                    confidence: 0.4,
                    isSmartSuggestion: true,
                },
            ];
            for (const fix of commonFixes) {
                items.push({
                    ...fix,
                    isSmartSuggestion: true,
                });
            }
        }
        catch (error) {
            // 忽略错误分析失败
        }
        return items;
    }
    /**
     * 过滤和排序补全项
     */
    filterAndSortCompletions(items, context) {
        const { currentWord } = context;
        // 1. 过滤置信度
        let filtered = items.filter(item => item.confidence >= this.config.minConfidence);
        // 2. 去重（基于标签）
        const seen = new Set();
        filtered = filtered.filter(item => {
            const key = `${item.label}:${item.type}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
        // 3. 排序
        filtered.sort((a, b) => {
            // 首先按是否匹配当前单词排序
            const normalizedWord = currentWord?.toLowerCase() || '';
            const aStartsWith = normalizedWord ? a.label.toLowerCase().startsWith(normalizedWord) : false;
            const bStartsWith = normalizedWord ? b.label.toLowerCase().startsWith(normalizedWord) : false;
            if (aStartsWith && !bStartsWith)
                return -1;
            if (!aStartsWith && bStartsWith)
                return 1;
            // 然后按置信度排序
            if (b.confidence !== a.confidence) {
                return b.confidence - a.confidence;
            }
            // 最后按类型排序
            const typeOrder = {
                'keyword': 0,
                'import': 1,
                'type': 2,
                'function': 3,
                'method': 4,
                'property': 5,
                'variable': 6,
                'class': 7,
                'interface': 8,
                'snippet': 9,
                'error_fix': 10,
                'suggestion': 11,
            };
            return typeOrder[a.type] - typeOrder[b.type];
        });
        return filtered;
    }
    /**
     * 获取使用的分析器
     */
    getAnalyzersUsed() {
        const analyzers = ['context'];
        if (this.config.enableSmartSuggestions) {
            analyzers.push('smart');
        }
        if (this.config.enableErrorFixes && this.debugAnalyzer) {
            analyzers.push('error');
        }
        if (this.config.enableSnippets) {
            analyzers.push('snippets');
        }
        if (this.config.enableTypeInference) {
            analyzers.push('types');
        }
        return analyzers;
    }
    /**
     * 更新配置
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * 获取当前配置
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.SmartCodeCompleter = SmartCodeCompleter;
/**
 * 创建默认的智能代码补全器
 */
function createSmartCodeCompleter(workspaceRoot, options) {
    const completer = new SmartCodeCompleter(workspaceRoot, options?.config);
    if (options?.codeGenerator) {
        completer.setCodeGenerator(options.codeGenerator);
    }
    if (options?.debugAnalyzer) {
        completer.setDebugAnalyzer(options.debugAnalyzer);
    }
    return completer;
}
exports.default = SmartCodeCompleter;
//# sourceMappingURL=SmartCodeCompleter.js.map