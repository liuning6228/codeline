"use strict";
/**
 * CodeLine 核心工具抽象
 * 借鉴claude-code-haha-main的Tool架构，结合CodeLine的VSCode扩展特性
 *
 * Zod兼容性更新（2026-04-08）：
 * 1. 替换模拟ZodSchema为真正的Zod库
 * 2. 添加兼容层支持渐进式迁移
 * 3. 保持向后兼容性
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.PermissionDeniedError = exports.ToolUseError = exports.Tool = exports.PermissionLevel = exports.ZodError = exports.compatibility = exports.unifiedSafeParse = exports.unifiedParse = exports.getRealSchema = exports.isCompatibleSchema = exports.createCompatibleSchema = exports.z = exports.ToolCategory = void 0;
exports.buildTool = buildTool;
exports.findToolByName = findToolByName;
exports.findToolsByCategory = findToolsByCategory;
exports.getEmptyToolPermissionContext = getEmptyToolPermissionContext;
const index_1 = require("../types/index");
Object.defineProperty(exports, "ToolCategory", { enumerable: true, get: function () { return index_1.ToolCategory; } });
// ==================== Zod兼容性导入 ====================
// 导入Zod兼容层，支持真正的Zod和向后兼容
const ZodCompatibility_1 = require("./ZodCompatibility");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return ZodCompatibility_1.z; } });
Object.defineProperty(exports, "createCompatibleSchema", { enumerable: true, get: function () { return ZodCompatibility_1.createCompatibleSchema; } });
Object.defineProperty(exports, "isCompatibleSchema", { enumerable: true, get: function () { return ZodCompatibility_1.isCompatibleSchema; } });
Object.defineProperty(exports, "getRealSchema", { enumerable: true, get: function () { return ZodCompatibility_1.getRealSchema; } });
Object.defineProperty(exports, "unifiedParse", { enumerable: true, get: function () { return ZodCompatibility_1.unifiedParse; } });
Object.defineProperty(exports, "unifiedSafeParse", { enumerable: true, get: function () { return ZodCompatibility_1.unifiedSafeParse; } });
Object.defineProperty(exports, "compatibility", { enumerable: true, get: function () { return ZodCompatibility_1.compatibility; } });
Object.defineProperty(exports, "ZodError", { enumerable: true, get: function () { return ZodCompatibility_1.ZodError; } });
/**
 * 权限级别
 */
var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel["NONE"] = "none";
    PermissionLevel["READ"] = "read";
    PermissionLevel["WRITE"] = "write";
    PermissionLevel["EXECUTE"] = "execute";
    PermissionLevel["ADMIN"] = "admin";
})(PermissionLevel || (exports.PermissionLevel = PermissionLevel = {}));
// ==================== 工具抽象基类 ====================
/**
 * 工具抽象基类
 * 借鉴claude-code-haha-main的Tool架构
 */
class Tool {
}
exports.Tool = Tool;
// ==================== 工具构建器 ====================
/**
 * 工具构建器
 * 将工具定义转换为工具实例
 */
function buildTool(definition) {
    return {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        category: definition.category,
        version: definition.version,
        author: definition.author,
        inputSchema: definition.inputSchema,
        capabilities: definition.capabilities,
        isEnabled: definition.isEnabled || (() => true),
        isConcurrencySafe: definition.isConcurrencySafe || (() => false),
        checkPermissions: definition.checkPermissions || (async () => ({
            allowed: true,
            requiresUserConfirmation: true
        })),
        validateParameters: definition.validateParameters || (async () => ({
            valid: true
        })),
        execute: definition.execute,
        cancel: definition.cancel,
        getDisplayName: definition.getDisplayName || (() => definition.name),
        getActivityDescription: definition.getActivityDescription || (() => definition.description)
    };
}
/**
 * 按名称查找工具
 */
function findToolByName(tools, name) {
    return tools.get(name);
}
/**
 * 按类别查找工具
 */
function findToolsByCategory(tools, category) {
    const result = [];
    // 避免迭代器问题，使用Array.from或forEach
    tools.forEach((tool) => {
        if (tool.category === category) {
            result.push(tool);
        }
    });
    return result;
}
// ==================== 空权限上下文 ====================
/**
 * 获取空权限上下文
 */
function getEmptyToolPermissionContext() {
    return {
        mode: 'default',
        alwaysAllowRules: {},
        alwaysDenyRules: {},
        alwaysAskRules: {},
        isBypassPermissionsModeAvailable: false
    };
}
// ==================== 工具使用错误 ====================
/**
 * 工具使用错误
 */
class ToolUseError extends Error {
    toolId;
    input;
    cause;
    constructor(message, toolId, input, cause) {
        super(message);
        this.toolId = toolId;
        this.input = input;
        this.cause = cause;
        this.name = 'ToolUseError';
    }
}
exports.ToolUseError = ToolUseError;
/**
 * 权限拒绝错误
 */
class PermissionDeniedError extends ToolUseError {
    reason;
    constructor(toolId, input, reason) {
        super(`Permission denied for tool: ${toolId}`, toolId, input);
        this.reason = reason;
        this.name = 'PermissionDeniedError';
    }
}
exports.PermissionDeniedError = PermissionDeniedError;
/**
 * 参数验证错误
 */
class ValidationError extends ToolUseError {
    errors;
    constructor(toolId, input, errors) {
        super(`Validation failed for tool: ${toolId}`, toolId, input);
        this.errors = errors;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=Tool.js.map