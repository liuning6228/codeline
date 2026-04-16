"use strict";
/**
 * 工具抽象基类
 * 集成 Claude-Code 和 Cline 的最佳实践
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
exports.StreamingBaseTool = exports.BaseTool = exports.ToolExecutionState = void 0;
const vscode = __importStar(require("vscode"));
const Tool_1 = require("./Tool");
/**
 * 工具执行状态
 */
var ToolExecutionState;
(function (ToolExecutionState) {
    ToolExecutionState["PENDING"] = "pending";
    ToolExecutionState["RUNNING"] = "running";
    ToolExecutionState["PAUSED"] = "paused";
    ToolExecutionState["CANCELLED"] = "cancelled";
    ToolExecutionState["COMPLETED"] = "completed";
    ToolExecutionState["FAILED"] = "failed";
    ToolExecutionState["TIMEOUT"] = "timeout";
})(ToolExecutionState || (exports.ToolExecutionState = ToolExecutionState = {}));
/**
 * 抽象工具基类
 * 提供工具实现的通用功能
 */
class BaseTool {
    // 参数模式
    parameterSchema;
    // 工具配置
    config = {
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
    // 执行状态跟踪
    executions = new Map();
    executionCount = 0;
    /**
     * 构造函数
     */
    constructor(config) {
        if (config) {
            this.config = { ...this.config, ...config };
        }
    }
    /**
     * 是否启用
     */
    isEnabled(context) {
        return true; // 默认启用
    }
    /**
     * 是否支持并发执行
     */
    isConcurrencySafe(context) {
        return this.config.concurrencySafe;
    }
    /**
     * 是否是只读操作
     */
    isReadOnly(context) {
        return this.config.readOnly;
    }
    /**
     * 是否是破坏性操作
     */
    isDestructive(context) {
        return this.config.destructive;
    }
    /**
     * 权限检查
     */
    async checkPermissions(params, context) {
        // 尝试使用全局权限管理器实例
        try {
            const { PermissionManager } = await Promise.resolve().then(() => __importStar(require('../../auth/PermissionManager')));
            const permissionManager = PermissionManager.getInstance();
            if (permissionManager) {
                const request = {
                    toolId: this.id,
                    toolCategory: this.getToolCategory(),
                    input: params,
                    context,
                    workspaceRoot: context.cwd || context.workspaceRoot,
                    userId: context.userId,
                };
                return await permissionManager.checkToolPermission(request);
            }
        }
        catch (error) {
            console.error('全局权限管理器检查失败:', error.message);
        }
        // 回退到context中的权限管理器（如果可用）
        if (context.permissionManager) {
            try {
                const request = {
                    toolId: this.id,
                    toolCategory: this.getToolCategory(),
                    input: params,
                    context,
                    workspaceRoot: context.cwd || context.workspaceRoot,
                    userId: context.userId,
                };
                return await context.permissionManager.checkPermission(request);
            }
            catch (error) {
                // 如果权限管理器出错，回退到默认检查
                console.error('上下文权限管理器检查失败:', error.message);
            }
        }
        // 回退到默认权限检查逻辑
        const result = {
            allowed: true,
            requiresUserConfirmation: this.config.requireApproval,
            confirmationPrompt: this.getPermissionPrompt(params, context)
        };
        // 检查工具特定权限
        const specificCheck = await this.checkSpecificPermissions(params, context);
        if (specificCheck) {
            return { ...result, ...specificCheck };
        }
        return result;
    }
    /**
     * 获取工具类别（子类可重写）
     */
    getToolCategory() {
        return Tool_1.ToolCategory.OTHER;
    }
    /**
     * 工具特定权限检查（子类可重写）
     */
    async checkSpecificPermissions(params, context) {
        return null;
    }
    /**
     * 获取权限提示信息
     */
    getPermissionPrompt(params, context) {
        return `是否允许执行工具 "${this.name}"？\n操作：${this.getActivityDescription(params)}`;
    }
    /**
     * 参数验证
     */
    async validateParameters(params, context) {
        if (!this.config.validateParams) {
            return { valid: true };
        }
        // 检查必需参数
        if (this.parameterSchema) {
            for (const [key, schema] of Object.entries(this.parameterSchema)) {
                if (schema.required && (params[key] === undefined || params[key] === null)) {
                    return {
                        valid: false,
                        error: `必需参数 "${key}" 缺失`
                    };
                }
                // 类型检查
                if (params[key] !== undefined && params[key] !== null) {
                    const value = params[key];
                    const typeCheck = this.validateType(value, schema.type);
                    if (!typeCheck.valid) {
                        return {
                            valid: false,
                            error: `参数 "${key}" 类型错误：期望 ${schema.type}，实际 ${typeof value}`
                        };
                    }
                    // 枚举检查
                    if (schema.enum && !schema.enum.includes(value)) {
                        return {
                            valid: false,
                            error: `参数 "${key}" 值无效：必须是 ${schema.enum.join(', ')} 之一`
                        };
                    }
                    // 自定义验证
                    if (schema.validation && !schema.validation(value)) {
                        return {
                            valid: false,
                            error: `参数 "${key}" 验证失败`
                        };
                    }
                }
            }
        }
        // 工具特定验证
        const specificValidation = await this.validateSpecificParameters(params, context);
        if (specificValidation) {
            return specificValidation;
        }
        return { valid: true };
    }
    /**
     * 类型验证
     */
    validateType(value, expectedType) {
        const actualType = typeof value;
        switch (expectedType) {
            case 'string':
                return { valid: typeof value === 'string', actualType };
            case 'number':
                return { valid: typeof value === 'number', actualType };
            case 'boolean':
                return { valid: typeof value === 'boolean', actualType };
            case 'object':
                return { valid: value !== null && typeof value === 'object', actualType };
            case 'array':
                return { valid: Array.isArray(value), actualType: 'array' };
            default:
                return { valid: true, actualType }; // 未知类型不验证
        }
    }
    /**
     * 工具特定参数验证（子类可重写）
     */
    async validateSpecificParameters(params, context) {
        return null;
    }
    /**
     * 工具执行方法
     */
    async execute(params, context, onProgress) {
        const executionId = this.generateExecutionId();
        const startTime = new Date();
        try {
            // 创建执行信息
            const executionInfo = {
                executionId,
                toolId: this.id,
                state: ToolExecutionState.RUNNING,
                startTime,
                metadata: { params }
            };
            this.executions.set(executionId, executionInfo);
            // 发送开始进度
            if (onProgress) {
                onProgress({
                    type: 'start',
                    progress: 0,
                    message: `开始执行 ${this.name}`,
                    phase: 'initialization'
                });
            }
            // 验证参数
            const validation = await this.validateParameters(params, context);
            if (!validation.valid) {
                throw new Error(`参数验证失败: ${validation.error}`);
            }
            // 检查权限
            const permission = await this.checkPermissions(params, context);
            if (!permission.allowed) {
                throw new Error(`权限检查失败: ${permission.reason || '操作被拒绝'}`);
            }
            // 如果需要用户确认
            if (permission.requiresUserConfirmation) {
                const confirmed = await this.requestUserConfirmation(permission.confirmationPrompt || '', context);
                if (!confirmed) {
                    throw new Error('用户取消了操作');
                }
            }
            // 执行工具
            const result = await this.executeTool(params, context, (progress) => {
                executionInfo.progress = progress;
                if (onProgress) {
                    onProgress(progress);
                }
            });
            // 更新执行信息
            executionInfo.state = ToolExecutionState.COMPLETED;
            executionInfo.endTime = new Date();
            executionInfo.result = result;
            return result;
        }
        catch (error) {
            // 更新执行信息
            const executionInfo = this.executions.get(executionId);
            if (executionInfo) {
                executionInfo.state = ToolExecutionState.FAILED;
                executionInfo.endTime = new Date();
                executionInfo.error = error instanceof Error ? error : new Error(String(error));
            }
            // 发送错误进度
            if (onProgress) {
                onProgress({
                    type: 'error',
                    progress: 1,
                    message: `执行失败: ${error instanceof Error ? error.message : String(error)}`,
                    phase: 'error'
                });
            }
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                toolId: this.id,
                duration: Date.now() - startTime.getTime(),
                timestamp: new Date()
            };
        }
        finally {
            // 清理旧的执行记录
            this.cleanupOldExecutions();
        }
    }
    /**
     * 请求用户确认
     */
    async requestUserConfirmation(message, context) {
        // 如果上下文中有权限管理器，使用它
        if (context.permissionManager) {
            try {
                // 这里需要更完整的请求信息，但简化处理
                // 在实际实现中，应该传递完整的请求上下文
                const result = await this.requestEnhancedConfirmation(message, context);
                return result;
            }
            catch (error) {
                console.warn('增强确认失败，回退到基本确认:', error);
            }
        }
        // 回退到基本确认
        return this.requestBasicConfirmation(message);
    }
    /**
     * 基本确认对话框
     */
    async requestBasicConfirmation(message) {
        const result = await vscode.window.showWarningMessage(message, { modal: true }, '允许', '拒绝');
        return result === '允许';
    }
    /**
     * 增强确认对话框
     */
    async requestEnhancedConfirmation(message, context) {
        // 尝试导入和使用权限对话框
        try {
            // 动态导入以避免循环依赖
            const { PermissionManager } = await Promise.resolve().then(() => __importStar(require('../../auth/PermissionManager')));
            const permissionManager = PermissionManager.getInstance();
            if (permissionManager) {
                // 使用权限管理器的快速确认
                return await permissionManager.showQuickConfirmation(message);
            }
        }
        catch (error) {
            console.warn('无法加载权限对话框:', error);
        }
        // 回退到基本确认
        return this.requestBasicConfirmation(message);
    }
    /**
     * 生成执行ID
     */
    generateExecutionId() {
        this.executionCount++;
        return `${this.id}-${Date.now()}-${this.executionCount}`;
    }
    /**
     * 清理旧的执行记录
     */
    cleanupOldExecutions(maxAgeHours = 24) {
        const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
        for (const [executionId, info] of this.executions.entries()) {
            if (info.endTime && info.endTime.getTime() < cutoff) {
                this.executions.delete(executionId);
            }
        }
    }
    /**
     * 工具取消方法
     */
    async cancel(executionId) {
        const executionInfo = this.executions.get(executionId);
        if (!executionInfo || executionInfo.state !== ToolExecutionState.RUNNING) {
            return false;
        }
        // 调用工具特定的取消逻辑
        const cancelled = await this.cancelTool(executionId);
        if (cancelled) {
            executionInfo.state = ToolExecutionState.CANCELLED;
            executionInfo.endTime = new Date();
        }
        return cancelled;
    }
    /**
     * 工具特定取消逻辑（子类可重写）
     */
    async cancelTool(executionId) {
        return false; // 默认不支持取消
    }
    /**
     * 获取工具UI显示名称
     */
    getDisplayName(params) {
        return this.name;
    }
    /**
     * 获取工具活动描述
     */
    getActivityDescription(params) {
        return `执行 ${this.name}`;
    }
    /**
     * 获取执行信息
     */
    getExecutionInfo(executionId) {
        return this.executions.get(executionId);
    }
    /**
     * 获取所有执行信息
     */
    getAllExecutions() {
        return Array.from(this.executions.values());
    }
    /**
     * 获取活跃执行数量
     */
    getActiveExecutionCount() {
        return Array.from(this.executions.values()).filter(info => info.state === ToolExecutionState.RUNNING).length;
    }
}
exports.BaseTool = BaseTool;
/**
 * 流式工具基类
 */
class StreamingBaseTool extends BaseTool {
    /**
     * 执行工具（流式版本）
     */
    async executeTool(params, context, onProgress) {
        const startTime = Date.now();
        try {
            // 创建流式执行器
            const stream = this.createStream(params, context);
            const result = [];
            // 处理流式数据
            for await (const chunk of stream) {
                if (chunk instanceof Object && 'type' in chunk && 'progress' in chunk) {
                    // 进度更新
                    if (onProgress) {
                        onProgress(chunk);
                    }
                }
                else {
                    // 数据块
                    result.push(chunk);
                }
            }
            return {
                success: true,
                output: this.aggregateResults(result),
                toolId: this.id,
                duration: Date.now() - startTime,
                timestamp: new Date()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                toolId: this.id,
                duration: Date.now() - startTime,
                timestamp: new Date()
            };
        }
    }
    /**
     * 聚合结果（子类可重写）
     */
    aggregateResults(results) {
        // 默认返回最后一个结果，或所有结果的数组
        if (results.length === 0) {
            return undefined;
        }
        else if (results.length === 1) {
            return results[0];
        }
        else {
            return results;
        }
    }
}
exports.StreamingBaseTool = StreamingBaseTool;
//# sourceMappingURL=BaseTool.js.map