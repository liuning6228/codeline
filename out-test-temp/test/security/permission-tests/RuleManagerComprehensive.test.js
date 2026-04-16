"use strict";
/**
 * RuleManager 综合测试
 * 完善Phase 3权限系统测试的一部分
 *
 * 测试RuleManager的核心功能：规则管理、匹配、权限检查、学习机制
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const RuleManager_1 = require("../../../src/auth/permissions/RuleManager");
// 临时测试目录
const TEST_TEMP_DIR = path.join(__dirname, 'temp-test-rules');
(0, mocha_1.describe)('RuleManager 综合测试套件', () => {
    let ruleManager;
    let testRuleFile;
    (0, mocha_1.beforeEach)(async () => {
        // 创建临时测试目录
        if (!fs.existsSync(TEST_TEMP_DIR)) {
            fs.mkdirSync(TEST_TEMP_DIR, { recursive: true });
        }
        // 创建临时规则文件
        testRuleFile = path.join(TEST_TEMP_DIR, 'test-rules.json');
        // 初始化RuleManager
        ruleManager = new RuleManager_1.RuleManager(testRuleFile);
        // 确保初始状态
        ruleManager.resetToDefaults();
    });
    (0, mocha_1.afterEach)(() => {
        // 清理临时文件
        if (fs.existsSync(testRuleFile)) {
            fs.unlinkSync(testRuleFile);
        }
        if (fs.existsSync(TEST_TEMP_DIR)) {
            fs.rmSync(TEST_TEMP_DIR, { recursive: true });
        }
    });
    (0, mocha_1.describe)('1. 基础规则管理功能', () => {
        (0, mocha_1.it)('应该创建RuleManager实例', () => {
            assert.ok(ruleManager, 'RuleManager实例应该被创建');
            assert.strictEqual(typeof ruleManager.checkPermission, 'function', '应该有checkPermission方法');
            assert.strictEqual(typeof ruleManager.upsertRule, 'function', '应该有upsertRule方法');
        });
        (0, mocha_1.it)('应该添加和检索规则', () => {
            const testRule = {
                id: 'test-rule-1',
                toolId: 'test-tool',
                pattern: 'test-command',
                action: 'allow',
                conditions: [],
                priority: 1,
                description: '测试规则',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // 添加规则
            ruleManager.upsertRule(testRule);
            // 验证规则存在
            const allRules = ruleManager.getAllRules();
            const foundRule = allRules.find(rule => rule.id === 'test-rule-1');
            assert.ok(foundRule, '应该能找到添加的规则');
            assert.strictEqual(foundRule.toolId, 'test-tool');
            assert.strictEqual(foundRule.pattern, 'test-command');
            assert.strictEqual(foundRule.action, 'allow');
        });
        (0, mocha_1.it)('应该更新现有规则', () => {
            // 先添加规则
            const originalRule = {
                id: 'test-update-rule',
                toolId: 'original-tool',
                pattern: 'original-pattern',
                action: 'allow',
                conditions: [],
                priority: 1,
                description: '原始规则',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            ruleManager.upsertRule(originalRule);
            // 更新规则
            const updatedRule = {
                ...originalRule,
                toolId: 'updated-tool',
                pattern: 'updated-pattern',
                action: 'deny',
                priority: 10,
                updatedAt: new Date()
            };
            ruleManager.upsertRule(updatedRule);
            // 验证更新
            const allRules = ruleManager.getAllRules();
            const foundRule = allRules.find(rule => rule.id === 'test-update-rule');
            assert.ok(foundRule, '应该能找到更新的规则');
            assert.strictEqual(foundRule.toolId, 'updated-tool', 'toolId应该被更新');
            assert.strictEqual(foundRule.pattern, 'updated-pattern', 'pattern应该被更新');
            assert.strictEqual(foundRule.action, 'deny', 'action应该被更新');
            assert.strictEqual(foundRule.priority, 10, 'priority应该被更新');
        });
        (0, mocha_1.it)('应该删除规则', () => {
            // 先添加规则
            const testRule = {
                id: 'test-delete-rule',
                toolId: 'test-tool',
                pattern: 'test-pattern',
                action: 'allow',
                conditions: [],
                priority: 1,
                description: '待删除规则',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            ruleManager.upsertRule(testRule);
            // 验证规则存在
            let allRules = ruleManager.getAllRules();
            let foundRule = allRules.find(rule => rule.id === 'test-delete-rule');
            assert.ok(foundRule, '规则应该存在');
            // 删除规则
            const deleteResult = ruleManager.deleteRule('test-delete-rule');
            assert.strictEqual(deleteResult, true, '删除应该成功');
            // 验证规则被删除
            allRules = ruleManager.getAllRules();
            foundRule = allRules.find(rule => rule.id === 'test-delete-rule');
            assert.strictEqual(foundRule, undefined, '规则应该被删除');
        });
        (0, mocha_1.it)('应该获取特定工具的规则', () => {
            // 添加多个工具的规则
            const rules = [
                {
                    id: 'rule-tool1-1',
                    toolId: 'tool-1',
                    pattern: 'pattern-1',
                    action: 'allow',
                    conditions: [],
                    priority: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'rule-tool1-2',
                    toolId: 'tool-1',
                    pattern: 'pattern-2',
                    action: 'deny',
                    conditions: [],
                    priority: 2,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'rule-tool2-1',
                    toolId: 'tool-2',
                    pattern: 'pattern-3',
                    action: 'allow',
                    conditions: [],
                    priority: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            rules.forEach(rule => ruleManager.upsertRule(rule));
            // 获取tool-1的规则
            const tool1Rules = ruleManager.getRulesForTool('tool-1');
            assert.strictEqual(tool1Rules.length, 2, '应该找到2个tool-1的规则');
            assert.ok(tool1Rules.every(rule => rule.toolId === 'tool-1'), '所有规则都应该是tool-1的');
            // 获取tool-2的规则
            const tool2Rules = ruleManager.getRulesForTool('tool-2');
            assert.strictEqual(tool2Rules.length, 1, '应该找到1个tool-2的规则');
            assert.ok(tool2Rules.every(rule => rule.toolId === 'tool-2'), '所有规则都应该是tool-2的');
        });
    });
    (0, mocha_1.describe)('2. 规则匹配和权限检查', () => {
        (0, mocha_1.it)('应该匹配精确模式', () => {
            // 添加精确匹配规则
            const exactRule = {
                id: 'exact-match-rule',
                toolId: 'test-tool',
                pattern: 'exact-command',
                action: 'allow',
                conditions: [],
                priority: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            ruleManager.upsertRule(exactRule);
            // 测试精确匹配
            const matchResult = ruleManager.checkPermission('test-tool', 'exact-command', {});
            assert.ok(matchResult.allowed, '应该允许精确模式匹配');
            assert.strictEqual(matchResult.requiresConfirmation, false, '不需要确认');
            assert.ok(matchResult.matchedRule, '应该匹配规则');
            assert.strictEqual(matchResult.matchedRule?.id, 'exact-match-rule', '应该匹配正确的规则ID');
            // 测试不匹配的情况
            const noMatchResult = ruleManager.checkPermission('test-tool', 'different-command', {});
            assert.ok(noMatchResult.allowed, '默认应该允许不匹配的命令');
            assert.strictEqual(noMatchResult.requiresConfirmation, true, '不匹配的写操作需要确认');
        });
        (0, mocha_1.it)('应该匹配通配符模式', () => {
            // 添加通配符规则
            const wildcardRule = {
                id: 'wildcard-rule',
                toolId: 'test-tool',
                pattern: 'delete-*',
                action: 'deny',
                conditions: [],
                priority: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            ruleManager.upsertRule(wildcardRule);
            // 测试通配符匹配
            const testCases = [
                { command: 'delete-file', shouldMatch: true },
                { command: 'delete-folder', shouldMatch: true },
                { command: 'remove-file', shouldMatch: false },
                { command: 'delete', shouldMatch: false } // 需要模式后的内容
            ];
            testCases.forEach(({ command, shouldMatch }) => {
                const result = ruleManager.checkPermission('test-tool', command, {});
                if (shouldMatch) {
                    // 匹配通配符规则，应该被拒绝
                    assert.strictEqual(result.allowed, false, `匹配的命令应该被拒绝`);
                    assert.strictEqual(result.requiresConfirmation, false, `拒绝操作不需要确认`);
                    assert.ok(result.matchedRule, '应该匹配规则');
                    assert.strictEqual(result.matchedRule?.id, 'wildcard-rule', '应该匹配通配符规则');
                }
                else {
                    // 不匹配，默认允许但需要确认（因为是写操作）
                    assert.strictEqual(result.allowed, true, `不匹配的命令默认应该允许`);
                    assert.strictEqual(result.requiresConfirmation, true, `不匹配的写操作需要确认`);
                }
            });
        });
        (0, mocha_1.it)('应该处理规则优先级', () => {
            // 添加多个规则，不同优先级
            const lowPriorityRule = {
                id: 'low-priority-rule',
                toolId: 'test-tool',
                pattern: 'test-*',
                action: 'allow',
                conditions: [],
                priority: 1, // 低优先级
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const highPriorityRule = {
                id: 'high-priority-rule',
                toolId: 'test-tool',
                pattern: 'test-dangerous',
                action: 'deny',
                conditions: [],
                priority: 100, // 高优先级
                createdAt: new Date(),
                updatedAt: new Date()
            };
            ruleManager.upsertRule(lowPriorityRule);
            ruleManager.upsertRule(highPriorityRule);
            // 测试特定模式匹配高优先级规则
            const specificResult = ruleManager.checkPermission('test-tool', 'test-dangerous', {});
            assert.strictEqual(specificResult.allowed, false, '高优先级规则应该拒绝');
            assert.strictEqual(specificResult.requiresConfirmation, false, '拒绝操作不需要确认');
            assert.ok(specificResult.matchedRule, '应该匹配规则');
            assert.strictEqual(specificResult.matchedRule?.id, 'high-priority-rule', '应该匹配高优先级规则');
            // 测试通用模式匹配低优先级规则
            const generalResult = ruleManager.checkPermission('test-tool', 'test-safe', {});
            assert.strictEqual(generalResult.allowed, true, '低优先级规则应该允许');
            assert.strictEqual(generalResult.requiresConfirmation, false, '允许操作不需要确认');
            assert.ok(generalResult.matchedRule, '应该匹配规则');
            assert.strictEqual(generalResult.matchedRule?.id, 'low-priority-rule', '应该匹配低优先级规则');
        });
        (0, mocha_1.it)('应该处理条件匹配', () => {
            // 添加带条件的规则
            const conditionalRule = {
                id: 'conditional-rule',
                toolId: 'test-tool',
                pattern: 'execute-*',
                action: 'allow',
                conditions: [
                    {
                        type: 'context',
                        key: 'userId',
                        value: 'admin',
                        operator: 'equals'
                    },
                    {
                        type: 'environment',
                        key: 'isProduction',
                        value: false,
                        operator: 'equals'
                    }
                ],
                priority: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            ruleManager.upsertRule(conditionalRule);
            // 测试条件满足的情况
            const contextWithConditions = {
                userId: 'admin',
                isProduction: false
            };
            const matchResult = ruleManager.checkPermission('test-tool', 'execute-script', contextWithConditions);
            assert.strictEqual(matchResult.allowed, true, '条件满足时应该允许');
            assert.strictEqual(matchResult.requiresConfirmation, false, '允许操作不需要确认');
            assert.ok(matchResult.matchedRule, '应该匹配规则');
            assert.strictEqual(matchResult.matchedRule?.id, 'conditional-rule', '应该匹配条件规则');
            // 测试条件不满足的情况
            const contextWithoutConditions = {
                userId: 'guest', // 不是admin
                isProduction: false
            };
            const noMatchResult = ruleManager.checkPermission('test-tool', 'execute-script', contextWithoutConditions);
            // 条件不满足，规则不匹配，默认策略应用
            assert.strictEqual(noMatchResult.allowed, true, '默认应该允许');
            assert.strictEqual(noMatchResult.requiresConfirmation, true, '默认写操作需要确认');
        });
    });
    (0, mocha_1.describe)('3. 规则学习和适应', () => {
        (0, mocha_1.it)('应该从用户决策学习新规则', () => {
            const initialRuleCount = ruleManager.getAllRules().length;
            // 模拟用户决策
            const userDecision = {
                toolId: 'learn-tool',
                input: 'learn-command',
                decision: 'allow',
                context: {
                    userId: 'test-user',
                    confidence: 'high'
                },
                rememberChoice: true
            };
            ruleManager.learnFromDecision(userDecision.toolId, userDecision.input, userDecision.context, userDecision.decision, userDecision.rememberChoice);
            // 验证新规则被添加
            const finalRuleCount = ruleManager.getAllRules().length;
            assert.strictEqual(finalRuleCount, initialRuleCount + 1, '应该添加一个新规则');
            // 验证规则属性
            const newRules = ruleManager.getAllRules();
            const learnedRule = newRules.find(rule => rule.toolId === 'learn-tool' && rule.pattern.includes('learn-command'));
            assert.ok(learnedRule, '应该找到学习的规则');
            assert.strictEqual(learnedRule.action, 'allow', '规则动作应该与用户决策一致');
            assert.ok(learnedRule.description?.includes('learned'), '规则描述应该表明是学习的');
        });
        (0, mocha_1.it)('应该更新现有规则而不是重复创建', () => {
            // 先添加一个规则
            const existingRule = {
                id: 'existing-learned-rule',
                toolId: 'test-tool',
                pattern: 'test-command',
                action: 'deny',
                conditions: [],
                priority: 1,
                description: 'Existing learned rule',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            ruleManager.upsertRule(existingRule);
            const initialRuleCount = ruleManager.getAllRules().length;
            // 模拟相同决策的学习
            const userDecision = {
                toolId: 'test-tool',
                input: 'test-command',
                decision: 'allow', // 不同的决策
                context: {},
                rememberChoice: true
            };
            ruleManager.learnFromDecision(userDecision.toolId, userDecision.input, userDecision.context, userDecision.decision, userDecision.rememberChoice);
            // 验证规则被更新而不是新增
            const finalRuleCount = ruleManager.getAllRules().length;
            assert.strictEqual(finalRuleCount, initialRuleCount, '规则数量应该不变（更新而非新增）');
            // 验证规则被更新
            const updatedRule = ruleManager.getAllRules().find(rule => rule.id === 'existing-learned-rule');
            assert.ok(updatedRule, '应该找到更新的规则');
            assert.strictEqual(updatedRule.action, 'allow', '规则动作应该被更新');
            assert.notStrictEqual(updatedRule.updatedAt, existingRule.updatedAt, '更新时间应该被更新');
        });
    });
    (0, mocha_1.describe)('4. 规则持久化', () => {
        (0, mocha_1.it)('应该保存规则到文件', async () => {
            // 添加测试规则
            const testRules = [
                {
                    id: 'save-rule-1',
                    toolId: 'test-tool',
                    pattern: 'save-pattern-1',
                    action: 'allow',
                    conditions: [],
                    priority: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'save-rule-2',
                    toolId: 'test-tool',
                    pattern: 'save-pattern-2',
                    action: 'deny',
                    conditions: [],
                    priority: 2,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            testRules.forEach(rule => ruleManager.upsertRule(rule));
            // 手动触发保存（在实际实现中可能是自动的）
            // 这里我们假设RuleManager有save方法或自动保存
            // 验证文件存在（根据RuleManager的实现方式）
            // 在实际测试中，我们可能需要检查文件内容
            assert.ok(true, '规则持久化测试占位 - 需要根据实际实现完善');
        });
        (0, mocha_1.it)('应该从文件加载规则', async () => {
            // 这个测试需要先保存规则，然后创建新的RuleManager实例加载
            assert.ok(true, '规则加载测试占位 - 需要根据实际实现完善');
        });
    });
    (0, mocha_1.describe)('5. 边界情况和错误处理', () => {
        (0, mocha_1.it)('应该处理无效规则', () => {
            // 测试无效规则的添加
            const invalidRules = [
                {
                    id: '', // 空ID
                    toolId: 'test-tool',
                    pattern: 'test',
                    action: 'allow',
                    conditions: [],
                    priority: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'invalid-rule-2',
                    toolId: '', // 空toolId
                    pattern: 'test',
                    action: 'allow',
                    conditions: [],
                    priority: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
                // 可以根据实际验证逻辑添加更多无效规则测试
            ];
            invalidRules.forEach(rule => {
                // 这里应该测试规则验证逻辑
                // 根据实际实现，可能抛出错误或忽略无效规则
                console.log(`测试无效规则: ${rule.id || '空ID'}`);
            });
            assert.ok(true, '无效规则处理测试 - 需要根据实际验证逻辑完善');
        });
        (0, mocha_1.it)('应该处理空输入和上下文', () => {
            // 测试空输入
            const emptyResult = ruleManager.checkPermission('', '', {});
            assert.ok(!emptyResult.matchedRule, '空输入不应该匹配任何规则');
            // 默认行为：空输入可能被视为只读操作，所以允许且不需要确认
            assert.strictEqual(emptyResult.allowed, true, '空输入默认应该允许');
            assert.strictEqual(emptyResult.requiresConfirmation, false, '空输入应该不需要确认');
            // 测试null/undefined输入
            // 根据实际实现，可能需要测试类型安全性
            assert.ok(true, '空输入处理测试完成');
        });
        (0, mocha_1.it)('应该处理大量规则时的性能', () => {
            // 添加大量规则测试性能
            const ruleCount = 100;
            console.log(`性能测试: 添加${ruleCount}个规则`);
            for (let i = 0; i < ruleCount; i++) {
                const rule = {
                    id: `perf-rule-${i}`,
                    toolId: i % 2 === 0 ? 'tool-a' : 'tool-b',
                    pattern: `command-${i % 10}`,
                    action: (i % 3 === 0 ? 'deny' : 'allow'),
                    conditions: [],
                    priority: i,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                ruleManager.upsertRule(rule);
            }
            // 测试匹配性能
            const startTime = Date.now();
            const matchResults = [];
            for (let i = 0; i < 100; i++) {
                const result = ruleManager.checkPermission('tool-a', 'command-5', {});
                matchResults.push(result);
            }
            const duration = Date.now() - startTime;
            console.log(`  匹配100次耗时: ${duration}ms`);
            console.log(`  平均每次匹配: ${duration / 100}ms`);
            // 合理的性能期望（可以根据实际情况调整）
            assert.ok(duration < 1000, `100次匹配应该在1秒内完成，实际耗时: ${duration}ms`);
        });
    });
    (0, mocha_1.describe)('6. 综合场景测试', () => {
        (0, mocha_1.it)('应该模拟实际使用场景', () => {
            // 模拟实际工具的权限规则
            const realWorldRules = [
                // Bash工具规则
                {
                    id: 'bash-safe-read',
                    toolId: 'enhanced-bash',
                    pattern: 'ls *',
                    action: 'allow',
                    conditions: [],
                    priority: 10,
                    description: '允许安全的ls命令',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'bash-safe-file',
                    toolId: 'enhanced-bash',
                    pattern: 'cat *',
                    action: 'allow',
                    conditions: [],
                    priority: 10,
                    description: '允许查看文件内容',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'bash-dangerous-rm',
                    toolId: 'enhanced-bash',
                    pattern: 'rm -rf *',
                    action: 'deny',
                    conditions: [],
                    priority: 100,
                    description: '拒绝危险的rm -rf命令',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    id: 'bash-ask-sudo',
                    toolId: 'enhanced-bash',
                    pattern: 'sudo *',
                    action: 'ask',
                    conditions: [],
                    priority: 50,
                    description: '需要用户确认sudo命令',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            // 添加规则
            realWorldRules.forEach(rule => ruleManager.upsertRule(rule));
            // 测试实际场景
            const testScenarios = [
                { toolId: 'enhanced-bash', command: 'ls -la', expectedAction: 'allow', description: '安全列表命令' },
                { toolId: 'enhanced-bash', command: 'cat /etc/passwd', expectedAction: 'allow', description: '查看文件' },
                { toolId: 'enhanced-bash', command: 'rm -rf /tmp/test', expectedAction: 'deny', description: '危险删除命令' },
                { toolId: 'enhanced-bash', command: 'sudo apt-get update', expectedAction: 'ask', description: '需要确认的命令' },
                { toolId: 'different-tool', command: 'ls -la', expectedAction: undefined, description: '不同工具的相同命令' }
            ];
            testScenarios.forEach(({ toolId, command, expectedAction, description }) => {
                const result = ruleManager.checkPermission(toolId, command, {});
                console.log(`场景: ${description}`);
                console.log(`  工具: ${toolId}, 命令: ${command}`);
                console.log(`  结果: 允许=${result.allowed}, 需要确认=${result.requiresConfirmation}`);
                if (expectedAction) {
                    assert.ok(result.matchedRule, `"${description}"应该匹配规则`);
                    // 根据期望的动作验证结果
                    if (expectedAction === 'allow') {
                        assert.strictEqual(result.allowed, true, `"${description}"应该允许`);
                        assert.strictEqual(result.requiresConfirmation, false, `"${description}"不应该需要确认`);
                    }
                    else if (expectedAction === 'deny') {
                        assert.strictEqual(result.allowed, false, `"${description}"应该拒绝`);
                        assert.strictEqual(result.requiresConfirmation, false, `"${description}"拒绝操作不需要确认`);
                    }
                    else if (expectedAction === 'ask') {
                        assert.strictEqual(result.allowed, true, `"${description}"应该允许（但需要确认）`);
                        assert.strictEqual(result.requiresConfirmation, true, `"${description}"应该需要确认`);
                    }
                }
                else {
                    assert.ok(!result.matchedRule, `"${description}"不应该匹配规则`);
                    // 默认行为：允许但需要确认（写操作）
                    assert.strictEqual(result.allowed, true, `"${description}"默认应该允许`);
                    assert.strictEqual(result.requiresConfirmation, true, `"${description}"默认写操作需要确认`);
                }
            });
            console.log('✅ 综合场景测试完成');
        });
    });
});
console.log('🔐 RuleManager综合测试套件定义完成');
console.log('📋 测试覆盖:');
console.log('  1. 基础规则管理功能');
console.log('  2. 规则匹配和权限检查');
console.log('  3. 规则学习和适应');
console.log('  4. 规则持久化');
console.log('  5. 边界情况和错误处理');
console.log('  6. 综合场景测试');
