"use strict";
/**
 * MCP工具适配器
 * 将MCPTool包装成EnhancedBaseTool，实现MCP协议到工具系统的集成
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
exports.MCPToolAdapter = void 0;
const vscode = __importStar(require("vscode"));
const EnhancedBaseTool_1 = require("./EnhancedBaseTool");
const Tool_1 = require("./Tool");
const ZodCompatibility_1 = require("./ZodCompatibility");
/**
 * MCP工具适配器
 * 将MCPTool实例包装成EnhancedBaseTool
 */
class MCPToolAdapter extends EnhancedBaseTool_1.EnhancedBaseTool {
    // ==================== EnhancedBaseTool必需属性 ====================
    id;
    name;
    description;
    version;
    author;
    category;
    /** 是否支持MCP协议 */
    supportMCP = true;
    // ==================== 私有属性 ====================
    mcpTool; // MCPTool类型，使用any避免循环依赖
    mcpConfig;
    outputChannel;
    // ==================== 构造函数 ====================
    constructor(mcpTool, // MCPTool实例
    config = {}) {
        // 合并MCP特定配置到EnhancedToolConfig
        const enhancedConfig = {
            enableZodValidation: true,
            maintainLegacyCompatibility: true,
            permissionLevel: 'basic',
            supportMCP: true, // MCP适配器默认支持MCP
            defaultTimeout: 30000,
            ...config
        };
        super(enhancedConfig);
        this.mcpTool = mcpTool;
        this.mcpConfig = {
            ...enhancedConfig,
            enablePermissionCheck: config.enablePermissionCheck ?? true,
            defaultPermissionLevel: config.defaultPermissionLevel ?? 'READ',
            enableInputValidation: config.enableInputValidation ?? true,
            enableDetailedLogging: config.enableDetailedLogging ?? false,
        };
        // 从MCPTool复制属性
        this.id = mcpTool.id;
        this.name = mcpTool.name;
        this.description = mcpTool.description;
        this.version = mcpTool.version;
        this.author = mcpTool.author;
        // 根据能力确定分类
        this.category = this.determineCategory(mcpTool.capabilities || []);
        // 创建输出通道
        this.outputChannel = vscode.window.createOutputChannel(`CodeLine MCP Adapter: ${this.name}`);
        if (this.mcpConfig.enableDetailedLogging) {
            this.outputChannel.appendLine(`🔧 Created MCPToolAdapter for: ${this.name} (${this.id})`);
        }
    }
    // ==================== 工具分类判断 ====================
    determineCategory(capabilities) {
        // 根据MCP工具能力确定分类
        if (capabilities.includes('file_system') || capabilities.includes('file_operations')) {
            return Tool_1.ToolCategory.FILE;
        }
        else if (capabilities.includes('web_search') || capabilities.includes('browser')) {
            return Tool_1.ToolCategory.WEB;
        }
        else if (capabilities.includes('code_analysis') || capabilities.includes('code_generation')) {
            return Tool_1.ToolCategory.CODE;
        }
        else if (capabilities.includes('database') || capabilities.includes('sql')) {
            return Tool_1.ToolCategory.DEVELOPMENT;
        }
        else if (capabilities.includes('shell') || capabilities.includes('terminal')) {
            return Tool_1.ToolCategory.TERMINAL;
        }
        else if (capabilities.includes('mcp') || capabilities.includes('model_context')) {
            return Tool_1.ToolCategory.MCP;
        }
        // 默认分类
        return Tool_1.ToolCategory.UTILITY;
    }
    // ==================== Zod输入模式 ====================
    /**
     * 获取Zod输入模式
     * 根据MCP工具的配置生成动态模式
     */
    get inputSchema() {
        try {
            // 如果MCP工具有验证方法，尝试从中提取模式
            if (this.mcpTool.validate && typeof this.mcpTool.validate === 'function') {
                // 这是一个简化实现，实际中需要更复杂的模式提取
                return ZodCompatibility_1.z.object({
                    params: ZodCompatibility_1.z.record(ZodCompatibility_1.z.any()).optional(),
                    options: ZodCompatibility_1.z.record(ZodCompatibility_1.z.any()).optional()
                });
            }
            // 如果MCP工具有配置信息，使用它生成模式
            if (this.mcpTool.configuration && typeof this.mcpTool.configuration === 'object') {
                const schemaObject = {};
                for (const [key, config] of Object.entries(this.mcpTool.configuration)) {
                    if (typeof config === 'object' && config !== null && 'type' in config) {
                        switch (config.type) {
                            case 'string':
                                schemaObject[key] = ZodCompatibility_1.z.string();
                                if (config.required !== false) {
                                    schemaObject[key] = schemaObject[key].min(1);
                                }
                                break;
                            case 'number':
                                schemaObject[key] = ZodCompatibility_1.z.number();
                                break;
                            case 'boolean':
                                schemaObject[key] = ZodCompatibility_1.z.boolean();
                                break;
                            case 'array':
                                schemaObject[key] = ZodCompatibility_1.z.array(ZodCompatibility_1.z.any());
                                break;
                            default:
                                schemaObject[key] = ZodCompatibility_1.z.any();
                        }
                    }
                    else {
                        schemaObject[key] = ZodCompatibility_1.z.any();
                    }
                }
                return ZodCompatibility_1.z.object(schemaObject);
            }
            // 默认：接受任何参数
            return ZodCompatibility_1.z.record(ZodCompatibility_1.z.any());
        }
        catch (error) {
            this.outputChannel.appendLine(`⚠️ Failed to generate input schema: ${error}`);
            // 回退到基本模式
            return ZodCompatibility_1.z.object({
                params: ZodCompatibility_1.z.record(ZodCompatibility_1.z.any()).optional()
            });
        }
    }
    // ==================== 工具能力 ====================
    get capabilities() {
        // 从MCP工具能力转换到ToolCapabilities接口
        const mcpCapabilities = this.mcpTool.capabilities || [];
        return {
            isConcurrencySafe: mcpCapabilities.includes('concurrency_safe') || false,
            isReadOnly: mcpCapabilities.includes('read_only') || true, // MCP工具默认为只读
            isDestructive: mcpCapabilities.includes('destructive') || mcpCapabilities.includes('modify') || false,
            requiresWorkspace: mcpCapabilities.includes('requires_workspace') || false,
            supportsStreaming: mcpCapabilities.includes('supports_streaming') || false
        };
    }
    // ==================== 执行方法 ====================
    /**
     * 执行工具（新接口）
     */
    async execute(input, context) {
        const startTime = Date.now();
        if (this.mcpConfig.enableDetailedLogging) {
            this.outputChannel.appendLine(`▶️ Executing MCP tool: ${this.name}`);
            this.outputChannel.appendLine(`   Input: ${JSON.stringify(input, null, 2)}`);
        }
        try {
            // 检查权限
            if (this.mcpConfig.enablePermissionCheck) {
                const permissionResult = await this.checkPermission(input, context);
                if (!permissionResult.allowed) {
                    throw new Error(`Permission denied: ${permissionResult.reason || 'No permission to execute tool'}`);
                }
            }
            // 验证输入
            if (this.mcpConfig.enableInputValidation && this.mcpTool.validate) {
                const isValid = this.mcpTool.validate(input);
                if (!isValid) {
                    throw new Error('Input validation failed');
                }
            }
            // 执行MCP工具
            let result;
            if (typeof this.mcpTool.execute === 'function') {
                result = await this.mcpTool.execute(input);
            }
            else {
                throw new Error('MCP tool does not have an execute method');
            }
            const duration = Date.now() - startTime;
            if (this.mcpConfig.enableDetailedLogging) {
                this.outputChannel.appendLine(`✅ MCP tool execution completed in ${duration}ms`);
                this.outputChannel.appendLine(`   Result: ${JSON.stringify(result, null, 2)}`);
            }
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`❌ MCP tool execution failed after ${duration}ms: ${error.message}`);
            throw new Error(`MCP tool execution failed: ${error.message}`);
        }
    }
    /**
     * 执行工具核心方法（实现EnhancedBaseTool抽象方法）
     */
    async executeCore(input, context) {
        // 从EnhancedToolContext中获取ToolUseContext
        const toolUseContext = context.newToolUseContext;
        if (!toolUseContext) {
            // 如果没有提供newToolUseContext，创建一个默认的
            // 这通常不会发生，因为EnhancedBaseTool会提供
            const defaultContext = {
                workspaceRoot: context.workspaceRoot || '',
                extensionContext: context.extensionContext,
                outputChannel: context.outputChannel,
                abortController: new AbortController(),
                permissionContext: {
                    mode: 'default',
                    alwaysAllowRules: {},
                    alwaysDenyRules: {},
                    alwaysAskRules: {},
                    isBypassPermissionsModeAvailable: false
                },
                showInformationMessage: async (message, ...items) => {
                    // 默认实现
                    return message;
                },
                showWarningMessage: async (message, ...items) => {
                    // 默认实现
                    return message;
                },
                showErrorMessage: async (message, ...items) => {
                    // 默认实现
                    return message;
                },
                readFile: async (path) => {
                    // 默认实现
                    return '';
                },
                writeFile: async (path, content) => {
                    // 默认实现
                },
                fileExists: async (path) => {
                    // 默认实现
                    return false;
                }
            };
            return this.execute(input, defaultContext);
        }
        // 使用提供的ToolUseContext执行
        return this.execute(input, toolUseContext);
    }
    /**
     * 检查权限（新接口）
     */
    async checkPermission(input, context) {
        // 默认实现：允许所有操作
        // 在实际实现中，这里应该调用权限系统
        return {
            allowed: true,
            requiresUserConfirmation: false,
            reason: 'MCP tools have default permissions',
            level: this.mcpConfig.defaultPermissionLevel || 'READ'
        };
    }
    /**
     * 验证输入（新接口）
     */
    async validateInput(input) {
        if (!this.mcpConfig.enableInputValidation) {
            return {
                valid: true,
                errors: []
            };
        }
        try {
            // 使用Zod模式验证
            const parseResult = this.inputSchema.safeParse(input);
            if (parseResult.success) {
                return {
                    valid: true,
                    errors: []
                };
            }
            else {
                const errors = parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message} (${err.code})`);
                return {
                    valid: false,
                    errors
                };
            }
        }
        catch (error) {
            return {
                valid: false,
                errors: [`Validation error: ${String(error)}`]
            };
        }
    }
    // 注意：旧接口方法已移除，因为EnhancedBaseTool已经提供了兼容性支持
    // MCP工具适配器专注于新的EnhancedBaseTool接口
    // ==================== 辅助方法 ====================
    /**
     * 获取原始MCP工具
     */
    getMCPTool() {
        return this.mcpTool;
    }
    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.mcpConfig = { ...this.mcpConfig, ...newConfig };
        if (this.mcpConfig.enableDetailedLogging) {
            this.outputChannel.appendLine(`⚙️ Updated config for: ${this.name}`);
        }
    }
    /**
     * 释放资源
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.MCPToolAdapter = MCPToolAdapter;
//# sourceMappingURL=MCPToolAdapter.js.map