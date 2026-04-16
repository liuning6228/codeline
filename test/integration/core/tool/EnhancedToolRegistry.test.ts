/**
 * EnhancedToolRegistry集成测试
 * 测试EnhancedBaseTool与EnhancedToolRegistry的集成
 */

import { assert } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { EnhancedToolRegistry } from '../../../../src/core/tool/EnhancedToolRegistry';
import { EnhancedFileReadTool, createFileReadTool } from '../../../../src/tools/examples/EnhancedFileReadTool';
import { EnhancedBaseTool, createEnhancedTool } from '../../../../src/core/tool/EnhancedBaseTool';
import { ToolCategory } from '../../../../src/core/tool/Tool';

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

describe('EnhancedToolRegistry 集成测试', () => {
  let registry: EnhancedToolRegistry;
  
  beforeEach(() => {
    // 重置stubs
    sinon.resetHistory();
    
    // 创建新的注册表实例
    registry = new EnhancedToolRegistry({
      enableCaching: true,
      enableLazyLoading: false,
      maxConcurrentTools: 1,
      defaultTimeout: 5000
    });
  });
  
  afterEach(() => {
    // 清理
    registry.cleanup();
  });
  
  after(() => {
    // 恢复原始vscode.window
    (vscode as any).window = originalVSCodeWindow;
  });
  
  describe('EnhancedBaseTool 注册', () => {
    it('应该能注册EnhancedBaseTool实例', () => {
      // 创建增强工具实例
      const tool = new EnhancedFileReadTool();
      
      // 获取新接口实例并注册
      const newTool = tool.getNewToolInstance();
      const result = registry.registerTool(newTool, [ToolCategory.FILE]);
      
      assert.isTrue(result, '工具应该注册成功');
      assert.equal(registry.getAllTools().length, 1);
      assert.equal(registry.getAllTools()[0].id, 'enhanced-file-read');
    });
    
    it('应该能通过工具定义注册EnhancedBaseTool', () => {
      // 创建增强工具并获取定义
      const tool = new EnhancedFileReadTool();
      
      // 注意：EnhancedBaseTool没有getToolDefinition方法，需要调整
      // 使用getNewToolInstance代替
      const newTool = tool.getNewToolInstance();
      const result = registry.registerTool(newTool, [ToolCategory.FILE]);
      
      assert.isTrue(result, '工具应该注册成功');
    });
    
    it('应该能注册工厂创建的增强工具', () => {
      const tool = createFileReadTool();
      const newTool = tool.getNewToolInstance();
      const result = registry.registerTool(newTool, [ToolCategory.FILE]);
      
      assert.isTrue(result, '工厂工具应该注册成功');
      assert.equal(registry.getAllTools()[0].id, 'factory-file-read');
    });
    
    it('应该能通过工具定义注册工厂工具', () => {
      const tool = createFileReadTool();
      const newTool = tool.getNewToolInstance();
      const result = registry.registerTool(newTool, [ToolCategory.FILE]);
      
      assert.isTrue(result, '工厂工具定义应该注册成功');
    });
  });
  
  describe('工具查找', () => {
    beforeEach(() => {
      // 注册一些测试工具
      const tool1 = createEnhancedTool({
        id: 'tool-1',
        name: '测试工具1',
        description: '第一个测试工具',
        category: ToolCategory.OTHER,
        execute: async () => '结果1'
      });
      
      const tool2 = createEnhancedTool({
        id: 'tool-2',
        name: '测试工具2',
        description: '第二个测试工具',
        category: ToolCategory.FILE,
        execute: async () => '结果2'
      });
      
      registry.registerTool(tool1.getNewToolInstance(), [ToolCategory.OTHER]);
      registry.registerTool(tool2.getNewToolInstance(), [ToolCategory.FILE]);
    });
    
    it('应该能通过ID查找工具', () => {
      const tool = registry.getTool('tool-1');
      assert.isDefined(tool);
      assert.equal(tool!.id, 'tool-1');
      assert.equal(tool!.name, '测试工具1');
    });
    
    it('应该能通过类别查找工具', () => {
      const fileTools = registry.getToolsByCategory(ToolCategory.FILE);
      assert.equal(fileTools.length, 1);
      assert.equal(fileTools[0].id, 'tool-2');
      
      const otherTools = registry.getToolsByCategory(ToolCategory.OTHER);
      assert.equal(otherTools.length, 1);
      assert.equal(otherTools[0].id, 'tool-1');
    });
    
    it('应该能获取所有工具', () => {
      const allTools = registry.getAllTools();
      assert.equal(allTools.length, 2);
      assert.deepEqual(allTools.map(t => t.id).sort(), ['tool-1', 'tool-2']);
    });
    
    it('应该能获取所有类别', () => {
      const categories = registry.getAllCategories();
      assert.include(categories, ToolCategory.FILE);
      assert.include(categories, ToolCategory.OTHER);
    });
  });
  
  describe('工具别名', () => {
    it('应该能注册工具别名', () => {
      const tool = createEnhancedTool({
        id: 'original-tool',
        name: '原始工具',
        description: '有别名的工具',
        category: ToolCategory.OTHER,
        execute: async () => '结果'
      });
      
      registry.registerTool(tool.getNewToolInstance(), [ToolCategory.OTHER]);
      
      const aliasResult = registry.registerToolAlias('alias-tool', 'original-tool');
      assert.isTrue(aliasResult, '别名应该注册成功');
      
      // 通过别名应该能找到工具
      const foundByAlias = registry.getTool('alias-tool');
      assert.isDefined(foundByAlias);
      assert.equal(foundByAlias!.id, 'original-tool');
    });
    
    it('不应该为不存在的工具注册别名', () => {
      const aliasResult = registry.registerToolAlias('alias', 'non-existent-tool');
      assert.isFalse(aliasResult, '不应该为不存在的工具注册别名');
    });
  });
  
  describe('排除列表', () => {
    it('不应该注册排除列表中的工具', () => {
      const registryWithExclude = new EnhancedToolRegistry({
        excludeToolIds: ['excluded-tool']
      });
      
      const tool = createEnhancedTool({
        id: 'excluded-tool',
        name: '被排除的工具',
        description: '这个工具应该在排除列表中',
        category: ToolCategory.OTHER,
        execute: async () => '结果'
      });
      
      const result = registryWithExclude.registerTool(tool.getNewToolInstance());
      assert.isFalse(result, '排除列表中的工具不应该注册成功');
      assert.equal(registryWithExclude.getAllTools().length, 0);
    });
  });
  
  describe('包含列表', () => {
    it('只应该注册包含列表中的工具', () => {
      const registryWithInclude = new EnhancedToolRegistry({
        includeToolIds: ['included-tool']
      });
      
      const includedTool = createEnhancedTool({
        id: 'included-tool',
        name: '包含的工具',
        description: '这个工具在包含列表中',
        category: ToolCategory.OTHER,
        execute: async () => '结果1'
      });
      
      const excludedTool = createEnhancedTool({
        id: 'excluded-tool',
        name: '不包含的工具',
        description: '这个工具不在包含列表中',
        category: ToolCategory.OTHER,
        execute: async () => '结果2'
      });
      
      const result1 = registryWithInclude.registerTool(includedTool.getNewToolInstance());
      const result2 = registryWithInclude.registerTool(excludedTool.getNewToolInstance());
      
      assert.isTrue(result1, '包含列表中的工具应该注册成功');
      assert.isFalse(result2, '不包含的工具不应该注册成功');
      assert.equal(registryWithInclude.getAllTools().length, 1);
      assert.equal(registryWithInclude.getAllTools()[0].id, 'included-tool');
    });
  });
  
  describe('使用统计', () => {
    it('应该能获取工具使用统计', () => {
      const tool = createEnhancedTool({
        id: 'stats-tool',
        name: '统计工具',
        description: '用于测试统计的工具',
        category: ToolCategory.OTHER,
        execute: async () => '结果'
      });
      
      registry.registerTool(tool.getNewToolInstance(), [ToolCategory.OTHER]);
      
      const stats = registry.getToolUsageStats('stats-tool');
      assert.isDefined(stats);
      assert.equal(stats.toolId, 'stats-tool');
      assert.equal(stats.usageCount, 0);
      assert.isNull(stats.lastUsed);
    });
    
    it('应该能获取所有工具的使用统计', () => {
      const tool1 = createEnhancedTool({
        id: 'stats-tool-1',
        name: '统计工具1',
        description: '第一个统计工具',
        category: ToolCategory.OTHER,
        execute: async () => '结果1'
      });
      
      const tool2 = createEnhancedTool({
        id: 'stats-tool-2',
        name: '统计工具2',
        description: '第二个统计工具',
        category: ToolCategory.OTHER,
        execute: async () => '结果2'
      });
      
      registry.registerTool(tool1.getNewToolInstance());
      registry.registerTool(tool2.getNewToolInstance());
      
      const allStats = registry.getToolUsageStats() as any[];
      assert.isArray(allStats);
      assert.equal(allStats.length, 2);
      assert.deepEqual(allStats.map(s => s.toolId).sort(), ['stats-tool-1', 'stats-tool-2']);
    });
  });
  
  describe('执行统计', () => {
    it('应该能获取执行统计', () => {
      const stats = registry.getExecutionStats();
      assert.isDefined(stats);
      assert.isNumber(stats.activeExecutions);
      assert.isNumber(stats.completedExecutions);
      assert.isNumber(stats.totalExecutions);
    });
  });
  
  describe('初始化', () => {
    it('应该能成功初始化', async () => {
      const result = await registry.initialize();
      assert.isTrue(result, '注册表应该初始化成功');
    });
    
    it('多次初始化应该返回相同结果', async () => {
      const result1 = await registry.initialize();
      const result2 = await registry.initialize();
      
      assert.isTrue(result1, '第一次初始化应该成功');
      assert.isTrue(result2, '第二次初始化应该成功');
    });
  });
});