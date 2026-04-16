"use strict";
/**
 * 增强基础工具类
 * 实现双接口兼容：同时支持ZodSchema（新接口）和parameterSchema（旧接口）
 *
 * 设计目标：
 * 1. 保持向后兼容性 - 现有BaseTool子类无需修改
 * 2. 支持完整Zod功能 - 新工具可以使用完整的Zod验证
 * 3. 渐进式迁移 - 可以逐步从旧接口迁移到新接口
 * 4. 集成Claude Code架构特性 - 为权限控制、MCP支持等做好准备
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
exports.EnhancedBaseTool = exports.TypeAdapter = void 0;
exports.createEnhancedTool = createEnhancedTool;
exports.adaptLegacyTool = adaptLegacyTool;
const vscode = __importStar(require("vscode"));
const Tool_1 = require("./Tool");
const ZodCompatibility_1 = require("./ZodCompatibility");
const PermissionIntegration_1 = require("./permission/PermissionIntegration");
// ==================== 类型适配器 ====================
/**
 * 类型适配器：将新旧接口类型进行转换
 */
var TypeAdapter;
(function (TypeAdapter) {
    /**
     * 将旧接口的ValidationResult转换为新接口的ValidationResult
     */
    function adaptValidationResult(oldResult) {
        return {
            valid: oldResult.valid,
            errors: oldResult.error ? [oldResult.error] : undefined,
            warnings: []
        };
    }
    TypeAdapter.adaptValidationResult = adaptValidationResult;
    /**
     * 将新接口的ValidationResult转换为旧接口的ValidationResult
     */
    function adaptValidationResultToOld(newResult) {
        return {
            valid: newResult.valid,
            error: newResult.errors?.join(', '),
            sanitizedParams: undefined
        };
    }
    TypeAdapter.adaptValidationResultToOld = adaptValidationResultToOld;
    /**
     * 将旧接口的PermissionResult转换为新接口的PermissionResult
     */
    function adaptPermissionResult(oldResult) {
        return {
            allowed: oldResult.allowed,
            requiresUserConfirmation: oldResult.requiresUserConfirmation || false,
            reason: oldResult.reason,
            level: oldResult.requiresUserConfirmation ? Tool_1.PermissionLevel.WRITE : Tool_1.PermissionLevel.READ,
            autoApprove: false
        };
    }
    TypeAdapter.adaptPermissionResult = adaptPermissionResult;
    /**
     * 将新接口的PermissionResult转换为旧接口的PermissionResult
     */
    function adaptPermissionResultToOld(newResult) {
        return {
            allowed: newResult.allowed,
            reason: newResult.reason,
            requiresUserConfirmation: newResult.requiresUserConfirmation,
            confirmationPrompt: newResult.reason ? `确认执行：${newResult.reason}` : undefined
        };
    }
    TypeAdapter.adaptPermissionResultToOld = adaptPermissionResultToOld;
    /**
     * 将字符串数组能力转换为ToolCapabilities对象
     */
    function adaptCapabilities(capabilities) {
        const isConcurrencySafe = capabilities.includes('concurrent') || capabilities.includes('concurrency-safe');
        const isReadOnly = capabilities.includes('readonly') || capabilities.includes('read-only');
        const isDestructive = capabilities.includes('destructive') || capabilities.includes('modify');
        const requiresWorkspace = capabilities.includes('workspace') || capabilities.includes('requires-workspace');
        const supportsStreaming = capabilities.includes('streaming') || capabilities.includes('supports-streaming');
        return {
            isConcurrencySafe,
            isReadOnly,
            isDestructive,
            requiresWorkspace,
            supportsStreaming
        };
    }
    TypeAdapter.adaptCapabilities = adaptCapabilities;
    /**
     * 将ToolCapabilities对象转换为字符串数组
     */
    function adaptCapabilitiesToStrings(capabilities) {
        const result = [];
        if (capabilities.isConcurrencySafe)
            result.push('concurrency-safe');
        if (capabilities.isReadOnly)
            result.push('read-only');
        if (capabilities.isDestructive)
            result.push('destructive');
        if (capabilities.requiresWorkspace)
            result.push('requires-workspace');
        if (capabilities.supportsStreaming)
            result.push('supports-streaming');
        return result;
    }
    TypeAdapter.adaptCapabilitiesToStrings = adaptCapabilitiesToStrings;
    /**
     * 将旧接口的ToolContext转换为新接口的ToolUseContext
     */
    function adaptToolContextToNew(context) {
        return {
            workspaceRoot: context.workspaceRoot,
            workspaceFolders: undefined,
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
            showInformationMessage: (message, ...items) => vscode.window.showInformationMessage(message, ...items),
            showWarningMessage: (message, ...items) => vscode.window.showWarningMessage(message, ...items),
            showErrorMessage: (message, ...items) => vscode.window.showErrorMessage(message, ...items),
            readFile: async (path) => {
                const uri = vscode.Uri.file(path);
                const bytes = await vscode.workspace.fs.readFile(uri);
                return Buffer.from(bytes).toString('utf-8');
            },
            writeFile: async (path, content) => {
                const uri = vscode.Uri.file(path);
                await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
            },
            fileExists: async (path) => {
                try {
                    const uri = vscode.Uri.file(path);
                    await vscode.workspace.fs.stat(uri);
                    return true;
                }
                catch {
                    return false;
                }
            }
        };
    }
    TypeAdapter.adaptToolContextToNew = adaptToolContextToNew;
    /**
     * 将新接口的ToolUseContext转换为旧接口的ToolContext
     */
    function adaptToolContextToOld(context) {
        return {
            extensionContext: context.extensionContext,
            workspaceRoot: context.workspaceRoot,
            cwd: context.workspaceRoot,
            outputChannel: context.outputChannel,
            sessionId: 'adapted-session',
            options: {
                autoExecute: false,
                requireApproval: true,
                timeout: 30000,
                validateParams: true
            }
        };
    }
    TypeAdapter.adaptToolContextToOld = adaptToolContextToOld;
    /**
     * 将旧接口的parameterSchema转换为Zod schema
     */
    function adaptParameterSchemaToZod(parameterSchema) {
        if (!parameterSchema)
            return undefined;
        const shape = {};
        for (const [key, schema] of Object.entries(parameterSchema)) {
            let zodType;
            switch (schema.type) {
                case 'string':
                    zodType = ZodCompatibility_1.z.string();
                    break;
                case 'number':
                    zodType = ZodCompatibility_1.z.number();
                    break;
                case 'boolean':
                    zodType = ZodCompatibility_1.z.boolean();
                    break;
                case 'object':
                    zodType = ZodCompatibility_1.z.object({}).passthrough(); // 任意对象
                    break;
                case 'array':
                    zodType = ZodCompatibility_1.z.array(ZodCompatibility_1.z.any());
                    break;
                default:
                    zodType = ZodCompatibility_1.z.any();
            }
            // 添加描述
            if (schema.description && typeof zodType.describe === 'function') {
                zodType = zodType.describe(schema.description);
            }
            // 处理必需/可选
            if (schema.required) {
                shape[key] = zodType;
            }
            else {
                shape[key] = typeof zodType.optional === 'function' ? zodType.optional() : zodType;
            }
            // 处理枚举
            if (schema.enum && schema.enum.length > 0 && typeof ZodCompatibility_1.z.enum === 'function') {
                shape[key] = ZodCompatibility_1.z.enum(schema.enum);
            }
        }
        return ZodCompatibility_1.z.object(shape);
    }
    TypeAdapter.adaptParameterSchemaToZod = adaptParameterSchemaToZod;
})(TypeAdapter || (exports.TypeAdapter = TypeAdapter = {}));
/**
 * 抽象增强基础工具类
 * 同时实现新旧工具接口
 */
class EnhancedBaseTool {
    // ==================== 新接口属性 ====================
    /** Zod输入模式（新接口） */
    get inputSchema() {
        // 如果子类提供了zodSchema，使用它
        if (this.zodSchema) {
            return this.zodSchema;
        }
        // 否则从parameterSchema转换，或返回默认
        return this.getDefaultInputSchema();
    }
    /** 工具能力（新接口格式） */
    get capabilities() {
        // 如果子类提供了capabilities数组，转换它
        if (Array.isArray(this.capabilitiesArray)) {
            return TypeAdapter.adaptCapabilities(this.capabilitiesArray);
        }
        // 返回默认能力
        return {
            isConcurrencySafe: false,
            isReadOnly: false,
            isDestructive: false,
            requiresWorkspace: true,
            supportsStreaming: false
        };
    }
    // ==================== 旧接口属性 ====================
    /** 参数模式（旧接口） */
    get parameterSchema() {
        // 如果子类提供了parameterSchema，使用它
        if (this._parameterSchema) {
            return this._parameterSchema;
        }
        // 否则尝试从Zod schema生成
        return this.generateParameterSchemaFromZod();
    }
    /** 工具能力数组（旧接口格式） */
    get capabilitiesArray() {
        // 如果子类提供了capabilities数组，使用它
        if (Array.isArray(this.capabilitiesArray)) {
            return this.capabilitiesArray;
        }
        // 否则从新接口的capabilities转换
        return TypeAdapter.adaptCapabilitiesToStrings(this.capabilities);
    }
    // ==================== 配置和状态 ====================
    /** 工具配置 */
    config;
    /** 执行状态跟踪 */
    executions = new Map();
    /**
     * 构造函数
     */
    constructor(config) {
        this.config = {
            enableZodValidation: true,
            maintainLegacyCompatibility: true,
            permissionLevel: 'basic',
            supportMCP: false,
            defaultTimeout: 30000,
            ...config
        };
    }
    // ==================== 新接口方法实现 ====================
    /**
     * 检查工具是否可用（新接口）
     */
    isEnabled(context) {
        const oldContext = TypeAdapter.adaptToolContextToOld(context);
        return this.isEnabledForOld(oldContext);
    }
    /**
     * 检查并发安全性（新接口）
     */
    isConcurrencySafe(input, context) {
        const oldContext = TypeAdapter.adaptToolContextToOld(context);
        return this.isConcurrencySafeForOld(oldContext);
    }
    /**
     * 检查权限（新接口）
     */
    async checkPermissions(input, context) {
        const oldContext = TypeAdapter.adaptToolContextToOld(context);
        const enhancedContext = {
            ...oldContext,
            newToolUseContext: context
        };
        return this.checkPermissionsForNew(input, enhancedContext);
    }
    /**
     * 验证参数（新接口）
     */
    async validateParameters(input, context) {
        const oldContext = TypeAdapter.adaptToolContextToOld(context);
        const enhancedContext = {
            ...oldContext,
            newToolUseContext: context
        };
        return this.validateParametersForNew(input, enhancedContext);
    }
    /**
     * 执行工具（新接口）
     */
    async execute(input, context) {
        const oldContext = TypeAdapter.adaptToolContextToOld(context);
        const enhancedContext = {
            ...oldContext,
            newToolUseContext: context
        };
        return this.executeCore(input, enhancedContext);
    }
    // ==================== 旧接口方法实现 ====================
    /**
     * 是否启用（旧接口）
     */
    isEnabledForOld(context) {
        return true; // 默认启用，子类可重写
    }
    /**
     * 是否支持并发执行（旧接口）
     */
    isConcurrencySafeForOld(context) {
        return this.capabilities.isConcurrencySafe;
    }
    /**
     * 是否是只读操作（旧接口）
     */
    isReadOnlyForOld(context) {
        return this.capabilities.isReadOnly;
    }
    /**
     * 是否是破坏性操作（旧接口）
     */
    isDestructiveForOld(context) {
        return this.capabilities.isDestructive;
    }
    /**
     * 权限检查（旧接口）
     */
    async checkPermissionsForOld(params, context) {
        const enhancedContext = {
            ...context,
            oldExtendedContext: context
        };
        const newResult = await this.checkPermissionsForNew(params, enhancedContext);
        return TypeAdapter.adaptPermissionResultToOld(newResult);
    }
    /**
     * 参数验证（旧接口）
     */
    async validateParametersForOld(params, context) {
        const enhancedContext = {
            ...context,
            oldExtendedContext: context
        };
        const newResult = await this.validateParametersForNew(params, enhancedContext);
        return TypeAdapter.adaptValidationResultToOld(newResult);
    }
    /**
     * 工具执行方法（旧接口）
     */
    async executeForOld(params, context, onProgress) {
        const startTime = new Date();
        try {
            const enhancedContext = {
                ...context,
                oldExtendedContext: context
            };
            // 验证参数
            const validation = await this.validateParametersForOld(params, context);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error,
                    toolId: this.id,
                    duration: 0,
                    timestamp: new Date()
                };
            }
            // 检查权限
            const permission = await this.checkPermissionsForOld(params, context);
            if (!permission.allowed) {
                return {
                    success: false,
                    error: permission.reason || '权限被拒绝',
                    toolId: this.id,
                    duration: 0,
                    timestamp: new Date()
                };
            }
            // 执行工具
            const result = await this.executeCore(params, enhancedContext);
            const duration = Date.now() - startTime.getTime();
            return {
                success: true,
                output: result,
                toolId: this.id,
                duration,
                timestamp: new Date()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                toolId: this.id,
                duration: Date.now() - startTime.getTime(),
                timestamp: new Date()
            };
        }
    }
    // ==================== 默认实现方法 ====================
    /**
     * 检查权限（新接口默认实现）
     * 使用Claude Code三层权限系统
     */
    async checkPermissionsForNew(input, context) {
        // 确保权限系统已初始化
        await (0, PermissionIntegration_1.initializePermissionSystem)();
        // 创建工具使用上下文
        const toolUseContext = {
            workspaceRoot: context.workspaceRoot,
            extensionContext: context.extensionContext,
            outputChannel: context.outputChannel,
            abortController: new AbortController(),
            permissionContext: context.newToolUseContext?.permissionContext || {
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
        // 使用权限集成系统检查权限
        try {
            const permissionResult = await (0, PermissionIntegration_1.checkPermissionWithBaseResult)(this.id, this.name, input, toolUseContext);
            return permissionResult;
        }
        catch (error) {
            // 权限系统失败时回退到默认检查
            console.error('权限系统检查失败，使用默认权限:', error);
            return {
                allowed: true,
                requiresUserConfirmation: false,
                reason: `权限系统检查失败: ${error instanceof Error ? error.message : String(error)}`,
                level: Tool_1.PermissionLevel.READ,
                autoApprove: false
            };
        }
    }
    /**
     * 验证参数（新接口默认实现）
     */
    async validateParametersForNew(input, context) {
        if (!this.config.enableZodValidation) {
            return { valid: true };
        }
        try {
            const result = (0, ZodCompatibility_1.unifiedSafeParse)(this.inputSchema, input);
            if (result.success) {
                return { valid: true };
            }
            else {
                const error = result.error;
                const errors = error.errors
                    ? error.errors.map((err) => `${err.path?.join?.('.') || 'unknown'}: ${err.message || 'validation error'}`)
                    : [`Validation failed: ${error.message || 'unknown error'}`];
                return {
                    valid: false,
                    errors
                };
            }
        }
        catch (error) {
            return {
                valid: false,
                errors: [`验证错误: ${error instanceof Error ? error.message : String(error)}`]
            };
        }
    }
    /**
     * 获取默认输入schema
     */
    getDefaultInputSchema() {
        // 创建默认schema：接受任何输入
        return ZodCompatibility_1.z.object({}).passthrough();
    }
    /**
     * 从Zod schema生成parameterSchema
     */
    generateParameterSchemaFromZod() {
        // 简化的转换逻辑
        // 在实际项目中，需要解析Zod schema并生成对应的parameterSchema
        return undefined; // 返回undefined表示没有parameterSchema
    }
    // ==================== 辅助方法 ====================
    /**
     * 获取新接口的工具实例
     */
    getNewToolInstance() {
        const definition = {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            version: this.version,
            author: this.author || 'Unknown',
            inputSchema: this.inputSchema,
            capabilities: this.capabilities,
            isEnabled: (context) => this.isEnabled(context),
            isConcurrencySafe: (input, context) => this.isConcurrencySafe(input, context),
            checkPermissions: (input, context) => this.checkPermissions(input, context),
            validateParameters: (input, context) => this.validateParameters(input, context),
            execute: (input, context) => this.execute(input, context)
        };
        return (0, Tool_1.buildTool)(definition);
    }
    /**
     * 获取旧接口的工具实例
     */
    getOldToolInstance() {
        const self = this;
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            version: this.version,
            author: this.author,
            capabilities: this.capabilitiesArray,
            parameterSchema: this.parameterSchema,
            isEnabled: (context) => this.isEnabledForOld(context),
            isConcurrencySafe: (context) => this.isConcurrencySafeForOld(context),
            isReadOnly: (context) => this.isReadOnlyForOld?.(context) ?? false,
            isDestructive: (context) => this.isDestructiveForOld?.(context) ?? false,
            checkPermissions: (params, context) => this.checkPermissionsForOld(params, context),
            validateParameters: (params, context) => this.validateParametersForOld(params, context),
            execute: (params, context, onProgress) => this.executeForOld(params, context, onProgress),
            getDisplayName: (params) => this.name,
            getActivityDescription: (params) => `执行工具: ${this.name}`
        };
    }
    /**
     * 兼容性报告
     */
    getCompatibilityReport() {
        return {
            hasZodSchema: true,
            hasParameterSchema: !!this.parameterSchema,
            supportsNewInterface: true,
            supportsOldInterface: true,
            migrationStatus: 'enhanced',
            recommendations: '此工具使用增强的双接口兼容性设计'
        };
    }
}
exports.EnhancedBaseTool = EnhancedBaseTool;
/**
 * 创建增强工具的辅助函数
 */
function createEnhancedTool(definition) {
    // 创建一个具体的增强工具实例
    class ConcreteEnhancedTool extends EnhancedBaseTool {
        id = definition.id;
        name = definition.name;
        description = definition.description;
        version = definition.version || '1.0.0';
        author = definition.author;
        category = definition.category || Tool_1.ToolCategory.OTHER;
        // 存储自定义schema和能力
        customInputSchema = definition.inputSchema;
        customParameterSchema = definition.parameterSchema;
        customCapabilities = definition.capabilities;
        constructor() {
            super(definition.config);
        }
        executeCore(input, context) {
            return definition.execute(input, context);
        }
        // 重写inputSchema获取器
        get inputSchema() {
            if (this.customInputSchema) {
                return this.customInputSchema;
            }
            // 尝试从parameterSchema转换
            if (this.customParameterSchema) {
                const zodSchema = TypeAdapter.adaptParameterSchemaToZod(this.customParameterSchema);
                if (zodSchema) {
                    return zodSchema;
                }
            }
            return super.getDefaultInputSchema();
        }
        // 重写parameterSchema获取器
        get parameterSchema() {
            return this.customParameterSchema;
        }
        // 重写capabilities获取器
        get capabilities() {
            if (this.customCapabilities) {
                if (Array.isArray(this.customCapabilities)) {
                    return TypeAdapter.adaptCapabilities(this.customCapabilities);
                }
                else {
                    return this.customCapabilities;
                }
            }
            // 使用默认能力实现，而不是super.capabilities
            return {
                isConcurrencySafe: false,
                isReadOnly: false,
                isDestructive: false,
                requiresWorkspace: true,
                supportsStreaming: false
            };
        }
        // 重写capabilitiesArray获取器
        get capabilitiesArray() {
            if (this.customCapabilities && Array.isArray(this.customCapabilities)) {
                return this.customCapabilities;
            }
            // 从默认capabilities转换
            const defaultCapabilities = this.capabilities;
            return TypeAdapter.adaptCapabilitiesToStrings(defaultCapabilities);
        }
    }
    return new ConcreteEnhancedTool();
}
/**
 * 将旧工具适配为增强工具
 */
function adaptLegacyTool(legacyTool, config) {
    return createEnhancedTool({
        id: legacyTool.id,
        name: legacyTool.name,
        description: legacyTool.description,
        version: legacyTool.version,
        author: legacyTool.author,
        parameterSchema: legacyTool.parameterSchema,
        capabilities: legacyTool.capabilities,
        config,
        execute: async (input, context) => {
            const result = await legacyTool.execute(input, context, undefined);
            if (!result.success) {
                throw new Error(result.error || '旧工具执行失败');
            }
            return result.output;
        }
    });
}
//# sourceMappingURL=EnhancedBaseTool.js.map