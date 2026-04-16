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
import { CodeGeneratorTool } from './tools/CodeGeneratorTool';
import { DebugAnalyzerTool } from './tools/DebugAnalyzerTool';
/**
 * 编辑器上下文
 */
export interface EditorContext {
    /** 当前文件路径 */
    filePath: string;
    /** 光标位置 */
    cursorPosition: {
        line: number;
        character: number;
    };
    /** 当前行文本 */
    currentLine: string;
    /** 当前文件内容 */
    fileContent: string;
    /** 选中文本文本 */
    selectedText?: string;
    /** 触发补全的字符 */
    triggerCharacter?: string;
    /** 当前单词 */
    currentWord?: string;
    /** 编辑器状态 */
    editorState?: {
        languageId: string;
        isUntitled: boolean;
        hasSelection: boolean;
    };
}
/**
 * 补全项类型
 */
export type CompletionType = 'method' | 'property' | 'function' | 'class' | 'interface' | 'variable' | 'keyword' | 'snippet' | 'import' | 'type' | 'error_fix' | 'error_fix' | 'suggestion';
/**
 * 补全项
 */
export interface CompletionItem {
    /** 显示标签 */
    label: string;
    /** 补全类型 */
    type: CompletionType;
    /** 详细描述 */
    detail?: string;
    /** 文档说明 */
    documentation?: string;
    /** 插入文本 */
    insertText: string;
    /** 排序优先级 */
    sortText?: string;
    /** 过滤器文本 */
    filterText?: string;
    /** 范围信息 */
    range?: {
        start: {
            line: number;
            character: number;
        };
        end: {
            line: number;
            character: number;
        };
    };
    /** 附加数据 */
    data?: any;
    /** 置信度 (0-1) */
    confidence: number;
    /** 是否为智能建议（而非标准补全） */
    isSmartSuggestion: boolean;
}
/**
 * 补全结果
 */
export interface CompletionResult {
    /** 是否成功 */
    success: boolean;
    /** 补全项列表 */
    items: CompletionItem[];
    /** 是否不完整（需要更多输入） */
    incomplete?: boolean;
    /** 分析统计 */
    analysis: {
        /** 分析时间（毫秒） */
        analysisTime: number;
        /** 上下文分析深度 */
        contextDepth: 'shallow' | 'normal' | 'deep';
        /** 使用的分析器 */
        analyzersUsed: string[];
        /** 生成的建议数 */
        suggestionsGenerated: number;
        /** 过滤掉的建议数 */
        suggestionsFiltered: number;
    };
    /** 错误信息 */
    error?: string;
}
/**
 * 补全配置
 */
export interface CompletionConfig {
    /** 最大补全项数量 */
    maxItems: number;
    /** 最小置信度阈值 */
    minConfidence: number;
    /** 是否启用智能建议 */
    enableSmartSuggestions: boolean;
    /** 是否启用错误修复 */
    enableErrorFixes: boolean;
    /** 是否启用代码片段 */
    enableSnippets: boolean;
    /** 是否启用类型推断 */
    enableTypeInference: boolean;
    /** 上下文分析深度 */
    contextDepth: 'shallow' | 'normal' | 'deep';
    /** 语言特定配置 */
    languageConfigs: Record<string, {
        keywords: string[];
        commonSnippets: Array<{
            label: string;
            insertText: string;
        }>;
        importPatterns: string[];
    }>;
}
/**
 * 智能代码补全器
 */
export declare class SmartCodeCompleter {
    private contextEnhancer;
    private codeGenerator?;
    private debugAnalyzer?;
    private config;
    private languageConfigs;
    constructor(workspaceRoot: string, config?: Partial<CompletionConfig>);
    /**
     * 设置代码生成器（可选）
     */
    setCodeGenerator(generator: CodeGeneratorTool): void;
    /**
     * 设置调试分析器（可选）
     */
    setDebugAnalyzer(analyzer: DebugAnalyzerTool): void;
    /**
     * 获取代码补全
     */
    getCompletions(context: EditorContext): Promise<CompletionResult>;
    /**
     * 分析上下文
     */
    private analyzeContext;
    /**
     * 检测编程语言
     */
    private detectLanguage;
    /**
     * 获取当前单词
     */
    private getCurrentWord;
    /**
     * 检查字符是否为单词字符
     */
    private isWordCharacter;
    /**
     * 检查是否为导入语句
     */
    private isImportStatement;
    /**
     * 检查是否为类型注解
     */
    private isTypeAnnotation;
    /**
     * 检查是否为函数调用
     */
    private isFunctionCall;
    /**
     * 检查是否为属性访问
     */
    private isPropertyAccess;
    /**
     * 生成基础补全项
     */
    private generateBasicCompletions;
    /**
     * 生成导入补全项
     */
    private generateImportCompletions;
    /**
     * 生成智能建议
     */
    private generateSmartSuggestions;
    /**
     * 生成函数建议
     */
    private generateFunctionSuggestions;
    /**
     * 生成项目建议
     */
    private generateProjectSuggestions;
    /**
     * 生成类型建议
     */
    private generateTypeSuggestions;
    /**
     * 生成错误修复
     */
    private generateErrorFixes;
    /**
     * 过滤和排序补全项
     */
    private filterAndSortCompletions;
    /**
     * 获取使用的分析器
     */
    private getAnalyzersUsed;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<CompletionConfig>): void;
    /**
     * 获取当前配置
     */
    getConfig(): CompletionConfig;
}
/**
 * 创建默认的智能代码补全器
 */
export declare function createSmartCodeCompleter(workspaceRoot: string, options?: {
    codeGenerator?: CodeGeneratorTool;
    debugAnalyzer?: DebugAnalyzerTool;
    config?: Partial<CompletionConfig>;
}): SmartCodeCompleter;
export default SmartCodeCompleter;
//# sourceMappingURL=SmartCodeCompleter.d.ts.map