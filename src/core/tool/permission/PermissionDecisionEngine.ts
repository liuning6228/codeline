/**
 * 权限决策引擎
 * 实现Claude Code三层权限架构的决策逻辑
 */

import { 
  EnhancedPermissionRule, 
  PermissionSource, 
  EnhancedPermissionLevel,
  PermissionDecision,
  PermissionEvaluationContext,
  EnhancedToolPermissionContext,
  RuleMatchCondition
} from './PermissionTypes';

/**
 * 规则评估结果
 */
interface RuleEvaluationResult {
  rule: EnhancedPermissionRule;
  matches: boolean;
  score: number; // 0-100，匹配度分数
  conditionsMatched: number;
  conditionsTotal: number;
}

/**
 * 冲突解决策略
 */
export enum ConflictResolutionStrategy {
  /** 最高优先级优先 */
  HIGHEST_PRIORITY = 'highest_priority',
  
  /** 最严格优先（deny > ask > allow） */
  MOST_RESTRICTIVE = 'most_restrictive',
  
  /** 最宽松优先（allow > ask > deny） */
  MOST_PERMISSIVE = 'most_permissive',
  
  /** 按来源优先级（system > user > session） */
  BY_SOURCE = 'by_source',
  
  /** 最近创建的优先 */
  MOST_RECENT = 'most_recent'
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
export class PermissionDecisionEngine {
  private config: PermissionDecisionEngineConfig;
  private cache: Map<string, { decision: PermissionDecision; timestamp: number }> = new Map();
  
  constructor(config: PermissionDecisionEngineConfig = {}) {
    this.config = {
      conflictResolutionStrategy: ConflictResolutionStrategy.HIGHEST_PRIORITY,
      enableCaching: true,
      cacheTTL: 30000, // 30秒
      logDetailedEvaluation: false,
      defaultPermissionLevel: EnhancedPermissionLevel.READ,
      allowAutoApprove: true,
      autoApproveMinScore: 80,
      ...config
    };
  }
  
  /**
   * 评估权限请求
   */
  evaluate(
    context: PermissionEvaluationContext
  ): PermissionDecision {
    // 检查缓存
    const cacheKey = this.generateCacheKey(context);
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTL!) {
        return cached.decision;
      }
    }
    
    // 收集所有相关规则
    const allRules = this.collectRules(context.permissionContext);
    
    // 评估每条规则
    const evaluations = this.evaluateRules(allRules, context);
    
    // 过滤匹配的规则
    const matchingRules = evaluations
      .filter(evalResult => evalResult.matches)
      .map(evalResult => evalResult.rule);
    
    // 解决规则冲突
    const finalRule = this.resolveConflicts(matchingRules, evaluations);
    
    // 生成决策
    const decision = this.generateDecision(finalRule, context, matchingRules);
    
    // 缓存决策
    if (this.config.enableCaching) {
      this.cache.set(cacheKey, {
        decision,
        timestamp: Date.now()
      });
    }
    
    // 记录决策历史
    this.recordDecision(context.permissionContext, decision);
    
    return decision;
  }
  
  /**
   * 收集所有相关规则
   */
  private collectRules(
    permissionContext: EnhancedToolPermissionContext
  ): EnhancedPermissionRule[] {
    const rules: EnhancedPermissionRule[] = [];
    
    // 按来源优先级收集规则：system > user > session
    if (permissionContext.systemRules) {
      rules.push(...permissionContext.systemRules);
    }
    
    if (permissionContext.userRules) {
      rules.push(...permissionContext.userRules);
    }
    
    if (permissionContext.sessionRules) {
      rules.push(...permissionContext.sessionRules);
    }
    
    // 添加来自alwaysAllowRules, alwaysDenyRules, alwaysAskRules的规则
    // （兼容旧系统）
    this.addLegacyRules(permissionContext, rules);
    
    return rules;
  }
  
  /**
   * 添加遗留规则（向后兼容）
   */
  private addLegacyRules(
    permissionContext: EnhancedToolPermissionContext,
    rules: EnhancedPermissionRule[]
  ): void {
    // 转换alwaysAllowRules
    Object.entries(permissionContext.alwaysAllowRules || {}).forEach(([source, sourceRules]) => {
      sourceRules.forEach(rule => {
        rules.push({
          ...rule,
          source: this.mapLegacySource(source),
          priority: this.getDefaultPriorityForSource(source),
          action: 'allow'
        } as EnhancedPermissionRule);
      });
    });
    
    // 转换alwaysDenyRules
    Object.entries(permissionContext.alwaysDenyRules || {}).forEach(([source, sourceRules]) => {
      sourceRules.forEach(rule => {
        rules.push({
          ...rule,
          source: this.mapLegacySource(source),
          priority: this.getDefaultPriorityForSource(source),
          action: 'deny'
        } as EnhancedPermissionRule);
      });
    });
    
    // 转换alwaysAskRules
    Object.entries(permissionContext.alwaysAskRules || {}).forEach(([source, sourceRules]) => {
      sourceRules.forEach(rule => {
        rules.push({
          ...rule,
          source: this.mapLegacySource(source),
          priority: this.getDefaultPriorityForSource(source),
          action: 'ask'
        } as EnhancedPermissionRule);
      });
    });
  }
  
  /**
   * 映射遗留来源到新来源
   */
  private mapLegacySource(source: string): PermissionSource {
    const sourceMap: Record<string, PermissionSource> = {
      'system': PermissionSource.SYSTEM,
      'admin': PermissionSource.SYSTEM,
      'user': PermissionSource.USER,
      'session': PermissionSource.SESSION,
      'default': PermissionSource.USER
    };
    
    return sourceMap[source.toLowerCase()] || PermissionSource.USER;
  }
  
  /**
   * 获取来源的默认优先级
   */
  private getDefaultPriorityForSource(source: string): number {
    const priorityMap: Record<string, number> = {
      [PermissionSource.SYSTEM]: 100,
      [PermissionSource.USER]: 50,
      [PermissionSource.SESSION]: 10
    };
    
    const mappedSource = this.mapLegacySource(source);
    return priorityMap[mappedSource] || 50;
  }
  
  /**
   * 评估规则匹配
   */
  private evaluateRules(
    rules: EnhancedPermissionRule[],
    context: PermissionEvaluationContext
  ): RuleEvaluationResult[] {
    return rules.map(rule => {
      const matchResult = this.evaluateRule(rule, context);
      const score = this.calculateRuleScore(rule, matchResult);
      
      return {
        rule,
        matches: matchResult.matches,
        score,
        conditionsMatched: matchResult.conditionsMatched,
        conditionsTotal: matchResult.conditionsTotal
      };
    });
  }
  
  /**
   * 评估单个规则
   */
  private evaluateRule(
    rule: EnhancedPermissionRule,
    context: PermissionEvaluationContext
  ): { matches: boolean; conditionsMatched: number; conditionsTotal: number } {
    // 检查工具ID匹配
    if (!this.matchesToolId(rule.toolId, context.toolId)) {
      return { matches: false, conditionsMatched: 0, conditionsTotal: 1 };
    }
    
    let conditionsMatched = 0;
    let conditionsTotal = 1; // 工具ID匹配算一个条件
    
    // 检查条件匹配
    if (rule.conditions && rule.conditions.length > 0) {
      conditionsTotal += rule.conditions.length;
      conditionsMatched += rule.conditions.filter(condition => 
        this.matchesCondition(condition, context)
      ).length;
    }
    
    // 检查模式匹配
    if (rule.pattern) {
      conditionsTotal++;
      if (this.matchesPattern(rule.pattern, context.input)) {
        conditionsMatched++;
      }
    }
    
    // 所有条件都必须匹配（严格模式）
    const matches = conditionsMatched === conditionsTotal;
    
    return { matches, conditionsMatched, conditionsTotal };
  }
  
  /**
   * 检查工具ID匹配
   */
  private matchesToolId(ruleToolId: string, contextToolId: string): boolean {
    // 支持通配符和正则表达式
    if (ruleToolId === '*' || ruleToolId === '**') {
      return true;
    }
    
    if (ruleToolId.startsWith('/') && ruleToolId.endsWith('/')) {
      const regex = new RegExp(ruleToolId.slice(1, -1));
      return regex.test(contextToolId);
    }
    
    return ruleToolId === contextToolId;
  }
  
  /**
   * 检查条件匹配
   */
  private matchesCondition(
    condition: any, // 使用any因为PermissionCondition类型可能不完整
    context: PermissionEvaluationContext
  ): boolean {
    // 简化实现，实际需要根据condition.type实现完整逻辑
    return true;
  }
  
  /**
   * 检查模式匹配
   */
  private matchesPattern(pattern: any, input: any): boolean {
    // 简化实现，实际需要根据pattern类型实现完整匹配逻辑
    return true;
  }
  
  /**
   * 计算规则分数
   */
  private calculateRuleScore(
    rule: EnhancedPermissionRule,
    matchResult: { conditionsMatched: number; conditionsTotal: number }
  ): number {
    let score = 0;
    
    // 基础分：匹配度
    if (matchResult.conditionsTotal > 0) {
      score = (matchResult.conditionsMatched / matchResult.conditionsTotal) * 60;
    }
    
    // 优先级加分
    score += Math.min(rule.priority / 100 * 30, 30);
    
    // 来源加分
    const sourceBonus: Record<PermissionSource, number> = {
      [PermissionSource.SYSTEM]: 10,
      [PermissionSource.USER]: 5,
      [PermissionSource.SESSION]: 0
    };
    score += sourceBonus[rule.source] || 0;
    
    return Math.min(score, 100);
  }
  
  /**
   * 解决规则冲突
   */
  private resolveConflicts(
    matchingRules: EnhancedPermissionRule[],
    evaluations: RuleEvaluationResult[]
  ): EnhancedPermissionRule | null {
    if (matchingRules.length === 0) {
      return null;
    }
    
    if (matchingRules.length === 1) {
      return matchingRules[0];
    }
    
    const strategy = this.config.conflictResolutionStrategy!;
    
    switch (strategy) {
      case ConflictResolutionStrategy.HIGHEST_PRIORITY:
        return matchingRules.reduce((highest, rule) => 
          rule.priority > highest.priority ? rule : highest
        );
        
      case ConflictResolutionStrategy.MOST_RESTRICTIVE:
        return matchingRules.reduce((mostRestrictive, rule) => {
          const restrictiveness = this.getActionRestrictiveness(rule.action);
          const currentRestrictiveness = this.getActionRestrictiveness(mostRestrictive.action);
          return restrictiveness > currentRestrictiveness ? rule : mostRestrictive;
        });
        
      case ConflictResolutionStrategy.MOST_PERMISSIVE:
        return matchingRules.reduce((mostPermissive, rule) => {
          const restrictiveness = this.getActionRestrictiveness(rule.action);
          const currentRestrictiveness = this.getActionRestrictiveness(mostPermissive.action);
          return restrictiveness < currentRestrictiveness ? rule : mostPermissive;
        });
        
      case ConflictResolutionStrategy.BY_SOURCE:
        const sourcePriority = [PermissionSource.SYSTEM, PermissionSource.USER, PermissionSource.SESSION];
        for (const source of sourcePriority) {
          const sourceRules = matchingRules.filter(rule => rule.source === source);
          if (sourceRules.length > 0) {
            // 在同一来源内使用最高优先级
            return sourceRules.reduce((highest, rule) => 
              rule.priority > highest.priority ? rule : highest
            );
          }
        }
        return matchingRules[0];
        
      case ConflictResolutionStrategy.MOST_RECENT:
        // 假设规则有createdAt字段
        return matchingRules.reduce((mostRecent, rule) => {
          const currentDate = new Date(mostRecent.metadata?.createdAt || 0);
          const ruleDate = new Date(rule.metadata?.createdAt || 0);
          return ruleDate > currentDate ? rule : mostRecent;
        });
        
      default:
        return matchingRules[0];
    }
  }
  
  /**
   * 获取动作限制性分数
   */
  private getActionRestrictiveness(action: string): number {
    const restrictiveness: Record<string, number> = {
      'deny': 3,
      'ask': 2,
      'allow': 1
    };
    return restrictiveness[action] || 1;
  }
  
  /**
   * 生成决策
   */
  private generateDecision(
    rule: EnhancedPermissionRule | null,
    context: PermissionEvaluationContext,
    matchingRules: EnhancedPermissionRule[]
  ): PermissionDecision {
    const timestamp = new Date();
    
    if (!rule) {
      // 没有规则匹配，使用默认决策
      return {
        allowed: this.config.defaultPermissionLevel !== EnhancedPermissionLevel.NONE,
        requiresUserConfirmation: true,
        reason: `没有匹配的权限规则，使用默认权限级别: ${this.config.defaultPermissionLevel}`,
        level: this.config.defaultPermissionLevel!,
        autoApprove: false,
        appliedRuleIds: [],
        timestamp
      };
    }
    
    // 根据规则动作生成决策
    let allowed = false;
    let requiresUserConfirmation = false;
    let autoApprove = false;
    let reason = '';
    
    switch (rule.action) {
      case 'allow':
        allowed = true;
        requiresUserConfirmation = false;
        autoApprove = this.config.allowAutoApprove || false;
        reason = `规则 "${rule.id}" 允许执行`;
        break;
        
      case 'deny':
        allowed = false;
        requiresUserConfirmation = false;
        autoApprove = false;
        reason = `规则 "${rule.id}" 拒绝执行`;
        break;
        
      case 'ask':
        allowed = true; // 询问意味着可以执行，但需要确认
        requiresUserConfirmation = true;
        autoApprove = false;
        reason = `规则 "${rule.id}" 要求用户确认`;
        break;
        
      default:
        allowed = false;
        requiresUserConfirmation = false;
        autoApprove = false;
        reason = `未知规则动作: ${rule.action}`;
    }
    
    // 确定权限级别
    let level = EnhancedPermissionLevel.EXECUTE;
    if (rule.metadata?.tags?.includes('read-only')) {
      level = EnhancedPermissionLevel.READ;
    } else if (rule.metadata?.tags?.includes('write')) {
      level = EnhancedPermissionLevel.WRITE;
    } else if (rule.metadata?.tags?.includes('admin')) {
      level = EnhancedPermissionLevel.ADMIN;
    }
    
    // 检查是否满足自动批准条件
    if (autoApprove && this.config.allowAutoApprove) {
      const evaluation = this.evaluateRules([rule], context)[0];
      if (evaluation.score >= (this.config.autoApproveMinScore || 80)) {
        requiresUserConfirmation = false;
        reason += ' (自动批准)';
      }
    }
    
    return {
      allowed,
      requiresUserConfirmation,
      reason,
      level,
      autoApprove,
      appliedRuleIds: [rule.id],
      timestamp,
      context: {
        toolId: context.toolId,
        input: context.input,
        workspaceRoot: context.workspace?.root,
        sessionId: context.session?.id,
        userId: context.user?.id
      }
    };
  }
  
  /**
   * 生成缓存键
   */
  private generateCacheKey(context: PermissionEvaluationContext): string {
    const keyParts = [
      context.toolId,
      JSON.stringify(context.input),
      context.workspace?.root,
      context.session?.id,
      context.user?.id
    ];
    return keyParts.join('|');
  }
  
  /**
   * 记录决策历史
   */
  private recordDecision(
    permissionContext: EnhancedToolPermissionContext,
    decision: PermissionDecision
  ): void {
    if (!permissionContext.decisionHistory) {
      permissionContext.decisionHistory = [];
    }
    
    // 添加到历史记录
    permissionContext.decisionHistory.unshift(decision);
    
    // 限制历史记录大小
    const maxHistory = permissionContext.audit?.retentionPolicy?.maxEntries || 100;
    if (permissionContext.decisionHistory.length > maxHistory) {
      permissionContext.decisionHistory = permissionContext.decisionHistory.slice(0, maxHistory);
    }
    
    // 更新会话元数据
    if (permissionContext.sessionMetadata) {
      if (decision.allowed) {
        permissionContext.sessionMetadata.permissionsGranted.push(decision.context?.toolId || 'unknown');
      } else {
        permissionContext.sessionMetadata.permissionsDenied.push(decision.context?.toolId || 'unknown');
      }
      permissionContext.sessionMetadata.permissionsRequested.push(decision.context?.toolId || 'unknown');
    }
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitRate: number } {
    // 简化实现
    return {
      size: this.cache.size,
      hitRate: 0 // 实际需要跟踪命中率
    };
  }
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<PermissionDecisionEngineConfig>): void {
    this.config = { ...this.config, ...config };
    // 配置变更时清除缓存
    this.clearCache();
  }
}