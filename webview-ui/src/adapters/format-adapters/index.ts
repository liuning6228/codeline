/**
 * 格式转换适配器
 * 
 * 负责将Claude Code的格式转换为Cline的格式，确保UI兼容性
 */

// ------------------------------------------------------------
// 文件差异格式转换
// ------------------------------------------------------------

export interface ClaudeFileEditResult {
  operation: 'Add' | 'Update' | 'Delete';
  path: string;
  diffLines: string[];
  additions: number;
  deletions: number;
  content?: string;
  oldContent?: string;
}

export interface ClineDiffFormat {
  action: 'Add' | 'Update' | 'Delete';
  path: string;
  lines: string[];
  additions: number;
  deletions: number;
}

/**
 * 将Claude Code的FileEdit工具输出转换为Cline的Diff格式
 */
export function adaptClaudeFileEditToClineDiff(claudeOutput: ClaudeFileEditResult): ClineDiffFormat {
  return {
    action: claudeOutput.operation,
    path: claudeOutput.path,
    lines: claudeOutput.diffLines,
    additions: claudeOutput.additions,
    deletions: claudeOutput.deletions,
  };
}

/**
 * 将Cline的Diff格式转换为Claude Code的FileEdit输入
 */
export function adaptClineDiffToClaudeFileEdit(clineDiff: ClineDiffFormat): Partial<ClaudeFileEditResult> {
  return {
    operation: claudeOperationToClineAction(clineDiff.action),
    path: clineDiff.path,
    diffLines: clineDiff.lines,
    additions: clineDiff.additions,
    deletions: clineDiff.deletions,
  };
}

function claudeOperationToClineAction(operation: 'Add' | 'Update' | 'Delete'): 'Add' | 'Update' | 'Delete' {
  // Claude Code和Cline使用相同的操作名称
  return operation;
}

// ------------------------------------------------------------
// 工具进度格式转换
// ------------------------------------------------------------

export interface ClaudeToolProgress {
  percentage: number;
  message: string;
  eta?: number; // 估计剩余时间（秒）
  indeterminate?: boolean;
}

export interface ClineProgressIndicator {
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
  isIndeterminate?: boolean;
}

/**
 * 将Claude Code的工具进度转换为Cline的进度指示器格式
 */
export function adaptClaudeProgressToClineUI(progress: ClaudeToolProgress): ClineProgressIndicator {
  return {
    percentage: progress.percentage,
    message: progress.message,
    estimatedTimeRemaining: progress.eta,
    isIndeterminate: progress.indeterminate,
  };
}

/**
 * 将Cline的进度指示器转换为Claude Code的工具进度格式
 */
export function adaptClineUIProgressToClaude(clineProgress: ClineProgressIndicator): ClaudeToolProgress {
  return {
    percentage: clineProgress.percentage,
    message: clineProgress.message,
    eta: clineProgress.estimatedTimeRemaining,
    indeterminate: clineProgress.isIndeterminate,
  };
}

// ------------------------------------------------------------
// 消息格式转换
// ------------------------------------------------------------

export interface ClaudeChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  name?: string;
}

export interface ClineChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  id?: string;
}

/**
 * 将Claude Code的聊天消息转换为Cline的聊天消息格式
 */
export function adaptClaudeMessageToCline(claudeMessage: ClaudeChatMessage): ClineChatMessage {
  return {
    role: claudeMessage.role,
    content: claudeMessage.content,
    timestamp: new Date(),
    id: Date.now().toString(),
  };
}

/**
 * 将Cline的聊天消息转换为Claude Code的聊天消息格式
 */
export function adaptClineMessageToClaude(clineMessage: ClineChatMessage): ClaudeChatMessage {
  return {
    role: clineMessage.role,
    content: clineMessage.content,
  };
}

// ------------------------------------------------------------
// 工具定义格式转换
// ------------------------------------------------------------

export interface ClaudeToolDefinition {
  name: string;
  description: string;
  parameters?: Record<string, any>;
  category?: string;
}

export interface ClineToolDefinition {
  name: string;
  description: string;
  category?: string;
  parameters?: Record<string, any>;
}

/**
 * 将Claude Code的工具定义转换为Cline的工具定义格式
 */
export function adaptClaudeToolToCline(claudeTool: ClaudeToolDefinition): ClineToolDefinition {
  return {
    name: claudeTool.name,
    description: claudeTool.description,
    category: claudeTool.category,
    parameters: claudeTool.parameters,
  };
}

/**
 * 将Cline的工具定义转换为Claude Code的工具定义格式
 */
export function adaptClineToolToClaude(clineTool: ClineToolDefinition): ClaudeToolDefinition {
  return {
    name: clineTool.name,
    description: clineTool.description,
    category: clineTool.category,
    parameters: clineTool.parameters,
  };
}

// ------------------------------------------------------------
// 工具执行结果格式转换
// ------------------------------------------------------------

export interface ClaudeToolResult {
  success: boolean;
  output: string;
  files?: Array<{ path: string; content: string }>;
  error?: string;
  executionId: string;
}

export interface ClineToolResult {
  success: boolean;
  output?: string;
  files?: Array<{ path: string; content: string }>;
  error?: string;
  executionId: string;
}

/**
 * 将Claude Code的工具执行结果转换为Cline的工具结果格式
 */
export function adaptClaudeToolResultToCline(claudeResult: ClaudeToolResult): ClineToolResult {
  return {
    success: claudeResult.success,
    output: claudeResult.output,
    files: claudeResult.files,
    error: claudeResult.error,
    executionId: claudeResult.executionId,
  };
}

/**
 * 将Cline的工具结果转换为Claude Code的工具执行结果格式
 */
export function adaptClineToolResultToClaude(clineResult: ClineToolResult): ClaudeToolResult {
  return {
    success: clineResult.success,
    output: clineResult.output || '',
    files: clineResult.files,
    error: clineResult.error,
    executionId: clineResult.executionId,
  };
}

// ------------------------------------------------------------
// 批量转换工具
// ------------------------------------------------------------

/**
 * 批量转换文件差异
 */
export function adaptClaudeFileEditsToClineDiffs(claudeOutputs: ClaudeFileEditResult[]): ClineDiffFormat[] {
  return claudeOutputs.map(adaptClaudeFileEditToClineDiff);
}

/**
 * 批量转换聊天消息
 */
export function adaptClaudeMessagesToCline(claudeMessages: ClaudeChatMessage[]): ClineChatMessage[] {
  return claudeMessages.map(adaptClaudeMessageToCline);
}

/**
 * 批量转换工具定义
 */
export function adaptClaudeToolsToCline(claudeTools: ClaudeToolDefinition[]): ClineToolDefinition[] {
  return claudeTools.map(adaptClaudeToolToCline);
}

/**
 * 批量转换工具结果
 */
export function adaptClaudeToolResultsToCline(claudeResults: ClaudeToolResult[]): ClineToolResult[] {
  return claudeResults.map(adaptClaudeToolResultToCline);
}

// ------------------------------------------------------------
// 类型守卫和验证
// ------------------------------------------------------------

/**
 * 检查是否为有效的Claude文件编辑结果
 */
export function isValidClaudeFileEditResult(obj: any): obj is ClaudeFileEditResult {
  return (
    obj &&
    typeof obj === 'object' &&
    ['Add', 'Update', 'Delete'].includes(obj.operation) &&
    typeof obj.path === 'string' &&
    Array.isArray(obj.diffLines) &&
    typeof obj.additions === 'number' &&
    typeof obj.deletions === 'number'
  );
}

/**
 * 检查是否为有效的Cline差异格式
 */
export function isValidClineDiffFormat(obj: any): obj is ClineDiffFormat {
  return (
    obj &&
    typeof obj === 'object' &&
    ['Add', 'Update', 'Delete'].includes(obj.action) &&
    typeof obj.path === 'string' &&
    Array.isArray(obj.lines) &&
    typeof obj.additions === 'number' &&
    typeof obj.deletions === 'number'
  );
}

// 默认导出
export default {
  adaptClaudeFileEditToClineDiff,
  adaptClineDiffToClaudeFileEdit,
  adaptClaudeProgressToClineUI,
  adaptClineUIProgressToClaude,
  adaptClaudeMessageToCline,
  adaptClineMessageToClaude,
  adaptClaudeToolToCline,
  adaptClineToolToClaude,
  adaptClaudeToolResultToCline,
  adaptClineToolResultToClaude,
  adaptClaudeFileEditsToClineDiffs,
  adaptClaudeMessagesToCline,
  adaptClaudeToolsToCline,
  adaptClaudeToolResultsToCline,
  isValidClaudeFileEditResult,
  isValidClineDiffFormat,
};