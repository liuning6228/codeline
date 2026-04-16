"use strict";
/**
 * MCP管理器适配器
 * 将现有的 MCPManager 模块适配到统一的工具接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPManagerAdapter = void 0;
const mcpManager_1 = require("../../mcp/mcpManager");
const ToolAdapter_1 = require("./ToolAdapter");
/**
 * MCP管理器适配器
 */
class MCPManagerAdapter extends ToolAdapter_1.BaseToolAdapter {
    mcpManager;
    constructor(context) {
        super('mcp-manager', 'MCP Manager', 'Manage and execute Model Context Protocol (MCP) tools', '1.0.0', 'CodeLine Team', ['mcp', 'tools', 'protocol', 'model-context', 'integration'], {
            operation: {
                type: 'string',
                description: 'MCP operation type',
                required: true,
                validation: (value) => ['execute', 'list', 'info', 'test'].includes(value),
                default: 'list',
            },
            toolId: {
                type: 'string',
                description: 'MCP tool ID (for execute/info/test operations)',
                required: false,
            },
            params: {
                type: 'object',
                description: 'Tool parameters (for execute operation)',
                required: false,
            },
            searchTerm: {
                type: 'string',
                description: 'Search term for filtering tools (for list operation)',
                required: false,
            },
            testType: {
                type: 'string',
                description: 'Test type (for test operation)',
                required: false,
                validation: (value) => !value || ['validation', 'execution', 'performance'].includes(value),
            },
            mcpOptions: {
                type: 'object',
                description: 'MCP execution options',
                required: false,
            },
        });
        this.mcpManager = new mcpManager_1.MCPManager();
    }
    /**
     * 检查权限 - MCP工具需要特别注意
     */
    async checkPermissions(params, context) {
        const { operation, toolId } = params;
        // 检查操作权限
        switch (operation) {
            case 'list':
            case 'info':
                // 列表和信息操作通常允许
                return {
                    allowed: true,
                    requiresUserConfirmation: false,
                };
            case 'execute':
                // 执行工具需要确认
                return {
                    allowed: true,
                    requiresUserConfirmation: true,
                    confirmationPrompt: `Are you sure you want to execute MCP tool: ${toolId || 'unknown'}?`,
                };
            case 'test':
                // 测试操作可能需要确认
                return {
                    allowed: true,
                    requiresUserConfirmation: true,
                    confirmationPrompt: `Are you sure you want to test MCP ${toolId ? `tool: ${toolId}` : 'tools'}?`,
                };
            default:
                return {
                    allowed: false,
                    reason: `Unknown operation: ${operation}`,
                };
        }
    }
    /**
     * 验证参数
     */
    async validateParameters(params, context) {
        const { operation, toolId, testType } = params;
        // 基本验证
        if (!operation) {
            return {
                valid: false,
                error: 'Operation type is required',
            };
        }
        // 操作特定验证
        switch (operation) {
            case 'execute':
                if (!toolId) {
                    return {
                        valid: false,
                        error: 'toolId is required for execute operation',
                    };
                }
                break;
            case 'info':
            case 'test':
                if (!toolId && testType === 'performance') {
                    return {
                        valid: false,
                        error: 'toolId is required for performance testing',
                    };
                }
                break;
            case 'list':
                // 列表操作不需要额外验证
                break;
            default:
                return {
                    valid: false,
                    error: `Unsupported operation: ${operation}`,
                };
        }
        // 清理参数
        const sanitizedParams = {
            ...params,
            params: params.params || {},
            mcpOptions: params.mcpOptions || {},
        };
        return {
            valid: true,
            sanitizedParams,
        };
    }
    /**
     * 执行MCP操作
     */
    async execute(params, context, onProgress) {
        const startTime = Date.now();
        const { operation, toolId } = params;
        // 确保MCP管理器已初始化
        try {
            if (!this.mcpManager['isInitialized']) {
                this.reportProgress(onProgress, {
                    type: 'mcp_initializing',
                    progress: 0.1,
                    message: 'Initializing MCP manager',
                });
                await this.mcpManager.initialize();
            }
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return this.createErrorResult(`Failed to initialize MCP manager: ${error.message}`, duration);
        }
        try {
            let resultData = {};
            // 报告开始进度
            this.reportProgress(onProgress, {
                type: 'mcp_operation_start',
                progress: 0.2,
                message: `Starting MCP ${operation} operation`,
                data: { operation, toolId },
            });
            // 执行具体操作
            switch (operation) {
                case 'list':
                    this.reportProgress(onProgress, {
                        type: 'mcp_listing_tools',
                        progress: 0.4,
                        message: 'Listing available MCP tools',
                    });
                    let tools = this.mcpManager.getAvailableTools();
                    // 应用搜索过滤
                    if (params.searchTerm) {
                        const searchLower = params.searchTerm.toLowerCase();
                        tools = tools.filter(tool => tool.name.toLowerCase().includes(searchLower) ||
                            tool.description.toLowerCase().includes(searchLower) ||
                            tool.capabilities.some(cap => cap.toLowerCase().includes(searchLower)));
                    }
                    resultData = {
                        tools,
                        summary: {
                            toolCount: tools.length,
                            availableTools: this.mcpManager.getAvailableTools().length,
                        },
                    };
                    break;
                case 'execute':
                    if (!toolId) {
                        throw new Error('toolId is required for execute operation');
                    }
                    this.reportProgress(onProgress, {
                        type: 'mcp_executing_tool',
                        progress: 0.4,
                        message: `Executing MCP tool: ${toolId}`,
                        data: { toolId, params: params.params },
                    });
                    const mcpResult = await this.mcpManager.executeTool(toolId, params.params || {}, params.mcpOptions || {});
                    resultData = {
                        mcpResult,
                    };
                    break;
                case 'info':
                    if (!toolId) {
                        throw new Error('toolId is required for info operation');
                    }
                    this.reportProgress(onProgress, {
                        type: 'mcp_getting_tool_info',
                        progress: 0.4,
                        message: `Getting info for MCP tool: ${toolId}`,
                    });
                    // 获取所有工具并过滤
                    const allTools = this.mcpManager.getAvailableTools();
                    const tool = allTools.find(t => t.id === toolId);
                    if (!tool) {
                        throw new Error(`MCP tool not found: ${toolId}`);
                    }
                    resultData = {
                        toolInfo: tool,
                    };
                    break;
                case 'test':
                    this.reportProgress(onProgress, {
                        type: 'mcp_testing',
                        progress: 0.3,
                        message: `Testing MCP ${toolId ? `tool: ${toolId}` : 'tools'}`,
                        data: { toolId, testType: params.testType },
                    });
                    const testResults = await this.performMCPTests(toolId, params.testType);
                    resultData = {
                        testResults,
                        summary: {
                            toolCount: this.mcpManager.getAvailableTools().length,
                            availableTools: this.mcpManager.getAvailableTools().length,
                            testResults: {
                                passed: testResults.errors ? testResults.errors.length === 0 ? 1 : 0 : 0,
                                failed: testResults.errors ? testResults.errors.length : 0,
                            },
                        },
                    };
                    break;
                default:
                    throw new Error(`Unsupported operation: ${operation}`);
            }
            // 报告完成进度
            this.reportProgress(onProgress, {
                type: 'mcp_operation_complete',
                progress: 1.0,
                message: `MCP ${operation} operation completed`,
                data: { operation, toolId },
            });
            const duration = Date.now() - startTime;
            // 返回成功结果
            return this.createSuccessResult(resultData, duration, {
                operation,
                toolId,
                toolCount: resultData.summary?.toolCount,
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.reportProgress(onProgress, {
                type: 'mcp_operation_error',
                progress: 1.0,
                message: `MCP operation failed: ${error.message}`,
            });
            return this.createErrorResult(`MCP operation failed: ${error.message}`, duration, {
                operation,
                toolId,
            });
        }
    }
    /**
     * 执行MCP测试
     */
    async performMCPTests(toolId, testType) {
        const errors = [];
        let validation = false;
        let execution = false;
        let performance;
        try {
            // 获取所有工具或特定工具
            const tools = toolId
                ? this.mcpManager.getAvailableTools().filter(t => t.id === toolId)
                : this.mcpManager.getAvailableTools();
            if (tools.length === 0) {
                throw new Error(toolId ? `Tool not found: ${toolId}` : 'No MCP tools available');
            }
            // 执行验证测试
            if (!testType || testType === 'validation') {
                try {
                    // 验证工具结构
                    for (const tool of tools) {
                        if (!tool.id || !tool.name || !tool.description) {
                            errors.push(`Tool ${tool.id || 'unknown'} has missing required fields`);
                        }
                        if (!tool.execute) {
                            errors.push(`Tool ${tool.id} has no execute method`);
                        }
                    }
                    validation = errors.length === 0;
                }
                catch (error) {
                    errors.push(`Validation failed: ${error.message}`);
                }
            }
            // 执行功能测试
            if (!testType || testType === 'execution' || testType === 'performance') {
                try {
                    // 选择一个工具进行执行测试
                    const testTool = tools[0];
                    // 简单的测试执行
                    const testStartTime = Date.now();
                    const result = await this.mcpManager.executeTool(testTool.id, {}, { timeout: 5000 });
                    const testDuration = Date.now() - testStartTime;
                    if (testType === 'performance') {
                        performance = testDuration;
                    }
                    if (result.success) {
                        execution = true;
                    }
                    else {
                        errors.push(`Execution test failed for ${testTool.id}: ${result.error}`);
                    }
                }
                catch (error) {
                    errors.push(`Execution test failed: ${error.message}`);
                }
            }
        }
        catch (error) {
            errors.push(`Test setup failed: ${error.message}`);
        }
        return {
            validation,
            execution,
            performance,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
    /**
     * 检查是否为只读操作
     */
    isReadOnly(context) {
        // 大多数MCP操作是只读的，但有些可能不是
        return true;
    }
    /**
     * 获取显示名称
     */
    getDisplayName(params) {
        const operation = params?.operation || 'list';
        const operationNames = {
            execute: 'Execute MCP Tool',
            list: 'List MCP Tools',
            info: 'MCP Tool Info',
            test: 'Test MCP Tools',
        };
        return operationNames[operation] || 'MCP Operation';
    }
    /**
     * 获取活动描述
     */
    getActivityDescription(params) {
        const { operation, toolId } = params;
        switch (operation) {
            case 'execute':
                return `Executing MCP tool: ${toolId || 'unknown'}`;
            case 'list':
                return `Listing available MCP tools`;
            case 'info':
                return `Getting information for MCP tool: ${toolId || 'unknown'}`;
            case 'test':
                return `Testing MCP ${toolId ? `tool: ${toolId}` : 'tools'}`;
            default:
                return `MCP operation: ${operation}`;
        }
    }
    /**
     * 工厂方法：创建MCP管理器适配器
     */
    static create(context) {
        return new MCPManagerAdapter(context);
    }
}
exports.MCPManagerAdapter = MCPManagerAdapter;
//# sourceMappingURL=MCPManagerAdapter.js.map