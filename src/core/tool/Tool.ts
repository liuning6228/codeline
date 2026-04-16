/**
 * CodeLine 核心工具抽象
 * 借鉴claude-code-haha-main的Tool架构，结合CodeLine的VSCode扩展特性
 * 
 * Zod兼容性更新（2026-04-08）：
 * 1. 替换模拟ZodSchema为真正的Zod库
 * 2. 添加兼容层支持渐进式迁移
 * 3. 保持向后兼容性
 */

import * as vscode from 'vscode';
import { ToolCategory } from '../types/index';
export { ToolCategory };

// ==================== Zod兼容性导入 ====================

// 导入Zod兼容层，支持真正的Zod和向后兼容
import {
  z,
  ZodSchema,
  createCompatibleSchema,
  isCompatibleSchema,
  getRealSchema,
  unifiedParse,
  unifiedSafeParse,
  compatibility,
  ZodError
} from './ZodCompatibility';

// 导出Zod相关类型和工具
export { 
  z, 
  ZodSchema, 
  createCompatibleSchema, 
  isCompatibleSchema, 
  getRealSchema,
  unifiedParse,
  unifiedSafeParse,
  compatibility,
  ZodError 
};

// ==================== 类型定义 ====================

/**
 * 工具权限结果
 */
export interface PermissionResult {
  allowed: boolean;
  requiresUserConfirmation: boolean;
  reason?: string;
  level?: PermissionLevel;
  autoApprove?: boolean;
}

/**
 * 权限级别
 */
export enum PermissionLevel {
  NONE = 'none',
  READ = 'read',
  WRITE = 'write',
  EXECUTE = 'execute',
  ADMIN = 'admin'
}

/**
 * 工具执行上下文
 */
export interface ToolUseContext {
  workspaceRoot: string;
  workspaceFolders?: vscode.WorkspaceFolder[];
  extensionContext: vscode.ExtensionContext;
  outputChannel: vscode.OutputChannel;
  abortController: AbortController;
  
  // 权限上下文
  permissionContext: ToolPermissionContext;
  
  // 用户交互
  showInformationMessage: (message: string, ...items: string[]) => Thenable<string | undefined>;
  showWarningMessage: (message: string, ...items: string[]) => Thenable<string | undefined>;
  showErrorMessage: (message: string, ...items: string[]) => Thenable<string | undefined>;
  
  // 文件操作
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  fileExists: (path: string) => Promise<boolean>;
  
  // 终端执行
  executeCommand?: (command: string, options?: CommandOptions) => Promise<CommandResult>;
  
  // 状态管理
  setStatus?: (status: string) => void;
  updateProgress?: (progress: ToolProgress) => void;
}

/**
 * 工具权限上下文
 */
export interface ToolPermissionContext {
  mode: PermissionMode;
  alwaysAllowRules: ToolPermissionRulesBySource;
  alwaysDenyRules: ToolPermissionRulesBySource;
  alwaysAskRules: ToolPermissionRulesBySource;
  isBypassPermissionsModeAvailable: boolean;
  shouldAvoidPermissionPrompts?: boolean;
}

/**
 * 权限模式
 */
export type PermissionMode = 'default' | 'auto' | 'bypass' | 'strict';

/**
 * 工具权限规则
 */
export interface ToolPermissionRulesBySource {
  [source: string]: PermissionRule[];
}

/**
 * 权限规则
 */
export interface PermissionRule {
  id: string;
  toolId: string;
  pattern: string;
  action: 'allow' | 'deny' | 'ask';
  conditions?: PermissionCondition[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 权限条件
 */
export interface PermissionCondition {
  type: 'workspace' | 'time' | 'user' | 'context';
  key: string;
  value: any;
  operator: 'equals' | 'contains' | 'matches' | 'in';
}

/**
 * 命令选项
 */
export interface CommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeout?: number;
  shell?: boolean;
  onOutput?: (data: string) => void;
  onError?: (data: string) => void;
}

/**
 * 命令结果
 */
export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
  duration?: number;
  command: string;
  timestamp: Date;
}

/**
 * 工具进度
 */
export interface ToolProgress {
  type: 'start' | 'output' | 'error' | 'complete' | 'cancel';
  toolId: string;
  data?: any;
  timestamp: Date;
}



/**
 * 工具能力
 */
export interface ToolCapabilities {
  isConcurrencySafe: boolean;
  isReadOnly: boolean;
  isDestructive: boolean;
  requiresWorkspace: boolean;
  supportsStreaming: boolean;
  requiresFileAccess?: boolean;
  canModifyFiles?: boolean;
  canReadFiles?: boolean;
  canExecuteCommands?: boolean;
  canAccessNetwork?: boolean;
  requiresModel?: boolean;
}

// ==================== 工具抽象基类 ====================

/**
 * 工具抽象基类
 * 借鉴claude-code-haha-main的Tool架构
 */
export abstract class Tool<Input = any, Output = any> {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly category: ToolCategory;
  abstract readonly version: string;
  abstract readonly author: string;
  
  // 输入模式验证
  abstract readonly inputSchema: ZodSchema<Input>;
  
  // 工具能力
  abstract readonly capabilities: ToolCapabilities;
  
  /**
   * 检查工具是否可用
   */
  abstract isEnabled(context: ToolUseContext): boolean | Promise<boolean>;
  
  /**
   * 检查并发安全性
   */
  abstract isConcurrencySafe(input: Input, context: ToolUseContext): boolean | Promise<boolean>;
  
  /**
   * 检查权限
   */
  abstract checkPermissions(input: Input, context: ToolUseContext): Promise<PermissionResult>;
  
  /**
   * 验证参数
   */
  abstract validateParameters(input: Input, context: ToolUseContext): Promise<ValidationResult>;
  
  /**
   * 执行工具
   */
  abstract execute(input: Input, context: ToolUseContext): Promise<Output>;
  
  /**
   * 取消执行（可选）
   */
  cancel?(context: ToolUseContext): Promise<void>;
  
  /**
   * 获取显示名称
   */
  getDisplayName?(input?: Input): string;
  
  /**
   * 获取活动描述
   */
  getActivityDescription?(input: Input): string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * 工具定义（用于注册）
 */
export interface ToolDefinition<Input = any, Output = any> {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  version: string;
  author: string;
  inputSchema: ZodSchema<Input>;
  capabilities: ToolCapabilities;
  isEnabled?: (context: ToolUseContext) => boolean | Promise<boolean>;
  isConcurrencySafe?: (input: Input, context: ToolUseContext) => boolean | Promise<boolean>;
  checkPermissions?: (input: Input, context: ToolUseContext) => Promise<PermissionResult>;
  validateParameters?: (input: Input, context: ToolUseContext) => Promise<ValidationResult>;
  execute: (input: Input, context: ToolUseContext) => Promise<Output>;
  cancel?: (context: ToolUseContext) => Promise<void>;
  getDisplayName?: (input?: Input) => string;
  getActivityDescription?: (input: Input) => string;
}

// ==================== 工具构建器 ====================

/**
 * 工具构建器
 * 将工具定义转换为工具实例
 */
export function buildTool<Input, Output>(
  definition: ToolDefinition<Input, Output>
): Tool<Input, Output> {
  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    version: definition.version,
    author: definition.author,
    inputSchema: definition.inputSchema,
    capabilities: definition.capabilities,
    
    isEnabled: definition.isEnabled || (() => true),
    isConcurrencySafe: definition.isConcurrencySafe || (() => false),
    checkPermissions: definition.checkPermissions || (async () => ({
      allowed: true,
      requiresUserConfirmation: true
    })),
    validateParameters: definition.validateParameters || (async () => ({
      valid: true
    })),
    execute: definition.execute,
    cancel: definition.cancel,
    getDisplayName: definition.getDisplayName || (() => definition.name),
    getActivityDescription: definition.getActivityDescription || (() => definition.description)
  };
}

// ==================== 工具查找 ====================

/**
 * 工具集合类型
 */
export type Tools = Map<string, Tool>;

/**
 * 按名称查找工具
 */
export function findToolByName(tools: Tools, name: string): Tool | undefined {
  return tools.get(name);
}

/**
 * 按类别查找工具
 */
export function findToolsByCategory(tools: Tools, category: ToolCategory): Tool[] {
  const result: Tool[] = [];
  // 避免迭代器问题，使用Array.from或forEach
  tools.forEach((tool) => {
    if (tool.category === category) {
      result.push(tool);
    }
  });
  return result;
}

// ==================== 空权限上下文 ====================

/**
 * 获取空权限上下文
 */
export function getEmptyToolPermissionContext(): ToolPermissionContext {
  return {
    mode: 'default',
    alwaysAllowRules: {},
    alwaysDenyRules: {},
    alwaysAskRules: {},
    isBypassPermissionsModeAvailable: false
  };
}

// ==================== 工具使用错误 ====================

/**
 * 工具使用错误
 */
export class ToolUseError extends Error {
  constructor(
    message: string,
    public readonly toolId: string,
    public readonly input?: any,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ToolUseError';
  }
}

/**
 * 权限拒绝错误
 */
export class PermissionDeniedError extends ToolUseError {
  constructor(
    toolId: string,
    input?: any,
    public readonly reason?: string
  ) {
    super(`Permission denied for tool: ${toolId}`, toolId, input);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * 参数验证错误
 */
export class ValidationError extends ToolUseError {
  constructor(
    toolId: string,
    input?: any,
    public readonly errors?: string[]
  ) {
    super(`Validation failed for tool: ${toolId}`, toolId, input);
    this.name = 'ValidationError';
  }
}