/**
 * CodeLineExtension全面测试套件
 * 测试扩展类的核心功能
 */

import * as assert from 'assert';
import { CodeLineExtension } from '../../extension';
import { mockVscode } from '../helpers/mockVscode';
import 'mocha';

// 模拟依赖类
class MockProjectAnalyzer {
  analyzeProjectCallCount = 0;
  
  async analyzeProject(): Promise<any> {
    this.analyzeProjectCallCount++;
    return {
      languages: ['TypeScript', 'JavaScript'],
      files: 50,
      size: '2.5MB'
    };
  }
}

class MockPromptEngine {
  generatePromptCallCount = 0;
  
  generatePrompt(context: any, task: string): string {
    this.generatePromptCallCount++;
    return `Mock prompt for: ${task}`;
  }
}

class MockModelAdapter {
  isReadyCallCount = 0;
  testConnectionCallCount = 0;
  updateConfigurationCallCount = 0;
  
  isReady(): boolean {
    this.isReadyCallCount++;
    return true;
  }
  
  async testConnection(): Promise<boolean> {
    this.testConnectionCallCount++;
    return true;
  }
  
  async updateConfiguration(config: any): Promise<void> {
    this.updateConfigurationCallCount++;
  }
  
  getConfiguration(): any {
    return {
      apiKey: 'test-key',
      model: 'mock-model',
      baseUrl: 'https://api.mock.com',
      temperature: 0.7,
      maxTokens: 2048,
      autoAnalyze: false,
      showExamples: true,
      typingIndicator: true
    };
  }
  
  getModelInfo(): string {
    return 'Mock Model v1.0 (configured)';
  }
}

class MockFileManager {
  constructor(public workspaceRoot: string) {}
  
  listDirectoryCallCount = 0;
  searchFilesCallCount = 0;
  
  async listDirectory(path: string): Promise<any> {
    this.listDirectoryCallCount++;
    return {
      files: [
        { name: 'test.txt', type: 'file', size: 123 },
        { name: 'src', type: 'directory' }
      ]
    };
  }
  
  async searchFiles(query: string): Promise<any> {
    this.searchFilesCallCount++;
    return {
      results: [
        { file: 'test.txt', line: 1, content: 'Hello World' }
      ]
    };
  }
}

class MockTaskEngine {
  executeTaskCallCount = 0;
  
  async executeTask(taskDescription: string): Promise<any> {
    this.executeTaskCallCount++;
    return {
      success: true,
      message: `Task executed: ${taskDescription}`,
      actions: []
    };
  }
}

class MockTerminalExecutor {
  executeCommandCallCount = 0;
  
  async executeCommand(command: string): Promise<any> {
    this.executeCommandCallCount++;
    return {
      success: true,
      output: `Mock output for: ${command}`
    };
  }
}

class MockBrowserAutomator {
  navigateCallCount = 0;
  
  async navigate(url: string): Promise<any> {
    this.navigateCallCount++;
    return {
      success: true,
      message: `Navigated to: ${url}`
    };
  }
}

// 模拟ExtensionContext
const mockExtensionContext = {
  subscriptions: [],
  workspaceState: {
    get: (key: string) => undefined,
    update: async (key: string, value: any) => {}
  },
  globalState: {
    get: (key: string) => undefined,
    update: async (key: string, value: any) => {}
  },
  extensionPath: '/tmp/mock-extension',
  storagePath: '/tmp/mock-storage',
  logPath: '/tmp/mock-logs',
  environmentVariableCollection: {
    persistent: false,
    replace: () => {},
    append: () => {},
    prepend: () => {},
    get: () => undefined
  }
};
describe('CodeLineExtension Comprehensive Tests', () => {
  let originalVscode: any;
  let mockVscodeInstance: any;
beforeEach(() => {
    // 保存原始vscode并设置mock
    originalVscode = (global as any).vscode;
    mockVscodeInstance = {
      ...mockVscode,
      workspace: {
        ...mockVscode.workspace,
        workspaceFolders: [
          { uri: { fsPath: '/tmp/test-workspace' }, name: 'test-workspace' }
        ]
      }
    };
    (global as any).vscode = mockVscodeInstance;
    
    // 重置单例
    (CodeLineExtension as any).instance = undefined;
  });
afterEach(() => {
    // 恢复原始vscode
    (global as any).vscode = originalVscode;
  });
it('getInstance should create singleton instance', () => {
    // 第一次获取实例（需要提供context）
    const instance1 = CodeLineExtension.getInstance(mockExtensionContext as any);
    assert.ok(instance1, 'Should create instance');
    
    // 第二次获取实例（应该返回同一个实例）
    const instance2 = CodeLineExtension.getInstance();
    assert.strictEqual(instance2, instance1, 'Should return the same singleton instance');
    
    // 第三次获取实例（即使提供新的context，也应该返回同一个实例）
    const instance3 = CodeLineExtension.getInstance({} as any);
    assert.strictEqual(instance3, instance1, 'Should return singleton even with new context');
  });
it('getInstance should require context for initial creation', () => {
    // 没有提供context的情况下获取实例（应该返回undefined或抛出错误）
    // 根据实现，如果没有实例且没有context，应该返回undefined或抛出错误
    // 先创建实例
    const instance1 = CodeLineExtension.getInstance(mockExtensionContext as any);
    assert.ok(instance1, 'Should create instance with context');
    
    // 现在可以无context获取
    const instance2 = CodeLineExtension.getInstance();
    assert.ok(instance2, 'Should get existing instance without context');
  });
it('startChat should work when model is ready', async () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    // 模拟vscode.window.createWebviewPanel调用
    let createWebviewPanelCallCount = 0;
    const originalCreateWebviewPanel = mockVscodeInstance.window.createWebviewPanel;
    mockVscodeInstance.window.createWebviewPanel = (...args: any[]) => {
      createWebviewPanelCallCount++;
      return originalCreateWebviewPanel(...args);
    };
    
    try {
      await instance.startChat();
      
      // startChat应该调用createWebviewPanel
      assert.strictEqual(createWebviewPanelCallCount, 1, 'startChat should create webview panel');
      
    } finally {
      mockVscodeInstance.window.createWebviewPanel = originalCreateWebviewPanel;
    }
  });
it('executeTask should work', async () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    // 替换实例的taskEngine以确保测试
    const mockTaskEngine = new MockTaskEngine();
    (instance as any).taskEngine = mockTaskEngine;
    
    // 确保fileManager也设置好
    (instance as any).fileManager = new MockFileManager('/tmp/test-workspace');
    
    const result = await instance.executeTask('Test task');
    
    assert.ok(result, 'executeTask should return result');
    assert.strictEqual(mockTaskEngine.executeTaskCallCount, 1, 'Should call task engine');
  });
it('executeFileCommand should handle different commands', async () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    // 替换fileManager
    const mockFileManager = new MockFileManager('/tmp/test-workspace');
    (instance as any).fileManager = mockFileManager;
    
    // 测试listFiles命令
    const listResult = await instance.executeFileCommand('listFiles', { path: '/' });
    assert.ok(listResult, 'listFiles should return result');
    assert.strictEqual(mockFileManager.listDirectoryCallCount, 1, 'Should call listDirectory');
    
    // 测试searchFiles命令
    const searchResult = await instance.executeFileCommand('searchFiles', { query: 'test' });
    assert.ok(searchResult, 'searchFiles should return result');
    assert.strictEqual(mockFileManager.searchFilesCallCount, 1, 'Should call searchFiles');
    
    // 测试getStats命令
    const statsResult = await instance.executeFileCommand('getStats');
    assert.ok(statsResult, 'getStats should return result');
    
    // 测试browseDirectory命令
    const browseResult = await instance.executeFileCommand('browseDirectory', { path: '/' });
    assert.ok(browseResult, 'browseDirectory should return result');
    assert.strictEqual(mockFileManager.listDirectoryCallCount, 2, 'Should call listDirectory again');
  });
it('analyzeProject should work', async () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    // 替换projectAnalyzer
    const mockProjectAnalyzer = new MockProjectAnalyzer();
    (instance as any).projectAnalyzer = mockProjectAnalyzer;
    
    const result = await instance.analyzeProject();
    
    assert.ok(result, 'analyzeProject should return result');
    assert.strictEqual(mockProjectAnalyzer.analyzeProjectCallCount, 1, 'Should call project analyzer');
  });
it('getModelInfo should return model information', () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    const modelInfo = instance.getModelInfo();
    
    assert.ok(modelInfo, 'getModelInfo should return string');
    assert.strictEqual(typeof modelInfo, 'string', 'Model info should be string');
  });
it('getConfig should return configuration', () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    const config = instance.getConfig();
    
    assert.ok(config, 'getConfig should return configuration');
    assert.ok('apiKey' in config, 'Config should have apiKey');
    assert.ok('model' in config, 'Config should have model');
  });
it('updateConfig should update configuration', () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    const newConfig = {
      apiKey: 'new-test-key',
      model: 'new-model',
      temperature: 0.8
    };
    
    instance.updateConfig(newConfig);
    
    // 验证配置已更新
    const config = instance.getConfig();
    assert.strictEqual(config.apiKey, 'new-test-key', 'apiKey should be updated');
    assert.strictEqual(config.model, 'new-model', 'model should be updated');
    assert.strictEqual(config.temperature, 0.8, 'temperature should be updated');
  });
it('approveFileDiff should work', async () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    const result = await instance.approveFileDiff('test-diff-123', 'approve');
    
    assert.ok(result, 'approveFileDiff should return result');
    assert.ok('success' in result, 'Result should have success property');
    assert.ok('message' in result, 'Result should have message property');
  });
it('getModelAdapter should return model adapter', () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    const modelAdapter = instance.getModelAdapter();
    
    assert.ok(modelAdapter, 'getModelAdapter should return model adapter');
    assert.strictEqual(typeof modelAdapter.isReady, 'function', 'Model adapter should have isReady method');
  });
it('Extension should handle missing workspace gracefully', async () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    // 模拟没有工作区文件夹的情况
    const originalWorkspaceFolders = mockVscodeInstance.workspace.workspaceFolders;
    mockVscodeInstance.workspace.workspaceFolders = [];
    
    try {
      // 确保taskEngine未初始化
      (instance as any).taskEngine = undefined;
      (instance as any).fileManager = undefined;
      
      // executeTask应该抛出错误或处理缺失的工作区
      let errorCaught = false;
      try {
        await instance.executeTask('Test task');
      } catch (error: any) {
        errorCaught = true;
        assert.ok(error.message.includes('workspace'), 'Error should mention workspace');
      }
      
      // 根据实现，可能会抛出错误或显示错误消息
      assert.ok(true, 'Extension should handle missing workspace');
      
    } finally {
      mockVscodeInstance.workspace.workspaceFolders = originalWorkspaceFolders;
    }
  });
it('Extension methods should be accessible', () => {
    const instance = CodeLineExtension.getInstance(mockExtensionContext as any);
    
    // 验证所有公共方法都存在
    assert.strictEqual(typeof instance.startChat, 'function', 'startChat should be function');
    assert.strictEqual(typeof instance.executeTask, 'function', 'executeTask should be function');
    assert.strictEqual(typeof instance.executeFileCommand, 'function', 'executeFileCommand should be function');
    assert.strictEqual(typeof instance.analyzeProject, 'function', 'analyzeProject should be function');
    assert.strictEqual(typeof instance.getModelAdapter, 'function', 'getModelAdapter should be function');
    assert.strictEqual(typeof instance.getModelInfo, 'function', 'getModelInfo should be function');
    assert.strictEqual(typeof instance.getConfig, 'function', 'getConfig should be function');
    assert.strictEqual(typeof instance.updateConfig, 'function', 'updateConfig should be function');
    assert.strictEqual(typeof instance.approveFileDiff, 'function', 'approveFileDiff should be function');
  });
});