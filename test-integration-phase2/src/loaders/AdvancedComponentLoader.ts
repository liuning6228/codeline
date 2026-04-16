/**
 * 高级组件加载器
 * 基于RealComponentLoader增强，添加接口验证和更好的错误处理
 */

import * as path from 'path';
import { EnhancedVscodeMock, createEnhancedVscodeMock } from '../mocks/EnhancedVscodeMock';
import { InterfaceValidator, EnhancedEngineAdapterSpec, ValidationResult } from '../utils/InterfaceValidator';

// ==================== 类型定义 ====================

export interface AdvancedLoadResult {
  success: boolean;
  error?: string;
  module?: any;
  EnhancedEngineAdapter?: any;
  instance?: any;
  validationResult?: ValidationResult;
  strategyUsed?: string;
  debugInfo?: {
    moduleExports: string[];
    classMethods: string[];
    instanceMethods: string[];
    vscodeCalls: any[];
  };
}

export interface AdvancedLoadOptions {
  // 加载策略
  strategies?: ('require-proxy' | 'vm-isolation' | 'compile-memory')[];
  
  // 调试模式
  verbose?: boolean;
  
  // 真实组件路径（如果为null，自动查找）
  realComponentPath?: string;
  
  // vscode模拟配置
  vscodeMockOptions?: any;
  
  // 是否验证接口
  validateInterface?: boolean;
  
  // 是否创建实例
  createInstance?: boolean;
  
  // 实例配置
  instanceConfig?: any;
}

// ==================== 高级组件加载器 ====================

export class AdvancedComponentLoader {
  private options: AdvancedLoadOptions;
  private vscodeMock: any;
  
  constructor(options: AdvancedLoadOptions = {}) {
    this.options = {
      strategies: ['require-proxy'],
      verbose: true,
      validateInterface: true,
      createInstance: true,
      vscodeMockOptions: {
        verbose: false,
        logCalls: true,
        strictMode: false,
        dynamicProxy: true
      },
      instanceConfig: this.getDefaultInstanceConfig(),
      ...options
    };
    
    // 创建增强的vscode模拟
    this.vscodeMock = createEnhancedVscodeMock(this.options.vscodeMockOptions);
  }
  
  /**
   * 获取默认的实例配置
   */
  private getDefaultInstanceConfig(): any {
    return {
      extension: {
        modelAdapter: {
          generate: async (prompt: string) => ({
            content: `模拟响应: ${prompt.substring(0, 100)}...`,
            usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
            model: 'mock-model'
          })
        },
        projectAnalyzer: {
          analyzeProject: async () => ({ files: [] })
        },
        promptEngine: {
          generatePrompt: async () => '模拟提示词'
        },
        verbose: false
      },
      context: {
        extensionPath: process.cwd(),
        subscriptions: [],
        extensionUri: { fsPath: process.cwd() },
        storagePath: process.cwd(),
        globalStoragePath: process.cwd(),
        logPath: process.cwd(),
        extensionMode: 1 // ExtensionMode.Test
      },
      verbose: true,
      defaultMode: 'act',
      enableStreaming: false
    };
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
      if (require('fs').existsSync(p)) {
        if (this.options.verbose) {
          console.log(`📁 找到真实组件: ${p}`);
        }
        return p;
      }
    }
    
    return null;
  }
  
  /**
   * 策略1: require代理（增强版）
   */
  private async tryRequireProxyStrategy(componentPath: string): Promise<AdvancedLoadResult> {
    const debugInfo: any = {
      moduleExports: [],
      classMethods: [],
      instanceMethods: [],
      vscodeCalls: []
    };
    
    if (this.options.verbose) {
      console.log('🔄 尝试策略: require代理（增强版）');
    }
    
    try {
      const Module = require('module');
      const originalRequire = Module.prototype.require;
      
      // 拦截require调用
      Module.prototype.require = function(id: string) {
        if (this.options.verbose && id.includes('vscode')) {
          console.log(`🔍 拦截模块请求: ${id}`);
        }
        
        if (id === 'vscode') {
          debugInfo.vscodeCalls.push({
            timestamp: Date.now(),
            caller: this.filename ? path.basename(this.filename) : 'unknown',
            module: 'vscode'
          });
          return this.vscodeMock;
        }
        
        // 对其他vscode相关模块也进行拦截
        if (id.includes('vscode') || id.includes('@vscode')) {
          debugInfo.vscodeCalls.push({
            timestamp: Date.now(),
            caller: this.filename ? path.basename(this.filename) : 'unknown',
            module: id
          });
          
          // 返回一个基本模拟
          const mockModule: any = {
            // 根据模块名提供特定模拟
          };
          
          if (id.includes('languageclient')) {
            mockModule.LanguageClient = class LanguageClient {
              constructor() {}
              start() { return Promise.resolve(); }
              sendRequest() { return Promise.resolve(); }
            };
          }
          
          return mockModule;
        }
        
        return originalRequire.apply(this, arguments);
      };
      
      // 加载真实组件
      if (this.options.verbose) {
        console.log(`🔧 加载组件: ${componentPath}`);
      }
      
      // 清除缓存
      delete require.cache[require.resolve(componentPath)];
      const module = require(componentPath);
      
      // 恢复原始require
      Module.prototype.require = originalRequire;
      
      // 分析模块导出
      debugInfo.moduleExports = Object.keys(module);
      
      // 查找EnhancedEngineAdapter类
      let EnhancedEngineAdapter = this.findEnhancedEngineAdapter(module);
      if (!EnhancedEngineAdapter) {
        return {
          success: false,
          error: '无法在模块中找到EnhancedEngineAdapter类',
          debugInfo,
          strategyUsed: 'require-proxy'
        };
      }
      
      debugInfo.classMethods = Object.getOwnPropertyNames(EnhancedEngineAdapter.prototype || {});
      
      // 验证接口（如果启用）
      let validationResult: ValidationResult | undefined;
      let instance: any;
      
      if (this.options.createInstance) {
        // 创建实例
        instance = await this.createAdapterInstance(EnhancedEngineAdapter);
        if (!instance) {
          return {
            success: false,
            error: '无法创建EnhancedEngineAdapter实例',
            debugInfo,
            strategyUsed: 'require-proxy'
          };
        }
        
        debugInfo.instanceMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance) || {});
        
        // 验证接口
        if (this.options.validateInterface) {
          validationResult = InterfaceValidator.validate(instance, EnhancedEngineAdapterSpec);
          
          if (this.options.verbose) {
            console.log(InterfaceValidator.generateReport(validationResult));
          }
          
          if (!validationResult.passed && validationResult.score < 50) {
            return {
              success: false,
              error: `接口验证失败: 分数${validationResult.score}/100`,
              module,
              EnhancedEngineAdapter,
              instance,
              validationResult,
              debugInfo,
              strategyUsed: 'require-proxy'
            };
          }
        }
      }
      
      return {
        success: true,
        module,
        EnhancedEngineAdapter,
        instance,
        validationResult,
        debugInfo,
        strategyUsed: 'require-proxy'
      };
      
    } catch (error: any) {
      const errorMsg = `require代理策略失败: ${error.message}`;
      if (this.options.verbose) {
        console.error(`❌ ${errorMsg}`);
        console.error(error.stack);
      }
      
      return {
        success: false,
        error: errorMsg,
        debugInfo,
        strategyUsed: 'require-proxy'
      };
    }
  }
  
  /**
   * 在模块中查找EnhancedEngineAdapter类
   */
  private findEnhancedEngineAdapter(module: any): any {
    // 尝试多种导出方式
    
    // 1. 模块本身就是类
    if (typeof module === 'function') {
      return module;
    }
    
    // 2. 命名导出
    if (module.EnhancedEngineAdapter) {
      return module.EnhancedEngineAdapter;
    }
    
    // 3. 默认导出中的类
    if (module.default) {
      if (typeof module.default === 'function') {
        return module.default;
      }
      if (module.default.EnhancedEngineAdapter) {
        return module.default.EnhancedEngineAdapter;
      }
    }
    
    // 4. 查找任何看起来像EnhancedEngineAdapter的类
    for (const key of Object.keys(module)) {
      const value = module[key];
      if (typeof value === 'function' && 
          (key.includes('EnhancedEngineAdapter') || key.includes('EnhancedEngine'))) {
        return value;
      }
    }
    
    return null;
  }
  
  /**
   * 创建适配器实例
   */
  private async createAdapterInstance(EnhancedEngineAdapter: any): Promise<any> {
    try {
      const config = this.options.instanceConfig || this.getDefaultInstanceConfig();
      
      // 尝试多种实例化方式
      if (typeof EnhancedEngineAdapter.getInstance === 'function') {
        return EnhancedEngineAdapter.getInstance(config);
      }
      
      if (typeof EnhancedEngineAdapter === 'function') {
        return new EnhancedEngineAdapter(config);
      }
      
      // 尝试调用其他可能的工厂方法
      const possibleFactoryMethods = ['create', 'build', 'construct', 'newInstance'];
      for (const methodName of possibleFactoryMethods) {
        if (typeof EnhancedEngineAdapter[methodName] === 'function') {
          return EnhancedEngineAdapter[methodName](config);
        }
      }
      
      return null;
    } catch (error: any) {
      if (this.options.verbose) {
        console.error(`❌ 创建实例失败: ${error.message}`);
      }
      return null;
    }
  }
  
  /**
   * 策略2: VM隔离（未来实现）
   */
  private async tryVmIsolationStrategy(componentPath: string): Promise<AdvancedLoadResult> {
    if (this.options.verbose) {
      console.log('🔄 尝试策略: VM隔离（暂未实现）');
    }
    
    return {
      success: false,
      error: 'VM隔离策略暂未实现',
      strategyUsed: 'vm-isolation'
    };
  }
  
  /**
   * 主要加载方法
   */
  public async load(): Promise<AdvancedLoadResult> {
    if (this.options.verbose) {
      console.log('🚀 开始加载真实EnhancedEngineAdapter组件（高级模式）');
    }
    
    // 1. 查找真实组件路径
    const componentPath = this.options.realComponentPath || this.findRealComponentPath();
    if (!componentPath) {
      return {
        success: false,
        error: '找不到真实EnhancedEngineAdapter组件文件'
      };
    }
    
    if (this.options.verbose) {
      console.log(`📁 使用组件路径: ${componentPath}`);
    }
    
    // 2. 按顺序尝试各种策略
    const strategies = this.options.strategies || ['require-proxy'];
    
    for (const strategy of strategies) {
      if (this.options.verbose) {
        console.log(`\n--- 尝试策略: ${strategy} ---`);
      }
      
      let result: AdvancedLoadResult;
      switch (strategy) {
        case 'require-proxy':
          result = await this.tryRequireProxyStrategy(componentPath);
          break;
        case 'vm-isolation':
          result = await this.tryVmIsolationStrategy(componentPath);
          break;
        default:
          result = {
            success: false,
            error: `未知策略: ${strategy}`
          };
      }
      
      if (result.success) {
        if (this.options.verbose) {
          console.log(`🎉 策略 ${strategy} 成功加载真实组件`);
          
          if (result.instance && this.options.validateInterface && result.validationResult) {
            console.log(`📊 接口验证分数: ${result.validationResult.score}/100`);
          }
        }
        return result;
      }
      
      if (this.options.verbose) {
        console.log(`⚠️  策略 ${strategy} 失败: ${result.error}`);
      }
    }
    
    // 所有策略都失败
    return {
      success: false,
      error: '所有加载策略都失败'
    };
  }
  
  /**
   * 获取加载统计信息
   */
  public getStats(): any {
    if (this.vscodeMock.getCallStats) {
      return this.vscodeMock.getCallStats();
    }
    return { totalCalls: 0 };
  }
}

// ==================== 导出函数 ====================

/**
 * 高级加载真实EnhancedEngineAdapter
 */
export async function loadRealEnhancedEngineAdapterAdvanced(options?: AdvancedLoadOptions): Promise<AdvancedLoadResult> {
  const loader = new AdvancedComponentLoader(options);
  return loader.load();
}

/**
 * 验证真实组件的接口
 */
export async function validateRealComponentInterface(instance: any): Promise<ValidationResult> {
  return InterfaceValidator.validate(instance, EnhancedEngineAdapterSpec);
}

export default AdvancedComponentLoader;