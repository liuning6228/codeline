// 测试ModelAdapter配置检查
const vscode = require('vscode');

// 模拟VS Code配置
const mockConfig = {
  get: (key) => {
    console.log('Getting config:', key);
    if (key === 'apiKey') return '';
    if (key === 'defaultModel') return 'deepseek-chat';
    return undefined;
  }
};

// 模拟workspace.getConfiguration
const mockWorkspace = {
  getConfiguration: () => mockConfig
};

// 临时替换vscode.workspace
const originalWorkspace = vscode.workspace;
vscode.workspace = mockWorkspace;

// 测试ModelAdapter
const ModelAdapter = require('./out/models/modelAdapter').ModelAdapter;
const adapter = new ModelAdapter();

console.log('API Key:', adapter.getConfiguration().apiKey);
console.log('Is configured:', adapter.isReady());
console.log('Is ready:', adapter.isReady());

// 恢复
vscode.workspace = originalWorkspace;