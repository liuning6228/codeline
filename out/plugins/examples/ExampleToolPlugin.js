"use strict";
/**
 * 示例工具插件
 * 展示如何创建和使用工具插件
 * 基于Claude Code CP-20260402-003插件模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleToolPlugin = void 0;
/**
 * 示例工具插件
 */
class ExampleToolPlugin {
    metadata;
    configSchema;
    dependencies;
    tools = new Map();
    context = null;
    config;
    constructor() {
        this.metadata = {
            id: 'example-tool-plugin',
            name: '示例工具插件',
            description: '一个展示工具插件功能的示例插件',
            version: '1.0.0',
            author: 'CodeLine Team',
            categories: ['examples', 'tools'],
            keywords: ['example', 'tool', 'demo'],
        };
        this.configSchema = {
            fields: {
                enableGreetingTool: {
                    type: 'boolean',
                    description: '是否启用问候工具',
                    default: true,
                },
                enableCalculatorTool: {
                    type: 'boolean',
                    description: '是否启用计算工具',
                    default: true,
                },
                defaultGreeting: {
                    type: 'string',
                    description: '默认问候语',
                    default: 'Hello from Example Tool Plugin!',
                },
                enableDebugLogs: {
                    type: 'boolean',
                    description: '是否启用调试日志',
                    default: false,
                },
            },
        };
        this.config = {
            enableGreetingTool: true,
            enableCalculatorTool: true,
            defaultGreeting: 'Hello from Example Tool Plugin!',
            enableDebugLogs: false,
        };
    }
    /**
     * 插件激活
     */
    async activate(context) {
        this.context = context;
        // 合并配置
        this.config = { ...this.config, ...context.config };
        context.outputChannel.show(true);
        context.outputChannel.appendLine('🚀 Activating Example Tool Plugin...');
        // 创建工具
        await this.createTools();
        context.outputChannel.appendLine(`✅ Example Tool Plugin activated with ${this.tools.size} tools`);
    }
    /**
     * 插件停用
     */
    async deactivate() {
        if (this.context) {
            this.context.outputChannel.appendLine('⏸️ Deactivating Example Tool Plugin...');
        }
        // 清理工具资源
        this.tools.clear();
        if (this.context) {
            this.context.outputChannel.appendLine('✅ Example Tool Plugin deactivated');
        }
        this.context = null;
    }
    /**
     * 获取工具
     */
    getTools() {
        return Array.from(this.tools.values());
    }
    /**
     * 获取工具定义
     */
    getToolDefinitions() {
        // 返回工具定义（用于动态注册）
        return [
            {
                id: 'example-greeting',
                name: '示例问候工具',
                description: '根据配置返回问候语',
                version: '1.0.0',
                author: 'CodeLine Team',
                capabilities: ['greeting', 'utility'],
                parameterSchema: {
                    name: {
                        type: 'string',
                        description: '问候的对象名称',
                        required: false,
                    },
                    language: {
                        type: 'string',
                        description: '问候语语言',
                        required: false,
                        options: ['en', 'zh', 'ja', 'ko'],
                    },
                },
            },
            {
                id: 'example-calculator',
                name: '示例计算工具',
                description: '执行简单的数学计算',
                version: '1.0.0',
                author: 'CodeLine Team',
                capabilities: ['calculation', 'utility'],
                parameterSchema: {
                    operation: {
                        type: 'string',
                        description: '计算操作',
                        required: true,
                        options: ['add', 'subtract', 'multiply', 'divide'],
                    },
                    a: {
                        type: 'number',
                        description: '第一个操作数',
                        required: true,
                    },
                    b: {
                        type: 'number',
                        description: '第二个操作数',
                        required: true,
                    },
                },
            },
        ];
    }
    /**
     * 注册工具
     */
    async registerTools(registry) {
        if (!this.context) {
            throw new Error('Plugin not activated');
        }
        this.context.outputChannel.appendLine('📝 Registering example tools...');
        let registeredCount = 0;
        for (const tool of this.getTools()) {
            try {
                if (typeof registry.registerTool === 'function') {
                    await registry.registerTool(tool);
                    registeredCount++;
                }
            }
            catch (error) {
                this.context.outputChannel.appendLine(`❌ Failed to register tool ${tool.id}: ${error}`);
            }
        }
        this.context.outputChannel.appendLine(`✅ Registered ${registeredCount} example tools`);
    }
    /**
     * 卸载工具
     */
    async unregisterTools(registry) {
        if (!this.context) {
            throw new Error('Plugin not activated');
        }
        this.context.outputChannel.appendLine('🗑️ Unregistering example tools...');
        let unregisteredCount = 0;
        for (const tool of this.getTools()) {
            try {
                if (typeof registry.unregisterTool === 'function') {
                    await registry.unregisterTool(tool.id);
                    unregisteredCount++;
                }
            }
            catch (error) {
                this.context.outputChannel.appendLine(`❌ Failed to unregister tool ${tool.id}: ${error}`);
            }
        }
        this.context.outputChannel.appendLine(`✅ Unregistered ${unregisteredCount} example tools`);
    }
    /**
     * 配置更新
     */
    async updateConfig(newConfig) {
        const oldConfig = this.config;
        this.config = { ...oldConfig, ...newConfig };
        if (this.context) {
            this.context.outputChannel.appendLine('⚙️ Example Tool Plugin config updated');
            // 如果工具启用状态变化，重新创建工具
            if (newConfig.enableGreetingTool !== oldConfig.enableGreetingTool ||
                newConfig.enableCalculatorTool !== oldConfig.enableCalculatorTool) {
                await this.recreateTools();
            }
        }
    }
    /**
     * 健康检查
     */
    async healthCheck() {
        const toolCount = this.tools.size;
        const expectedTools = (this.config.enableGreetingTool ? 1 : 0) + (this.config.enableCalculatorTool ? 1 : 0);
        const healthy = toolCount === expectedTools;
        return {
            healthy,
            message: healthy
                ? `Example Tool Plugin is healthy (${toolCount} tools)`
                : `Example Tool Plugin has issues (expected ${expectedTools} tools, got ${toolCount})`,
            details: {
                toolCount,
                expectedTools,
                config: this.config,
            },
        };
    }
    // ========== 私有方法 ==========
    /**
     * 创建工具
     */
    async createTools() {
        this.tools.clear();
        if (this.config.enableGreetingTool) {
            this.createGreetingTool();
        }
        if (this.config.enableCalculatorTool) {
            this.createCalculatorTool();
        }
    }
    /**
     * 重新创建工具
     */
    async recreateTools() {
        if (this.context) {
            this.context.outputChannel.appendLine('🔄 Recreating example tools...');
        }
        await this.createTools();
        if (this.context) {
            this.context.outputChannel.appendLine(`✅ Recreated ${this.tools.size} example tools`);
        }
    }
    /**
     * 创建问候工具
     */
    createGreetingTool() {
        const tool = {
            id: 'example-greeting',
            name: '示例问候工具',
            description: '根据配置返回问候语',
            version: '1.0.0',
            author: 'CodeLine Team',
            capabilities: ['greeting', 'utility'],
            parameterSchema: {
                name: {
                    type: 'string',
                    description: '问候的对象名称',
                    required: false,
                },
                language: {
                    type: 'string',
                    description: '问候语语言（支持：en, zh, ja, ko）',
                    required: false,
                },
            },
            isEnabled: () => this.config.enableGreetingTool,
            isConcurrencySafe: () => true,
            isReadOnly: () => true,
            isDestructive: () => false,
            checkPermissions: async (params, context) => ({
                allowed: true,
                reason: 'Example greeting tool is always allowed',
            }),
            validateParameters: async (params, context) => ({
                valid: true,
            }),
            execute: async (params, context, onProgress) => {
                const name = params.name || 'World';
                const language = params.language || 'en';
                const greetings = {
                    en: `Hello, ${name}!`,
                    zh: `你好，${name}！`,
                    ja: `こんにちは、${name}さん！`,
                    ko: `안녕하세요, ${name}님!`,
                };
                const greeting = greetings[language] || greetings.en;
                const fullGreeting = `${greeting} ${this.config.defaultGreeting}`;
                // 模拟处理进度
                if (onProgress) {
                    onProgress({
                        type: 'processing',
                        progress: 50,
                        message: 'Generating greeting...',
                    });
                    await new Promise(resolve => setTimeout(resolve, 100));
                    onProgress({
                        type: 'processing',
                        progress: 100,
                        message: 'Greeting generated successfully',
                    });
                }
                return {
                    success: true,
                    output: fullGreeting,
                    toolId: 'example-greeting',
                    duration: 100,
                    timestamp: new Date(),
                };
            },
            getDisplayName: (params) => {
                const name = params?.name || 'World';
                return `Greet ${name}`;
            },
            getActivityDescription: (params) => {
                const language = params.language || 'en';
                return `Generate a ${language} greeting`;
            },
        };
        this.tools.set(tool.id, tool);
    }
    /**
     * 创建计算工具
     */
    createCalculatorTool() {
        const tool = {
            id: 'example-calculator',
            name: '示例计算工具',
            description: '执行简单的数学计算',
            version: '1.0.0',
            author: 'CodeLine Team',
            capabilities: ['calculation', 'utility'],
            parameterSchema: {
                operation: {
                    type: 'string',
                    description: '计算操作（支持：add, subtract, multiply, divide）',
                    required: true,
                    validation: (value) => ['add', 'subtract', 'multiply', 'divide'].includes(value),
                },
                a: {
                    type: 'number',
                    description: '第一个操作数',
                    required: true,
                },
                b: {
                    type: 'number',
                    description: '第二个操作数',
                    required: true,
                },
            },
            isEnabled: () => this.config.enableCalculatorTool,
            isConcurrencySafe: () => true,
            isReadOnly: () => true,
            isDestructive: () => false,
            checkPermissions: async (params, context) => ({
                allowed: true,
                reason: 'Example calculator tool is always allowed',
            }),
            validateParameters: async (params, context) => {
                const { operation, a, b } = params;
                if (!operation || !['add', 'subtract', 'multiply', 'divide'].includes(operation)) {
                    return {
                        valid: false,
                        errors: ['Invalid operation. Must be one of: add, subtract, multiply, divide'],
                    };
                }
                if (typeof a !== 'number' || typeof b !== 'number') {
                    return {
                        valid: false,
                        errors: ['Both a and b must be numbers'],
                    };
                }
                if (operation === 'divide' && b === 0) {
                    return {
                        valid: false,
                        errors: ['Division by zero is not allowed'],
                    };
                }
                return {
                    valid: true,
                };
            },
            execute: async (params, context, onProgress) => {
                const { operation, a, b } = params;
                // 模拟处理进度
                if (onProgress) {
                    onProgress({
                        type: 'processing',
                        progress: 25,
                        message: 'Validating parameters...',
                    });
                    await new Promise(resolve => setTimeout(resolve, 50));
                    onProgress({
                        type: 'processing',
                        progress: 50,
                        message: 'Performing calculation...',
                    });
                    await new Promise(resolve => setTimeout(resolve, 50));
                    onProgress({
                        type: 'processing',
                        progress: 75,
                        message: 'Formatting result...',
                    });
                }
                let result;
                switch (operation) {
                    case 'add':
                        result = a + b;
                        break;
                    case 'subtract':
                        result = a - b;
                        break;
                    case 'multiply':
                        result = a * b;
                        break;
                    case 'divide':
                        result = a / b;
                        break;
                    default:
                        throw new Error(`Unknown operation: ${operation}`);
                }
                if (onProgress) {
                    onProgress({
                        type: 'processing',
                        progress: 100,
                        message: 'Calculation complete',
                    });
                }
                return {
                    success: true,
                    output: {
                        operation,
                        a,
                        b,
                        result,
                        expression: `${a} ${operation} ${b} = ${result}`,
                    },
                    toolId: 'example-calculator',
                    duration: 100,
                    timestamp: new Date(),
                };
            },
            getDisplayName: (params) => {
                const operation = params?.operation || 'calculate';
                return `${operation.charAt(0).toUpperCase() + operation.slice(1)} Operation`;
            },
            getActivityDescription: (params) => {
                const { operation, a, b } = params;
                return `Calculate ${a} ${operation} ${b}`;
            },
        };
        this.tools.set(tool.id, tool);
    }
}
exports.ExampleToolPlugin = ExampleToolPlugin;
//# sourceMappingURL=ExampleToolPlugin.js.map