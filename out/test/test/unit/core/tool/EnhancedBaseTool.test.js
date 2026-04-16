"use strict";
/**
 * EnhancedBaseTool单元测试
 * 测试双接口兼容性的核心功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const EnhancedBaseTool_1 = require("../../../src/core/tool/EnhancedBaseTool");
const Tool_1 = require("../../../src/core/tool/Tool");
const ZodCompatibility_1 = require("../../../src/core/tool/ZodCompatibility");
// 模拟工具上下文
const mockContext = {
    workspaceRoot: '/test/workspace',
    cwd: '/test/workspace',
    extensionContext: undefined,
    outputChannel: undefined,
    sessionId: 'test-session',
    options: {
        autoExecute: false,
        requireApproval: true,
        timeout: 30000,
        validateParams: true
    }
};
// 模拟旧工具接口（用于适配测试）
const mockLegacyTool = {
    id: 'legacy-test-tool',
    name: '旧测试工具',
    description: '用于测试适配的旧工具',
    version: '1.0.0',
    author: '测试作者',
    capabilities: ['read-only', 'concurrency-safe'],
    parameterSchema: {
        message: {
            type: 'string',
            description: '要回显的消息',
            required: true
        }
    },
    isEnabled: () => true,
    isConcurrencySafe: () => true,
    isReadOnly: () => true,
    isDestructive: () => false,
    checkPermissions: async () => ({
        allowed: true,
        reason: '测试权限检查',
        requiresUserConfirmation: false
    }),
    validateParameters: async () => ({
        valid: true,
        error: undefined,
        sanitizedParams: undefined
    }),
    execute: async (params, context, onProgress) => ({
        success: true,
        output: `Echo: ${params.message}`,
        toolId: 'legacy-test-tool',
        duration: 10,
        timestamp: new Date()
    })
};
describe('EnhancedBaseTool', () => {
    describe('基础功能', () => {
        it('应该正确创建EnhancedBaseTool子类', () => {
            // 创建简单的增强工具
            class TestEnhancedTool extends EnhancedBaseTool_1.EnhancedBaseTool {
                id = 'test-enhanced-tool';
                name = '测试增强工具';
                description = '测试用增强工具';
                version = '1.0.0';
                author = '测试作者';
                category = Tool_1.ToolCategory.OTHER;
                async executeCore(input, context) {
                    return `处理完成: ${input.message}`;
                }
            }
            const tool = new TestEnhancedTool();
            chai_1.assert.equal(tool.id, 'test-enhanced-tool');
            chai_1.assert.equal(tool.name, '测试增强工具');
            chai_1.assert.equal(tool.category, Tool_1.ToolCategory.OTHER);
            chai_1.assert.isTrue(tool.getCompatibilityReport().supportsNewInterface);
            chai_1.assert.isTrue(tool.getCompatibilityReport().supportsOldInterface);
        });
        it('应该提供新旧接口实例', () => {
            class TestEnhancedTool extends EnhancedBaseTool_1.EnhancedBaseTool {
                id = 'test-enhanced-tool';
                name = '测试增强工具';
                description = '测试用增强工具';
                version = '1.0.0';
                author = '测试作者';
                category = Tool_1.ToolCategory.OTHER;
                async executeCore(input, context) {
                    return `处理完成: ${input.message}`;
                }
            }
            const tool = new TestEnhancedTool();
            const newTool = tool.getNewToolInstance();
            const oldTool = tool.getOldToolInstance();
            chai_1.assert.equal(newTool.id, 'test-enhanced-tool');
            chai_1.assert.equal(oldTool.id, 'test-enhanced-tool');
            chai_1.assert.isFunction(newTool.execute);
            chai_1.assert.isFunction(oldTool.execute);
        });
    });
    describe('工厂函数', () => {
        it('应该能通过createEnhancedTool创建工具', () => {
            const tool = (0, EnhancedBaseTool_1.createEnhancedTool)({
                id: 'factory-tool',
                name: '工厂工具',
                description: '通过工厂函数创建的工具',
                category: Tool_1.ToolCategory.OTHER,
                version: '1.0.0',
                author: '工厂作者',
                inputSchema: ZodCompatibility_1.z.object({
                    message: ZodCompatibility_1.z.string().describe('输入消息')
                }),
                capabilities: ['read-only'],
                execute: async (input, context) => `工厂处理: ${input.message}`
            });
            chai_1.assert.equal(tool.id, 'factory-tool');
            chai_1.assert.equal(tool.name, '工厂工具');
            chai_1.assert.isTrue(tool.getCompatibilityReport().supportsNewInterface);
        });
        it('应该支持自定义parameterSchema', () => {
            const tool = (0, EnhancedBaseTool_1.createEnhancedTool)({
                id: 'custom-schema-tool',
                name: '自定义schema工具',
                description: '支持自定义parameterSchema的工具',
                category: Tool_1.ToolCategory.OTHER,
                version: '1.0.0',
                author: '测试作者',
                parameterSchema: {
                    message: {
                        type: 'string',
                        description: '输入消息',
                        required: true
                    }
                },
                capabilities: ['read-only'],
                execute: async (input, context) => `处理: ${input.message}`
            });
            chai_1.assert.isDefined(tool.parameterSchema);
            chai_1.assert.equal(tool.parameterSchema?.message.type, 'string');
        });
    });
    describe('适配器函数', () => {
        it('应该能将旧工具适配为增强工具', () => {
            const adaptedTool = (0, EnhancedBaseTool_1.adaptLegacyTool)(mockLegacyTool);
            chai_1.assert.equal(adaptedTool.id, 'legacy-test-tool');
            chai_1.assert.equal(adaptedTool.name, '旧测试工具');
            chai_1.assert.isTrue(adaptedTool.getCompatibilityReport().supportsOldInterface);
            chai_1.assert.isTrue(adaptedTool.getCompatibilityReport().supportsNewInterface);
        });
        it('适配后的工具应该能正常执行', async () => {
            const adaptedTool = (0, EnhancedBaseTool_1.adaptLegacyTool)(mockLegacyTool);
            // 测试旧接口执行
            const oldResult = await adaptedTool.getOldToolInstance().execute({ message: '测试消息' }, mockContext, undefined);
            chai_1.assert.isTrue(oldResult.success);
            chai_1.assert.equal(oldResult.output, 'Echo: 测试消息');
        });
    });
    describe('验证功能', () => {
        it('应该能验证Zod schema', async () => {
            const tool = (0, EnhancedBaseTool_1.createEnhancedTool)({
                id: 'validation-tool',
                name: '验证工具',
                description: '测试Zod验证功能的工具',
                category: Tool_1.ToolCategory.OTHER,
                version: '1.0.0',
                author: '测试作者',
                inputSchema: ZodCompatibility_1.z.object({
                    count: ZodCompatibility_1.z.number().min(1).max(10).describe('数量，1-10之间')
                }),
                capabilities: ['read-only'],
                execute: async (input, context) => input.count * 2
            });
            // 测试新接口验证
            const validResult = await tool.validateParameters({ count: 5 }, mockContext);
            chai_1.assert.isTrue(validResult.valid);
            // 注意：当前ValidationResult接口没有data属性，所以不检查data
        });
        it('应该拒绝无效输入', async () => {
            const tool = (0, EnhancedBaseTool_1.createEnhancedTool)({
                id: 'validation-tool',
                name: '验证工具',
                description: '测试Zod验证功能的工具',
                category: Tool_1.ToolCategory.OTHER,
                version: '1.0.0',
                author: '测试作者',
                inputSchema: ZodCompatibility_1.z.object({
                    count: ZodCompatibility_1.z.number().min(1).max(10)
                }),
                capabilities: ['read-only'],
                execute: async (input, context) => input.count * 2
            });
            // 测试无效输入
            const invalidResult = await tool.validateParameters({ count: 0 }, mockContext);
            chai_1.assert.isFalse(invalidResult.valid);
            chai_1.assert.isDefined(invalidResult.errors);
            chai_1.assert.isTrue(invalidResult.errors.length > 0);
        });
    });
    describe('权限检查', () => {
        it('应该支持权限检查', async () => {
            const tool = (0, EnhancedBaseTool_1.createEnhancedTool)({
                id: 'permission-tool',
                name: '权限检查工具',
                description: '测试权限检查功能的工具',
                category: Tool_1.ToolCategory.OTHER,
                version: '1.0.0',
                author: '测试作者',
                inputSchema: ZodCompatibility_1.z.object({
                    action: ZodCompatibility_1.z.enum(['read', 'write', 'delete'])
                }),
                capabilities: ['read-only'],
                execute: async (input, context) => `执行: ${input.action}`,
                config: {
                    permissionLevel: 'strict'
                }
            });
            // 测试权限检查
            const permissionResult = await tool.checkPermissions({ action: 'read' }, mockContext);
            chai_1.assert.isDefined(permissionResult);
            // 默认权限检查应该通过
            chai_1.assert.isTrue(permissionResult.allowed || permissionResult.requiresUserConfirmation !== undefined);
        });
    });
    describe('兼容性报告', () => {
        it('应该生成正确的兼容性报告', () => {
            class TestTool extends EnhancedBaseTool_1.EnhancedBaseTool {
                id = 'test-tool';
                name = '测试工具';
                description = '测试工具';
                version = '1.0.0';
                author = '测试作者';
                category = Tool_1.ToolCategory.OTHER;
                async executeCore(input, context) {
                    return input.test;
                }
            }
            const tool = new TestTool();
            const report = tool.getCompatibilityReport();
            chai_1.assert.isTrue(report.supportsNewInterface);
            chai_1.assert.isTrue(report.supportsOldInterface);
            chai_1.assert.equal(report.migrationStatus, 'enhanced');
            chai_1.assert.isDefined(report.recommendations);
        });
    });
});
//# sourceMappingURL=EnhancedBaseTool.test.js.map