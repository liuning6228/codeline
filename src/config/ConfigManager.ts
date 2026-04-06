/**
 * 统一配置管理器
 * 管理CodeLine的所有配置，提供统一的配置界面和持久化
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * 权限配置
 */
export interface PermissionConfig {
  /** 默认权限模式 */
  defaultMode: 'auto' | 'always' | 'ask' | 'deny' | 'sandbox';
  /** 是否启用AI分类器 */
  enableClassifier: boolean;
  /** 是否启用规则学习 */
  enableRuleLearning: boolean;
  /** 是否记录权限决策 */
  enableLogging: boolean;
  /** 默认风险阈值 */
  riskThreshold: number;
  /** 自动拒绝高风险操作 */
  autoDenyHighRisk: boolean;
  /** 高风险操作列表 */
  highRiskPatterns: Array<{
    pattern: string;
    description: string;
    riskLevel: number;
  }>;
}

/**
 * 工具配置
 */
export interface ToolConfig {
  /** 默认超时时间（毫秒） */
  defaultTimeout: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 是否需要批准 */
  requireApproval: boolean;
  /** 是否自动执行 */
  autoExecute: boolean;
  /** 是否验证参数 */
  validateParams: boolean;
  /** 是否支持并发 */
  concurrencySafe: boolean;
  /** 是否只读 */
  readOnly: boolean;
  /** 是否破坏性 */
  destructive: boolean;
}

/**
 * 执行器配置
 */
export interface ExecutorConfig {
  /** 最大并发执行数 */
  maxConcurrent: number;
  /** 默认超时时间（毫秒） */
  defaultTimeout: number;
  /** 是否启用缓存 */
  enableCache: boolean;
  /** 缓存最大大小 */
  cacheMaxSize: number;
  /** 是否启用重试 */
  enableRetry: boolean;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 是否启用沙箱 */
  enableSandbox: boolean;
  /** 沙箱超时时间（毫秒） */
  sandboxTimeout: number;
}

/**
 * UI配置
 */
export interface UIConfig {
  /** 是否启用暗色主题 */
  darkTheme: boolean;
  /** 是否显示进度条 */
  showProgress: boolean;
  /** 是否显示详细输出 */
  showVerboseOutput: boolean;
  /** 最大输出行数 */
  maxOutputLines: number;
  /** 是否自动滚动 */
  autoScroll: boolean;
  /** 是否显示工具提示 */
  showTooltips: boolean;
}

/**
 * 完整配置
 */
export interface CodeLineConfig {
  /** 权限配置 */
  permissions: PermissionConfig;
  /** 工具配置 */
  tools: Record<string, ToolConfig>;
  /** 执行器配置 */
  executor: ExecutorConfig;
  /** UI配置 */
  ui: UIConfig;
  /** 版本 */
  version: string;
  /** 最后更新时间 */
  lastUpdated: Date;
}

/**
 * 配置变更事件
 */
export interface ConfigChangeEvent<T = any> {
  /** 配置键 */
  key: string;
  /** 旧值 */
  oldValue: T;
  /** 新值 */
  newValue: T;
  /** 变更时间 */
  timestamp: Date;
}

/**
 * 配置变更监听器
 */
export type ConfigChangeListener<T = any> = (event: ConfigChangeEvent<T>) => void;

/**
 * 配置管理器
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: CodeLineConfig;
  private configFile: string;
  private listeners: Map<string, Set<ConfigChangeListener>> = new Map();
  private isLoaded = false;

  private constructor() {
    // 默认配置
    this.config = this.getDefaultConfig();
    this.configFile = path.join(
      vscode.workspace.rootPath || process.cwd(),
      '.codeline',
      'config.json'
    );
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 加载配置
   */
  public async load(): Promise<boolean> {
    try {
      await fs.mkdir(path.dirname(this.configFile), { recursive: true });
      
      if (await this.fileExists(this.configFile)) {
        const fileData = await fs.readFile(this.configFile, 'utf8');
        const savedConfig = JSON.parse(fileData);
        
        // 合并保存的配置和默认配置
        this.config = this.mergeConfigs(this.getDefaultConfig(), savedConfig);
        this.config.lastUpdated = new Date(savedConfig.lastUpdated || Date.now());
      } else {
        // 保存默认配置
        await this.save();
      }
      
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('加载配置失败:', error);
      this.config = this.getDefaultConfig();
      this.isLoaded = false;
      return false;
    }
  }

  /**
   * 保存配置
   */
  public async save(): Promise<boolean> {
    try {
      await fs.mkdir(path.dirname(this.configFile), { recursive: true });
      
      const configToSave = { ...this.config };
      configToSave.lastUpdated = new Date();
      
      const configData = JSON.stringify(configToSave, null, 2);
      await fs.writeFile(this.configFile, configData, 'utf8');
      
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      return false;
    }
  }

  /**
   * 获取完整配置
   */
  public getConfig(): CodeLineConfig {
    return { ...this.config };
  }

  /**
   * 获取权限配置
   */
  public getPermissionConfig(): PermissionConfig {
    return { ...this.config.permissions };
  }

  /**
   * 获取工具配置
   */
  public getToolConfig(toolId?: string): ToolConfig | Record<string, ToolConfig> {
    if (toolId) {
      const toolConfig = this.config.tools[toolId];
      return toolConfig ? { ...toolConfig } : this.getDefaultToolConfig();
    }
    return { ...this.config.tools };
  }

  /**
   * 获取执行器配置
   */
  public getExecutorConfig(): ExecutorConfig {
    return { ...this.config.executor };
  }

  /**
   * 获取UI配置
   */
  public getUIConfig(): UIConfig {
    return { ...this.config.ui };
  }

  /**
   * 更新配置
   */
  public async updateConfig(updates: Partial<CodeLineConfig>): Promise<boolean> {
    const oldConfig = { ...this.config };
    
    // 应用更新
    this.config = this.mergeConfigs(this.config, updates);
    this.config.lastUpdated = new Date();
    
    // 触发变更事件
    this.triggerChangeEvents(oldConfig, this.config);
    
    // 保存到文件
    return await this.save();
  }

  /**
   * 更新权限配置
   */
  public async updatePermissionConfig(updates: Partial<PermissionConfig>): Promise<boolean> {
    return this.updateConfig({
      permissions: { ...this.config.permissions, ...updates }
    });
  }

  /**
   * 更新工具配置
   */
  public async updateToolConfig(toolId: string, updates: Partial<ToolConfig>): Promise<boolean> {
    const toolConfigs = { ...this.config.tools };
    toolConfigs[toolId] = { ...this.getDefaultToolConfig(), ...toolConfigs[toolId], ...updates };
    
    return this.updateConfig({
      tools: toolConfigs
    });
  }

  /**
   * 更新执行器配置
   */
  public async updateExecutorConfig(updates: Partial<ExecutorConfig>): Promise<boolean> {
    return this.updateConfig({
      executor: { ...this.config.executor, ...updates }
    });
  }

  /**
   * 更新UI配置
   */
  public async updateUIConfig(updates: Partial<UIConfig>): Promise<boolean> {
    return this.updateConfig({
      ui: { ...this.config.ui, ...updates }
    });
  }

  /**
   * 重置为默认配置
   */
  public async resetToDefaults(): Promise<boolean> {
    this.config = this.getDefaultConfig();
    return await this.save();
  }

  /**
   * 导出配置
   */
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 导入配置
   */
  public async importConfig(configJson: string): Promise<boolean> {
    try {
      const importedConfig = JSON.parse(configJson);
      this.config = this.mergeConfigs(this.getDefaultConfig(), importedConfig);
      return await this.save();
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }

  /**
   * 添加配置变更监听器
   */
  public addChangeListener<T = any>(key: string, listener: ConfigChangeListener<T>): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
  }

  /**
   * 移除配置变更监听器
   */
  public removeChangeListener<T = any>(key: string, listener: ConfigChangeListener<T>): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 获取配置文件路径
   */
  public getConfigFilePath(): string {
    return this.configFile;
  }

  /**
   * 检查配置是否已加载
   */
  public isConfigLoaded(): boolean {
    return this.isLoaded;
  }

  // ==================== 私有方法 ====================

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): CodeLineConfig {
    return {
      permissions: {
        defaultMode: 'auto',
        enableClassifier: true,
        enableRuleLearning: true,
        enableLogging: true,
        riskThreshold: 7,
        autoDenyHighRisk: true,
        highRiskPatterns: [
          { pattern: 'rm -rf /', description: '删除根目录', riskLevel: 10 },
          { pattern: 'dd if=/dev/zero', description: '磁盘清零', riskLevel: 9 },
          { pattern: 'mkfs', description: '格式化磁盘', riskLevel: 9 },
          { pattern: 'chmod -R 777 /', description: '修改根目录权限', riskLevel: 8 },
          { pattern: 'wget * | sh', description: '远程脚本执行', riskLevel: 9 },
          { pattern: 'curl * | sh', description: '远程脚本执行', riskLevel: 9 }
        ]
      },
      tools: {
        'default': this.getDefaultToolConfig(),
        'bash': {
          ...this.getDefaultToolConfig(),
          requireApproval: true,
          destructive: true,
          defaultTimeout: 60000
        },
        'enhanced-bash': {
          ...this.getDefaultToolConfig(),
          requireApproval: true,
          destructive: true,
          defaultTimeout: 60000
        },
        'file': {
          ...this.getDefaultToolConfig(),
          requireApproval: false,
          destructive: false,
          readOnly: false
        },
        'git': {
          ...this.getDefaultToolConfig(),
          requireApproval: true,
          destructive: true
        }
      },
      executor: {
        maxConcurrent: 5,
        defaultTimeout: 30000,
        enableCache: true,
        cacheMaxSize: 100,
        enableRetry: true,
        maxRetries: 3,
        retryDelay: 1000,
        enableSandbox: true,
        sandboxTimeout: 60000
      },
      ui: {
        darkTheme: true,
        showProgress: true,
        showVerboseOutput: false,
        maxOutputLines: 1000,
        autoScroll: true,
        showTooltips: true
      },
      version: '1.0.0',
      lastUpdated: new Date()
    };
  }

  /**
   * 获取默认工具配置
   */
  private getDefaultToolConfig(): ToolConfig {
    return {
      defaultTimeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      requireApproval: true,
      autoExecute: false,
      validateParams: true,
      concurrencySafe: false,
      readOnly: false,
      destructive: false
    };
  }

  /**
   * 合并配置（深度合并）
   */
  private mergeConfigs<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] !== undefined) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          // 深度合并对象
          result[key] = this.mergeConfigs(result[key] as any, source[key] as any);
        } else {
          // 直接赋值
          result[key] = source[key] as any;
        }
      }
    }
    
    return result;
  }

  /**
   * 触发变更事件
   */
  private triggerChangeEvents(oldConfig: CodeLineConfig, newConfig: CodeLineConfig): void {
    // 比较并触发事件
    const compareAndTrigger = (key: string, oldValue: any, newValue: any) => {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        const event: ConfigChangeEvent = {
          key,
          oldValue,
          newValue,
          timestamp: new Date()
        };
        
        const listeners = this.listeners.get(key);
        if (listeners) {
          listeners.forEach(listener => {
            try {
              listener(event);
            } catch (error) {
              console.error(`配置变更监听器错误 (${key}):`, error);
            }
          });
        }
      }
    };
    
    // 比较顶层配置
    compareAndTrigger('permissions', oldConfig.permissions, newConfig.permissions);
    compareAndTrigger('executor', oldConfig.executor, newConfig.executor);
    compareAndTrigger('ui', oldConfig.ui, newConfig.ui);
    
    // 比较工具配置
    compareAndTrigger('tools', oldConfig.tools, newConfig.tools);
    
    // 触发全局变更事件
    compareAndTrigger('*', oldConfig, newConfig);
  }

  /**
   * 检查文件是否存在
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 创建配置管理器实例
 */
export function createConfigManager(): ConfigManager {
  return ConfigManager.getInstance();
}

/**
 * 配置键常量
 */
export const ConfigKeys = {
  PERMISSIONS: 'permissions',
  TOOLS: 'tools',
  EXECUTOR: 'executor',
  UI: 'ui',
  VERSION: 'version'
} as const;