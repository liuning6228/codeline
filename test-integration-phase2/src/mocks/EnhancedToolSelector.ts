/**
 * 增强工具选择器
 * 提供更智能的工具选择和参数提取功能
 */

import { MockTool } from './ToolRegistry';

// ==================== 类型定义 ====================

/**
 * 工具匹配结果
 */
export interface ToolMatchResult {
  tool: MockTool;
  score: number;
  confidence: number;
  extractedParams: Record<string, any>;
  reason: string;
  suggestedNextTools?: string[];
}

/**
 * 工具执行历史记录
 */
export interface ToolExecutionHistory {
  toolName: string;
  timestamp: Date;
  params: Record<string, any>;
  result: any;
  success: boolean;
  executionTime: number;
}

/**
 * 工具链步骤
 */
export interface ToolChainStep {
  toolName: string;
  params: Record<string, any>;
  dependsOn?: string[]; // 依赖的前置工具
  condition?: (context: any) => boolean; // 执行条件
}

// ==================== 增强工具选择器 ====================

export class EnhancedToolSelector {
  private toolRegistry: any;
  private executionHistory: ToolExecutionHistory[] = [];
  private maxHistorySize = 100;
  
  constructor(toolRegistry: any) {
    this.toolRegistry = toolRegistry;
  }
  
  /**
   * 为任务选择最佳工具
   */
  public selectBestTool(userQuery: string, context?: any): ToolMatchResult | null {
    const tools = this.toolRegistry.getAllTools();
    if (tools.length === 0) {
      return null;
    }
    
    // 计算每个工具的匹配分数
    const matches: ToolMatchResult[] = [];
    
    for (const tool of tools) {
      const matchResult = this.evaluateToolMatch(tool, userQuery, context);
      matches.push(matchResult);
    }
    
    // 按分数排序
    matches.sort((a, b) => b.score - a.score);
    
    // 返回最佳匹配（如果分数足够高）
    const bestMatch = matches[0];
    if (bestMatch.score > 0.3) { // 阈值
      return bestMatch;
    }
    
    return null;
  }
  
  /**
   * 评估工具匹配度
   */
  private evaluateToolMatch(tool: MockTool, userQuery: string, context?: any): ToolMatchResult {
    let score = 0;
    const extractedParams: Record<string, any> = {};
    const reasons: string[] = [];
    
    // 1. 基于工具名称的匹配
    const nameMatchScore = this.calculateNameMatchScore(tool.name, userQuery);
    score += nameMatchScore * 0.3;
    if (nameMatchScore > 0) {
      reasons.push(`工具名称匹配: ${tool.name}`);
    }
    
    // 2. 基于工具描述的匹配
    const descriptionMatchScore = this.calculateDescriptionMatchScore(tool.description, userQuery);
    score += descriptionMatchScore * 0.4;
    if (descriptionMatchScore > 0) {
      reasons.push(`描述匹配: ${tool.description}`);
    }
    
    // 3. 基于类别的匹配
    const categoryMatchScore = this.calculateCategoryMatchScore(tool.category, userQuery);
    score += categoryMatchScore * 0.2;
    if (categoryMatchScore > 0) {
      reasons.push(`类别匹配: ${tool.category}`);
    }
    
    // 4. 基于历史使用模式的匹配
    const historyBonus = this.calculateHistoryBonus(tool.name);
    score += historyBonus * 0.1;
    if (historyBonus > 0) {
      reasons.push(`历史使用加成`);
    }
    
    // 提取参数
    this.extractParameters(tool, userQuery, extractedParams);
    
    // 计算置信度（0-1）
    const confidence = Math.min(score, 1);
    
    return {
      tool,
      score,
      confidence,
      extractedParams,
      reason: reasons.join('; ')
    };
  }
  
  /**
   * 计算名称匹配分数
   */
  private calculateNameMatchScore(toolName: string, userQuery: string): number {
    const query = userQuery.toLowerCase();
    const name = toolName.toLowerCase();
    
    // 检查工具名称是否出现在查询中
    if (query.includes(name.replace('_', ' ')) || 
        this.hasCommonKeywords(name, query)) {
      return 0.8;
    }
    
    // 检查部分匹配
    const nameParts = name.split('_');
    for (const part of nameParts) {
      if (part.length > 3 && query.includes(part)) {
        return 0.5;
      }
    }
    
    return 0;
  }
  
  /**
   * 计算描述匹配分数
   */
  private calculateDescriptionMatchScore(description: string, userQuery: string): number {
    const query = userQuery.toLowerCase();
    const desc = description.toLowerCase();
    
    // 关键词匹配
    const keywords = this.extractKeywords(query);
    let matchCount = 0;
    
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        matchCount++;
      }
    }
    
    if (matchCount > 0) {
      return Math.min(matchCount / keywords.length, 0.8);
    }
    
    return 0;
  }
  
  /**
   * 计算类别匹配分数
   */
  private calculateCategoryMatchScore(category: string, userQuery: string): number {
    const query = userQuery.toLowerCase();
    const cat = category.toLowerCase();
    
    // 类别关键词映射
    const categoryKeywords: Record<string, string[]> = {
      'file': ['文件', '读取', '写入', '保存', '打开', '关闭', '编辑', '修改'],
      'terminal': ['命令', '执行', '运行', '终端', 'shell', 'bash', '命令行'],
      'code': ['代码', '分析', '检查', '审查', '重构', '修复', '调试', '测试']
    };
    
    if (categoryKeywords[cat]) {
      for (const keyword of categoryKeywords[cat]) {
        if (query.includes(keyword)) {
          return 0.7;
        }
      }
    }
    
    return 0;
  }
  
  /**
   * 计算历史使用加成
   */
  private calculateHistoryBonus(toolName: string): number {
    if (this.executionHistory.length === 0) {
      return 0;
    }
    
    // 计算最近使用频率
    const recentUses = this.executionHistory
      .filter(record => record.toolName === toolName)
      .slice(0, 5); // 只看最近5次
    
    return Math.min(recentUses.length * 0.1, 0.3);
  }
  
  /**
   * 提取参数
   */
  private extractParameters(tool: MockTool, userQuery: string, params: Record<string, any>): void {
    const query = userQuery.toLowerCase();
    
    // 简单参数提取逻辑
    if (tool.name === 'read_file') {
      // 尝试提取文件路径
      const fileMatch = query.match(/(文件|路径|读取)[：:]\s*([^\s,，。.!?]+)/);
      if (fileMatch && fileMatch[2]) {
        params.path = fileMatch[2];
      } else if (query.includes('package.json')) {
        params.path = 'package.json';
      } else if (query.includes('readme')) {
        params.path = 'README.md';
      }
    }
    
    if (tool.name === 'write_file') {
      // 尝试提取文件路径和内容
      const pathMatch = query.match(/(文件|路径)[：:]\s*([^\s,，。.!?]+)/);
      if (pathMatch && pathMatch[2]) {
        params.path = pathMatch[2];
      }
      
      // 简单的内容提取
      const contentMatch = query.match(/内容[：:]\s*([^。.!?]+)/);
      if (contentMatch && contentMatch[1]) {
        params.content = contentMatch[1];
      }
    }
    
    if (tool.name === 'execute_command') {
      // 尝试提取命令
      const commandMatch = query.match(/(命令|运行|执行)[：:]\s*([^。.!?]+)/);
      if (commandMatch && commandMatch[2]) {
        params.command = commandMatch[2];
      } else if (query.includes('列出文件') || query.includes('ls')) {
        params.command = 'ls -la';
      } else if (query.includes('当前目录') || query.includes('pwd')) {
        params.command = 'pwd';
      }
    }
  }
  
  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简单的中英文关键词提取
    const words = text.split(/[\s,，。.!?；;：:]+/);
    return words
      .filter(word => word.length > 1) // 过滤单字符
      .filter(word => !this.isStopWord(word)); // 过滤停用词
  }
  
  /**
   * 检查是否是停用词
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      '的', '了', '在', '是', '我', '有', '和', '就', 
      '不', '人', '都', '一', '一个', '上', '也', '很', 
      '到', '说', '要', '去', '你', '会', '着', '没有',
      '看', '好', '自己', '这', '那', '为', '什么', '呢',
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 
      'at', 'to', 'for', 'of', 'with', 'by'
    ];
    
    return stopWords.includes(word.toLowerCase());
  }
  
  /**
   * 检查是否有共同关键词
   */
  private hasCommonKeywords(toolName: string, query: string): boolean {
    const toolWords = toolName.split(/[_\-]+/);
    const queryWords = this.extractKeywords(query);
    
    for (const toolWord of toolWords) {
      for (const queryWord of queryWords) {
        if (toolWord.toLowerCase() === queryWord.toLowerCase()) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * 记录工具执行历史
   */
  public recordToolExecution(toolName: string, params: Record<string, any>, result: any, success: boolean, executionTime: number): void {
    const record: ToolExecutionHistory = {
      toolName,
      timestamp: new Date(),
      params,
      result,
      success,
      executionTime
    };
    
    this.executionHistory.unshift(record); // 添加到开头
    
    // 保持历史记录大小
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(0, this.maxHistorySize);
    }
  }
  
  /**
   * 获取工具执行历史
   */
  public getExecutionHistory(): ToolExecutionHistory[] {
    return [...this.executionHistory];
  }
  
  /**
   * 清空执行历史
   */
  public clearHistory(): void {
    this.executionHistory = [];
  }
  
  /**
   * 生成工具链
   */
  public generateToolChain(userQuery: string, context?: any): ToolChainStep[] {
    // 简单实现：基于查询复杂度决定是否使用多个工具
    const tools = this.toolRegistry.getAllTools();
    const chain: ToolChainStep[] = [];
    
    if (userQuery.includes('分析') && userQuery.includes('修改')) {
      // 复杂任务：先分析再修改
      const analyzeTool = tools.find((t: MockTool) => t.name === 'analyze_code' || t.category === 'code');
      const writeTool = tools.find((t: MockTool) => t.name === 'write_file');
      
      if (analyzeTool) {
        chain.push({
          toolName: analyzeTool.name,
          params: { task: userQuery },
        });
      }
      
      if (writeTool) {
        chain.push({
          toolName: writeTool.name,
          params: { path: 'modified_file.ts', content: '// 修改后的代码' },
          dependsOn: analyzeTool ? [analyzeTool.name] : undefined
        });
      }
    }
    
    return chain;
  }
}

// ==================== 导出 ====================

export default EnhancedToolSelector;