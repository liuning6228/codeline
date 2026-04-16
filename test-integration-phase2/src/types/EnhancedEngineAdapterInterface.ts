/**
 * EnhancedEngineAdapter公共API接口定义
 * 基于真实EnhancedEngineAdapter.ts提取的接口规范
 * 
 * 用于阶段3：适配器测试，确保模拟实现与真实组件接口兼容
 */

// ==================== 类型定义 ====================

/**
 * 增强引擎适配器配置
 */
export interface EnhancedEngineAdapterConfig {
  // 核心依赖（在测试环境中可能需要模拟）
  extension?: any; // CodeLineExtension类型，测试中可模拟
  context?: any;   // vscode.ExtensionContext类型，测试中可模拟
  
  // 引擎配置
  verbose?: boolean;
  enableStreaming?: boolean;
  defaultMode?: 'plan' | 'act';
  maxConcurrentTools?: number;
  
  // 工具配置
  toolRegistryConfig?: any; // Partial<ToolRegistryConfig>
  
  // 回调
  onEngineReady?: () => void;
  onStateUpdate?: (state: any) => void; // ConversationState类型
  onError?: (error: Error) => void;
}

/**
 * 适配器状态
 */
export interface AdapterState {
  engineReady: boolean;
  engineMode: 'plan' | 'act';
  toolCount: number;
  conversationCount: number;
  lastActivity: Date;
  usageStats?: any;
}

/**
 * 提交消息选项
 */
export interface SubmitMessageOptions {
  images?: string[];
  files?: string[];
  context?: Record<string, any>;
  skipThinking?: boolean;
  skipTools?: boolean;
}

/**
 * 提交消息响应
 */
export interface SubmitMessageResponse {
  success: boolean;
  message?: any;
  toolCalls?: any[];
  thinking?: string;
  error?: string;
}

// ==================== 核心接口 ====================

/**
 * EnhancedEngineAdapter公共接口
 * 这是真实EnhancedEngineAdapter暴露的所有公共方法的契约
 * 
 * 注意：接口不能强制静态方法，所以getInstance不是接口的一部分
 * 但真实EnhancedEngineAdapter确实有静态getInstance方法
 */
export interface IEnhancedEngineAdapter {
  // ========== 实例方法 ==========
  
  /**
   * 初始化增强查询引擎
   * 使用懒加载模式，避免启动时阻塞
   * @returns Promise<boolean> 初始化是否成功
   */
  initialize(): Promise<boolean>;
  
  /**
   * 获取当前引擎（如果已初始化）
   * @returns EnhancedQueryEngine实例或null
   */
  getEngine(): any | null;
  
  /**
   * 获取工具注册表
   * @returns EnhancedToolRegistry实例或null
   */
  getToolRegistry(): any | null;
  
  /**
   * 获取适配器状态
   * @returns AdapterState 适配器当前状态
   */
  getState(): AdapterState;
  
  /**
   * 检查引擎是否就绪
   * @returns boolean 引擎是否就绪
   */
  isReady(): boolean;
  
  /**
   * 获取引擎模式
   * @returns 'plan' | 'act' 当前引擎模式
   */
  getMode(): 'plan' | 'act';
  
  /**
   * 设置引擎模式
   * @param mode 要设置的引擎模式
   */
  setMode(mode: 'plan' | 'act'): void;
  
  /**
   * 提交消息到引擎（核心方法）
   * @param content 消息内容
   * @param options 消息选项
   * @returns Promise<SubmitMessageResponse> 消息处理结果
   */
  submitMessage(content: string, options?: SubmitMessageOptions): Promise<SubmitMessageResponse>;
  
  /**
   * 获取当前对话状态
   * @returns ConversationState或null
   */
  getConversationState(): any | null;
  
  /**
   * 清除当前对话
   */
  clearConversation(): void;
  
  /**
   * 导出当前对话
   * @returns string 对话JSON字符串或null
   */
  exportConversation(): string | null;
  
  /**
   * 导入对话
   * @param json 对话JSON字符串
   * @returns boolean 导入是否成功
   */
  importConversation(json: string): boolean;
  
  /**
   * 重置适配器
   */
  reset(): void;
}

// ==================== 依赖接口 ====================

/**
 * ModelAdapter接口（简化版本，用于测试）
 */
export interface IModelAdapter {
  generateResponse(messages: any[], options?: any): Promise<any>;
}

/**
 * ProjectAnalyzer接口（简化版本，用于测试）
 */
export interface IProjectAnalyzer {
  analyzeProject(projectPath: string): Promise<any>;
  getFileContext(filePath: string): Promise<any>;
}

/**
 * PromptEngine接口（简化版本，用于测试）
 */
export interface IPromptEngine {
  generatePrompt(context: any, task: string): Promise<string>;
  parseResponse(response: string, format: string): Promise<any>;
}

/**
 * ToolRegistry接口（简化版本，用于测试）
 */
export interface IToolRegistry {
  getAllTools(): any[];
  getToolsByCategory(category: string): any[];
  getTool(name: string): any | undefined;
  executeTool(name: string, args: any): Promise<any>;
  getCategories(): string[];
}

/**
 * EnhancedQueryEngine接口（简化版本，用于测试）
 */
export interface IEnhancedQueryEngine {
  submitMessageSync(content: string, options?: any): Promise<any>;
  getMode(): 'plan' | 'act';
  setMode(mode: 'plan' | 'act'): void;
  getState(): any;
  clear(): void;
  exportConversation(): string | null;
  importConversation(json: string): void;
}

// ==================== 常量定义 ====================

/**
 * 工具类别常量
 */
export const ToolCategory = {
  FILE: 'file',
  TERMINAL: 'terminal',
  BROWSER: 'browser',
  CODE: 'code',
  ANALYSIS: 'analysis',
  DEBUG: 'debug'
} as const;

/**
 * 引擎模式常量
 */
export const EngineMode = {
  PLAN: 'plan',
  ACT: 'act'
} as const;

// ==================== 测试辅助类型 ====================

/**
 * 模拟实现与真实组件的兼容性检查结果
 */
export interface CompatibilityCheckResult {
  interfaceName: string;
  methodsChecked: string[];
  allMethodsPresent: boolean;
  signatureMatches: boolean;
  issues?: string[];
}

/**
 * 依赖注入配置
 */
export interface DependencyInjectionConfig {
  modelAdapter?: IModelAdapter;
  projectAnalyzer?: IProjectAnalyzer;
  promptEngine?: IPromptEngine;
  toolRegistry?: IToolRegistry;
  enhancedQueryEngine?: IEnhancedQueryEngine;
  vscodeMock?: any;
  extensionMock?: any;
  contextMock?: any;
}

// ==================== 导出全部 ====================

// 注意：所有接口和类型已经在定义时使用export导出
// 不需要额外的导出语句