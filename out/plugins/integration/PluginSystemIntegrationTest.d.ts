/**
 * 插件系统集成测试
 * 验证插件系统的完整功能
 * 基于Claude Code CP-20260402-003插件模式
 */
import * as vscode from 'vscode';
/**
 * 插件系统集成测试
 */
export declare class PluginSystemIntegrationTest {
    private outputChannel;
    private extensionContext;
    private globalContext;
    private pluginToolRegistry;
    private pluginMCPHandler;
    private testResults;
    constructor(extensionContext: vscode.ExtensionContext, workspaceRoot: string);
    /**
     * 运行所有集成测试
     */
    runAllTests(): Promise<boolean>;
    /**
     * 运行测试套件
     */
    private runTestSuite;
    /**
     * 测试插件系统初始化
     */
    private testPluginSystemInitialization;
    /**
     * 测试插件工具注册
     */
    private testPluginToolRegistration;
    /**
     * 测试插件MCP集成
     */
    private testPluginMCPIntegration;
    /**
     * 测试插件生命周期管理
     */
    private testPluginLifecycleManagement;
    /**
     * 测试插件配置
     */
    private testPluginConfiguration;
    /**
     * 生成测试报告
     */
    private generateTestReport;
    /**
     * 清理资源
     */
    private cleanup;
}
/**
 * 运行插件系统集成测试
 */
export declare function runPluginSystemIntegrationTest(extensionContext: vscode.ExtensionContext, workspaceRoot: string): Promise<boolean>;
//# sourceMappingURL=PluginSystemIntegrationTest.d.ts.map