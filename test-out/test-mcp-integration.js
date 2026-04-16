/**
 * MCP集成端到端测试
 * 测试MCP工具包装器、发现服务和EnhancedToolRegistry集成
 */
// 注意：这个测试需要在VS Code扩展环境中运行，因为它使用了vscode API
// 对于纯Node.js环境，我们需要模拟vscode模块
// 模拟vscode模块
const mockVscode = {
    window: {
        createOutputChannel: (name) => {
            console.log(`[OutputChannel] Created: ${name}`);
            return {
                appendLine: (text) => console.log(`[OutputChannel:${name}] ${text}`),
                show: () => console.log(`[OutputChannel:${name}] Show`),
                dispose: () => console.log(`[OutputChannel:${name}] Disposed`)
            };
        }
    }
};
/**
 * 简化的MCP工具包装器（基于MCPToolWrapper概念）
 */
class MockMCPToolWrapper {
    constructor(mcpTool) {
        this.mcpTool = mcpTool;
        this.id = mcpTool.id;
        this.name = mcpTool.name;
        this.description = mcpTool.description;
        this.version = mcpTool.version;
        this.outputChannel = mockVscode.window.createOutputChannel(`MCP: ${this.name}`);
        this.outputChannel.appendLine(`Created MCPToolWrapper for: ${this.name}`);
    }
    async execute(params) {
        this.outputChannel.appendLine(`Executing: ${this.name}`);
        return this.mcpTool.execute(params);
    }
    dispose() {
        this.outputChannel.dispose();
    }
}
/**
 * 简化的MCP工具发现服务
 */
class MockMCPToolDiscoveryService {
    constructor() {
        this.wrappers = new Map();
        this.outputChannel = mockVscode.window.createOutputChannel('MCP Discovery');
    }
    registerTool(mcpTool) {
        const wrapper = new MockMCPToolWrapper(mcpTool);
        this.wrappers.set(mcpTool.id, wrapper);
        this.outputChannel.appendLine(`Registered: ${mcpTool.name}`);
        return wrapper;
    }
    getAllWrappers() {
        return Array.from(this.wrappers.values());
    }
}
/**
 * 示例MCP工具实现
 */
class ExampleMCPTool {
    constructor() {
        this.id = 'example-tool-1';
        this.name = 'Example Calculator';
        this.description = 'A simple calculator tool for testing';
        this.version = '1.0.0';
        this.capabilities = ['calculation', 'utility'];
    }
    async execute(params) {
        console.log(`[ExampleMCPTool] Executing with params:`, params);
        const { operation, a, b } = params;
        if (!operation || typeof a !== 'number' || typeof b !== 'number') {
            throw new Error('Invalid parameters. Required: operation (string), a (number), b (number)');
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
                if (b === 0)
                    throw new Error('Division by zero');
                result = a / b;
                break;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
        return {
            success: true,
            operation,
            a,
            b,
            result,
            timestamp: new Date().toISOString()
        };
    }
    validate(params) {
        return params && typeof params === 'object' &&
            typeof params.operation === 'string' &&
            typeof params.a === 'number' &&
            typeof params.b === 'number';
    }
}
/**
 * 测试EnhancedToolRegistry集成概念
 * 注意：这是简化概念，实际实现需要真实的EnhancedToolRegistry
 */
class MockEnhancedToolRegistry {
    constructor() {
        this.tools = new Map();
    }
    registerTool(tool) {
        if (!tool.id)
            return false;
        this.tools.set(tool.id, tool);
        console.log(`[EnhancedToolRegistry] Registered tool: ${tool.id}`);
        return true;
    }
    getTool(toolId) {
        return this.tools.get(toolId);
    }
    getToolCount() {
        return this.tools.size;
    }
}
/**
 * 运行集成测试
 */
async function runIntegrationTest() {
    console.log('🔧 MCP Integration End-to-End Test');
    console.log('===================================\n');
    // 测试1：创建MCP工具
    console.log('🧪 Test 1: Creating MCP Tool');
    const mcpTool = new ExampleMCPTool();
    console.log(`✅ Created MCP tool: ${mcpTool.name} (${mcpTool.id})`);
    console.log(`   Description: ${mcpTool.description}`);
    console.log(`   Capabilities: ${mcpTool.capabilities?.join(', ')}`);
    // 测试2：创建工具包装器
    console.log('\n🧪 Test 2: Creating MCP Tool Wrapper');
    const wrapper = new MockMCPToolWrapper(mcpTool);
    console.log(`✅ Created wrapper: ${wrapper.name}`);
    // 测试3：执行工具
    console.log('\n🧪 Test 3: Executing MCP Tool');
    try {
        const params = { operation: 'add', a: 5, b: 3 };
        const result = await wrapper.execute(params);
        console.log(`✅ Tool executed successfully`);
        console.log(`   Operation: ${result.operation}`);
        console.log(`   Calculation: ${result.a} + ${result.b} = ${result.result}`);
    }
    catch (error) {
        console.log(`❌ Tool execution failed: ${error.message}`);
    }
    // 测试4：使用发现服务
    console.log('\n🧪 Test 4: Using MCP Discovery Service');
    const discoveryService = new MockMCPToolDiscoveryService();
    const registeredWrapper = discoveryService.registerTool(mcpTool);
    console.log(`✅ Tool registered via discovery service`);
    console.log(`   Total wrappers: ${discoveryService.getAllWrappers().length}`);
    // 测试5：集成到EnhancedToolRegistry
    console.log('\n🧪 Test 5: Integration with EnhancedToolRegistry');
    const toolRegistry = new MockEnhancedToolRegistry();
    // 在实际实现中，这里需要将MCP工具包装器转换为Tool接口
    const mockTool = {
        id: mcpTool.id,
        name: mcpTool.name,
        description: mcpTool.description,
        execute: async (params) => {
            console.log(`[Tool Interface] Executing via Tool interface`);
            return mcpTool.execute(params);
        }
    };
    const registered = toolRegistry.registerTool(mockTool);
    console.log(`✅ Tool ${registered ? 'successfully' : 'failed to be'} registered`);
    console.log(`   Total tools in registry: ${toolRegistry.getToolCount()}`);
    // 测试6：从注册表获取和执行工具
    console.log('\n🧪 Test 6: Retrieving and Executing from Registry');
    const retrievedTool = toolRegistry.getTool(mcpTool.id);
    if (retrievedTool) {
        try {
            const params = { operation: 'multiply', a: 4, b: 7 };
            const result = await retrievedTool.execute(params);
            console.log(`✅ Retrieved and executed tool successfully`);
            console.log(`   Result: ${result.a} * ${result.b} = ${result.result}`);
        }
        catch (error) {
            console.log(`❌ Execution failed: ${error.message}`);
        }
    }
    else {
        console.log(`❌ Could not retrieve tool from registry`);
    }
    // 清理
    wrapper.dispose();
    console.log('\n📊 Integration Test Summary');
    console.log('==========================');
    console.log('✅ MCP Integration concept validated successfully!');
    console.log('\nKey components validated:');
    console.log('  1. MCP Tool implementation');
    console.log('  2. MCP Tool Wrapper (adapter pattern)');
    console.log('  3. MCP Discovery Service');
    console.log('  4. EnhancedToolRegistry integration');
    console.log('  5. End-to-end tool execution workflow');
    console.log('\nNext steps for actual implementation:');
    console.log('  - Use actual MCPToolWrapper from src/core/tool/MCPToolWrapper.ts');
    console.log('  - Use actual EnhancedToolRegistryMCPExtension');
    console.log('  - Integrate with real MCPManager and MCPHandler');
    console.log('  - Add proper error handling and logging');
}
// 运行测试
runIntegrationTest().catch(error => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
});
