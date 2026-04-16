/**
 * 分析编译模块的结构
 */

console.log('🔍 分析编译模块结构...');

const fs = require('fs');
const path = require('path');

const componentPath = '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js';
console.log(`📁 文件: ${componentPath}`);

// 读取文件内容
const content = fs.readFileSync(componentPath, 'utf8');
console.log(`文件大小: ${content.length} 字符`);

// 检查关键模式
console.log('\n🔍 分析模块结构...');

// 检查是否有立即执行函数
const iifePattern = /\(function|\(\(\)|\(\(function/g;
const iifeMatches = content.match(iifePattern);
console.log(`立即执行函数模式: ${iifeMatches ? iifeMatches.length : 0}处`);

// 检查是否有类定义
const classPattern = /class\s+[A-Z][A-Za-z0-9_]*/g;
const classMatches = content.match(classPattern);
console.log(`类定义: ${classMatches ? classMatches.length : 0}处`);
if (classMatches) {
  console.log('类名:', classMatches);
}

// 检查是否有函数定义
const functionPattern = /function\s+[A-Z][A-Za-z0-9_]*/g;
const functionMatches = content.match(functionPattern);
console.log(`函数定义: ${functionMatches ? functionMatches.length : 0}处`);
if (functionMatches) {
  console.log('函数名:', functionMatches.slice(0, 5));
}

// 检查是否有变量赋值给exports
const exportPattern = /exports\.|module\.exports|export\s+/g;
const exportMatches = content.match(exportPattern);
console.log(`导出语句: ${exportMatches ? exportMatches.length : 0}处`);

// 检查是否有返回语句
const returnPattern = /return\s+[A-Z][A-Za-z0-9_]*/g;
const returnMatches = content.match(returnPattern);
console.log(`返回语句: ${returnMatches ? returnMatches.length : 0}处`);

// 尝试不同的加载方式
console.log('\n🔧 尝试不同的加载方式...');

// 方式1: 直接require（我们已经试过）
try {
  const module1 = require(componentPath);
  console.log('✅ 直接require成功');
  console.log('  类型:', typeof module1);
  console.log('  键:', Object.keys(module1).slice(0, 10));
} catch (error) {
  console.log('❌ 直接require失败:', error.message);
}

// 方式2: 使用vm模块在隔离环境中运行
try {
  const vm = require('vm');
  const sandbox = {
    exports: {},
    module: { exports: {} },
    require: require,
    console: console,
    process: process
  };
  
  const script = new vm.Script(content);
  script.runInNewContext(sandbox);
  
  console.log('✅ VM加载成功');
  console.log('  module.exports:', typeof sandbox.module.exports);
  console.log('  exports:', typeof sandbox.exports);
  
  if (sandbox.module.exports && typeof sandbox.module.exports === 'object') {
    const keys = Object.keys(sandbox.module.exports);
    console.log(`  module.exports键 (${keys.length}个):`, keys.slice(0, 5));
  }
  
  // 检查是否有类被导出
  for (const key in sandbox) {
    if (key.includes('Enhanced') || key.includes('Engine')) {
      console.log(`  可能的相关变量: ${key} (${typeof sandbox[key]})`);
    }
  }
} catch (error) {
  console.log('❌ VM加载失败:', error.message);
}

// 方式3: 检查全局对象是否被修改
console.log('\n🔍 检查全局对象...');
const originalGlobalKeys = Object.keys(global);

try {
  // 在隔离环境中运行，看看是否修改全局对象
  const vm = require('vm');
  const sandbox = { global: {}, exports: {}, module: { exports: {} } };
  const script = new vm.Script(`(function() { ${content} })()`);
  script.runInNewContext(sandbox);
  
  // 检查是否有类被添加到全局
  const globalKeys = Object.keys(sandbox.global);
  console.log(`全局变量: ${globalKeys.length}个`);
  
  for (const key of globalKeys) {
    if (key.includes('Enhanced') || key.includes('Engine') || /^[A-Z]/.test(key)) {
      console.log(`  全局变量 ${key}: ${typeof sandbox.global[key]}`);
    }
  }
} catch (error) {
  console.log('全局检查失败:', error.message);
}

console.log('\n🏁 分析完成');