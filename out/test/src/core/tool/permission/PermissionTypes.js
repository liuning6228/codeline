"use strict";
/**
 * 权限系统核心类型定义
 * 支持Claude Code三层权限架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionLevel = exports.EnhancedPermissionLevel = exports.PermissionSource = exports.BasePermissionLevel = void 0;
const Tool_1 = require("../Tool");
Object.defineProperty(exports, "BasePermissionLevel", { enumerable: true, get: function () { return Tool_1.PermissionLevel; } });
/**
 * 权限来源 - 三层架构
 */
var PermissionSource;
(function (PermissionSource) {
    /** 系统级权限：全局配置，管理员设置，强制执行 */
    PermissionSource["SYSTEM"] = "system";
    /** 用户级权限：用户个人偏好，可配置 */
    PermissionSource["USER"] = "user";
    /** 会话级权限：临时授权，上下文相关 */
    PermissionSource["SESSION"] = "session";
})(PermissionSource || (exports.PermissionSource = PermissionSource = {}));
/**
 * 增强的权限级别（扩展基础级别）
 */
var EnhancedPermissionLevel;
(function (EnhancedPermissionLevel) {
    /** 无权限 */
    EnhancedPermissionLevel["NONE"] = "none";
    /** 只读权限 */
    EnhancedPermissionLevel["READ"] = "read";
    /** 写入权限 */
    EnhancedPermissionLevel["WRITE"] = "write";
    /** 执行权限 */
    EnhancedPermissionLevel["EXECUTE"] = "execute";
    /** 管理员权限 */
    EnhancedPermissionLevel["ADMIN"] = "admin";
})(EnhancedPermissionLevel || (exports.EnhancedPermissionLevel = EnhancedPermissionLevel = {}));
// 向后兼容：如果使用BasePermissionLevel，自动映射到EnhancedPermissionLevel
exports.PermissionLevel = {
    ...Tool_1.PermissionLevel,
    ...EnhancedPermissionLevel
};
//# sourceMappingURL=PermissionTypes.js.map