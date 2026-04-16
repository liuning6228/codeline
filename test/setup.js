/**
 * 测试全局设置文件
 * 在所有测试运行之前执行
 */

const chai = require('chai');
const sinon = require('sinon');
const path = require('path');

// 全局测试配置
global.TEST_CONFIG = {
  timeout: 10000,
  slow: 5000,
  rootDir: path.join(__dirname, '..'),
  fixturesDir: path.join(__dirname, 'fixtures'),
  tempDir: path.join(__dirname, '..', '.tmp')
};

// Chai配置
chai.config.includeStack = true;
chai.config.truncateThreshold = 0;

// 全局断言库
global.expect = chai.expect;
global.assert = chai.assert;
global.should = chai.should();

// 全局测试工具
global.sinon = sinon;

// 创建临时目录
const fs = require('fs');
if (!fs.existsSync(global.TEST_CONFIG.tempDir)) {
  fs.mkdirSync(global.TEST_CONFIG.tempDir, { recursive: true });
}

// 测试生命周期钩子
// 检查Mocha钩子函数是否可用（ESM模式下可能不可用）
if (typeof before !== 'undefined') {
  before(() => {
    console.log('🚀 开始测试套件执行');
    
    // 初始化测试环境
    process.env.NODE_ENV = 'test';
    process.env.TEST_MODE = 'true';
  });
}

if (typeof after !== 'undefined') {
  after(() => {
    console.log('✅ 测试套件执行完成');
    
    // 清理临时文件
    try {
      if (fs.existsSync(global.TEST_CONFIG.tempDir)) {
        fs.rmSync(global.TEST_CONFIG.tempDir, { recursive: true });
      }
    } catch (error) {
      console.warn('清理临时目录失败:', error.message);
    }
  });
}

// 每个测试用例之前的钩子
if (typeof beforeEach !== 'undefined') {
  beforeEach(function() {
    // 为每个测试用例创建sandbox
    this.sandbox = sinon.createSandbox();
    
    // 设置测试超时
    this.timeout(global.TEST_CONFIG.timeout);
    this.slow(global.TEST_CONFIG.slow);
  });
}

// 每个测试用例之后的钩子
if (typeof afterEach !== 'undefined') {
  afterEach(function() {
    // 恢复sandbox
    this.sandbox.restore();
    
    // 清理全局状态
    delete global.lastError;
    delete global.lastWarning;
  });
}

// 测试辅助函数
global.createTestContext = (overrides = {}) => {
  const defaultContext = {
    workspaceRoot: global.TEST_CONFIG.tempDir,
    extensionContext: {
      subscriptions: [],
      extensionPath: global.TEST_CONFIG.rootDir,
      globalState: {
        get: () => null,
        update: () => Promise.resolve(),
        keys: () => []
      },
      workspaceState: {
        get: () => null,
        update: () => Promise.resolve(),
        keys: () => []
      }
    },
    outputChannel: {
      appendLine: () => {},
      append: () => {},
      show: () => {},
      hide: () => {},
      dispose: () => {}
    },
    abortController: new AbortController(),
    permissionContext: {
      mode: 'default',
      alwaysAllowRules: {},
      alwaysDenyRules: {},
      alwaysAskRules: {},
      isBypassPermissionsModeAvailable: false
    },
    showInformationMessage: () => Promise.resolve(undefined),
    showWarningMessage: () => Promise.resolve(undefined),
    showErrorMessage: () => Promise.resolve(undefined),
    readFile: async (filePath) => {
      return fs.promises.readFile(filePath, 'utf-8');
    },
    writeFile: async (filePath, content) => {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      return fs.promises.writeFile(filePath, content, 'utf-8');
    },
    fileExists: async (filePath) => {
      try {
        await fs.promises.access(filePath);
        return true;
      } catch {
        return false;
      }
    }
  };
  
  return { ...defaultContext, ...overrides };
};

// 测试数据加载函数
global.loadTestData = (dataFile) => {
  const dataPath = path.join(global.TEST_CONFIG.fixturesDir, 'data', dataFile);
  if (fs.existsSync(dataPath)) {
    return require(dataPath);
  }
  throw new Error(`测试数据文件不存在: ${dataPath}`);
};

// 测试配置加载函数
global.loadTestConfig = (configFile) => {
  const configPath = path.join(global.TEST_CONFIG.fixturesDir, 'configs', configFile);
  if (fs.existsSync(configPath)) {
    return require(configPath);
  }
  throw new Error(`测试配置文件不存在: ${configPath}`);
};

// 延迟函数（用于异步测试）
global.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

console.log('✅ 测试环境设置完成');