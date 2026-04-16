/**
 * 编码工具集索引
 * 
 * 导出所有编码专用工具，便于统一注册和使用
 */

// 导入工具类
import CodeGeneratorTool from './CodeGeneratorTool';
import FileEditorTool from './FileEditorTool';
import DebugAnalyzerTool from './DebugAnalyzerTool';
import TestRunnerTool from './TestRunnerTool';
import CodeAnalysisTool from './CodeAnalysisTool';

// 重新导出工具类
export { CodeGeneratorTool, FileEditorTool, DebugAnalyzerTool, TestRunnerTool, CodeAnalysisTool };

// 导出类型
export * from './CodeGeneratorTool';
export * from './FileEditorTool';
export * from './DebugAnalyzerTool';
export * from './TestRunnerTool';
export * from './CodeAnalysisTool';

/**
 * 所有可用工具的定义
 */
export const CODING_TOOLS = [
  {
    id: 'code_generator',
    name: 'Code Generator',
    description: 'Generates code based on requirements, supporting multiple programming languages and patterns',
    category: 'CODE' as const,
    class: CodeGeneratorTool,
  },
  {
    id: 'file_editor',
    name: 'File Editor',
    description: 'Edits code files with precise operations: insert, replace, delete, rename, refactor',
    category: 'CODE' as const,
    class: FileEditorTool,
  },
  {
    id: 'debug_analyzer',
    name: 'Debug Analyzer',
    description: 'Analyzes code errors, stack traces, diagnoses issues and provides fix suggestions',
    category: 'DEVELOPMENT' as const,
    class: DebugAnalyzerTool,
  },
  {
    id: 'test_runner',
    name: 'Test Runner',
    description: 'Runs tests, analyzes results, calculates coverage and provides insights',
    category: 'DEVELOPMENT' as const,
    class: TestRunnerTool,
  },
  {
    id: 'code_analyzer',
    name: 'Code Analyzer',
    description: 'Analyzes code quality, complexity, dependencies and identifies potential issues',
    category: 'CODE' as const,
    class: CodeAnalysisTool,
  },
];

/**
 * 按类别获取工具
 */
export function getToolsByCategory(category: string) {
  return CODING_TOOLS.filter(tool => tool.category === category);
}

/**
 * 获取工具ID列表
 */
export function getToolIds(): string[] {
  return CODING_TOOLS.map(tool => tool.id);
}

/**
 * 创建工具实例
 */
export function createToolInstance(toolId: string, context?: any) {
  const toolDef = CODING_TOOLS.find(tool => tool.id === toolId);
  if (!toolDef) {
    throw new Error(`Tool not found: ${toolId}`);
  }
  
  return new toolDef.class(context);
}

/**
 * 获取工具元数据
 */
export function getToolMetadata(toolId: string) {
  const toolDef = CODING_TOOLS.find(tool => tool.id === toolId);
  if (!toolDef) {
    return null;
  }
  
  return {
    id: toolDef.id,
    name: toolDef.name,
    description: toolDef.description,
    category: toolDef.category,
  };
}

// 命名导出，不提供默认导出
// export default {
//   CodeGeneratorTool,
//   FileEditorTool,
//   DebugAnalyzerTool,
//   TestRunnerTool,
//   CodeAnalysisTool,
//   CODING_TOOLS,
//   getToolsByCategory,
//   getToolIds,
//   createToolInstance,
//   getToolMetadata,
// };