/**
 * 编码工具集索引
 *
 * 导出所有编码专用工具，便于统一注册和使用
 */
import CodeGeneratorTool from './CodeGeneratorTool';
import FileEditorTool from './FileEditorTool';
import DebugAnalyzerTool from './DebugAnalyzerTool';
import TestRunnerTool from './TestRunnerTool';
import CodeAnalysisTool from './CodeAnalysisTool';
export { CodeGeneratorTool, FileEditorTool, DebugAnalyzerTool, TestRunnerTool, CodeAnalysisTool };
export * from './CodeGeneratorTool';
export * from './FileEditorTool';
export * from './DebugAnalyzerTool';
export * from './TestRunnerTool';
export * from './CodeAnalysisTool';
/**
 * 所有可用工具的定义
 */
export declare const CODING_TOOLS: ({
    id: string;
    name: string;
    description: string;
    category: "CODE";
    class: typeof CodeGeneratorTool;
} | {
    id: string;
    name: string;
    description: string;
    category: "CODE";
    class: typeof FileEditorTool;
} | {
    id: string;
    name: string;
    description: string;
    category: "DEVELOPMENT";
    class: typeof DebugAnalyzerTool;
} | {
    id: string;
    name: string;
    description: string;
    category: "DEVELOPMENT";
    class: typeof TestRunnerTool;
} | {
    id: string;
    name: string;
    description: string;
    category: "CODE";
    class: typeof CodeAnalysisTool;
})[];
/**
 * 按类别获取工具
 */
export declare function getToolsByCategory(category: string): ({
    id: string;
    name: string;
    description: string;
    category: "CODE";
    class: typeof CodeGeneratorTool;
} | {
    id: string;
    name: string;
    description: string;
    category: "CODE";
    class: typeof FileEditorTool;
} | {
    id: string;
    name: string;
    description: string;
    category: "DEVELOPMENT";
    class: typeof DebugAnalyzerTool;
} | {
    id: string;
    name: string;
    description: string;
    category: "DEVELOPMENT";
    class: typeof TestRunnerTool;
} | {
    id: string;
    name: string;
    description: string;
    category: "CODE";
    class: typeof CodeAnalysisTool;
})[];
/**
 * 获取工具ID列表
 */
export declare function getToolIds(): string[];
/**
 * 创建工具实例
 */
export declare function createToolInstance(toolId: string, context?: any): FileEditorTool | CodeAnalysisTool | CodeGeneratorTool | DebugAnalyzerTool | TestRunnerTool;
/**
 * 获取工具元数据
 */
export declare function getToolMetadata(toolId: string): {
    id: string;
    name: string;
    description: string;
    category: "DEVELOPMENT" | "CODE";
} | null;
//# sourceMappingURL=index.d.ts.map