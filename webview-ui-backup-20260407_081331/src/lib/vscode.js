"use strict";
/**
 * VS Code Webview API 工具
 * 提供与 VS Code 扩展通信的功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
var VSCodeAPI = /** @class */ (function () {
    function VSCodeAPI() {
        this.vscode = null;
        if (typeof window.acquireVsCodeApi === 'function') {
            this.vscode = window.acquireVsCodeApi();
        }
    }
    /**
     * 检查是否在 VS Code Webview 环境中
     */
    VSCodeAPI.prototype.isInVSCode = function () {
        return this.vscode !== null;
    };
    /**
     * 发送消息到 VS Code 扩展
     */
    VSCodeAPI.prototype.postMessage = function (message) {
        if (this.vscode) {
            console.log('Posting message to VSCode:', message);
            this.vscode.postMessage(message);
        }
        else {
            console.warn('Not in VSCode environment, message ignored:', message);
        }
    };
    /**
     * 获取状态
     */
    VSCodeAPI.prototype.getState = function () {
        var _a;
        return ((_a = this.vscode) === null || _a === void 0 ? void 0 : _a.getState()) || null;
    };
    /**
     * 设置状态
     */
    VSCodeAPI.prototype.setState = function (state) {
        if (this.vscode) {
            this.vscode.setState(state);
        }
    };
    /**
     * 执行任务（流式版本）
     */
    VSCodeAPI.prototype.executeTask = function (task) {
        this.postMessage({
            command: 'executeTaskWithStream',
            task: task
        });
    };
    /**
     * 执行任务（传统版本）
     */
    VSCodeAPI.prototype.executeTaskLegacy = function (task) {
        this.postMessage({
            command: 'executeTask',
            task: task
        });
    };
    /**
     * 发送聊天消息
     */
    VSCodeAPI.prototype.sendMessage = function (text, isExternal, externalTimestamp) {
        if (isExternal === void 0) { isExternal = false; }
        this.postMessage({
            command: 'sendMessage',
            text: text,
            isExternal: isExternal,
            externalTimestamp: externalTimestamp
        });
    };
    /**
     * 清除聊天记录
     */
    VSCodeAPI.prototype.clearChat = function () {
        this.postMessage({
            command: 'clearChat'
        });
    };
    /**
     * 获取历史记录
     */
    VSCodeAPI.prototype.getHistory = function () {
        this.postMessage({
            command: 'getHistory'
        });
    };
    /**
     * 切换视图
     */
    VSCodeAPI.prototype.switchView = function (view) {
        this.postMessage({
            command: 'switchView',
            view: view
        });
    };
    /**
     * 保存设置
     */
    VSCodeAPI.prototype.saveSettings = function (config) {
        this.postMessage({
            command: 'saveSettings',
            config: config
        });
    };
    /**
     * 测试连接
     */
    VSCodeAPI.prototype.testConnection = function () {
        this.postMessage({
            command: 'testConnection'
        });
    };
    /**
     * 批准差异
     */
    VSCodeAPI.prototype.approveDiff = function (filePath, diffId, action) {
        this.postMessage({
            command: 'approveDiff',
            filePath: filePath,
            diffId: diffId,
            action: action
        });
    };
    /**
     * 重置设置
     */
    VSCodeAPI.prototype.resetSettings = function () {
        this.postMessage({
            command: 'resetSettings'
        });
    };
    /**
     * 文件命令
     */
    VSCodeAPI.prototype.fileCommand = function (command, data) {
        this.postMessage({
            command: 'fileCommand',
            fileCommand: command,
            data: data
        });
    };
    /**
     * 编辑消息
     */
    VSCodeAPI.prototype.editMessage = function (messageId, newContent) {
        this.postMessage({
            command: 'editMessage',
            messageId: messageId,
            newContent: newContent
        });
    };
    /**
     * 重新生成消息
     */
    VSCodeAPI.prototype.regenerateMessage = function (messageId) {
        this.postMessage({
            command: 'regenerateMessage',
            messageId: messageId
        });
    };
    /**
     * 登出
     */
    VSCodeAPI.prototype.signOut = function () {
        this.postMessage({
            command: 'signOut'
        });
    };
    /**
     * 升级账户
     */
    VSCodeAPI.prototype.upgradeAccount = function () {
        this.postMessage({
            command: 'upgradeAccount'
        });
    };
    /**
     * 添加 MCP
     */
    VSCodeAPI.prototype.addMCP = function () {
        this.postMessage({
            command: 'addMCP'
        });
    };
    return VSCodeAPI;
}());
// 创建单例实例
var vscode = new VSCodeAPI();
exports.default = vscode;
