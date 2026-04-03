#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const testFile = path.join(__dirname, 'out/test/suite/pluginSystem.test.js');

console.log(`📄 读取测试文件: ${testFile}`);
let content = fs.readFileSync(testFile, 'utf8');

// 修复1: 所有 new PluginManager 调用，添加 mockExtensionContext 作为第一个参数
console.log('🔧 修复 PluginManager 构造函数调用...');

// 查找所有 new PluginManager_1.PluginManager(...) 模式
// 我们需要替换以下模式：
// 1. new PluginManager_1.PluginManager(mockToolContext) -> new PluginManager_1.PluginManager(mockExtensionContext, mockToolContext)
// 2. new PluginManager_1.PluginManager({ ... }) -> new PluginManager_1.PluginManager(mockExtensionContext, { ... })

content = content.replace(
  /new PluginManager_1\.PluginManager\(mockToolContext\)/g,
  'new PluginManager_1.PluginManager(mockExtensionContext, mockToolContext)'
);

// 处理带对象参数的情况（第307行）
content = content.replace(
  /new PluginManager_1\.PluginManager\(\{\s*\.\.\.mockToolContext,/g,
  'new PluginManager_1.PluginManager(mockExtensionContext, { ...mockToolContext,'
);

// 修复2: 检查 TestPlugin 是否有 getMetadata 方法（已经有了）
// 修复3: 检查 TestToolPlugin 的 initialize 方法问题
// 错误信息显示 "(intermediate value).initialize is not a function"
// 这可能是 super.initialize() 调用问题，因为 ToolPlugin 可能没有 initialize 方法
// 让我们检查 ToolPlugin 基类

console.log('🔍 检查 ToolPlugin 基类是否有 initialize 方法...');
const toolPluginPath = path.join(__dirname, 'out/plugins/ToolPlugin.js');
if (fs.existsSync(toolPluginPath)) {
  const toolPluginContent = fs.readFileSync(toolPluginPath, 'utf8');
  if (toolPluginContent.includes('initialize(')) {
    console.log('✅ ToolPlugin 有 initialize 方法');
  } else {
    console.log('⚠️ ToolPlugin 可能没有 initialize 方法');
    // 如果是这样，我们需要修改 TestToolPlugin 的 initialize 方法
    // 不调用 super.initialize()
    content = content.replace(
      /async initialize\(context\) \{\s*await super\.initialize\(context\);?/,
      'async initialize(context) { // super.initialize(context) removed'
    );
  }
}

// 修复4: PluginExtension 命令处理测试中的类型断言错误
// 错误: Expected 'boolean' but got 'undefined'
// 这可能是因为 pluginExtension.getStatus() 返回的对象没有 initialized 属性
// 让我们检查 PluginExtension 的 getStatus 方法

console.log('🔍 检查 PluginExtension.getStatus() 方法...');
const pluginExtensionPath = path.join(__dirname, 'out/plugins/PluginExtension.js');
if (fs.existsSync(pluginExtensionPath)) {
  const pluginExtensionContent = fs.readFileSync(pluginExtensionPath, 'utf8');
  if (pluginExtensionContent.includes('getStatus()')) {
    console.log('✅ PluginExtension 有 getStatus 方法');
    // 查看返回的对象结构
    const match = pluginExtensionContent.match(/getStatus\(\)[^{]+\{([^}]+)\}/);
    if (match) {
      console.log('返回对象内容:', match[1].trim());
    }
  }
}

// 保存修复后的文件
const backupFile = testFile + '.fixed';
fs.writeFileSync(backupFile, content);
console.log(`💾 保存修复后的文件到: ${backupFile}`);

// 运行测试验证修复
console.log('\n🚀 运行修复后的测试...');
const { execSync } = require('child_process');
try {
  // 临时替换原文件
  const originalContent = fs.readFileSync(testFile, 'utf8');
  fs.writeFileSync(testFile, content);
  
  // 运行插件系统测试
  const result = execSync('node run-full-plugin-tests.js', { encoding: 'utf8' });
  console.log(result);
  
  // 恢复原文件
  fs.writeFileSync(testFile, originalContent);
  console.log('🔄 恢复原文件');
} catch (error) {
  console.error('❌ 测试运行失败:', error.message);
  if (error.stdout) console.log('输出:', error.stdout);
  if (error.stderr) console.log('错误:', error.stderr);
  
  // 恢复原文件
  const originalContent = fs.readFileSync(testFile + '.backup', 'utf8');
  fs.writeFileSync(testFile, originalContent);
  console.log('🔄 从备份恢复原文件');
}