/**
 * 权限管理器
 * 协调权限检查、用户确认和规则学习
 */
import { PermissionRule } from './permissions/RuleManager';
import { PermissionResult } from '../tools/ToolInterface';
/**
 * 自动批准设置（与前端保持一致）
 */
export interface AutoApprovalSettings {
    version: number;
    enabled: boolean;
    favorites: string[];
    maxRequests: number;
    actions: {
        readFiles: boolean;
        readFilesExternally?: boolean;
        editFiles: boolean;
        editFilesExternally?: boolean;
        executeSafeCommands?: boolean;
        executeAllCommands?: boolean;
        useBrowser: boolean;
        useMcp: boolean;
    };
    enableNotifications: boolean;
}
/**
 * 权限管理器配置
 */
export interface PermissionManagerConfig {
    /** 默认权限模式 */
    defaultMode: 'auto' | 'always' | 'ask' | 'deny' | 'sandbox';
    /** 是否启用AI分类器 */
    enableClassifier: boolean;
    /** 是否启用规则学习 */
    enableRuleLearning: boolean;
    /** 是否记录权限决策 */
    enableLogging: boolean;
    /** 默认风险阈值 */
    riskThreshold: number;
    /** 自动拒绝高风险操作 */
    autoDenyHighRisk: boolean;
}
/**
 * 权限检查请求
 */
export interface PermissionCheckRequest {
    /** 工具ID */
    toolId: string;
    /** 工具类别 */
    toolCategory: string;
    /** 工具输入 */
    input: any;
    /** 执行上下文 */
    context: Record<string, any>;
    /** 工作目录 */
    workspaceRoot?: string;
    /** 用户ID */
    userId?: string;
}
/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
    /** 是否允许 */
    allowed: boolean;
    /** 需要用户确认 */
    requiresUserConfirmation: boolean;
    /** 确认提示 */
    confirmationPrompt?: string;
    /** 风险等级 */
    riskLevel?: number;
    /** 匹配的规则 */
    matchedRule?: PermissionRule;
    /** 规则学习建议 */
    learningSuggestions?: Array<{
        type: 'exact' | 'pattern' | 'category';
        pattern: string;
        description: string;
        riskLevel: number;
    }>;
    /** 自动模式下的决策原因 */
    autoDecisionReason?: string;
}
/**
 * 权限管理器
 */
export declare class PermissionManager {
    private static instance;
    private config;
    private dialog;
    private classifier;
    private ruleManager;
    private isInitialized;
    private autoApprovalSettings;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(config?: Partial<PermissionManagerConfig>): PermissionManager;
    /**
     * 初始化权限管理器
     */
    initialize(): Promise<boolean>;
    /**
     * 设置自动批准设置
     */
    setAutoApprovalSettings(settings: AutoApprovalSettings | null): void;
    /**
     * 检查权限（适配 ToolInterface.PermissionResult）
     * 也满足 BaseTool.PermissionManagerInterface
     */
    checkToolPermission(request: {
        toolId: string;
        toolCategory: any;
        input: any;
        context: any;
        workspaceRoot?: string;
        userId?: string;
    }): Promise<PermissionResult>;
    /**
     * 检查权限（满足 BaseTool.PermissionManagerInterface）
     */
    checkPermission(request: {
        toolId: string;
        toolCategory: any;
        input: any;
        context: any;
        workspaceRoot?: string;
        userId?: string;
    }): Promise<PermissionResult>;
    /**
     * 内部实现
     */
    private checkPermissionForTool;
    /**
     * 检查权限（返回详细结果）
     */
    checkPermissionWithDetails(request: PermissionCheckRequest): Promise<PermissionCheckResult>;
    /**
     * 快速确认对话框
     */
    showQuickConfirmation(message: string, detail?: string): Promise<boolean>;
    /**
     * 请求用户确认
     */
    requestUserConfirmation(request: PermissionCheckRequest, result: PermissionCheckResult): Promise<{
        confirmed: boolean;
        rememberChoice?: boolean;
        ruleCreated?: PermissionRule;
    }>;
    /**
     * 批量检查权限
     */
    checkPermissionsBatch(requests: PermissionCheckRequest[]): Promise<PermissionCheckResult[]>;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<PermissionManagerConfig>): void;
    /**
     * 获取配置
     */
    getConfig(): PermissionManagerConfig;
    /**
     * 重置为默认配置
     */
    resetConfig(): void;
    /**
     * 导出规则
     */
    exportRules(): PermissionRule[];
    /**
     * 导入规则
     */
    importRules(rules: PermissionRule[]): void;
    /**
     * 清除所有规则
     */
    clearRules(): void;
    /**
     * 初始化组件
     */
    private initializeComponents;
    /**
     * 检查规则匹配
     */
    private checkRules;
    /**
     * 处理规则匹配
     */
    private handleRuleMatch;
    /**
     * 自动决策
     */
    private autoDecision;
    /**
     * 生成确认提示
     */
    private generateConfirmationPrompt;
    /**
     * 生成学习建议
     */
    private generateLearningSuggestions;
    /**
     * 处理批量确认
     */
    private handleBatchConfirmation;
    /**
     * 从决策创建规则
     */
    private createRuleFromDecision;
    /**
     * 学习用户决策
     */
    private learnFromUserDecision;
    /**
     * 获取权限模式
     */
    private getPermissionMode;
    /**
     * 提取命令
     */
    private extractCommand;
    /**
     * 估算风险等级
     */
    private estimateRiskLevel;
    /**
     * 提取动作描述
     */
    private extractActionDescription;
    /**
     * 获取风险解释
     */
    private getRiskExplanation;
    /**
     * 生成对话框详情
     */
    private generateDialogDetail;
    /**
     * 生成精确模式
     */
    private generateExactPattern;
    /**
     * 生成模式建议
     */
    private generatePatternSuggestion;
    /**
     * 提取条件
     */
    private extractConditions;
    /**
     * 获取工具显示名称
     */
    private getToolDisplayName;
    /**
     * 检查自动批准设置
     */
    private checkAutoApproval;
    /**
     * 映射工具到自动批准操作类型
     */
    private mapToolToAutoApproveAction;
    /**
     * 获取操作显示名称
     */
    private getActionDisplayName;
    /**
     * 检查是否为外部文件操作
     */
    private isExternalFileOperation;
    /**
     * 检查是否为安全命令
     */
    private isSafeCommand;
    /**
     * 字符串哈希
     */
    private hashString;
}
/**
 * 创建权限管理器实例
 */
export declare function createPermissionManager(config?: Partial<PermissionManagerConfig>): PermissionManager;
//# sourceMappingURL=PermissionManager.d.ts.map