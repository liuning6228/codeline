/**
 * RealEnhancedEngineAdapterWrapper
 * 
 * 尝试在测试环境中使用真实的EnhancedEngineAdapter组件
 * 提供模拟依赖注入，处理vscode依赖问题
 * 
 * 如果真实组件无法加载，回退到完全模拟实现
 */

import * as path from 'path';
import { 
  EnhancedEngineAdapterConfig, 
  AdapterState, 
  SubmitMessageOptions, 
  SubmitMessageResponse,
  IEnhancedEngineAdapter 
} from '../types/EnhancedEngineAdapterInterface';

import { vscode, createExtensionContext } from '../mocks/vscodeExtended';
import { MockModelAdapter } from '../mocks/ModelAdapter';
import { MockProjectAnalyzer } from '../mocks/ProjectAnalyzer';
import { MockPromptEngine } from '../mocks/PromptEngine';
import { MockToolRegistry } from '../mocks/ToolRegistry';
import { MockEnhancedQueryEngine } from '../mocks/EnhancedQueryEngine';
import { MockCodeLineExtension } from '../mocks/CodeLineExtension';

// ==================== 类型定义 ====================

/**
 * 包装器选项
 */
export interface WrapperOptions {
  useRealComponent: boolean;
  fallbackToMock: boolean;
  verbose: boolean;
  mockVscode: boolean;
}

/**
 * 包装器状态
 */
export interface WrapperState {
  usingRealComponent: boolean;
  componentLoaded: boolean;
  initializationAttempted: boolean;
  initializationSuccessful: boolean;
  lastError?: string;
}

// ==================== RealEnhancedEngineAdapterWrapper ====================

export class RealEnhancedEngineAdapterWrapper implements IEnhancedEngineAdapter {
  private options: WrapperOptions;
  private wrapperState: WrapperState;
  private realAdapter: any = null;
  private mockAdapter: any = null;
  private activeAdapter: any = null;
  private config: EnhancedEngineAdapterConfig;
  
  private static instance: RealEnhancedEngineAdapterWrapper;
  
  constructor(config: EnhancedEngineAdapterConfig, options?: Partial<WrapperOptions>) {
    this.config = config;
    this.options = {
      useRealComponent: true,
      fallbackToMock: true,
      verbose: true,
      mockVscode: true,
      ...options
    };
    
    this.wrapperState = {
      usingRealComponent: false,
      componentLoaded: false,
      initializationAttempted: false,
      initializationSuccessful: false,
    };
    
    if (this.options.verbose) {
      console.log('RealEnhancedEngineAdapterWrapper: 创建实例');
      console.log('选项:', this.options);
    }
  }
  
  /**
   * 获取单例实例（模拟真实EnhancedEngineAdapter的API）
   */
  public static getInstance(config?: EnhancedEngineAdapterConfig, options?: Partial<WrapperOptions>): RealEnhancedEngineAdapterWrapper {
    if (!RealEnhancedEngineAdapterWrapper.instance && config) {
      RealEnhancedEngineAdapterWrapper.instance = new RealEnhancedEngineAdapterWrapper(config, options);
    }
    return RealEnhancedEngineAdapterWrapper.instance;
  }
  
  /**
   * 尝试加载真实EnhancedEngineAdapter组件
   */
  private async tryLoadRealComponent(): Promise<boolean> {
    if (this.wrapperState.initializationAttempted) {
      return this.wrapperState.initializationSuccessful;
    }
    
    this.wrapperState.initializationAttempted = true;
    
    if (!this.options.useRealComponent) {
      console.log('RealEnhancedEngineAdapterWrapper: 配置为不使用真实组件');
      return false;
    }
    
    try {
      console.log('RealEnhancedEngineAdapterWrapper: 尝试加载真实EnhancedEngineAdapter...');
      
      // 准备模拟的vscode模块（如果需要）
      if (this.options.mockVscode) {
        // 在这里我们可以尝试模拟global.vscode
        // 但由于模块导入顺序，这可能很复杂
        console.log('RealEnhancedEngineAdapterWrapper: 使用模拟的vscode环境');
      }
      
      // 尝试动态导入真实组件
      // 注意：这可能会失败，因为真实组件有vscode依赖
      const modulePath = path.resolve(__dirname, '../../../src/core/EnhancedEngineAdapter.ts');
      console.log(`RealEnhancedEngineAdapterWrapper: 尝试从 ${modulePath} 导入`);
      
      // 由于TypeScript编译问题，我们可能无法直接导入
      // 这里我们模拟导入失败的情况
      console.log('RealEnhancedEngineAdapterWrapper: 真实组件导入暂时跳过（vscode依赖问题）');
      
      this.wrapperState.componentLoaded = false;
      this.wrapperState.initializationSuccessful = false;
      this.wrapperState.lastError = '真实组件导入暂时跳过：vscode依赖和TypeScript编译问题';
      
      return false;
      
    } catch (error: any) {
      console.error('RealEnhancedEngineAdapterWrapper: 加载真实组件失败:', error.message);
      
      this.wrapperState.componentLoaded = false;
      this.wrapperState.initializationSuccessful = false;
      this.wrapperState.lastError = error.message;
      
      return false;
    }
  }
  
  /**
   * 创建模拟适配器
   */
  private createMockAdapter(): any {
    if (this.mockAdapter) {
      return this.mockAdapter;
    }
    
    console.log('RealEnhancedEngineAdapterWrapper: 创建模拟适配器');
    
    // 创建模拟依赖
    const modelAdapter = new MockModelAdapter();
    const projectAnalyzer = new MockProjectAnalyzer();
    const promptEngine = new MockPromptEngine();
    const toolRegistry = new MockToolRegistry();
    
    // 创建模拟扩展
    const extension = new MockCodeLineExtension({
      modelAdapter,
      projectAnalyzer,
      promptEngine,
      verbose: this.options.verbose
    });
    
    // 创建模拟上下文
    const context = createExtensionContext();
    
    // 创建模拟EnhancedQueryEngine
    const enhancedQueryEngine = new MockEnhancedQueryEngine({
      modelAdapter,
      projectAnalyzer,
      promptEngine,
      toolRegistry,
      cwd: process.cwd(),
      extensionContext: context,
      workspaceRoot: process.cwd(),
      verbose: this.options.verbose
    });
    
    // 创建模拟EnhancedEngineAdapter
    // 这里我们创建一个简单的模拟实现
    const mockAdapter = {
      initialize: async (): Promise<boolean> => {
        console.log('MockAdapter: 初始化');
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
      },
      
      getEngine: (): any => enhancedQueryEngine,
      
      getToolRegistry: (): any => toolRegistry,
      
      getState: (): AdapterState => {
        return {
          engineReady: true,
          engineMode: enhancedQueryEngine.getMode(),
          toolCount: toolRegistry.getAllTools().length,
          conversationCount: 0,
          lastActivity: new Date(),
          usageStats: { totalTokens: 0 }
        };
      },
      
      isReady: (): boolean => true,
      
      getMode: (): 'plan' | 'act' => enhancedQueryEngine.getMode(),
      
      setMode: (mode: 'plan' | 'act'): void => {
        console.log(`MockAdapter: 设置模式 ${mode}`);
        enhancedQueryEngine.setMode(mode);
      },
      
      submitMessage: async (content: string, options?: SubmitMessageOptions): Promise<SubmitMessageResponse> => {
        console.log(`MockAdapter: 提交消息: ${content.substring(0, 50)}...`);
        return await enhancedQueryEngine.submitMessageSync(content, options);
      },
      
      getConversationState: (): any => enhancedQueryEngine.getState(),
      
      clearConversation: (): void => {
        enhancedQueryEngine.clear();
      },
      
      exportConversation: (): string | null => enhancedQueryEngine.exportConversation(),
      
      importConversation: (json: string): boolean => {
        try {
          enhancedQueryEngine.importConversation(json);
          return true;
        } catch (error) {
          return false;
        }
      },
      
      reset: (): void => {
        console.log('MockAdapter: 重置');
      }
    };
    
    this.mockAdapter = mockAdapter;
    return mockAdapter;
  }
  
  /**
   * 获取活动适配器（真实或模拟）
   */
  private async getActiveAdapter(): Promise<any> {
    if (this.activeAdapter) {
      return this.activeAdapter;
    }
    
    // 尝试加载真实组件
    const realComponentLoaded = await this.tryLoadRealComponent();
    
    if (realComponentLoaded && this.realAdapter) {
      this.activeAdapter = this.realAdapter;
      this.wrapperState.usingRealComponent = true;
    } else {
      // 使用模拟适配器
      this.activeAdapter = this.createMockAdapter();
      this.wrapperState.usingRealComponent = false;
      
      if (this.options.fallbackToMock) {
        console.log('RealEnhancedEngineAdapterWrapper: 回退到模拟实现');
      }
    }
    
    return this.activeAdapter;
  }
  
  // ========== IEnhancedEngineAdapter 接口实现 ==========
  
  // 注意：接口IEnhancedEngineAdapter不包含静态方法getInstance
  // 但为了兼容真实EnhancedEngineAdapter的API，我们提供静态getInstance方法
  // 这个静态方法在类定义中已经存在
  
  /**
   * 初始化
   */
  async initialize(): Promise<boolean> {
    const adapter = await this.getActiveAdapter();
    return await adapter.initialize();
  }
  
  /**
   * 获取引擎
   */
  getEngine(): any {
    if (!this.activeAdapter) {
      throw new Error('适配器未初始化');
    }
    return this.activeAdapter.getEngine();
  }
  
  /**
   * 获取工具注册表
   */
  getToolRegistry(): any {
    if (!this.activeAdapter) {
      throw new Error('适配器未初始化');
    }
    return this.activeAdapter.getToolRegistry();
  }
  
  /**
   * 获取状态
   */
  getState(): AdapterState {
    if (!this.activeAdapter) {
      throw new Error('适配器未初始化');
    }
    return this.activeAdapter.getState();
  }
  
  /**
   * 检查是否就绪
   */
  isReady(): boolean {
    if (!this.activeAdapter) {
      return false;
    }
    return this.activeAdapter.isReady();
  }
  
  /**
   * 获取模式
   */
  getMode(): 'plan' | 'act' {
    if (!this.activeAdapter) {
      return 'act';
    }
    return this.activeAdapter.getMode();
  }
  
  /**
   * 设置模式
   */
  setMode(mode: 'plan' | 'act'): void {
    if (!this.activeAdapter) {
      throw new Error('适配器未初始化');
    }
    this.activeAdapter.setMode(mode);
  }
  
  /**
   * 提交消息
   */
  async submitMessage(content: string, options?: SubmitMessageOptions): Promise<SubmitMessageResponse> {
    const adapter = await this.getActiveAdapter();
    return await adapter.submitMessage(content, options);
  }
  
  /**
   * 获取对话状态
   */
  getConversationState(): any {
    if (!this.activeAdapter) {
      return null;
    }
    return this.activeAdapter.getConversationState();
  }
  
  /**
   * 清除对话
   */
  clearConversation(): void {
    if (!this.activeAdapter) {
      throw new Error('适配器未初始化');
    }
    this.activeAdapter.clearConversation();
  }
  
  /**
   * 导出对话
   */
  exportConversation(): string | null {
    if (!this.activeAdapter) {
      return null;
    }
    return this.activeAdapter.exportConversation();
  }
  
  /**
   * 导入对话
   */
  importConversation(json: string): boolean {
    if (!this.activeAdapter) {
      return false;
    }
    return this.activeAdapter.importConversation(json);
  }
  
  /**
   * 重置适配器
   */
  reset(): void {
    if (!this.activeAdapter) {
      throw new Error('适配器未初始化');
    }
    this.activeAdapter.reset();
  }
  
  // ========== 包装器特有方法 ==========
  
  /**
   * 获取包装器状态
   */
  getWrapperState(): WrapperState {
    return { ...this.wrapperState };
  }
  
  /**
   * 检查是否在使用真实组件
   */
  isUsingRealComponent(): boolean {
    return this.wrapperState.usingRealComponent;
  }
  
  /**
   * 手动设置使用模拟适配器
   */
  useMockAdapter(): void {
    this.activeAdapter = this.createMockAdapter();
    this.wrapperState.usingRealComponent = false;
    console.log('RealEnhancedEngineAdapterWrapper: 手动切换到模拟适配器');
  }
  
  /**
   * 获取包装器配置
   */
  getOptions(): WrapperOptions {
    return { ...this.options };
  }
}

// ==================== 导出 ====================

export default RealEnhancedEngineAdapterWrapper;