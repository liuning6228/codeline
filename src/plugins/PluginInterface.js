"use strict";
/**
 * 插件系统接口
 * 支持动态加载和卸载工具插件
 * 基于Claude Code CP-20260402-003插件模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLifecycleState = void 0;
/**
 * 插件生命周期状态
 */
var PluginLifecycleState;
(function (PluginLifecycleState) {
    /** 已加载 */
    PluginLifecycleState["LOADED"] = "loaded";
    /** 已激活 */
    PluginLifecycleState["ACTIVATED"] = "activated";
    /** 已停用 */
    PluginLifecycleState["DEACTIVATED"] = "deactivated";
    /** 已卸载 */
    PluginLifecycleState["UNLOADED"] = "unloaded";
    /** 错误状态 */
    PluginLifecycleState["ERROR"] = "error";
})(PluginLifecycleState || (exports.PluginLifecycleState = PluginLifecycleState = {}));
