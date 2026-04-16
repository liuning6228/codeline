/**
 * 权限系统集成
 * 连接EnhancedBaseTool与新权限系统
 */
import { PermissionDecisionEngine, ConflictResolutionStrategy } from './PermissionDecisionEngine';
import { PermissionManager } from './PermissionManager';
import { EnhancedPermissionRule, PermissionDecision } from './PermissionTypes';
import { ToolUseContext, PermissionResult as BasePermissionResult } from '../Tool';
/**
 * 权限系统集成配置
 */
export interface PermissionIntegrationConfig {
    /** 是否启用增强权限系统 */
    enabled: boolean;
    /** 决策引擎配置 */
    decisionEngineConfig?: any;
    /** 权限管理器配置 */
    permissionManagerConfig?: any;
    /** 是否自动加载规则 */
    autoLoadRules?: boolean;
    /** 默认冲突解决策略 */
    defaultConflictStrategy?: ConflictResolutionStrategy;
}
/**
 * 权限系统集成器
 */
export declare class PermissionIntegration {
    private decisionEngine;
    private permissionManager;
    private config;
    private isInitialized;
    constructor(config?: PermissionIntegrationConfig);
    /**
     * 初始化权限系统
     */
    initialize(): Promise<boolean>;
    /**
     * 检查工具权限
     */
    checkToolPermission(toolId: string, toolName: string, input: any, toolUseContext: ToolUseContext): Promise<PermissionDecision>;
    /**
     * 转换权限决策为基本权限结果（向后兼容）
     */
    convertToBasePermissionResult(decision: PermissionDecision): BasePermissionResult;
    /**
     * 转换权限级别
     */
    private convertPermissionLevel;
    /**
     * 创建评估上下文
     */
    private createEvaluationContext;
    /**
     * 转换为增强权限上下文
     */
    private convertToEnhancedPermissionContext;
    /**
     * 创建默认允许决策
     */
    private createDefaultAllowDecision;
    /**
     * 获取决策引擎
     */
    getDecisionEngine(): PermissionDecisionEngine;
    /**
     * 获取权限管理器
     */
    getPermissionManager(): PermissionManager;
    /**
     * 添加系统规则
     */
    addSystemRule(rule: Omit<EnhancedPermissionRule, 'source'>): boolean;
    /**
     * 添加用户规则
     */
    addUserRule(rule: Omit<EnhancedPermissionRule, 'source'>): boolean;
    /**
     * 添加会话规则
     */
    addSessionRule(rule: Omit<EnhancedPermissionRule, 'source'>): boolean;
    /**
     * 清理资源
     */
    dispose(): void;
}
/**
 * 获取全局权限集成实例
 */
export declare function getPermissionIntegration(config?: PermissionIntegrationConfig): PermissionIntegration;
/**
 * 初始化全局权限系统
 */
export declare function initializePermissionSystem(config?: PermissionIntegrationConfig): Promise<boolean>;
/**
 * 检查工具权限（便捷函数）
 */
export declare function checkPermission(toolId: string, toolName: string, input: any, toolUseContext: ToolUseContext): Promise<PermissionDecision>;
/**
 * 检查工具权限并返回基本结果（向后兼容）
 */
export declare function checkPermissionWithBaseResult(toolId: string, toolName: string, input: any, toolUseContext: ToolUseContext): Promise<BasePermissionResult>;
//# sourceMappingURL=PermissionIntegration.d.ts.map