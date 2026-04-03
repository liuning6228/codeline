import * as vscode from 'vscode';
import { ModelAdapter } from '../models/modelAdapter';
import { EnhancedProjectAnalyzer } from '../analyzer/enhancedProjectAnalyzer';
import { 
  CompletionOptions, 
  CompletionContext, 
  CompletionItem,
  AISuggestion,
  CompletionResult 
} from './types';

/**
 * CodeLine代码补全提供者
 * 提供AI驱动的智能代码补全建议
 */
export class CodeCompletionProvider implements vscode.CompletionItemProvider {
  private modelAdapter: ModelAdapter;
  private projectAnalyzer: EnhancedProjectAnalyzer;
  private options: CompletionOptions;
  private cache: Map<string, { items: vscode.CompletionItem[]; timestamp: number }> = new Map();
  private isGenerating: boolean = false;
  private lastRequestTime: number = 0;

  constructor(
    modelAdapter: ModelAdapter,
    projectAnalyzer: EnhancedProjectAnalyzer,
    options?: Partial<CompletionOptions>
  ) {
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
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): Promise<vscode.CompletionItem[] | vscode.CompletionList | null | undefined> {
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
      
    } catch (error) {
      console.error('CodeLine: Error generating completions:', error);
      // 返回空数组而不是抛出错误，避免影响正常的补全功能
      return [];
    }
  }

  /**
   * VS Code API: 解析补全项（添加更多信息）
   */
  async resolveCompletionItem(
    item: vscode.CompletionItem,
    token: vscode.CancellationToken
  ): Promise<vscode.CompletionItem> {
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
  private createCompletionContext(
    document: vscode.TextDocument,
    position: vscode.Position
  ): CompletionContext {
    const line = document.lineAt(position.line).text;
    const wordRange = document.getWordRangeAtPosition(position);
    const currentWord = wordRange ? document.getText(wordRange) : '';
    
    // 获取代码片段上下文（前5行）
    const snippetContext: string[] = [];
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
  private generateCacheKey(document: vscode.TextDocument, position: vscode.Position): string {
    const line = document.lineAt(position.line).text;
    const wordRange = document.getWordRangeAtPosition(position);
    const currentWord = wordRange ? document.getText(wordRange) : '';
    
    return `${document.uri.toString()}:${position.line}:${position.character}:${currentWord}:${line}`;
  }

  /**
   * 获取基础补全项（来自语言服务器或内置）
   */
  private async getBaseCompletions(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<vscode.CompletionItem[]> {
    // 这里可以集成语言服务器的补全
    // 目前返回空数组，后续可以扩展
    return [];
  }

  /**
   * 获取AI生成的补全项
   */
  private async getAICompletions(
    context: CompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CompletionItem[]> {
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
        } catch (error) {
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
      
    } catch (error) {
      console.error('CodeLine: Error generating AI completions:', error);
      return [];
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * 生成AI提示词
   */
  private generateAIPrompt(context: CompletionContext): string {
    const { currentLine, currentWord, snippetContext, languageId } = context;
    
    const languageMap: Record<string, string> = {
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
  private parseAIResponse(response: string, context: CompletionContext): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
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
            type: type as AISuggestion['type'],
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
  private createCompletionItem(suggestion: AISuggestion, context: CompletionContext): vscode.CompletionItem {
    const item = new vscode.CompletionItem(
      suggestion.code,
      this.getCompletionItemKind(suggestion.type)
    );
    
    item.detail = `${suggestion.explanation} (AI)`;
    item.documentation = new vscode.MarkdownString(suggestion.context || 'AI-generated suggestion');
    
    // 设置排序文本，使AI建议出现在合适的位置
    item.sortText = `z_ai_${(1 - suggestion.confidence).toFixed(3)}`;
    
    // 如果是代码片段，添加占位符
    if (suggestion.code.includes('$0') || suggestion.code.includes('${')) {
      item.insertText = new vscode.SnippetString(suggestion.code);
    } else {
      item.insertText = suggestion.code;
    }
    
    return item;
  }

  /**
   * 根据建议类型获取补全项类型
   */
  private getCompletionItemKind(type: AISuggestion['type']): vscode.CompletionItemKind {
    const map: Record<AISuggestion['type'], vscode.CompletionItemKind> = {
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
  public updateOptions(options: Partial<CompletionOptions>): void {
    this.options = { ...this.options, ...options };
    console.log('CodeLine: Updated completion options', this.options);
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('CodeLine: Cleared completion cache');
  }

  /**
   * 启用/禁用补全提供者
   */
  public setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
    console.log(`CodeLine: Completion provider ${enabled ? 'enabled' : 'disabled'}`);
  }
}