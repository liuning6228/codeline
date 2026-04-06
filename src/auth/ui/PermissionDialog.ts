/**
 * 权限对话框管理器
 * 提供完整的用户确认流程，支持"总是允许"、"总是拒绝"等选项
 */

import * as vscode from 'vscode';

/**
 * 权限对话框选项
 */
export interface PermissionDialogOptions {
  /** 工具名称 */
  toolName: string;
  /** 工具ID */
  toolId: string;
  /** 命令或操作描述 */
  actionDescription: string;
  /** 风险等级 (0-10) */
  riskLevel?: number;
  /** 风险说明 */
  riskExplanation?: string;
  /** 是否支持记住选择 */
  allowRememberChoice?: boolean;
  /** 默认选择 */
  defaultChoice?: 'allow' | 'deny' | 'ask';
  /** 详细解释信息 */
  detail?: string;
  /** 显示学习建议 */
  showLearningSuggestions?: boolean;
  /** 上下文信息 */
  context?: Record<string, any>;
}

/**
 * 权限对话框结果
 */
export interface PermissionDialogResult {
  /** 用户选择 */
  choice: 'allow' | 'deny' | 'cancel';
  /** 是否记住选择 */
  rememberChoice?: boolean;
  /** 记住的规则类型 */
  ruleType?: 'exact' | 'pattern' | 'category';
  /** 规则模式（如果选择记住） */
  rulePattern?: string;
  /** 用户反馈 */
  feedback?: string;
}

/**
 * 学习建议
 */
export interface LearningSuggestion {
  /** 建议类型 */
  type: 'exact' | 'pattern' | 'category';
  /** 模式 */
  pattern: string;
  /** 描述 */
  description: string;
  /** 风险级别 */
  riskLevel: number;
}

/**
 * 权限对话框管理器
 */
export class PermissionDialog {
  private static instance: PermissionDialog;
  private outputChannel: vscode.OutputChannel;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('CodeLine Permissions');
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): PermissionDialog {
    if (!PermissionDialog.instance) {
      PermissionDialog.instance = new PermissionDialog();
    }
    return PermissionDialog.instance;
  }

  /**
   * 显示权限对话框
   */
  public async showPermissionDialog(
    options: PermissionDialogOptions
  ): Promise<PermissionDialogResult> {
    const {
      toolName,
      toolId,
      actionDescription,
      riskLevel = 5,
      riskExplanation,
      allowRememberChoice = true,
      defaultChoice = 'ask',
      detail,
      showLearningSuggestions = true,
      context = {}
    } = options;

    // 构建消息
    const mainMessage = this.buildMainMessage(toolName, actionDescription, riskLevel);
    const detailMessage = detail || this.buildDetailMessage(riskExplanation, riskLevel, context);
    
    // 构建选项
    const dialogOptions = this.buildDialogOptions(allowRememberChoice, showLearningSuggestions);
    
    // 显示对话框
    const result = await vscode.window.showInformationMessage(
      mainMessage,
      { modal: true, detail: detailMessage },
      ...dialogOptions
    );

    // 处理结果
    return this.handleDialogResult(result, options);
  }

  /**
   * 显示快速确认对话框（简化版）
   */
  public async showQuickConfirmation(
    message: string,
    detail?: string
  ): Promise<boolean> {
    const result = await vscode.window.showWarningMessage(
      message,
      { modal: true, detail },
      '允许',
      '拒绝'
    );
    
    return result === '允许';
  }

  /**
   * 显示规则学习对话框
   */
  public async showRuleLearningDialog(
    toolId: string,
    input: any,
    context: Record<string, any>,
    suggestions: LearningSuggestion[] = []
  ): Promise<PermissionDialogResult> {
    const actionDescription = this.extractActionDescription(input);
    const riskLevel = this.estimateRiskLevel(input, context);
    
    return this.showPermissionDialog({
      toolName: this.getToolDisplayName(toolId),
      toolId,
      actionDescription,
      riskLevel,
      allowRememberChoice: true,
      showLearningSuggestions: suggestions.length > 0,
      detail: this.buildLearningDetail(suggestions),
      context: { input, ...context }
    });
  }

  /**
   * 显示批量权限对话框
   */
  public async showBatchPermissionDialog(
    permissions: Array<{
      toolId: string;
      actionDescription: string;
      riskLevel: number;
    }>,
    options?: {
      title?: string;
      allowSelective?: boolean;
    }
  ): Promise<{
    allowAll: boolean;
    denyAll: boolean;
    selectiveResults?: Record<string, 'allow' | 'deny'>;
  }> {
    const title = options?.title || '批量权限请求';
    const allowSelective = options?.allowSelective ?? true;
    
    const message = `有 ${permissions.length} 个操作需要权限确认`;
    const detail = this.buildBatchDetail(permissions);
    
    const dialogOptions: string[] = ['允许所有', '拒绝所有'];
    if (allowSelective && permissions.length <= 10) {
      dialogOptions.push('选择性允许');
    }
    
    const result = await vscode.window.showWarningMessage(
      message,
      { modal: true, detail },
      ...dialogOptions
    );
    
    if (result === '允许所有') {
      return { allowAll: true, denyAll: false };
    } else if (result === '拒绝所有') {
      return { allowAll: false, denyAll: true };
    } else if (result === '选择性允许') {
      const selectiveResults = await this.showSelectivePermissionsDialog(permissions);
      return { 
        allowAll: false, 
        denyAll: false, 
        selectiveResults 
      };
    } else {
      // 用户取消
      return { allowAll: false, denyAll: false };
    }
  }

  /**
   * 记录权限决策日志
   */
  public logPermissionDecision(
    toolId: string,
    input: any,
    result: PermissionDialogResult,
    context: Record<string, any>
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      toolId,
      input,
      result,
      context,
      workspaceRoot: context.workspaceRoot,
      userId: context.userId
    };
    
    this.outputChannel.appendLine(JSON.stringify(logEntry, null, 2));
    
    // 同时输出到控制台（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('权限决策:', logEntry);
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 构建主消息
   */
  private buildMainMessage(toolName: string, actionDescription: string, riskLevel: number): string {
    const riskIndicator = this.getRiskIndicator(riskLevel);
    return `${riskIndicator} ${toolName}: ${actionDescription}`;
  }

  /**
   * 构建详细消息
   */
  private buildDetailMessage(
    riskExplanation: string | undefined,
    riskLevel: number,
    context: Record<string, any>
  ): string {
    const lines: string[] = [];
    
    if (riskExplanation) {
      lines.push(`风险说明: ${riskExplanation}`);
    }
    
    lines.push(`风险等级: ${riskLevel}/10 (${this.getRiskDescription(riskLevel)})`);
    
    if (context.workspaceRoot) {
      lines.push(`工作目录: ${context.workspaceRoot}`);
    }
    
    if (context.userId) {
      lines.push(`用户: ${context.userId}`);
    }
    
    return lines.join('\n');
  }

  /**
   * 构建学习详情
   */
  private buildLearningDetail(suggestions: LearningSuggestion[]): string {
    if (suggestions.length === 0) {
      return '没有可用的学习建议。';
    }
    
    const lines: string[] = ['学习建议:'];
    
    for (const suggestion of suggestions) {
      lines.push(`  • ${suggestion.description} (风险: ${suggestion.riskLevel}/10)`);
    }
    
    lines.push('');
    lines.push('选择"总是允许"或"总是拒绝"来创建相应的权限规则。');
    
    return lines.join('\n');
  }

  /**
   * 构建批量详情
   */
  private buildBatchDetail(permissions: Array<{
    toolId: string;
    actionDescription: string;
    riskLevel: number;
  }>): string {
    const lines: string[] = ['待确认的操作:'];
    
    for (let i = 0; i < permissions.length; i++) {
      const perm = permissions[i];
      const riskIndicator = this.getRiskIndicator(perm.riskLevel);
      lines.push(`  ${i + 1}. ${riskIndicator} ${perm.actionDescription}`);
    }
    
    return lines.join('\n');
  }

  /**
   * 构建对话框选项
   */
  private buildDialogOptions(
    allowRememberChoice: boolean,
    showLearningSuggestions: boolean
  ): string[] {
    const options: string[] = [];
    
    if (showLearningSuggestions && allowRememberChoice) {
      options.push('总是允许');
      options.push('总是拒绝');
    }
    
    options.push('允许此次');
    options.push('拒绝此次');
    
    if (allowRememberChoice) {
      options.push('创建自定义规则...');
    }
    
    options.push('取消');
    
    return options;
  }

  /**
   * 处理对话框结果
   */
  private handleDialogResult(
    result: string | undefined,
    options: PermissionDialogOptions
  ): PermissionDialogResult {
    if (!result || result === '取消') {
      return { choice: 'cancel' };
    }
    
    switch (result) {
      case '总是允许':
        return {
          choice: 'allow',
          rememberChoice: true,
          ruleType: 'exact',
          rulePattern: this.generateRulePattern(options),
          feedback: '用户选择总是允许此操作'
        };
        
      case '总是拒绝':
        return {
          choice: 'deny',
          rememberChoice: true,
          ruleType: 'exact',
          rulePattern: this.generateRulePattern(options),
          feedback: '用户选择总是拒绝此操作'
        };
        
      case '允许此次':
        return {
          choice: 'allow',
          rememberChoice: false,
          feedback: '用户允许此次操作'
        };
        
      case '拒绝此次':
        return {
          choice: 'deny',
          rememberChoice: false,
          feedback: '用户拒绝此次操作'
        };
        
      case '创建自定义规则...':
        // 这里应该打开更复杂的规则编辑器
        // 简化处理：返回取消
        return { choice: 'cancel' };
        
      default:
        return { choice: 'cancel' };
    }
  }

  /**
   * 显示选择性权限对话框
   */
  private async showSelectivePermissionsDialog(
    permissions: Array<{
      toolId: string;
      actionDescription: string;
      riskLevel: number;
    }>
  ): Promise<Record<string, 'allow' | 'deny'>> {
    const results: Record<string, 'allow' | 'deny'> = {};
    
    for (let i = 0; i < permissions.length; i++) {
      const perm = permissions[i];
      const key = `${perm.toolId}-${i}`;
      
      const message = `操作 ${i + 1}/${permissions.length}: ${perm.actionDescription}`;
      const detail = `风险等级: ${perm.riskLevel}/10`;
      
      const result = await vscode.window.showWarningMessage(
        message,
        { modal: false, detail },
        '允许',
        '拒绝',
        '跳过'
      );
      
      if (result === '允许') {
        results[key] = 'allow';
      } else if (result === '拒绝') {
        results[key] = 'deny';
      }
      // 跳过则不作处理
    }
    
    return results;
  }

  /**
   * 生成规则模式
   */
  private generateRulePattern(options: PermissionDialogOptions): string {
    // 简化实现：使用工具ID + 动作哈希
    const pattern = `${options.toolId}:${this.hashString(options.actionDescription)}`;
    return pattern;
  }

  /**
   * 字符串哈希
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 获取风险指示器
   */
  private getRiskIndicator(riskLevel: number): string {
    if (riskLevel >= 8) return '⚠️⚠️ 高风险';
    if (riskLevel >= 5) return '⚠️ 中风险';
    if (riskLevel >= 3) return '🔶 低风险';
    return '✅ 安全';
  }

  /**
   * 获取风险描述
   */
  private getRiskDescription(riskLevel: number): string {
    if (riskLevel >= 8) return '高风险 - 可能对系统造成严重破坏';
    if (riskLevel >= 5) return '中风险 - 可能修改重要文件或配置';
    if (riskLevel >= 3) return '低风险 - 只读或安全的写操作';
    return '安全 - 只读操作';
  }

  /**
   * 提取动作描述
   */
  private extractActionDescription(input: any): string {
    if (typeof input === 'string') {
      return input;
    }
    
    if (input && typeof input === 'object') {
      if (input.command) {
        return `执行命令: ${input.command}`;
      }
      if (input.operation) {
        return `执行操作: ${input.operation}`;
      }
      return JSON.stringify(input);
    }
    
    return String(input);
  }

  /**
   * 估算风险等级
   */
  private estimateRiskLevel(input: any, context: Record<string, any>): number {
    // 简化实现
    if (typeof input === 'string') {
      if (input.includes('rm ') || input.includes('delete ')) return 7;
      if (input.includes('chmod ') || input.includes('chown ')) return 6;
      if (input.includes('curl ') || input.includes('wget ')) return 5;
      return 3;
    }
    
    return 5; // 默认中等风险
  }

  /**
   * 获取工具显示名称
   */
  private getToolDisplayName(toolId: string): string {
    const toolNames: Record<string, string> = {
      'bash': 'Bash 命令',
      'enhanced-bash': '增强Bash',
      'file': '文件操作',
      'git': 'Git 操作',
      'search': '代码搜索',
      'edit': '代码编辑'
    };
    
    return toolNames[toolId] || toolId;
  }
}

/**
 * 创建权限对话框实例
 */
export function createPermissionDialog(): PermissionDialog {
  return PermissionDialog.getInstance();
}