/**
 * 简单集成测试
 * 测试EnhancedBaseTool与EnhancedToolRegistry的基本集成
 */

import { assert } from 'chai';
import { EnhancedToolRegistry } from '../../../../src/core/tool/EnhancedToolRegistry';
import { EnhancedBaseTool, createEnhancedTool } from '../../../../src/core/tool/EnhancedBaseTool';
import { ToolCategory } from '../../../../src/core/tool/Tool';

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
    const enhancedTool = createEnhancedTool({
      id: 'test-tool',
      name: '测试工具',
      description: '用于集成测试的工具',
      category: ToolCategory.OTHER,
      execute: async (input: { message: string }, context: any) => {
        return `处理: ${input.message}`;
      }
    });
    
    // 创建工具注册表
    const registry = new EnhancedToolRegistry();
    
    // 获取新接口实例并注册
    const newTool = enhancedTool.getNewToolInstance();
    const result = registry.registerTool(newTool, [ToolCategory.OTHER]);
    
    assert.isTrue(result, '工具应该成功注册');
    assert.equal(registry.getAllTools().length, 1);
    assert.equal(registry.getAllTools()[0].id, 'test-tool');
  });
  
  it('应该能通过ID查找注册的工具', () => {
    const enhancedTool = createEnhancedTool({
      id: 'find-tool',
      name: '查找工具',
      description: '用于测试查找功能的工具',
      category: ToolCategory.OTHER,
      execute: async (input: { query: string }, context: any) => {
        return `查询结果: ${input.query}`;
      }
    });
    
    const registry = new EnhancedToolRegistry();
    const newTool = enhancedTool.getNewToolInstance();
    registry.registerTool(newTool);
    
    const foundTool = registry.getTool('find-tool');
    assert.isDefined(foundTool, '应该能找到工具');
    assert.equal(foundTool!.id, 'find-tool');
    assert.equal(foundTool!.name, '查找工具');
  });
  
  it('应该能按类别查找工具', () => {
    const tool1 = createEnhancedTool({
      id: 'file-tool',
      name: '文件工具',
      description: '文件类别工具',
      category: ToolCategory.FILE,
      execute: async () => '文件结果'
    });
    
    const tool2 = createEnhancedTool({
      id: 'code-tool',
      name: '代码工具',
      description: '代码类别工具',
      category: ToolCategory.CODE,
      execute: async () => '代码结果'
    });
    
    const registry = new EnhancedToolRegistry();
    registry.registerTool(tool1.getNewToolInstance(), [ToolCategory.FILE]);
    registry.registerTool(tool2.getNewToolInstance(), [ToolCategory.CODE]);
    
    const fileTools = registry.getToolsByCategory(ToolCategory.FILE);
    const codeTools = registry.getToolsByCategory(ToolCategory.CODE);
    
    assert.equal(fileTools.length, 1);
    assert.equal(fileTools[0].id, 'file-tool');
    
    assert.equal(codeTools.length, 1);
    assert.equal(codeTools[0].id, 'code-tool');
  });
  
  it('增强工具应该支持新旧接口', () => {
    class TestEnhancedTool extends EnhancedBaseTool<{ value: number }, number> {
      readonly id = 'dual-interface-tool';
      readonly name = '双接口工具';
      readonly description = '同时支持新旧接口的工具';
      readonly version = '1.0.0';
      readonly author = '测试作者';
      readonly category = ToolCategory.OTHER;
      
      protected async executeCore(input: { value: number }, context: any): Promise<number> {
        return input.value * 2;
      }
    }
    
    const tool = new TestEnhancedTool();
    
    // 测试兼容性报告
    const report = tool.getCompatibilityReport();
    assert.isTrue(report.supportsNewInterface);
    assert.isTrue(report.supportsOldInterface);
    
    // 测试获取新旧接口实例
    const newTool = tool.getNewToolInstance();
    const oldTool = tool.getOldToolInstance();
    
    assert.equal(newTool.id, 'dual-interface-tool');
    assert.equal(oldTool.id, 'dual-interface-tool');
  });
});