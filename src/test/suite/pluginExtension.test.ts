/**
 * PluginExtension 单元测试
 * 验证插件系统入口点的核心功能
 */

import 'mocha';
import * as assert from 'assert';
import { PluginExtension } from '../../plugins/PluginExtension';
import { mockVscode } from '../helpers/mockVscode';

// 模拟扩展上下文
const mockExtensionContext = {
  subscriptions: [] as any[],
  extensionPath: '/test/extension',
  storagePath: '/test/storage',
  globalStoragePath: '/test/global-storage',
  logPath: '/test/logs',
  asAbsolutePath: (relativePath: string) => `/test/extension/${relativePath}`,
  workspaceState: {
    get: (key: string) => undefined,
    update: async (key: string, value: any) => {},
    keys: () => []
  },
  globalState: {
    get: (key: string) => undefined,
    update: async (key: string, value: any) => {},
    keys: () => []
  },
  extensionMode: 1, // ExtensionMode.Development
  environmentVariableCollection: {} as any
};

// 模拟工具上下文
const mockToolContext = {
  extensionContext: mockExtensionContext as any,
  workspaceRoot: '/test/workspace',
  cwd: '/test/workspace',
  outputChannel: {
    name: 'test-channel',
    append: (value: string) => console.log('[TEST]', value),
    appendLine: (value: string) => console.log('[TEST]', value),
    replace: (value: string) => console.log('[TEST REPLACE]', value),
    clear: () => {},
    show: () => {},
    hide: () => {},
    dispose: () => {}
  },
  sessionId: 'test-session',
  sharedResources: {}
};
describe('PluginExtension 单元测试', () => {
it('单例模式验证', () => {
    // 获取第一个实例
    const instance1 = PluginExtension.getInstance(mockExtensionContext as any, mockToolContext);
    
    // 获取第二个实例（应该是同一个）
    const instance2 = PluginExtension.getInstance(mockExtensionContext as any, mockToolContext);
    
    // 验证单例
    assert.strictEqual(instance1, instance2, 'PluginExtension 应该返回同一个实例');
  });
it('初始化方法验证', async () => {
    const pluginExtension = PluginExtension.getInstance(mockExtensionContext as any, mockToolContext);
    
    // 初始化插件系统
    await pluginExtension.initialize();
    
    // 验证插件管理器已创建
    const pluginManager = (pluginExtension as any).pluginManager;
    assert.ok(pluginManager, 'PluginManager 应该被创建');
    
    // 验证工具注册表已创建
    const toolRegistry = (pluginExtension as any).pluginToolRegistry;
    assert.ok(toolRegistry, 'PluginToolRegistry 应该被创建');
  });
it('获取插件系统状态', async () => {
    const pluginExtension = PluginExtension.getInstance(mockExtensionContext as any, mockToolContext);
    
    // 先初始化
    await pluginExtension.initialize();
    
    // 获取状态
    const state = await pluginExtension.getState();
    
    // 验证状态结构
    assert.ok(state, '状态应该被返回');
    // 检查状态对象的基本属性
    console.log('插件系统状态详情:', JSON.stringify(state, null, 2));
    assert.ok(typeof state === 'object', '状态应该是对象');
    
    console.log('插件系统状态:', state);
  });
it('插件列表命令', async () => {
    const pluginExtension = PluginExtension.getInstance(mockExtensionContext as any, mockToolContext);
    await pluginExtension.initialize();
    
    // 测试 listPlugins 方法（应该不抛出错误）
    await pluginExtension.listPlugins();
    
    // 验证至少输出了一些信息
    console.log('listPlugins 命令执行完成');
  });
it('插件重新加载命令', async () => {
    const pluginExtension = PluginExtension.getInstance(mockExtensionContext as any, mockToolContext);
    await pluginExtension.initialize();
    
    // 测试 reloadPlugins 方法
    await pluginExtension.reloadPlugins();
    
    console.log('reloadPlugins 命令执行完成');
  });
it('插件管理UI命令', () => {
    const pluginExtension = PluginExtension.getInstance(mockExtensionContext as any, mockToolContext);
    
    // 测试 showPluginManagementUI 方法（应该不抛出错误）
    pluginExtension.showPluginManagementUI();
    
    console.log('showPluginManagementUI 命令执行完成');
  });
it('错误处理 - 重复初始化', async () => {
    const pluginExtension = PluginExtension.getInstance(mockExtensionContext as any, mockToolContext);
    
    // 第一次初始化
    await pluginExtension.initialize();
    
    // 第二次初始化应该被安全处理（不抛出错误）
    await pluginExtension.initialize();
    
    console.log('重复初始化测试通过');
  });
});

// 运行测试（当直接执行时）
if (require.main === module) {
  console.log('运行 PluginExtension 单元测试...');
  const Mocha = require('mocha');
  const mocha = new Mocha();
  mocha.addFile(__filename);
  mocha.run((failures: number) => {
    process.exit(failures > 0 ? 1 : 0);
  });
}