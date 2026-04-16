"use strict";
/**
 * 权限管理器
 * 协调权限检查、用户确认和规则学习
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionManager = void 0;
exports.createPermissionManager = createPermissionManager;
const PermissionDialog_1 = require("./ui/PermissionDialog");
const CommandClassifier_1 = require("./classifier/CommandClassifier");
const RuleManager_1 = require("./permissions/RuleManager");
/**
 * 权限管理器
 */
class PermissionManager {
    static instance;
    config;
    dialog;
    classifier;
    ruleManager;
    isInitialized = false;
    // 自动批准设置
    autoApprovalSettings = null;
    constructor(config) {
        this.config = {
            defaultMode: 'auto',
            enableClassifier: true,
            enableRuleLearning: true,
            enableLogging: true,
            riskThreshold: 7,
            autoDenyHighRisk: true,
            ...config
        };
        this.dialog = PermissionDialog_1.PermissionDialog.getInstance();
        this.classifier = new CommandClassifier_1.CommandClassifier();
        this.ruleManager = new RuleManager_1.RuleManager();
    }
    /**
     * 获取单例实例
     */
    static getInstance(config) {
        if (!PermissionManager.instance) {
            PermissionManager.instance = new PermissionManager(config);
        }
        return PermissionManager.instance;
    }
    /**
     * 初始化权限管理器
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }
        try {
            // 初始化组件
            await this.initializeComponents();
            this.isInitialized = true;
            console.log('权限管理器初始化完成');
            return true;
        }
        catch (error) {
            console.error('权限管理器初始化失败:', error);
            return false;
        }
    }
    /**
     * 设置自动批准设置
     */
    setAutoApprovalSettings(settings) {
        this.autoApprovalSettings = settings;
        if (settings) {
            console.log('权限管理器：已更新自动批准设置', {
                version: settings.version,
                enabled: settings.enabled,
                actions: Object.keys(settings.actions).filter(key => settings.actions[key])
            });
        }
        else {
            console.log('权限管理器：已清除自动批准设置');
        }
    }
    /**
     * 检查权限（适配 ToolInterface.PermissionResult）
     * 也满足 BaseTool.PermissionManagerInterface
     */
    async checkToolPermission(request) {
        // 为了满足 BaseTool.PermissionManagerInterface，添加别名方法
        return this.checkPermissionForTool(request);
    }
    /**
     * 检查权限（满足 BaseTool.PermissionManagerInterface）
     */
    async checkPermission(request) {
        return this.checkPermissionForTool(request);
    }
    /**
     * 内部实现
     */
    async checkPermissionForTool(request) {
        const checkRequest = {
            toolId: request.toolId,
            toolCategory: request.toolCategory,
            input: request.input,
            context: request.context,
            workspaceRoot: request.workspaceRoot,
            userId: request.userId
        };
        const result = await this.checkPermissionWithDetails(checkRequest);
        // 转换为 PermissionResult
        return {
            allowed: result.allowed,
            reason: result.autoDecisionReason || result.matchedRule?.description,
            requiresUserConfirmation: result.requiresUserConfirmation,
            confirmationPrompt: result.confirmationPrompt
        };
    }
    /**
     * 检查权限（返回详细结果）
     */
    async checkPermissionWithDetails(request) {
        const { toolId, toolCategory, input, context } = request;
        // 0. 首先检查自动批准设置
        const autoApproveResult = this.checkAutoApproval(request);
        if (autoApproveResult) {
            return autoApproveResult;
        }
        // 1. 检查规则匹配
        const ruleMatch = await this.checkRules(request);
        if (ruleMatch) {
            return this.handleRuleMatch(ruleMatch);
        }
        // 2. 检查权限模式
        const mode = this.getPermissionMode(context);
        switch (mode) {
            case 'always':
                return {
                    allowed: true,
                    requiresUserConfirmation: false,
                    autoDecisionReason: '权限模式设置为"总是允许"'
                };
            case 'deny':
                return {
                    allowed: false,
                    requiresUserConfirmation: false,
                    autoDecisionReason: '权限模式设置为"总是拒绝"'
                };
            case 'sandbox':
                // 沙箱模式：允许但限制操作
                return {
                    allowed: true,
                    requiresUserConfirmation: false,
                    autoDecisionReason: '沙箱模式：操作将在受限环境中执行'
                };
            case 'ask':
                // 总是询问模式
                return {
                    allowed: true,
                    requiresUserConfirmation: true,
                    confirmationPrompt: this.generateConfirmationPrompt(request)
                };
            case 'auto':
            default:
                // 自动模式：使用分类器和风险评估
                return await this.autoDecision(request);
        }
    }
    /**
     * 快速确认对话框
     */
    async showQuickConfirmation(message, detail) {
        return this.dialog.showQuickConfirmation(message, detail);
    }
    /**
     * 请求用户确认
     */
    async requestUserConfirmation(request, result) {
        const { toolId, input, context } = request;
        // 生成学习建议
        const learningSuggestions = await this.generateLearningSuggestions(request, result);
        // 显示权限对话框
        const dialogOptions = {
            toolName: this.getToolDisplayName(toolId),
            toolId,
            actionDescription: this.extractActionDescription(input),
            riskLevel: result.riskLevel || 5,
            riskExplanation: this.getRiskExplanation(result),
            allowRememberChoice: this.config.enableRuleLearning,
            showLearningSuggestions: learningSuggestions.length > 0,
            detail: this.generateDialogDetail(request, result),
            context
        };
        const dialogResult = await this.dialog.showPermissionDialog(dialogOptions);
        // 记录决策
        if (this.config.enableLogging) {
            this.dialog.logPermissionDecision(toolId, input, dialogResult, context);
        }
        // 处理记住选择
        let ruleCreated;
        if (dialogResult.rememberChoice && dialogResult.rulePattern) {
            ruleCreated = await this.createRuleFromDecision(request, dialogResult, learningSuggestions);
        }
        // 学习用户决策
        if (dialogResult.rememberChoice) {
            await this.learnFromUserDecision(request, dialogResult);
        }
        return {
            confirmed: dialogResult.choice === 'allow',
            rememberChoice: dialogResult.rememberChoice,
            ruleCreated
        };
    }
    /**
     * 批量检查权限
     */
    async checkPermissionsBatch(requests) {
        const results = [];
        // 检查所有请求
        for (const request of requests) {
            results.push(await this.checkPermissionWithDetails(request));
        }
        // 检查是否需要批量确认
        const needsConfirmation = results.some(r => r.requiresUserConfirmation);
        if (needsConfirmation) {
            await this.handleBatchConfirmation(requests, results);
        }
        return results;
    }
    /**
     * 更新配置
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * 获取配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 重置为默认配置
     */
    resetConfig() {
        this.config = {
            defaultMode: 'auto',
            enableClassifier: true,
            enableRuleLearning: true,
            enableLogging: true,
            riskThreshold: 7,
            autoDenyHighRisk: true
        };
    }
    /**
     * 导出规则
     */
    exportRules() {
        return this.ruleManager.exportRules();
    }
    /**
     * 导入规则
     */
    importRules(rules) {
        this.ruleManager.importRules(rules);
    }
    /**
     * 清除所有规则
     */
    clearRules() {
        this.ruleManager.resetToDefaults();
    }
    // ==================== 私有方法 ====================
    /**
     * 初始化组件
     */
    async initializeComponents() {
        // 加载规则
        // 规则管理器会自动从文件加载
        // 初始化分类器（如果需要）
        if (this.config.enableClassifier) {
            // 可以在这里加载训练数据
        }
    }
    /**
     * 检查规则匹配
     */
    async checkRules(request) {
        const { toolId, input, context } = request;
        const ruleMatch = this.ruleManager.getBestMatch(toolId, input, context);
        if (!ruleMatch) {
            return null;
        }
        return {
            rule: ruleMatch.rule,
            action: ruleMatch.action
        };
    }
    /**
     * 处理规则匹配
     */
    handleRuleMatch(ruleMatch) {
        const { rule, action } = ruleMatch;
        switch (action) {
            case 'allow':
                return {
                    allowed: true,
                    requiresUserConfirmation: false,
                    matchedRule: rule,
                    autoDecisionReason: `匹配允许规则: ${rule.description || rule.id}`
                };
            case 'deny':
                return {
                    allowed: false,
                    requiresUserConfirmation: false,
                    matchedRule: rule,
                    autoDecisionReason: `匹配拒绝规则: ${rule.description || rule.id}`
                };
            case 'ask':
                return {
                    allowed: true,
                    requiresUserConfirmation: true,
                    matchedRule: rule,
                    confirmationPrompt: `规则要求确认: ${rule.description || rule.id}`
                };
            default:
                return {
                    allowed: false,
                    requiresUserConfirmation: false,
                    matchedRule: rule,
                    autoDecisionReason: '未知规则动作'
                };
        }
    }
    /**
     * 自动决策
     */
    async autoDecision(request) {
        const { toolId, input, context } = request;
        // 使用分类器评估风险
        let classification = null;
        if (this.config.enableClassifier) {
            try {
                const command = this.extractCommand(input);
                if (command) {
                    classification = await this.classifier.classify(command, context);
                }
            }
            catch (error) {
                console.warn('分类器评估失败:', error);
            }
        }
        // 确定风险等级
        const riskLevel = classification?.riskLevel || this.estimateRiskLevel(input, context);
        // 高风险自动拒绝
        if (this.config.autoDenyHighRisk && riskLevel >= this.config.riskThreshold) {
            return {
                allowed: false,
                requiresUserConfirmation: false,
                riskLevel,
                autoDecisionReason: `高风险操作自动拒绝 (风险等级: ${riskLevel}/10)`
            };
        }
        // 低风险自动允许
        if (riskLevel <= 3) {
            return {
                allowed: true,
                requiresUserConfirmation: false,
                riskLevel,
                autoDecisionReason: `低风险操作自动允许 (风险等级: ${riskLevel}/10)`
            };
        }
        // 中等风险需要确认
        return {
            allowed: true,
            requiresUserConfirmation: true,
            riskLevel,
            confirmationPrompt: this.generateConfirmationPrompt(request, riskLevel),
            learningSuggestions: await this.generateLearningSuggestions(request, { riskLevel })
        };
    }
    /**
     * 生成确认提示
     */
    generateConfirmationPrompt(request, riskLevel) {
        const { toolId, input } = request;
        const action = this.extractActionDescription(input);
        const toolName = this.getToolDisplayName(toolId);
        let prompt = `是否允许 ${toolName} 执行以下操作？\n${action}`;
        if (riskLevel !== undefined) {
            prompt += `\n\n风险等级: ${riskLevel}/10`;
            if (riskLevel >= 7) {
                prompt += ' (高风险)';
            }
            else if (riskLevel >= 5) {
                prompt += ' (中等风险)';
            }
        }
        return prompt;
    }
    /**
     * 生成学习建议
     */
    async generateLearningSuggestions(request, result) {
        if (!this.config.enableRuleLearning) {
            return [];
        }
        const { toolId, input } = request;
        const suggestions = [];
        // 精确匹配建议
        const exactPattern = this.generateExactPattern(toolId, input);
        suggestions.push({
            type: 'exact',
            pattern: exactPattern,
            description: `总是${result.allowed ? '允许' : '拒绝'}此精确操作`,
            riskLevel: result.riskLevel || 5
        });
        // 模式匹配建议（如果适用）
        const pattern = this.generatePatternSuggestion(toolId, input);
        if (pattern) {
            suggestions.push({
                type: 'pattern',
                pattern,
                description: `总是${result.allowed ? '允许' : '拒绝'}此类操作`,
                riskLevel: result.riskLevel || 5
            });
        }
        // 类别建议
        suggestions.push({
            type: 'category',
            pattern: toolId,
            description: `总是${result.allowed ? '允许' : '拒绝'}此工具的所有操作`,
            riskLevel: result.riskLevel || 5
        });
        return suggestions;
    }
    /**
     * 处理批量确认
     */
    async handleBatchConfirmation(requests, results) {
        // 提取需要确认的请求
        const pendingRequests = requests.filter((_, i) => results[i].requiresUserConfirmation);
        if (pendingRequests.length === 0) {
            return;
        }
        // 准备批量确认数据
        const batchData = pendingRequests.map((req, i) => ({
            toolId: req.toolId,
            actionDescription: this.extractActionDescription(req.input),
            riskLevel: results[i].riskLevel || 5
        }));
        // 显示批量对话框
        const batchResult = await this.dialog.showBatchPermissionDialog(batchData, {
            title: '批量权限确认',
            allowSelective: true
        });
        // 应用批量决策
        // 这里需要更新对应的results
    }
    /**
     * 从决策创建规则
     */
    async createRuleFromDecision(request, dialogResult, suggestions) {
        const { toolId, input, context } = request;
        // 找到匹配的建议
        const suggestion = suggestions.find(s => s.type === dialogResult.ruleType);
        if (!suggestion) {
            return undefined;
        }
        // 确保choice是有效的规则动作
        if (dialogResult.choice === 'cancel') {
            return undefined;
        }
        const rule = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            toolId,
            pattern: suggestion.pattern,
            action: dialogResult.choice,
            conditions: this.extractConditions(context),
            priority: 100, // 用户规则高优先级
            description: `用户规则: ${dialogResult.choice} ${suggestion.description}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // 保存规则
        this.ruleManager.upsertRule(rule);
        return rule;
    }
    /**
     * 学习用户决策
     */
    async learnFromUserDecision(request, dialogResult) {
        if (!dialogResult.rememberChoice) {
            return;
        }
        // 只有当choice是allow或deny时才学习
        if (dialogResult.choice !== 'allow' && dialogResult.choice !== 'deny') {
            return;
        }
        const { toolId, input, context } = request;
        this.ruleManager.learnFromDecision(toolId, input, context, dialogResult.choice, true);
    }
    /**
     * 获取权限模式
     */
    getPermissionMode(context) {
        return context.permissionMode || this.config.defaultMode;
    }
    /**
     * 提取命令
     */
    extractCommand(input) {
        if (typeof input === 'string') {
            return input;
        }
        if (input && typeof input === 'object') {
            if (input.command) {
                return input.command;
            }
            if (input.query) {
                return input.query;
            }
        }
        return null;
    }
    /**
     * 估算风险等级
     */
    estimateRiskLevel(input, context) {
        // 简化实现
        const command = this.extractCommand(input);
        if (!command) {
            return 5; // 默认中等风险
        }
        // 使用简单的规则匹配
        const dangerousPatterns = [
            { pattern: /rm\s+-rf\s+\/\S*/i, risk: 10 },
            { pattern: /dd\s+if=\/dev\/zero/i, risk: 9 },
            { pattern: /mkfs\.?\s+/i, risk: 9 },
            { pattern: /chmod\s+-R\s+777\s+\//i, risk: 8 },
            { pattern: /wget\s+.*\|\s*sh/i, risk: 9 },
            { pattern: /curl\s+.*\|\s*sh/i, risk: 9 },
            { pattern: /rm\s+-rf/i, risk: 7 },
            { pattern: /git\s+reset\s+--hard/i, risk: 6 },
            { pattern: /sudo\s+/i, risk: 6 },
        ];
        for (const { pattern, risk } of dangerousPatterns) {
            if (pattern.test(command)) {
                return risk;
            }
        }
        // 只读命令低风险
        const readOnlyPatterns = [
            /^ls\b/i,
            /^cat\b/i,
            /^grep\b/i,
            /^pwd\b/i,
            /^echo\b/i,
            /^date\b/i,
        ];
        for (const pattern of readOnlyPatterns) {
            if (pattern.test(command.trim())) {
                return 1;
            }
        }
        return 5; // 默认中等风险
    }
    /**
     * 提取动作描述
     */
    extractActionDescription(input) {
        if (typeof input === 'string') {
            return input;
        }
        if (input && typeof input === 'object') {
            if (input.command) {
                return `执行命令: ${input.command}`;
            }
            if (input.operation) {
                return `执行操作: ${input.operation}`;
            }
            if (input.path) {
                return `访问路径: ${input.path}`;
            }
            return JSON.stringify(input);
        }
        return String(input);
    }
    /**
     * 获取风险解释
     */
    getRiskExplanation(result) {
        if (result.riskLevel !== undefined) {
            if (result.riskLevel >= 8) {
                return '此操作可能对系统造成严重破坏，请谨慎确认。';
            }
            else if (result.riskLevel >= 5) {
                return '此操作可能修改重要文件或配置，建议确认后再执行。';
            }
        }
        return undefined;
    }
    /**
     * 生成对话框详情
     */
    generateDialogDetail(request, result) {
        const { toolId, context } = request;
        const lines = [];
        if (result.autoDecisionReason) {
            lines.push(`决策原因: ${result.autoDecisionReason}`);
        }
        if (result.riskLevel !== undefined) {
            lines.push(`风险评估: ${result.riskLevel}/10`);
        }
        if (context.workspaceRoot) {
            lines.push(`工作目录: ${context.workspaceRoot}`);
        }
        if (context.userId) {
            lines.push(`用户: ${context.userId}`);
        }
        return lines.join('\n');
    }
    /**
     * 生成精确模式
     */
    generateExactPattern(toolId, input) {
        const action = this.extractActionDescription(input);
        return `${toolId}:${this.hashString(action)}`;
    }
    /**
     * 生成模式建议
     */
    generatePatternSuggestion(toolId, input) {
        const command = this.extractCommand(input);
        if (!command) {
            return null;
        }
        // 尝试提取通用模式
        const words = command.split(/\s+/);
        if (words.length > 1) {
            // 返回第一个单词加通配符，例如 "git *"
            return `${words[0]} *`;
        }
        return null;
    }
    /**
     * 提取条件
     */
    extractConditions(context) {
        const conditions = [];
        if (context.userId) {
            conditions.push({
                type: 'user',
                key: 'id',
                value: context.userId,
                operator: 'equals'
            });
        }
        if (context.workspaceRoot) {
            conditions.push({
                type: 'context',
                key: 'workspaceRoot',
                value: context.workspaceRoot,
                operator: 'equals'
            });
        }
        return conditions;
    }
    /**
     * 获取工具显示名称
     */
    getToolDisplayName(toolId) {
        const toolNames = {
            'bash': 'Bash 命令',
            'enhanced-bash': '增强Bash',
            'file': '文件操作',
            'git': 'Git 操作',
            'search': '代码搜索',
            'edit': '代码编辑'
        };
        return toolNames[toolId] || toolId;
    }
    /**
     * 检查自动批准设置
     */
    checkAutoApproval(request) {
        // 如果没有自动批准设置，返回null
        if (!this.autoApprovalSettings) {
            return null;
        }
        // 如果自动批准功能被禁用，返回null
        if (!this.autoApprovalSettings.enabled) {
            return null;
        }
        const { toolId, toolCategory, input, context } = request;
        // 映射工具到自动批准操作
        const actionType = this.mapToolToAutoApproveAction(toolId, toolCategory, input);
        if (!actionType) {
            return null; // 无法映射到此工具
        }
        // 检查操作是否已启用
        const actionEnabled = this.autoApprovalSettings.actions[actionType];
        if (!actionEnabled) {
            return null; // 此操作未启用自动批准
        }
        // 进一步检查子操作（如果适用）
        if (actionType === 'readFiles' && this.autoApprovalSettings.actions.readFilesExternally !== undefined) {
            // 如果读取外部文件设置存在，需要检查是否允许
            const isExternalFile = this.isExternalFileOperation(input, context);
            if (isExternalFile && !this.autoApprovalSettings.actions.readFilesExternally) {
                return null; // 读取外部文件未启用自动批准
            }
        }
        if (actionType === 'editFiles' && this.autoApprovalSettings.actions.editFilesExternally !== undefined) {
            // 如果编辑外部文件设置存在，需要检查是否允许
            const isExternalFile = this.isExternalFileOperation(input, context);
            if (isExternalFile && !this.autoApprovalSettings.actions.editFilesExternally) {
                return null; // 编辑外部文件未启用自动批准
            }
        }
        if (actionType === 'executeSafeCommands' && this.autoApprovalSettings.actions.executeAllCommands !== undefined) {
            // 检查是否为安全命令
            const isSafeCommand = this.isSafeCommand(input, context);
            if (!isSafeCommand && !this.autoApprovalSettings.actions.executeAllCommands) {
                return null; // 非安全命令且未启用"所有命令"自动批准
            }
        }
        // 自动批准此操作
        return {
            allowed: true,
            requiresUserConfirmation: false,
            autoDecisionReason: `操作已通过自动批准设置允许 (${this.getActionDisplayName(actionType)})`
        };
    }
    /**
     * 映射工具到自动批准操作类型
     */
    mapToolToAutoApproveAction(toolId, toolCategory, input) {
        // 根据工具ID和类别映射
        const toolMapping = {
            // Bash/Shell命令
            'bash': 'executeSafeCommands',
            'enhanced-bash': 'executeSafeCommands',
            'shell': 'executeSafeCommands',
            'command': 'executeSafeCommands',
            'terminal': 'executeSafeCommands',
            // 文件读取操作
            'file-read': 'readFiles',
            'file-view': 'readFiles',
            'file-search': 'readFiles',
            'search': 'readFiles',
            'find': 'readFiles',
            'grep': 'readFiles',
            // 文件编辑操作
            'file-edit': 'editFiles',
            'file-write': 'editFiles',
            'file-create': 'editFiles',
            'file-delete': 'editFiles',
            'edit': 'editFiles',
            'write': 'editFiles',
            // 浏览器操作
            'browser': 'useBrowser',
            'web': 'useBrowser',
            'fetch': 'useBrowser',
            'http': 'useBrowser',
            // MCP操作
            'mcp': 'useMcp',
            'server': 'useMcp',
            'protocol': 'useMcp'
        };
        // 首先尝试精确匹配工具ID
        if (toolMapping[toolId]) {
            return toolMapping[toolId];
        }
        // 尝试匹配工具类别
        if (toolCategory && typeof toolCategory === 'string' && toolMapping[toolCategory]) {
            return toolMapping[toolCategory];
        }
        // 无法映射
        return null;
    }
    /**
     * 获取操作显示名称
     */
    getActionDisplayName(actionType) {
        const displayNames = {
            'readFiles': '读取文件',
            'readFilesExternally': '读取外部文件',
            'editFiles': '编辑文件',
            'editFilesExternally': '编辑外部文件',
            'executeSafeCommands': '执行安全命令',
            'executeAllCommands': '执行所有命令',
            'useBrowser': '使用浏览器',
            'useMcp': '使用MCP'
        };
        return displayNames[actionType] || actionType;
    }
    /**
     * 检查是否为外部文件操作
     */
    isExternalFileOperation(input, context) {
        // 简化实现：检查文件路径是否在工作空间外
        try {
            const workspaceRoot = context.workspaceRoot || context.cwd;
            if (!workspaceRoot) {
                return false;
            }
            // 尝试从输入中提取文件路径
            let filePath;
            if (typeof input === 'string') {
                filePath = input;
            }
            else if (input && typeof input === 'object') {
                filePath = input.path || input.file || input.filePath || input.target;
            }
            if (!filePath || typeof filePath !== 'string') {
                return false;
            }
            // 检查是否为绝对路径且不在工作空间内
            const path = require('path');
            const normalizedWorkspace = path.normalize(workspaceRoot);
            const normalizedFilePath = path.normalize(filePath);
            if (path.isAbsolute(normalizedFilePath)) {
                return !normalizedFilePath.startsWith(normalizedWorkspace + path.sep) &&
                    normalizedFilePath !== normalizedWorkspace;
            }
            return false;
        }
        catch (error) {
            console.error('检查外部文件操作失败:', error);
            return false;
        }
    }
    /**
     * 检查是否为安全命令
     */
    isSafeCommand(input, context) {
        // 简化实现：检查命令是否在安全命令列表中
        try {
            const command = this.extractCommand(input);
            if (!command) {
                return false;
            }
            // 安全命令列表（可根据需要扩展）
            const safeCommands = [
                'ls', 'dir', 'pwd', 'cd', 'echo', 'cat', 'head', 'tail', 'grep',
                'find', 'locate', 'which', 'where', 'type', 'file', 'stat',
                'date', 'time', 'cal', 'uptime', 'who', 'whoami', 'uname',
                'git status', 'git log', 'git diff', 'git show', 'git branch',
                'npm list', 'npm view', 'yarn why', 'pip list', 'pip show',
                'node --version', 'python --version', 'java -version'
            ];
            // 检查命令是否以安全命令开头
            const lowerCommand = command.toLowerCase();
            for (const safeCmd of safeCommands) {
                if (lowerCommand.startsWith(safeCmd.toLowerCase())) {
                    return true;
                }
            }
            return false;
        }
        catch (error) {
            console.error('检查安全命令失败:', error);
            return false;
        }
    }
    /**
     * 字符串哈希
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash).toString(36);
    }
}
exports.PermissionManager = PermissionManager;
/**
 * 创建权限管理器实例
 */
function createPermissionManager(config) {
    return PermissionManager.getInstance(config);
}
//# sourceMappingURL=PermissionManager.js.map