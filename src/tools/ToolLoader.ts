/**
 * 工具加载器
 * 负责加载和注册所有工具适配器
 */

import * as vscode from 'vscode';
import { ToolRegistry, ToolRegistryConfig } from './ToolRegistry';
import { ToolContext, ToolCategory } from './ToolInterface';
import { FileManagerAdapter } from './adapters/FileManagerAdapter';
import { TerminalExecutorAdapter } from './adapters/TerminalExecutorAdapter';
import { BrowserAutomatorAdapter } from './adapters/BrowserAutomatorAdapter';
import { MCPManagerAdapter } from './adapters/MCPManagerAdapter';
import { EnhancedBashTool } from './bash/EnhancedBashTool';

/**
 * 工具加载器配置
 */
export interface ToolLoaderConfig {
  /** 是否启用文件工具 */
  enableFileTools: boolean;
  /** 是否启用终端工具 */
  enableTerminalTools: boolean;
  /** 是否启用浏览器工具 */
  enableBrowserTools: boolean;
  /** 是否启用MCP工具 */
  enableMCPTools: boolean;
  /** 是否自动加载工具 */
  autoLoadTools: boolean;
  /** 是否显示加载进度 */
  showLoadingProgress: boolean;
  /** 加载超时时间（毫秒） */
  loadingTimeout: number;
}

/**
 * 工具加载器
 */
export class ToolLoader {
  private toolRegistry: ToolRegistry;
  private context: ToolContext;
  private config: ToolLoaderConfig;
  private isLoaded = false;
  private loadingPromise: Promise<boolean> | null = null;
  
  constructor(context: ToolContext, registry?: ToolRegistry, config?: Partial<ToolLoaderConfig>) {
    this.context = context;
    
    // 创建或使用现有的工具注册表
    if (registry) {
      this.toolRegistry = registry;
    } else {
      const registryConfig: Partial<ToolRegistryConfig> = {
        enableLazyLoading: true,
        defaultCategories: Object.values(ToolCategory),
      };
      this.toolRegistry = new ToolRegistry(registryConfig);
    }
    
    // 设置配置
    this.config = {
      enableFileTools: true,
      enableTerminalTools: true,
      enableBrowserTools: true,
      enableMCPTools: true,
      autoLoadTools: true,
      showLoadingProgress: true,
      loadingTimeout: 30000,
      ...config,
    };
  }
  
  /**
   * 加载所有工具
   */
  public async loadTools(): Promise<boolean> {
    // 如果正在加载，返回现有的Promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    // 如果已经加载，返回true
    if (this.isLoaded) {
      return true;
    }
    
    // 创建加载Promise
    this.loadingPromise = this.loadToolsInternal();
    return this.loadingPromise;
  }
  
  /**
   * 内部加载实现
   */
  private async loadToolsInternal(): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // 显示加载进度
      let progressDisposable: vscode.Disposable | undefined;
      if (this.config.showLoadingProgress) {
        progressDisposable = this.showLoadingProgress();
      }
      
      // 初始化工具注册表
      this.context.outputChannel.appendLine('🔧 Initializing tool registry...');
      const registryInitialized = await this.toolRegistry.initialize();
      if (!registryInitialized) {
        this.context.outputChannel.appendLine('❌ Failed to initialize tool registry');
        return false;
      }
      
      // 加载工具适配器
      this.context.outputChannel.appendLine('📦 Loading tool adapters...');
      
      const adaptersToLoad = [];
      
      // 文件工具
      if (this.config.enableFileTools) {
        adaptersToLoad.push({
          name: 'File Manager',
          loader: () => this.loadFileTools(),
        });
      }
      
      // 终端工具
      if (this.config.enableTerminalTools) {
        adaptersToLoad.push({
          name: 'Terminal Executor',
          loader: () => this.loadTerminalTools(),
        });
      }
      
      // 浏览器工具
      if (this.config.enableBrowserTools) {
        adaptersToLoad.push({
          name: 'Browser Automator',
          loader: () => this.loadBrowserTools(),
        });
      }
      
      // MCP工具
      if (this.config.enableMCPTools) {
        adaptersToLoad.push({
          name: 'MCP Manager',
          loader: () => this.loadMCPTools(),
        });
      }
      
      // 批量加载工具
      let loadedCount = 0;
      let failedCount = 0;
      
      for (const adapter of adaptersToLoad) {
        try {
          this.context.outputChannel.appendLine(`  Loading ${adapter.name}...`);
          
          const success = await adapter.loader();
          if (success) {
            loadedCount++;
            this.context.outputChannel.appendLine(`  ✅ ${adapter.name} loaded`);
          } else {
            failedCount++;
            this.context.outputChannel.appendLine(`  ⚠️ ${adapter.name} partially loaded or failed`);
          }
        } catch (error: any) {
          failedCount++;
          this.context.outputChannel.appendLine(`  ❌ ${adapter.name} failed: ${error.message}`);
        }
      }
      
      // 清理进度显示
      if (progressDisposable) {
        progressDisposable.dispose();
      }
      
      const duration = Date.now() - startTime;
      this.context.outputChannel.appendLine(`✅ Tool loading completed: ${loadedCount} loaded, ${failedCount} failed (${duration}ms)`);
      
      // 获取注册表状态
      const registryStatus = this.toolRegistry.getStatus();
      this.context.outputChannel.appendLine(`📊 Tool Registry: ${registryStatus.toolCount} tools, ${registryStatus.categoryCount} categories`);
      
      this.isLoaded = true;
      return true;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.context.outputChannel.appendLine(`❌ Tool loading failed after ${duration}ms: ${error.message}`);
      return false;
    } finally {
      this.loadingPromise = null;
    }
  }
  
  /**
   * 加载文件工具
   */
  private async loadFileTools(): Promise<boolean> {
    try {
      const fileAdapter = FileManagerAdapter.create(this.context);
      
      // 注册文件适配器
      const registered = this.toolRegistry.registerTool(fileAdapter, [
        ToolCategory.FILE,
        ToolCategory.DEVELOPMENT,
      ]);
      
      if (!registered) {
        this.context.outputChannel.appendLine('  ⚠️ File manager adapter registration failed');
        return false;
      }
      
      // 注册文件操作的别名
      this.toolRegistry.registerAlias(fileAdapter.id, 'file');
      this.toolRegistry.registerAlias(fileAdapter.id, 'files');
      this.toolRegistry.registerAlias(fileAdapter.id, 'fs');
      this.toolRegistry.registerAlias(fileAdapter.id, 'file-system');
      
      return true;
    } catch (error: any) {
      this.context.outputChannel.appendLine(`  ❌ File tools failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 加载终端工具
   */
  private async loadTerminalTools(): Promise<boolean> {
    try {
      const terminalAdapter = TerminalExecutorAdapter.create(this.context);
      
      // 注册终端适配器
      const registered = this.toolRegistry.registerTool(terminalAdapter, [
        ToolCategory.TERMINAL,
        ToolCategory.DEVELOPMENT,
        ToolCategory.UTILITY,
      ]);
      
      if (!registered) {
        this.context.outputChannel.appendLine('  ⚠️ Terminal executor adapter registration failed');
        return false;
      }
      
      // 注册终端操作的别名
      this.toolRegistry.registerAlias(terminalAdapter.id, 'terminal');
      this.toolRegistry.registerAlias(terminalAdapter.id, 'shell');
      this.toolRegistry.registerAlias(terminalAdapter.id, 'cmd');
      this.toolRegistry.registerAlias(terminalAdapter.id, 'command');
      
      // 注册 EnhancedBashTool（增强版终端命令执行，包含沙箱和权限控制）
      const bashTool = new EnhancedBashTool();
      const bashRegistered = this.toolRegistry.registerTool(bashTool, [
        ToolCategory.TERMINAL,
        ToolCategory.DEVELOPMENT,
        ToolCategory.UTILITY,
      ]);
      
      if (bashRegistered) {
        this.context.outputChannel.appendLine('  ✅ EnhancedBashTool registered');
        // 注册 BashTool 的别名
        this.toolRegistry.registerAlias(bashTool.id, 'bash');
        this.toolRegistry.registerAlias(bashTool.id, 'sh');
        this.toolRegistry.registerAlias(bashTool.id, 'zsh');
        this.toolRegistry.registerAlias(bashTool.id, 'powershell');
        this.toolRegistry.registerAlias(bashTool.id, 'pwsh');
      } else {
        this.context.outputChannel.appendLine('  ⚠️ BashTool registration failed (may already be registered)');
      }
      
      return true;
    } catch (error: any) {
      this.context.outputChannel.appendLine(`  ❌ Terminal tools failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 加载浏览器工具
   */
  private async loadBrowserTools(): Promise<boolean> {
    try {
      const browserAdapter = BrowserAutomatorAdapter.create(this.context);
      
      // 注册浏览器适配器
      const registered = this.toolRegistry.registerTool(browserAdapter, [
        ToolCategory.BROWSER,
        ToolCategory.DEVELOPMENT,
        ToolCategory.UTILITY,
      ]);
      
      if (!registered) {
        this.context.outputChannel.appendLine('  ⚠️ Browser automator adapter registration failed');
        return false;
      }
      
      // 注册浏览器操作的别名
      this.toolRegistry.registerAlias(browserAdapter.id, 'browser');
      this.toolRegistry.registerAlias(browserAdapter.id, 'web');
      this.toolRegistry.registerAlias(browserAdapter.id, 'automation');
      this.toolRegistry.registerAlias(browserAdapter.id, 'scraping');
      
      return true;
    } catch (error: any) {
      this.context.outputChannel.appendLine(`  ❌ Browser tools failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 加载MCP工具
   */
  private async loadMCPTools(): Promise<boolean> {
    try {
      const mcpAdapter = MCPManagerAdapter.create(this.context);
      
      // 注册MCP适配器
      const registered = this.toolRegistry.registerTool(mcpAdapter, [
        ToolCategory.MCP,
        ToolCategory.AI,
        ToolCategory.DEVELOPMENT,
        ToolCategory.UTILITY,
      ]);
      
      if (!registered) {
        this.context.outputChannel.appendLine('  ⚠️ MCP manager adapter registration failed');
        return false;
      }
      
      // 注册MCP操作的别名
      this.toolRegistry.registerAlias(mcpAdapter.id, 'mcp');
      this.toolRegistry.registerAlias(mcpAdapter.id, 'model-context');
      this.toolRegistry.registerAlias(mcpAdapter.id, 'tools');
      this.toolRegistry.registerAlias(mcpAdapter.id, 'protocol');
      
      return true;
    } catch (error: any) {
      this.context.outputChannel.appendLine(`  ❌ MCP tools failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 显示加载进度
   */
  private showLoadingProgress(): vscode.Disposable {
    const progressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: 'Loading CodeLine Tools',
      cancellable: false,
    };
    
    return vscode.window.withProgress(progressOptions, async (progress) => {
      progress.report({ message: 'Initializing...', increment: 0 });
      
      // 模拟进度更新（实际进度由加载过程控制）
      const interval = setInterval(() => {
        progress.report({ message: 'Loading tool adapters...' });
      }, 1000);
      
      // 返回清理函数
      return {
        dispose: () => clearInterval(interval),
      };
    }) as unknown as vscode.Disposable;
  }
  
  /**
   * 重新加载工具
   */
  public async reloadTools(): Promise<boolean> {
    this.isLoaded = false;
    this.loadingPromise = null;
    
    this.context.outputChannel.appendLine('🔄 Reloading tools...');
    
    return this.loadTools();
  }
  
  /**
   * 获取工具注册表
   */
  public getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }
  
  /**
   * 获取加载状态
   */
  public getLoadingStatus(): {
    isLoaded: boolean;
    isLoading: boolean;
    registryStatus?: any;
  } {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.loadingPromise !== null,
      registryStatus: this.isLoaded ? this.toolRegistry.getStatus() : undefined,
    };
  }
  
  /**
   * 获取工具统计信息
   */
  public getToolStats(): {
    totalTools: number;
    loadedTools: number;
    failedTools: number;
    toolCategories: number;
  } {
    const registryStatus = this.toolRegistry.getStatus();
    const loadingStatus = this.getLoadingStatus();
    
    return {
      totalTools: registryStatus.toolCount,
      loadedTools: this.isLoaded ? registryStatus.toolCount : 0,
      failedTools: 0, // 需要跟踪失败的工具
      toolCategories: registryStatus.categoryCount,
    };
  }
  
  /**
   * 关闭工具加载器
   */
  public async close(): Promise<void> {
    this.context.outputChannel.appendLine('🔒 Closing tool loader...');
    
    // 关闭工具注册表
    await this.toolRegistry.close();
    
    this.context.outputChannel.appendLine('✅ Tool loader closed');
  }
}