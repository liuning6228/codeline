"use strict";
/**
 * 权限系统集成
 * 连接EnhancedBaseTool与新权限系统
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionIntegration = void 0;
exports.getPermissionIntegration = getPermissionIntegration;
exports.initializePermissionSystem = initializePermissionSystem;
exports.checkPermission = checkPermission;
exports.checkPermissionWithBaseResult = checkPermissionWithBaseResult;
const PermissionDecisionEngine_1 = require("./PermissionDecisionEngine");
const PermissionManager_1 = require("./PermissionManager");
const PermissionTypes_1 = require("./PermissionTypes");
const Tool_1 = require("../Tool");
/**
 * 权限系统集成器
 */
class PermissionIntegration {
    decisionEngine;
    permissionManager;
    config;
    isInitialized = false;
    constructor(config = { enabled: true }) {
        this.config = {
            autoLoadRules: true,
            defaultConflictStrategy: PermissionDecisionEngine_1.ConflictResolutionStrategy.HIGHEST_PRIORITY,
            ...config
        };
        // 创建决策引擎
        this.decisionEngine = new PermissionDecisionEngine_1.PermissionDecisionEngine({
            conflictResolutionStrategy: this.config.defaultConflictStrategy,
            enableCaching: true,
            cacheTTL: 30000
        });
        // 创建权限管理器
        this.permissionManager = new PermissionManager_1.PermissionManager({
            autoSave: true,
            enableValidation: true,
            logOperations: true
        });
    }
    /**
     * 初始化权限系统
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }
        try {
            // 加载权限规则
            if (this.config.autoLoadRules) {
                await this.permissionManager.loadFromFile();
            }
            this.isInitialized = true;
            console.log('权限系统初始化完成');
            return true;
        }
        catch (error) {
            console.error('权限系统初始化失败:', error);
            return false;
        }
    }
    /**
     * 检查工具权限
     */
    async checkToolPermission(toolId, toolName, input, toolUseContext) {
        // 如果不启用权限系统，返回默认允许
        if (!this.config.enabled) {
            return this.createDefaultAllowDecision(toolId);
        }
        // 确保已初始化
        if (!this.isInitialized) {
            await this.initialize();
        }
        // 创建评估上下文
        const evaluationContext = this.createEvaluationContext(toolId, toolName, input, toolUseContext);
        // 使用决策引擎评估
        return this.decisionEngine.evaluate(evaluationContext);
    }
    /**
     * 转换权限决策为基本权限结果（向后兼容）
     */
    convertToBasePermissionResult(decision) {
        return {
            allowed: decision.allowed,
            requiresUserConfirmation: decision.requiresUserConfirmation,
            reason: decision.reason,
            level: this.convertPermissionLevel(decision.level),
            autoApprove: decision.autoApprove
        };
    }
    /**
     * 转换权限级别
     */
    convertPermissionLevel(level) {
        const levelMap = {
            [PermissionTypes_1.EnhancedPermissionLevel.NONE]: Tool_1.PermissionLevel.NONE,
            [PermissionTypes_1.EnhancedPermissionLevel.READ]: Tool_1.PermissionLevel.READ,
            [PermissionTypes_1.EnhancedPermissionLevel.WRITE]: Tool_1.PermissionLevel.WRITE,
            [PermissionTypes_1.EnhancedPermissionLevel.EXECUTE]: Tool_1.PermissionLevel.EXECUTE,
            [PermissionTypes_1.EnhancedPermissionLevel.ADMIN]: Tool_1.PermissionLevel.ADMIN
        };
        return levelMap[level] || Tool_1.PermissionLevel.READ;
    }
    /**
     * 创建评估上下文
     */
    createEvaluationContext(toolId, toolName, input, toolUseContext) {
        // 转换权限上下文
        const permissionContext = this.convertToEnhancedPermissionContext(toolUseContext.permissionContext);
        return {
            toolId,
            toolName,
            input,
            permissionContext,
            workspace: {
                root: toolUseContext.workspaceRoot
            },
            session: {
                id: 'session-id', // 需要从上下文获取
                startTime: new Date()
            },
            environment: {
                isDevelopment: process.env.NODE_ENV === 'development',
                isProduction: process.env.NODE_ENV === 'production'
            }
        };
    }
    /**
     * 转换为增强权限上下文
     */
    convertToEnhancedPermissionContext(baseContext) {
        // 获取权限管理器中的规则
        const systemRules = this.permissionManager.getRules({ source: PermissionTypes_1.PermissionSource.SYSTEM });
        const userRules = this.permissionManager.getRules({ source: PermissionTypes_1.PermissionSource.USER });
        const sessionRules = this.permissionManager.getRules({ source: PermissionTypes_1.PermissionSource.SESSION });
        return {
            // 基础上下文属性
            mode: baseContext?.mode || 'default',
            alwaysAllowRules: baseContext?.alwaysAllowRules || {},
            alwaysDenyRules: baseContext?.alwaysDenyRules || {},
            alwaysAskRules: baseContext?.alwaysAskRules || {},
            isBypassPermissionsModeAvailable: baseContext?.isBypassPermissionsModeAvailable || false,
            // 增强属性
            systemRules,
            userRules,
            sessionRules,
            defaultPermissionLevel: PermissionTypes_1.EnhancedPermissionLevel.READ,
            isStrictMode: false,
            audit: {
                logAllDecisions: true,
                logDetails: false,
                logStorage: 'memory',
                retentionPolicy: {
                    maxEntries: 100,
                    maxAgeDays: 7
                }
            },
            sessionMetadata: {
                sessionId: `session-${Date.now()}`,
                startTime: new Date(),
                permissionsGranted: [],
                permissionsDenied: [],
                permissionsRequested: []
            },
            decisionHistory: []
        };
    }
    /**
     * 创建默认允许决策
     */
    createDefaultAllowDecision(toolId) {
        return {
            allowed: true,
            requiresUserConfirmation: false,
            reason: '权限系统未启用，默认允许',
            level: PermissionTypes_1.EnhancedPermissionLevel.EXECUTE,
            autoApprove: true,
            appliedRuleIds: [],
            timestamp: new Date(),
            context: {
                toolId
            }
        };
    }
    /**
     * 获取决策引擎
     */
    getDecisionEngine() {
        return this.decisionEngine;
    }
    /**
     * 获取权限管理器
     */
    getPermissionManager() {
        return this.permissionManager;
    }
    /**
     * 添加系统规则
     */
    addSystemRule(rule) {
        const enhancedRule = {
            ...rule,
            source: PermissionTypes_1.PermissionSource.SYSTEM,
            priority: rule.priority || 100
        };
        return this.permissionManager.addRule(enhancedRule);
    }
    /**
     * 添加用户规则
     */
    addUserRule(rule) {
        const enhancedRule = {
            ...rule,
            source: PermissionTypes_1.PermissionSource.USER,
            priority: rule.priority || 50
        };
        return this.permissionManager.addRule(enhancedRule);
    }
    /**
     * 添加会话规则
     */
    addSessionRule(rule) {
        const enhancedRule = {
            ...rule,
            source: PermissionTypes_1.PermissionSource.SESSION,
            priority: rule.priority || 10
        };
        return this.permissionManager.addRule(enhancedRule);
    }
    /**
     * 清理资源
     */
    dispose() {
        this.permissionManager.dispose();
        this.decisionEngine.clearCache();
    }
}
exports.PermissionIntegration = PermissionIntegration;
/**
 * 全局权限集成实例
 */
let globalPermissionIntegration = null;
/**
 * 获取全局权限集成实例
 */
function getPermissionIntegration(config) {
    if (!globalPermissionIntegration) {
        globalPermissionIntegration = new PermissionIntegration(config);
    }
    return globalPermissionIntegration;
}
/**
 * 初始化全局权限系统
 */
async function initializePermissionSystem(config) {
    const integration = getPermissionIntegration(config);
    return integration.initialize();
}
/**
 * 检查工具权限（便捷函数）
 */
async function checkPermission(toolId, toolName, input, toolUseContext) {
    const integration = getPermissionIntegration();
    return integration.checkToolPermission(toolId, toolName, input, toolUseContext);
}
/**
 * 检查工具权限并返回基本结果（向后兼容）
 */
async function checkPermissionWithBaseResult(toolId, toolName, input, toolUseContext) {
    const integration = getPermissionIntegration();
    const decision = await integration.checkToolPermission(toolId, toolName, input, toolUseContext);
    return integration.convertToBasePermissionResult(decision);
}
//# sourceMappingURL=PermissionIntegration.js.map