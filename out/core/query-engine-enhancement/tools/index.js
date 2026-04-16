"use strict";
/**
 * 编码工具集索引
 *
 * 导出所有编码专用工具，便于统一注册和使用
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODING_TOOLS = exports.CodeAnalysisTool = exports.TestRunnerTool = exports.DebugAnalyzerTool = exports.FileEditorTool = exports.CodeGeneratorTool = void 0;
exports.getToolsByCategory = getToolsByCategory;
exports.getToolIds = getToolIds;
exports.createToolInstance = createToolInstance;
exports.getToolMetadata = getToolMetadata;
// 导入工具类
const CodeGeneratorTool_1 = __importDefault(require("./CodeGeneratorTool"));
exports.CodeGeneratorTool = CodeGeneratorTool_1.default;
const FileEditorTool_1 = __importDefault(require("./FileEditorTool"));
exports.FileEditorTool = FileEditorTool_1.default;
const DebugAnalyzerTool_1 = __importDefault(require("./DebugAnalyzerTool"));
exports.DebugAnalyzerTool = DebugAnalyzerTool_1.default;
const TestRunnerTool_1 = __importDefault(require("./TestRunnerTool"));
exports.TestRunnerTool = TestRunnerTool_1.default;
const CodeAnalysisTool_1 = __importDefault(require("./CodeAnalysisTool"));
exports.CodeAnalysisTool = CodeAnalysisTool_1.default;
// 导出类型
__exportStar(require("./CodeGeneratorTool"), exports);
__exportStar(require("./FileEditorTool"), exports);
__exportStar(require("./DebugAnalyzerTool"), exports);
__exportStar(require("./TestRunnerTool"), exports);
__exportStar(require("./CodeAnalysisTool"), exports);
/**
 * 所有可用工具的定义
 */
exports.CODING_TOOLS = [
    {
        id: 'code_generator',
        name: 'Code Generator',
        description: 'Generates code based on requirements, supporting multiple programming languages and patterns',
        category: 'CODE',
        class: CodeGeneratorTool_1.default,
    },
    {
        id: 'file_editor',
        name: 'File Editor',
        description: 'Edits code files with precise operations: insert, replace, delete, rename, refactor',
        category: 'CODE',
        class: FileEditorTool_1.default,
    },
    {
        id: 'debug_analyzer',
        name: 'Debug Analyzer',
        description: 'Analyzes code errors, stack traces, diagnoses issues and provides fix suggestions',
        category: 'DEVELOPMENT',
        class: DebugAnalyzerTool_1.default,
    },
    {
        id: 'test_runner',
        name: 'Test Runner',
        description: 'Runs tests, analyzes results, calculates coverage and provides insights',
        category: 'DEVELOPMENT',
        class: TestRunnerTool_1.default,
    },
    {
        id: 'code_analyzer',
        name: 'Code Analyzer',
        description: 'Analyzes code quality, complexity, dependencies and identifies potential issues',
        category: 'CODE',
        class: CodeAnalysisTool_1.default,
    },
];
/**
 * 按类别获取工具
 */
function getToolsByCategory(category) {
    return exports.CODING_TOOLS.filter(tool => tool.category === category);
}
/**
 * 获取工具ID列表
 */
function getToolIds() {
    return exports.CODING_TOOLS.map(tool => tool.id);
}
/**
 * 创建工具实例
 */
function createToolInstance(toolId, context) {
    const toolDef = exports.CODING_TOOLS.find(tool => tool.id === toolId);
    if (!toolDef) {
        throw new Error(`Tool not found: ${toolId}`);
    }
    return new toolDef.class(context);
}
/**
 * 获取工具元数据
 */
function getToolMetadata(toolId) {
    const toolDef = exports.CODING_TOOLS.find(tool => tool.id === toolId);
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
//# sourceMappingURL=index.js.map