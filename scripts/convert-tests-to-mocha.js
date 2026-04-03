#!/usr/bin/env node

/**
 * 将VS Code测试格式转换为Mocha格式
 * 转换：suite -> describe, test -> it, setup -> beforeEach, teardown -> afterEach
 * 同时确保导入了'mocha'模块
 */

const fs = require('fs');
const path = require('path');

// 测试文件目录
const TEST_DIR = path.join(__dirname, '../src/test/suite');

// 需要转换的测试文件
const testFiles = [
  'extension.test.ts',
  'extension-comprehensive.test.ts',
  'extension-comprehensive-v2.test.ts',
  'fileManager.test.ts',  // 已部分转换
  'modelAdapter.test.ts',
  'pluginExtension.test.ts',
  'taskEngine.test.ts',
  'chatPanel-simple.test.ts',
  'integration.test.ts'
  // pluginManager.test.ts 和 taskExecutionIntegration.test.ts 已经是Mocha格式
];

// 转换映射
const replacements = [
  { pattern: /^\s*suite\s*\(/gm, replacement: 'describe(' },
  { pattern: /^\s*test\s*\(/gm, replacement: 'it(' },
  { pattern: /^\s*setup\s*\(/gm, replacement: 'beforeEach(' },
  { pattern: /^\s*teardown\s*\(/gm, replacement: 'afterEach(' },
  { pattern: /^\s*suiteSetup\s*\(/gm, replacement: 'before(' },
  { pattern: /^\s*suiteTeardown\s*\(/gm, replacement: 'after(' }
];

// 检查是否导入了mocha
function ensureMochaImport(content) {
  if (!content.includes("import 'mocha';") && !content.includes("import 'mocha'")) {
    // 在第一个import语句后添加mocha导入
    const lines = content.split('\n');
    let importInserted = false;
    let hasImports = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        hasImports = true;
        // 检查下一行是否也是import，找到最后一个import的位置
        let j = i + 1;
        while (j < lines.length && lines[j].startsWith('import ')) {
          j++;
        }
        // 在最后一个import后插入mocha导入
        lines.splice(j, 0, "import 'mocha';");
        importInserted = true;
        break;
      }
    }
    
    if (!hasImports) {
      // 没有import语句，在文件开头添加
      lines.unshift("import 'mocha';");
      importInserted = true;
    }
    
    if (importInserted) {
      return lines.join('\n');
    }
  }
  return content;
}

// 转换单个文件
function convertFile(filename) {
  const filePath = path.join(TEST_DIR, filename);
  console.log(`转换文件: ${filename}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    // 确保导入mocha
    content = ensureMochaImport(content);
    
    // 应用替换
    for (const { pattern, replacement } of replacements) {
      content = content.replace(pattern, replacement);
    }
    
    // 如果内容有变化，写入文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✅ 转换完成`);
    } else {
      console.log(`  ⏭️ 无需转换`);
    }
    
    return true;
  } catch (error) {
    console.error(`  ❌ 转换失败: ${error.message}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('开始转换测试文件为Mocha格式...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const filename of testFiles) {
    if (convertFile(filename)) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log(`\n转换完成: ${successCount}个成功, ${failCount}个失败`);
  
  // 显示跳过转换的文件
  const allFiles = fs.readdirSync(TEST_DIR).filter(f => f.endsWith('.test.ts') || f.endsWith('.spec.ts'));
  const skipped = allFiles.filter(f => !testFiles.includes(f));
  if (skipped.length > 0) {
    console.log('\n跳过转换的文件（已为Mocha格式）:');
    skipped.forEach(f => console.log(`  - ${f}`));
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertFile, ensureMochaImport };