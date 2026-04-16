"use strict";
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
exports.MCPManager = void 0;
const vscode = __importStar(require("vscode"));
class MCPManager {
    tools = new Map();
    outputChannel;
    isInitialized = false;
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('CodeLine MCP');
    }
    /**
     * 初始化MCP管理器
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }
        try {
            this.outputChannel.show(true);
            this.outputChannel.appendLine('🔧 Initializing MCP Manager...');
            // 注册内置工具
            await this.registerBuiltinTools();
            this.isInitialized = true;
            this.outputChannel.appendLine(`✅ MCP Manager initialized with ${this.tools.size} tools`);
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine(`❌ MCP initialization failed: ${error.message}`);
            return false;
        }
    }
    /**
     * 注册MCP工具
     */
    registerTool(tool) {
        if (this.tools.has(tool.id)) {
            this.outputChannel.appendLine(`⚠️ Tool ${tool.id} already registered, skipping`);
            return false;
        }
        this.tools.set(tool.id, tool);
        this.outputChannel.appendLine(`📋 Registered tool: ${tool.name} (${tool.id})`);
        return true;
    }
    /**
     * 执行MCP工具
     */
    async executeTool(toolId, params = {}, options = {}) {
        const startTime = Date.now();
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                return {
                    success: false,
                    output: null,
                    error: 'MCP Manager not initialized',
                    toolId,
                    duration: 0,
                    timestamp: new Date()
                };
            }
        }
        const tool = this.tools.get(toolId);
        if (!tool) {
            return {
                success: false,
                output: null,
                error: `Tool not found: ${toolId}`,
                toolId,
                duration: Date.now() - startTime,
                timestamp: new Date()
            };
        }
        try {
            this.outputChannel.appendLine(`🛠️ Executing tool: ${tool.name} (${toolId})`);
            // 验证参数
            if (tool.validate && options.validateParams !== false) {
                const isValid = tool.validate(params);
                if (!isValid) {
                    throw new Error('Invalid parameters for tool');
                }
            }
            // 执行工具
            let output;
            if (tool.execute) {
                output = await tool.execute(params);
            }
            else {
                output = { message: `Tool ${toolId} has no execute method` };
            }
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`✅ Tool ${tool.name} executed successfully (${duration}ms)`);
            return {
                success: true,
                output,
                toolId,
                duration,
                timestamp: new Date()
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.outputChannel.appendLine(`❌ Tool ${tool.name} failed: ${error.message}`);
            return {
                success: false,
                output: null,
                error: error.message,
                toolId,
                duration,
                timestamp: new Date()
            };
        }
    }
    /**
     * 批量执行工具
     */
    async executeTools(toolExecutions, options = {}) {
        const results = [];
        for (const execution of toolExecutions) {
            const result = await this.executeTool(execution.toolId, execution.params || {}, options);
            results.push(result);
            // 如果失败且设置了失败停止
            if (!result.success && options.retryOnFailure && options.maxRetries) {
                let retryCount = 0;
                while (!result.success && retryCount < options.maxRetries) {
                    retryCount++;
                    this.outputChannel.appendLine(`🔄 Retrying ${execution.toolId} (attempt ${retryCount}/${options.maxRetries})`);
                    const retryResult = await this.executeTool(execution.toolId, execution.params || {}, {
                        ...options,
                        validateParams: false // 重试时跳过验证
                    });
                    results.push(retryResult);
                }
            }
        }
        return results;
    }
    /**
     * 获取所有可用工具
     */
    getAvailableTools() {
        return Array.from(this.tools.values());
    }
    /**
     * 根据描述查找相关工具
     */
    findToolsByDescription(description) {
        const query = description.toLowerCase();
        return this.getAvailableTools().filter(tool => tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.capabilities.some(cap => cap.toLowerCase().includes(query)));
    }
    /**
     * 生成工具执行的HTML报告
     */
    generateHtmlReport(result, tool) {
        const statusClass = result.success ? 'mcp-success' : 'mcp-error';
        const statusIcon = result.success ? '✅' : '❌';
        const duration = result.duration ? `${result.duration}ms` : 'N/A';
        const toolInfo = tool || this.tools.get(result.toolId);
        return `
<div class="mcp-result ${statusClass}">
  <div class="mcp-header">
    <h3>${statusIcon} MCP Tool Execution</h3>
    <div class="mcp-meta">
      <span>Tool: ${result.toolId}</span>
      <span>Duration: ${duration}</span>
      <span>${result.timestamp.toLocaleTimeString()}</span>
    </div>
  </div>
  
  ${toolInfo ? `
  <div class="mcp-tool-info">
    <h4>Tool Information:</h4>
    <table>
      <tr><th>Name:</th><td>${toolInfo.name}</td></tr>
      <tr><th>Description:</th><td>${toolInfo.description}</td></tr>
      <tr><th>Version:</th><td>${toolInfo.version}</td></tr>
      ${toolInfo.capabilities.length > 0 ? `
      <tr><th>Capabilities:</th><td>${toolInfo.capabilities.join(', ')}</td></tr>
      ` : ''}
    </table>
  </div>
  ` : ''}
  
  <div class="mcp-output">
    <h4>Output:</h4>
    <pre>${this.escapeHtml(JSON.stringify(result.output, null, 2) || '(no output)')}</pre>
  </div>
  
  ${result.error ? `
  <div class="mcp-error-output">
    <h4>Error:</h4>
    <pre>${this.escapeHtml(result.error)}</pre>
  </div>
  ` : ''}
</div>`;
    }
    // ===== 内置工具注册 =====
    async registerBuiltinTools() {
        // 1. 时间工具
        this.registerTool({
            id: 'time-current',
            name: 'Current Time',
            description: 'Get current date and time',
            version: '1.0.0',
            capabilities: ['time', 'date', 'datetime'],
            execute: async () => {
                return {
                    timestamp: Date.now(),
                    isoString: new Date().toISOString(),
                    localString: new Date().toLocaleString(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    date: new Date().toDateString(),
                    time: new Date().toTimeString()
                };
            }
        });
        // 2. 计算工具
        this.registerTool({
            id: 'math-calculator',
            name: 'Calculator',
            description: 'Perform mathematical calculations',
            version: '1.0.0',
            capabilities: ['math', 'calculation', 'arithmetic'],
            execute: async (params) => {
                const { expression } = params;
                if (!expression) {
                    throw new Error('Missing expression parameter');
                }
                try {
                    // 安全地评估数学表达式
                    const sanitized = expression
                        .replace(/[^0-9+\-*/().\s]/g, '')
                        .replace(/(\d)\s*([+\-*/])\s*(\d)/g, '$1 $2 $3');
                    // 注意：实际应用中应该使用更安全的数学库
                    const result = eval(sanitized);
                    return {
                        expression,
                        result,
                        sanitized,
                        type: typeof result
                    };
                }
                catch (error) {
                    throw new Error(`Calculation failed: ${error.message}`);
                }
            },
            validate: (params) => {
                return typeof params.expression === 'string' && params.expression.trim().length > 0;
            }
        });
        // 3. 单位转换工具
        this.registerTool({
            id: 'unit-converter',
            name: 'Unit Converter',
            description: 'Convert between different units',
            version: '1.0.0',
            capabilities: ['conversion', 'units', 'measurement'],
            execute: async (params) => {
                const { value, from, to } = params;
                if (value === undefined || !from || !to) {
                    throw new Error('Missing parameters: value, from, or to');
                }
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    throw new Error('Value must be a number');
                }
                // 简单的单位转换
                const conversions = {
                    length: {
                        'm': 1,
                        'km': 0.001,
                        'cm': 100,
                        'mm': 1000,
                        'in': 39.3701,
                        'ft': 3.28084,
                        'yd': 1.09361,
                        'mi': 0.000621371
                    },
                    weight: {
                        'kg': 1,
                        'g': 1000,
                        'lb': 2.20462,
                        'oz': 35.274
                    },
                    temperature: {
                        'c': 1,
                        'f': 1,
                        'k': 1
                    }
                };
                let result;
                // 温度转换特殊处理
                if ((from.toLowerCase() === 'c' && to.toLowerCase() === 'f') ||
                    (from.toLowerCase() === 'celsius' && to.toLowerCase() === 'fahrenheit')) {
                    result = (numValue * 9 / 5) + 32;
                }
                else if ((from.toLowerCase() === 'f' && to.toLowerCase() === 'c') ||
                    (from.toLowerCase() === 'fahrenheit' && to.toLowerCase() === 'celsius')) {
                    result = (numValue - 32) * 5 / 9;
                }
                else if ((from.toLowerCase() === 'c' && to.toLowerCase() === 'k') ||
                    (from.toLowerCase() === 'celsius' && to.toLowerCase() === 'kelvin')) {
                    result = numValue + 273.15;
                }
                else if ((from.toLowerCase() === 'k' && to.toLowerCase() === 'c') ||
                    (from.toLowerCase() === 'kelvin' && to.toLowerCase() === 'celsius')) {
                    result = numValue - 273.15;
                }
                else {
                    // 其他单位转换
                    let category = 'length';
                    if (conversions.weight[from.toLowerCase()] && conversions.weight[to.toLowerCase()]) {
                        category = 'weight';
                    }
                    const fromFactor = conversions[category][from.toLowerCase()];
                    const toFactor = conversions[category][to.toLowerCase()];
                    if (!fromFactor || !toFactor) {
                        throw new Error(`Unsupported conversion: ${from} to ${to}`);
                    }
                    // 转换为基准单位，再转换为目标单位
                    const baseValue = numValue / fromFactor;
                    result = baseValue * toFactor;
                }
                return {
                    original: { value: numValue, unit: from },
                    converted: { value: result, unit: to },
                    conversion: `${numValue} ${from} = ${result} ${to}`
                };
            }
        });
        // 4. 随机数生成器
        this.registerTool({
            id: 'random-generator',
            name: 'Random Generator',
            description: 'Generate random numbers or make random selections',
            version: '1.0.0',
            capabilities: ['random', 'generator', 'selection'],
            execute: async (params) => {
                const { min = 0, max = 100, count = 1, items, pick } = params;
                if (items && Array.isArray(items)) {
                    // 从列表中随机选择
                    const countToPick = pick || 1;
                    const shuffled = [...items].sort(() => Math.random() - 0.5);
                    const selected = shuffled.slice(0, countToPick);
                    return {
                        type: 'selection',
                        items,
                        count: countToPick,
                        selected,
                        allItems: items
                    };
                }
                else {
                    // 生成随机数
                    const numbers = [];
                    for (let i = 0; i < count; i++) {
                        numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
                    }
                    return {
                        type: 'numbers',
                        min,
                        max,
                        count,
                        numbers,
                        average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
                        sum: numbers.reduce((a, b) => a + b, 0)
                    };
                }
            }
        });
        // 5. 文本处理工具
        this.registerTool({
            id: 'text-processor',
            name: 'Text Processor',
            description: 'Process and analyze text',
            version: '1.0.0',
            capabilities: ['text', 'processing', 'analysis'],
            execute: async (params) => {
                const { text, operation = 'analyze' } = params;
                if (!text) {
                    throw new Error('Missing text parameter');
                }
                switch (operation) {
                    case 'analyze':
                        return {
                            length: text.length,
                            wordCount: text.split(/\s+/).filter((w) => w.length > 0).length,
                            characterCount: text.replace(/\s/g, '').length,
                            lineCount: text.split('\n').length,
                            averageWordLength: text.split(/\s+/).filter((w) => w.length > 0).reduce((sum, word) => sum + word.length, 0) /
                                text.split(/\s+/).filter((w) => w.length > 0).length || 0
                        };
                    case 'uppercase':
                        return text.toUpperCase();
                    case 'lowercase':
                        return text.toLowerCase();
                    case 'reverse':
                        return text.split('').reverse().join('');
                    case 'trim':
                        return text.trim();
                    default:
                        throw new Error(`Unsupported operation: ${operation}`);
                }
            }
        });
        // 6. 文件系统工具（只读）
        this.registerTool({
            id: 'filesystem-read',
            name: 'File System Reader',
            description: 'Read file system information (read-only)',
            version: '1.0.0',
            capabilities: ['filesystem', 'read', 'directory'],
            execute: async (params) => {
                const { path } = params;
                if (!path) {
                    throw new Error('Missing path parameter');
                }
                // 注意：实际应用中应该使用vscode的API安全地访问文件系统
                // 这里返回模拟数据
                return {
                    path,
                    exists: true,
                    isDirectory: Math.random() > 0.5,
                    size: Math.floor(Math.random() * 1000000),
                    modified: new Date().toISOString(),
                    warning: 'This is a simulated file system tool. In production, use vscode API.'
                };
            }
        });
        this.outputChannel.appendLine(`📦 Registered ${this.tools.size} built-in MCP tools`);
    }
    /**
     * 关闭MCP管理器
     */
    async close() {
        this.outputChannel.appendLine('🔒 MCP Manager closed');
        this.outputChannel.dispose();
    }
    /**
     * 获取管理器状态
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            toolCount: this.tools.size,
            outputChannel: this.outputChannel !== null
        };
    }
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
    }
}
exports.MCPManager = MCPManager;
//# sourceMappingURL=mcpManager.js.map