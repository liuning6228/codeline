/**
 * 权限对话框管理器
 * 提供完整的用户确认流程，支持"总是允许"、"总是拒绝"等选项
 */
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
export declare class PermissionDialog {
    private static instance;
    private outputChannel;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): PermissionDialog;
    /**
     * 显示权限对话框
     */
    showPermissionDialog(options: PermissionDialogOptions): Promise<PermissionDialogResult>;
    /**
     * 显示快速确认对话框（简化版）
     */
    showQuickConfirmation(message: string, detail?: string): Promise<boolean>;
    /**
     * 显示规则学习对话框
     */
    showRuleLearningDialog(toolId: string, input: any, context: Record<string, any>, suggestions?: LearningSuggestion[]): Promise<PermissionDialogResult>;
    /**
     * 显示批量权限对话框
     */
    showBatchPermissionDialog(permissions: Array<{
        toolId: string;
        actionDescription: string;
        riskLevel: number;
    }>, options?: {
        title?: string;
        allowSelective?: boolean;
    }): Promise<{
        allowAll: boolean;
        denyAll: boolean;
        selectiveResults?: Record<string, 'allow' | 'deny'>;
    }>;
    /**
     * 记录权限决策日志
     */
    logPermissionDecision(toolId: string, input: any, result: PermissionDialogResult, context: Record<string, any>): void;
    /**
     * 构建主消息
     */
    private buildMainMessage;
    /**
     * 构建详细消息
     */
    private buildDetailMessage;
    /**
     * 构建学习详情
     */
    private buildLearningDetail;
    /**
     * 构建批量详情
     */
    private buildBatchDetail;
    /**
     * 构建对话框选项
     */
    private buildDialogOptions;
    /**
     * 处理对话框结果
     */
    private handleDialogResult;
    /**
     * 显示选择性权限对话框
     */
    private showSelectivePermissionsDialog;
    /**
     * 生成规则模式
     */
    private generateRulePattern;
    /**
     * 字符串哈希
     */
    private hashString;
    /**
     * 获取风险指示器
     */
    private getRiskIndicator;
    /**
     * 获取风险描述
     */
    private getRiskDescription;
    /**
     * 提取动作描述
     */
    private extractActionDescription;
    /**
     * 估算风险等级
     */
    private estimateRiskLevel;
    /**
     * 获取工具显示名称
     */
    private getToolDisplayName;
}
/**
 * 创建权限对话框实例
 */
export declare function createPermissionDialog(): PermissionDialog;
//# sourceMappingURL=PermissionDialog.d.ts.map