/**
 * 插件系统集成测试
 * 验证插件系统的完整功能
 * 基于Claude Code CP-20260402-003插件模式
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ToolContext } from '../../tools/ToolInterface';
import { PluginToolRegistry } from '../PluginToolRegistry';
import { PluginMCPHandler } from '../PluginMCPHandler';

/**
 * 插件系统集成测试
 */
export class PluginSystemIntegrationTest {
  private outputChannel: vscode.OutputChannel;
  private extensionContext: vscode.ExtensionContext;
  private globalContext: ToolContext;
  private pluginToolRegistry: PluginToolRegistry | null = null;
  private pluginMCPHandler: PluginMCPHandler | null = null;
  private testResults: Array<{
    test: string;
    passed: boolean;
    message?: string;
    duration: number;
  }> = [];

  constructor(
    extensionContext: vscode.ExtensionContext,
    workspaceRoot: string
  ) {
    this.extensionContext = extensionContext;
    this.outputChannel = vscode.window.createOutputChannel('Plugin System Integration Test');
    
    // 创建全局上下文
    this.globalContext = {
      extensionContext,
      workspaceRoot,
      cwd: workspaceRoot,
      outputChannel: this.outputChannel,
      sessionId: 'plugin-system-test-' + Date.now(),
    };
  }

  /**
   * 运行所有集成测试
   */
  public async runAllTests(): Promise<boolean> {
    this.outputChannel.show(true);
    this.outputChannel.appendLine('🧪 Starting Plugin System Integration Tests...');
    
    const startTime = Date.now();
    
    try {
      // 运行测试套件
      await this.runTestSuite('Plugin System Initialization', async () => {
        await this.testPluginSystemInitialization();
      });
      
      await this.runTestSuite('Plugin Tool Registration', async () => {
        await this.testPluginToolRegistration();
      });
      
      await this.runTestSuite('Plugin MCP Integration', async () => {
        await this.testPluginMCPIntegration();
      });
      
      await this.runTestSuite('Plugin Lifecycle Management', async () => {
        await this.testPluginLifecycleManagement();
      });
      
      await this.runTestSuite('Plugin Configuration', async () => {
        await this.testPluginConfiguration();
      });
      
      // 生成测试报告
      await this.generateTestReport(startTime);
      
      const allPassed = this.testResults.every(result => result.passed);
      return allPassed;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Integration tests failed: ${error.message}`);
      return false;
    } finally {
      // 清理资源
      await this.cleanup();
    }
  }

  /**
   * 运行测试套件
   */
  private async runTestSuite(
    suiteName: string,
    testFunction: () => Promise<void>
  ): Promise<void> {
    this.outputChannel.appendLine(`\n📋 Test Suite: ${suiteName}`);
    
    const startTime = Date.now();
    
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        test: suiteName,
        passed: true,
        message: 'All tests passed',
        duration,
      });
      
      this.outputChannel.appendLine(`✅ ${suiteName}: PASSED (${duration}ms)`);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        test: suiteName,
        passed: false,
        message: error.message,
        duration,
      });
      
      this.outputChannel.appendLine(`❌ ${suiteName}: FAILED (${duration}ms) - ${error.message}`);
    }
  }

  /**
   * 测试插件系统初始化
   */
  private async testPluginSystemInitialization(): Promise<void> {
    // 初始化插件工具注册表
    this.pluginToolRegistry = new PluginToolRegistry({
      enablePluginSupport: true,
      autoLoadPlugins: true,
      pluginToolPrefix: 'test:',
    });
    
    const initialized = await this.pluginToolRegistry.initializeWithPlugins(
      this.extensionContext,
      this.globalContext
    );
    
    if (!initialized) {
      throw new Error('Failed to initialize Plugin Tool Registry');
    }
    
    // 初始化插件MCP处理器
    this.pluginMCPHandler = new PluginMCPHandler(this.extensionContext);
    const mcpInitialized = await this.pluginMCPHandler.initialize(
      this.globalContext.workspaceRoot,
      this.pluginToolRegistry
    );
    
    if (!mcpInitialized) {
      throw new Error('Failed to initialize Plugin MCP Handler');
    }
    
    this.outputChannel.appendLine('✅ Plugin systems initialized successfully');
  }

  /**
   * 测试插件工具注册
   */
  private async testPluginToolRegistration(): Promise<void> {
    if (!this.pluginToolRegistry) {
      throw new Error('Plugin Tool Registry not initialized');
    }
    
    // 检查插件管理器
    const pluginManager = this.pluginToolRegistry.getPluginManager();
    if (!pluginManager) {
      throw new Error('Plugin Manager not available');
    }
    
    // 获取插件状态
    const registryState = this.pluginToolRegistry.getPluginRegistryState();
    this.outputChannel.appendLine(`📊 Plugin Registry State: ${JSON.stringify(registryState, null, 2)}`);
    
    // 验证工具注册表功能
    const toolRegistry = this.pluginToolRegistry.getToolRegistry();
    const allTools = toolRegistry.getAllTools(this.globalContext);
    
    this.outputChannel.appendLine(`🔧 Total tools in registry: ${allTools.length}`);
    
    if (allTools.length === 0) {
      throw new Error('No tools found in registry');
    }
    
    this.outputChannel.appendLine('✅ Plugin tool registration test passed');
  }

  /**
   * 测试插件MCP集成
   */
  private async testPluginMCPIntegration(): Promise<void> {
    if (!this.pluginMCPHandler) {
      throw new Error('Plugin MCP Handler not initialized');
    }
    
    // 测试MCP消息处理
    const testMessage = {
      type: 'plugin_mcp_get_servers',
      data: {},
    };
    
    const response = await this.pluginMCPHandler.handlePluginMessage(testMessage);
    
    if (!response.success) {
      throw new Error(`MCP message handling failed: ${response.error}`);
    }
    
    this.outputChannel.appendLine(`📊 MCP Response: ${JSON.stringify(response.data, null, 2)}`);
    
    // 测试获取服务器状态
    const statusMessage = {
      type: 'plugin_mcp_scan_plugins',
      data: {},
    };
    
    const statusResponse = await this.pluginMCPHandler.handlePluginMessage(statusMessage);
    
    if (!statusResponse.success) {
      throw new Error(`Plugin scan failed: ${statusResponse.error}`);
    }
    
    this.outputChannel.appendLine('✅ Plugin MCP integration test passed');
  }

  /**
   * 测试插件生命周期管理
   */
  private async testPluginLifecycleManagement(): Promise<void> {
    if (!this.pluginToolRegistry) {
      throw new Error('Plugin Tool Registry not initialized');
    }
    
    const pluginManager = this.pluginToolRegistry.getPluginManager();
    if (!pluginManager) {
      throw new Error('Plugin Manager not available');
    }
    
    // 获取插件列表
    const plugins = pluginManager.getPlugins();
    this.outputChannel.appendLine(`📦 Total plugins: ${plugins.length}`);
    
    // 检查插件状态
    for (const plugin of plugins) {
      const pluginId = plugin.metadata.id;
      const state = pluginManager.getPluginState(pluginId);
      
      this.outputChannel.appendLine(`  - ${plugin.metadata.name} (${pluginId}): ${state}`);
      
      if (state === 'error') {
        throw new Error(`Plugin ${pluginId} is in error state`);
      }
    }
    
    // 测试插件状态获取
    const managerState = pluginManager.getState();
    this.outputChannel.appendLine(`📊 Plugin Manager State: loaded=${managerState.loadedPlugins}, active=${managerState.activePlugins}`);
    
    this.outputChannel.appendLine('✅ Plugin lifecycle management test passed');
  }

  /**
   * 测试插件配置
   */
  private async testPluginConfiguration(): Promise<void> {
    if (!this.pluginToolRegistry) {
      throw new Error('Plugin Tool Registry not initialized');
    }
    
    const pluginManager = this.pluginToolRegistry.getPluginManager();
    if (!pluginManager) {
      throw new Error('Plugin Manager not available');
    }
    
    // 检查插件是否有配置模式
    const plugins = pluginManager.getPlugins();
    
    for (const plugin of plugins) {
      if (plugin.configSchema) {
        this.outputChannel.appendLine(`⚙️ Plugin ${plugin.metadata.name} has config schema`);
        
        // 测试配置更新（如果支持）
        if (plugin.updateConfig) {
          try {
            await plugin.updateConfig({
              testConfig: 'integration-test-value',
              timestamp: Date.now(),
            });
            
            this.outputChannel.appendLine(`  ✓ Config update supported`);
          } catch (error) {
            this.outputChannel.appendLine(`  ⚠️ Config update error: ${error}`);
          }
        }
      }
    }
    
    this.outputChannel.appendLine('✅ Plugin configuration test passed');
  }

  /**
   * 生成测试报告
   */
  private async generateTestReport(startTime: number): Promise<void> {
    const totalDuration = Date.now() - startTime;
    const passedTests = this.testResults.filter(result => result.passed).length;
    const totalTests = this.testResults.length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    this.outputChannel.appendLine('\n📊 =================================');
    this.outputChannel.appendLine('📊 PLUGIN SYSTEM INTEGRATION TEST REPORT');
    this.outputChannel.appendLine('📊 =================================');
    this.outputChannel.appendLine(`📊 Total Tests: ${totalTests}`);
    this.outputChannel.appendLine(`📊 Passed: ${passedTests}`);
    this.outputChannel.appendLine(`📊 Failed: ${totalTests - passedTests}`);
    this.outputChannel.appendLine(`📊 Success Rate: ${successRate.toFixed(1)}%`);
    this.outputChannel.appendLine(`📊 Total Duration: ${totalDuration}ms`);
    this.outputChannel.appendLine('📊 =================================\n');
    
    // 详细测试结果
    for (const result of this.testResults) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      this.outputChannel.appendLine(`${status} ${result.test} (${result.duration}ms)`);
      if (result.message && !result.passed) {
        this.outputChannel.appendLine(`   Message: ${result.message}`);
      }
    }
    
    this.outputChannel.appendLine('\n📊 =================================');
    
    // 将报告保存到文件
    const reportPath = path.join(
      this.globalContext.workspaceRoot,
      '.codeline',
      'plugin-system-test-report.json'
    );
    
    const reportData = {
      timestamp: new Date().toISOString(),
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate,
      totalDuration,
      results: this.testResults,
    };
    
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2), 'utf-8');
    
    this.outputChannel.appendLine(`📊 Report saved to: ${reportPath}`);
  }

  /**
   * 清理资源
   */
  private async cleanup(): Promise<void> {
    this.outputChannel.appendLine('\n🧹 Cleaning up test resources...');
    
    if (this.pluginMCPHandler) {
      try {
        await this.pluginMCPHandler.close();
        this.outputChannel.appendLine('✅ Plugin MCP Handler closed');
      } catch (error) {
        this.outputChannel.appendLine(`⚠️ Failed to close Plugin MCP Handler: ${error}`);
      }
    }
    
    if (this.pluginToolRegistry) {
      try {
        await this.pluginToolRegistry.closeWithPlugins();
        this.outputChannel.appendLine('✅ Plugin Tool Registry closed');
      } catch (error) {
        this.outputChannel.appendLine(`⚠️ Failed to close Plugin Tool Registry: ${error}`);
      }
    }
    
    this.outputChannel.appendLine('🧹 Test cleanup complete');
  }
}

/**
 * 运行插件系统集成测试
 */
export async function runPluginSystemIntegrationTest(
  extensionContext: vscode.ExtensionContext,
  workspaceRoot: string
): Promise<boolean> {
  const tester = new PluginSystemIntegrationTest(extensionContext, workspaceRoot);
  return await tester.runAllTests();
}