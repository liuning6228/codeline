"use strict";
/**
 * PermissionDecisionEngine单元测试
 * 测试Claude Code三层权限架构的决策引擎
 */
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const PermissionDecisionEngine_1 = require("../../../src/core/tool/permission/PermissionDecisionEngine");
const PermissionTypes_1 = require("../../../src/core/tool/permission/PermissionTypes");
describe('PermissionDecisionEngine', () => {
    let engine;
    beforeEach(() => {
        engine = new PermissionDecisionEngine_1.PermissionDecisionEngine({
            conflictResolutionStrategy: PermissionDecisionEngine_1.ConflictResolutionStrategy.HIGHEST_PRIORITY,
            enableCaching: false, // 测试时禁用缓存
            logDetailedEvaluation: false
        });
    });
    afterEach(() => {
        engine.clearCache();
    });
    describe('基本功能', () => {
        it('应创建决策引擎实例', () => {
            chai_1.assert.exists(engine);
            chai_1.assert.instanceOf(engine, PermissionDecisionEngine_1.PermissionDecisionEngine);
        });
        it('应评估没有规则的权限请求', async () => {
            const context = {
                toolId: 'test-tool',
                toolName: '测试工具',
                input: { action: 'read' },
                permissionContext: {
                    mode: 'default',
                    alwaysAllowRules: {},
                    alwaysDenyRules: {},
                    alwaysAskRules: {},
                    isBypassPermissionsModeAvailable: false,
                    systemRules: [],
                    userRules: [],
                    sessionRules: [],
                    defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ
                }
            };
            const decision = await engine.evaluate(context);
            chai_1.assert.isDefined(decision);
            chai_1.assert.isTrue(decision.allowed);
            chai_1.assert.isTrue(decision.requiresUserConfirmation);
            chai_1.assert.include(decision.reason || '', '没有匹配的权限规则');
            chai_1.assert.equal(decision.level, PermissionTypes_1.EnhancedPermissionLevel.READ);
        });
        it('应评估允许规则', async () => {
            const now = new Date();
            const permissionContext = {
                mode: 'default',
                alwaysAllowRules: {},
                alwaysDenyRules: {},
                alwaysAskRules: {},
                isBypassPermissionsModeAvailable: false,
                systemRules: [
                    {
                        id: 'allow-test',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'allow',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.SYSTEM,
                        priority: 100,
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                userRules: [],
                sessionRules: [],
                defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ
            };
            const context = {
                toolId: 'test-tool',
                toolName: '测试工具',
                input: { action: 'read' },
                permissionContext
            };
            const decision = await engine.evaluate(context);
            chai_1.assert.isTrue(decision.allowed);
            chai_1.assert.isFalse(decision.requiresUserConfirmation);
            chai_1.assert.include(decision.reason || '', '允许执行');
            chai_1.assert.equal(decision.appliedRuleIds.length, 1);
            chai_1.assert.include(decision.appliedRuleIds[0], 'allow-test');
        });
        it('应评估拒绝规则', async () => {
            const now = new Date();
            const permissionContext = {
                mode: 'default',
                alwaysAllowRules: {},
                alwaysDenyRules: {},
                alwaysAskRules: {},
                isBypassPermissionsModeAvailable: false,
                systemRules: [
                    {
                        id: 'deny-test',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'deny',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.SYSTEM,
                        priority: 100,
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                userRules: [],
                sessionRules: [],
                defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ
            };
            const context = {
                toolId: 'test-tool',
                toolName: '测试工具',
                input: { action: 'write' },
                permissionContext
            };
            const decision = await engine.evaluate(context);
            chai_1.assert.isFalse(decision.allowed);
            chai_1.assert.isFalse(decision.requiresUserConfirmation);
            chai_1.assert.include(decision.reason || '', '拒绝执行');
            chai_1.assert.equal(decision.appliedRuleIds.length, 1);
            chai_1.assert.include(decision.appliedRuleIds[0], 'deny-test');
        });
        it('应评估询问规则', async () => {
            const now = new Date();
            const permissionContext = {
                mode: 'default',
                alwaysAllowRules: {},
                alwaysDenyRules: {},
                alwaysAskRules: {},
                isBypassPermissionsModeAvailable: false,
                systemRules: [
                    {
                        id: 'ask-test',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'ask',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.SYSTEM,
                        priority: 100,
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                userRules: [],
                sessionRules: [],
                defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ
            };
            const context = {
                toolId: 'test-tool',
                toolName: '测试工具',
                input: { action: 'write' },
                permissionContext
            };
            const decision = await engine.evaluate(context);
            chai_1.assert.isTrue(decision.allowed); // 询问规则允许执行，但需要确认
            chai_1.assert.isTrue(decision.requiresUserConfirmation);
            chai_1.assert.include(decision.reason || '', '要求用户确认');
            chai_1.assert.equal(decision.appliedRuleIds.length, 1);
            chai_1.assert.include(decision.appliedRuleIds[0], 'ask-test');
        });
    });
    describe('冲突解决策略', () => {
        it('应使用最高优先级策略解决冲突', async () => {
            const now = new Date();
            const permissionContext = {
                mode: 'default',
                alwaysAllowRules: {},
                alwaysDenyRules: {},
                alwaysAskRules: {},
                isBypassPermissionsModeAvailable: false,
                systemRules: [
                    {
                        id: 'low-priority-allow',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'allow',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.SYSTEM,
                        priority: 50,
                        createdAt: now,
                        updatedAt: now
                    },
                    {
                        id: 'high-priority-deny',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'deny',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.SYSTEM,
                        priority: 100,
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                userRules: [],
                sessionRules: [],
                defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ
            };
            const context = {
                toolId: 'test-tool',
                toolName: '测试工具',
                input: { action: 'execute' },
                permissionContext
            };
            // 使用最高优先级策略（默认）
            engine = new PermissionDecisionEngine_1.PermissionDecisionEngine({
                conflictResolutionStrategy: PermissionDecisionEngine_1.ConflictResolutionStrategy.HIGHEST_PRIORITY
            });
            const decision = await engine.evaluate(context);
            chai_1.assert.isFalse(decision.allowed); // 高优先级的deny应胜出
            chai_1.assert.include(decision.appliedRuleIds[0], 'high-priority-deny');
        });
        it('应使用最严格策略解决冲突', async () => {
            const now = new Date();
            const permissionContext = {
                mode: 'default',
                alwaysAllowRules: {},
                alwaysDenyRules: {},
                alwaysAskRules: {},
                isBypassPermissionsModeAvailable: false,
                systemRules: [
                    {
                        id: 'allow-rule',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'allow',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.SYSTEM,
                        priority: 80,
                        createdAt: now,
                        updatedAt: now
                    },
                    {
                        id: 'deny-rule',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'deny',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.SYSTEM,
                        priority: 70,
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                userRules: [],
                sessionRules: [],
                defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ
            };
            const context = {
                toolId: 'test-tool',
                toolName: '测试工具',
                input: { action: 'execute' },
                permissionContext
            };
            engine = new PermissionDecisionEngine_1.PermissionDecisionEngine({
                conflictResolutionStrategy: PermissionDecisionEngine_1.ConflictResolutionStrategy.MOST_RESTRICTIVE
            });
            const decision = await engine.evaluate(context);
            chai_1.assert.isFalse(decision.allowed); // 最严格的deny应胜出
            chai_1.assert.include(decision.appliedRuleIds[0], 'deny-rule');
        });
        it('应使用按来源策略解决冲突', async () => {
            const now = new Date();
            const permissionContext = {
                mode: 'default',
                alwaysAllowRules: {},
                alwaysDenyRules: {},
                alwaysAskRules: {},
                isBypassPermissionsModeAvailable: false,
                systemRules: [
                    {
                        id: 'system-deny',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'deny',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.SYSTEM,
                        priority: 50,
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                userRules: [
                    {
                        id: 'user-allow',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'allow',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.USER,
                        priority: 100, // 用户规则优先级更高，但来源优先级低
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                sessionRules: [],
                defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ
            };
            const context = {
                toolId: 'test-tool',
                toolName: '测试工具',
                input: { action: 'execute' },
                permissionContext
            };
            engine = new PermissionDecisionEngine_1.PermissionDecisionEngine({
                conflictResolutionStrategy: PermissionDecisionEngine_1.ConflictResolutionStrategy.BY_SOURCE
            });
            const decision = await engine.evaluate(context);
            chai_1.assert.isFalse(decision.allowed); // 系统级规则应胜出（SYSTEM > USER）
            chai_1.assert.include(decision.appliedRuleIds[0], 'system-deny');
        });
    });
    describe('缓存功能', () => {
        it('应缓存决策结果', async () => {
            engine = new PermissionDecisionEngine_1.PermissionDecisionEngine({
                enableCaching: true,
                cacheTTL: 5000 // 5秒
            });
            const now = new Date();
            const permissionContext = {
                mode: 'default',
                alwaysAllowRules: {},
                alwaysDenyRules: {},
                alwaysAskRules: {},
                isBypassPermissionsModeAvailable: false,
                systemRules: [
                    {
                        id: 'cache-test',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'allow',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.SYSTEM,
                        priority: 100,
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                userRules: [],
                sessionRules: [],
                defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ
            };
            const context = {
                toolId: 'test-tool',
                toolName: '测试工具',
                input: { action: 'read' },
                permissionContext
            };
            // 第一次评估
            const decision1 = await engine.evaluate(context);
            // 第二次评估（应使用缓存）
            const decision2 = await engine.evaluate(context);
            chai_1.assert.deepEqual(decision1, decision2);
            // 注意：实际中可能需要检查缓存命中，但引擎不公开此信息
        });
        it('应在缓存过期后重新评估', async () => {
            engine = new PermissionDecisionEngine_1.PermissionDecisionEngine({
                enableCaching: true,
                cacheTTL: 100 // 100ms
            });
            const now = new Date();
            const permissionContext = {
                mode: 'default',
                alwaysAllowRules: {},
                alwaysDenyRules: {},
                alwaysAskRules: {},
                isBypassPermissionsModeAvailable: false,
                systemRules: [
                    {
                        id: 'cache-expire-test',
                        toolId: 'test-tool',
                        pattern: '*',
                        action: 'allow',
                        conditions: [],
                        source: PermissionTypes_1.PermissionSource.SYSTEM,
                        priority: 100,
                        createdAt: now,
                        updatedAt: now
                    }
                ],
                userRules: [],
                sessionRules: [],
                defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ
            };
            const context = {
                toolId: 'test-tool',
                toolName: '测试工具',
                input: { action: 'read' },
                permissionContext
            };
            // 第一次评估
            await engine.evaluate(context);
            // 等待缓存过期
            await new Promise(resolve => setTimeout(resolve, 150));
            // 清除缓存统计
            engine.clearCache();
            // 第二次评估（应重新评估）
            const decision2 = await engine.evaluate(context);
            chai_1.assert.isDefined(decision2);
            // 这里我们无法直接检查是否重新评估，但确保没有错误
        });
    });
    describe('向后兼容', () => {
        it('应转换遗留规则', async () => {
            const permissionContext = {
                mode: 'default',
                alwaysAllowRules: {
                    'system': [
                        {
                            id: 'legacy-allow',
                            toolId: 'test-tool',
                            pattern: '*',
                            action: 'allow',
                            conditions: [],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    ]
                },
                alwaysDenyRules: {},
                alwaysAskRules: {},
                isBypassPermissionsModeAvailable: false,
                systemRules: [],
                userRules: [],
                sessionRules: [],
                defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ
            };
            const context = {
                toolId: 'test-tool',
                toolName: '测试工具',
                input: { action: 'read' },
                permissionContext
            };
            const decision = await engine.evaluate(context);
            // 应识别并应用遗留规则
            chai_1.assert.isTrue(decision.allowed);
            chai_1.assert.equal(decision.appliedRuleIds.length, 1);
        });
    });
});
//# sourceMappingURL=PermissionDecisionEngine.test.js.map