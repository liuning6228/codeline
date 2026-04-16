"use strict";
/**
 * 权限系统集成测试
 * 测试PermissionIntegration与EnhancedBaseTool的集成
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = __importStar(require("sinon"));
const vscode = __importStar(require("vscode"));
const PermissionIntegration_1 = require("../../../../../src/core/tool/permission/PermissionIntegration");
const PermissionDecisionEngine_1 = require("../../../../../src/core/tool/permission/PermissionDecisionEngine");
const PermissionTypes_1 = require("../../../../../src/core/tool/permission/PermissionTypes");
const EnhancedFileReadTool_1 = require("../../../../../src/tools/examples/EnhancedFileReadTool");
// 模拟vscode API
const mockOutputChannel = {
    appendLine: sinon.stub(),
    dispose: sinon.stub()
};
const mockWindow = {
    createOutputChannel: sinon.stub().returns(mockOutputChannel)
};
// 替换全局vscode.window
const originalVSCodeWindow = vscode.window;
vscode.window = mockWindow;
describe('权限系统集成测试', () => {
    let permissionIntegration;
    let decisionEngine;
    let permissionManager;
    beforeEach(() => {
        // 创建权限系统实例
        permissionIntegration = new PermissionIntegration_1.PermissionIntegration({
            enabled: true,
            autoLoadRules: false, // 禁用自动加载，手动控制测试环境
            defaultConflictStrategy: PermissionDecisionEngine_1.ConflictResolutionStrategy.HIGHEST_PRIORITY
        });
        // 获取内部组件引用
        decisionEngine = permissionIntegration.decisionEngine;
        permissionManager = permissionIntegration.permissionManager;
        // 清除模拟调用
        sinon.resetHistory();
    });
    afterEach(() => {
        // 恢复原始vscode.window
        vscode.window = originalVSCodeWindow;
    });
    it('应该正确初始化权限系统', () => {
        chai_1.assert.isTrue(permissionIntegration['isInitialized'] === false, '初始化前应为false');
        // 模拟初始化
        permissionIntegration['initializeIfNeeded']();
        chai_1.assert.isTrue(permissionIntegration['isInitialized'] === true, '初始化后应为true');
        chai_1.assert.isDefined(decisionEngine, '决策引擎应被创建');
        chai_1.assert.isDefined(permissionManager, '权限管理器应被创建');
    });
    it('应该评估基本权限决策', () => {
        // 创建测试工具
        const tool = new EnhancedFileReadTool_1.EnhancedFileReadTool();
        // 创建权限上下文
        const context = {
            toolId: 'test-tool',
            toolName: 'Test Tool',
            permissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ,
            userId: 'test-user',
            sessionId: 'test-session',
            workspacePath: '/tmp/test-workspace'
        };
        // 添加测试规则
        const rule = {
            id: 'test-rule',
            name: 'Test Rule',
            description: 'Allow all read operations',
            priority: 50,
            source: PermissionTypes_1.PermissionSource.USER,
            enabled: true,
            toolPattern: 'test-tool',
            permissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ,
            action: 'ALLOW',
            conditions: []
        };
        permissionManager.addRule(rule);
        // 评估权限
        const decision = decisionEngine.evaluate(context);
        chai_1.assert.isDefined(decision, '应返回权限决策');
        chai_1.assert.isTrue(decision.allowed, '应允许读取操作');
        chai_1.assert.equal(decision.source, PermissionTypes_1.PermissionSource.USER, '决策来源应为用户');
    });
    it('应该处理权限冲突', () => {
        // 创建冲突规则：一个允许，一个拒绝
        const allowRule = {
            id: 'allow-rule',
            name: 'Allow Rule',
            description: 'Allow tool',
            priority: 30,
            source: PermissionTypes_1.PermissionSource.USER,
            enabled: true,
            toolPattern: 'test-tool',
            permissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ,
            action: 'ALLOW',
            conditions: []
        };
        const denyRule = {
            id: 'deny-rule',
            name: 'Deny Rule',
            description: 'Deny tool',
            priority: 60, // 更高优先级
            source: PermissionTypes_1.PermissionSource.SYSTEM,
            enabled: true,
            toolPattern: 'test-tool',
            permissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ,
            action: 'DENY',
            conditions: []
        };
        permissionManager.addRule(allowRule);
        permissionManager.addRule(denyRule);
        const context = {
            toolId: 'test-tool',
            toolName: 'Test Tool',
            permissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ,
            userId: 'test-user',
            sessionId: 'test-session',
            workspacePath: '/tmp/test-workspace'
        };
        const decision = decisionEngine.evaluate(context);
        // 高优先级规则应胜出
        chai_1.assert.isFalse(decision.allowed, '高优先级的拒绝规则应胜出');
        chai_1.assert.equal(decision.source, PermissionTypes_1.PermissionSource.SYSTEM, '决策来源应为系统');
    });
    it('应该集成到EnhancedBaseTool权限检查', async () => {
        // 创建测试工具
        const tool = new EnhancedFileReadTool_1.EnhancedFileReadTool();
        // 模拟工具使用上下文
        const toolUseContext = {
            userId: 'test-user',
            sessionId: 'test-session',
            workspaceUri: vscode.Uri.file('/tmp/test-workspace')
        };
        // 添加允许规则
        const rule = {
            id: 'allow-file-read',
            name: 'Allow File Read',
            description: 'Allow file read operations',
            priority: 50,
            source: PermissionTypes_1.PermissionSource.USER,
            enabled: true,
            toolPattern: 'file-read-tool',
            permissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ,
            action: 'ALLOW',
            conditions: []
        };
        permissionManager.addRule(rule);
        // 检查权限
        const result = await permissionIntegration.checkToolPermission(tool, PermissionTypes_1.EnhancedPermissionLevel.READ, toolUseContext);
        chai_1.assert.isTrue(result.allowed, '应允许文件读取工具');
        chai_1.assert.isTrue(result.fromEnhancedSystem, '应来自增强权限系统');
    });
    it('应该在增强系统失败时回退到基本权限检查', async () => {
        // 创建测试工具
        const tool = new EnhancedFileReadTool_1.EnhancedFileReadTool();
        // 禁用增强权限系统
        const disabledIntegration = new PermissionIntegration_1.PermissionIntegration({
            enabled: false,
            autoLoadRules: false
        });
        const toolUseContext = {
            userId: 'test-user',
            sessionId: 'test-session',
            workspaceUri: vscode.Uri.file('/tmp/test-workspace')
        };
        const result = await disabledIntegration.checkToolPermission(tool, PermissionTypes_1.EnhancedPermissionLevel.READ, toolUseContext);
        chai_1.assert.isTrue(result.allowed, '应允许操作（默认行为）');
        chai_1.assert.isFalse(result.fromEnhancedSystem, '不应来自增强权限系统');
    });
});
describe('PermissionIntegration 向后兼容性测试', () => {
    it('应该支持传统PermissionContext', () => {
        const integration = new PermissionIntegration_1.PermissionIntegration({ enabled: true });
        // 传统PermissionContext
        const legacyContext = {
            userId: 'test-user',
            workspacePath: '/tmp/test-workspace'
        };
        // 应能转换为EnhancedPermissionEvaluationContext
        const enhancedContext = integration['convertLegacyContext'](legacyContext, 'test-tool', PermissionTypes_1.EnhancedPermissionLevel.READ);
        chai_1.assert.equal(enhancedContext.userId, 'test-user', '应保留用户ID');
        chai_1.assert.equal(enhancedContext.workspacePath, '/tmp/test-workspace', '应保留工作空间路径');
        chai_1.assert.equal(enhancedContext.toolId, 'test-tool', '应设置工具ID');
        chai_1.assert.equal(enhancedContext.permissionLevel, PermissionTypes_1.EnhancedPermissionLevel.READ, '应设置权限级别');
    });
    it('应该与传统PermissionResult兼容', async () => {
        const integration = new PermissionIntegration_1.PermissionIntegration({ enabled: true });
        const tool = new EnhancedFileReadTool_1.EnhancedFileReadTool();
        const toolUseContext = {
            userId: 'test-user',
            sessionId: 'test-session',
            workspaceUri: vscode.Uri.file('/tmp/test-workspace')
        };
        const result = await integration.checkToolPermission(tool, PermissionTypes_1.EnhancedPermissionLevel.READ, toolUseContext);
        // 检查传统PermissionResult结构
        chai_1.assert.property(result, 'allowed', '应包含allowed属性');
        chai_1.assert.property(result, 'reason', '应包含reason属性');
        chai_1.assert.property(result, 'fromEnhancedSystem', '应包含fromEnhancedSystem属性');
        // 传统代码应能处理此结果
        if (result.allowed) {
            // 传统逻辑
            chai_1.assert.isTrue(true, '传统代码应能检查allowed属性');
        }
    });
});
//# sourceMappingURL=PermissionSystem.test.js.map