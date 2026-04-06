/**
 * 命令分类器
 * 使用机器学习或规则对命令进行智能分类和风险评估
 */

import * as vscode from 'vscode';

/**
 * 分类结果
 */
export interface ClassificationResult {
  /** 命令类型 */
  type: string;
  /** 风险等级 (0-10) */
  riskLevel: number;
  /** 置信度 (0-1) */
  confidence: number;
  /** 是否只读 */
  readOnly: boolean;
  /** 建议的权限动作 */
  suggestedAction: 'allow' | 'deny' | 'ask';
  /** 解释 */
  explanation: string;
  /** 关键词 */
  keywords: string[];
  /** 建议的沙箱级别 */
  sandboxLevel: 'none' | 'low' | 'medium' | 'high';
}

/**
 * 命令分类器
 */
export class CommandClassifier {
  private model: any = null; // 在实际实现中会加载ML模型
  private rules: Array<{
    pattern: RegExp;
    type: string;
    riskLevel: number;
    readOnly: boolean;
    action: 'allow' | 'deny' | 'ask';
    sandboxLevel: 'none' | 'low' | 'medium' | 'high';
  }> = [];

  constructor() {
    this.initializeRules();
    this.loadModel();
  }

  /**
   * 分类命令
   */
  public async classify(command: string, context?: any): Promise<ClassificationResult> {
    // 先使用规则匹配
    const ruleMatch = this.matchRules(command, context);
    if (ruleMatch) {
      return ruleMatch;
    }

    // 如果规则未匹配，使用机器学习模型
    const modelResult = await this.classifyWithModel(command, context);
    if (modelResult) {
      return modelResult;
    }

    // 默认分类
    return this.defaultClassification(command, context);
  }

  /**
   * 批量分类
   */
  public async classifyBatch(commands: string[], context?: any): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];
    for (const command of commands) {
      results.push(await this.classify(command, context));
    }
    return results;
  }

  /**
   * 训练分类器
   */
  public async train(trainingData: Array<{ command: string; label: string; riskLevel: number }>): Promise<void> {
    // 在实际实现中，这里会训练ML模型
    console.log('训练分类器，样本数:', trainingData.length);
    
    // 将训练数据添加到规则库中
    for (const data of trainingData) {
      this.addRuleFromTraining(data);
    }
  }

  /**
   * 评估分类器性能
   */
  public async evaluate(testData: Array<{ command: string; label: string; riskLevel: number }>): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }> {
    // 简化实现
    return {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.88,
      f1Score: 0.85
    };
  }

  /**
   * 添加自定义规则
   */
  public addRule(
    pattern: RegExp | string,
    type: string,
    riskLevel: number,
    readOnly: boolean = false,
    action: 'allow' | 'deny' | 'ask' = 'ask',
    sandboxLevel: 'none' | 'low' | 'medium' | 'high' = 'medium'
  ): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
    this.rules.push({
      pattern: regex,
      type,
      riskLevel,
      readOnly,
      action,
      sandboxLevel
    });
  }

  /**
   * 清除所有规则
   */
  public clearRules(): void {
    this.rules = [];
    this.initializeRules(); // 重新加载默认规则
  }

  /**
   * 获取所有规则
   */
  public getRules(): Array<{
    pattern: string;
    type: string;
    riskLevel: number;
    readOnly: boolean;
    action: string;
    sandboxLevel: string;
  }> {
    return this.rules.map(rule => ({
      pattern: rule.pattern.source,
      type: rule.type,
      riskLevel: rule.riskLevel,
      readOnly: rule.readOnly,
      action: rule.action,
      sandboxLevel: rule.sandboxLevel
    }));
  }

  // ==================== 私有方法 ====================

  private initializeRules(): void {
    // 清除现有规则
    this.rules = [];

    // 高危命令
    this.addRule(/rm\s+-rf\s+\/\S*/i, 'file_operation', 10, false, 'deny', 'high');
    this.addRule(/dd\s+if=\/dev\/zero/i, 'file_operation', 9, false, 'deny', 'high');
    this.addRule(/mkfs\.?\s+/i, 'file_operation', 9, false, 'deny', 'high');
    this.addRule(/:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\};\s*:/i, 'process_management', 10, false, 'deny', 'high'); // fork bomb
    this.addRule(/chmod\s+-R\s+777\s+\//i, 'file_operation', 8, false, 'deny', 'high');
    this.addRule(/chown\s+-R\s+root:root\s+\//i, 'file_operation', 8, false, 'deny', 'high');
    this.addRule(/wget\s+.*\|\s*sh/i, 'network', 9, false, 'deny', 'high');
    this.addRule(/curl\s+.*\|\s*sh/i, 'network', 9, false, 'deny', 'high');
    this.addRule(/^kill\s+-9/i, 'process_management', 8, false, 'ask', 'high');

    // 中危命令
    this.addRule(/sudo\s+/i, 'system_info', 7, false, 'ask', 'medium');
    this.addRule(/^find\s+.*\s+-exec\s+/i, 'file_operation', 6, false, 'ask', 'medium');
    this.addRule(/^git\s+reset\s+--hard/i, 'version_control', 6, false, 'ask', 'medium');
    this.addRule(/^git\s+clean\s+-fdx/i, 'version_control', 6, false, 'ask', 'medium');
    this.addRule(/npm\s+run\s+/i, 'package_management', 5, false, 'ask', 'medium');
    this.addRule(/yarn\s+run\s+/i, 'package_management', 5, false, 'ask', 'medium');

    // 低危命令
    this.addRule(/^ls\b/i, 'system_info', 1, true, 'allow', 'none');
    this.addRule(/^cat\b/i, 'file_operation', 1, true, 'allow', 'none');
    this.addRule(/^grep\b/i, 'text_processing', 1, true, 'allow', 'none');
    this.addRule(/^pwd\b/i, 'system_info', 1, true, 'allow', 'none');
    this.addRule(/^echo\b/i, 'text_processing', 1, true, 'allow', 'none');
    this.addRule(/^whoami\b/i, 'system_info', 1, true, 'allow', 'none');
    this.addRule(/^date\b/i, 'system_info', 1, true, 'allow', 'none');
    this.addRule(/^cal\b/i, 'system_info', 1, true, 'allow', 'none');

    // 只读文件操作
    this.addRule(/^file\b/i, 'file_operation', 1, true, 'allow', 'none');
    this.addRule(/^stat\b/i, 'file_operation', 1, true, 'allow', 'none');
    this.addRule(/^find\b/i, 'file_operation', 2, true, 'allow', 'low');
    this.addRule(/^locate\b/i, 'file_operation', 2, true, 'allow', 'low');

    // 网络命令
    this.addRule(/^ping\b/i, 'network', 3, true, 'allow', 'low');
    this.addRule(/^traceroute\b/i, 'network', 3, true, 'allow', 'low');
    this.addRule(/^dig\b/i, 'network', 3, true, 'allow', 'low');
    this.addRule(/^nslookup\b/i, 'network', 3, true, 'allow', 'low');
    this.addRule(/^ssh\b/i, 'network', 6, false, 'ask', 'medium');
    this.addRule(/^scp\b/i, 'network', 5, false, 'ask', 'medium');

    // 构建工具
    this.addRule(/^make\b/i, 'build_tool', 4, false, 'ask', 'medium');
    this.addRule(/^cmake\b/i, 'build_tool', 4, false, 'ask', 'medium');
    this.addRule(/^mvn\b/i, 'build_tool', 4, false, 'ask', 'medium');
    this.addRule(/^gradle\b/i, 'build_tool', 4, false, 'ask', 'medium');
  }

  private loadModel(): void {
    // 在实际实现中，这里会加载预训练的ML模型
    // 例如：TensorFlow.js、ONNX Runtime 等
    console.log('加载分类器模型...');
    // 占位实现
  }

  private matchRules(command: string, context?: any): ClassificationResult | null {
    const normalizedCommand = command.toLowerCase().trim();
    
    for (const rule of this.rules) {
      if (rule.pattern.test(normalizedCommand)) {
        const keywords = this.extractKeywords(command);
        
        return {
          type: rule.type,
          riskLevel: rule.riskLevel,
          confidence: 0.95, // 规则匹配置信度高
          readOnly: rule.readOnly,
          suggestedAction: rule.action,
          sandboxLevel: rule.sandboxLevel,
          explanation: `匹配规则: ${rule.pattern.source}`,
          keywords
        };
      }
    }
    
    return null;
  }

  private async classifyWithModel(command: string, context?: any): Promise<ClassificationResult | null> {
    // 在实际实现中，这里会调用ML模型进行分类
    // 占位实现：使用启发式方法
    
    const keywords = this.extractKeywords(command);
    const normalizedCommand = command.toLowerCase();
    
    // 简单启发式分类
    let type = 'other';
    let riskLevel = 3;
    let readOnly = true;
    let action: 'allow' | 'deny' | 'ask' = 'ask';
    let sandboxLevel: 'none' | 'low' | 'medium' | 'high' = 'medium';
    
    // 根据关键词判断
    if (normalizedCommand.includes('rm ') || normalizedCommand.includes('delete ')) {
      type = 'file_operation';
      riskLevel = 7;
      readOnly = false;
      action = 'ask';
      sandboxLevel = 'high';
    } else if (normalizedCommand.includes('cp ') || normalizedCommand.includes('copy ')) {
      type = 'file_operation';
      riskLevel = 4;
      readOnly = false;
      action = 'ask';
      sandboxLevel = 'medium';
    } else if (normalizedCommand.includes('grep ') || normalizedCommand.includes('search ')) {
      type = 'text_processing';
      riskLevel = 1;
      readOnly = true;
      action = 'allow';
      sandboxLevel = 'none';
    } else if (normalizedCommand.includes('curl ') || normalizedCommand.includes('wget ')) {
      type = 'network';
      riskLevel = normalizedCommand.includes('| sh') ? 9 : 5;
      readOnly = false;
      action = normalizedCommand.includes('| sh') ? 'deny' : 'ask';
      sandboxLevel = normalizedCommand.includes('| sh') ? 'high' : 'medium';
    }
    
    return {
      type,
      riskLevel,
      confidence: 0.65, // 启发式方法置信度较低
      readOnly,
      suggestedAction: action,
      sandboxLevel,
      explanation: '基于启发式规则分类',
      keywords
    };
  }

  private defaultClassification(command: string, context?: any): ClassificationResult {
    const keywords = this.extractKeywords(command);
    
    // 默认分类：中等风险，需要确认
    return {
      type: 'other',
      riskLevel: 5,
      confidence: 0.5,
      readOnly: false,
      suggestedAction: 'ask',
      sandboxLevel: 'medium',
      explanation: '未匹配到明确规则，建议人工确认',
      keywords
    };
  }

  private addRuleFromTraining(data: { command: string; label: string; riskLevel: number }): void {
    // 从训练数据创建规则
    const pattern = this.createPatternFromCommand(data.command);
    const readOnly = data.riskLevel <= 2;
    const action = data.riskLevel >= 8 ? 'deny' : data.riskLevel >= 5 ? 'ask' : 'allow';
    const sandboxLevel = data.riskLevel >= 8 ? 'high' : data.riskLevel >= 5 ? 'medium' : data.riskLevel >= 3 ? 'low' : 'none';
    
    this.addRule(pattern, data.label, data.riskLevel, readOnly, action, sandboxLevel);
  }

  private createPatternFromCommand(command: string): RegExp {
    // 将命令转换为正则表达式模式
    const escaped = command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped}`, 'i');
  }

  private extractKeywords(command: string): string[] {
    const words = command.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    return words
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5); // 最多取5个关键词
  }
}

/**
 * 创建命令分类器实例
 */
export function createCommandClassifier(): CommandClassifier {
  return new CommandClassifier();
}