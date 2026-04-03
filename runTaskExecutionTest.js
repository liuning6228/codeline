#!/usr/bin/env node
/**
 * 运行任务执行集成测试
 * 使用Mocha直接运行，绕过测试运行器问题
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 运行任务执行集成测试...');
console.log('═══════════════════════════════════════\n');

// 设置环境变量
process.env.NODE_ENV = 'test';
process.env.CODELINE_TEST = 'true';

// 测试文件路径
const testFile = path.join(__dirname, 'out', 'test', 'suite', 'taskExecutionIntegration.test.js');

// 运行Mocha
const mocha = spawn('npx', [
  'mocha',
  '--timeout', '10000',
  '--require', path.join(__dirname, 'src', 'test', 'setupTestEnv.js'),
  testFile
], {
  stdio: 'inherit',
  shell: true
});

mocha.on('close', (code) => {
  console.log(`\n═══════════════════════════════════════`);
  console.log(`测试完成，退出码: ${code}`);
  process.exit(code);
});

mocha.on('error', (err) => {
  console.error(`无法启动Mocha: ${err.message}`);
  process.exit(1);
});