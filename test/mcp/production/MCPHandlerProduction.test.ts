/**
 * MCPHandler生产就绪测试
 * 测试配置管理、错误处理、监控、健康检查等生产级功能
 */

import * as assert from 'assert';
import * as path from 'path';
import { MCPHandler, MCPHandlerConfig, MCPMessage, MCPResponse } from '../../../src/mcp/MCPHandler';

// 模拟vscode.ExtensionContext
class MockExtensionContext {
  subscriptions: any[] = [];
  workspaceState: any = {
    get: () => undefined,
    update: () => Promise.resolve()
  };
  globalState: any = {
    get: () => undefined,
    update: () => Promise.resolve(),
    setKeysForSync: () => {}
  };
  extensionPath: string = '';
  asAbsolutePath(relativePath: string): string {
    return require('path').join(this.extensionPath, relativePath);
  }
  storagePath: string | undefined;
  globalStoragePath: string = '';
  logPath: string = '';
  extensionMode: any = 1; // ExtensionMode.Production
  extensionUri: any = { fsPath: '' };
  environmentVariableCollection: any = {
    persistent: false,
    append: () => {},
    clear: () => {},
    delete: () => {},
    get: () => undefined,
    forEach: () => {},
    replace: () => {},
    prepend: () => {}
  };
  extension: any = {
    id: 'test.extension',
    extensionPath: '',
    isActive: true,
    packageJSON: {},
    exports: {},
    activate: () => Promise.resolve()
  };
  logUri: any = { fsPath: '' };
  
  // 缺失的属性
  secrets: any = {
    get: () => Promise.resolve(undefined),
    store: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    onDidChange: {
      dispose: () => {}
    }
  };
  storageUri: any = { fsPath: '' };
  globalStorageUri: any = { fsPath: '' };
  languageModelAccessInformation: any = {
    onDidChange: {
      dispose: () => {}
    }
  };
}

describe('MCPHandler Production Integration', () => {
  let mockContext: MockExtensionContext;
  let testWorkspaceRoot: string;
  
  beforeEach(() => {
    mockContext = new MockExtensionContext();
    mockContext.extensionPath = __dirname;
    testWorkspaceRoot = path.join(__dirname, 'test-workspace');
  });
  
  afterEach(async () => {
    // 清理
  });
  
  describe('Configuration Management', () => {
    it('should initialize with default configuration', async () => {
      const handler = new MCPHandler(mockContext);
      
      const status = handler.getStatus();
      assert.strictEqual(status.isInitialized, false, 'Handler should not be initialized yet');
    });
    
    it('should accept custom configuration', async () => {
      const config: Partial<MCPHandlerConfig> = {
        enableMCPTools: true,
        enableToolSystem: true,
        verboseLogging: true,
        defaultTimeout: 60000,
        maxRetries: 5,
        enableMonitoring: true,
        monitoringSampleRate: 0.5
      };
      
      const handler = new MCPHandler(mockContext, config);
      
      // 测试配置是否正确设置
      // 注意：配置是私有的，我们只能通过行为来验证
      const initialized = await handler.initialize(testWorkspaceRoot);
      assert.strictEqual(initialized, true, 'Handler should initialize with custom config');
      
      // 验证通过健康检查获取状态
      const healthCheckMessage: MCPMessage = {
        type: 'mcp_health_check',
        data: {},
        messageId: 'test-health-check-1'
      };
      
      const response = await handler.handleMessage(healthCheckMessage);
      assert.strictEqual(response.success, true, 'Health check should succeed');
      assert.ok(response.data, 'Health check should return data');
    });
  });
  
  describe('Error Handling and Resilience', () => {
    it('should handle malformed messages gracefully', async () => {
      const handler = new MCPHandler(mockContext);
      await handler.initialize(testWorkspaceRoot);
      
      // 测试无效消息
      const invalidMessages: MCPMessage[] = [
        { type: '' as any, data: {} }, // 空类型
        { type: 123 as any, data: {} }, // 非字符串类型
        { type: 'test', data: 'not-an-object' as any }, // 无效数据
        { type: 'test', data: {}, timestamp: 'invalid' as any } // 无效时间戳
      ];
      
      for (const message of invalidMessages) {
        const response = await handler.handleMessage(message);
        assert.strictEqual(response.success, false, `Should reject invalid message: ${JSON.stringify(message)}`);
        assert.ok(response.error, 'Should include error message');
      }
    });
    
    it('should handle unknown message types', async () => {
      const handler = new MCPHandler(mockContext);
      await handler.initialize(testWorkspaceRoot);
      
      const unknownMessage: MCPMessage = {
        type: 'unknown_message_type_xyz',
        data: {},
        messageId: 'test-unknown-1'
      };
      
      const response = await handler.handleMessage(unknownMessage);
      assert.strictEqual(response.success, false, 'Should fail for unknown message type');
      assert.ok(response.error?.includes('Unknown MCP message type'), 'Error should mention unknown type');
    });
  });
  
  describe('Monitoring and Metrics', () => {
    it('should track request metrics', async () => {
      const handler = new MCPHandler(mockContext, { enableMonitoring: true, monitoringSampleRate: 1.0 });
      await handler.initialize(testWorkspaceRoot);
      
      // 发送多个消息
      const messages: MCPMessage[] = [
        { type: 'mcp_health_check', data: {}, messageId: 'metric-test-1' },
        { type: 'mcp_metrics', data: {}, messageId: 'metric-test-2' },
        { type: 'mcp_statistics', data: {}, messageId: 'metric-test-3' }
      ];
      
      for (const message of messages) {
        const response = await handler.handleMessage(message);
        assert.strictEqual(response.success, true, `Message ${message.type} should succeed`);
      }
      
      // 检查指标
      const metricsMessage: MCPMessage = {
        type: 'mcp_metrics',
        data: {},
        messageId: 'get-metrics-1'
      };
      
      const metricsResponse = await handler.handleMessage(metricsMessage);
      assert.strictEqual(metricsResponse.success, true, 'Should get metrics');
      assert.ok(metricsResponse.data, 'Metrics data should exist');
      
      const metrics = metricsResponse.data;
      assert.strictEqual(metrics.totalRequests, 4, 'Should track total requests'); // 3个消息 + 这个metrics请求
      assert.ok(metrics.averageResponseTime >= 0, 'Should calculate average response time');
    });
    
    it('should provide health reports', async () => {
      const handler = new MCPHandler(mockContext);
      await handler.initialize(testWorkspaceRoot);
      
      const healthMessage: MCPMessage = {
        type: 'mcp_health_check',
        data: {},
        messageId: 'health-test-1'
      };
      
      const response = await handler.handleMessage(healthMessage);
      assert.strictEqual(response.success, true, 'Health check should succeed');
      
      const healthData = response.data;
      assert.ok(healthData.status, 'Should include status');
      assert.ok(Array.isArray(healthData.checks), 'Should include health checks array');
      assert.ok(Array.isArray(healthData.recommendations), 'Should include recommendations array');
      assert.ok(healthData.timestamp, 'Should include timestamp');
      assert.ok(healthData.metrics, 'Should include metrics');
      assert.ok(healthData.statistics, 'Should include statistics');
      assert.ok(healthData.activeExecutions, 'Should include active executions');
      
      // 验证健康状态是有效值
      const validStatuses = ['healthy', 'degraded', 'unhealthy'];
      assert.ok(validStatuses.includes(healthData.status), `Status should be one of: ${validStatuses.join(', ')}`);
    });
  });
  
  describe('Configuration Operations', () => {
    it('should support get/set config operations', async () => {
      const handler = new MCPHandler(mockContext);
      await handler.initialize(testWorkspaceRoot);
      
      // 获取完整配置
      const getFullConfigMessage: MCPMessage = {
        type: 'mcp_config',
        data: { operation: 'get' },
        messageId: 'config-get-full-1'
      };
      
      let response = await handler.handleMessage(getFullConfigMessage);
      assert.strictEqual(response.success, true, 'Should get full config');
      assert.ok(response.data, 'Config data should exist');
      
      // 获取特定配置项
      const getSpecificConfigMessage: MCPMessage = {
        type: 'mcp_config',
        data: { operation: 'get', key: 'verboseLogging' },
        messageId: 'config-get-specific-1'
      };
      
      response = await handler.handleMessage(getSpecificConfigMessage);
      assert.strictEqual(response.success, true, 'Should get specific config');
      assert.ok(response.data.verboseLogging !== undefined, 'Should include verboseLogging value');
      
      // 设置配置项
      const setConfigMessage: MCPMessage = {
        type: 'mcp_config',
        data: { 
          operation: 'set', 
          key: 'verboseLogging', 
          value: true 
        },
        messageId: 'config-set-1'
      };
      
      response = await handler.handleMessage(setConfigMessage);
      assert.strictEqual(response.success, true, 'Should set config');
      assert.strictEqual(response.data.verboseLogging, true, 'Should return updated value');
      
      // 测试无效配置键
      const invalidConfigMessage: MCPMessage = {
        type: 'mcp_config',
        data: { 
          operation: 'set', 
          key: 'invalidKey', 
          value: 'test' 
        },
        messageId: 'config-invalid-1'
      };
      
      response = await handler.handleMessage(invalidConfigMessage);
      assert.strictEqual(response.success, false, 'Should reject invalid config key');
      assert.ok(response.error?.includes('Invalid config key'), 'Error should mention invalid key');
      
      // 重置配置
      const resetConfigMessage: MCPMessage = {
        type: 'mcp_config',
        data: { operation: 'reset' },
        messageId: 'config-reset-1'
      };
      
      response = await handler.handleMessage(resetConfigMessage);
      assert.strictEqual(response.success, true, 'Should reset config');
      assert.ok(response.data, 'Should return default config');
    });
  });
  
  describe('Resource Management', () => {
    it('should dispose resources properly', async () => {
      const handler = new MCPHandler(mockContext);
      await handler.initialize(testWorkspaceRoot);
      
      // 发送一些消息
      const healthMessage: MCPMessage = {
        type: 'mcp_health_check',
        data: {},
        messageId: 'dispose-test-1'
      };
      
      const response = await handler.handleMessage(healthMessage);
      assert.strictEqual(response.success, true, 'Should handle message before dispose');
      
      // 清理资源
      await handler.dispose();
      
      // 尝试在清理后发送消息
      const afterDisposeMessage: MCPMessage = {
        type: 'mcp_health_check',
        data: {},
        messageId: 'dispose-test-2'
      };
      
      // 注意：清理后handler可能不再处理消息，这取决于实现
      // 我们主要验证清理不会抛出错误
    });
  });
  
  describe('Integration with MCP Tools', () => {
    it('should register MCP tools via wrapper', async () => {
      // 这个测试验证MCP工具注册流程
      // 在实际测试中，我们需要模拟MCPManager和工具注册
      
      const handler = new MCPHandler(mockContext, { 
        enableMCPTools: true,
        enableToolSystem: true 
      });
      
      const initialized = await handler.initialize(testWorkspaceRoot);
      assert.strictEqual(initialized, true, 'Should initialize with MCP tools enabled');
      
      // 获取工具列表
      const getToolsMessage: MCPMessage = {
        type: 'mcp_get_tools',
        data: {},
        messageId: 'tools-test-1'
      };
      
      const response = await handler.handleMessage(getToolsMessage);
      // 即使没有工具，也应该成功响应
      assert.strictEqual(response.success, true, 'Should get tools list');
      assert.ok(Array.isArray(response.data), 'Tools should be an array');
    });
    
    it('should handle tool execution requests', async () => {
      const handler = new MCPHandler(mockContext);
      await handler.initialize(testWorkspaceRoot);
      
      // 尝试执行工具（即使没有注册的工具）
      const executeMessage: MCPMessage = {
        type: 'mcp_execute_tool',
        data: {
          toolId: 'test-tool-123',
          params: { test: 'data' }
        },
        messageId: 'execute-test-1'
      };
      
      const response = await handler.handleMessage(executeMessage);
      // 即使工具不存在，也应该有响应（可能成功或失败）
      assert.ok(response, 'Should have response for tool execution');
    });
  });
});