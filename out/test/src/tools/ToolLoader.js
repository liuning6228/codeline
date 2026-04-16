"use strict";
/**
 * 工具加载器
 * 负责加载和注册所有工具适配器
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
exports.ToolLoader = void 0;
const vscode = __importStar(require("vscode"));
const ToolRegistry_1 = require("./ToolRegistry");
const ToolInterface_1 = require("./ToolInterface");
const FileManagerAdapter_1 = require("./adapters/FileManagerAdapter");
const TerminalExecutorAdapter_1 = require("./adapters/TerminalExecutorAdapter");
const BrowserAutomatorAdapter_1 = require("./adapters/BrowserAutomatorAdapter");
const MCPManagerAdapter_1 = require("./adapters/MCPManagerAdapter");
const EnhancedBashTool_1 = require("./bash/EnhancedBashTool");
/**
 * 工具加载器
 */
class ToolLoader {
    toolRegistry;
    context;
    config;
    isLoaded = false;
    loadingPromise = null;
    constructor(context, registry, config) {
        this.context = context;
        // 创建或使用现有的工具注册表
        if (registry) {
            this.toolRegistry = registry;
        }
        else {
            const registryConfig = {
                enableLazyLoading: true,
                defaultCategories: Object.values(ToolInterface_1.ToolCategory),
            };
            this.toolRegistry = new ToolRegistry_1.ToolRegistry(registryConfig);
        }
        // 设置配置
        this.config = {
            enableFileTools: true,
            enableTerminalTools: true,
            enableBrowserTools: true,
            enableMCPTools: true,
            autoLoadTools: true,
            showLoadingProgress: true,
            loadingTimeout: 30000,
            ...config,
        };
    }
    /**
     * 加载所有工具
     */
    async loadTools() {
        // 如果正在加载，返回现有的Promise
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        // 如果已经加载，返回true
        if (this.isLoaded) {
            return true;
        }
        // 创建加载Promise
        this.loadingPromise = this.loadToolsInternal();
        return this.loadingPromise;
    }
    /**
     * 内部加载实现
     */
    async loadToolsInternal() {
        const startTime = Date.now();
        try {
            // 显示加载进度
            let progressDisposable;
            if (this.config.showLoadingProgress) {
                progressDisposable = this.showLoadingProgress();
            }
            // 初始化工具注册表
            this.context.outputChannel.appendLine('🔧 Initializing tool registry...');
            const registryInitialized = await this.toolRegistry.initialize();
            if (!registryInitialized) {
                this.context.outputChannel.appendLine('❌ Failed to initialize tool registry');
                return false;
            }
            // 加载工具适配器
            this.context.outputChannel.appendLine('📦 Loading tool adapters...');
            const adaptersToLoad = [];
            // 文件工具
            if (this.config.enableFileTools) {
                adaptersToLoad.push({
                    name: 'File Manager',
                    loader: () => this.loadFileTools(),
                });
            }
            // 终端工具
            if (this.config.enableTerminalTools) {
                adaptersToLoad.push({
                    name: 'Terminal Executor',
                    loader: () => this.loadTerminalTools(),
                });
            }
            // 浏览器工具
            if (this.config.enableBrowserTools) {
                adaptersToLoad.push({
                    name: 'Browser Automator',
                    loader: () => this.loadBrowserTools(),
                });
            }
            // MCP工具
            if (this.config.enableMCPTools) {
                adaptersToLoad.push({
                    name: 'MCP Manager',
                    loader: () => this.loadMCPTools(),
                });
            }
            // 批量加载工具
            let loadedCount = 0;
            let failedCount = 0;
            for (const adapter of adaptersToLoad) {
                try {
                    this.context.outputChannel.appendLine(`  Loading ${adapter.name}...`);
                    const success = await adapter.loader();
                    if (success) {
                        loadedCount++;
                        this.context.outputChannel.appendLine(`  ✅ ${adapter.name} loaded`);
                    }
                    else {
                        failedCount++;
                        this.context.outputChannel.appendLine(`  ⚠️ ${adapter.name} partially loaded or failed`);
                    }
                }
                catch (error) {
                    failedCount++;
                    this.context.outputChannel.appendLine(`  ❌ ${adapter.name} failed: ${error.message}`);
                }
            }
            // 清理进度显示
            if (progressDisposable) {
                progressDisposable.dispose();
            }
            const duration = Date.now() - startTime;
            this.context.outputChannel.appendLine(`✅ Tool loading completed: ${loadedCount} loaded, ${failedCount} failed (${duration}ms)`);
            // 获取注册表状态
            const registryStatus = this.toolRegistry.getStatus();
            this.context.outputChannel.appendLine(`📊 Tool Registry: ${registryStatus.toolCount} tools, ${registryStatus.categoryCount} categories`);
            this.isLoaded = true;
            return true;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.context.outputChannel.appendLine(`❌ Tool loading failed after ${duration}ms: ${error.message}`);
            return false;
        }
        finally {
            this.loadingPromise = null;
        }
    }
    /**
     * 加载文件工具
     */
    async loadFileTools() {
        try {
            const fileAdapter = FileManagerAdapter_1.FileManagerAdapter.create(this.context);
            // 注册文件适配器
            const registered = this.toolRegistry.registerTool(fileAdapter, [
                ToolInterface_1.ToolCategory.FILE,
                ToolInterface_1.ToolCategory.DEVELOPMENT,
            ]);
            if (!registered) {
                this.context.outputChannel.appendLine('  ⚠️ File manager adapter registration failed');
                return false;
            }
            // 注册文件操作的别名
            this.toolRegistry.registerAlias(fileAdapter.id, 'file');
            this.toolRegistry.registerAlias(fileAdapter.id, 'files');
            this.toolRegistry.registerAlias(fileAdapter.id, 'fs');
            this.toolRegistry.registerAlias(fileAdapter.id, 'file-system');
            return true;
        }
        catch (error) {
            this.context.outputChannel.appendLine(`  ❌ File tools failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 加载终端工具
     */
    async loadTerminalTools() {
        try {
            const terminalAdapter = TerminalExecutorAdapter_1.TerminalExecutorAdapter.create(this.context);
            // 注册终端适配器
            const registered = this.toolRegistry.registerTool(terminalAdapter, [
                ToolInterface_1.ToolCategory.TERMINAL,
                ToolInterface_1.ToolCategory.DEVELOPMENT,
                ToolInterface_1.ToolCategory.UTILITY,
            ]);
            if (!registered) {
                this.context.outputChannel.appendLine('  ⚠️ Terminal executor adapter registration failed');
                return false;
            }
            // 注册终端操作的别名
            this.toolRegistry.registerAlias(terminalAdapter.id, 'terminal');
            this.toolRegistry.registerAlias(terminalAdapter.id, 'shell');
            this.toolRegistry.registerAlias(terminalAdapter.id, 'cmd');
            this.toolRegistry.registerAlias(terminalAdapter.id, 'command');
            // 注册 EnhancedBashTool（增强版终端命令执行，包含沙箱和权限控制）
            const bashTool = new EnhancedBashTool_1.EnhancedBashTool();
            const bashRegistered = this.toolRegistry.registerTool(bashTool, [
                ToolInterface_1.ToolCategory.TERMINAL,
                ToolInterface_1.ToolCategory.DEVELOPMENT,
                ToolInterface_1.ToolCategory.UTILITY,
            ]);
            if (bashRegistered) {
                this.context.outputChannel.appendLine('  ✅ EnhancedBashTool registered');
                // 注册 BashTool 的别名
                this.toolRegistry.registerAlias(bashTool.id, 'bash');
                this.toolRegistry.registerAlias(bashTool.id, 'sh');
                this.toolRegistry.registerAlias(bashTool.id, 'zsh');
                this.toolRegistry.registerAlias(bashTool.id, 'powershell');
                this.toolRegistry.registerAlias(bashTool.id, 'pwsh');
            }
            else {
                this.context.outputChannel.appendLine('  ⚠️ BashTool registration failed (may already be registered)');
            }
            return true;
        }
        catch (error) {
            this.context.outputChannel.appendLine(`  ❌ Terminal tools failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 加载浏览器工具
     */
    async loadBrowserTools() {
        try {
            const browserAdapter = BrowserAutomatorAdapter_1.BrowserAutomatorAdapter.create(this.context);
            // 注册浏览器适配器
            const registered = this.toolRegistry.registerTool(browserAdapter, [
                ToolInterface_1.ToolCategory.BROWSER,
                ToolInterface_1.ToolCategory.DEVELOPMENT,
                ToolInterface_1.ToolCategory.UTILITY,
            ]);
            if (!registered) {
                this.context.outputChannel.appendLine('  ⚠️ Browser automator adapter registration failed');
                return false;
            }
            // 注册浏览器操作的别名
            this.toolRegistry.registerAlias(browserAdapter.id, 'browser');
            this.toolRegistry.registerAlias(browserAdapter.id, 'web');
            this.toolRegistry.registerAlias(browserAdapter.id, 'automation');
            this.toolRegistry.registerAlias(browserAdapter.id, 'scraping');
            return true;
        }
        catch (error) {
            this.context.outputChannel.appendLine(`  ❌ Browser tools failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 加载MCP工具
     */
    async loadMCPTools() {
        try {
            const mcpAdapter = MCPManagerAdapter_1.MCPManagerAdapter.create(this.context);
            // 注册MCP适配器
            const registered = this.toolRegistry.registerTool(mcpAdapter, [
                ToolInterface_1.ToolCategory.MCP,
                ToolInterface_1.ToolCategory.AI,
                ToolInterface_1.ToolCategory.DEVELOPMENT,
                ToolInterface_1.ToolCategory.UTILITY,
            ]);
            if (!registered) {
                this.context.outputChannel.appendLine('  ⚠️ MCP manager adapter registration failed');
                return false;
            }
            // 注册MCP操作的别名
            this.toolRegistry.registerAlias(mcpAdapter.id, 'mcp');
            this.toolRegistry.registerAlias(mcpAdapter.id, 'model-context');
            this.toolRegistry.registerAlias(mcpAdapter.id, 'tools');
            this.toolRegistry.registerAlias(mcpAdapter.id, 'protocol');
            return true;
        }
        catch (error) {
            this.context.outputChannel.appendLine(`  ❌ MCP tools failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 显示加载进度
     */
    showLoadingProgress() {
        const progressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: 'Loading CodeLine Tools',
            cancellable: false,
        };
        return vscode.window.withProgress(progressOptions, async (progress) => {
            progress.report({ message: 'Initializing...', increment: 0 });
            // 模拟进度更新（实际进度由加载过程控制）
            const interval = setInterval(() => {
                progress.report({ message: 'Loading tool adapters...' });
            }, 1000);
            // 返回清理函数
            return {
                dispose: () => clearInterval(interval),
            };
        });
    }
    /**
     * 重新加载工具
     */
    async reloadTools() {
        this.isLoaded = false;
        this.loadingPromise = null;
        this.context.outputChannel.appendLine('🔄 Reloading tools...');
        return this.loadTools();
    }
    /**
     * 获取工具注册表
     */
    getToolRegistry() {
        return this.toolRegistry;
    }
    /**
     * 获取加载状态
     */
    getLoadingStatus() {
        return {
            isLoaded: this.isLoaded,
            isLoading: this.loadingPromise !== null,
            registryStatus: this.isLoaded ? this.toolRegistry.getStatus() : undefined,
        };
    }
    /**
     * 获取工具统计信息
     */
    getToolStats() {
        const registryStatus = this.toolRegistry.getStatus();
        const loadingStatus = this.getLoadingStatus();
        return {
            totalTools: registryStatus.toolCount,
            loadedTools: this.isLoaded ? registryStatus.toolCount : 0,
            failedTools: 0, // 需要跟踪失败的工具
            toolCategories: registryStatus.categoryCount,
        };
    }
    /**
     * 关闭工具加载器
     */
    async close() {
        this.context.outputChannel.appendLine('🔒 Closing tool loader...');
        // 关闭工具注册表
        await this.toolRegistry.close();
        this.context.outputChannel.appendLine('✅ Tool loader closed');
    }
}
exports.ToolLoader = ToolLoader;
//# sourceMappingURL=ToolLoader.js.map