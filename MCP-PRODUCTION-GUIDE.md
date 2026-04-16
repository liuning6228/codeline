# MCP生产集成指南

## 概述

本文档提供了CodeLine中MCP（模型上下文协议）集成的生产就绪配置、部署和运维指南。MCPHandler已增强为生产级组件，支持配置管理、监控、错误处理和健康检查。

## 架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VS Code扩展   │◄──►│   MCPHandler    │◄──►│   MCP Manager   │
│                 │    │                 │    │                 │
│  - Webview UI   │    │  - 配置管理     │    │  - 工具注册     │
│  - 消息传递     │    │  - 监控指标     │    │  - 工具执行     │
│                 │    │  - 错误处理     │    │  - 内置工具     │
└─────────────────┘    │  - 健康检查     │    └─────────────────┘
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │EnhancedToolRegistry│
                       │                 │
                       │  - 工具包装器   │
                       │  - 权限检查     │
                       │  - 输入验证     │
                       └─────────────────┘
```

## 快速开始

### 1. 启用MCP集成

在VS Code扩展激活时初始化MCPHandler：

```typescript
import { MCPHandler } from './src/mcp/MCPHandler';

export async function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath || process.cwd();
  
  // 基础配置
  const mcpHandler = new MCPHandler(context, {
    enableMCPTools: true,
    enableToolSystem: true,
    verboseLogging: process.env.NODE_ENV === 'development',
    defaultTimeout: 30000,
    maxRetries: 3,
    enableMonitoring: true,
    monitoringSampleRate: 0.1
  });
  
  // 初始化
  const initialized = await mcpHandler.initialize(workspaceRoot);
  if (!initialized) {
    console.error('MCP Handler初始化失败');
  }
  
  // 注册清理
  context.subscriptions.push({
    dispose: () => mcpHandler.dispose()
  });
  
  return mcpHandler;
}
```

### 2. 配置文件示例

创建 `.mcp/config.json` 文件（支持自动重新加载）：

```json
{
  "enableMCPTools": true,
  "enableToolSystem": true,
  "verboseLogging": false,
  "defaultTimeout": 30000,
  "maxRetries": 3,
  "enableMonitoring": true,
  "monitoringSampleRate": 0.1,
  "autoLoadConfigPath": ".mcp/config.json"
}
```

## 配置详解

### MCPHandler配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableMCPTools` | boolean | true | 是否启用MCP工具集成 |
| `enableToolSystem` | boolean | true | 是否启用增强工具系统 |
| `verboseLogging` | boolean | false | 详细日志（开发环境启用） |
| `defaultTimeout` | number | 30000 | 默认工具执行超时时间（毫秒） |
| `maxRetries` | number | 3 | 最大重试次数 |
| `enableMonitoring` | boolean | true | 启用监控指标收集 |
| `monitoringSampleRate` | number | 0.1 | 监控采样率（0-1） |
| `autoLoadConfigPath` | string | undefined | 自动加载配置的路径 |

### 服务器配置

```json
{
  "servers": [
    {
      "name": "filesystem-server",
      "command": "npx @modelcontextprotocol/server-filesystem",
      "args": ["."],
      "enabled": true,
      "autoStart": true,
      "timeout": 30000
    }
  ]
}
```

### 工具配置

```json
{
  "tools": {
    "builtin": {
      "time-current": {
        "enabled": true,
        "permissionLevel": "READ"
      },
      "math-calculator": {
        "enabled": true,
        "permissionLevel": "READ"
      }
    }
  }
}
```

## 监控与运维

### 健康检查

```typescript
// 发送健康检查消息
const healthCheckMessage = {
  type: 'mcp_health_check',
  data: {},
  messageId: `health-check-${Date.now()}`
};

const response = await mcpHandler.handleMessage(healthCheckMessage);
if (response.success) {
  const healthData = response.data;
  console.log(`状态: ${healthData.status}`);
  console.log(`检查项:`, healthData.checks);
  console.log(`建议:`, healthData.recommendations);
}
```

健康状态说明：
- **healthy**: 所有组件正常运行
- **degraded**: 部分组件有警告但可运行
- **unhealthy**: 关键组件故障

### 监控指标

```typescript
// 获取监控指标
const metricsMessage = {
  type: 'mcp_metrics',
  data: {},
  messageId: `metrics-${Date.now()}`
};

const response = await mcpHandler.handleMessage(metricsMessage);
if (response.success) {
  const metrics = response.data;
  console.log(`总请求数: ${metrics.totalRequests}`);
  console.log(`成功请求: ${metrics.successfulRequests}`);
  console.log(`失败请求: ${metrics.failedRequests}`);
  console.log(`平均响应时间: ${metrics.averageResponseTime}ms`);
  console.log(`注册工具数: ${metrics.registeredTools}`);
}
```

### 统计信息

```typescript
// 获取工具执行统计
const statsMessage = {
  type: 'mcp_statistics',
  data: {},
  messageId: `stats-${Date.now()}`
};

const response = await mcpHandler.handleMessage(statsMessage);
if (response.success) {
  const stats = response.data;
  console.log(`工具执行总数: ${stats.totalToolExecutions}`);
  console.log(`成功率: ${stats.successRate}`);
  console.log(`平均执行时间: ${stats.averageExecutionTime}ms`);
}
```

## 消息协议

### 消息格式

```typescript
interface MCPMessage {
  type: string;           // 消息类型
  data: Record<string, any>; // 消息数据
  messageId?: string;     // 消息ID（可选，用于跟踪）
  timestamp?: number;     // 时间戳（可选）
}
```

### 消息类型

#### 核心操作
- `mcp_initialize` - 初始化MCP系统
- `mcp_refresh` - 刷新工具和服务器
- `mcp_health_check` - 健康检查
- `mcp_metrics` - 获取监控指标
- `mcp_statistics` - 获取统计信息

#### 工具管理
- `mcp_get_tools` - 获取工具列表
- `mcp_toggle_tool` - 启用/禁用工具
- `mcp_execute_tool` - 执行工具

#### 服务器管理
- `mcp_get_servers` - 获取服务器列表
- `mcp_add_server` - 添加服务器
- `mcp_remove_server` - 移除服务器
- `mcp_connect_server` - 连接服务器
- `mcp_disconnect_server` - 断开服务器

#### 配置管理
- `mcp_config` - 配置操作
  - `operation: 'get'` - 获取配置
  - `operation: 'set'` - 设置配置项
  - `operation: 'reset'` - 重置配置

### 响应格式

```typescript
interface MCPResponse {
  success: boolean;       // 是否成功
  data?: any;             // 响应数据
  error?: string;         // 错误信息
  messageId?: string;     // 原始消息ID
  timestamp?: number;     // 响应时间戳
  duration?: number;      // 处理耗时（毫秒）
  metrics?: {            // 执行指标（工具执行时）
    toolExecutionTime?: number;
    validationTime?: number;
    permissionCheckTime?: number;
  };
}
```

## 错误处理

### 错误类型

1. **配置错误** - 无效的配置参数
2. **初始化错误** - 组件初始化失败
3. **工具执行错误** - 工具执行过程中出错
4. **网络错误** - 服务器连接问题
5. **验证错误** - 输入参数验证失败

### 错误恢复策略

```typescript
// 示例：带重试的工具执行
async function executeToolWithRetry(
  mcpHandler: MCPHandler,
  toolId: string,
  params: any,
  maxRetries: number = 3
): Promise<MCPResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const message: MCPMessage = {
        type: 'mcp_execute_tool',
        data: { toolId, params },
        messageId: `retry-${toolId}-${Date.now()}-${attempt}`
      };
      
      const response = await mcpHandler.handleMessage(message);
      
      if (response.success) {
        return response;
      }
      
      lastError = new Error(response.error || 'Unknown error');
      
      // 指数退避
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2秒、4秒、8秒...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error: any) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return {
    success: false,
    error: `Failed after ${maxRetries} attempts: ${lastError?.message}`,
    messageId: `final-${toolId}-${Date.now()}`
  };
}
```

## 性能优化

### 1. 配置优化

```json
{
  "enableMonitoring": true,
  "monitoringSampleRate": 0.05,  // 生产环境5%采样率
  "verboseLogging": false,       // 生产环境关闭详细日志
  "defaultTimeout": 10000,       // 根据业务调整超时
  "maxRetries": 2                // 减少重试次数
}
```

### 2. 内存管理

- 定期清理请求历史记录（默认保留500条）
- 监控活动执行数量，防止内存泄漏
- 使用配置监听器动态调整配置

### 3. 并发控制

```typescript
// 限制并发执行
const MAX_CONCURRENT_EXECUTIONS = 10;
const activeExecutions = new Set<string>();

async function executeWithConcurrencyControl(
  mcpHandler: MCPHandler,
  toolId: string,
  params: any
): Promise<MCPResponse> {
  const executionId = `exec-${Date.now()}-${Math.random()}`;
  
  if (activeExecutions.size >= MAX_CONCURRENT_EXECUTIONS) {
    return {
      success: false,
      error: 'Too many concurrent executions',
      messageId: executionId
    };
  }
  
  activeExecutions.add(executionId);
  
  try {
    const message: MCPMessage = {
      type: 'mcp_execute_tool',
      data: { toolId, params },
      messageId: executionId
    };
    
    return await mcpHandler.handleMessage(message);
    
  } finally {
    activeExecutions.delete(executionId);
  }
}
```

## 安全考虑

### 1. 权限控制

- MCP工具默认设置为`READ`权限级别
- 敏感操作需要用户确认
- 支持工具级别的权限配置

### 2. 输入验证

- 所有工具输入都经过Zod模式验证
- 参数清理和转义
- 大小和深度限制

### 3. 访问控制

```json
{
  "security": {
    "allowedOrigins": ["vscode://*", "file://*"],
    "requireAuthentication": false,
    "maxConnections": 10
  }
}
```

## 部署检查清单

### 预部署检查

- [ ] MCPHandler配置已优化为生产环境
- [ ] 详细日志在生产环境已禁用
- [ ] 监控采样率已适当设置
- [ ] 超时和重试配置符合业务需求
- [ ] 安全配置已审查

### 运行时监控

- [ ] 健康检查端点可用
- [ ] 监控指标正常收集
- [ ] 错误率在可接受范围内
- [ ] 响应时间符合预期
- [ ] 内存使用稳定

### 故障排除

1. **初始化失败**
   - 检查工作区权限
   - 验证MCP服务器配置
   - 检查依赖项是否完整

2. **工具执行超时**
   - 调整`defaultTimeout`配置
   - 检查工具实现性能
   - 监控网络延迟

3. **内存泄漏**
   - 检查活动执行数量
   - 验证清理逻辑
   - 监控请求历史大小

## 示例代码

### 完整集成示例

```typescript
import * as vscode from 'vscode';
import { MCPHandler } from './src/mcp/MCPHandler';

export class MCPIntegration {
  private handler: MCPHandler | null = null;
  
  async activate(context: vscode.ExtensionContext) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    
    if (!workspaceRoot) {
      vscode.window.showWarningMessage('MCP集成需要打开工作区');
      return;
    }
    
    // 生产环境配置
    const config = {
      enableMCPTools: true,
      enableToolSystem: true,
      verboseLogging: process.env.NODE_ENV === 'development',
      defaultTimeout: 30000,
      maxRetries: 3,
      enableMonitoring: true,
      monitoringSampleRate: 0.1,
      autoLoadConfigPath: '.mcp/config.json'
    };
    
    this.handler = new MCPHandler(context, config);
    
    try {
      const initialized = await this.handler.initialize(workspaceRoot);
      
      if (initialized) {
        vscode.window.showInformationMessage('MCP集成已启动');
        
        // 注册定期健康检查
        this.setupHealthMonitoring();
        
        // 注册清理
        context.subscriptions.push({
          dispose: () => this.deactivate()
        });
        
      } else {
        vscode.window.showErrorMessage('MCP集成启动失败');
      }
      
    } catch (error: any) {
      vscode.window.showErrorMessage(`MCP集成错误: ${error.message}`);
    }
  }
  
  private async setupHealthMonitoring() {
    // 每5分钟执行健康检查
    setInterval(async () => {
      if (!this.handler) return;
      
      const message = {
        type: 'mcp_health_check',
        data: {},
        messageId: `auto-health-${Date.now()}`
      };
      
      const response = await this.handler.handleMessage(message);
      
      if (!response.success || response.data?.status === 'unhealthy') {
        console.error('MCP健康检查失败:', response.error || response.data);
        // 发送告警或采取恢复措施
      }
    }, 5 * 60 * 1000); // 5分钟
  }
  
  async deactivate() {
    if (this.handler) {
      await this.handler.dispose();
      this.handler = null;
    }
  }
}
```

## 附录

### A. 内置MCP工具

| 工具ID | 名称 | 描述 | 权限级别 |
|--------|------|------|----------|
| `time-current` | 当前时间 | 获取当前日期和时间 | READ |
| `math-calculator` | 计算器 | 执行数学计算 | READ |
| `unit-converter` | 单位转换器 | 单位转换 | READ |
| `random-generator` | 随机生成器 | 生成随机数 | READ |
| `text-processor` | 文本处理器 | 处理和分析文本 | READ |
| `filesystem-read` | 文件系统读取器 | 读取文件系统信息 | READ |

### B. 常见问题

**Q: MCP集成对性能有什么影响？**
A: 在默认配置下，MCP集成对性能影响很小。监控采样率设置为10%，详细日志在生产环境禁用。

**Q: 如何添加自定义MCP工具？**
A: 通过扩展`MCPToolWrapper`类或创建`SimpleMCPTool`对象，然后使用`registerMCPTool`方法注册。

**Q: 如何处理MCP服务器连接失败？**
A: MCPHandler会自动重试，最多3次。如果持续失败，会标记服务器为不可用，并在健康检查中报告。

**Q: 生产环境推荐什么配置？**
A: 建议`verboseLogging: false`、`monitoringSampleRate: 0.05-0.1`、`defaultTimeout: 10000-30000`。

### C. 故障排除指南

| 症状 | 可能原因 | 解决方案 |
|------|----------|----------|
| 初始化失败 | 工作区权限不足 | 检查文件夹权限 |
| 工具执行超时 | 工具实现效率低 | 优化工具代码或增加超时时间 |
| 内存使用增长 | 请求历史未清理 | 检查清理逻辑，调整历史记录大小 |
| 监控数据缺失 | 采样率设置过低 | 调整`monitoringSampleRate` |
| 健康检查失败 | 关键组件未初始化 | 检查初始化日志，验证依赖项 |

---

**版本**: 1.0.0  
**最后更新**: 2026-04-09  
**适用于**: CodeLine v0.7.7+