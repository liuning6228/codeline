"use strict";
/**
 * 统一配置管理器
 * 管理CodeLine的所有配置，提供统一的配置界面和持久化
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigKeys = exports.ConfigManager = void 0;
exports.createConfigManager = createConfigManager;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
/**
 * 配置管理器
 */
class ConfigManager {
    static instance;
    config;
    configFile;
    listeners = new Map();
    isLoaded = false;
    constructor() {
        // 默认配置
        this.config = this.getDefaultConfig();
        this.configFile = path.join(vscode.workspace.rootPath || process.cwd(), '.codeline', 'config.json');
    }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    /**
     * 加载配置
     */
    async load() {
        try {
            await fs.mkdir(path.dirname(this.configFile), { recursive: true });
            if (await this.fileExists(this.configFile)) {
                const fileData = await fs.readFile(this.configFile, 'utf8');
                const savedConfig = JSON.parse(fileData);
                // 合并保存的配置和默认配置
                this.config = this.mergeConfigs(this.getDefaultConfig(), savedConfig);
                this.config.lastUpdated = new Date(savedConfig.lastUpdated || Date.now());
            }
            else {
                // 保存默认配置
                await this.save();
            }
            this.isLoaded = true;
            return true;
        }
        catch (error) {
            console.error('加载配置失败:', error);
            this.config = this.getDefaultConfig();
            this.isLoaded = false;
            return false;
        }
    }
    /**
     * 保存配置
     */
    async save() {
        try {
            await fs.mkdir(path.dirname(this.configFile), { recursive: true });
            const configToSave = { ...this.config };
            configToSave.lastUpdated = new Date();
            const configData = JSON.stringify(configToSave, null, 2);
            await fs.writeFile(this.configFile, configData, 'utf8');
            return true;
        }
        catch (error) {
            console.error('保存配置失败:', error);
            return false;
        }
    }
    /**
     * 获取完整配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 获取权限配置
     */
    getPermissionConfig() {
        return { ...this.config.permissions };
    }
    /**
     * 获取工具配置
     */
    getToolConfig(toolId) {
        if (toolId) {
            const toolConfig = this.config.tools[toolId];
            return toolConfig ? { ...toolConfig } : this.getDefaultToolConfig();
        }
        return { ...this.config.tools };
    }
    /**
     * 获取执行器配置
     */
    getExecutorConfig() {
        return { ...this.config.executor };
    }
    /**
     * 获取UI配置
     */
    getUIConfig() {
        return { ...this.config.ui };
    }
    /**
     * 更新配置
     */
    async updateConfig(updates) {
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
    async updatePermissionConfig(updates) {
        return this.updateConfig({
            permissions: { ...this.config.permissions, ...updates }
        });
    }
    /**
     * 更新工具配置
     */
    async updateToolConfig(toolId, updates) {
        const toolConfigs = { ...this.config.tools };
        toolConfigs[toolId] = { ...this.getDefaultToolConfig(), ...toolConfigs[toolId], ...updates };
        return this.updateConfig({
            tools: toolConfigs
        });
    }
    /**
     * 更新执行器配置
     */
    async updateExecutorConfig(updates) {
        return this.updateConfig({
            executor: { ...this.config.executor, ...updates }
        });
    }
    /**
     * 更新UI配置
     */
    async updateUIConfig(updates) {
        return this.updateConfig({
            ui: { ...this.config.ui, ...updates }
        });
    }
    /**
     * 重置为默认配置
     */
    async resetToDefaults() {
        this.config = this.getDefaultConfig();
        return await this.save();
    }
    /**
     * 导出配置
     */
    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }
    /**
     * 导入配置
     */
    async importConfig(configJson) {
        try {
            const importedConfig = JSON.parse(configJson);
            this.config = this.mergeConfigs(this.getDefaultConfig(), importedConfig);
            return await this.save();
        }
        catch (error) {
            console.error('导入配置失败:', error);
            return false;
        }
    }
    /**
     * 添加配置变更监听器
     */
    addChangeListener(key, listener) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(listener);
    }
    /**
     * 移除配置变更监听器
     */
    removeChangeListener(key, listener) {
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.delete(listener);
        }
    }
    /**
     * 获取配置文件路径
     */
    getConfigFilePath() {
        return this.configFile;
    }
    /**
     * 检查配置是否已加载
     */
    isConfigLoaded() {
        return this.isLoaded;
    }
    // ==================== 私有方法 ====================
    /**
     * 获取默认配置
     */
    getDefaultConfig() {
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
    getDefaultToolConfig() {
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
    mergeConfigs(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] !== undefined) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    // 深度合并对象
                    result[key] = this.mergeConfigs(result[key], source[key]);
                }
                else {
                    // 直接赋值
                    result[key] = source[key];
                }
            }
        }
        return result;
    }
    /**
     * 触发变更事件
     */
    triggerChangeEvents(oldConfig, newConfig) {
        // 比较并触发事件
        const compareAndTrigger = (key, oldValue, newValue) => {
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                const event = {
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
                        }
                        catch (error) {
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
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.ConfigManager = ConfigManager;
/**
 * 创建配置管理器实例
 */
function createConfigManager() {
    return ConfigManager.getInstance();
}
/**
 * 配置键常量
 */
exports.ConfigKeys = {
    PERMISSIONS: 'permissions',
    TOOLS: 'tools',
    EXECUTOR: 'executor',
    UI: 'ui',
    VERSION: 'version'
};
//# sourceMappingURL=ConfigManager.js.map