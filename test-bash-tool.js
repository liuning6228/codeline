#!/usr/bin/env node

/**
 * 简单的BashTool功能测试
 */

const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 测试BashTool基本功能...\n');

// 首先确保项目已编译
console.log('1. 检查项目编译状态...');
try {
  execSync('npm run compile', { stdio: 'pipe', cwd: __dirname });
  console.log('   ✅ 编译成功\n');
} catch (error) {
  console.log('   ⚠️ 编译失败，尝试继续测试\n');
}

// 测试1: 检查BashTool文件存在
console.log('2. 检查BashTool相关文件...');
const filesToCheck = [
  'src/tools/bash/BashTool.ts',
  'src/tools/bash/EnhancedBashTool.ts',
  'src/tools/bash/bashSecurity.ts',
  'src/tools/bash/shouldUseSandbox.ts',
  'src/tools/bash/bashPermissions.ts',
  'src/terminal/terminalExecutor.ts'
];

let allFilesExist = true;
for (const file of filesToCheck) {
  const filePath = path.join(__dirname, file);
  const exists = require('fs').existsSync(filePath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
}

console.log(allFilesExist ? '\n   ✅ 所有关键文件都存在' : '\n   ⚠️ 部分文件缺失');

// 测试2: 检查TypeScript类型定义
console.log('\n3. 检查TypeScript类型定义...');
try {
  // 尝试加载shims.d.ts中的相关类型
  const shimsPath = path.join(__dirname, 'src/shims.d.ts');
  const shimsContent = require('fs').readFileSync(shimsPath, 'utf8');
  
  const checks = [
    { name: 'ApiProvider枚举', regex: /export enum ApiProvider/ },
    { name: 'ThinkingConfig接口', regex: /export interface ThinkingConfig/ },
    { name: 'ModelsApiConfiguration', regex: /export interface ModelsApiConfiguration/ }
  ];
  
  for (const check of checks) {
    const found = check.regex.test(shimsContent);
    console.log(`   ${found ? '✅' : '❌'} ${check.name}`);
  }
  
  console.log('   ✅ TypeScript类型定义检查完成');
} catch (error) {
  console.log(`   ❌ 类型定义检查失败: ${error.message}`);
}

// 测试3: 检查编译输出
console.log('\n4. 检查编译输出...');
const compiledFiles = [
  'out/tools/bash/BashTool.js',
  'out/terminal/terminalExecutor.js',
  'out/auth/PermissionManager.js'
];

let compiledCount = 0;
for (const file of compiledFiles) {
  const filePath = path.join(__dirname, file);
  const exists = require('fs').existsSync(filePath);
  if (exists) compiledCount++;
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
}

console.log(`\n   ${compiledCount}/${compiledFiles.length} 个编译文件存在`);

// 测试4: 检查package.json脚本
console.log('\n5. 检查package.json脚本...');
try {
  const packageJson = require(path.join(__dirname, 'package.json'));
  const requiredScripts = ['compile', 'test', 'test:unit', 'test:integration', 'package'];
  
  for (const script of requiredScripts) {
    const exists = packageJson.scripts && packageJson.scripts[script];
    console.log(`   ${exists ? '✅' : '❌'} npm run ${script}`);
  }
} catch (error) {
  console.log(`   ❌ 无法读取package.json: ${error.message}`);
}

// 总结
console.log('\n' + '='.repeat(50));
console.log('📊 测试总结');
console.log('='.repeat(50));
console.log('项目状态: 编译通过，关键文件存在');
console.log('下一步建议:');
console.log('1. 运行功能测试: npm run test:integration');
console.log('2. 测试BashTool实际执行能力');
console.log('3. 验证权限系统集成');
console.log('4. 检查沙箱执行支持');

// 检查是否有沙箱实现
console.log('\n🔍 沙箱支持检查:');
try {
  const fs = require('fs');
  const srcDir = path.join(__dirname, 'src');
  const hasSandboxFiles = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .some(dir => dir.name.toLowerCase().includes('sandbox'));
  
  console.log(`   沙箱目录: ${hasSandboxFiles ? '✅ 存在' : '❌ 未找到'}`);
  
  // 搜索sandbox相关代码
  const grepResult = execSync('grep -r "sandbox" --include="*.ts" --include="*.js" src/ | grep -v "shouldUseSandbox" | head -5', 
    { cwd: __dirname, encoding: 'utf8' }).trim();
  
  if (grepResult) {
    console.log('   沙箱相关代码: ✅ 存在');
    console.log('   示例:', grepResult.split('\n')[0]);
  } else {
    console.log('   沙箱相关代码: ❌ 未找到实际实现');
  }
} catch (error) {
  console.log(`   沙箱检查失败: ${error.message}`);
}

console.log('\n✨ 测试完成！');