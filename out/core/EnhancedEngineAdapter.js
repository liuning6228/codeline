"use strict";
/**
 * EnhancedEngineAdapter - 增强查询引擎适配器
 *
 * 负责：
 * 1. 初始化EnhancedQueryEngine
 * 2. 配置依赖注入（ModelAdapter、ToolRegistry等）
 * 3. 与CodeLine扩展桥接
 * 4. 提供统一的接口供sidebarProvider调用
 *
 * 设计原则：单例模式，按需初始化，资源懒加载
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
exports.EnhancedEngineAdapter = void 0;
const vscode = __importStar(require("vscode"));
const modelAdapter_1 = require("../models/modelAdapter");
const enhancedProjectAnalyzer_1 = require("../analyzer/enhancedProjectAnalyzer");
const promptEngine_1 = require("../prompt/promptEngine");
const Tool_1 = require("./tool/Tool");
const EnhancedToolRegistry_1 = require("./tool/EnhancedToolRegistry");
const EnhancedQueryEngine_1 = require("./EnhancedQueryEngine");
// ==================== 增强引擎适配器 ====================
/**
 * EnhancedEngineAdapter
 * 负责管理EnhancedQueryEngine的生命周期和与CodeLine扩展的集成
 */
class EnhancedEngineAdapter {
    static instance;
    config;
    engine = null;
    toolRegistry = null;
    adapterState;
    outputChannel;
    initializationPromise = null;
    constructor(config) {
        this.config = config;
        this.outputChannel = vscode.window.createOutputChannel('CodeLine EnhancedEngine');
        this.adapterState = {
            engineReady: false,
            engineMode: config.defaultMode || 'act',
            toolCount: 0,
            conversationCount: 0,
            lastActivity: new Date(),
        };
    }
    /**
     * 获取单例实例
     */
    static getInstance(config) {
        if (!EnhancedEngineAdapter.instance && config) {
            EnhancedEngineAdapter.instance = new EnhancedEngineAdapter(config);
        }
        return EnhancedEngineAdapter.instance;
    }
    /**
     * 初始化增强查询引擎
     * 使用懒加载模式，避免启动时阻塞
     */
    async initialize() {
        // 如果已经在初始化中，等待完成
        if (this.initializationPromise) {
            await this.initializationPromise;
            return this.adapterState.engineReady;
        }
        this.initializationPromise = this.doInitialize();
        try {
            await this.initializationPromise;
            return this.adapterState.engineReady;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ 初始化失败: ${error}`);
            this.adapterState.engineReady = false;
            return false;
        }
        finally {
            this.initializationPromise = null;
        }
    }
    /**
     * 实际初始化过程
     */
    async doInitialize() {
        try {
            this.outputChannel.appendLine('🚀 开始初始化增强查询引擎...');
            // 1. 初始化工具注册表
            this.outputChannel.appendLine('步骤1/4: 初始化工具注册表...');
            await this.initializeToolRegistry();
            // 2. 获取或创建依赖
            this.outputChannel.appendLine('步骤2/4: 获取核心依赖...');
            const dependencies = await this.getDependencies();
            // 3. 创建增强查询引擎
            this.outputChannel.appendLine('步骤3/4: 创建增强查询引擎...');
            this.engine = this.createEnhancedQueryEngine(dependencies);
            // 4. 设置引擎状态
            this.outputChannel.appendLine('步骤4/4: 配置引擎设置...');
            await this.configureEngine();
            // 更新状态
            this.adapterState.engineReady = true;
            this.adapterState.toolCount = this.toolRegistry?.getAllTools().length || 0;
            this.adapterState.lastActivity = new Date();
            this.outputChannel.appendLine(`✅ 增强查询引擎初始化完成！`);
            this.outputChannel.appendLine(`   工具数量: ${this.adapterState.toolCount}`);
            this.outputChannel.appendLine(`   默认模式: ${this.adapterState.engineMode}`);
            // 触发回调
            if (this.config.onEngineReady) {
                this.config.onEngineReady();
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ 初始化过程中出错: ${error}`);
            this.adapterState.engineReady = false;
            if (this.config.onError) {
                this.config.onError(error instanceof Error ? error : new Error(String(error)));
            }
            throw error;
        }
    }
    /**
     * 获取当前引擎（如果已初始化）
     */
    getEngine() {
        return this.engine;
    }
    /**
     * 获取工具注册表
     */
    getToolRegistry() {
        return this.toolRegistry;
    }
    /**
     * 获取适配器状态
     */
    getState() {
        return { ...this.adapterState };
    }
    /**
     * 检查引擎是否就绪
     */
    isReady() {
        return this.adapterState.engineReady && this.engine !== null;
    }
    /**
     * 获取引擎模式
     */
    getMode() {
        if (this.engine) {
            return this.engine.getMode();
        }
        return this.adapterState.engineMode;
    }
    /**
     * 设置引擎模式
     */
    setMode(mode) {
        if (this.engine) {
            this.engine.setMode(mode);
            this.adapterState.engineMode = mode;
        }
        else {
            this.adapterState.engineMode = mode;
        }
    }
    /**
     * 提交消息到引擎
     */
    async submitMessage(content, options) {
        if (!this.isReady()) {
            const initialized = await this.initialize();
            if (!initialized) {
                return {
                    success: false,
                    error: '增强查询引擎未就绪',
                };
            }
        }
        try {
            this.adapterState.lastActivity = new Date();
            const result = await this.engine.submitMessageSync(content, {
                images: options?.images,
                files: options?.files,
                context: options?.context,
                skipThinking: options?.skipThinking,
                skipTools: options?.skipTools,
            });
            if (result.success) {
                this.adapterState.conversationCount++;
            }
            return result;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ 消息提交失败: ${error.message}`);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    /**
     * 获取当前对话状态
     */
    getConversationState() {
        if (!this.engine) {
            return null;
        }
        return this.engine.getState();
    }
    /**
     * 清除当前对话
     */
    clearConversation() {
        if (this.engine) {
            this.engine.clear();
            this.outputChannel.appendLine('🗑️ 对话已清除');
        }
    }
    /**
     * 导出当前对话
     */
    exportConversation() {
        if (!this.engine) {
            return null;
        }
        return this.engine.exportConversation();
    }
    /**
     * 导入对话
     */
    importConversation(json) {
        if (!this.engine) {
            return false;
        }
        try {
            this.engine.importConversation(json);
            this.outputChannel.appendLine('📥 对话已导入');
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ 导入对话失败: ${error}`);
            return false;
        }
    }
    /**
     * 重置适配器
     */
    reset() {
        this.engine = null;
        this.toolRegistry = null;
        this.adapterState = {
            engineReady: false,
            engineMode: this.config.defaultMode || 'act',
            toolCount: 0,
            conversationCount: 0,
            lastActivity: new Date(),
        };
        this.initializationPromise = null;
        this.outputChannel.appendLine('🔄 适配器已重置');
    }
    // ==================== 私有方法 ====================
    /**
     * 初始化工具注册表
     */
    async initializeToolRegistry() {
        try {
            const defaultConfig = {
                enableCaching: true,
                enableLazyLoading: true,
                defaultCategories: [Tool_1.ToolCategory.FILE, Tool_1.ToolCategory.TERMINAL, Tool_1.ToolCategory.BROWSER],
                excludeToolIds: [],
                includeToolIds: [],
                maxConcurrentTools: 5,
                defaultTimeout: 30000,
                ...this.config.toolRegistryConfig,
            };
            this.toolRegistry = new EnhancedToolRegistry_1.EnhancedToolRegistry(defaultConfig);
            // 注册基本工具集
            await this.registerBasicTools();
            this.outputChannel.appendLine(`✅ 工具注册表初始化完成，已注册 ${this.toolRegistry.getAllTools().length} 个工具`);
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ 工具注册表初始化失败: ${error}`);
            throw error;
        }
    }
    /**
     * 注册基本工具集
     */
    async registerBasicTools() {
        if (!this.toolRegistry) {
            return;
        }
        // 这里可以注册基础工具
        // 目前保持为空，后续根据需要添加
        this.outputChannel.appendLine('✅ 基础工具已注册');
    }
    /**
     * 获取核心依赖
     */
    async getDependencies() {
        // 尝试从扩展获取依赖
        const extension = this.config.extension;
        const context = this.config.context;
        // 获取工作区根目录
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workspaceRoot = workspaceFolders?.[0]?.uri.fsPath || process.cwd();
        // 获取扩展的依赖
        const modelAdapter = extension['modelAdapter'] || new modelAdapter_1.ModelAdapter();
        const projectAnalyzer = extension['projectAnalyzer'] || new enhancedProjectAnalyzer_1.EnhancedProjectAnalyzer();
        const promptEngine = extension['promptEngine'] || new promptEngine_1.PromptEngine();
        return {
            modelAdapter,
            projectAnalyzer,
            promptEngine,
            toolRegistry: this.toolRegistry,
            cwd: workspaceRoot,
            extensionContext: context,
            workspaceRoot,
        };
    }
    /**
     * 创建增强查询引擎
     */
    createEnhancedQueryEngine(dependencies) {
        const config = {
            // 核心依赖
            modelAdapter: dependencies.modelAdapter,
            projectAnalyzer: dependencies.projectAnalyzer,
            promptEngine: dependencies.promptEngine,
            toolRegistry: dependencies.toolRegistry,
            // 工作目录和上下文
            cwd: dependencies.cwd,
            extensionContext: dependencies.extensionContext,
            workspaceRoot: dependencies.workspaceRoot,
            // 行为控制
            verbose: this.config.verbose || true,
            thinkingConfig: {
                type: 'adaptive',
                maxTokens: 500,
                temperature: 0.3,
            },
            maxTurns: 20,
            maxBudgetUsd: 10,
            // 模型控制
            userSpecifiedModel: undefined,
            fallbackModel: 'gpt-4',
            customSystemPrompt: undefined,
            appendSystemPrompt: 'You are CodeLine Enhanced, an advanced AI coding assistant with enhanced tool capabilities.',
            // 工具控制
            enabledToolCategories: [Tool_1.ToolCategory.FILE, Tool_1.ToolCategory.TERMINAL, Tool_1.ToolCategory.BROWSER],
            disabledToolIds: [],
            // 状态管理回调
            onStateUpdate: this.config.onStateUpdate,
            // 进度回调
            onProgress: (progress) => {
                this.outputChannel.appendLine(`📊 引擎进度: ${progress.type} - ${progress.stage}`);
            },
            // 权限控制
            permissionMode: 'default',
        };
        return new EnhancedQueryEngine_1.EnhancedQueryEngine(config);
    }
    /**
     * 配置引擎设置
     */
    async configureEngine() {
        if (!this.engine) {
            return;
        }
        // 设置初始模式
        this.engine.setMode(this.adapterState.engineMode);
        // 配置其他设置
        // TODO: 从扩展配置加载更多设置
        this.outputChannel.appendLine(`✅ 引擎配置完成`);
    }
}
exports.EnhancedEngineAdapter = EnhancedEngineAdapter;
exports.default = EnhancedEngineAdapter;
//# sourceMappingURL=EnhancedEngineAdapter.js.map