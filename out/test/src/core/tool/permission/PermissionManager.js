"use strict";
/**
 * 权限管理器
 * 管理Claude Code三层权限架构的规则
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
exports.PermissionManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PermissionTypes_1 = require("./PermissionTypes");
/**
 * 权限管理器
 */
class PermissionManager {
    config;
    rules = new Map();
    ruleIndex = new Map();
    autoSaveTimer = null;
    changeListeners = [];
    constructor(config = {}) {
        this.config = {
            rulesDirectory: path.join(process.cwd(), '.codeline', 'permissions'),
            autoSave: true,
            autoSaveDelay: 5000,
            enableValidation: true,
            logOperations: true,
            defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ,
            enableStrictMode: false,
            enableAudit: true,
            ...config
        };
        // 初始化索引
        this.initializeIndex();
        // 加载现有规则
        this.loadRules();
    }
    /**
     * 初始化索引
     */
    initializeIndex() {
        Object.values(PermissionTypes_1.PermissionSource).forEach(source => {
            this.ruleIndex.set(source, new Set());
        });
    }
    /**
     * 添加规则
     */
    addRule(rule) {
        // 验证规则
        if (this.config.enableValidation && !this.validateRule(rule)) {
            return false;
        }
        // 检查重复ID
        if (this.rules.has(rule.id)) {
            return false;
        }
        // 设置默认值
        const now = new Date();
        const enhancedRule = {
            ...rule,
            metadata: {
                createdAt: now,
                updatedAt: now,
                enabled: true,
                version: '1.0.0',
                ...rule.metadata
            }
        };
        // 存储规则
        this.rules.set(enhancedRule.id, enhancedRule);
        // 更新索引
        const sourceIndex = this.ruleIndex.get(enhancedRule.source);
        if (sourceIndex) {
            sourceIndex.add(enhancedRule.id);
        }
        // 触发事件
        this.notifyChange({
            type: 'added',
            ruleId: enhancedRule.id,
            source: enhancedRule.source,
            timestamp: now
        });
        // 自动保存
        this.scheduleAutoSave();
        return true;
    }
    /**
     * 更新规则
     */
    updateRule(ruleId, updates) {
        const existingRule = this.rules.get(ruleId);
        if (!existingRule) {
            return false;
        }
        // 创建更新后的规则
        const updatedRule = {
            ...existingRule,
            ...updates,
            metadata: {
                ...existingRule.metadata,
                ...updates.metadata,
                updatedAt: new Date()
            }
        };
        // 验证规则
        if (this.config.enableValidation && !this.validateRule(updatedRule)) {
            return false;
        }
        // 检查是否需要更新索引（source变更）
        if (updates.source && updates.source !== existingRule.source) {
            // 从旧索引移除
            const oldSourceIndex = this.ruleIndex.get(existingRule.source);
            if (oldSourceIndex) {
                oldSourceIndex.delete(ruleId);
            }
            // 添加到新索引
            const newSourceIndex = this.ruleIndex.get(updates.source);
            if (newSourceIndex) {
                newSourceIndex.add(ruleId);
            }
        }
        // 更新规则
        this.rules.set(ruleId, updatedRule);
        // 触发事件
        this.notifyChange({
            type: 'updated',
            ruleId,
            source: updatedRule.source,
            timestamp: new Date()
        });
        // 自动保存
        this.scheduleAutoSave();
        return true;
    }
    /**
     * 删除规则
     */
    removeRule(ruleId) {
        const rule = this.rules.get(ruleId);
        if (!rule) {
            return false;
        }
        // 从索引中移除
        const sourceIndex = this.ruleIndex.get(rule.source);
        if (sourceIndex) {
            sourceIndex.delete(ruleId);
        }
        // 移除规则
        this.rules.delete(ruleId);
        // 触发事件
        this.notifyChange({
            type: 'removed',
            ruleId,
            source: rule.source,
            timestamp: new Date()
        });
        // 自动保存
        this.scheduleAutoSave();
        return true;
    }
    /**
     * 获取规则
     */
    getRule(ruleId) {
        return this.rules.get(ruleId);
    }
    /**
     * 获取规则列表
     */
    getRules(options) {
        let rules = Array.from(this.rules.values());
        // 过滤来源
        if (options?.source) {
            rules = rules.filter(rule => rule.source === options.source);
        }
        // 过滤工具ID
        if (options?.toolId) {
            rules = rules.filter(rule => rule.toolId === options.toolId);
        }
        // 过滤动作
        if (options?.action) {
            rules = rules.filter(rule => rule.action === options.action);
        }
        // 过滤启用状态
        if (options?.enabled !== undefined) {
            rules = rules.filter(rule => rule.metadata?.enabled === options.enabled);
        }
        return rules;
    }
    /**
     * 根据来源获取规则
     */
    getRulesBySource(source) {
        const ruleIds = this.ruleIndex.get(source);
        if (!ruleIds) {
            return [];
        }
        const rules = [];
        ruleIds.forEach(ruleId => {
            const rule = this.rules.get(ruleId);
            if (rule) {
                rules.push(rule);
            }
        });
        return rules;
    }
    /**
     * 导入规则
     */
    importRules(rules) {
        const result = {
            successCount: 0,
            failureCount: 0,
            failures: [],
            warnings: []
        };
        rules.forEach(rule => {
            try {
                if (this.addRule(rule)) {
                    result.successCount++;
                }
                else {
                    result.failureCount++;
                    result.failures.push({
                        rule,
                        error: '规则验证失败或ID重复'
                    });
                }
            }
            catch (error) {
                result.failureCount++;
                result.failures.push({
                    rule,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        });
        // 触发事件
        if (result.successCount > 0) {
            this.notifyChange({
                type: 'imported',
                timestamp: new Date()
            });
        }
        return result;
    }
    /**
     * 导出规则
     */
    exportRules(options) {
        let rules = Array.from(this.rules.values());
        // 过滤来源
        if (options?.sources && options.sources.length > 0) {
            rules = rules.filter(rule => options.sources.includes(rule.source));
        }
        // 过滤规则ID
        if (options?.ruleIds && options.ruleIds.length > 0) {
            rules = rules.filter(rule => options.ruleIds.includes(rule.id));
        }
        // 过滤元数据
        if (!options?.includeMetadata) {
            rules = rules.map(rule => {
                const { metadata, ...ruleWithoutMetadata } = rule;
                return ruleWithoutMetadata;
            });
        }
        // 包含默认规则
        if (options?.includeDefaults) {
            const defaultRules = this.getDefaultRules();
            rules = [...defaultRules, ...rules];
        }
        return rules;
    }
    /**
     * 保存到文件
     */
    async saveToFile(filePath) {
        const savePath = filePath || path.join(this.config.rulesDirectory, 'rules.json');
        try {
            // 确保目录存在
            await fs.promises.mkdir(path.dirname(savePath), { recursive: true });
            // 导出所有规则
            const rules = this.exportRules({
                includeMetadata: true,
                includeDefaults: false
            });
            // 转换为JSON
            const data = {
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                rules,
                metadata: {
                    totalRules: rules.length,
                    sources: {
                        [PermissionTypes_1.PermissionSource.SYSTEM]: rules.filter(r => r.source === PermissionTypes_1.PermissionSource.SYSTEM).length,
                        [PermissionTypes_1.PermissionSource.USER]: rules.filter(r => r.source === PermissionTypes_1.PermissionSource.USER).length,
                        [PermissionTypes_1.PermissionSource.SESSION]: rules.filter(r => r.source === PermissionTypes_1.PermissionSource.SESSION).length
                    }
                }
            };
            // 写入文件
            await fs.promises.writeFile(savePath, JSON.stringify(data, null, 2), 'utf-8');
            if (this.config.logOperations) {
                console.log(`权限规则已保存到: ${savePath}`);
            }
        }
        catch (error) {
            throw new Error(`保存权限规则失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 从文件加载
     */
    async loadFromFile(filePath) {
        const loadPath = filePath || path.join(this.config.rulesDirectory, 'rules.json');
        try {
            // 检查文件是否存在
            await fs.promises.access(loadPath);
            // 读取文件
            const content = await fs.promises.readFile(loadPath, 'utf-8');
            const data = JSON.parse(content);
            // 验证数据结构
            if (!data.rules || !Array.isArray(data.rules)) {
                throw new Error('无效的规则文件格式');
            }
            // 导入规则
            const importResult = this.importRules(data.rules);
            if (this.config.logOperations) {
                console.log(`从 ${loadPath} 加载权限规则: ${importResult.successCount} 成功, ${importResult.failureCount} 失败`);
            }
        }
        catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                // 文件不存在，使用默认规则
                if (this.config.logOperations) {
                    console.log(`权限规则文件不存在: ${loadPath}，使用默认规则`);
                }
                this.loadDefaultRules();
            }
            else {
                throw new Error(`加载权限规则失败: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
    /**
     * 加载默认规则
     */
    loadDefaultRules() {
        const defaultRules = this.getDefaultRules();
        defaultRules.forEach(rule => this.addRule(rule));
    }
    /**
     * 获取默认规则
     */
    getDefaultRules() {
        const now = new Date();
        return [
            // 系统级安全规则
            {
                id: 'system-security-read-only',
                toolId: '*',
                pattern: '*',
                action: 'allow',
                conditions: [],
                source: PermissionTypes_1.PermissionSource.SYSTEM,
                priority: 100,
                createdAt: now,
                updatedAt: now,
                metadata: {
                    description: '系统安全规则：默认只读权限',
                    createdBy: 'system',
                    createdAt: now,
                    tags: ['security', 'read-only', 'default'],
                    enabled: true
                }
            },
            {
                id: 'system-deny-destructive',
                toolId: '*',
                pattern: '*',
                action: 'deny',
                conditions: [],
                source: PermissionTypes_1.PermissionSource.SYSTEM,
                priority: 95,
                createdAt: now,
                updatedAt: now,
                metadata: {
                    description: '系统安全规则：拒绝破坏性操作',
                    createdBy: 'system',
                    createdAt: now,
                    tags: ['security', 'destructive', 'default'],
                    enabled: true
                }
            },
            // 用户级默认规则
            {
                id: 'user-default-ask-write',
                toolId: '*',
                pattern: '*',
                action: 'ask',
                conditions: [],
                source: PermissionTypes_1.PermissionSource.USER,
                priority: 50,
                createdAt: now,
                updatedAt: now,
                metadata: {
                    description: '用户默认规则：写入操作需要确认',
                    createdBy: 'default',
                    createdAt: now,
                    tags: ['default', 'write', 'ask'],
                    enabled: true
                }
            },
            // 会话级默认规则
            {
                id: 'session-auto-allow-read',
                toolId: '*',
                pattern: '*',
                action: 'allow',
                conditions: [],
                source: PermissionTypes_1.PermissionSource.SESSION,
                priority: 10,
                createdAt: now,
                updatedAt: now,
                metadata: {
                    description: '会话默认规则：自动允许只读操作',
                    createdBy: 'default',
                    createdAt: now,
                    tags: ['default', 'read', 'auto-allow'],
                    enabled: true
                }
            }
        ];
    }
    /**
     * 加载所有规则（从配置目录）
     */
    async loadRules() {
        try {
            // 加载用户规则文件
            await this.loadFromFile();
            // 加载系统规则文件（如果存在）
            const systemRulesPath = this.config.systemRulesPath;
            if (systemRulesPath) {
                try {
                    await this.loadFromFile(systemRulesPath);
                }
                catch (error) {
                    // 系统规则文件不存在也没关系
                    if (this.config.logOperations) {
                        console.log(`系统规则文件不存在: ${systemRulesPath}`);
                    }
                }
            }
        }
        catch (error) {
            console.error('加载权限规则失败:', error);
            // 加载默认规则作为后备
            this.loadDefaultRules();
        }
    }
    /**
     * 验证规则
     */
    validateRule(rule) {
        // 检查必需字段
        if (!rule.id || !rule.toolId || !rule.action || !rule.source) {
            return false;
        }
        // 检查ID格式
        if (!/^[a-z0-9_-]+$/i.test(rule.id)) {
            return false;
        }
        // 检查优先级范围
        if (rule.priority < 0 || rule.priority > 100) {
            return false;
        }
        // 检查来源有效性
        if (!Object.values(PermissionTypes_1.PermissionSource).includes(rule.source)) {
            return false;
        }
        // 检查动作有效性
        if (!['allow', 'deny', 'ask'].includes(rule.action)) {
            return false;
        }
        return true;
    }
    /**
     * 调度自动保存
     */
    scheduleAutoSave() {
        if (!this.config.autoSave) {
            return;
        }
        // 清除现有定时器
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        // 设置新的定时器
        this.autoSaveTimer = setTimeout(() => {
            this.saveToFile().catch(error => {
                console.error('自动保存权限规则失败:', error);
            });
        }, this.config.autoSaveDelay);
    }
    /**
     * 通知变更
     */
    notifyChange(event) {
        this.changeListeners.forEach(listener => {
            try {
                listener(event);
            }
            catch (error) {
                console.error('权限变更监听器错误:', error);
            }
        });
    }
    /**
     * 添加变更监听器
     */
    addChangeListener(listener) {
        this.changeListeners.push(listener);
    }
    /**
     * 移除变更监听器
     */
    removeChangeListener(listener) {
        const index = this.changeListeners.indexOf(listener);
        if (index > -1) {
            this.changeListeners.splice(index, 1);
        }
    }
    /**
     * 获取统计信息
     */
    getStats() {
        const rules = Array.from(this.rules.values());
        const bySource = {
            [PermissionTypes_1.PermissionSource.SYSTEM]: 0,
            [PermissionTypes_1.PermissionSource.USER]: 0,
            [PermissionTypes_1.PermissionSource.SESSION]: 0
        };
        const byAction = {
            allow: 0,
            deny: 0,
            ask: 0
        };
        let enabledRules = 0;
        rules.forEach(rule => {
            bySource[rule.source] = (bySource[rule.source] || 0) + 1;
            byAction[rule.action] = (byAction[rule.action] || 0) + 1;
            if (rule.metadata?.enabled) {
                enabledRules++;
            }
        });
        return {
            totalRules: rules.length,
            bySource,
            byAction,
            enabledRules
        };
    }
    /**
     * 清理资源
     */
    dispose() {
        // 清除定时器
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        // 清除监听器
        this.changeListeners = [];
        // 保存最终状态
        if (this.config.autoSave) {
            this.saveToFile().catch(console.error);
        }
    }
}
exports.PermissionManager = PermissionManager;
//# sourceMappingURL=PermissionManager.js.map