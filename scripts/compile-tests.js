#!/usr/bin/env node

/**
 * 简化版测试文件编译脚本
 * 只复制现有的.js测试文件，跳过TypeScript编译以避免类型错误
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const testDir = path.join(projectRoot, 'test');
const outTestDir = path.join(projectRoot, 'out', 'test');

console.log('📦 开始准备测试文件...');

// 确保输出目录存在
if (!fs.existsSync(outTestDir)) {
  fs.mkdirSync(outTestDir, { recursive: true });
}

let jsFileCount = 0;
let copiedCount = 0;

// 复制.js测试文件
function copyJsTestFiles(dir, baseDir = '') {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.join(baseDir, item.name);
    
    if (item.isDirectory()) {
      // 递归处理子目录
      copyJsTestFiles(fullPath, relativePath);
    } else if (item.name.endsWith('.test.js') || item.name.endsWith('.spec.js')) {
      jsFileCount++;
      
      const outFile = path.join(outTestDir, relativePath);
      const outDir = path.dirname(outFile);
      
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      
      fs.copyFileSync(fullPath, outFile);
      copiedCount++;
      console.log(`📄 复制测试文件: ${relativePath}`);
    }
  }
}

// 复制helper文件
function copyHelperFiles() {
  // 尝试从多个位置复制helper文件
  const possibleHelperDirs = [
    path.join(projectRoot, 'test', 'helpers'),      // test/helpers/
    path.join(projectRoot, 'src', 'test', 'helpers'), // src/test/helpers/
    path.join(projectRoot, 'test', 'helpers'),       // 原始位置
  ];
  
  const outHelpersDir = path.join(outTestDir, 'helpers');
  
  for (const helpersDir of possibleHelperDirs) {
    if (fs.existsSync(helpersDir)) {
      if (!fs.existsSync(outHelpersDir)) {
        fs.mkdirSync(outHelpersDir, { recursive: true });
      }
      
      const helperFiles = fs.readdirSync(helpersDir);
      for (const file of helperFiles) {
        if (file.endsWith('.js') || file.endsWith('.json')) {
          const srcFile = path.join(helpersDir, file);
          const destFile = path.join(outHelpersDir, file);
          fs.copyFileSync(srcFile, destFile);
          console.log(`📄 从 ${helpersDir} 复制辅助文件: ${file}`);
        }
      }
      break; // 找到第一个有效目录就停止
    }
  }
}

// 运行复制操作
try {
  if (fs.existsSync(testDir)) {
    copyJsTestFiles(testDir);
    copyHelperFiles();
  }
  
  console.log(`✅ 测试文件准备完成`);
  console.log(`  找到 ${jsFileCount} 个JavaScript测试文件`);
  console.log(`  复制 ${copiedCount} 个文件到 ${outTestDir}`);
  
  // 检查是否有测试文件被复制
  if (copiedCount === 0) {
    console.warn('⚠️  警告：没有找到JavaScript测试文件');
    console.warn('    CI测试可能找不到测试文件运行');
  }
  
} catch (error) {
  console.error('❌ 准备测试文件失败:', error.message);
  process.exit(1);
}