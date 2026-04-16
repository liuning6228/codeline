"use strict";
/**
 * 简单集成测试
 * 测试EnhancedBaseTool与EnhancedToolRegistry的基本集成
 */
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const EnhancedToolRegistry_1 = require("../../../../src/core/tool/EnhancedToolRegistry");
const EnhancedBaseTool_1 = require("../../../../src/core/tool/EnhancedBaseTool");
const Tool_1 = require("../../../../src/core/tool/Tool");
// 简单的模拟上下文
const mockContext = {
    workspaceRoot: '/test/workspace',
    extensionContext: undefined,
    outputChannel: undefined,
    cwd: '/test/workspace',
    sessionId: 'test-session',
    options: {
        autoExecute: false,
        requireApproval: true,
        timeout: 30000,
        validateParams: true
    }
};
describe('简单集成测试', () => {
    it('EnhancedBaseTool应该能注册到EnhancedToolRegistry', () => {
        // 创建一个简单的增强工具
        const enhancedTool = (0, EnhancedBaseTool_1.createEnhancedTool)({
            id: 'test-tool',
            name: '测试工具',
            description: '用于集成测试的工具',
            category: Tool_1.ToolCategory.OTHER,
            execute: async (input, context) => {
                return `处理: ${input.message}`;
            }
        });
        // 创建工具注册表
        const registry = new EnhancedToolRegistry_1.EnhancedToolRegistry();
        // 获取新接口实例并注册
        const newTool = enhancedTool.getNewToolInstance();
        const result = registry.registerTool(newTool, [Tool_1.ToolCategory.OTHER]);
        chai_1.assert.isTrue(result, '工具应该成功注册');
        chai_1.assert.equal(registry.getAllTools().length, 1);
        chai_1.assert.equal(registry.getAllTools()[0].id, 'test-tool');
    });
    it('应该能通过ID查找注册的工具', () => {
        const enhancedTool = (0, EnhancedBaseTool_1.createEnhancedTool)({
            id: 'find-tool',
            name: '查找工具',
            description: '用于测试查找功能的工具',
            category: Tool_1.ToolCategory.OTHER,
            execute: async (input, context) => {
                return `查询结果: ${input.query}`;
            }
        });
        const registry = new EnhancedToolRegistry_1.EnhancedToolRegistry();
        const newTool = enhancedTool.getNewToolInstance();
        registry.registerTool(newTool);
        const foundTool = registry.getTool('find-tool');
        chai_1.assert.isDefined(foundTool, '应该能找到工具');
        chai_1.assert.equal(foundTool.id, 'find-tool');
        chai_1.assert.equal(foundTool.name, '查找工具');
    });
    it('应该能按类别查找工具', () => {
        const tool1 = (0, EnhancedBaseTool_1.createEnhancedTool)({
            id: 'file-tool',
            name: '文件工具',
            description: '文件类别工具',
            category: Tool_1.ToolCategory.FILE,
            execute: async () => '文件结果'
        });
        const tool2 = (0, EnhancedBaseTool_1.createEnhancedTool)({
            id: 'code-tool',
            name: '代码工具',
            description: '代码类别工具',
            category: Tool_1.ToolCategory.CODE,
            execute: async () => '代码结果'
        });
        const registry = new EnhancedToolRegistry_1.EnhancedToolRegistry();
        registry.registerTool(tool1.getNewToolInstance(), [Tool_1.ToolCategory.FILE]);
        registry.registerTool(tool2.getNewToolInstance(), [Tool_1.ToolCategory.CODE]);
        const fileTools = registry.getToolsByCategory(Tool_1.ToolCategory.FILE);
        const codeTools = registry.getToolsByCategory(Tool_1.ToolCategory.CODE);
        chai_1.assert.equal(fileTools.length, 1);
        chai_1.assert.equal(fileTools[0].id, 'file-tool');
        chai_1.assert.equal(codeTools.length, 1);
        chai_1.assert.equal(codeTools[0].id, 'code-tool');
    });
    it('增强工具应该支持新旧接口', () => {
        class TestEnhancedTool extends EnhancedBaseTool_1.EnhancedBaseTool {
            id = 'dual-interface-tool';
            name = '双接口工具';
            description = '同时支持新旧接口的工具';
            version = '1.0.0';
            author = '测试作者';
            category = Tool_1.ToolCategory.OTHER;
            async executeCore(input, context) {
                return input.value * 2;
            }
        }
        const tool = new TestEnhancedTool();
        // 测试兼容性报告
        const report = tool.getCompatibilityReport();
        chai_1.assert.isTrue(report.supportsNewInterface);
        chai_1.assert.isTrue(report.supportsOldInterface);
        // 测试获取新旧接口实例
        const newTool = tool.getNewToolInstance();
        const oldTool = tool.getOldToolInstance();
        chai_1.assert.equal(newTool.id, 'dual-interface-tool');
        chai_1.assert.equal(oldTool.id, 'dual-interface-tool');
    });
});
//# sourceMappingURL=SimpleIntegration.test.js.map