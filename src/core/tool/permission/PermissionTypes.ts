/**
 * 权限系统核心类型定义
 * 支持Claude Code三层权限架构
 */

import { 
  PermissionRule as BasePermissionRule, 
  PermissionCondition, 
  ToolPermissionContext,
  PermissionLevel as BasePermissionLevel 
} from '../Tool';

// 重新导出基础权限类型
export { BasePermissionLevel };

/**
 * 权限来源 - 三层架构
 */
export enum PermissionSource {
  /** 系统级权限：全局配置，管理员设置，强制执行 */
  SYSTEM = 'system',
  
  /** 用户级权限：用户个人偏好，可配置 */
  USER = 'user',
  
  /** 会话级权限：临时授权，上下文相关 */
  SESSION = 'session'
}

/**
 * 增强的权限级别（扩展基础级别）
 */
export enum EnhancedPermissionLevel {
  /** 无权限 */
  NONE = 'none',
  
  /** 只读权限 */
  READ = 'read',
  
  /** 写入权限 */
  WRITE = 'write',
  
  /** 执行权限 */
  EXECUTE = 'execute',
  
  /** 管理员权限 */
  ADMIN = 'admin'
}

// 向后兼容：如果使用BasePermissionLevel，自动映射到EnhancedPermissionLevel
export const PermissionLevel = {
  ...BasePermissionLevel,
  ...EnhancedPermissionLevel
} as const;

/**
 * 增强的权限规则
 * 扩展基础PermissionRule，添加三层架构支持
 */
export interface EnhancedPermissionRule extends BasePermissionRule {
  /** 权限来源 */
  source: PermissionSource;
  
  /** 优先级（0-100，数字越大优先级越高） */
  priority: number;
  
  /** 元数据 */
  metadata?: {
    /** 规则描述 */
    description?: string;
    
    /** 创建者 */
    createdBy?: string;
    
    /** 创建时间 */
    createdAt?: Date;
    
    /** 更新时间 */
    updatedAt?: Date;
    
    /** 过期时间 */
    expiresAt?: Date;
    
    /** 标签，用于分类和过滤 */
    tags?: string[];
    
    /** 版本信息 */
    version?: string;
    
    /** 是否启用 */
    enabled?: boolean;
  };
}

/**
 * 权限决策结果
 */
export interface PermissionDecision {
  /** 是否允许 */
  allowed: boolean;
  
  /** 是否需要用户确认 */
  requiresUserConfirmation: boolean;
  
  /** 原因说明 */
  reason?: string;
  
  /** 权限级别 */
  level: EnhancedPermissionLevel;
  
  /** 是否自动批准 */
  autoApprove: boolean;
  
  /** 应用的规则ID */
  appliedRuleIds: string[];
  
  /** 决策时间 */
  timestamp: Date;
  
  /** 决策上下文 */
  context?: {
    /** 工具ID */
    toolId: string;
    
    /** 输入参数 */
    input?: any;
    
    /** 工作区路径 */
    workspaceRoot?: string;
    
    /** 会话ID */
    sessionId?: string;
    
    /** 用户ID */
    userId?: string;
  };
}

/**
 * 权限规则匹配条件
 */
export interface RuleMatchCondition {
  /** 工具ID匹配 */
  toolId?: string | RegExp;
  
  /** 输入参数匹配 */
  inputPattern?: any;
  
  /** 工作区路径匹配 */
  workspacePattern?: string | RegExp;
  
  /** 时间条件 */
  timeCondition?: {
    start?: Date;
    end?: Date;
    daysOfWeek?: number[]; // 0-6，0=周日
    hoursOfDay?: number[]; // 0-23
  };
  
  /** 自定义条件函数 */
  customCondition?: (context: PermissionEvaluationContext) => boolean;
}

/**
 * 权限评估上下文
 */
export interface PermissionEvaluationContext {
  /** 工具ID */
  toolId: string;
  
  /** 工具名称 */
  toolName?: string;
  
  /** 输入参数 */
  input?: any;
  
  /** 权限上下文 */
  permissionContext: EnhancedToolPermissionContext;
  
  /** 工作区信息 */
  workspace?: {
    root: string;
    name?: string;
    type?: string;
  };
  
  /** 会话信息 */
  session?: {
    id: string;
    startTime: Date;
    userId?: string;
    metadata?: Record<string, any>;
  };
  
  /** 用户信息 */
  user?: {
    id?: string;
    name?: string;
    roles?: string[];
  };
  
  /** 环境信息 */
  environment?: {
    isDevelopment?: boolean;
    isTest?: boolean;
    isProduction?: boolean;
    hostname?: string;
    platform?: string;
  };
}

/**
 * 增强的工具权限上下文
 * 扩展基础ToolPermissionContext，明确三层架构
 */
export interface EnhancedToolPermissionContext extends ToolPermissionContext {
  /** 系统级规则 */
  systemRules: EnhancedPermissionRule[];
  
  /** 用户级规则 */
  userRules: EnhancedPermissionRule[];
  
  /** 会话级规则 */
  sessionRules: EnhancedPermissionRule[];
  
  /** 默认权限级别 */
  defaultPermissionLevel?: EnhancedPermissionLevel;
  
  /** 是否启用严格模式 */
  isStrictMode?: boolean;
  
  /** 审计设置 */
  audit?: {
    /** 是否记录所有决策 */
    logAllDecisions?: boolean;
    
    /** 是否记录详细日志 */
    logDetails?: boolean;
    
    /** 审计日志存储位置 */
    logStorage?: 'memory' | 'file' | 'database';
    
    /** 日志保留策略 */
    retentionPolicy?: {
      maxEntries?: number;
      maxAgeDays?: number;
    };
  };
  
  /** 会话元数据 */
  sessionMetadata?: {
    sessionId: string;
    userId?: string;
    workspaceId?: string;
    startTime: Date;
    permissionsGranted: string[];
    permissionsDenied: string[];
    permissionsRequested: string[];
  };
  
  /** 决策历史（最近N条） */
  decisionHistory?: PermissionDecision[];
}

/**
 * 权限规则导入/导出结果
 */
export interface PermissionRulesImportResult {
  /** 导入成功的规则数量 */
  successCount: number;
  
  /** 导入失败的规则数量 */
  failureCount: number;
  
  /** 失败的规则详情 */
  failures: Array<{
    rule: EnhancedPermissionRule;
    error: string;
  }>;
  
  /** 警告信息 */
  warnings: string[];
}

/**
 * 权限规则导出选项
 */
export interface PermissionRulesExportOptions {
  /** 导出的规则来源 */
  sources?: PermissionSource[];
  
  /** 导出的规则ID列表 */
  ruleIds?: string[];
  
  /** 是否包含元数据 */
  includeMetadata?: boolean;
  
  /** 导出格式 */
  format?: 'json' | 'yaml' | 'csv';
  
  /** 是否包含默认规则 */
  includeDefaults?: boolean;
}

/**
 * 权限检查选项
 */
export interface PermissionCheckOptions {
  /** 是否交互式检查（显示确认对话框） */
  interactive?: boolean;
  
  /** 自定义确认消息 */
  confirmationMessage?: string;
  
  /** 超时时间（毫秒） */
  timeout?: number;
  
  /** 是否记录决策 */
  logDecision?: boolean;
  
  /** 是否使用缓存 */
  useCache?: boolean;
  
  /** 缓存时间（毫秒） */
  cacheTTL?: number;
}

/**
 * 权限系统配置
 */
export interface PermissionSystemConfig {
  /** 默认权限级别 */
  defaultPermissionLevel?: EnhancedPermissionLevel;
  
  /** 是否启用严格模式 */
  enableStrictMode?: boolean;
  
  /** 是否启用审计 */
  enableAudit?: boolean;
  
  /** 审计配置 */
  auditConfig?: {
    logStorage?: 'memory' | 'file' | 'database';
    maxEntries?: number;
    maxAgeDays?: number;
  };
  
  /** 规则缓存配置 */
  cacheConfig?: {
    enabled?: boolean;
    ttl?: number;
    maxSize?: number;
  };
  
  /** 默认规则文件路径 */
  defaultRulesPath?: string;
  
  /** 用户规则文件路径 */
  userRulesPath?: string;
  
  /** 系统规则文件路径 */
  systemRulesPath?: string;
}