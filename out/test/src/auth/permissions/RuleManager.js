"use strict";
/**
 * 权限规则管理器
 * 管理权限规则的定义、匹配和应用
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
exports.RuleManager = void 0;
exports.createRuleManager = createRuleManager;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
/**
 * 权限规则管理器
 */
class RuleManager {
    rules = new Map();
    ruleFile;
    constructor(ruleFile) {
        this.ruleFile = ruleFile || path.join(vscode.workspace.rootPath || '.', '.codeline', 'rules.json');
        this.loadDefaultRules();
    }
    /**
     * 添加或更新规则
     */
    upsertRule(rule) {
        rule.updatedAt = new Date();
        this.rules.set(rule.id, rule);
        this.saveRules();
    }
    /**
     * 删除规则
     */
    deleteRule(ruleId) {
        const deleted = this.rules.delete(ruleId);
        if (deleted) {
            this.saveRules();
        }
        return deleted;
    }
    /**
     * 获取所有规则
     */
    getAllRules() {
        return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
    }
    /**
     * 获取工具相关规则
     */
    getRulesForTool(toolId) {
        return this.getAllRules().filter(rule => rule.toolId === '*' || rule.toolId === toolId);
    }
    /**
     * 匹配规则
     */
    matchRules(toolId, input, context) {
        const toolRules = this.getRulesForTool(toolId);
        const results = [];
        for (const rule of toolRules) {
            const matchResult = this.matchRule(rule, toolId, input, context);
            if (matchResult.matched) {
                results.push(matchResult);
            }
        }
        // 按优先级排序
        results.sort((a, b) => (b.rule?.priority || 0) - (a.rule?.priority || 0));
        return results;
    }
    /**
     * 获取最佳匹配规则
     */
    getBestMatch(toolId, input, context) {
        const matches = this.matchRules(toolId, input, context);
        return matches.length > 0 ? matches[0] : null;
    }
    /**
     * 检查权限
     */
    checkPermission(toolId, input, context) {
        const bestMatch = this.getBestMatch(toolId, input, context);
        if (!bestMatch) {
            // 默认策略：只读操作允许，写操作需要确认
            const isReadOnly = this.isReadOnlyOperation(toolId, input);
            return {
                allowed: true,
                requiresConfirmation: !isReadOnly,
                reason: isReadOnly ? '默认允许只读操作' : '默认需要确认写操作'
            };
        }
        switch (bestMatch.action) {
            case 'allow':
                return {
                    allowed: true,
                    requiresConfirmation: false,
                    matchedRule: bestMatch.rule,
                    reason: `规则允许: ${bestMatch.rule?.description || bestMatch.rule?.id}`
                };
            case 'deny':
                return {
                    allowed: false,
                    requiresConfirmation: false,
                    matchedRule: bestMatch.rule,
                    reason: `规则拒绝: ${bestMatch.rule?.description || bestMatch.rule?.id}`
                };
            case 'ask':
                return {
                    allowed: true,
                    requiresConfirmation: true,
                    matchedRule: bestMatch.rule,
                    reason: `规则要求确认: ${bestMatch.rule?.description || bestMatch.rule?.id}`
                };
            default:
                return {
                    allowed: false,
                    requiresConfirmation: false,
                    matchedRule: bestMatch.rule,
                    reason: '未知规则动作'
                };
        }
    }
    /**
     * 学习用户决策
     */
    learnFromDecision(toolId, input, context, userDecision, remember = false) {
        if (!remember)
            return;
        const existingRule = this.findSimilarRule(toolId, input, context);
        if (existingRule) {
            // 更新现有规则
            existingRule.action = userDecision;
            existingRule.updatedAt = new Date();
            this.upsertRule(existingRule);
        }
        else {
            // 创建新规则
            const newRule = {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                toolId,
                pattern: this.extractPattern(input),
                action: userDecision,
                conditions: this.extractConditions(context),
                priority: 100, // 用户规则高优先级
                description: `用户规则: ${userDecision} ${toolId}`,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.upsertRule(newRule);
        }
    }
    /**
     * 导入规则
     */
    importRules(rules) {
        for (const rule of rules) {
            this.upsertRule(rule);
        }
    }
    /**
     * 导出规则
     */
    exportRules() {
        return this.getAllRules();
    }
    /**
     * 重置为默认规则
     */
    resetToDefaults() {
        this.rules.clear();
        this.loadDefaultRules();
        this.saveRules();
    }
    // ==================== 私有方法 ====================
    loadDefaultRules() {
        // 加载内置默认规则
        const defaultRules = [
            {
                id: 'default-read-only',
                toolId: '*',
                pattern: 'read-only',
                action: 'allow',
                conditions: [
                    {
                        type: 'context',
                        key: 'tool.category',
                        value: ['file', 'search', 'code'],
                        operator: 'in'
                    },
                    {
                        type: 'input',
                        key: 'operation',
                        value: 'read',
                        operator: 'equals'
                    }
                ],
                priority: 10,
                description: '默认允许只读操作',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'default-dangerous-commands',
                toolId: 'bash',
                pattern: 'rm -rf /*',
                action: 'deny',
                conditions: [],
                priority: 100,
                description: '拒绝危险系统命令',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'default-git-reset',
                toolId: 'git',
                pattern: 'reset --hard',
                action: 'ask',
                conditions: [],
                priority: 50,
                description: '确认Git重置操作',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'default-file-delete',
                toolId: 'file',
                pattern: 'delete',
                action: 'ask',
                conditions: [],
                priority: 50,
                description: '确认文件删除操作',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        for (const rule of defaultRules) {
            this.rules.set(rule.id, rule);
        }
    }
    matchRule(rule, toolId, input, context) {
        const matchedConditions = [];
        const unmatchedConditions = [];
        // 检查所有条件
        for (const condition of rule.conditions) {
            const matches = this.evaluateCondition(condition, toolId, input, context);
            if (matches) {
                matchedConditions.push(condition);
            }
            else {
                unmatchedConditions.push(condition);
            }
        }
        // 如果所有条件都匹配，或者没有条件，则规则匹配
        const matched = unmatchedConditions.length === 0;
        return {
            matched,
            rule: matched ? rule : undefined,
            action: rule.action,
            matchedConditions,
            unmatchedConditions
        };
    }
    evaluateCondition(condition, toolId, input, context) {
        let value;
        switch (condition.type) {
            case 'context':
                value = context[condition.key];
                break;
            case 'input':
                value = input[condition.key];
                break;
            case 'user':
                value = context.user?.[condition.key];
                break;
            case 'environment':
                value = process.env[condition.key];
                break;
            default:
                return false;
        }
        if (value === undefined) {
            return false;
        }
        switch (condition.operator) {
            case 'equals':
                return value === condition.value;
            case 'contains':
                return typeof value === 'string' && value.includes(condition.value);
            case 'matches':
                return typeof value === 'string' && new RegExp(condition.value).test(value);
            case 'in':
                return Array.isArray(condition.value) && condition.value.includes(value);
            case 'greaterThan':
                return typeof value === 'number' && value > condition.value;
            case 'lessThan':
                return typeof value === 'number' && value < condition.value;
            default:
                return false;
        }
    }
    isReadOnlyOperation(toolId, input) {
        // 简单判断是否为只读操作
        const readOnlyTools = ['file', 'search', 'code'];
        const readOnlyOperations = ['read', 'list', 'search', 'view', 'cat', 'ls', 'grep'];
        if (readOnlyTools.includes(toolId)) {
            return true;
        }
        if (input && typeof input === 'object') {
            const operation = input.operation || input.command;
            if (operation && typeof operation === 'string') {
                return readOnlyOperations.some(op => operation.toLowerCase().includes(op));
            }
        }
        return false;
    }
    findSimilarRule(toolId, input, context) {
        const rules = this.getRulesForTool(toolId);
        for (const rule of rules) {
            const matchResult = this.matchRule(rule, toolId, input, context);
            if (matchResult.matched && matchResult.matchedConditions.length > 0) {
                return rule;
            }
        }
        return undefined;
    }
    extractPattern(input) {
        if (typeof input === 'string') {
            return input;
        }
        if (input && typeof input === 'object') {
            if (input.command) {
                return input.command;
            }
            return JSON.stringify(input);
        }
        return String(input);
    }
    extractConditions(context) {
        const conditions = [];
        // 提取一些常见的上下文条件
        if (context.user?.id) {
            conditions.push({
                type: 'user',
                key: 'id',
                value: context.user.id,
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
    async saveRules() {
        try {
            const rulesDir = path.dirname(this.ruleFile);
            await vscode.workspace.fs.createDirectory(vscode.Uri.file(rulesDir));
            const rulesData = JSON.stringify(this.getAllRules(), null, 2);
            await vscode.workspace.fs.writeFile(vscode.Uri.file(this.ruleFile), Buffer.from(rulesData, 'utf8'));
        }
        catch (error) {
            console.error('保存规则失败:', error);
        }
    }
    async loadRules() {
        try {
            const fileData = await vscode.workspace.fs.readFile(vscode.Uri.file(this.ruleFile));
            const rules = JSON.parse(fileData.toString());
            this.rules.clear();
            for (const rule of rules) {
                rule.createdAt = new Date(rule.createdAt);
                rule.updatedAt = new Date(rule.updatedAt);
                this.rules.set(rule.id, rule);
            }
        }
        catch (error) {
            console.error('加载规则失败，使用默认规则:', error);
            this.loadDefaultRules();
        }
    }
}
exports.RuleManager = RuleManager;
/**
 * 创建规则管理器实例
 */
function createRuleManager(ruleFile) {
    return new RuleManager(ruleFile);
}
//# sourceMappingURL=RuleManager.js.map