/**
 * 统一配置管理器
 * 管理CodeLine的所有配置，提供统一的配置界面和持久化
 */
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
export declare class ConfigManager {
    private static instance;
    private config;
    private configFile;
    private listeners;
    private isLoaded;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): ConfigManager;
    /**
     * 加载配置
     */
    load(): Promise<boolean>;
    /**
     * 保存配置
     */
    save(): Promise<boolean>;
    /**
     * 获取完整配置
     */
    getConfig(): CodeLineConfig;
    /**
     * 获取权限配置
     */
    getPermissionConfig(): PermissionConfig;
    /**
     * 获取工具配置
     */
    getToolConfig(toolId?: string): ToolConfig | Record<string, ToolConfig>;
    /**
     * 获取执行器配置
     */
    getExecutorConfig(): ExecutorConfig;
    /**
     * 获取UI配置
     */
    getUIConfig(): UIConfig;
    /**
     * 更新配置
     */
    updateConfig(updates: Partial<CodeLineConfig>): Promise<boolean>;
    /**
     * 更新权限配置
     */
    updatePermissionConfig(updates: Partial<PermissionConfig>): Promise<boolean>;
    /**
     * 更新工具配置
     */
    updateToolConfig(toolId: string, updates: Partial<ToolConfig>): Promise<boolean>;
    /**
     * 更新执行器配置
     */
    updateExecutorConfig(updates: Partial<ExecutorConfig>): Promise<boolean>;
    /**
     * 更新UI配置
     */
    updateUIConfig(updates: Partial<UIConfig>): Promise<boolean>;
    /**
     * 重置为默认配置
     */
    resetToDefaults(): Promise<boolean>;
    /**
     * 导出配置
     */
    exportConfig(): string;
    /**
     * 导入配置
     */
    importConfig(configJson: string): Promise<boolean>;
    /**
     * 添加配置变更监听器
     */
    addChangeListener<T = any>(key: string, listener: ConfigChangeListener<T>): void;
    /**
     * 移除配置变更监听器
     */
    removeChangeListener<T = any>(key: string, listener: ConfigChangeListener<T>): void;
    /**
     * 获取配置文件路径
     */
    getConfigFilePath(): string;
    /**
     * 检查配置是否已加载
     */
    isConfigLoaded(): boolean;
    /**
     * 获取默认配置
     */
    private getDefaultConfig;
    /**
     * 获取默认工具配置
     */
    private getDefaultToolConfig;
    /**
     * 合并配置（深度合并）
     */
    private mergeConfigs;
    /**
     * 触发变更事件
     */
    private triggerChangeEvents;
    /**
     * 检查文件是否存在
     */
    private fileExists;
}
/**
 * 创建配置管理器实例
 */
export declare function createConfigManager(): ConfigManager;
/**
 * 配置键常量
 */
export declare const ConfigKeys: {
    readonly PERMISSIONS: "permissions";
    readonly TOOLS: "tools";
    readonly EXECUTOR: "executor";
    readonly UI: "ui";
    readonly VERSION: "version";
};
//# sourceMappingURL=ConfigManager.d.ts.map