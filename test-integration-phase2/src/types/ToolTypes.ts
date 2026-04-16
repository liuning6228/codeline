/**
 * 工具类型定义
 * 用于MockEnhancedToolRegistry的类型兼容
 */

/**
 * 工具类别枚举
 */
export enum ToolCategory {
  FILE = 'file',
  TERMINAL = 'terminal',
  CODE = 'code',
  DEBUG = 'debug',
  TEST = 'test',
  OTHER = 'other'
}

/**
 * 工具使用上下文
 */
export interface ToolUseContext {
  workspaceRoot?: string;
  workspaceFolders?: any[];
  extensionContext?: any;
  outputChannel?: any;
  abortController?: AbortController;
  permissionContext?: any;
  showInformationMessage?: (message: string) => Promise<void>;
  showWarningMessage?: (message: string) => Promise<void>;
  showErrorMessage?: (message: string) => Promise<void>;
  readFile?: (path: string) => Promise<string>;
  writeFile?: (path: string, content: string) => Promise<void>;
  executeCommand?: (command: string) => Promise<any>;
  [key: string]: any;
}

/**
 * 工具定义
 */
export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  parameters: any;
  category: ToolCategory;
}

/**
 * 工具接口
 */
export interface Tool extends ToolDefinition {
  execute: (args: any, context?: ToolUseContext) => Promise<any>;
  validateParameters: (params: any) => { valid: boolean; errors: string[] };
}

/**
 * 工具映射
 */
export type Tools = Map<string, Tool>;

/**
 * 构建工具
 */
export function buildTool(definition: ToolDefinition, executeFn: (args: any, context?: ToolUseContext) => Promise<any>): Tool {
  return {
    ...definition,
    execute: executeFn,
    validateParameters: (params: any) => ({ valid: true, errors: [] })
  };
}

/**
 * 按名称查找工具
 */
export function findToolByName(tools: Tool[], name: string): Tool | undefined {
  return tools.find(tool => tool.name === name);
}

/**
 * 按类别查找工具
 */
export function findToolsByCategory(tools: Tool[], category: ToolCategory): Tool[] {
  return tools.filter(tool => tool.category === category);
}