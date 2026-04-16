// 最简单的测试，不依赖任何外部模块
const { describe, it } = require('mocha');

describe('Simple CI Test', () => {
  it('should pass - verifying CI can run tests', () => {
    console.log('✅ Simple test running in CI');
    // 简单的断言
    if (typeof describe !== 'function') {
      throw new Error('Mocha not loaded');
    }
  });
  
  it('should have basic Node.js environment', () => {
    console.log('Node.js version:', process.version);
    console.log('Platform:', process.platform);
    console.log('Current directory:', process.cwd());
  });
});