/**
 * 权限系统集成
 * 连接EnhancedBaseTool与新权限系统
 */

import * as vscode from 'vscode';
import { PermissionDecisionEngine, ConflictResolutionStrategy } from './PermissionDecisionEngine';
import { PermissionManager } from './PermissionManager';
import {
  EnhancedPermissionRule,
  PermissionSource,
  EnhancedPermissionLevel,
  PermissionDecision,
  PermissionEvaluationContext,
  EnhancedToolPermissionContext
} from './PermissionTypes';
import { ToolUseContext, PermissionResult as BasePermissionResult, PermissionLevel } from '../Tool';

/**
 * 权限系统集成配置
 */
export interface PermissionIntegrationConfig {
  /** 是否启用增强权限系统 */
  enabled: boolean;
  
  /** 决策引擎配置 */
  decisionEngineConfig?: any; // 使用PermissionDecisionEngineConfig类型
  
  /** 权限管理器配置 */
  permissionManagerConfig?: any; // 使用PermissionManagerConfig类型
  
  /** 是否自动加载规则 */
  autoLoadRules?: boolean;
  
  /** 默认冲突解决策略 */
  defaultConflictStrategy?: ConflictResolutionStrategy;
}

/**
 * 权限系统集成器
 */
export class PermissionIntegration {
  private decisionEngine: PermissionDecisionEngine;
  private permissionManager: PermissionManager;
  private config: PermissionIntegrationConfig;
  private isInitialized = false;
  
  constructor(config: PermissionIntegrationConfig = { enabled: true }) {
    this.config = {
      autoLoadRules: true,
      defaultConflictStrategy: ConflictResolutionStrategy.HIGHEST_PRIORITY,
      ...config
    };
    
    // 创建决策引擎
    this.decisionEngine = new PermissionDecisionEngine({
      conflictResolutionStrategy: this.config.defaultConflictStrategy,
      enableCaching: true,
      cacheTTL: 30000
    });
    
    // 创建权限管理器
    this.permissionManager = new PermissionManager({
      autoSave: true,
      enableValidation: true,
      logOperations: true
    });
  }
  
  /**
   * 初始化权限系统
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // 加载权限规则
      if (this.config.autoLoadRules) {
        await this.permissionManager.loadFromFile();
      }
      
      this.isInitialized = true;
      console.log('权限系统初始化完成');
      return true;
    } catch (error) {
      console.error('权限系统初始化失败:', error);
      return false;
    }
  }
  
  /**
   * 检查工具权限
   */
  async checkToolPermission(
    toolId: string,
    toolName: string,
    input: any,
    toolUseContext: ToolUseContext
  ): Promise<PermissionDecision> {
    // 如果不启用权限系统，返回默认允许
    if (!this.config.enabled) {
      return this.createDefaultAllowDecision(toolId);
    }
    
    // 确保已初始化
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // 创建评估上下文
    const evaluationContext = this.createEvaluationContext(
      toolId,
      toolName,
      input,
      toolUseContext
    );
    
    // 使用决策引擎评估
    return this.decisionEngine.evaluate(evaluationContext);
  }
  
  /**
   * 转换权限决策为基本权限结果（向后兼容）
   */
  convertToBasePermissionResult(decision: PermissionDecision): BasePermissionResult {
    return {
      allowed: decision.allowed,
      requiresUserConfirmation: decision.requiresUserConfirmation,
      reason: decision.reason,
      level: this.convertPermissionLevel(decision.level),
      autoApprove: decision.autoApprove
    };
  }
  
  /**
   * 转换权限级别
   */
  private convertPermissionLevel(level: EnhancedPermissionLevel): PermissionLevel {
    const levelMap: Record<EnhancedPermissionLevel, PermissionLevel> = {
      [EnhancedPermissionLevel.NONE]: PermissionLevel.NONE,
      [EnhancedPermissionLevel.READ]: PermissionLevel.READ,
      [EnhancedPermissionLevel.WRITE]: PermissionLevel.WRITE,
      [EnhancedPermissionLevel.EXECUTE]: PermissionLevel.EXECUTE,
      [EnhancedPermissionLevel.ADMIN]: PermissionLevel.ADMIN
    };
    
    return levelMap[level] || PermissionLevel.READ;
  }
  
  /**
   * 创建评估上下文
   */
  private createEvaluationContext(
    toolId: string,
    toolName: string,
    input: any,
    toolUseContext: ToolUseContext
  ): PermissionEvaluationContext {
    // 转换权限上下文
    const permissionContext = this.convertToEnhancedPermissionContext(
      toolUseContext.permissionContext
    );
    
    return {
      toolId,
      toolName,
      input,
      permissionContext,
      workspace: {
        root: toolUseContext.workspaceRoot
      },
      session: {
        id: 'session-id', // 需要从上下文获取
        startTime: new Date()
      },
      environment: {
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production'
      }
    };
  }
  
  /**
   * 转换为增强权限上下文
   */
  private convertToEnhancedPermissionContext(
    baseContext: any
  ): EnhancedToolPermissionContext {
    // 获取权限管理器中的规则
    const systemRules = this.permissionManager.getRules({ source: PermissionSource.SYSTEM });
    const userRules = this.permissionManager.getRules({ source: PermissionSource.USER });
    const sessionRules = this.permissionManager.getRules({ source: PermissionSource.SESSION });
    
    return {
      // 基础上下文属性
      mode: baseContext?.mode || 'default',
      alwaysAllowRules: baseContext?.alwaysAllowRules || {},
      alwaysDenyRules: baseContext?.alwaysDenyRules || {},
      alwaysAskRules: baseContext?.alwaysAskRules || {},
      isBypassPermissionsModeAvailable: baseContext?.isBypassPermissionsModeAvailable || false,
      
      // 增强属性
      systemRules,
      userRules,
      sessionRules,
      defaultPermissionLevel: EnhancedPermissionLevel.READ,
      isStrictMode: false,
      audit: {
        logAllDecisions: true,
        logDetails: false,
        logStorage: 'memory',
        retentionPolicy: {
          maxEntries: 100,
          maxAgeDays: 7
        }
      },
      sessionMetadata: {
        sessionId: `session-${Date.now()}`,
        startTime: new Date(),
        permissionsGranted: [],
        permissionsDenied: [],
        permissionsRequested: []
      },
      decisionHistory: []
    };
  }
  
  /**
   * 创建默认允许决策
   */
  private createDefaultAllowDecision(toolId: string): PermissionDecision {
    return {
      allowed: true,
      requiresUserConfirmation: false,
      reason: '权限系统未启用，默认允许',
      level: EnhancedPermissionLevel.EXECUTE,
      autoApprove: true,
      appliedRuleIds: [],
      timestamp: new Date(),
      context: {
        toolId
      }
    };
  }
  
  /**
   * 获取决策引擎
   */
  getDecisionEngine(): PermissionDecisionEngine {
    return this.decisionEngine;
  }
  
  /**
   * 获取权限管理器
   */
  getPermissionManager(): PermissionManager {
    return this.permissionManager;
  }
  
  /**
   * 添加系统规则
   */
  addSystemRule(rule: Omit<EnhancedPermissionRule, 'source'>): boolean {
    const enhancedRule: EnhancedPermissionRule = {
      ...rule,
      source: PermissionSource.SYSTEM,
      priority: rule.priority || 100
    };
    
    return this.permissionManager.addRule(enhancedRule);
  }
  
  /**
   * 添加用户规则
   */
  addUserRule(rule: Omit<EnhancedPermissionRule, 'source'>): boolean {
    const enhancedRule: EnhancedPermissionRule = {
      ...rule,
      source: PermissionSource.USER,
      priority: rule.priority || 50
    };
    
    return this.permissionManager.addRule(enhancedRule);
  }
  
  /**
   * 添加会话规则
   */
  addSessionRule(rule: Omit<EnhancedPermissionRule, 'source'>): boolean {
    const enhancedRule: EnhancedPermissionRule = {
      ...rule,
      source: PermissionSource.SESSION,
      priority: rule.priority || 10
    };
    
    return this.permissionManager.addRule(enhancedRule);
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    this.permissionManager.dispose();
    this.decisionEngine.clearCache();
  }
}

/**
 * 全局权限集成实例
 */
let globalPermissionIntegration: PermissionIntegration | null = null;

/**
 * 获取全局权限集成实例
 */
export function getPermissionIntegration(
  config?: PermissionIntegrationConfig
): PermissionIntegration {
  if (!globalPermissionIntegration) {
    globalPermissionIntegration = new PermissionIntegration(config);
  }
  return globalPermissionIntegration;
}

/**
 * 初始化全局权限系统
 */
export async function initializePermissionSystem(
  config?: PermissionIntegrationConfig
): Promise<boolean> {
  const integration = getPermissionIntegration(config);
  return integration.initialize();
}

/**
 * 检查工具权限（便捷函数）
 */
export async function checkPermission(
  toolId: string,
  toolName: string,
  input: any,
  toolUseContext: ToolUseContext
): Promise<PermissionDecision> {
  const integration = getPermissionIntegration();
  return integration.checkToolPermission(toolId, toolName, input, toolUseContext);
}

/**
 * 检查工具权限并返回基本结果（向后兼容）
 */
export async function checkPermissionWithBaseResult(
  toolId: string,
  toolName: string,
  input: any,
  toolUseContext: ToolUseContext
): Promise<BasePermissionResult> {
  const integration = getPermissionIntegration();
  const decision = await integration.checkToolPermission(toolId, toolName, input, toolUseContext);
  return integration.convertToBasePermissionResult(decision);
}