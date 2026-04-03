#!/usr/bin/env node

/**
 * CodeLine 项目结构验证脚本
 * 检查项目文件和模块的基本完整性
 */

const fs = require('fs');
const path = require('path');

// 关键文件和目录检查列表
const requiredFiles = [
  // 根目录文件
  'package.json',
  'tsconfig.json',
  'README.md',
  'TESTING.md',
  
  // 源代码目录
  'src/extension.ts',
  'src/chat/chatPanel.ts',
  'src/task/taskEngine.ts',
  'src/file/fileManager.ts',
  'src/terminal/terminalExecutor.ts',
  'src/browser/browserAutomator.ts',
  'src/analyzer/projectAnalyzer.ts',
  'src/prompt/promptEngine.ts',
  'src/models/modelAdapter.ts',
];

// 编译输出检查
const compiledFiles = [
  'out/extension.js',
  'out/chat/chatPanel.js',
  'out/task/taskEngine.js',
  'out/file/fileManager.js',
];

// 检查函数
function checkFileExists(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  return {
    path: filePath,
    exists,
    size: exists ? fs.statSync(fullPath).size : 0
  };
}

function checkDirectoryExists(dirPath) {
  const fullPath = path.join(__dirname, '..', dirPath);
  const exists = fs.existsSync(fullPath);
  return {
    path: dirPath,
    exists,
    hasFiles: exists ? fs.readdirSync(fullPath).length > 0 : false
  };
}

function main() {
  console.log('🔍 CodeLine 项目结构验证\n');
  console.log('='.repeat(60));
  
  // 检查关键文件
  console.log('\n📁 关键文件检查:');
  let allFilesOk = true;
  
  requiredFiles.forEach(file => {
    const result = checkFileExists(file);
    const status = result.exists ? '✅' : '❌';
    console.log(`  ${status} ${file.padEnd(40)} ${result.exists ? `${result.size} bytes` : 'MISSING'}`);
    if (!result.exists) allFilesOk = false;
  });
  
  // 检查编译输出
  console.log('\n⚙️  编译输出检查:');
  let allCompiledOk = true;
  
  compiledFiles.forEach(file => {
    const result = checkFileExists(file);
    const status = result.exists ? '✅' : '⚠️ ';
    console.log(`  ${status} ${file.padEnd(40)} ${result.exists ? `${result.size} bytes` : 'NOT COMPILED'}`);
    if (!result.exists) allCompiledOk = false;
  });
  
  // 检查目录结构
  console.log('\n📂 目录结构检查:');
  const directories = [
    'src', 'out', 'test', 'webview-ui',
    'src/chat', 'src/task', 'src/file', 'src/terminal',
    'src/browser', 'src/analyzer', 'src/prompt', 'src/models'
  ];
  
  directories.forEach(dir => {
    const result = checkDirectoryExists(dir);
    const status = result.exists ? '✅' : '❌';
    console.log(`  ${status} ${dir.padEnd(40)} ${result.exists ? (result.hasFiles ? '有文件' : '空目录') : 'MISSING'}`);
  });
  
  // 检查TypeScript配置
  console.log('\n📝 TypeScript配置检查:');
  try {
    const tsconfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tsconfig.json'), 'utf8'));
    console.log(`  ✅ tsconfig.json 有效`);
    console.log(`     target: ${tsconfig.compilerOptions?.target || '未设置'}`);
    console.log(`     strict: ${tsconfig.compilerOptions?.strict || '未设置'}`);
  } catch (error) {
    console.log(`  ❌ tsconfig.json 无效: ${error.message}`);
  }
  
  // 检查package.json
  console.log('\n📦 Package.json 检查:');
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    console.log(`  ✅ package.json 有效`);
    console.log(`     名称: ${pkg.name}`);
    console.log(`     版本: ${pkg.version}`);
    console.log(`     命令: ${Object.keys(pkg.contributes?.commands || {}).length} 个`);
    
    // 检查脚本
    console.log(`     脚本: ${Object.keys(pkg.scripts || {}).join(', ')}`);
  } catch (error) {
    console.log(`  ❌ package.json 无效: ${error.message}`);
  }
  
  // 总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 验证总结:');
  
  if (allFilesOk && allCompiledOk) {
    console.log('✅ 所有关键文件和编译输出完整');
    console.log('🎉 项目结构验证通过!');
    process.exit(0);
  } else {
    console.log('⚠️  发现以下问题:');
    if (!allFilesOk) console.log('   - 缺少关键源文件');
    if (!allCompiledOk) console.log('   - 编译输出不完整');
    console.log('\n🔧 建议:');
    console.log('   1. 运行 npm run compile 重新编译');
    console.log('   2. 检查缺失的文件');
    console.log('   3. 验证TypeScript配置');
    process.exit(1);
  }
}

// 运行验证
if (require.main === module) {
  main();
}

module.exports = { checkFileExists, checkDirectoryExists };