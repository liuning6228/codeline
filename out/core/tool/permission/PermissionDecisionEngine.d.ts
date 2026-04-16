/**
 * 权限决策引擎
 * 实现Claude Code三层权限架构的决策逻辑
 */
import { EnhancedPermissionLevel, PermissionDecision, PermissionEvaluationContext } from './PermissionTypes';
/**
 * 冲突解决策略
 */
export declare enum ConflictResolutionStrategy {
    /** 最高优先级优先 */
    HIGHEST_PRIORITY = "highest_priority",
    /** 最严格优先（deny > ask > allow） */
    MOST_RESTRICTIVE = "most_restrictive",
    /** 最宽松优先（allow > ask > deny） */
    MOST_PERMISSIVE = "most_permissive",
    /** 按来源优先级（system > user > session） */
    BY_SOURCE = "by_source",
    /** 最近创建的优先 */
    MOST_RECENT = "most_recent"
}
/**
 * 权限决策引擎配置
 */
export interface PermissionDecisionEngineConfig {
    /** 冲突解决策略 */
    conflictResolutionStrategy?: ConflictResolutionStrategy;
    /** 是否启用缓存 */
    enableCaching?: boolean;
    /** 缓存时间（毫秒） */
    cacheTTL?: number;
    /** 是否记录详细日志 */
    logDetailedEvaluation?: boolean;
    /** 默认权限级别（当没有规则匹配时） */
    defaultPermissionLevel?: EnhancedPermissionLevel;
    /** 是否允许自动批准 */
    allowAutoApprove?: boolean;
    /** 自动批准的最小置信度分数 */
    autoApproveMinScore?: number;
}
/**
 * 权限决策引擎
 */
export declare class PermissionDecisionEngine {
    private config;
    private cache;
    constructor(config?: PermissionDecisionEngineConfig);
    /**
     * 评估权限请求
     */
    evaluate(context: PermissionEvaluationContext): PermissionDecision;
    /**
     * 收集所有相关规则
     */
    private collectRules;
    /**
     * 添加遗留规则（向后兼容）
     */
    private addLegacyRules;
    /**
     * 映射遗留来源到新来源
     */
    private mapLegacySource;
    /**
     * 获取来源的默认优先级
     */
    private getDefaultPriorityForSource;
    /**
     * 评估规则匹配
     */
    private evaluateRules;
    /**
     * 评估单个规则
     */
    private evaluateRule;
    /**
     * 检查工具ID匹配
     */
    private matchesToolId;
    /**
     * 检查条件匹配
     */
    private matchesCondition;
    /**
     * 检查模式匹配
     */
    private matchesPattern;
    /**
     * 计算规则分数
     */
    private calculateRuleScore;
    /**
     * 解决规则冲突
     */
    private resolveConflicts;
    /**
     * 获取动作限制性分数
     */
    private getActionRestrictiveness;
    /**
     * 生成决策
     */
    private generateDecision;
    /**
     * 生成缓存键
     */
    private generateCacheKey;
    /**
     * 记录决策历史
     */
    private recordDecision;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 获取缓存统计
     */
    getCacheStats(): {
        size: number;
        hitRate: number;
    };
    /**
     * 更新配置
     */
    updateConfig(config: Partial<PermissionDecisionEngineConfig>): void;
}
//# sourceMappingURL=PermissionDecisionEngine.d.ts.map