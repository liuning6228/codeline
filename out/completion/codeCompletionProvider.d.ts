import * as vscode from 'vscode';
import { ModelAdapter } from '../models/modelAdapter';
import { EnhancedProjectAnalyzer } from '../analyzer/enhancedProjectAnalyzer';
import { CompletionOptions } from './types';
/**
 * CodeLine代码补全提供者
 * 提供AI驱动的智能代码补全建议
 */
export declare class CodeCompletionProvider implements vscode.CompletionItemProvider {
    private modelAdapter;
    private projectAnalyzer;
    private options;
    private cache;
    private isGenerating;
    private lastRequestTime;
    constructor(modelAdapter: ModelAdapter, projectAnalyzer: EnhancedProjectAnalyzer, options?: Partial<CompletionOptions>);
    /**
     * VS Code API: 提供补全项
     */
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): Promise<vscode.CompletionItem[] | vscode.CompletionList | null | undefined>;
    /**
     * VS Code API: 解析补全项（添加更多信息）
     */
    resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): Promise<vscode.CompletionItem>;
    /**
     * 创建补全上下文
     */
    private createCompletionContext;
    /**
     * 生成缓存键
     */
    private generateCacheKey;
    /**
     * 获取基础补全项（来自语言服务器或内置）
     */
    private getBaseCompletions;
    /**
     * 获取AI生成的补全项
     */
    private getAICompletions;
    /**
     * 生成AI提示词
     */
    private generateAIPrompt;
    /**
     * 解析AI响应
     */
    private parseAIResponse;
    /**
     * 创建VS Code补全项
     */
    private createCompletionItem;
    /**
     * 根据建议类型获取补全项类型
     */
    private getCompletionItemKind;
    /**
     * 更新配置选项
     */
    updateOptions(options: Partial<CompletionOptions>): void;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 启用/禁用补全提供者
     */
    setEnabled(enabled: boolean): void;
}
//# sourceMappingURL=codeCompletionProvider.d.ts.map