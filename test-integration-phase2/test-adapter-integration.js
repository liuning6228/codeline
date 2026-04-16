#!/usr/bin/env node
/**
 * 测试适配器集成
 * 
 * 这个脚本测试Cline到VS Code适配器的基本功能
 */

const path = require('path');
const fs = require('fs');

console.log('=== 适配器集成测试 ===\n');

// 1. 检查适配器文件是否存在
const adapterFiles = [
  '/home/liuning/workspace/codeline/webview-ui/src/adapters/cline-to-vscode.ts',
  '/home/liuning/workspace/codeline/webview-ui/src/adapters/vscode-to-claude.ts',
  '/home/liuning/workspace/codeline/webview-ui/src/adapters/format-adapters/index.ts',
  '/home/liuning/workspace/codeline/webview-ui/src/adapters/index.ts'
];

console.log('1. 检查适配器文件:');
adapterFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${path.basename(file)}: ${exists ? '✓ 存在' : '✗ 不存在'}`);
});

// 2. 检查更新后的UI组件
const updatedComponents = [
  '/home/liuning/workspace/codeline/webview-ui/src/components/menu/Navbar.tsx',
  '/home/liuning/workspace/codeline/webview-ui/src/components/chat/ChatView.tsx',
  '/home/liuning/workspace/codeline/webview-ui/src/App.tsx'
];

console.log('\n2. 检查更新后的UI组件:');
updatedComponents.forEach(file => {
  const exists = fs.existsSync(file);
  let usesAdapter = false;
  if (exists) {
    const content = fs.readFileSync(file, 'utf8');
    usesAdapter = content.includes('GrpcAdapters') || content.includes('../../adapters');
  }
  console.log(`  ${path.basename(file)}: ${exists ? '✓ 存在' : '✗ 不存在'} ${usesAdapter ? '✓ 使用适配器' : '✗ 未使用适配器'}`);
});

// 3. 检查适配器内容
console.log('\n3. 检查适配器实现:');
const adapterContent = fs.readFileSync(adapterFiles[0], 'utf8');
const hasTaskService = adapterContent.includes('AdaptedTaskServiceClient');
const hasFileService = adapterContent.includes('AdaptedFileServiceClient');
const hasUiService = adapterContent.includes('AdaptedUiServiceClient');
const hasStateService = adapterContent.includes('AdaptedStateServiceClient');

console.log(`  TaskService适配器: ${hasTaskService ? '✓ 已实现' : '✗ 未实现'}`);
console.log(`  FileService适配器: ${hasFileService ? '✓ 已实现' : '✗ 未实现'}`);
console.log(`  UiService适配器: ${hasUiService ? '✓ 已实现' : '✗ 未实现'}`);
console.log(`  StateService适配器: ${hasStateService ? '✓ 已实现' : '✗ 未实现'}`);

// 4. 统计需要适配的客户端总数
console.log('\n4. 剩余需要适配的客户端:');
const grpcClientFile = '/home/liuning/workspace/codeline/webview-ui/src/services/grpc-client.ts';
if (fs.existsSync(grpcClientFile)) {
  const content = fs.readFileSync(grpcClientFile, 'utf8');
  const clientMatches = content.match(/export class (\w+Client) extends/g) || [];
  const totalClients = clientMatches.length;
  const adaptedClients = [hasTaskService, hasFileService, hasUiService, hasStateService].filter(Boolean).length;
  
  console.log(`  总共 ${totalClients} 个GRPC客户端`);
  console.log(`  已适配 ${adaptedClients} 个客户端`);
  console.log(`  剩余 ${totalClients - adaptedClients} 个客户端需要适配`);
}

// 5. 检查VS Code API处理
console.log('\n5. VS Code API集成:');
const vscodeAdapterContent = fs.readFileSync(adapterFiles[1], 'utf8');
const hasQueryEngine = vscodeAdapterContent.includes('QueryEngine');
const hasToolSystem = vscodeAdapterContent.includes('executeTool');
console.log(`  QueryEngine接口: ${hasQueryEngine ? '✓ 已定义' : '✗ 未定义'}`);
console.log(`  工具系统: ${hasToolSystem ? '✓ 已实现' : '✗ 未实现'}`);

console.log('\n=== 测试完成 ===\n');

// 建议
console.log('下一步建议:');
console.log('1. 为剩余的GRPC客户端创建适配器（AccountService, BrowserService等）');
console.log('2. 实现VS Code扩展端的消息处理器');
console.log('3. 测试Navbar和ChatView组件的适配器集成');
console.log('4. 编译webview-ui以验证TypeScript类型检查');
console.log('5. 创建端到端测试验证适配器工作流程');