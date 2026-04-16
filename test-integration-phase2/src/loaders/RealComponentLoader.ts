/**
 * 真实组件加载器
 * 
 * 尝试在测试环境中加载真实EnhancedEngineAdapter，解决vscode依赖问题
 */

import * as path from 'path';
import * as fs from 'fs';
import { vscode as mockVscode, createExtensionContext } from '../mocks/vscodeExtended';

// ==================== 类型定义 ====================

export interface LoadResult {
  success: boolean;
  error?: string;
  module?: any;
  EnhancedEngineAdapter?: any;
  strategyUsed?: string;
}

export interface LoadOptions {
  // 加载策略
  strategies?: ('cache-injection' | 'proxy-module' | 'global-injection' | 'compile-first')[];
  
  // 调试模式
  verbose?: boolean;
  
  // 真实组件路径（如果为null，自动查找）
  realComponentPath?: string;
  
  // 自定义vscode模拟
  customVscodeMock?: any;
}

// 简化日志接口
interface SimpleLogger {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

// ==================== 真实组件加载器 ====================

export class RealComponentLoader {
  private options: LoadOptions;
  private logger: SimpleLogger;
  
  constructor(options: LoadOptions = {}) {
    this.options = {
      strategies: ['cache-injection', 'proxy-module', 'global-injection'],
      verbose: false,
      ...options
    };
    this.logger = this.options.verbose ? console : { log: () => {}, error: console.error };
  }
  
  /**
   * 查找真实组件路径
   */
  private findRealComponentPath(): string | null {
    const possiblePaths = [
      // 从当前项目目录
      path.resolve(__dirname, '../../../../codeline/out/core/EnhancedEngineAdapter.js'),
      // 从工作空间根目录
      path.resolve(process.cwd(), '../out/core/EnhancedEngineAdapter.js'),
      // 绝对路径
      '/home/liuning/workspace/codeline/out/core/EnhancedEngineAdapter.js',
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        this.logger.log(`📁 找到真实组件: ${p}`);
        return p;
      }
    }
    
    return null;
  }
  
  /**
   * 策略1: require.cache注入
   * 在require.cache中注入vscode模拟
   */
  private tryCacheInjectionStrategy(componentPath: string): LoadResult {
    const self = this;
    self.logger.log('🔄 尝试策略1: require.cache注入');
    
    try {

      
      // 创建临时文件来保存vscode模拟
      const os = require('os');
      const fs = require('fs');
      const tempDir = os.tmpdir();
      const tempFile = path.join(tempDir, `vscode-mock-${Date.now()}-${Math.random().toString(36).substring(2)}.js`);
      
      self.logger.log(`📝 创建临时vscode模拟文件: ${tempFile}`);
      
      // 获取vscode模拟
      const vscodeMock = self.options.customVscodeMock || mockVscode;
      
      // 在全局对象中设置模拟，让临时文件可以访问
      (global as any).__vscodeMockForTest = vscodeMock;
      
      // 写入临时文件 - 从全局对象获取模拟
      fs.writeFileSync(tempFile, `
// 临时vscode模拟文件
module.exports = global.__vscodeMockForTest;
`);
      
      // 获取Module类来拦截解析
      const Module = require('module');
      const originalResolveFilename = (Module as any)._resolveFilename;
      
      // 拦截模块解析
      (Module as any)._resolveFilename = function(request: string, parent: any, isMain: boolean) {
        if (request === 'vscode') {
          self.logger.log(`🎯 拦截vscode请求，重定向到临时文件: ${tempFile}`);
          return tempFile;
        }
        return originalResolveFilename.call(this, request, parent, isMain);
      };
      
      // 在缓存中预设置vscode模拟（可选）
      (require as any).cache[tempFile] = {
        exports: vscodeMock,
        loaded: true,
        filename: tempFile,
        id: tempFile,
        children: [],
        paths: []
      };
      
      // 尝试加载真实组件
      self.logger.log(`🔧 加载真实组件: ${componentPath}`);
      const module = require(componentPath);
      
      // 恢复原始解析函数
      (Module as any)._resolveFilename = originalResolveFilename;
      
      // 清理：删除临时文件，移除全局变量
      try {
        fs.unlinkSync(tempFile);
        delete (global as any).__vscodeMockForTest;
      } catch (cleanupError: any) {
        // 忽略清理错误
        self.logger.log(`⚠️  清理临时文件时出错: ${cleanupError.message}`);
      }
      
      // 检查导出
      if (!module.EnhancedEngineAdapter) {
        return {
          success: false,
          error: 'EnhancedEngineAdapter类未在模块中导出',
          strategyUsed: 'cache-injection'
        };
      }
      
      self.logger.log('✅ 策略1成功: 通过cache-injection加载真实组件');
      return {
        success: true,
        module,
        EnhancedEngineAdapter: module.EnhancedEngineAdapter,
        strategyUsed: 'cache-injection'
      };
      
    } catch (error: any) {
      self.logger.error(`❌ 策略1失败: ${error.message}`);
      return {
        success: false,
        error: error.message,
        strategyUsed: 'cache-injection'
      };
    }
  }
  
  /**
   * 策略2: 全局模块代理
   * 使用模块包装器代理require调用
   */
  private tryProxyModuleStrategy(componentPath: string): LoadResult {
    this.logger.log('🔄 尝试策略2: 全局模块代理');
    
    try {
      // 这种方法更复杂，需要重写Module._load
      // 对于概念验证，我们暂时跳过实现
      
      this.logger.log('⚠️  策略2暂未实现');
      return {
        success: false,
        error: '策略2暂未实现',
        strategyUsed: 'proxy-module'
      };
      
    } catch (error: any) {
      this.logger.error(`❌ 策略2失败: ${error.message}`);
      return {
        success: false,
        error: error.message,
        strategyUsed: 'proxy-module'
      };
    }
  }
  
  /**
   * 策略3: 全局对象注入
   * 在全局对象中设置vscode，希望真实组件使用它
   */
  private tryGlobalInjectionStrategy(componentPath: string): LoadResult {
    this.logger.log('🔄 尝试策略3: 全局对象注入');
    
    try {
      // 这种方法不太可能成功，因为真实组件使用require('vscode')而不是全局变量
      // 但我们可以尝试在全局设置，然后希望某些模块系统会使用它
      
      const vscodeMock = this.options.customVscodeMock || mockVscode;
      (global as any).vscode = vscodeMock;
      
      this.logger.log('⚠️  策略3不太可能成功，因为真实组件使用require()');
      return {
        success: false,
        error: '策略3无效：真实组件使用require("vscode")而不是全局变量',
        strategyUsed: 'global-injection'
      };
      
    } catch (error: any) {
      this.logger.error(`❌ 策略3失败: ${error.message}`);
      return {
        success: false,
        error: error.message,
        strategyUsed: 'global-injection'
      };
    }
  }
  
  /**
   * 主要加载方法
   */
  public load(): LoadResult {
    this.logger.log('🚀 开始加载真实EnhancedEngineAdapter组件');
    
    // 1. 查找真实组件路径
    const componentPath = this.options.realComponentPath || this.findRealComponentPath();
    if (!componentPath) {
      return {
        success: false,
        error: '找不到真实EnhancedEngineAdapter组件文件'
      };
    }
    
    this.logger.log(`📁 使用组件路径: ${componentPath}`);
    
    // 2. 按顺序尝试各种策略
    const strategies = this.options.strategies || ['cache-injection'];
    
    for (const strategy of strategies) {
      this.logger.log(`\n--- 尝试策略: ${strategy} ---`);
      
      let result: LoadResult;
      switch (strategy) {
        case 'cache-injection':
          result = this.tryCacheInjectionStrategy(componentPath);
          break;
        case 'proxy-module':
          result = this.tryProxyModuleStrategy(componentPath);
          break;
        case 'global-injection':
          result = this.tryGlobalInjectionStrategy(componentPath);
          break;
        default:
          result = {
            success: false,
            error: `未知策略: ${strategy}`
          };
      }
      
      if (result.success) {
        this.logger.log(`🎉 策略 ${strategy} 成功加载真实组件`);
        return result;
      }
      
      this.logger.log(`⚠️  策略 ${strategy} 失败: ${result.error}`);
    }
    
    // 所有策略都失败
    return {
      success: false,
      error: '所有加载策略都失败'
    };
  }
  
  /**
   * 创建真实EnhancedEngineAdapter实例
   */
  public createInstance(config: any): any {
    this.logger.log('🔧 尝试创建真实EnhancedEngineAdapter实例');
    
    const loadResult = this.load();
    if (!loadResult.success) {
      throw new Error(`无法加载真实组件: ${loadResult.error}`);
    }
    
    if (!loadResult.EnhancedEngineAdapter) {
      throw new Error('加载成功但未获取到EnhancedEngineAdapter类');
    }
    
    try {
      const EnhancedEngineAdapter = loadResult.EnhancedEngineAdapter;
      const instance = EnhancedEngineAdapter.getInstance(config);
      
      this.logger.log('✅ 成功创建真实EnhancedEngineAdapter实例');
      return instance;
    } catch (error: any) {
      throw new Error(`创建实例失败: ${error.message}`);
    }
  }
}

// ==================== 导出 ====================

/**
 * 尝试加载真实EnhancedEngineAdapter
 */
export async function loadRealEnhancedEngineAdapter(): Promise<LoadResult> {
  const loader = new RealComponentLoader({ verbose: true });
  return loader.load();
}

/**
 * 创建真实EnhancedEngineAdapter实例
 */
export async function createRealEnhancedEngineAdapterInstance(config: any): Promise<any> {
  const loader = new RealComponentLoader({ verbose: true });
  return loader.createInstance(config);
}

export default RealComponentLoader;