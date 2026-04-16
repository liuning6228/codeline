/**
 * PermissionManager单元测试
 * 测试权限规则管理功能
 */

import { assert } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { PermissionManager } from '../../../src/core/tool/permission/PermissionManager';
import {
  PermissionSource,
  EnhancedPermissionLevel,
  EnhancedPermissionRule
} from '../../../src/core/tool/permission/PermissionTypes';

// 临时测试目录
const TEST_DIR = path.join(__dirname, '..', '..', '..', '..', '..', 'tmp-test-permissions');

describe('PermissionManager', () => {
  let manager: PermissionManager;

  beforeEach(() => {
    // 确保测试目录存在
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }

    manager = new PermissionManager({
      rulesDirectory: TEST_DIR,
      autoSave: false, // 测试时禁用自动保存
      enableValidation: true,
      logOperations: false
    });
  });

  afterEach(() => {
    // 清理测试目录
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('规则管理', () => {
    it('应添加规则', () => {
      const now = new Date();
      const rule: Omit<EnhancedPermissionRule, 'source'> = {
        id: 'test-add-rule',
        toolId: 'test-tool',
        pattern: '*',
        action: 'allow',
        conditions: [],
        priority: 50,
        createdAt: now,
        updatedAt: now
      };

      const result = manager.addRule({
        ...rule,
        source: PermissionSource.USER
      });

      assert.isTrue(result);
      
      const retrievedRule = manager.getRule('test-add-rule');
      assert.exists(retrievedRule);
      assert.equal(retrievedRule!.id, 'test-add-rule');
      assert.equal(retrievedRule!.toolId, 'test-tool');
      assert.equal(retrievedRule!.source, PermissionSource.USER);
    });

    it('应拒绝重复ID的规则', () => {
      const now = new Date();
      const rule1: EnhancedPermissionRule = {
        id: 'duplicate-id',
        toolId: 'tool-1',
        pattern: '*',
        action: 'allow',
        conditions: [],
        source: PermissionSource.USER,
        priority: 50,
        createdAt: now,
        updatedAt: now
      };

      const rule2: EnhancedPermissionRule = {
        id: 'duplicate-id', // 相同ID
        toolId: 'tool-2',
        pattern: '*',
        action: 'deny',
        conditions: [],
        source: PermissionSource.SYSTEM,
        priority: 100,
        createdAt: now,
        updatedAt: now
      };

      const result1 = manager.addRule(rule1);
      const result2 = manager.addRule(rule2);

      assert.isTrue(result1);
      assert.isFalse(result2); // 应拒绝重复ID
    });

    it('应验证规则', () => {
      const now = new Date();
      // 无效规则：缺少必需字段
      const invalidRule: EnhancedPermissionRule = {
        id: '', // 空ID
        toolId: 'test-tool',
        pattern: '*',
        action: 'allow' as any,
        conditions: [],
        source: PermissionSource.USER,
        priority: 50,
        createdAt: now,
        updatedAt: now
      };

      // 移除id以测试验证
      delete (invalidRule as any).id;

      // 使用addRule会调用验证
      const result = manager.addRule(invalidRule as EnhancedPermissionRule);
      assert.isFalse(result);
    });

    it('应更新规则', () => {
      const now = new Date();
      const originalRule: EnhancedPermissionRule = {
        id: 'test-update-rule',
        toolId: 'original-tool',
        pattern: '*',
        action: 'allow',
        conditions: [],
        source: PermissionSource.USER,
        priority: 50,
        createdAt: now,
        updatedAt: now
      };

      manager.addRule(originalRule);

      const updates: Partial<EnhancedPermissionRule> = {
        toolId: 'updated-tool',
        action: 'deny',
        priority: 75
      };

      const result = manager.updateRule('test-update-rule', updates);
      assert.isTrue(result);

      const updatedRule = manager.getRule('test-update-rule');
      assert.exists(updatedRule);
      assert.equal(updatedRule!.toolId, 'updated-tool');
      assert.equal(updatedRule!.action, 'deny');
      assert.equal(updatedRule!.priority, 75);
      assert.equal(updatedRule!.source, PermissionSource.USER); // 来源不变
    });

    it('应删除规则', () => {
      const now = new Date();
      const rule: EnhancedPermissionRule = {
        id: 'test-delete-rule',
        toolId: 'test-tool',
        pattern: '*',
        action: 'allow',
        conditions: [],
        source: PermissionSource.USER,
        priority: 50,
        createdAt: now,
        updatedAt: now
      };

      manager.addRule(rule);

      const beforeDelete = manager.getRule('test-delete-rule');
      assert.exists(beforeDelete);

      const result = manager.removeRule('test-delete-rule');
      assert.isTrue(result);

      const afterDelete = manager.getRule('test-delete-rule');
      assert.notExists(afterDelete);
    });

    it('应获取规则列表', () => {
      const now = new Date();
      const rules: EnhancedPermissionRule[] = [
        {
          id: 'rule-1',
          toolId: 'tool-a',
          pattern: '*',
          action: 'allow',
          conditions: [],
          source: PermissionSource.SYSTEM,
          priority: 100,
          createdAt: now,
          updatedAt: now,
          metadata: { enabled: true }
        },
        {
          id: 'rule-2',
          toolId: 'tool-b',
          pattern: '*',
          action: 'deny',
          conditions: [],
          source: PermissionSource.USER,
          priority: 50,
          createdAt: now,
          updatedAt: now,
          metadata: { enabled: true }
        },
        {
          id: 'rule-3',
          toolId: 'tool-a',
          pattern: '*',
          action: 'ask',
          conditions: [],
          source: PermissionSource.SESSION,
          priority: 10,
          createdAt: now,
          updatedAt: now,
          metadata: { enabled: false }
        }
      ];

      rules.forEach(rule => manager.addRule(rule));

      // 获取所有规则
      const allRules = manager.getRules();
      assert.equal(allRules.length, 3);

      // 按来源过滤
      const systemRules = manager.getRules({ source: PermissionSource.SYSTEM });
      assert.equal(systemRules.length, 1);
      assert.equal(systemRules[0].id, 'rule-1');

      // 按工具ID过滤
      const toolARules = manager.getRules({ toolId: 'tool-a' });
      assert.equal(toolARules.length, 2);

      // 按动作过滤
      const allowRules = manager.getRules({ action: 'allow' });
      assert.equal(allowRules.length, 1);

      // 按启用状态过滤
      const enabledRules = manager.getRules({ enabled: true });
      assert.equal(enabledRules.length, 2);
    });

    it('应按来源获取规则', () => {
      const now = new Date();
      const systemRule: EnhancedPermissionRule = {
        id: 'system-rule',
        toolId: 'test-tool',
        pattern: '*',
        action: 'allow',
        conditions: [],
        source: PermissionSource.SYSTEM,
        priority: 100,
        createdAt: now,
        updatedAt: now
      };

      const userRule: EnhancedPermissionRule = {
        id: 'user-rule',
        toolId: 'test-tool',
        pattern: '*',
        action: 'deny',
        conditions: [],
        source: PermissionSource.USER,
        priority: 50,
        createdAt: now,
        updatedAt: now
      };

      manager.addRule(systemRule);
      manager.addRule(userRule);

      const systemRules = manager.getRulesBySource(PermissionSource.SYSTEM);
      const userRules = manager.getRulesBySource(PermissionSource.USER);
      const sessionRules = manager.getRulesBySource(PermissionSource.SESSION);

      assert.equal(systemRules.length, 1);
      assert.equal(userRules.length, 1);
      assert.equal(sessionRules.length, 0);
    });
  });

  describe('导入导出', () => {
    it('应导入规则', () => {
      const now = new Date();
      const rulesToImport: EnhancedPermissionRule[] = [
        {
          id: 'import-1',
          toolId: 'tool-1',
          pattern: '*',
          action: 'allow',
          conditions: [],
          source: PermissionSource.SYSTEM,
          priority: 100,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'import-2',
          toolId: 'tool-2',
          pattern: '*',
          action: 'deny',
          conditions: [],
          source: PermissionSource.USER,
          priority: 50,
          createdAt: now,
          updatedAt: now
        },
        // 无效规则（用于测试失败情况）
        {
          id: '', // 无效：空ID
          toolId: 'tool-3',
          pattern: '*',
          action: 'allow' as any,
          conditions: [],
          source: PermissionSource.USER,
          priority: 50,
          createdAt: now,
          updatedAt: now
        }
      ];

      const result = manager.importRules(rulesToImport);

      assert.equal(result.successCount, 2);
      assert.equal(result.failureCount, 1);
      assert.equal(result.failures.length, 1);
      assert.include(result.failures[0].error, '规则验证失败');

      // 验证成功导入的规则
      const importedRule1 = manager.getRule('import-1');
      const importedRule2 = manager.getRule('import-2');

      assert.exists(importedRule1);
      assert.exists(importedRule2);
    });

    it('应导出规则', () => {
      const now = new Date();
      const rules: EnhancedPermissionRule[] = [
        {
          id: 'export-1',
          toolId: 'tool-a',
          pattern: '*',
          action: 'allow',
          conditions: [],
          source: PermissionSource.SYSTEM,
          priority: 100,
          createdAt: now,
          updatedAt: now,
          metadata: {
            description: '测试规则1',
            createdBy: 'test',
            createdAt: now,
            tags: ['test', 'export']
          }
        },
        {
          id: 'export-2',
          toolId: 'tool-b',
          pattern: '*',
          action: 'deny',
          conditions: [],
          source: PermissionSource.USER,
          priority: 50,
          createdAt: now,
          updatedAt: now,
          metadata: {
            description: '测试规则2',
            createdBy: 'test',
            createdAt: now,
            tags: ['test']
          }
        }
      ];

      rules.forEach(rule => manager.addRule(rule));

      // 导出所有规则（包含元数据）
      const exportedWithMetadata = manager.exportRules({ includeMetadata: true });
      assert.equal(exportedWithMetadata.length, 2);
      assert.exists(exportedWithMetadata[0].metadata);
      assert.exists(exportedWithMetadata[1].metadata);

      // 导出规则（不包含元数据）
      const exportedWithoutMetadata = manager.exportRules({ includeMetadata: false });
      assert.equal(exportedWithoutMetadata.length, 2);
      assert.notExists(exportedWithoutMetadata[0].metadata);
      assert.notExists(exportedWithoutMetadata[1].metadata);

      // 按来源导出
      const systemRules = manager.exportRules({ 
        sources: [PermissionSource.SYSTEM] 
      });
      assert.equal(systemRules.length, 1);
      assert.equal(systemRules[0].source, PermissionSource.SYSTEM);

      // 按规则ID导出
      const specificRules = manager.exportRules({ 
        ruleIds: ['export-1'] 
      });
      assert.equal(specificRules.length, 1);
      assert.equal(specificRules[0].id, 'export-1');
    });
  });

  describe('文件持久化', () => {
    it('应保存规则到文件', async () => {
      const now = new Date();
      const rule: EnhancedPermissionRule = {
        id: 'save-file-rule',
        toolId: 'test-tool',
        pattern: '*',
        action: 'allow',
        conditions: [],
        source: PermissionSource.USER,
        priority: 50,
        createdAt: now,
        updatedAt: now,
        metadata: {
          description: '测试保存到文件',
          createdBy: 'test',
          createdAt: now
        }
      };

      manager.addRule(rule);

      const testFilePath = path.join(TEST_DIR, 'test-rules.json');
      await manager.saveToFile(testFilePath);

      // 验证文件存在
      assert.isTrue(fs.existsSync(testFilePath));

      // 验证文件内容
      const fileContent = fs.readFileSync(testFilePath, 'utf-8');
      const parsed = JSON.parse(fileContent);

      assert.equal(parsed.version, '1.0.0');
      assert.exists(parsed.exportedAt);
      assert.isArray(parsed.rules);
      assert.equal(parsed.rules.length, 1);
      assert.equal(parsed.rules[0].id, 'save-file-rule');
    });

    it('应从文件加载规则', async () => {
      const now = new Date();
      const rulesData = {
        version: '1.0.0',
        exportedAt: now.toISOString(),
        rules: [
          {
            id: 'load-file-1',
            toolId: 'tool-1',
            pattern: '*',
            action: 'allow',
            conditions: [],
            source: PermissionSource.SYSTEM,
            priority: 100,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          },
          {
            id: 'load-file-2',
            toolId: 'tool-2',
            pattern: '*',
            action: 'deny',
            conditions: [],
            source: PermissionSource.USER,
            priority: 50,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          }
        ]
      };

      const testFilePath = path.join(TEST_DIR, 'load-rules.json');
      fs.writeFileSync(testFilePath, JSON.stringify(rulesData, null, 2), 'utf-8');

      // 创建新的manager并加载规则
      const newManager = new PermissionManager({
        rulesDirectory: TEST_DIR,
        autoSave: false,
        enableValidation: true,
        logOperations: false
      });

      await newManager.loadFromFile(testFilePath);

      const loadedRule1 = newManager.getRule('load-file-1');
      const loadedRule2 = newManager.getRule('load-file-2');

      assert.exists(loadedRule1);
      assert.exists(loadedRule2);
      assert.equal(loadedRule1!.toolId, 'tool-1');
      assert.equal(loadedRule2!.toolId, 'tool-2');
    });

    it('应处理文件不存在的情况', async () => {
      const nonExistentFile = path.join(TEST_DIR, 'non-existent.json');

      // 不应抛出错误
      await manager.loadFromFile(nonExistentFile);

      // 应加载默认规则
      const defaultRules = manager.getRules();
      assert.isAbove(defaultRules.length, 0);
    });
  });

  describe('统计信息', () => {
    it('应提供规则统计', () => {
      const now = new Date();
      const rules: EnhancedPermissionRule[] = [
        {
          id: 'stats-1',
          toolId: 'tool-a',
          pattern: '*',
          action: 'allow',
          conditions: [],
          source: PermissionSource.SYSTEM,
          priority: 100,
          createdAt: now,
          updatedAt: now,
          metadata: { enabled: true }
        },
        {
          id: 'stats-2',
          toolId: 'tool-b',
          pattern: '*',
          action: 'deny',
          conditions: [],
          source: PermissionSource.USER,
          priority: 50,
          createdAt: now,
          updatedAt: now,
          metadata: { enabled: true }
        },
        {
          id: 'stats-3',
          toolId: 'tool-c',
          pattern: '*',
          action: 'ask',
          conditions: [],
          source: PermissionSource.SESSION,
          priority: 10,
          createdAt: now,
          updatedAt: now,
          metadata: { enabled: false }
        }
      ];

      rules.forEach(rule => manager.addRule(rule));

      const stats = manager.getStats();

      assert.equal(stats.totalRules, 3);
      assert.equal(stats.bySource[PermissionSource.SYSTEM], 1);
      assert.equal(stats.bySource[PermissionSource.USER], 1);
      assert.equal(stats.bySource[PermissionSource.SESSION], 1);
      assert.equal(stats.byAction.allow, 1);
      assert.equal(stats.byAction.deny, 1);
      assert.equal(stats.byAction.ask, 1);
      assert.equal(stats.enabledRules, 2);
    });
  });
});