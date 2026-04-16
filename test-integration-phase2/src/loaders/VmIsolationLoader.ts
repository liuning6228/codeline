/**
 * VM隔离加载器
 * 使用Node.js vm模块在隔离环境中加载真实组件
 */

import * as path from 'path';
import * as fs from 'fs';
import { createEnhancedVscodeMock } from '../mocks/EnhancedVscodeMock';

// ==================== 类型定义 ====================

export interface VmLoadResult {
  success: boolean;
  error?: string;
  module?: any;
  EnhancedEngineAdapter?: any;
  instance?: any;
  vmContext?: any;
  executionTime?: number;
}

export interface VmLoadOptions {
  // 调试模式
  verbose?: boolean;
  
  // 真实组件路径
  componentPath?: string;
  
  // vscode模拟配置
  vscodeMockOptions?: any;
  
  // 是否创建实例
  createInstance?: boolean;
  
  // 实例配置
  instanceConfig?: any;
  
  // VM超时时间（毫秒）
  timeoutMs?: number;
}

// ==================== VM隔离加载器 ====================

export class VmIsolationLoader {
  private options: VmLoadOptions;
  private vscodeMock: any;
  
  constructor(options: VmLoadOptions = {}) {
    this.options = {
      verbose: true,
      timeoutMs: 10000,
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
    
    // 创建vscode模拟
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
      if (fs.existsSync(p)) {
        if (this.options.verbose) {
          console.log(`📁 找到真实组件: ${p}`);
        }
        return p;
      }
    }
    
    return null;
  }
  
  /**
   * 创建VM沙箱环境
   */
  private createVmSandbox(): any {
    const sandbox: any = {
      // 核心全局对象
      console: console,
      process: process,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval,
      
      // 模块系统
      require: this.createSandboxRequire(),
      
      // 导出对象
      exports: {},
      module: { exports: {} },
      
      // vscode模拟
      vscode: this.vscodeMock,
      
      // 其他可能需要的全局对象
      global: {}, // 将作为global的引用
      Buffer: Buffer,
      URL: URL,
      URLSearchParams: URLSearchParams,
      TextEncoder: TextEncoder,
      TextDecoder: TextDecoder,
      ArrayBuffer: ArrayBuffer,
      Uint8Array: Uint8Array,
      Uint16Array: Uint16Array,
      Uint32Array: Uint32Array,
      Int8Array: Int8Array,
      Int16Array: Int16Array,
      Int32Array: Int32Array,
      Float32Array: Float32Array,
      Float64Array: Float64Array,
      DataView: DataView,
      
      // 错误处理
      Error: Error,
      TypeError: TypeError,
      RangeError: RangeError,
      SyntaxError: SyntaxError,
      ReferenceError: ReferenceError,
      EvalError: EvalError,
      URIError: URIError,
      
      // 其他
      Math: Math,
      JSON: JSON,
      Date: Date,
      RegExp: RegExp,
      Promise: Promise,
      Symbol: Symbol,
      Map: Map,
      Set: Set,
      WeakMap: WeakMap,
      WeakSet: WeakSet,
      Proxy: Proxy,
      Reflect: Reflect,
    };
    
    // 设置global自引用
    sandbox.global = sandbox;
    
    return sandbox;
  }
  
  /**
   * 创建沙箱中的require函数
   */
  private createSandboxRequire(): Function {
    const originalRequire = require;
    const self = this;
    
    return function(id: string): any {
      if (self.options.verbose) {
        console.log(`[沙箱require] ${id}`);
      }
      
      // 拦截vscode相关模块
      if (id === 'vscode') {
        return self.vscodeMock;
      }
      
      if (id.includes('vscode') || id.includes('@vscode')) {
        // 返回基本模拟
        const mockModule: any = {};
        
        if (id.includes('languageclient')) {
          mockModule.LanguageClient = class LanguageClient {
            constructor() {}
            start() { return Promise.resolve(); }
            sendRequest() { return Promise.resolve(); }
          };
        }
        
        return mockModule;
      }
      
      // 对于Node.js核心模块，使用原始require
      const coreModules = [
        'fs', 'path', 'os', 'util', 'events', 'stream', 'child_process', 
        'crypto', 'http', 'https', 'net', 'dns', 'url', 'assert', 'buffer',
        'console', 'constants', 'domain', 'module', 'process', 'querystring',
        'readline', 'repl', 'string_decoder', 'timers', 'tty', 'vm', 'zlib'
      ];
      
      if (coreModules.includes(id)) {
        return originalRequire(id);
      }
      
      // 对于其他模块，尝试加载，如果失败返回模拟
      try {
        return originalRequire(id);
      } catch (error: any) {
        if (self.options.verbose) {
          console.log(`[沙箱require] 模块未找到: ${id}，返回模拟`);
        }
        
        // 返回模拟模块
        const mockModule: any = {};
        
        // 根据模块名提供特定模拟
        if (id.includes('typescript')) {
          mockModule.createProgram = () => ({});
          mockModule.SyntaxKind = {};
        }
        
        return mockModule;
      }
    };
  }
  
  /**
   * 主要加载方法
   */
  public async load(): Promise<VmLoadResult> {
    const startTime = Date.now();
    
    if (this.options.verbose) {
      console.log('🚀 开始VM隔离加载真实组件');
    }
    
    try {
      // 1. 查找组件路径
      const componentPath = this.options.componentPath || this.findRealComponentPath();
      if (!componentPath) {
        return {
          success: false,
          error: '找不到真实EnhancedEngineAdapter组件文件'
        };
      }
      
      if (this.options.verbose) {
        console.log(`📁 组件路径: ${componentPath}`);
      }
      
      // 2. 读取组件代码
      const componentCode = fs.readFileSync(componentPath, 'utf8');
      if (this.options.verbose) {
        console.log(`📄 代码大小: ${componentCode.length} 字符`);
      }
      
      // 3. 创建VM沙箱
      const vm = require('vm');
      const sandbox = this.createVmSandbox();
      
      // 4. 创建VM上下文
      const vmContext = vm.createContext(sandbox);
      
      // 5. 在VM中执行代码
      if (this.options.verbose) {
        console.log('🔧 在VM中执行组件代码...');
      }
      
      const script = new vm.Script(componentCode, {
        filename: componentPath,
        displayErrors: true,
        timeout: this.options.timeoutMs
      });
      
      script.runInContext(vmContext, {
        timeout: this.options.timeoutMs
      });
      
      // 6. 获取导出
      const moduleExports = vmContext.module.exports || vmContext.exports;
      if (this.options.verbose) {
        console.log('✅ VM执行成功');
        console.log('导出类型:', typeof moduleExports);
        if (typeof moduleExports === 'object') {
          console.log('导出键:', Object.keys(moduleExports));
        }
      }
      
      // 7. 查找EnhancedEngineAdapter类
      const EnhancedEngineAdapter = this.findEnhancedEngineAdapter(moduleExports);
      if (!EnhancedEngineAdapter) {
        return {
          success: false,
          error: '在VM导出的模块中找不到EnhancedEngineAdapter类',
          vmContext,
          executionTime: Date.now() - startTime
        };
      }
      
      if (this.options.verbose) {
        console.log('✅ 找到EnhancedEngineAdapter类');
        console.log('类类型:', typeof EnhancedEngineAdapter);
        
        if (EnhancedEngineAdapter.prototype) {
          const protoMethods = Object.getOwnPropertyNames(EnhancedEngineAdapter.prototype);
          console.log(`原型方法 (${protoMethods.length}个):`, protoMethods.slice(0, 10));
        }
      }
      
      // 8. 创建实例（如果启用）
      let instance: any;
      if (this.options.createInstance) {
        instance = await this.createInstanceInVm(EnhancedEngineAdapter, vmContext);
        if (!instance) {
          return {
            success: false,
            error: '无法在VM中创建实例',
            module: moduleExports,
            EnhancedEngineAdapter,
            vmContext,
            executionTime: Date.now() - startTime
          };
        }
      }
      
      const executionTime = Date.now() - startTime;
      
      if (this.options.verbose) {
        console.log(`⏱️  总执行时间: ${executionTime}ms`);
      }
      
      return {
        success: true,
        module: moduleExports,
        EnhancedEngineAdapter,
        instance,
        vmContext,
        executionTime
      };
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      const errorMsg = `VM隔离加载失败: ${error.message}`;
      
      if (this.options.verbose) {
        console.error(`❌ ${errorMsg}`);
        console.error('错误堆栈:', error.stack);
      }
      
      return {
        success: false,
        error: errorMsg,
        executionTime
      };
    }
  }
  
  /**
   * 在模块中查找EnhancedEngineAdapter类
   */
  private findEnhancedEngineAdapter(moduleExports: any): any {
    // 尝试多种导出方式
    
    // 1. 模块本身就是类
    if (typeof moduleExports === 'function') {
      return moduleExports;
    }
    
    // 2. 命名导出
    if (moduleExports.EnhancedEngineAdapter) {
      return moduleExports.EnhancedEngineAdapter;
    }
    
    // 3. 默认导出中的类
    if (moduleExports.default) {
      if (typeof moduleExports.default === 'function') {
        return moduleExports.default;
      }
      if (moduleExports.default.EnhancedEngineAdapter) {
        return moduleExports.default.EnhancedEngineAdapter;
      }
    }
    
    // 4. 查找任何看起来像EnhancedEngineAdapter的类
    if (typeof moduleExports === 'object') {
      for (const key of Object.keys(moduleExports)) {
        const value = moduleExports[key];
        if (typeof value === 'function' && 
            (key.includes('EnhancedEngineAdapter') || key.includes('EnhancedEngine'))) {
          return value;
        }
      }
    }
    
    return null;
  }
  
  /**
   * 在VM中创建实例
   */
  private async createInstanceInVm(EnhancedEngineAdapter: any, vmContext: any): Promise<any> {
    try {
      if (this.options.verbose) {
        console.log('🔧 在VM中创建实例...');
      }
      
      const config = this.options.instanceConfig || this.getDefaultInstanceConfig();
      
      // 尝试多种实例化方式
      if (typeof EnhancedEngineAdapter.getInstance === 'function') {
        if (this.options.verbose) {
          console.log('使用 getInstance() 方法');
        }
        return EnhancedEngineAdapter.getInstance(config);
      }
      
      if (typeof EnhancedEngineAdapter === 'function') {
        if (this.options.verbose) {
          console.log('使用 new 构造函数');
        }
        return new EnhancedEngineAdapter(config);
      }
      
      // 尝试其他可能的工厂方法
      const possibleFactoryMethods = ['create', 'build', 'construct', 'newInstance'];
      for (const methodName of possibleFactoryMethods) {
        if (typeof EnhancedEngineAdapter[methodName] === 'function') {
          if (this.options.verbose) {
            console.log(`使用 ${methodName}() 方法`);
          }
          return EnhancedEngineAdapter[methodName](config);
        }
      }
      
      return null;
    } catch (error: any) {
      if (this.options.verbose) {
        console.error(`❌ 在VM中创建实例失败: ${error.message}`);
      }
      return null;
    }
  }
}

// ==================== 导出函数 ====================

/**
 * 使用VM隔离加载真实EnhancedEngineAdapter
 */
export async function loadWithVmIsolation(options?: VmLoadOptions): Promise<VmLoadResult> {
  const loader = new VmIsolationLoader(options);
  return loader.load();
}

export default VmIsolationLoader;