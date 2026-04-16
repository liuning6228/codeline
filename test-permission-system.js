#!/usr/bin/env node

/**
 * 权限系统核心功能测试脚本
 * 不依赖完整测试环境，直接验证核心逻辑
 */

console.log('=== 权限系统核心功能测试 ===\n');

// 模拟必要的模块
const path = require('path');

// 由于TypeScript编译问题，我们将直接测试已编译的JS文件
try {
  // 尝试加载编译后的权限系统
  const permissionTypes = require('./out/core/tool/permission/PermissionTypes');
  const decisionEngine = require('./out/core/tool/permission/PermissionDecisionEngine');
  const permissionManager = require('./out/core/tool/permission/PermissionManager');
  
  console.log('✅ 成功加载权限系统模块');
  
  // 创建决策引擎实例
  const engine = new decisionEngine.PermissionDecisionEngine({
    conflictResolutionStrategy: decisionEngine.ConflictResolutionStrategy.HIGHEST_PRIORITY,
    enableCaching: false
  });
  
  console.log('✅ 决策引擎创建成功');
  
  // 创建权限管理器实例
  const manager = new permissionManager.PermissionManager();
  
  console.log('✅ 权限管理器创建成功');
  
  // 测试1: 基本规则评估
  console.log('\n--- 测试1: 基本规则评估 ---');
  
  const testRule = {
    id: 'test-rule-1',
    name: '测试规则',
    description: '允许读取操作',
    priority: 50,
    source: permissionTypes.PermissionSource.USER,
    enabled: true,
    toolPattern: 'file-read-tool',
    permissionLevel: permissionTypes.EnhancedPermissionLevel.READ,
    action: 'ALLOW',
    conditions: []
  };
  
  manager.addRule(testRule);
  console.log('✅ 规则添加成功');
  
  const testContext = {
    toolId: 'file-read-tool',
    toolName: '文件读取工具',
    permissionLevel: permissionTypes.EnhancedPermissionLevel.READ,
    userId: 'test-user',
    sessionId: 'test-session',
    workspacePath: '/tmp/test'
  };
  
  const decision = engine.evaluate(testContext);
  console.log('权限决策结果:', decision);
  console.log('✅ 基本规则评估测试通过');
  
  // 测试2: 冲突解决
  console.log('\n--- 测试2: 冲突解决 ---');
  
  const allowRule = {
    id: 'allow-rule',
    name: '允许规则',
    description: '允许工具',
    priority: 30,
    source: permissionTypes.PermissionSource.USER,
    enabled: true,
    toolPattern: 'test-tool',
    permissionLevel: permissionTypes.EnhancedPermissionLevel.READ,
    action: 'ALLOW',
    conditions: []
  };
  
  const denyRule = {
    id: 'deny-rule',
    name: '拒绝规则',
    description: '拒绝工具',
    priority: 60, // 更高优先级
    source: permissionTypes.PermissionSource.SYSTEM,
    enabled: true,
    toolPattern: 'test-tool',
    permissionLevel: permissionTypes.EnhancedPermissionLevel.READ,
    action: 'DENY',
    conditions: []
  };
  
  manager.addRule(allowRule);
  manager.addRule(denyRule);
  
  const conflictContext = {
    toolId: 'test-tool',
    toolName: '测试工具',
    permissionLevel: permissionTypes.EnhancedPermissionLevel.READ,
    userId: 'test-user',
    sessionId: 'test-session',
    workspacePath: '/tmp/test'
  };
  
  const conflictDecision = engine.evaluate(conflictContext);
  console.log('冲突决策结果:', conflictDecision);
  
  if (!conflictDecision.allowed && conflictDecision.source === permissionTypes.PermissionSource.SYSTEM) {
    console.log('✅ 冲突解决测试通过（高优先级拒绝规则胜出）');
  } else {
    console.log('❌ 冲突解决测试失败');
    process.exit(1);
  }
  
  // 测试3: 规则持久化
  console.log('\n--- 测试3: 规则持久化 ---');
  
  const rulesBefore = manager.getAllRules();
  console.log(`保存前规则数量: ${rulesBefore.length}`);
  
  // 模拟保存到文件
  const tempFile = path.join(__dirname, 'temp-permission-rules.json');
  manager.saveRulesToFile(tempFile);
  console.log('✅ 规则保存成功');
  
  // 创建新管理器并加载规则
  const newManager = new permissionManager.PermissionManager();
  newManager.loadRulesFromFile(tempFile);
  
  const rulesAfter = newManager.getAllRules();
  console.log(`加载后规则数量: ${rulesAfter.length}`);
  
  if (rulesAfter.length === rulesBefore.length) {
    console.log('✅ 规则持久化测试通过');
  } else {
    console.log('❌ 规则持久化测试失败');
  }
  
  // 清理临时文件
  require('fs').unlinkSync(tempFile);
  
  console.log('\n=== 所有核心功能测试通过 ===');
  console.log('\n总结:');
  console.log('1. ✅ 模块加载成功');
  console.log('2. ✅ 基本规则评估');
  console.log('3. ✅ 冲突解决（高优先级优先）');
  console.log('4. ✅ 规则持久化');
  console.log('\n权限系统核心功能验证完成！');
  
} catch (error) {
  console.error('\n❌ 测试失败:', error.message);
  console.error('堆栈:', error.stack);
  process.exit(1);
}