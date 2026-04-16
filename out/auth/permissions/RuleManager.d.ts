/**
 * 权限规则管理器
 * 管理权限规则的定义、匹配和应用
 */
/**
 * 规则匹配条件
 */
export interface RuleCondition {
    /** 条件类型 */
    type: 'context' | 'input' | 'user' | 'environment';
    /** 条件键 */
    key: string;
    /** 条件值 */
    value: any;
    /** 操作符 */
    operator: 'equals' | 'contains' | 'matches' | 'in' | 'greaterThan' | 'lessThan';
}
/**
 * 权限规则
 */
export interface PermissionRule {
    /** 规则ID */
    id: string;
    /** 工具ID（* 表示所有工具） */
    toolId: string;
    /** 匹配模式 */
    pattern: string;
    /** 动作：allow, deny, ask */
    action: 'allow' | 'deny' | 'ask';
    /** 匹配条件 */
    conditions: RuleCondition[];
    /** 优先级（数字越大优先级越高） */
    priority: number;
    /** 规则描述 */
    description?: string;
    /** 创建时间 */
    createdAt: Date;
    /** 更新时间 */
    updatedAt: Date;
}
/**
 * 规则匹配结果
 */
export interface RuleMatchResult {
    /** 是否匹配 */
    matched: boolean;
    /** 匹配的规则 */
    rule?: PermissionRule;
    /** 建议的动作 */
    action?: 'allow' | 'deny' | 'ask';
    /** 匹配的条件 */
    matchedConditions: RuleCondition[];
    /** 未匹配的条件 */
    unmatchedConditions: RuleCondition[];
}
/**
 * 权限规则管理器
 */
export declare class RuleManager {
    private rules;
    private ruleFile;
    constructor(ruleFile?: string);
    /**
     * 添加或更新规则
     */
    upsertRule(rule: PermissionRule): void;
    /**
     * 删除规则
     */
    deleteRule(ruleId: string): boolean;
    /**
     * 获取所有规则
     */
    getAllRules(): PermissionRule[];
    /**
     * 获取工具相关规则
     */
    getRulesForTool(toolId: string): PermissionRule[];
    /**
     * 匹配规则
     */
    matchRules(toolId: string, input: any, context: Record<string, any>): RuleMatchResult[];
    /**
     * 获取最佳匹配规则
     */
    getBestMatch(toolId: string, input: any, context: Record<string, any>): RuleMatchResult | null;
    /**
     * 检查权限
     */
    checkPermission(toolId: string, input: any, context: Record<string, any>): {
        allowed: boolean;
        requiresConfirmation: boolean;
        matchedRule?: PermissionRule;
        reason?: string;
    };
    /**
     * 学习用户决策
     */
    learnFromDecision(toolId: string, input: any, context: Record<string, any>, userDecision: 'allow' | 'deny', remember?: boolean): void;
    /**
     * 导入规则
     */
    importRules(rules: PermissionRule[]): void;
    /**
     * 导出规则
     */
    exportRules(): PermissionRule[];
    /**
     * 重置为默认规则
     */
    resetToDefaults(): void;
    private loadDefaultRules;
    private matchRule;
    private evaluateCondition;
    private isReadOnlyOperation;
    private findSimilarRule;
    private extractPattern;
    private extractConditions;
    private saveRules;
    private loadRules;
}
/**
 * 创建规则管理器实例
 */
export declare function createRuleManager(ruleFile?: string): RuleManager;
//# sourceMappingURL=RuleManager.d.ts.map