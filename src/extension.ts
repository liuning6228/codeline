import * as vscode from 'vscode';
import { CodeLineChatPanel } from './chat/chatPanel';
import { EnhancedProjectAnalyzer } from './analyzer/enhancedProjectAnalyzer';
import { PromptEngine } from './prompt/promptEngine';
import { ModelAdapter } from './models/modelAdapter';
import { TaskEngine, TaskResult } from './task/taskEngine';
import { EnhancedTaskEngine } from './task/EnhancedTaskEngine';
import { TaskEventUnion } from './task/taskTypes';
import { FileManager } from './file/fileManager';
import { TerminalExecutor } from './terminal/terminalExecutor';
import { BrowserAutomator } from './browser/browserAutomator';
import { CodeCompletionProvider } from './completion/codeCompletionProvider';
import { CodeLineSidebarProvider } from './sidebar/sidebarProvider';
import { ApprovalWorkflow, ApprovalItem } from './workflow/approvalWorkflow';
import { EditorCommands } from './commands/editorCommands';
import { PluginExtension } from './plugins/PluginExtension';
import { ToolContext } from './tools/ToolInterface';

export class CodeLineExtension {
  private static instance: CodeLineExtension;
  private projectAnalyzer: EnhancedProjectAnalyzer;
  private promptEngine: PromptEngine;
  private modelAdapter: ModelAdapter;
  private fileManager?: FileManager;
  private taskEngine?: TaskEngine;
  private enhancedTaskEngine?: EnhancedTaskEngine;
  private terminalExecutor?: TerminalExecutor;
  private browserAutomator?: BrowserAutomator;
  private completionProvider?: CodeCompletionProvider;
  private sidebarProvider?: CodeLineSidebarProvider;
  private editorCommands?: EditorCommands;
  private approvalWorkflow?: ApprovalWorkflow;
  private pluginExtension?: PluginExtension;
  private context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.projectAnalyzer = new EnhancedProjectAnalyzer();
    this.promptEngine = new PromptEngine();
    this.modelAdapter = new ModelAdapter();
    this.approvalWorkflow = new ApprovalWorkflow();
  }

  public static getInstance(context?: vscode.ExtensionContext): CodeLineExtension {
    if (!CodeLineExtension.instance && context) {
      CodeLineExtension.instance = new CodeLineExtension(context);
    }
    return CodeLineExtension.instance;
  }

  /**
   * 初始化Cline风格的任务引擎（按需创建）
   */
  private async ensureTaskEngineInitialized(): Promise<{ 
    fileManager: FileManager; 
    taskEngine: TaskEngine;
    enhancedTaskEngine?: EnhancedTaskEngine;
    terminalExecutor: TerminalExecutor;
    browserAutomator: BrowserAutomator;
  }> {
    if (!this.fileManager || !this.taskEngine || !this.terminalExecutor || !this.browserAutomator) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error('No workspace folder open. Please open a project first.');
      }
      
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      this.fileManager = new FileManager(workspaceRoot);
      this.terminalExecutor = new TerminalExecutor();
      this.browserAutomator = new BrowserAutomator();
      this.taskEngine = new TaskEngine(
        this.projectAnalyzer,
        this.promptEngine,
        this.modelAdapter,
        this.fileManager,
        this.terminalExecutor,
        this.browserAutomator
      );
      
      // 初始化增强任务引擎
      this.enhancedTaskEngine = new EnhancedTaskEngine(
        this.projectAnalyzer,
        this.promptEngine,
        this.modelAdapter,
        this.fileManager,
        this.terminalExecutor,
        this.browserAutomator
      );
    }
    
    return { 
      fileManager: this.fileManager!, 
      taskEngine: this.taskEngine!,
      enhancedTaskEngine: this.enhancedTaskEngine!,
      terminalExecutor: this.terminalExecutor!,
      browserAutomator: this.browserAutomator!
    };
  }

  /**
   * 初始化代码补全提供者（按需创建）
   */
  private ensureCompletionProviderInitialized(): CodeCompletionProvider {
    if (!this.completionProvider) {
      // 从配置读取设置
      const config = vscode.workspace.getConfiguration('codeline');
      
      this.completionProvider = new CodeCompletionProvider(
        this.modelAdapter,
        this.projectAnalyzer,
        {
          enabled: config.get<boolean>('enableCodeCompletion', true),
          triggerDelay: config.get<number>('completionTriggerDelay', 300),
          maxItems: config.get<number>('completionMaxItems', 10),
          useCache: config.get<boolean>('completionCacheEnabled', true),
          cacheTTL: 60000,
          useEnhancedContext: config.get<boolean>('completionUseEnhancedContext', true),
          showAISuggestions: true,
          minConfidence: config.get<number>('completionMinConfidence', 0.3)
        }
      );
      console.log('CodeLine: Code completion provider initialized');
    }
    
    return this.completionProvider;
  }

  /**
   * 获取代码补全提供者
   */
  public getCompletionProvider(): CodeCompletionProvider {
    return this.ensureCompletionProviderInitialized();
  }

  /**
   * 初始化插件系统（按需创建）
   */
  private async ensurePluginSystemInitialized(): Promise<PluginExtension> {
    if (!this.pluginExtension) {
      // 创建工具上下文
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error('No workspace folder open. Please open a project first.');
      }
      
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      const outputChannel = vscode.window.createOutputChannel('CodeLine Tools');
      
      const toolContext: ToolContext = {
        extensionContext: this.context,
        workspaceRoot,
        cwd: workspaceRoot,
        outputChannel,
        sessionId: `session-${Date.now()}`,
        sharedResources: {}
      };

      // 初始化插件扩展
      this.pluginExtension = PluginExtension.getInstance(this.context, toolContext);
      await this.pluginExtension.initialize();
      
      console.log('CodeLine: Plugin system initialized');
    }
    
    return this.pluginExtension;
  }

  /**
   * 获取插件扩展（按需初始化）
   */
  public async getPluginExtension(): Promise<PluginExtension> {
    return await this.ensurePluginSystemInitialized();
  }

  /**
   * 获取插件系统状态
   */
  public async getPluginSystemStatus(): Promise<any> {
    try {
      const pluginExtension = await this.ensurePluginSystemInitialized();
      return pluginExtension.getState();
    } catch (error) {
      return {
        initialized: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 启用/禁用代码补全功能
   */
  public setCompletionEnabled(enabled: boolean): void {
    const provider = this.ensureCompletionProviderInitialized();
    provider.setEnabled(enabled);
    vscode.window.showInformationMessage(`CodeLine code completion ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * 获取侧边栏提供者（按需创建）
   */
  public getSidebarProvider(): CodeLineSidebarProvider {
    if (!this.sidebarProvider) {
      this.sidebarProvider = new CodeLineSidebarProvider(this.context, this);
      console.log('CodeLine: Sidebar provider initialized');
    }
    return this.sidebarProvider;
  }
  
  /**
   * 异步初始化SidebarProvider的TaskEngine
   */
  public async initializeSidebarProviderTaskEngine(): Promise<void> {
    const provider = this.getSidebarProvider();
    if (provider && !provider['_taskEngine']) {
      try {
        const { fileManager, taskEngine } = await this.ensureTaskEngineInitialized();
        provider.setTaskEngine(taskEngine);
        provider.setFileManager(fileManager);
        console.log('CodeLine: TaskEngine and FileManager initialized for SidebarProvider');
      } catch (error) {
        console.warn('CodeLine: Failed to initialize TaskEngine for SidebarProvider:', error);
      }
    }
  }

  /**
   * 获取编辑器命令实例（按需创建）
   */
  public getEditorCommands(): EditorCommands {
    if (!this.editorCommands) {
      this.editorCommands = new EditorCommands(this);
      console.log('CodeLine: Editor commands initialized');
    }
    return this.editorCommands;
  }

  /**
   * 显示侧边栏并切换到指定视图
   */
  public showSidebar(view?: 'chat' | 'tasks' | 'settings' | 'history'): void {
    const provider = this.getSidebarProvider();
    provider.show();
    
    // TODO: 实现视图切换逻辑，需要在sidebar provider中添加切换方法
    console.log(`CodeLine: Sidebar shown${view ? ` with view: ${view}` : ''}`);
  }

  /**
   * 切换到聊天视图（Cline风格）
   */
  public switchToChatView(): void {
    this.showSidebar('chat');
    // 实际切换逻辑在sidebar provider内部处理
  }

  /**
   * 获取批准工作流实例
   */
  public getApprovalWorkflow(): ApprovalWorkflow {
    if (!this.approvalWorkflow) {
      this.approvalWorkflow = new ApprovalWorkflow();
    }
    return this.approvalWorkflow;
  }

  public async startChat() {
    // Check if configuration is ready before opening chat
    if (!this.modelAdapter.isReady()) {
      const result = await vscode.window.showErrorMessage(
        'CodeLine is not configured. Please set your API key in settings.',
        'Open Settings',
        'Cancel'
      );
      
      if (result === 'Open Settings') {
        vscode.commands.executeCommand('codeline.openSettings');
      }
      return;
    }
    
    // Cline风格：在侧边栏中打开聊天
    this.switchToChatView();
  }

  public async executeTask(taskDescription: string) {
    // 向后兼容：如果未配置模型，显示错误
    if (!this.modelAdapter.isReady()) {
      const result = await vscode.window.showErrorMessage(
        'CodeLine is not configured. Please set your API key in settings.',
        'Open Settings',
        'Cancel'
      );
      
      if (result === 'Open Settings') {
        vscode.commands.executeCommand('codeline.openSettings');
      }
      return;
    }
    
    try {
      // 使用新的任务引擎
      const { taskEngine } = await this.ensureTaskEngineInitialized();
      
      // 显示进度通知
      const progressOptions = {
        location: vscode.ProgressLocation.Notification,
        title: "CodeLine Task",
        cancellable: true
      };
      
      return await vscode.window.withProgress(progressOptions, async (progress, token) => {
        progress.report({ message: "Analyzing task and generating plan..." });
        
        // 开始任务处理
        const taskResult = await taskEngine.startTask(taskDescription, {
          autoExecute: true,
          requireApproval: false, // 初始版本自动执行，后续添加批准流程
          promptOptions: {
            includeExamples: true,
            includeConstraints: true,
            includeBestPractices: true
          }
        });
        
        if (taskResult.success) {
          progress.report({ message: "Task completed successfully!" });
          
          // 显示成功消息和步骤摘要
          const completedSteps = taskResult.steps.filter(s => s.status === 'completed').length;
          const totalSteps = taskResult.steps.length;
          
          const resultMessage = `Task completed: ${completedSteps}/${totalSteps} steps executed`;
          vscode.window.showInformationMessage(resultMessage, 'View Details').then(selection => {
            if (selection === 'View Details') {
              // 在输出面板显示详细结果
              this.showTaskResults(taskResult);
            }
          });
          
          return taskResult;
        } else {
          progress.report({ message: "Task failed" });
          vscode.window.showErrorMessage(`Task failed: ${taskResult.error}`);
          return taskResult;
        }
      });
      
    } catch (error: any) {
      vscode.window.showErrorMessage(`Task execution error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 流式任务执行 - 支持实时事件反馈
   * 基于EnhancedTaskEngine的异步生成器API
   */
  public async executeTaskWithStream(
    taskDescription: string,
    options?: {
      onEvent?: (event: TaskEventUnion) => void;
      onProgress?: (progress: number, message: string) => void;
      enableEventStream?: boolean;
    }
  ) {
    // 向后兼容：如果未配置模型，显示错误
    if (!this.modelAdapter.isReady()) {
      const result = await vscode.window.showErrorMessage(
        'CodeLine is not configured. Please set your API key in settings.',
        'Open Settings',
        'Cancel'
      );
      
      if (result === 'Open Settings') {
        vscode.commands.executeCommand('codeline.openSettings');
      }
      return;
    }
    
    try {
      // 使用增强任务引擎
      const { enhancedTaskEngine } = await this.ensureTaskEngineInitialized();
      if (!enhancedTaskEngine) {
        throw new Error('Enhanced task engine not initialized');
      }
      
      // 显示进度通知（传统VS Code进度条）
      const progressOptions = {
        location: vscode.ProgressLocation.Notification,
        title: "CodeLine Task",
        cancellable: true
      };
      
      return await vscode.window.withProgress(progressOptions, async (progress, token) => {
        progress.report({ message: "Starting task with real-time updates..." });
        
        // 配置事件处理
        const eventHandler = options?.onEvent || ((event) => {
          // 默认事件处理：记录到控制台
          console.log('Task event:', event);
        });
        
        const progressHandler = options?.onProgress || ((progressValue, message) => {
          // 默认进度处理：更新VS Code进度条
          progress.report({ 
            message: `[${progressValue}%] ${message}`,
            increment: 0 
          });
        });
        
        // 执行流式任务
        const streamResult = await enhancedTaskEngine.executeTaskWithStream(taskDescription, {
          onEvent: eventHandler,
          onProgress: progressHandler,
          configOverrides: {
            autoExecute: true,
            requireApproval: false,
            enableEventStream: options?.enableEventStream ?? true,
            cancellable: true
          }
        });
        
        // 根据结果显示通知
        if (streamResult.status === 'completed') {
          progress.report({ message: "Task completed successfully!" });
          
          const resultMessage = `Task completed: ${streamResult.steps.completed}/${streamResult.steps.total} steps executed`;
          vscode.window.showInformationMessage(resultMessage, 'View Details').then(selection => {
            if (selection === 'View Details' && streamResult.result) {
              this.showTaskResults(streamResult.result);
            }
          });
          
          return streamResult;
          
        } else if (streamResult.status === 'failed') {
          progress.report({ message: "Task failed" });
          vscode.window.showErrorMessage(`Task failed: ${streamResult.error}`);
          return streamResult;
          
        } else {
          // cancelled
          progress.report({ message: "Task cancelled" });
          vscode.window.showInformationMessage('Task cancelled by user');
          return streamResult;
        }
      });
      
    } catch (error: any) {
      vscode.window.showErrorMessage(`Stream task execution error: ${error.message}`);
      throw error;
    }
  }

  /**
   * 执行文件管理命令
   */
  public async executeFileCommand(command: string, data?: any): Promise<any> {
    try {
      // 初始化文件管理器
      const { fileManager } = await this.ensureTaskEngineInitialized();
      
      switch (command) {
        case 'listFiles':
          const listResult = await fileManager.listDirectory(data?.path || '.');
          return {
            success: true,
            type: 'listFiles',
            data: listResult,
            message: `Listed ${listResult.files.length} items in ${data?.path || 'current directory'}`
          };
          
        case 'searchFiles':
          const searchOptions = data?.options || {
            pattern: data?.pattern || '',
            content: data?.content || '',
            recursive: data?.recursive || true,
            maxResults: data?.maxResults || 50
          };
          const searchResults = await fileManager.searchFiles(searchOptions);
          return {
            success: true,
            type: 'searchFiles',
            data: searchResults,
            message: `Found ${searchResults.length} files matching search criteria`
          };
          
        case 'getStats':
          const stats = await fileManager.getWorkspaceStats();
          return {
            success: true,
            type: 'getStats',
            data: stats,
            message: `Workspace statistics: ${stats.totalFiles} files, ${stats.totalLines} lines, ${stats.totalSize} bytes`
          };
          
        case 'browseDirectory':
          // 打开目录选择器
          const selectedUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Browse',
            title: 'Select directory to browse'
          });
          
          if (selectedUri && selectedUri[0]) {
            const path = vscode.workspace.asRelativePath(selectedUri[0]);
            const listResult = await fileManager.listDirectory(path);
            return {
              success: true,
              type: 'browseDirectory',
              data: listResult,
              path: path,
              message: `Browsing directory: ${path}`
            };
          } else {
            return {
              success: false,
              type: 'browseDirectory',
              message: 'No directory selected'
            };
          }
          
        case 'createFile':
          if (!data?.path || !data?.content) {
            return {
              success: false,
              type: 'createFile',
              message: 'Missing path or content for file creation'
            };
          }
          const createResult = await fileManager.createFile(data.path, data.content);
          return createResult;
          
        case 'renameFile':
          if (!data?.oldPath || !data?.newPath) {
            return {
              success: false,
              type: 'renameFile',
              message: 'Missing oldPath or newPath for rename operation'
            };
          }
          const renameResult = await fileManager.renameFile(data.oldPath, data.newPath);
          return renameResult;
          
        case 'copyFile':
          if (!data?.sourcePath || !data?.destPath) {
            return {
              success: false,
              type: 'copyFile',
              message: 'Missing sourcePath or destPath for copy operation'
            };
          }
          const copyResult = await fileManager.copyFile(data.sourcePath, data.destPath);
          return copyResult;
          
        default:
          return {
            success: false,
            type: 'unknown',
            message: `Unknown file command: ${command}`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        type: command,
        error: error.message,
        message: `File command failed: ${error.message}`
      };
    }
  }

  public async analyzeProject() {
    try {
      // 尝试使用增强分析
      let enhancedContext: any = null;
      let analysisDepth = 'basic';
      
      if ('analyzeEnhancedWorkspace' in this.projectAnalyzer) {
        enhancedContext = await (this.projectAnalyzer as any).analyzeEnhancedWorkspace();
        analysisDepth = 'enhanced';
      }
      
      const context = enhancedContext || await this.projectAnalyzer.analyzeCurrentWorkspace();
      
      // 显示基本信息
      vscode.window.showInformationMessage(
        `Project analyzed (${analysisDepth}): ${context.projectType}, ${context.language}, ${context.files.length} files`,
        'View Details'
      ).then(selection => {
        if (selection === 'View Details') {
          this.showProjectAnalysis(context, enhancedContext);
        }
      });
      
      return context;
    } catch (error: any) {
      vscode.window.showErrorMessage(`Project analysis failed: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 显示增强的项目分析报告
   */
  public async showEnhancedAnalysis(): Promise<void> {
    try {
      // 检查是否支持增强分析
      if (!('analyzeEnhancedWorkspace' in this.projectAnalyzer)) {
        vscode.window.showWarningMessage('Enhanced analysis not available in current version');
        await this.analyzeProject();
        return;
      }
      
      // 显示进度
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Enhanced Project Analysis',
        cancellable: false
      }, async (progress) => {
        progress.report({ message: 'Analyzing project structure...' });
        
        // 执行增强分析
        const enhancedContext = await (this.projectAnalyzer as any).analyzeEnhancedWorkspace();
        
        progress.report({ message: 'Generating analysis report...' });
        
        // 显示详细报告
        this.showProjectAnalysis(enhancedContext, enhancedContext);
        
        // 显示完成消息
        vscode.window.showInformationMessage(
          `Enhanced analysis completed: ${enhancedContext.files.length} files analyzed`,
          'View Report'
        );
      });
      
    } catch (error: any) {
      vscode.window.showErrorMessage(`Enhanced analysis failed: ${error.message}`);
      console.error('Enhanced analysis error:', error);
    }
  }
  
  /**
   * 显示详细的项目分析报告
   */
  private showProjectAnalysis(context: any, enhancedContext?: any): void {
    const outputChannel = vscode.window.createOutputChannel('CodeLine Project Analysis');
    outputChannel.show(true);
    
    outputChannel.appendLine('=== CodeLine Project Analysis Report ===');
    outputChannel.appendLine(`Generated: ${new Date().toISOString()}`);
    outputChannel.appendLine('');
    
    // 基础项目信息
    outputChannel.appendLine('## Project Overview');
    outputChannel.appendLine(`- Type: ${context.projectType}`);
    outputChannel.appendLine(`- Language: ${context.language}`);
    if (context.framework) {
      outputChannel.appendLine(`- Framework: ${context.framework}`);
    }
    if (context.architecture) {
      outputChannel.appendLine(`- Architecture: ${context.architecture}`);
    }
    outputChannel.appendLine(`- Root: ${context.rootPath}`);
    outputChannel.appendLine(`- Files analyzed: ${context.files.length}`);
    outputChannel.appendLine('');
    
    // 代码风格
    outputChannel.appendLine('## Code Style');
    outputChannel.appendLine(`- Indent: ${context.codeStyle.indent} spaces`);
    outputChannel.appendLine(`- Quote style: ${context.codeStyle.quoteStyle}`);
    outputChannel.appendLine(`- Line ending: ${context.codeStyle.lineEnding}`);
    outputChannel.appendLine('');
    
    // 依赖信息
    if (context.dependencies.length > 0) {
      outputChannel.appendLine('## Dependencies');
      outputChannel.appendLine(`Found ${context.dependencies.length} dependencies:`);
      context.dependencies.forEach((dep: string, index: number) => {
        outputChannel.appendLine(`  ${index + 1}. ${dep}`);
      });
      outputChannel.appendLine('');
    }
    
    // 增强分析信息
    if (enhancedContext) {
      outputChannel.appendLine('## Enhanced Analysis');
      
      // 分析元数据
      if (enhancedContext.analysisMetadata) {
        outputChannel.appendLine(`- Analysis depth: ${enhancedContext.analysisMetadata.depth}`);
        outputChannel.appendLine(`- Analysis time: ${enhancedContext.analysisMetadata.analysisTime}ms`);
        outputChannel.appendLine(`- Files analyzed: ${enhancedContext.analysisMetadata.filesAnalyzed}`);
        outputChannel.appendLine('');
      }
      
      // 代码质量报告
      if (enhancedContext.codeQuality) {
        const quality = enhancedContext.codeQuality;
        outputChannel.appendLine('### Code Quality');
        outputChannel.appendLine(`- Overall score: ${quality.overallScore.toFixed(1)}/100`);
        outputChannel.appendLine(`- Lines of code: ${quality.metrics.linesOfCode}`);
        outputChannel.appendLine(`- Complexity: ${quality.metrics.complexity.toFixed(2)}`);
        outputChannel.appendLine(`- Maintainability: ${quality.metrics.maintainabilityIndex.toFixed(1)}`);
        outputChannel.appendLine(`- Duplication rate: ${(quality.metrics.duplicationRate * 100).toFixed(1)}%`);
        outputChannel.appendLine('');
        
        if (quality.issues.length > 0) {
          outputChannel.appendLine(`Found ${quality.issues.length} issues:`);
          quality.issues.slice(0, 10).forEach((issue: any, index: number) => {
            outputChannel.appendLine(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message} (${issue.file}${issue.line ? `:${issue.line}` : ''})`);
          });
          if (quality.issues.length > 10) {
            outputChannel.appendLine(`  ... and ${quality.issues.length - 10} more issues`);
          }
          outputChannel.appendLine('');
        }
        
        if (quality.suggestions.length > 0) {
          outputChannel.appendLine(`Generated ${quality.suggestions.length} refactoring suggestions:`);
          quality.suggestions.slice(0, 5).forEach((suggestion: any, index: number) => {
            outputChannel.appendLine(`  ${index + 1}. [${suggestion.type}] ${suggestion.description} (confidence: ${(suggestion.confidence * 100).toFixed(0)}%)`);
          });
          if (quality.suggestions.length > 5) {
            outputChannel.appendLine(`  ... and ${quality.suggestions.length - 5} more suggestions`);
          }
          outputChannel.appendLine('');
        }
      }
      
      // 架构模式
      if (enhancedContext.architecturePatterns && enhancedContext.architecturePatterns.length > 0) {
        outputChannel.appendLine('### Architecture Patterns');
        enhancedContext.architecturePatterns.forEach((pattern: any, index: number) => {
          outputChannel.appendLine(`  ${index + 1}. ${pattern.name} (confidence: ${(pattern.confidence * 100).toFixed(0)}%)`);
        });
        outputChannel.appendLine('');
      }
      
      // 依赖关系图
      if (enhancedContext.dependencyGraph) {
        const graph = enhancedContext.dependencyGraph;
        outputChannel.appendLine('### Dependency Graph');
        outputChannel.appendLine(`- Nodes: ${graph.nodes.length} (${graph.nodes.filter((n: any) => n.type === 'external').length} external, ${graph.nodes.filter((n: any) => n.type === 'dev').length} dev)`);
        outputChannel.appendLine(`- Edges: ${graph.edges.length}`);
        if (graph.circularDependencies.length > 0) {
          outputChannel.appendLine(`- Circular dependencies: ${graph.circularDependencies.length} found`);
        }
        outputChannel.appendLine('');
      }
      
      // 模块关系
      if (enhancedContext.moduleRelations && enhancedContext.moduleRelations.length > 0) {
        outputChannel.appendLine(`### Module Relations (${enhancedContext.moduleRelations.length} imports found)`);
        // 显示前10个
        enhancedContext.moduleRelations.slice(0, 10).forEach((rel: any, index: number) => {
          outputChannel.appendLine(`  ${index + 1}. ${rel.sourceFile} → ${rel.targetFile} (${rel.importType})`);
        });
        if (enhancedContext.moduleRelations.length > 10) {
          outputChannel.appendLine(`  ... and ${enhancedContext.moduleRelations.length - 10} more relations`);
        }
        outputChannel.appendLine('');
      }
      
      // 相关上下文
      if (enhancedContext.relevantContext) {
        const relevant = enhancedContext.relevantContext;
        outputChannel.appendLine('### Relevant Context');
        if (relevant.focusedFile) {
          outputChannel.appendLine(`- Focused file: ${relevant.focusedFile}`);
        }
        if (relevant.relatedFiles.length > 0) {
          outputChannel.appendLine(`- Related files: ${relevant.relatedFiles.length} (top 5 by relevance)`);
          relevant.relatedFiles.slice(0, 5).forEach((file: any, index: number) => {
            outputChannel.appendLine(`  ${index + 1}. ${file.path} (score: ${(file.relevanceScore * 100).toFixed(0)}%)`);
          });
        }
        if (relevant.recentChanges.length > 0) {
          outputChannel.appendLine(`- Recently changed files: ${relevant.recentChanges.slice(0, 3).join(', ')}`);
        }
        if (relevant.activeComponents.length > 0) {
          outputChannel.appendLine(`- Active components: ${relevant.activeComponents.slice(0, 5).join(', ')}`);
        }
        outputChannel.appendLine('');
      }
    }
    
    outputChannel.appendLine('=== End of Report ===');
  }

  /**
   * 在输出面板显示任务结果
   */
  private showTaskResults(taskResult: TaskResult): void {
    const outputChannel = vscode.window.createOutputChannel('CodeLine Task Results');
    outputChannel.show(true);
    
    outputChannel.appendLine('=== CodeLine Task Results ===');
    outputChannel.appendLine(`Task: ${taskResult.success ? 'SUCCESS' : 'FAILED'}`);
    outputChannel.appendLine('');
    
    if (taskResult.error) {
      outputChannel.appendLine(`Error: ${taskResult.error}`);
      outputChannel.appendLine('');
    }
    
    // 显示步骤摘要
    outputChannel.appendLine('Steps Summary:');
    taskResult.steps.forEach((step, index) => {
      const statusIcon = step.status === 'completed' ? '✓' :
                        step.status === 'failed' ? '✗' :
                        step.status === 'executing' ? '⟳' : '⏸';
      
      outputChannel.appendLine(`  ${index + 1}. [${statusIcon}] ${step.type}: ${step.description}`);
      
      if (step.result) {
        outputChannel.appendLine(`     Result: ${step.result.substring(0, 200)}${step.result.length > 200 ? '...' : ''}`);
      }
      if (step.error) {
        outputChannel.appendLine(`     Error: ${step.error}`);
      }
    });
    
    outputChannel.appendLine('');
    outputChannel.appendLine('Detailed Output:');
    outputChannel.appendLine(taskResult.output);
  }

  public getModelAdapter() {
    return this.modelAdapter;
  }

  public getModelInfo(): string {
    const config = this.modelAdapter.getConfiguration();
    if (!config.apiKey) {
      return 'Not configured';
    }
    return `${config.model} (${config.baseUrl})`;
  }

  public getConfig() {
    return this.modelAdapter.getConfiguration();
  }

  public updateConfig(newConfig: any) {
    this.modelAdapter.updateConfiguration(newConfig);
  }

  /**
   * 批准或拒绝文件差异（从UI调用）
   */
  public async approveFileDiff(diffId: string, action: 'approve' | 'reject'): Promise<{success: boolean; message: string; error?: string}> {
    try {
      const { taskEngine } = await this.ensureTaskEngineInitialized();
      return await taskEngine.approveDiff(diffId, action);
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to ${action} file changes: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * 获取当前模式
   */
  public async getMode(): Promise<'plan' | 'act'> {
    try {
      const { taskEngine } = await this.ensureTaskEngineInitialized();
      return taskEngine.getMode();
    } catch {
      return 'act'; // Default mode
    }
  }
  
  /**
   * 设置模式
   */
  public async setMode(mode: 'plan' | 'act'): Promise<void> {
    try {
      const { taskEngine } = await this.ensureTaskEngineInitialized();
      taskEngine.setMode(mode);
      
      // Notify webview of mode change
      if (this.sidebarProvider) {
        this.sidebarProvider.postMessage({
          type: 'modeChanged',
          mode: mode
        });
      }
    } catch (error: any) {
      console.error('Failed to set mode:', error);
    }
  }
  
  /**
   * 切换模式
   */
  public async toggleMode(): Promise<'plan' | 'act'> {
    try {
      const { taskEngine } = await this.ensureTaskEngineInitialized();
      const newMode = taskEngine.toggleMode();
      
      // Notify webview of mode change
      if (this.sidebarProvider) {
        this.sidebarProvider.postMessage({
          type: 'modeChanged',
          mode: newMode
        });
      }
      
      return newMode;
    } catch (error: any) {
      console.error('Failed to toggle mode:', error);
      return 'act';
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeLine extension is now active!');
  
  const codeLine = CodeLineExtension.getInstance(context);

  // Register commands
  const startChatCommand = vscode.commands.registerCommand('codeline.startChat', () => {
    codeLine.startChat();
  });

  const executeTaskCommand = vscode.commands.registerCommand('codeline.executeTask', async () => {
    const task = await vscode.window.showInputBox({
      prompt: 'Enter the task you want CodeLine to execute',
      placeHolder: 'e.g., Create a user login API endpoint'
    });
    if (task) {
      await codeLine.executeTask(task);
    }
  });

  const analyzeProjectCommand = vscode.commands.registerCommand('codeline.analyzeProject', () => {
    codeLine.analyzeProject();
  });

  const showEnhancedAnalysisCommand = vscode.commands.registerCommand('codeline.showEnhancedAnalysis', () => {
    codeLine.showEnhancedAnalysis();
  });

  const openSettingsCommand = vscode.commands.registerCommand('codeline.openSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', '@ext:codeline');
  });

  // 代码补全相关命令
  const toggleCompletionCommand = vscode.commands.registerCommand('codeline.toggleCodeCompletion', async () => {
    const isEnabled = await vscode.window.showQuickPick(
      ['Enable', 'Disable'],
      { placeHolder: 'Enable or disable CodeLine code completion?' }
    );
    
    if (isEnabled === 'Enable') {
      codeLine.setCompletionEnabled(true);
    } else if (isEnabled === 'Disable') {
      codeLine.setCompletionEnabled(false);
    }
  });

  const clearCompletionCacheCommand = vscode.commands.registerCommand('codeline.clearCompletionCache', () => {
    const provider = codeLine.getCompletionProvider();
    (provider as any).clearCache?.();
    vscode.window.showInformationMessage('CodeLine completion cache cleared');
  });

  // 插件管理命令
  const managePluginsCommand = vscode.commands.registerCommand('codeline.plugins.manage', async () => {
    try {
      const pluginExtension = await codeLine.getPluginExtension();
      pluginExtension.showPluginManagementUI();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open plugin management: ${error}`);
    }
  });

  const reloadPluginsCommand = vscode.commands.registerCommand('codeline.plugins.reload', async () => {
    try {
      const pluginExtension = await codeLine.getPluginExtension();
      await pluginExtension.reloadPlugins();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to reload plugins: ${error}`);
    }
  });

  const listPluginsCommand = vscode.commands.registerCommand('codeline.plugins.list', async () => {
    try {
      const pluginExtension = await codeLine.getPluginExtension();
      await pluginExtension.listPlugins();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to list plugins: ${error}`);
    }
  });

  const installPluginCommand = vscode.commands.registerCommand('codeline.plugins.install', async () => {
    try {
      const pluginExtension = await codeLine.getPluginExtension();
      await pluginExtension.installPlugin();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to install plugin: ${error}`);
    }
  });

  const pluginsStatusCommand = vscode.commands.registerCommand('codeline.plugins.status', async () => {
    try {
      const status = await codeLine.getPluginSystemStatus();
      const message = [
        'CodeLine Plugin System Status:',
        `- Initialized: ${status.initialized ? 'Yes' : 'No'}`,
        `- Loaded plugins: ${status.loadedPlugins || 0}`,
        `- Active plugins: ${status.activePlugins || 0}`,
        `- Plugin tools: ${status.pluginTools || 0}`,
        `- MCP servers: ${status.pluginMCPServers || 0}`,
        status.error ? `- Error: ${status.error}` : ''
      ].filter(Boolean).join('\n');
      
      const doc = await vscode.workspace.openTextDocument({
        content: message,
        language: 'markdown'
      });
      await vscode.window.showTextDocument(doc, { preview: true });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get plugin status: ${error}`);
    }
  });

  // Cline风格的新命令
  const executeClineTaskCommand = vscode.commands.registerCommand('codeline.executeClineTask', async () => {
    const task = await vscode.window.showInputBox({
      prompt: 'Enter task for Cline-style execution (with Qoder prompts)',
      placeHolder: 'e.g., Create a user login API endpoint with Spring Boot',
      value: 'Create a REST API endpoint for user authentication with proper validation'
    });
    if (task) {
      await codeLine.executeTask(task);
    }
  });

  const showFileDiffCommand = vscode.commands.registerCommand('codeline.showFileDiff', async () => {
    // Get pending file changes from approval workflow
    const pendingItems = codeLine.getApprovalWorkflow().getPendingItems();
    const fileChanges = pendingItems.filter((item: ApprovalItem) => item.type === 'file');
    
    if (fileChanges.length === 0) {
      vscode.window.showInformationMessage('No pending file changes to review.');
      return;
    }
    
    // Convert to ChangedFile format for DiffViewer
    const changedFiles: import('./diff/diffViewer').ChangedFile[] = fileChanges.map((item: ApprovalItem) => ({
      relativePath: item.description,
      absolutePath: (item.data as any).filePath,
      before: (item.data as any).oldContent || '',
      after: (item.data as any).newContent || ''
    }));
    
    // Open Cline-style diff view
    const result = await import('./diff/diffViewer').then(module => 
      module.DiffViewer.openMultiFileDiff(changedFiles, {
        title: 'CodeLine - Review Changes',
        showApplyButton: true,
        showRejectButton: true
      })
    );
    
    // Handle user decision
    if (result.applied) {
      vscode.window.showInformationMessage('Changes applied successfully.');
      // Update approval workflow status
      fileChanges.forEach((item: ApprovalItem) => {
        codeLine.getApprovalWorkflow().approveItem(item.id, { reason: 'Changes applied via diff view' });
      });
    } else if (result.rejected) {
      vscode.window.showInformationMessage('Changes rejected.');
      fileChanges.forEach((item: ApprovalItem) => {
        codeLine.getApprovalWorkflow().rejectItem(item.id, { reason: 'Changes rejected via diff view' });
      });
    }
  });

  const approveChangesCommand = vscode.commands.registerCommand('codeline.approveChanges', async () => {
    const approvalWorkflow = codeLine.getApprovalWorkflow();
    const pendingItems = approvalWorkflow.getPendingItems();
    
    if (pendingItems.length === 0) {
      vscode.window.showInformationMessage('No pending changes to approve.');
      return;
    }
    
    // For file changes, show diff view first
    const fileChanges = pendingItems.filter((item: ApprovalItem) => item.type === 'file');
    if (fileChanges.length > 0) {
      // Open diff view for review
      const changedFiles: import('./diff/diffViewer').ChangedFile[] = fileChanges.map((item: ApprovalItem) => ({
        relativePath: item.description,
        absolutePath: (item.data as any).filePath,
        before: (item.data as any).oldContent || '',
        after: (item.data as any).newContent || ''
      }));
      
      const result = await import('./diff/diffViewer').then(module => 
        module.DiffViewer.openMultiFileDiff(changedFiles, {
          title: 'CodeLine - Review and Approve Changes',
          showApplyButton: true,
          showRejectButton: true
        })
      );
      
      if (result.applied) {
        // Approve all pending items, not just files
        pendingItems.forEach((item: ApprovalItem) => {
          approvalWorkflow.approveItem(item.id, { reason: 'Approved via approve changes command' });
        });
        vscode.window.showInformationMessage(`Approved ${pendingItems.length} pending changes.`);
      } else if (result.rejected) {
        // Reject all pending items
        pendingItems.forEach((item: ApprovalItem) => {
          approvalWorkflow.rejectItem(item.id, { reason: 'Rejected via approve changes command' });
        });
        vscode.window.showInformationMessage(`Rejected ${pendingItems.length} pending changes.`);
      }
    } else {
      // Non-file changes, just approve all
      const choice = await vscode.window.showInformationMessage(
        `Approve ${pendingItems.length} pending changes?`,
        { modal: true },
        'Approve All',
        'Reject All',
        'Cancel'
      );
      
      if (choice === 'Approve All') {
        pendingItems.forEach((item: ApprovalItem) => {
          approvalWorkflow.approveItem(item.id, { reason: 'Approved via approve changes command' });
        });
        vscode.window.showInformationMessage(`Approved ${pendingItems.length} pending changes.`);
      } else if (choice === 'Reject All') {
        pendingItems.forEach((item: ApprovalItem) => {
          approvalWorkflow.rejectItem(item.id, { reason: 'Rejected via approve changes command' });
        });
        vscode.window.showInformationMessage(`Rejected ${pendingItems.length} pending changes.`);
      }
    }
  });

  // Register view for activity bar icon - Cline style comprehensive sidebar
  const sidebarProvider = codeLine.getSidebarProvider();
  
  const chatViewProviderRegistration = vscode.window.registerWebviewViewProvider(
    'codeline.chat',
    sidebarProvider
  );
  
  // 异步初始化TaskEngine（不阻塞激活过程）
  codeLine.initializeSidebarProviderTaskEngine().catch(err => {
    console.warn('CodeLine: Failed to initialize TaskEngine on activation:', err);
  });

  // Register navigation button commands for Cline-style UI
  const chatButtonCommand = vscode.commands.registerCommand('codeline.chatButtonClicked', () => {
    codeLine.showSidebar('chat');
    console.log('CodeLine: Chat button clicked');
  });

  const tasksButtonCommand = vscode.commands.registerCommand('codeline.tasksButtonClicked', () => {
    codeLine.showSidebar('tasks');
    console.log('CodeLine: Tasks button clicked');
  });

  const settingsButtonCommand = vscode.commands.registerCommand('codeline.settingsButtonClicked', () => {
    codeLine.showSidebar('settings');
    console.log('CodeLine: Settings button clicked');
  });

  const historyButtonCommand = vscode.commands.registerCommand('codeline.historyButtonClicked', () => {
    codeLine.showSidebar('history');
    console.log('CodeLine: History button clicked');
  });

  // Register Cline-style editor commands
  const addToChatCommand = vscode.commands.registerCommand('codeline.addToChat', () => {
    const editorCommands = codeLine.getEditorCommands();
    editorCommands.addToChat();
    console.log('CodeLine: Add to chat command executed');
  });

  const focusChatInputCommand = vscode.commands.registerCommand('codeline.focusChatInput', () => {
    const editorCommands = codeLine.getEditorCommands();
    editorCommands.focusChatInput();
    console.log('CodeLine: Focus chat input command executed');
  });

  const explainCodeCommand = vscode.commands.registerCommand('codeline.explainCode', () => {
    const editorCommands = codeLine.getEditorCommands();
    editorCommands.explainCode();
    console.log('CodeLine: Explain code command executed');
  });

  const improveCodeCommand = vscode.commands.registerCommand('codeline.improveCode', () => {
    const editorCommands = codeLine.getEditorCommands();
    editorCommands.improveCode();
    console.log('CodeLine: Improve code command executed');
  });

  const generateGitCommitMessageCommand = vscode.commands.registerCommand('codeline.generateGitCommitMessage', () => {
    const editorCommands = codeLine.getEditorCommands();
    editorCommands.generateGitCommitMessage();
    console.log('CodeLine: Generate Git commit message command executed');
  });

  // 注册代码补全提供者
  const completionProvider = codeLine.getCompletionProvider();
  const supportedLanguages = [
    'typescript', 'javascript', 'typescriptreact', 'javascriptreact',
    'python', 'java', 'go', 'rust', 'cpp', 'csharp'
  ];
  
  const completionRegistration = vscode.languages.registerCompletionItemProvider(
    supportedLanguages.map(lang => ({ language: lang })),
    completionProvider,
    '.', // 触发字符：点号
    ...[' ', '(', '[', '{', "'", '"', '`'] // 更多触发字符
  );

  // Plan/Act mode toggle commands
  const toggleModeCommand = vscode.commands.registerCommand('codeline.toggleMode', async () => {
    const newMode = await codeLine.toggleMode();
    vscode.window.showInformationMessage(`CodeLine mode: ${newMode.toUpperCase()}`);
    console.log(`CodeLine: Mode toggled to ${newMode}`);
  });

  const setPlanModeCommand = vscode.commands.registerCommand('codeline.setPlanMode', async () => {
    await codeLine.setMode('plan');
    vscode.window.showInformationMessage('CodeLine: Plan mode enabled');
    console.log('CodeLine: Plan mode enabled');
  });

  const setActModeCommand = vscode.commands.registerCommand('codeline.setActMode', async () => {
    await codeLine.setMode('act');
    vscode.window.showInformationMessage('CodeLine: Act mode enabled');
    console.log('CodeLine: Act mode enabled');
  });

  const getModeCommand = vscode.commands.registerCommand('codeline.getMode', async () => {
    const mode = await codeLine.getMode();
    vscode.window.showInformationMessage(`CodeLine current mode: ${mode.toUpperCase()}`);
  });

  context.subscriptions.push(
    startChatCommand,
    executeTaskCommand,
    executeClineTaskCommand,
    showFileDiffCommand,
    approveChangesCommand,
    analyzeProjectCommand,
    showEnhancedAnalysisCommand,
    openSettingsCommand,
    toggleCompletionCommand,
    clearCompletionCacheCommand,
    managePluginsCommand,
    reloadPluginsCommand,
    listPluginsCommand,
    installPluginCommand,
    pluginsStatusCommand,
    chatViewProviderRegistration,
    chatButtonCommand,
    tasksButtonCommand,
    settingsButtonCommand,
    historyButtonCommand,
    addToChatCommand,
    focusChatInputCommand,
    explainCodeCommand,
    improveCodeCommand,
    generateGitCommitMessageCommand,
    completionRegistration,
    toggleModeCommand,
    setPlanModeCommand,
    setActModeCommand,
    getModeCommand
  );
}

export function deactivate() {}