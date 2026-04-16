"use strict";
/**
 * 插件扩展集成
 * 将插件系统集成到CodeLine主扩展中
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
exports.PluginExtension = void 0;
const vscode = __importStar(require("vscode"));
const PluginManager_1 = require("./PluginManager");
const PluginToolRegistry_1 = require("./PluginToolRegistry");
const PluginMCPHandler_1 = require("./PluginMCPHandler");
const ToolRegistry_1 = require("../tools/ToolRegistry");
const MCPHandler_1 = require("../mcp/MCPHandler");
const PluginInterface_1 = require("./PluginInterface");
/**
 * 插件扩展
 * 负责在CodeLine扩展中集成插件系统
 */
class PluginExtension {
    static instance;
    pluginManager;
    pluginToolRegistry;
    pluginMCPHandler;
    outputChannel;
    config;
    state;
    extensionContext;
    toolContext;
    constructor(extensionContext, toolContext, config) {
        this.extensionContext = extensionContext;
        this.toolContext = toolContext;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Plugin Extension');
        this.config = {
            enabled: true,
            autoLoadBuiltins: true,
            pluginDirs: [
                path.join(extensionContext.extensionPath, 'plugins'),
                path.join(toolContext.workspaceRoot, '.codeline', 'plugins'),
            ],
            enableManagementUI: true,
            enableMarketplace: false,
            ...config,
        };
        this.state = {
            pluginManagerReady: false,
            loadedPlugins: 0,
            activePlugins: 0,
            pluginTools: 0,
            pluginMCPServers: 0,
        };
    }
    static getInstance(extensionContext, toolContext, config) {
        if (!PluginExtension.instance && extensionContext && toolContext) {
            PluginExtension.instance = new PluginExtension(extensionContext, toolContext, config);
        }
        return PluginExtension.instance;
    }
    /**
     * 初始化插件扩展
     */
    async initialize() {
        if (!this.config.enabled) {
            this.outputChannel.appendLine('ℹ️ Plugin system is disabled by configuration');
            return;
        }
        this.outputChannel.show(true);
        this.outputChannel.appendLine('🔧 Initializing CodeLine Plugin Extension...');
        try {
            // 1. 初始化插件管理器
            await this.initializePluginManager();
            // 2. 初始化插件工具注册表
            await this.initializePluginToolRegistry();
            // 3. 初始化插件MCP处理器
            await this.initializePluginMCPHandler();
            // 4. 加载内置插件
            if (this.config.autoLoadBuiltins) {
                await this.loadBuiltinPlugins();
            }
            // 5. 注册命令和UI
            await this.registerCommandsAndUI();
            this.state.pluginManagerReady = true;
            this.outputChannel.appendLine('✅ Plugin Extension initialized successfully');
            this.outputChannel.appendLine(`   Loaded plugins: ${this.state.loadedPlugins}`);
            this.outputChannel.appendLine(`   Active plugins: ${this.state.activePlugins}`);
            this.outputChannel.appendLine(`   Plugin tools: ${this.state.pluginTools}`);
            this.outputChannel.appendLine(`   Plugin MCP servers: ${this.state.pluginMCPServers}`);
        }
        catch (error) {
            this.state.lastError = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`❌ Failed to initialize Plugin Extension: ${this.state.lastError}`);
            throw error;
        }
    }
    /**
     * 初始化插件管理器
     */
    async initializePluginManager() {
        this.outputChannel.appendLine('📦 Initializing Plugin Manager...');
        this.pluginManager = new PluginManager_1.PluginManager(this.extensionContext, this.toolContext, {
            pluginDirs: this.config.pluginDirs,
            autoDiscover: true,
            autoLoad: true,
        });
        // 设置状态监听器
        this.pluginManager.addLifecycleListener((event) => {
            this.handlePluginLifecycleEvent(event);
        });
        await this.pluginManager.initialize();
        // 更新状态
        const plugins = this.pluginManager.getPlugins();
        this.state.loadedPlugins = plugins.length;
        this.state.activePlugins = plugins.filter(p => this.pluginManager?.getPluginState(p.metadata.id) === PluginInterface_1.PluginLifecycleState.ACTIVATED).length;
        this.outputChannel.appendLine(`✅ Plugin Manager initialized (${plugins.length} plugins discovered)`);
    }
    /**
     * 初始化插件工具注册表
     */
    async initializePluginToolRegistry() {
        this.outputChannel.appendLine('🔧 Initializing Plugin Tool Registry...');
        // 获取或创建基础工具注册表
        const baseToolRegistry = await this.getOrCreateBaseToolRegistry();
        this.pluginToolRegistry = new PluginToolRegistry_1.PluginToolRegistry({
            enablePluginSupport: true,
            autoLoadPlugins: true,
            pluginToolPrefix: 'plugin:',
        });
        // 初始化插件工具注册表
        await this.pluginToolRegistry.initializeWithPlugins(this.extensionContext, this.toolContext);
        // 更新状态 - 使用size属性
        const tools = this.pluginToolRegistry.getPluginTools();
        this.state.pluginTools = tools.size;
        this.outputChannel.appendLine(`✅ Plugin Tool Registry initialized (${tools.size} plugin tools registered)`);
    }
    /**
     * 初始化插件MCP处理器
     */
    async initializePluginMCPHandler() {
        this.outputChannel.appendLine('🔌 Initializing Plugin MCP Handler...');
        this.pluginMCPHandler = new PluginMCPHandler_1.PluginMCPHandler(this.extensionContext);
        // 初始化插件MCP处理器
        await this.pluginMCPHandler.initialize(this.toolContext.workspaceRoot, this.pluginToolRegistry);
        // 更新状态
        const servers = this.pluginMCPHandler.getPluginMCPServers();
        this.state.pluginMCPServers = servers.length;
        this.outputChannel.appendLine(`✅ Plugin MCP Handler initialized (${servers.length} plugin MCP servers registered)`);
    }
    /**
     * 获取或创建基础工具注册表
     */
    async getOrCreateBaseToolRegistry() {
        // 尝试从全局上下文中获取
        if (this.toolContext.sharedResources?.toolRegistry) {
            return this.toolContext.sharedResources.toolRegistry;
        }
        // 创建新的工具注册表
        const toolRegistry = new ToolRegistry_1.ToolRegistry();
        await toolRegistry.initialize();
        // 存储到全局上下文
        if (!this.toolContext.sharedResources) {
            this.toolContext.sharedResources = {};
        }
        this.toolContext.sharedResources.toolRegistry = toolRegistry;
        return toolRegistry;
    }
    /**
     * 获取或创建基础MCP处理器
     */
    async getOrCreateBaseMCPHandler() {
        // 尝试从全局上下文中获取
        if (this.toolContext.sharedResources?.mcpHandler) {
            return this.toolContext.sharedResources.mcpHandler;
        }
        // 创建新的MCP处理器
        // 注意：这里需要传入适当的参数
        const mcpHandler = new MCPHandler_1.MCPHandler(this.toolContext // 转换为MCP处理器所需的上下文
        );
        // 存储到全局上下文
        if (!this.toolContext.sharedResources) {
            this.toolContext.sharedResources = {};
        }
        this.toolContext.sharedResources.mcpHandler = mcpHandler;
        return mcpHandler;
    }
    /**
     * 加载内置插件
     */
    async loadBuiltinPlugins() {
        this.outputChannel.appendLine('📥 Loading builtin plugins...');
        // 内置插件目录
        const builtinPluginDir = path.join(this.extensionContext.extensionPath, 'builtin-plugins');
        try {
            await fs.access(builtinPluginDir);
            const pluginDirs = await fs.readdir(builtinPluginDir);
            let loadedCount = 0;
            for (const pluginDir of pluginDirs) {
                const pluginPath = path.join(builtinPluginDir, pluginDir);
                try {
                    // 检查是否为目录
                    const stat = await fs.stat(pluginPath);
                    if (!stat.isDirectory()) {
                        continue;
                    }
                    // 检查插件配置文件
                    const configPath = path.join(pluginPath, 'plugin.json');
                    try {
                        await fs.access(configPath);
                    }
                    catch {
                        this.outputChannel.appendLine(`⚠️ Skipping ${pluginDir}: missing plugin.json`);
                        continue;
                    }
                    // 加载插件
                    await this.pluginManager.loadPlugin(pluginPath);
                    loadedCount++;
                }
                catch (error) {
                    this.outputChannel.appendLine(`⚠️ Failed to load builtin plugin ${pluginDir}: ${error}`);
                }
            }
            this.outputChannel.appendLine(`✅ Loaded ${loadedCount} builtin plugins`);
        }
        catch (error) {
            // 内置插件目录不存在，跳过
            this.outputChannel.appendLine('ℹ️ Builtin plugins directory not found, skipping');
        }
    }
    /**
     * 注册命令和UI
     */
    async registerCommandsAndUI() {
        this.outputChannel.appendLine('🎛️ Registering plugin commands and UI...');
        // 注册插件管理命令
        const commands = [
            {
                command: 'codeline.plugins.manage',
                callback: () => this.showPluginManagementUI(),
                title: 'Manage CodeLine Plugins'
            },
            {
                command: 'codeline.plugins.reload',
                callback: () => this.reloadPlugins(),
                title: 'Reload All Plugins'
            },
            {
                command: 'codeline.plugins.list',
                callback: () => this.listPlugins(),
                title: 'List Installed Plugins'
            },
            {
                command: 'codeline.plugins.install',
                callback: () => this.installPlugin(),
                title: 'Install Plugin'
            },
            {
                command: 'codeline.plugins.uninstall',
                callback: (pluginId) => this.uninstallPlugin(pluginId),
                title: 'Uninstall Plugin'
            },
            {
                command: 'codeline.plugins.enable',
                callback: (pluginId) => this.enablePlugin(pluginId),
                title: 'Enable Plugin'
            },
            {
                command: 'codeline.plugins.disable',
                callback: (pluginId) => this.disablePlugin(pluginId),
                title: 'Disable Plugin'
            },
        ];
        for (const cmd of commands) {
            this.extensionContext.subscriptions.push(vscode.commands.registerCommand(cmd.command, cmd.callback));
        }
        // 创建插件管理视图
        if (this.config.enableManagementUI) {
            await this.createPluginManagementView();
        }
        this.outputChannel.appendLine('✅ Plugin commands and UI registered');
    }
    /**
     * 创建插件管理视图
     */
    async createPluginManagementView() {
        // 注册插件管理面板
        const provider = new PluginManagementViewProvider(this.extensionContext, this.pluginManager, this.pluginToolRegistry, this.pluginMCPHandler);
        const registration = vscode.window.registerWebviewViewProvider('codeline.plugins', provider);
        this.extensionContext.subscriptions.push(registration);
    }
    /**
     * 显示插件管理UI
     */
    showPluginManagementUI() {
        vscode.commands.executeCommand('workbench.view.extension.codeline.plugins');
    }
    /**
     * 重新加载所有插件
     */
    async reloadPlugins() {
        const answer = await vscode.window.showWarningMessage('Reload all plugins? This will unload and reload all plugins.', { modal: true }, 'Reload', 'Cancel');
        if (answer !== 'Reload') {
            return;
        }
        try {
            // 简化版：重新扫描插件目录
            if (this.pluginManager && this.pluginManager.discoverAndLoadPlugins) {
                await this.pluginManager.discoverAndLoadPlugins();
                vscode.window.showInformationMessage('Plugins reloaded successfully');
            }
            else {
                vscode.window.showInformationMessage('Plugin reload not yet implemented');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to reload plugins: ${error}`);
        }
    }
    /**
     * 列出所有插件
     */
    async listPlugins() {
        const plugins = this.pluginManager.getPlugins();
        if (plugins.length === 0) {
            vscode.window.showInformationMessage('No plugins installed');
            return;
        }
        const items = plugins.map(plugin => ({
            label: plugin.metadata.name,
            description: `v${plugin.metadata.version} - ${plugin.metadata.id}`,
            detail: plugin.metadata.description,
            id: plugin.metadata.id,
            state: this.pluginManager.getPluginState(plugin.metadata.id)
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a plugin for details',
        });
        if (selected) {
            await this.showPluginDetails(selected.id);
        }
    }
    /**
     * 显示插件详情
     */
    async showPluginDetails(pluginId) {
        const plugin = this.pluginManager.getPlugin(pluginId);
        const state = this.pluginManager.getPluginState(pluginId);
        // 获取插件配置（通过类型断言访问私有字段）
        const pluginManagerAny = this.pluginManager;
        const config = pluginManagerAny.pluginConfigs?.get?.(pluginId) || {};
        if (!plugin) {
            vscode.window.showErrorMessage(`Plugin ${pluginId} not found`);
            return;
        }
        const message = [
            `# ${plugin.metadata.name}`,
            `**Version:** ${plugin.metadata.version}`,
            `**ID:** ${plugin.metadata.id}`,
            `**State:** ${state}`,
            `**Author:** ${plugin.metadata.author || 'Unknown'}`,
            `**Description:** ${plugin.metadata.description}`,
            '',
            '## Configuration',
            '```json',
            JSON.stringify(config, null, 2),
            '```',
        ].join('\n');
        const doc = await vscode.workspace.openTextDocument({
            content: message,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc, { preview: true });
    }
    /**
     * 安装插件
     */
    async installPlugin() {
        const answer = await vscode.window.showInputBox({
            prompt: 'Enter plugin installation source (local path or URL)',
            placeHolder: '/path/to/plugin or https://example.com/plugin.zip'
        });
        if (!answer) {
            return;
        }
        try {
            // 简化版：显示安装说明
            if (this.pluginManager && this.pluginManager.installPlugin) {
                await this.pluginManager.installPlugin(answer);
                vscode.window.showInformationMessage('Plugin installed successfully');
            }
            else {
                vscode.window.showInformationMessage('Manual plugin installation required. Place plugin folder in: ' + this.config.pluginDirs[0]);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to install plugin: ${error}`);
        }
    }
    /**
     * 卸载插件
     */
    async uninstallPlugin(pluginId) {
        const plugin = this.pluginManager.getPlugin(pluginId);
        if (!plugin) {
            vscode.window.showErrorMessage(`Plugin ${pluginId} not found`);
            return;
        }
        const answer = await vscode.window.showWarningMessage(`Uninstall plugin "${plugin.metadata.name}"?`, { modal: true }, 'Uninstall', 'Cancel');
        if (answer !== 'Uninstall') {
            return;
        }
        try {
            await this.pluginManager.unloadPlugin(pluginId);
            vscode.window.showInformationMessage(`Plugin "${plugin.metadata.name}" uninstalled`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to uninstall plugin: ${error}`);
        }
    }
    /**
     * 启用插件
     */
    async enablePlugin(pluginId) {
        try {
            await this.pluginManager.activatePlugin(pluginId);
            vscode.window.showInformationMessage(`Plugin ${pluginId} enabled`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to enable plugin: ${error}`);
        }
    }
    /**
     * 禁用插件
     */
    async disablePlugin(pluginId) {
        try {
            await this.pluginManager.deactivatePlugin(pluginId);
            vscode.window.showInformationMessage(`Plugin ${pluginId} disabled`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to disable plugin: ${error}`);
        }
    }
    /**
     * 处理插件生命周期事件
     */
    handlePluginLifecycleEvent(event) {
        // 更新状态
        switch (event.type) {
            case 'loaded':
                this.state.loadedPlugins++;
                break;
            case 'unloaded':
                this.state.loadedPlugins--;
                break;
            case 'activated':
                this.state.activePlugins++;
                break;
            case 'deactivated':
                this.state.activePlugins--;
                break;
        }
        // 记录事件
        this.outputChannel.appendLine(`🔔 Plugin event: ${event.pluginId} - ${event.type}`);
    }
    /**
     * 获取插件扩展状态
     */
    getState() {
        return { ...this.state };
    }
    /**
     * 获取插件管理器
     */
    getPluginManager() {
        return this.pluginManager;
    }
    /**
     * 获取插件工具注册表
     */
    getPluginToolRegistry() {
        return this.pluginToolRegistry;
    }
    /**
     * 获取插件MCP处理器
     */
    getPluginMCPHandler() {
        return this.pluginMCPHandler;
    }
    /**
     * 清理资源
     */
    dispose() {
        // 检查并调用dispose方法（如果存在）
        if (this.pluginManager && typeof this.pluginManager.dispose === 'function') {
            this.pluginManager.dispose();
        }
        if (this.pluginToolRegistry && typeof this.pluginToolRegistry.dispose === 'function') {
            this.pluginToolRegistry.dispose();
        }
        if (this.pluginMCPHandler && typeof this.pluginMCPHandler.dispose === 'function') {
            this.pluginMCPHandler.dispose();
        }
        this.outputChannel.dispose();
    }
}
exports.PluginExtension = PluginExtension;
// 导入缺失的模块
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
/**
 * 插件管理视图提供者
 */
class PluginManagementViewProvider {
    extensionContext;
    pluginManager;
    pluginToolRegistry;
    pluginMCPHandler;
    view;
    constructor(extensionContext, pluginManager, pluginToolRegistry, pluginMCPHandler) {
        this.extensionContext = extensionContext;
        this.pluginManager = pluginManager;
        this.pluginToolRegistry = pluginToolRegistry;
        this.pluginMCPHandler = pluginMCPHandler;
    }
    resolveWebviewView(webviewView, context, token) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this.extensionContext.extensionUri
            ]
        };
        webviewView.webview.html = this.getWebviewContent();
        // 设置消息处理器
        webviewView.webview.onDidReceiveMessage(async (message) => {
            await this.handleWebviewMessage(message);
        });
        // 定期更新插件状态
        this.updatePluginStatus();
    }
    getWebviewContent() {
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeLine Plugins</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
          }
          .header {
            margin-bottom: 20px;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .stat-card {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 4px;
            padding: 10px;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
          }
          .stat-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
          }
          .plugins-list {
            margin-top: 20px;
          }
          .plugin-card {
            background: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 10px;
          }
          .plugin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .plugin-title {
            font-size: 16px;
            font-weight: bold;
          }
          .plugin-state {
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: bold;
          }
          .state-active {
            background: var(--vscode-testing-iconPassed);
            color: white;
          }
          .state-inactive {
            background: var(--vscode-testing-iconFailed);
            color: white;
          }
          .plugin-description {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
          }
          .plugin-actions {
            display: flex;
            gap: 10px;
          }
          button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 4px 12px;
            border-radius: 2px;
            cursor: pointer;
          }
          button:hover {
            background: var(--vscode-button-hoverBackground);
          }
          .button-danger {
            background: var(--vscode-errorForeground);
          }
          .button-success {
            background: var(--vscode-testing-iconPassed);
          }
          .button-warning {
            background: var(--vscode-testing-iconQueued);
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CodeLine Plugins</h1>
          <p>Manage plugins that extend CodeLine functionality</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value" id="total-plugins">0</div>
            <div class="stat-label">Total Plugins</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="active-plugins">0</div>
            <div class="stat-label">Active Plugins</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="plugin-tools">0</div>
            <div class="stat-label">Plugin Tools</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="mcp-servers">0</div>
            <div class="stat-label">MCP Servers</div>
          </div>
        </div>
        
        <div>
          <button onclick="handleAction('reload')">Reload All Plugins</button>
          <button onclick="handleAction('install')">Install Plugin</button>
          <button onclick="handleAction('open-dir')">Open Plugin Directory</button>
        </div>
        
        <div class="plugins-list" id="plugins-list">
          <!-- Plugin cards will be populated here -->
        </div>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          // 处理按钮点击
          function handleAction(action, data = null) {
            vscode.postMessage({ type: 'action', action, data });
          }
          
          // 处理插件操作
          function handlePluginAction(pluginId, action) {
            vscode.postMessage({ type: 'plugin-action', pluginId, action });
          }
          
          // 初始加载
          window.addEventListener('load', () => {
            vscode.postMessage({ type: 'get-status' });
          });
          
          // 监听消息
          window.addEventListener('message', (event) => {
            const message = event.data;
            
            switch (message.type) {
              case 'status':
                updateStatus(message.data);
                break;
              case 'plugins':
                updatePluginsList(message.data);
                break;
            }
          });
          
          function updateStatus(data) {
            document.getElementById('total-plugins').textContent = data.totalPlugins;
            document.getElementById('active-plugins').textContent = data.activePlugins;
            document.getElementById('plugin-tools').textContent = data.pluginTools;
            document.getElementById('mcp-servers').textContent = data.mcpServers;
          }
          
          function updatePluginsList(plugins) {
            const container = document.getElementById('plugins-list');
            container.innerHTML = '';
            
            if (plugins.length === 0) {
              container.innerHTML = '<p>No plugins installed. Click "Install Plugin" to add some!</p>';
              return;
            }
            
            plugins.forEach(plugin => {
              const card = document.createElement('div');
              card.className = 'plugin-card';
              
              const stateClass = plugin.state === 'active' ? 'state-active' : 'state-inactive';
              
              card.innerHTML = \`
                <div class="plugin-header">
                  <div>
                    <span class="plugin-title">\${plugin.name}</span>
                    <span style="font-size: 12px; color: #999; margin-left: 10px;">v\${plugin.version}</span>
                  </div>
                  <span class="plugin-state \${stateClass}">\${plugin.state}</span>
                </div>
                <div class="plugin-description">\${plugin.description}</div>
                <div class="plugin-actions">
                  \${plugin.state === 'active' 
                    ? '<button class="button-warning" onclick="handlePluginAction(\\'' + plugin.id + '\\', \\'deactivate\\')">Disable</button>'
                    : '<button class="button-success" onclick="handlePluginAction(\\'' + plugin.id + '\\', \\'activate\\')">Enable</button>'
                  }
                  <button onclick="handlePluginAction(\\'' + plugin.id + '\\', \\'details\\')">Details</button>
                  <button class="button-danger" onclick="handlePluginAction(\\'' + plugin.id + '\\', \\'uninstall\\')">Uninstall</button>
                </div>
              \`;
              
              container.appendChild(card);
            });
          }
        </script>
      </body>
      </html>
    `;
    }
    async handleWebviewMessage(message) {
        switch (message.type) {
            case 'get-status':
                await this.sendPluginStatus();
                break;
            case 'action':
                await this.handleAction(message.action, message.data);
                break;
            case 'plugin-action':
                await this.handlePluginAction(message.pluginId, message.action);
                break;
        }
    }
    async sendPluginStatus() {
        const plugins = this.pluginManager.getPlugins();
        const activePlugins = plugins.filter(p => this.pluginManager.getPluginState(p.metadata.id) === 'activated').length;
        const pluginTools = this.pluginToolRegistry.getPluginTools().size;
        const mcpServers = this.pluginMCPHandler.getPluginMCPServers().length;
        // 发送状态
        this.view?.webview.postMessage({
            type: 'status',
            data: {
                totalPlugins: plugins.length,
                activePlugins,
                pluginTools,
                mcpServers
            }
        });
        // 发送插件列表
        const pluginData = plugins.map(plugin => ({
            id: plugin.metadata.id,
            name: plugin.metadata.name,
            version: plugin.metadata.version,
            description: plugin.metadata.description,
            state: this.pluginManager.getPluginState(plugin.metadata.id)
        }));
        this.view?.webview.postMessage({
            type: 'plugins',
            data: pluginData
        });
    }
    async handleAction(action, data) {
        switch (action) {
            case 'reload':
                // 使用类型断言调用discoverAndLoadPlugins
                if (typeof this.pluginManager.discoverAndLoadPlugins === 'function') {
                    await this.pluginManager.discoverAndLoadPlugins();
                    vscode.window.showInformationMessage('Plugins reloaded');
                    await this.sendPluginStatus();
                }
                else {
                    vscode.window.showInformationMessage('Plugin reload not yet implemented');
                }
                break;
            case 'install':
                vscode.commands.executeCommand('codeline.plugins.install');
                break;
            case 'open-dir':
                // 从pluginManager配置中获取插件目录
                const pluginManagerAny = this.pluginManager;
                const pluginDirs = pluginManagerAny.config?.pluginDirs || pluginManagerAny.pluginDirs || [];
                if (pluginDirs.length > 0) {
                    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(pluginDirs[0]));
                }
                else {
                    vscode.window.showWarningMessage('No plugin directories configured');
                }
                break;
        }
    }
    async handlePluginAction(pluginId, action) {
        switch (action) {
            case 'activate':
                await this.pluginManager.activatePlugin(pluginId);
                vscode.window.showInformationMessage(`Plugin ${pluginId} activated`);
                break;
            case 'deactivate':
                await this.pluginManager.deactivatePlugin(pluginId);
                vscode.window.showInformationMessage(`Plugin ${pluginId} deactivated`);
                break;
            case 'details':
                vscode.commands.executeCommand('codeline.plugins.list');
                break;
            case 'uninstall':
                const answer = await vscode.window.showWarningMessage(`Uninstall plugin?`, { modal: true }, 'Uninstall', 'Cancel');
                if (answer === 'Uninstall') {
                    await this.pluginManager.unloadPlugin(pluginId);
                    vscode.window.showInformationMessage(`Plugin ${pluginId} uninstalled`);
                }
                break;
        }
        await this.sendPluginStatus();
    }
    async updatePluginStatus() {
        if (this.view) {
            await this.sendPluginStatus();
        }
        // 每30秒更新一次状态
        setTimeout(() => this.updatePluginStatus(), 30000);
    }
}
//# sourceMappingURL=PluginExtension.js.map