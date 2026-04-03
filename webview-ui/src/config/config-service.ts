/**
 * CodeLine 配置服务
 * 基于Claude Code的配置驱动对话引擎模式 (CP-20260401-001)
 * 提供配置加载、验证、管理和热更新功能
 */

import { 
  CodeLineConfig, 
  defaultConfig 
} from './codeline-config';
import vscode from '../lib/vscode';

/**
 * 配置服务类 - 单例模式
 */
export class ConfigService {
  private static instance: ConfigService;
  private config: CodeLineConfig;
  private configListeners: Array<(config: CodeLineConfig) => void> = [];
  
  private constructor() {
    // 初始化使用默认配置
    this.config = { ...defaultConfig };
  }
  
  /**
   * 获取配置服务实例
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }
  
  /**
   * 加载配置
   * 优先从VS Code扩展加载，如果失败则使用默认配置
   */
  public async loadConfig(): Promise<CodeLineConfig> {
    try {
      // 尝试从VS Code扩展加载配置
      if (vscode.isInVSCode()) {
        console.log('Loading configuration from VS Code extension...');
        
        // 发送配置加载请求
        vscode.postMessage({
          command: 'loadConfig',
        });
        
        // 在真实实现中，这里应该等待VS Code返回配置
        // 暂时使用默认配置并模拟延迟
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 实际应该接收配置，这里返回默认配置
        return this.config;
      } else {
        // 非VS Code环境使用默认配置
        console.log('Running in non-VSCode environment, using default configuration');
        return this.config;
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      return this.config; // 出错时返回默认配置
    }
  }
  
  /**
   * 获取当前配置
   */
  public getConfig(): CodeLineConfig {
    return { ...this.config };
  }
  
  /**
   * 更新配置（部分更新）
   */
  public async updateConfig(updates: Partial<CodeLineConfig>): Promise<void> {
    try {
      const oldConfig = { ...this.config };
      const newConfig = { ...this.config, ...updates };
      
      // 验证配置
      this.validateConfig(newConfig);
      
      // 更新本地配置
      this.config = newConfig;
      
      // 更新配置元数据
      this.config.metadata = {
        ...this.config.metadata,
        lastModified: Date.now(),
      };
      
      // 保存到VS Code扩展（如果可用）
      if (vscode.isInVSCode()) {
        await this.saveToVSCode(newConfig);
      }
      
      // 通知配置更新
      this.notifyConfigChange(newConfig);
      
      console.log('Configuration updated successfully');
    } catch (error) {
      console.error('Failed to update configuration:', error);
      throw error;
    }
  }
  
  /**
   * 重置为默认配置
   */
  public async resetToDefaults(): Promise<void> {
    await this.updateConfig(defaultConfig);
  }
  
  /**
   * 验证配置
   */
  private validateConfig(config: CodeLineConfig): void {
    // 基本验证
    if (!config.views) {
      throw new Error('Configuration must have views section');
    }
    
    if (!config.taskExecution) {
      throw new Error('Configuration must have taskExecution section');
    }
    
    if (!config.model) {
      throw new Error('Configuration must have model section');
    }
    
    if (!config.tools) {
      throw new Error('Configuration must have tools section');
    }
    
    if (!config.ui) {
      throw new Error('Configuration must have ui section');
    }
    
    // 视图配置验证
    this.validateViewConfig(config.views);
    
    // 任务执行配置验证
    this.validateTaskExecutionConfig(config.taskExecution);
    
    // 模型配置验证
    this.validateModelConfig(config.model);
    
    // 工具配置验证
    this.validateToolConfig(config.tools);
    
    // UI配置验证
    this.validateUIConfig(config.ui);
  }
  
  /**
   * 验证视图配置
   */
  private validateViewConfig(views: CodeLineConfig['views']): void {
    // 确保至少一个视图启用
    const enabledViews = Object.values(views).filter(view => view.enabled);
    if (enabledViews.length === 0) {
      throw new Error('At least one view must be enabled');
    }
    
    // 特定视图验证
    if (views.chat.enabled && !views.chat.showTaskSection) {
      console.warn('Chat view enabled but task section is hidden');
    }
    
    if (views.mcp.enabled && views.mcp.maxConnections < 0) {
      throw new Error('MCP maxConnections must be non-negative');
    }
    
    if (views.worktrees.enabled && views.worktrees.maxSnapshots < 0) {
      throw new Error('Worktrees maxSnapshots must be non-negative');
    }
  }
  
  /**
   * 验证任务执行配置
   */
  private validateTaskExecutionConfig(taskExecution: CodeLineConfig['taskExecution']): void {
    if (taskExecution.maxConcurrentTasks < 1) {
      throw new Error('maxConcurrentTasks must be at least 1');
    }
    
    if (taskExecution.taskTimeoutMs < 0) {
      throw new Error('taskTimeoutMs must be non-negative');
    }
    
    if (!taskExecution.allowedToolTypes || taskExecution.allowedToolTypes.length === 0) {
      throw new Error('allowedToolTypes must contain at least one tool type');
    }
  }
  
  /**
   * 验证模型配置
   */
  private validateModelConfig(model: CodeLineConfig['model']): void {
    if (model.maxTokens < 1) {
      throw new Error('maxTokens must be at least 1');
    }
    
    if (model.temperature < 0 || model.temperature > 2) {
      throw new Error('temperature must be between 0 and 2');
    }
    
    if (model.contextWindow < 1) {
      throw new Error('contextWindow must be at least 1');
    }
  }
  
  /**
   * 验证工具配置
   */
  private validateToolConfig(tools: CodeLineConfig['tools']): void {
    if (tools.maxConcurrentTools < 1) {
      throw new Error('maxConcurrentTools must be at least 1');
    }
    
    // 验证默认工具
    if (tools.defaultTools) {
      tools.defaultTools.forEach((tool, index) => {
        if (!tool.name || !tool.type) {
          throw new Error(`Default tool at index ${index} must have name and type`);
        }
      });
    }
  }
  
  /**
   * 验证UI配置
   */
  private validateUIConfig(ui: CodeLineConfig['ui']): void {
    if (!['light', 'dark', 'system'].includes(ui.theme)) {
      throw new Error('theme must be one of: light, dark, system');
    }
    
    if (!['small', 'medium', 'large'].includes(ui.fontSize)) {
      throw new Error('fontSize must be one of: small, medium, large');
    }
    
    if (ui.animations.duration < 0) {
      throw new Error('animation duration must be non-negative');
    }
  }
  
  /**
   * 保存配置到VS Code扩展
   */
  private async saveToVSCode(config: CodeLineConfig): Promise<void> {
    try {
      // 发送配置保存请求
      vscode.postMessage({
        command: 'saveConfig',
        config,
      });
      
      // 模拟异步保存
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('Configuration saved to VS Code extension');
    } catch (error) {
      console.error('Failed to save configuration to VS Code:', error);
      throw error;
    }
  }
  
  /**
   * 添加配置变更监听器
   */
  public addConfigChangeListener(listener: (config: CodeLineConfig) => void): void {
    this.configListeners.push(listener);
  }
  
  /**
   * 移除配置变更监听器
   */
  public removeConfigChangeListener(listener: (config: CodeLineConfig) => void): void {
    const index = this.configListeners.indexOf(listener);
    if (index > -1) {
      this.configListeners.splice(index, 1);
    }
  }
  
  /**
   * 通知配置变更
   */
  private notifyConfigChange(config: CodeLineConfig): void {
    // 复制配置以避免外部修改
    const configCopy = { ...config };
    
    // 通知所有监听器
    this.configListeners.forEach(listener => {
      try {
        listener(configCopy);
      } catch (error) {
        console.error('Error in config change listener:', error);
      }
    });
  }
  
  /**
   * 获取特定视图的配置
   */
  public getViewConfig<T extends keyof CodeLineConfig['views']>(viewName: T): CodeLineConfig['views'][T] {
    return { ...this.config.views[viewName] };
  }
  
  /**
   * 检查视图是否启用
   */
  public isViewEnabled(viewName: keyof CodeLineConfig['views']): boolean {
    return this.config.views[viewName]?.enabled || false;
  }
  
  /**
   * 获取所有启用的视图名称
   */
  public getEnabledViews(): string[] {
    return Object.entries(this.config.views)
      .filter(([_, config]) => config.enabled)
      .map(([name]) => name);
  }
  
  /**
   * 导出配置为JSON字符串
   */
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }
  
  /**
   * 从JSON字符串导入配置
   */
  public async importConfig(configJson: string): Promise<void> {
    try {
      const parsedConfig = JSON.parse(configJson);
      await this.updateConfig(parsedConfig);
    } catch (error) {
      console.error('Failed to import configuration:', error);
      throw new Error('Invalid configuration JSON');
    }
  }
}