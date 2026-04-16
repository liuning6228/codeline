/**
 * CodeLineExtension模拟对象
 * 模拟真实CodeLineExtension的核心功能，用于提供依赖注入
 */

import { MockModelAdapter } from './ModelAdapter';
import { MockProjectAnalyzer } from './ProjectAnalyzer';
import { MockPromptEngine } from './PromptEngine';

// ==================== 类型定义 ====================

/**
 * CodeLineExtension模拟配置
 */
export interface CodeLineExtensionConfig {
  modelAdapter?: any;
  projectAnalyzer?: any;
  promptEngine?: any;
  verbose?: boolean;
}

// ==================== CodeLineExtension模拟 ====================

export class MockCodeLineExtension {
  private config: CodeLineExtensionConfig;
  private modelAdapter: any;
  private projectAnalyzer: any;
  private promptEngine: any;
  private isActivated: boolean;
  
  constructor(config: CodeLineExtensionConfig = {}) {
    console.log('MockCodeLineExtension: 创建实例');
    this.config = config;
    this.isActivated = false;
    
    // 初始化依赖（使用配置中的实例或创建新的模拟实例）
    this.modelAdapter = config.modelAdapter || new MockModelAdapter();
    this.projectAnalyzer = config.projectAnalyzer || new MockProjectAnalyzer();
    this.promptEngine = config.promptEngine || new MockPromptEngine();
    
    if (config.verbose) {
      console.log('MockCodeLineExtension: 详细模式已启用');
    }
  }
  
  // ========== 核心属性 ==========
  
  /**
   * 获取模型适配器
   */
  getModelAdapter(): any {
    return this.modelAdapter;
  }
  
  /**
   * 获取项目分析器
   */
  getProjectAnalyzer(): any {
    return this.projectAnalyzer;
  }
  
  /**
   * 获取提示引擎
   */
  getPromptEngine(): any {
    return this.promptEngine;
  }
  
  // ========== 扩展生命周期方法 ==========
  
  /**
   * 模拟扩展激活
   */
  async activate(): Promise<boolean> {
    console.log('MockCodeLineExtension: 激活扩展');
    
    try {
      // 模拟激活过程
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.isActivated = true;
      console.log('MockCodeLineExtension: 扩展激活成功');
      
      return true;
    } catch (error) {
      console.error('MockCodeLineExtension: 扩展激活失败:', error);
      return false;
    }
  }
  
  /**
   * 模拟扩展停用
   */
  async deactivate(): Promise<void> {
    console.log('MockCodeLineExtension: 停用扩展');
    this.isActivated = false;
  }
  
  /**
   * 检查扩展是否已激活
   */
  isActive(): boolean {
    return this.isActivated;
  }
  
  // ========== 扩展功能方法 ==========
  
  /**
   * 获取扩展版本
   */
  getVersion(): string {
    return '1.0.0-mock';
  }
  
  /**
   * 获取扩展名称
   */
  getName(): string {
    return 'CodeLine Mock Extension';
  }
  
  /**
   * 获取扩展配置
   */
  getConfiguration(): any {
    return {
      name: this.getName(),
      version: this.getVersion(),
      isActive: this.isActive(),
      dependencies: {
        modelAdapter: this.modelAdapter !== undefined,
        projectAnalyzer: this.projectAnalyzer !== undefined,
        promptEngine: this.promptEngine !== undefined
      }
    };
  }
  
  /**
   * 获取扩展上下文（模拟vscode扩展上下文）
   */
  getExtensionContext(): any {
    return {
      subscriptions: [],
      extensionPath: process.cwd(),
      extensionUri: { fsPath: process.cwd(), toString: () => `file://${process.cwd()}` },
      workspaceState: {
        get: (key: string, defaultValue?: any) => defaultValue,
        update: (key: string, value: any) => Promise.resolve(),
        keys: () => []
      },
      globalState: {
        get: (key: string, defaultValue?: any) => defaultValue,
        update: (key: string, value: any) => Promise.resolve(),
        keys: () => []
      }
    };
  }
  
  // ========== 依赖注入方法 ==========
  
  /**
   * 设置模型适配器
   */
  setModelAdapter(adapter: any): void {
    console.log('MockCodeLineExtension: 设置模型适配器');
    this.modelAdapter = adapter;
  }
  
  /**
   * 设置项目分析器
   */
  setProjectAnalyzer(analyzer: any): void {
    console.log('MockCodeLineExtension: 设置项目分析器');
    this.projectAnalyzer = analyzer;
  }
  
  /**
   * 设置提示引擎
   */
  setPromptEngine(engine: any): void {
    console.log('MockCodeLineExtension: 设置提示引擎');
    this.promptEngine = engine;
  }
  
  // ========== 工具方法 ==========
  
  /**
   * 获取所有可用工具
   */
  getAvailableTools(): string[] {
    return [
      'modelAdapter',
      'projectAnalyzer',
      'promptEngine'
    ];
  }
  
  /**
   * 检查依赖是否可用
   */
  checkDependencies(): { [key: string]: boolean } {
    return {
      modelAdapter: this.modelAdapter !== undefined,
      projectAnalyzer: this.projectAnalyzer !== undefined,
      promptEngine: this.promptEngine !== undefined
    };
  }
}

// ==================== 导出 ====================

export default MockCodeLineExtension;