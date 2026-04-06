/**
 * 权限管理器测试
 */

import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { PermissionManager } from '../../auth/PermissionManager';
import { PermissionDialog } from '../../auth/ui/PermissionDialog';
import { CommandClassifier } from '../../auth/classifier/CommandClassifier';
import { RuleManager } from '../../auth/permissions/RuleManager';

describe('PermissionManager', () => {
  let permissionManager: PermissionManager;
  let sandbox: sinon.SinonSandbox;
  let mockDialog: any;
  let mockClassifier: any;
  let mockRuleManager: any;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Mock VS Code API
    sandbox.stub(vscode.window, 'createOutputChannel').returns({
      appendLine: sandbox.stub(),
      show: sandbox.stub(),
      dispose: sandbox.stub()
    } as any);
    
    // Mock PermissionDialog
    mockDialog = {
      showPermissionDialog: sandbox.stub(),
      showQuickConfirmation: sandbox.stub(),
      logPermissionDecision: sandbox.stub()
    };
    sandbox.stub(PermissionDialog, 'getInstance').returns(mockDialog as any);
    
    // Mock CommandClassifier
    mockClassifier = {
      classify: sandbox.stub()
    };
    sandbox.stub(CommandClassifier.prototype, 'constructor').returns(mockClassifier);
    
    // Mock RuleManager
    mockRuleManager = {
      getBestMatch: sandbox.stub(),
      learnFromDecision: sandbox.stub(),
      upsertRule: sandbox.stub(),
      exportRules: sandbox.stub().returns([]),
      resetToDefaults: sandbox.stub()
    };
    sandbox.stub(RuleManager.prototype, 'constructor').returns(mockRuleManager);
    
    permissionManager = PermissionManager.getInstance();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('初始化', () => {
    test('应该成功初始化', async () => {
      const result = await permissionManager.initialize();
      expect(result).toBe(true);
    });
  });

  describe('权限检查', () => {
    test('应该允许只读命令', async () => {
      const request = {
        toolId: 'bash',
        toolCategory: 'terminal',
        input: { command: 'ls -la' },
        context: {
          workspaceRoot: '/test/workspace',
          userId: 'test-user'
        }
      };

      const result = await permissionManager.checkToolPermission(request);
      expect(result.allowed).toBe(true);
      expect(result.requiresUserConfirmation).toBe(false);
    });

    test('应该拒绝危险命令', async () => {
      const request = {
        toolId: 'bash',
        toolCategory: 'terminal',
        input: { command: 'rm -rf /' },
        context: {
          workspaceRoot: '/test/workspace',
          userId: 'test-user'
        }
      };

      const result = await permissionManager.checkToolPermission(request);
      expect(result.allowed).toBe(false);
    });

    test('应该需要用户确认中等风险命令', async () => {
      const request = {
        toolId: 'bash',
        toolCategory: 'terminal',
        input: { command: 'rm -rf ./temp' },
        context: {
          workspaceRoot: '/test/workspace',
          userId: 'test-user'
        }
      };

      const result = await permissionManager.checkToolPermission(request);
      expect(result.allowed).toBe(true);
      expect(result.requiresUserConfirmation).toBe(true);
    });

    test('应该应用规则匹配', async () => {
      // Mock rule match
      const mockRuleManager = require('../../auth/permissions/RuleManager').RuleManager.mock.instances[0];
      mockRuleManager.getBestMatch.mockReturnValue({
        matched: true,
        rule: {
          id: 'test-rule',
          toolId: 'bash',
          pattern: 'rm -rf ./temp',
          action: 'allow',
          priority: 100
        },
        action: 'allow'
      });

      const request = {
        toolId: 'bash',
        toolCategory: 'terminal',
        input: { command: 'rm -rf ./temp' },
        context: {
          workspaceRoot: '/test/workspace',
          userId: 'test-user'
        }
      };

      const result = await permissionManager.checkToolPermission(request);
      expect(result.allowed).toBe(true);
      expect(result.requiresUserConfirmation).toBe(false);
    });
  });

  describe('用户确认', () => {
    test('应该处理用户允许', async () => {
      const request = {
        toolId: 'bash',
        toolCategory: 'terminal',
        input: { command: 'rm -rf ./temp' },
        context: {
          workspaceRoot: '/test/workspace',
          userId: 'test-user'
        }
      };

      const checkResult = {
        allowed: true,
        requiresUserConfirmation: true,
        confirmationPrompt: '确认执行命令?',
        riskLevel: 5
      };

      const mockDialogResult: PermissionDialogResult = {
        choice: 'allow',
        rememberChoice: false,
        feedback: '用户允许此次操作'
      };

      const mockDialog = require('../../auth/ui/PermissionDialog').PermissionDialog.getInstance();
      mockDialog.showPermissionDialog.mockResolvedValue(mockDialogResult);

      const result = await permissionManager.requestUserConfirmation(request, checkResult as any);
      expect(result.confirmed).toBe(true);
    });

    test('应该处理用户拒绝', async () => {
      const request = {
        toolId: 'bash',
        toolCategory: 'terminal',
        input: { command: 'rm -rf ./temp' },
        context: {
          workspaceRoot: '/test/workspace',
          userId: 'test-user'
        }
      };

      const checkResult = {
        allowed: true,
        requiresUserConfirmation: true,
        confirmationPrompt: '确认执行命令?',
        riskLevel: 5
      };

      const mockDialogResult: PermissionDialogResult = {
        choice: 'deny',
        rememberChoice: false,
        feedback: '用户拒绝此次操作'
      };

      const mockDialog = require('../../auth/ui/PermissionDialog').PermissionDialog.getInstance();
      mockDialog.showPermissionDialog.mockResolvedValue(mockDialogResult);

      const result = await permissionManager.requestUserConfirmation(request, checkResult as any);
      expect(result.confirmed).toBe(false);
    });

    test('应该创建规则当用户选择记住', async () => {
      const request = {
        toolId: 'bash',
        toolCategory: 'terminal',
        input: { command: 'rm -rf ./temp' },
        context: {
          workspaceRoot: '/test/workspace',
          userId: 'test-user'
        }
      };

      const checkResult = {
        allowed: true,
        requiresUserConfirmation: true,
        confirmationPrompt: '确认执行命令?',
        riskLevel: 5,
        learningSuggestions: [{
          type: 'exact' as const,
          pattern: 'bash:hash123',
          description: '总是允许此精确操作',
          riskLevel: 5
        }]
      };

      const mockDialogResult: PermissionDialogResult = {
        choice: 'allow',
        rememberChoice: true,
        ruleType: 'exact',
        rulePattern: 'bash:hash123',
        feedback: '用户选择总是允许此操作'
      };

      const mockDialog = require('../../auth/ui/PermissionDialog').PermissionDialog.getInstance();
      mockDialog.showPermissionDialog.mockResolvedValue(mockDialogResult);

      const result = await permissionManager.requestUserConfirmation(request, checkResult as any);
      expect(result.confirmed).toBe(true);
      expect(result.rememberChoice).toBe(true);
      expect(result.ruleCreated).toBeDefined();
    });
  });

  describe('批量权限检查', () => {
    test('应该处理批量请求', async () => {
      const requests = [
        {
          toolId: 'bash',
          toolCategory: 'terminal',
          input: { command: 'ls -la' },
          context: { workspaceRoot: '/test/workspace', userId: 'test-user' }
        },
        {
          toolId: 'bash',
          toolCategory: 'terminal',
          input: { command: 'rm -rf ./temp' },
          context: { workspaceRoot: '/test/workspace', userId: 'test-user' }
        }
      ];

      const results = await permissionManager.checkPermissionsBatch(requests);
      expect(results).toHaveLength(2);
      expect(results[0].allowed).toBe(true);
      expect(results[1].allowed).toBe(true);
    });
  });

  describe('配置管理', () => {
    test('应该更新配置', () => {
      const originalConfig = permissionManager.getConfig();
      
      permissionManager.updateConfig({
        defaultMode: 'always',
        riskThreshold: 9
      });

      const newConfig = permissionManager.getConfig();
      expect(newConfig.defaultMode).toBe('always');
      expect(newConfig.riskThreshold).toBe(9);
      
      // 其他配置应该保持不变
      expect(newConfig.enableClassifier).toBe(originalConfig.enableClassifier);
    });

    test('应该重置配置', () => {
      permissionManager.updateConfig({
        defaultMode: 'always',
        riskThreshold: 9
      });

      permissionManager.resetConfig();

      const config = permissionManager.getConfig();
      expect(config.defaultMode).toBe('auto');
      expect(config.riskThreshold).toBe(7);
    });
  });

  describe('规则管理', () => {
    test('应该导出规则', () => {
      const rules = permissionManager.exportRules();
      expect(Array.isArray(rules)).toBe(true);
    });

    test('应该导入规则', () => {
      const testRules = [
        {
          id: 'test-rule-1',
          toolId: 'bash',
          pattern: 'test-pattern',
          action: 'allow' as const,
          conditions: [],
          priority: 50,
          description: '测试规则',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      permissionManager.importRules(testRules);
      
      // 验证规则已导入
      const rules = permissionManager.exportRules();
      expect(rules.length).toBeGreaterThan(0);
    });

    test('应该清除所有规则', () => {
      permissionManager.clearRules();
      
      const rules = permissionManager.exportRules();
      // 应该只剩下默认规则
      expect(rules.length).toBeGreaterThan(0); // 默认规则应该还在
    });
  });
});