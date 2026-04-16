"use strict";
/**
 * 权限对话框管理器
 * 提供完整的用户确认流程，支持"总是允许"、"总是拒绝"等选项
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
exports.PermissionDialog = void 0;
exports.createPermissionDialog = createPermissionDialog;
const vscode = __importStar(require("vscode"));
/**
 * 权限对话框管理器
 */
class PermissionDialog {
    static instance;
    outputChannel;
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Permissions');
    }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!PermissionDialog.instance) {
            PermissionDialog.instance = new PermissionDialog();
        }
        return PermissionDialog.instance;
    }
    /**
     * 显示权限对话框
     */
    async showPermissionDialog(options) {
        const { toolName, toolId, actionDescription, riskLevel = 5, riskExplanation, allowRememberChoice = true, defaultChoice = 'ask', detail, showLearningSuggestions = true, context = {} } = options;
        // 构建消息
        const mainMessage = this.buildMainMessage(toolName, actionDescription, riskLevel);
        const detailMessage = detail || this.buildDetailMessage(riskExplanation, riskLevel, context);
        // 构建选项
        const dialogOptions = this.buildDialogOptions(allowRememberChoice, showLearningSuggestions);
        // 显示对话框
        const result = await vscode.window.showInformationMessage(mainMessage, { modal: true, detail: detailMessage }, ...dialogOptions);
        // 处理结果
        return this.handleDialogResult(result, options);
    }
    /**
     * 显示快速确认对话框（简化版）
     */
    async showQuickConfirmation(message, detail) {
        const result = await vscode.window.showWarningMessage(message, { modal: true, detail }, '允许', '拒绝');
        return result === '允许';
    }
    /**
     * 显示规则学习对话框
     */
    async showRuleLearningDialog(toolId, input, context, suggestions = []) {
        const actionDescription = this.extractActionDescription(input);
        const riskLevel = this.estimateRiskLevel(input, context);
        return this.showPermissionDialog({
            toolName: this.getToolDisplayName(toolId),
            toolId,
            actionDescription,
            riskLevel,
            allowRememberChoice: true,
            showLearningSuggestions: suggestions.length > 0,
            detail: this.buildLearningDetail(suggestions),
            context: { input, ...context }
        });
    }
    /**
     * 显示批量权限对话框
     */
    async showBatchPermissionDialog(permissions, options) {
        const title = options?.title || '批量权限请求';
        const allowSelective = options?.allowSelective ?? true;
        const message = `有 ${permissions.length} 个操作需要权限确认`;
        const detail = this.buildBatchDetail(permissions);
        const dialogOptions = ['允许所有', '拒绝所有'];
        if (allowSelective && permissions.length <= 10) {
            dialogOptions.push('选择性允许');
        }
        const result = await vscode.window.showWarningMessage(message, { modal: true, detail }, ...dialogOptions);
        if (result === '允许所有') {
            return { allowAll: true, denyAll: false };
        }
        else if (result === '拒绝所有') {
            return { allowAll: false, denyAll: true };
        }
        else if (result === '选择性允许') {
            const selectiveResults = await this.showSelectivePermissionsDialog(permissions);
            return {
                allowAll: false,
                denyAll: false,
                selectiveResults
            };
        }
        else {
            // 用户取消
            return { allowAll: false, denyAll: false };
        }
    }
    /**
     * 记录权限决策日志
     */
    logPermissionDecision(toolId, input, result, context) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            toolId,
            input,
            result,
            context,
            workspaceRoot: context.workspaceRoot,
            userId: context.userId
        };
        this.outputChannel.appendLine(JSON.stringify(logEntry, null, 2));
        // 同时输出到控制台（开发环境）
        if (process.env.NODE_ENV === 'development') {
            console.log('权限决策:', logEntry);
        }
    }
    // ==================== 私有方法 ====================
    /**
     * 构建主消息
     */
    buildMainMessage(toolName, actionDescription, riskLevel) {
        const riskIndicator = this.getRiskIndicator(riskLevel);
        return `${riskIndicator} ${toolName}: ${actionDescription}`;
    }
    /**
     * 构建详细消息
     */
    buildDetailMessage(riskExplanation, riskLevel, context) {
        const lines = [];
        if (riskExplanation) {
            lines.push(`风险说明: ${riskExplanation}`);
        }
        lines.push(`风险等级: ${riskLevel}/10 (${this.getRiskDescription(riskLevel)})`);
        if (context.workspaceRoot) {
            lines.push(`工作目录: ${context.workspaceRoot}`);
        }
        if (context.userId) {
            lines.push(`用户: ${context.userId}`);
        }
        return lines.join('\n');
    }
    /**
     * 构建学习详情
     */
    buildLearningDetail(suggestions) {
        if (suggestions.length === 0) {
            return '没有可用的学习建议。';
        }
        const lines = ['学习建议:'];
        for (const suggestion of suggestions) {
            lines.push(`  • ${suggestion.description} (风险: ${suggestion.riskLevel}/10)`);
        }
        lines.push('');
        lines.push('选择"总是允许"或"总是拒绝"来创建相应的权限规则。');
        return lines.join('\n');
    }
    /**
     * 构建批量详情
     */
    buildBatchDetail(permissions) {
        const lines = ['待确认的操作:'];
        for (let i = 0; i < permissions.length; i++) {
            const perm = permissions[i];
            const riskIndicator = this.getRiskIndicator(perm.riskLevel);
            lines.push(`  ${i + 1}. ${riskIndicator} ${perm.actionDescription}`);
        }
        return lines.join('\n');
    }
    /**
     * 构建对话框选项
     */
    buildDialogOptions(allowRememberChoice, showLearningSuggestions) {
        const options = [];
        if (showLearningSuggestions && allowRememberChoice) {
            options.push('总是允许');
            options.push('总是拒绝');
        }
        options.push('允许此次');
        options.push('拒绝此次');
        if (allowRememberChoice) {
            options.push('创建自定义规则...');
        }
        options.push('取消');
        return options;
    }
    /**
     * 处理对话框结果
     */
    handleDialogResult(result, options) {
        if (!result || result === '取消') {
            return { choice: 'cancel' };
        }
        switch (result) {
            case '总是允许':
                return {
                    choice: 'allow',
                    rememberChoice: true,
                    ruleType: 'exact',
                    rulePattern: this.generateRulePattern(options),
                    feedback: '用户选择总是允许此操作'
                };
            case '总是拒绝':
                return {
                    choice: 'deny',
                    rememberChoice: true,
                    ruleType: 'exact',
                    rulePattern: this.generateRulePattern(options),
                    feedback: '用户选择总是拒绝此操作'
                };
            case '允许此次':
                return {
                    choice: 'allow',
                    rememberChoice: false,
                    feedback: '用户允许此次操作'
                };
            case '拒绝此次':
                return {
                    choice: 'deny',
                    rememberChoice: false,
                    feedback: '用户拒绝此次操作'
                };
            case '创建自定义规则...':
                // 这里应该打开更复杂的规则编辑器
                // 简化处理：返回取消
                return { choice: 'cancel' };
            default:
                return { choice: 'cancel' };
        }
    }
    /**
     * 显示选择性权限对话框
     */
    async showSelectivePermissionsDialog(permissions) {
        const results = {};
        for (let i = 0; i < permissions.length; i++) {
            const perm = permissions[i];
            const key = `${perm.toolId}-${i}`;
            const message = `操作 ${i + 1}/${permissions.length}: ${perm.actionDescription}`;
            const detail = `风险等级: ${perm.riskLevel}/10`;
            const result = await vscode.window.showWarningMessage(message, { modal: false, detail }, '允许', '拒绝', '跳过');
            if (result === '允许') {
                results[key] = 'allow';
            }
            else if (result === '拒绝') {
                results[key] = 'deny';
            }
            // 跳过则不作处理
        }
        return results;
    }
    /**
     * 生成规则模式
     */
    generateRulePattern(options) {
        // 简化实现：使用工具ID + 动作哈希
        const pattern = `${options.toolId}:${this.hashString(options.actionDescription)}`;
        return pattern;
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
    /**
     * 获取风险指示器
     */
    getRiskIndicator(riskLevel) {
        if (riskLevel >= 8)
            return '⚠️⚠️ 高风险';
        if (riskLevel >= 5)
            return '⚠️ 中风险';
        if (riskLevel >= 3)
            return '🔶 低风险';
        return '✅ 安全';
    }
    /**
     * 获取风险描述
     */
    getRiskDescription(riskLevel) {
        if (riskLevel >= 8)
            return '高风险 - 可能对系统造成严重破坏';
        if (riskLevel >= 5)
            return '中风险 - 可能修改重要文件或配置';
        if (riskLevel >= 3)
            return '低风险 - 只读或安全的写操作';
        return '安全 - 只读操作';
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
            return JSON.stringify(input);
        }
        return String(input);
    }
    /**
     * 估算风险等级
     */
    estimateRiskLevel(input, context) {
        // 简化实现
        if (typeof input === 'string') {
            if (input.includes('rm ') || input.includes('delete '))
                return 7;
            if (input.includes('chmod ') || input.includes('chown '))
                return 6;
            if (input.includes('curl ') || input.includes('wget '))
                return 5;
            return 3;
        }
        return 5; // 默认中等风险
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
}
exports.PermissionDialog = PermissionDialog;
/**
 * 创建权限对话框实例
 */
function createPermissionDialog() {
    return PermissionDialog.getInstance();
}
//# sourceMappingURL=PermissionDialog.js.map