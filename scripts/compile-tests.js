#!/usr/bin/env node

/**
 * 编译测试文件脚本
 * 将test/目录下的TypeScript测试文件编译到out/test/目录
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();
const testDir = path.join(projectRoot, 'test');
const outTestDir = path.join(projectRoot, 'out', 'test');

console.log('📦 开始编译测试文件...');

// 确保输出目录存在
if (!fs.existsSync(outTestDir)) {
  fs.mkdirSync(outTestDir, { recursive: true });
}

// 收集所有测试.ts文件
const testFiles = [];

function collectTestFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      collectTestFiles(fullPath);
    } else if (item.name.endsWith('.test.ts') || item.name.endsWith('.spec.ts')) {
      testFiles.push(fullPath);
    }
  }
}

if (fs.existsSync(testDir)) {
  collectTestFiles(testDir);
}

console.log(`📁 找到 ${testFiles.length} 个测试文件`);

if (testFiles.length === 0) {
  console.log('ℹ️  没有找到测试文件，跳过编译');
  process.exit(0);
}

// 创建临时tsconfig用于测试编译
const tempTsConfig = {
  compilerOptions: {
    target: "ES2022",
    module: "commonjs",
    lib: ["ES2022", "DOM"],
    outDir: "./out/test",
    rootDir: "./",
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true,
    sourceMap: true,
    downlevelIteration: true,
    // 包含项目中的类型定义
    types: ["node", "mocha", "chai"],
    paths: {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@tools/*": ["./src/tools/*"],
      "@core/*": ["./src/core/*"],
      "@mcp/*": ["./src/mcp/*"]
    }
  },
  include: testFiles.map(f => path.relative(projectRoot, f)),
  exclude: ["node_modules", "dist", "out", "webview-ui"]
};

const tempTsConfigPath = path.join(projectRoot, 'tsconfig.tests.json');
fs.writeFileSync(tempTsConfigPath, JSON.stringify(tempTsConfig, null, 2));

try {
  console.log('🔨 编译测试文件...');
  
  // 使用TypeScript编译器编译测试文件
  execSync(`npx tsc --project ${tempTsConfigPath}`, {
    stdio: 'inherit',
    cwd: projectRoot
  });
  
  console.log('✅ 测试文件编译完成');
  
  // 复制必要的辅助文件
  const helpersDir = path.join(testDir, 'helpers');
  const outHelpersDir = path.join(outTestDir, 'helpers');
  
  if (fs.existsSync(helpersDir)) {
    if (!fs.existsSync(outHelpersDir)) {
      fs.mkdirSync(outHelpersDir, { recursive: true });
    }
    
    // 复制helper文件
    const helperFiles = fs.readdirSync(helpersDir);
    for (const file of helperFiles) {
      if (file.endsWith('.js') || file.endsWith('.json')) {
        const srcFile = path.join(helpersDir, file);
        const destFile = path.join(outHelpersDir, file);
        fs.copyFileSync(srcFile, destFile);
        console.log(`📄 复制辅助文件: ${file}`);
      }
    }
  }
  
  // 复制现有的.js测试文件（不需要编译的）
  function copyJsTestFiles(dir, baseDir = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.join(baseDir, item.name);
      
      if (item.isDirectory()) {
        const outSubDir = path.join(outTestDir, relativePath);
        if (!fs.existsSync(outSubDir)) {
          fs.mkdirSync(outSubDir, { recursive: true });
        }
        copyJsTestFiles(fullPath, relativePath);
      } else if (item.name.endsWith('.test.js') || item.name.endsWith('.spec.js')) {
        const outFile = path.join(outTestDir, relativePath);
        const outDir = path.dirname(outFile);
        
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        
        fs.copyFileSync(fullPath, outFile);
        console.log(`📄 复制JavaScript测试文件: ${relativePath}`);
      }
    }
  }
  
  if (fs.existsSync(testDir)) {
    copyJsTestFiles(testDir);
  }
  
} catch (error) {
  console.error('❌ 编译测试文件失败:', error.message);
  process.exit(1);
} finally {
  // 清理临时配置文件
  if (fs.existsSync(tempTsConfigPath)) {
    fs.unlinkSync(tempTsConfigPath);
  }
}