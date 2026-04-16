"use strict";
/**
 * 工具适配器基类
 * 为现有模块提供统一的工具接口适配
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
exports.BaseToolAdapter = void 0;
const vscode = __importStar(require("vscode"));
/**
 * 基础工具适配器
 */
class BaseToolAdapter {
    id;
    name;
    description;
    version;
    author;
    capabilities;
    parameterSchema;
    outputChannel;
    constructor(id, name, description, version, author, capabilities = [], parameterSchema) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.version = version;
        this.author = author;
        this.capabilities = capabilities;
        this.parameterSchema = parameterSchema;
        this.outputChannel = vscode.window.createOutputChannel(`CodeLine Tool: ${name}`);
    }
    /**
     * 默认实现：总是启用
     */
    isEnabled(context) {
        return true;
    }
    /**
     * 默认实现：不支持并发
     */
    isConcurrencySafe(context) {
        return false;
    }
    /**
     * 默认实现：不是只读
     */
    isReadOnly(context) {
        return false;
    }
    /**
     * 默认实现：不是破坏性操作
     */
    isDestructive(context) {
        return false;
    }
    /**
     * 默认权限检查：允许所有操作
     */
    async checkPermissions(params, context) {
        return {
            allowed: true,
            requiresUserConfirmation: false,
        };
    }
    /**
     * 默认参数验证：总是有效
     */
    async validateParameters(params, context) {
        return {
            valid: true,
            sanitizedParams: params,
        };
    }
    /**
     * 默认取消方法：不支持取消
     */
    async cancel(executionId) {
        this.outputChannel.appendLine(`⚠️ Tool ${this.id} does not support cancellation`);
        return false;
    }
    /**
     * 默认显示名称：使用工具名称
     */
    getDisplayName(params) {
        return this.name;
    }
    /**
     * 默认活动描述：使用工具描述
     */
    getActivityDescription(params) {
        return `${this.name}: ${this.description}`;
    }
    /**
     * 报告进度
     */
    reportProgress(onProgress, progress) {
        if (onProgress) {
            onProgress(progress);
        }
    }
    /**
     * 创建成功结果
     */
    createSuccessResult(output, duration, metadata) {
        return {
            success: true,
            output,
            toolId: this.id,
            duration,
            timestamp: new Date(),
            metadata,
        };
    }
    /**
     * 创建失败结果
     */
    createErrorResult(error, duration, metadata) {
        return {
            success: false,
            error,
            toolId: this.id,
            duration,
            timestamp: new Date(),
            metadata,
        };
    }
    /**
     * 关闭输出通道
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.BaseToolAdapter = BaseToolAdapter;
//# sourceMappingURL=ToolAdapter.js.map