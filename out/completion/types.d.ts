/**
 * 代码补全模块类型定义
 */
export interface CompletionOptions {
    /** 是否启用AI驱动的代码补全 */
    enabled: boolean;
    /** 触发补全的延迟时间（毫秒） */
    triggerDelay: number;
    /** 最大补全项数量 */
    maxItems: number;
    /** 是否缓存补全结果 */
    useCache: boolean;
    /** 缓存过期时间（毫秒） */
    cacheTTL: number;
    /** 是否使用增强上下文分析 */
    useEnhancedContext: boolean;
    /** 支持的编程语言 */
    supportedLanguages: string[];
    /** 是否显示AI生成的建议 */
    showAISuggestions: boolean;
    /** AI建议的最小置信度（0-1） */
    minConfidence: number;
}
export interface CompletionContext {
    /** 当前文档 */
    document: any;
    /** 当前位置 */
    position: any;
    /** 当前行的文本内容 */
    currentLine: string;
    /** 当前单词（光标前的单词） */
    currentWord: string;
    /** 当前文件路径 */
    filePath: string;
    /** 项目上下文 */
    projectContext?: any;
    /** 增强分析上下文（如果可用） */
    enhancedContext?: any;
    /** 代码片段上下文（前几行） */
    snippetContext: string[];
    /** 语言ID */
    languageId: string;
}
export interface CompletionItem {
    /** 显示的标签 */
    label: string;
    /** 补全项类型（方法、属性、类等） */
    kind: number;
    /** 插入的文本 */
    insertText: string;
    /** 文档说明 */
    documentation?: string;
    /** 排序优先级 */
    sortText?: string;
    /** 是否来自AI生成 */
    isAI?: boolean;
    /** AI置信度（0-1） */
    confidence?: number;
    /** 代码片段（如果适用） */
    snippet?: string;
    /** 额外命令（如插入后执行） */
    command?: any;
}
export interface AISuggestion {
    /** 建议的代码 */
    code: string;
    /** 说明 */
    explanation: string;
    /** 置信度（0-1） */
    confidence: number;
    /** 建议类型（函数补全、类型补全、导入补全等） */
    type: 'function' | 'type' | 'import' | 'variable' | 'method' | 'class' | 'other';
    /** 相关的上下文信息 */
    context?: string;
}
export interface CompletionResult {
    /** 补全项列表 */
    items: CompletionItem[];
    /** 是否从缓存获取 */
    fromCache: boolean;
    /** 生成耗时（毫秒） */
    generationTime: number;
    /** AI生成的项目数量 */
    aiGeneratedCount: number;
    /** 错误信息（如果有） */
    error?: string;
}
//# sourceMappingURL=types.d.ts.map