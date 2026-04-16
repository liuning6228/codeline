/**
 * 权限系统集成测试
 * 测试PermissionIntegration与EnhancedBaseTool的集成
 */

import { assert } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { PermissionIntegration } from '../../../../../src/core/tool/permission/PermissionIntegration';
import { PermissionDecisionEngine, ConflictResolutionStrategy } from '../../../../../src/core/tool/permission/PermissionDecisionEngine';
import { PermissionManager } from '../../../../../src/core/tool/permission/PermissionManager';
import {
  PermissionSource,
  EnhancedPermissionLevel,
  EnhancedPermissionRule,
  PermissionEvaluationContext
} from '../../../../../src/core/tool/permission/PermissionTypes';
import { EnhancedFileReadTool } from '../../../../../src/tools/examples/EnhancedFileReadTool';

// 模拟vscode API
const mockOutputChannel = {
  appendLine: sinon.stub(),
  dispose: sinon.stub()
};

const mockWindow = {
  createOutputChannel: sinon.stub().returns(mockOutputChannel)
};

// 替换全局vscode.window
const originalVSCodeWindow = (vscode as any).window;
(vscode as any).window = mockWindow;

describe('权限系统集成测试', () => {
  let permissionIntegration: PermissionIntegration;
  let decisionEngine: PermissionDecisionEngine;
  let permissionManager: PermissionManager;
  
  beforeEach(() => {
    // 创建权限系统实例
    permissionIntegration = new PermissionIntegration({
      enabled: true,
      autoLoadRules: false, // 禁用自动加载，手动控制测试环境
      defaultConflictStrategy: ConflictResolutionStrategy.HIGHEST_PRIORITY
    });
    
    // 获取内部组件引用
    decisionEngine = (permissionIntegration as any).decisionEngine;
    permissionManager = (permissionIntegration as any).permissionManager;
    
    // 清除模拟调用
    sinon.resetHistory();
  });
  
  afterEach(() => {
    // 恢复原始vscode.window
    (vscode as any).window = originalVSCodeWindow;
  });
  
  it('应该正确初始化权限系统', () => {
    assert.isTrue(permissionIntegration['isInitialized'] === false, '初始化前应为false');
    
    // 模拟初始化
    permissionIntegration['initializeIfNeeded']();
    
    assert.isTrue(permissionIntegration['isInitialized'] === true, '初始化后应为true');
    assert.isDefined(decisionEngine, '决策引擎应被创建');
    assert.isDefined(permissionManager, '权限管理器应被创建');
  });
  
  it('应该评估基本权限决策', () => {
    // 创建测试工具
    const tool = new EnhancedFileReadTool();
    
    // 创建权限上下文
    const context: PermissionEvaluationContext = {
      toolId: 'test-tool',
      toolName: 'Test Tool',
      permissionLevel: EnhancedPermissionLevel.READ,
      userId: 'test-user',
      sessionId: 'test-session',
      workspacePath: '/tmp/test-workspace'
    };
    
    // 添加测试规则
    const rule: EnhancedPermissionRule = {
      id: 'test-rule',
      name: 'Test Rule',
      description: 'Allow all read operations',
      priority: 50,
      source: PermissionSource.USER,
      enabled: true,
      toolPattern: 'test-tool',
      permissionLevel: EnhancedPermissionLevel.READ,
      action: 'ALLOW',
      conditions: []
    };
    
    permissionManager.addRule(rule);
    
    // 评估权限
    const decision = decisionEngine.evaluate(context);
    
    assert.isDefined(decision, '应返回权限决策');
    assert.isTrue(decision.allowed, '应允许读取操作');
    assert.equal(decision.source, PermissionSource.USER, '决策来源应为用户');
  });
  
  it('应该处理权限冲突', () => {
    // 创建冲突规则：一个允许，一个拒绝
    const allowRule: EnhancedPermissionRule = {
      id: 'allow-rule',
      name: 'Allow Rule',
      description: 'Allow tool',
      priority: 30,
      source: PermissionSource.USER,
      enabled: true,
      toolPattern: 'test-tool',
      permissionLevel: EnhancedPermissionLevel.READ,
      action: 'ALLOW',
      conditions: []
    };
    
    const denyRule: EnhancedPermissionRule = {
      id: 'deny-rule',
      name: 'Deny Rule',
      description: 'Deny tool',
      priority: 60, // 更高优先级
      source: PermissionSource.SYSTEM,
      enabled: true,
      toolPattern: 'test-tool',
      permissionLevel: EnhancedPermissionLevel.READ,
      action: 'DENY',
      conditions: []
    };
    
    permissionManager.addRule(allowRule);
    permissionManager.addRule(denyRule);
    
    const context: PermissionEvaluationContext = {
      toolId: 'test-tool',
      toolName: 'Test Tool',
      permissionLevel: EnhancedPermissionLevel.READ,
      userId: 'test-user',
      sessionId: 'test-session',
      workspacePath: '/tmp/test-workspace'
    };
    
    const decision = decisionEngine.evaluate(context);
    
    // 高优先级规则应胜出
    assert.isFalse(decision.allowed, '高优先级的拒绝规则应胜出');
    assert.equal(decision.source, PermissionSource.SYSTEM, '决策来源应为系统');
  });
  
  it('应该集成到EnhancedBaseTool权限检查', async () => {
    // 创建测试工具
    const tool = new EnhancedFileReadTool();
    
    // 模拟工具使用上下文
    const toolUseContext = {
      userId: 'test-user',
      sessionId: 'test-session',
      workspaceUri: vscode.Uri.file('/tmp/test-workspace')
    };
    
    // 添加允许规则
    const rule: EnhancedPermissionRule = {
      id: 'allow-file-read',
      name: 'Allow File Read',
      description: 'Allow file read operations',
      priority: 50,
      source: PermissionSource.USER,
      enabled: true,
      toolPattern: 'file-read-tool',
      permissionLevel: EnhancedPermissionLevel.READ,
      action: 'ALLOW',
      conditions: []
    };
    
    permissionManager.addRule(rule);
    
    // 检查权限
    const result = await permissionIntegration.checkToolPermission(
      tool,
      EnhancedPermissionLevel.READ,
      toolUseContext
    );
    
    assert.isTrue(result.allowed, '应允许文件读取工具');
    assert.isTrue(result.fromEnhancedSystem, '应来自增强权限系统');
  });
  
  it('应该在增强系统失败时回退到基本权限检查', async () => {
    // 创建测试工具
    const tool = new EnhancedFileReadTool();
    
    // 禁用增强权限系统
    const disabledIntegration = new PermissionIntegration({
      enabled: false,
      autoLoadRules: false
    });
    
    const toolUseContext = {
      userId: 'test-user',
      sessionId: 'test-session',
      workspaceUri: vscode.Uri.file('/tmp/test-workspace')
    };
    
    const result = await disabledIntegration.checkToolPermission(
      tool,
      EnhancedPermissionLevel.READ,
      toolUseContext
    );
    
    assert.isTrue(result.allowed, '应允许操作（默认行为）');
    assert.isFalse(result.fromEnhancedSystem, '不应来自增强权限系统');
  });
});

describe('PermissionIntegration 向后兼容性测试', () => {
  it('应该支持传统PermissionContext', () => {
    const integration = new PermissionIntegration({ enabled: true });
    
    // 传统PermissionContext
    const legacyContext = {
      userId: 'test-user',
      workspacePath: '/tmp/test-workspace'
    };
    
    // 应能转换为EnhancedPermissionEvaluationContext
    const enhancedContext = integration['convertLegacyContext'](legacyContext, 'test-tool', EnhancedPermissionLevel.READ);
    
    assert.equal(enhancedContext.userId, 'test-user', '应保留用户ID');
    assert.equal(enhancedContext.workspacePath, '/tmp/test-workspace', '应保留工作空间路径');
    assert.equal(enhancedContext.toolId, 'test-tool', '应设置工具ID');
    assert.equal(enhancedContext.permissionLevel, EnhancedPermissionLevel.READ, '应设置权限级别');
  });
  
  it('应该与传统PermissionResult兼容', async () => {
    const integration = new PermissionIntegration({ enabled: true });
    
    const tool = new EnhancedFileReadTool();
    const toolUseContext = {
      userId: 'test-user',
      sessionId: 'test-session',
      workspaceUri: vscode.Uri.file('/tmp/test-workspace')
    };
    
    const result = await integration.checkToolPermission(
      tool,
      EnhancedPermissionLevel.READ,
      toolUseContext
    );
    
    // 检查传统PermissionResult结构
    assert.property(result, 'allowed', '应包含allowed属性');
    assert.property(result, 'reason', '应包含reason属性');
    assert.property(result, 'fromEnhancedSystem', '应包含fromEnhancedSystem属性');
    
    // 传统代码应能处理此结果
    if (result.allowed) {
      // 传统逻辑
      assert.isTrue(true, '传统代码应能检查allowed属性');
    }
  });
});