"use strict";
/**
 * 示例MCP工具
 * 用于测试MCP集成
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPToolFactory = exports.FileInfoMCPTool = exports.ExampleMCPTool = void 0;
exports.createExampleMCPTools = createExampleMCPTools;
/**
 * 示例MCP工具实现
 */
class ExampleMCPTool {
    id = 'example-mcp-tool';
    name = '示例MCP工具';
    description = '一个用于测试MCP集成的示例工具';
    version = '1.0.0';
    author = 'CodeLine Team';
    /** 工具能力 */
    capabilities = [
        'read_only',
        'file_system',
        'utility'
    ];
    /** 工具配置 */
    configuration = {
        timeout: {
            type: 'number',
            description: '超时时间（毫秒）',
            default: 5000
        },
        format: {
            type: 'string',
            description: '输出格式',
            default: 'json'
        }
    };
    /**
     * 执行工具
     */
    async execute(params) {
        console.log('示例MCP工具执行，参数:', params);
        // 模拟处理时间
        await new Promise(resolve => setTimeout(resolve, 100));
        // 返回示例数据
        return {
            success: true,
            message: '示例MCP工具执行成功',
            timestamp: new Date().toISOString(),
            inputParams: params,
            processedData: {
                sample: '这是示例输出',
                count: Object.keys(params).length,
                items: Object.keys(params).map(key => ({
                    key,
                    value: params[key],
                    type: typeof params[key]
                }))
            }
        };
    }
    /**
     * 验证参数
     */
    validate(params) {
        // 简单验证：参数必须是对象
        return params !== null && typeof params === 'object';
    }
}
exports.ExampleMCPTool = ExampleMCPTool;
/**
 * 另一个示例MCP工具：文件信息工具
 */
class FileInfoMCPTool {
    id = 'file-info-mcp-tool';
    name = '文件信息MCP工具';
    description = '获取文件信息的示例MCP工具';
    version = '1.0.0';
    author = 'CodeLine Team';
    /** 工具能力 */
    capabilities = [
        'read_only',
        'file_system',
        'file_operations'
    ];
    /**
     * 执行工具
     */
    async execute(params) {
        console.log('文件信息MCP工具执行，参数:', params);
        const { path, operation = 'info' } = params;
        if (!path) {
            throw new Error('缺少必需的参数: path');
        }
        // 模拟文件操作
        await new Promise(resolve => setTimeout(resolve, 50));
        switch (operation) {
            case 'info':
                return {
                    success: true,
                    path,
                    type: 'file',
                    size: 1024, // 模拟文件大小
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    permissions: 'rw-r--r--'
                };
            case 'exists':
                return {
                    success: true,
                    path,
                    exists: true,
                    isFile: true,
                    isDirectory: false
                };
            default:
                throw new Error(`不支持的操作: ${operation}`);
        }
    }
    /**
     * 验证参数
     */
    validate(params) {
        return params !== null &&
            typeof params === 'object' &&
            typeof params.path === 'string' &&
            params.path.length > 0;
    }
}
exports.FileInfoMCPTool = FileInfoMCPTool;
/**
 * 创建示例MCP工具列表
 */
function createExampleMCPTools() {
    return [
        new ExampleMCPTool(),
        new FileInfoMCPTool()
    ];
}
/**
 * MCP工具工厂
 */
class MCPToolFactory {
    /**
     * 创建所有示例MCP工具
     */
    static createAll() {
        return createExampleMCPTools();
    }
    /**
     * 根据ID创建MCP工具
     */
    static createById(toolId) {
        const tools = createExampleMCPTools();
        return tools.find(tool => tool.id === toolId) || null;
    }
}
exports.MCPToolFactory = MCPToolFactory;
//# sourceMappingURL=ExampleMCPTool.js.map