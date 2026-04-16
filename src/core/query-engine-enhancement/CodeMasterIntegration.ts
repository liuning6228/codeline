/**
 * CodeMasterIntegration - 编码大师集成模块
 * 
 * 提供将CodeMasterQueryEngine集成到CodeLine扩展的便捷方法
 * 包含配置、初始化和使用示例
 */

import * as vscode from 'vscode';
import { CodeMasterQueryEngine, CodeMasterQueryEngineConfig } from './CodeMasterQueryEngine';
import { EnhancedToolRegistry } from '../tool/EnhancedToolRegistry';
import { ModelAdapter } from '../../models/modelAdapter';

/**
 * CodeMaster集成配置
 */
export interface CodeMasterIntegrationConfig {
  // 基础配置
  workspaceRoot: string;
  extensionContext: vscode.ExtensionContext;
  
  // 模型适配器
  modelAdapter: ModelAdapter;
  
  // 工具注册表
  toolRegistry: EnhancedToolRegistry;
  
  // 功能标志
  enableCodeContext: boolean;
  enableIntelligentTools: boolean;
  enableEnhancedThinking: boolean;
  enableStateMemory: boolean;
  
  // 性能配置
  cacheEnabled: boolean;
  maxFileSizeMB: number;
  
  // 日志配置
  verboseLogging: boolean;
  logLevel: 'info' | 'debug' | 'warn' | 'error';
}

/**
 * CodeMaster集成结果
 */
export interface CodeMasterIntegrationResult {
  engine: CodeMasterQueryEngine;
  config: CodeMasterQueryEngineConfig;
  isInitialized: boolean;
  status: 'ready' | 'initializing' | 'error';
  error?: string;
}

/**
 * CodeMaster集成管理器
 */
export class CodeMasterIntegration {
  private config: CodeMasterIntegrationConfig;
  private engine: CodeMasterQueryEngine | null = null;
  private outputChannel: vscode.OutputChannel;
  
  constructor(config: CodeMasterIntegrationConfig) {
    this.config = config;
    this.outputChannel = vscode.window.createOutputChannel('CodeMaster Integration');
  }
  
  /**
   * 初始化CodeMaster查询引擎
   */
  public async initialize(): Promise<CodeMasterIntegrationResult> {
    this.outputChannel.appendLine('🚀 Initializing CodeMaster Integration...');
    this.outputChannel.appendLine(`   Workspace: ${this.config.workspaceRoot}`);
    this.outputChannel.appendLine(`   Code Context: ${this.config.enableCodeContext ? 'Enabled' : 'Disabled'}`);
    this.outputChannel.appendLine(`   Enhanced Thinking: ${this.config.enableEnhancedThinking ? 'Enabled' : 'Disabled'}`);
    
    try {
      // 1. 创建CodeMaster查询引擎配置
      const engineConfig = this.createEngineConfig();
      
      // 2. 创建引擎实例
      this.engine = new CodeMasterQueryEngine(engineConfig);
      
      // 3. 验证工具注册表
      await this.validateToolRegistry();
      
      // 4. 初始化引擎
      await this.engine.initialize();
      
      this.outputChannel.appendLine('✅ CodeMaster Integration initialized successfully');
      this.outputChannel.appendLine(`   Engine: ${this.engine.constructor.name}`);
      this.outputChannel.appendLine(`   Model: ${engineConfig.modelAdapter.modelName}`);
      this.outputChannel.appendLine(`   Tools: ${this.config.toolRegistry.getAllTools().length} registered`);
      
      return {
        engine: this.engine,
        config: engineConfig,
        isInitialized: true,
        status: 'ready',
      };
      
    } catch (error: any) {
      const errorMessage = `Failed to initialize CodeMaster Integration: ${error.message}`;
      this.outputChannel.appendLine(`❌ ${errorMessage}`);
      
      return {
        engine: this.engine!,
        config: {} as CodeMasterQueryEngineConfig,
        isInitialized: false,
        status: 'error',
        error: errorMessage,
      };
    }
  }
  
  /**
   * 获取CodeMaster查询引擎
   */
  public getEngine(): CodeMasterQueryEngine {
    if (!this.engine) {
      throw new Error('CodeMaster engine not initialized. Call initialize() first.');
    }
    return this.engine;
  }
  
  /**
   * 处理编码请求（高级API）
   */
  public async processCodingRequest(
    userInput: string,
    options: {
      skipTools?: boolean;
      skipThinking?: boolean;
      maxThinkingTokens?: number;
      contextFiles?: string[];
    } = {}
  ): Promise<{
    success: boolean;
    response?: string;
    toolCalls?: any[];
    thinking?: string;
    intent?: any;
    error?: string;
    duration?: number;
  }> {
    const startTime = Date.now();
    
    if (!this.engine) {
      return {
        success: false,
        error: 'Engine not initialized',
      };
    }
    
    this.outputChannel.appendLine(`📝 Processing coding request: "${userInput.substring(0, 100)}..."`);
    
    try {
      // 设置上下文文件（如果有）
      if (options.contextFiles && options.contextFiles.length > 0) {
        this.outputChannel.appendLine(`   Context files: ${options.contextFiles.length}`);
      }
      
      // 处理消息
      const submitOptions = {
        skipTools: options.skipTools,
        skipThinking: options.skipThinking,
      };
      
      // 提交消息到引擎并处理异步生成器
      const generator = this.engine.submitMessage(userInput, submitOptions);
      let finalResult: any = null;
      
      // 手动迭代异步生成器以获取最终结果
      try {
        while (true) {
          const next = await generator.next();
          if (next.done) {
            // 生成器完成，next.value 是最终的 SubmitResult
            finalResult = next.value;
            break;
          }
          // next.value 是 EngineProgress，可以在这里处理进度更新
          // this.outputChannel.appendLine(`Progress: ${next.value.type} - ${next.value.message}`);
        }
      } catch (error: any) {
        const duration = Date.now() - startTime;
        this.outputChannel.appendLine(`❌ Request failed after ${duration}ms: ${error.message}`);
        
        return {
          success: false,
          error: error.message,
          duration,
        };
      }
      
      const duration = Date.now() - startTime;
      this.outputChannel.appendLine(`✅ Request completed in ${duration}ms`);
      
      if (finalResult.success) {
        return {
          success: true,
          response: finalResult.message?.content || '',
          toolCalls: finalResult.toolCalls || [],
          thinking: finalResult.thinking || '',
          intent: finalResult.message?.metadata?.intent,
          duration,
        };
      } else {
        return {
          success: false,
          error: finalResult.error,
          duration,
        };
      }
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = `Error processing coding request: ${error.message}`;
      this.outputChannel.appendLine(`❌ ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }
  
  /**
   * 执行编码任务（简化API）
   */
  public async executeCodingTask(task: string): Promise<string> {
    this.outputChannel.appendLine(`🔧 Executing coding task: ${task}`);
    
    const result = await this.processCodingRequest(task);
    
    if (result.success && result.response) {
      return result.response;
    } else {
      throw new Error(result.error || 'Failed to execute coding task');
    }
  }
  
  /**
   * 获取引擎状态
   */
  public getEngineStatus(): {
    isInitialized: boolean;
    modelName: string;
    toolCount: number;
    capabilities: string[];
    memoryStats: any;
  } {
    if (!this.engine) {
      return {
        isInitialized: false,
        modelName: 'Not initialized',
        toolCount: 0,
        capabilities: [],
        memoryStats: {},
      };
    }
    
    const capabilities: string[] = [];
    if (this.config.enableCodeContext) capabilities.push('code_context');
    if (this.config.enableIntelligentTools) capabilities.push('intelligent_tools');
    if (this.config.enableEnhancedThinking) capabilities.push('enhanced_thinking');
    if (this.config.enableStateMemory) capabilities.push('state_memory');
    
    return {
      isInitialized: true,
      modelName: this.engine['config']?.modelAdapter?.modelName || 'Unknown',
      toolCount: this.config.toolRegistry.getAllTools().length,
      capabilities,
      memoryStats: this.getMemoryStats(),
    };
  }
  
  /**
   * 显示编码助手面板
   */
  public async showCodeAssistantPanel(): Promise<void> {
    // 创建Webview面板
    const panel = vscode.window.createWebviewPanel(
      'codeMasterAssistant',
      'CodeMaster Assistant',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );
    
    // 设置Webview内容
    panel.webview.html = this.getWebviewContent();
    
    // 处理消息
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'executeTask':
            const result = await this.processCodingRequest(message.task);
            panel.webview.postMessage({
              command: 'taskResult',
              result,
            });
            break;
            
          case 'analyzeCode':
            const analysis = await this.analyzeCurrentFile();
            panel.webview.postMessage({
              command: 'analysisResult',
              analysis,
            });
            break;
            
          case 'getStatus':
            const status = this.getEngineStatus();
            panel.webview.postMessage({
              command: 'statusResult',
              status,
            });
            break;
        }
      },
      undefined,
      this.config.extensionContext.subscriptions
    );
  }
  
  /**
   * 分析当前文件
   */
  public async analyzeCurrentFile(): Promise<any> {
    if (!this.engine) {
      throw new Error('Engine not initialized');
    }
    
    try {
      // 获取当前编辑器
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return { error: 'No active editor' };
      }
      
      const document = editor.document;
      const filePath = document.uri.fsPath;
      
      // 使用CodeContextEnhancer分析文件
      const codeEnhancer = this.engine['codeEnhancer'];
      if (codeEnhancer) {
        const analysis = await codeEnhancer['analyzeCurrentFile']();
        return {
          success: true,
          filePath,
          analysis,
        };
      } else {
        return {
          success: false,
          error: 'CodeContextEnhancer not available',
        };
      }
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * 清理资源
   */
  public async dispose(): Promise<void> {
    if (this.engine) {
      await this.engine.dispose();
      this.engine = null;
    }
    
    this.outputChannel.dispose();
    this.outputChannel.appendLine('🧹 CodeMaster Integration disposed');
  }
  
  // ==================== 私有方法 ====================
  
  /**
   * 创建引擎配置
   */
  private createEngineConfig(): CodeMasterQueryEngineConfig {
    const workspaceRoot = this.config.workspaceRoot;
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    return {
      // 基础配置
      workspaceRoot,
      workspaceFolders: workspaceFolders || [],
      cwd: this.config.workspaceRoot,
      extensionContext: this.config.extensionContext,
      
      // 核心依赖注入
      modelAdapter: this.config.modelAdapter,
      projectAnalyzer: {} as any, // TODO: Implement proper project analyzer
      promptEngine: {} as any, // TODO: Implement proper prompt engine
      toolRegistry: this.config.toolRegistry,
      
      // 输出通道
      // 对话配置
      conversationConfig: {
        maxHistoryLength: 20,
        systemPrompt: 'You are CodeMaster, an expert coding assistant with deep understanding of codebases and project structures.',
        includeThinking: true,
        thinkingConfig: {
          maxTokens: 1000,
          temperature: 0.3,
        },
      },
      
      // 编码特定配置
      enableCodeContextEnhancer: this.config.enableCodeContext,
      enableIntelligentToolParsing: this.config.enableIntelligentTools,
      enableEnhancedThinking: this.config.enableEnhancedThinking,
      enableStateMemory: this.config.enableStateMemory,
      
      // 代码分析配置
      maxFileSizeForAnalysis: this.config.maxFileSizeMB * 1024 * 1024,
      maxProjectDepth: 3,
      languageSupport: [
        'typescript',
        'javascript',
        'python',
        'java',
        'go',
        'rust',
        'cpp',
        'c',
        'csharp',
        'php',
        'ruby',
        'swift',
        'kotlin',
      ],
      
      // 工具配置
      codingToolCategories: [
        'code_analysis',
        'code_generation',
        'code_editing',
        'debugging',
        'testing',
        'project',
      ],
      
      // 性能配置
      cacheEnabled: this.config.cacheEnabled,
      cacheTTL: 300000, // 5分钟
      
      // 日志配置
      verboseLogging: this.config.verboseLogging,
    };
  }
  
  /**
   * 验证工具注册表
   */
  private async validateToolRegistry(): Promise<void> {
    const tools = this.config.toolRegistry.getAllTools();
    
    this.outputChannel.appendLine(`🔧 Validating tool registry: ${tools.length} tools`);
    
    // 检查关键编码工具
    const essentialTools = [
      'code_generator',
      'file_editor',
      'error_analyzer',
      'test_runner',
    ];
    
    const missingTools: string[] = [];
    for (const toolId of essentialTools) {
      try {
        const tool = this.config.toolRegistry.getTool(toolId);
        if (!tool) {
          missingTools.push(toolId);
        }
      } catch {
        missingTools.push(toolId);
      }
    }
    
    if (missingTools.length > 0) {
      this.outputChannel.appendLine(`⚠️ Missing essential tools: ${missingTools.join(', ')}`);
      this.outputChannel.appendLine(`   Some coding features may be limited`);
    } else {
      this.outputChannel.appendLine(`✅ All essential tools available`);
    }
  }
  
  /**
   * 获取内存统计
   */
  private getMemoryStats(): any {
    // 简化实现
    return {
      initialized: true,
      timestamp: Date.now(),
    };
  }
  
  /**
   * 获取Webview内容
   */
  private getWebviewContent(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeMaster Assistant</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            padding: 20px;
            background: #1e1e1e;
            color: #d4d4d4;
            line-height: 1.5;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          
          h1 {
            color: #569cd6;
            border-bottom: 2px solid #569cd6;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          
          .status {
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
          }
          
          .status-item {
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
          }
          
          .status-label {
            font-weight: bold;
            color: #9cdcfe;
          }
          
          .status-value {
            color: #ce9178;
          }
          
          .task-form {
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          textarea {
            width: 100%;
            height: 100px;
            background: #1e1e1e;
            color: #d4d4d4;
            border: 1px solid #3e3e42;
            border-radius: 3px;
            padding: 10px;
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
            margin-bottom: 10px;
          }
          
          button {
            background: #0e639c;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 8px 16px;
            font-size: 14px;
            cursor: pointer;
            margin-right: 10px;
          }
          
          button:hover {
            background: #1177bb;
          }
          
          button:disabled {
            background: #3e3e42;
            cursor: not-allowed;
          }
          
          .result {
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 5px;
            padding: 20px;
            margin-top: 20px;
            white-space: pre-wrap;
            font-family: 'Consolas', monospace;
            font-size: 13px;
            max-height: 400px;
            overflow-y: auto;
          }
          
          .result.success {
            border-left: 4px solid #6a9955;
          }
          
          .result.error {
            border-left: 4px solid #f44747;
          }
          
          .thinking {
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 5px;
            padding: 15px;
            margin-top: 10px;
            font-size: 12px;
            color: #808080;
          }
          
          .capabilities {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 15px;
          }
          
          .capability {
            background: #0e639c;
            color: white;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>CodeMaster Assistant</h1>
          
          <div class="status">
            <div class="status-item">
              <span class="status-label">Status:</span>
              <span id="status-value" class="status-value">Loading...</span>
            </div>
            <div class="status-item">
              <span class="status-label">Model:</span>
              <span id="model-value" class="status-value">-</span>
            </div>
            <div class="status-item">
              <span class="status-label">Tools:</span>
              <span id="tools-value" class="status-value">-</span>
            </div>
            <div id="capabilities-container" class="capabilities" style="display: none;">
              <!-- Capabilities will be populated by JavaScript -->
            </div>
          </div>
          
          <div class="task-form">
            <h2>Coding Task</h2>
            <textarea id="task-input" placeholder="Describe your coding task..."></textarea>
            <div>
              <button id="execute-btn" onclick="executeTask()">Execute Task</button>
              <button id="analyze-btn" onclick="analyzeCode()">Analyze Current File</button>
              <button onclick="refreshStatus()">Refresh Status</button>
            </div>
          </div>
          
          <div id="result-container" style="display: none;">
            <h2>Result</h2>
            <div id="result" class="result"></div>
          </div>
          
          <div id="thinking-container" style="display: none;">
            <h2>Thinking Process</h2>
            <div id="thinking" class="thinking"></div>
          </div>
        </div>
        
        <script>
          const vscode = acquireVsCodeApi();
          
          // 加载状态
          window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
              case 'statusResult':
                updateStatus(message.status);
                break;
                
              case 'taskResult':
                showResult(message.result);
                break;
                
              case 'analysisResult':
                showAnalysis(message.analysis);
                break;
            }
          });
          
          // 初始状态请求
          vscode.postMessage({ command: 'getStatus' });
          
          function updateStatus(status) {
            document.getElementById('status-value').textContent = 
              status.isInitialized ? 'Ready' : 'Not Initialized';
            document.getElementById('model-value').textContent = status.modelName;
            document.getElementById('tools-value').textContent = status.toolCount;
            
            // 更新能力标签
            const capabilitiesContainer = document.getElementById('capabilities-container');
            capabilitiesContainer.innerHTML = '';
            capabilitiesContainer.style.display = 'flex';
            
            status.capabilities.forEach(capability => {
              const capEl = document.createElement('span');
              capEl.className = 'capability';
              capEl.textContent = capability;
              capabilitiesContainer.appendChild(capEl);
            });
          }
          
          function executeTask() {
            const taskInput = document.getElementById('task-input');
            const task = taskInput.value.trim();
            
            if (!task) {
              alert('Please enter a task description');
              return;
            }
            
            document.getElementById('execute-btn').disabled = true;
            document.getElementById('execute-btn').textContent = 'Processing...';
            
            vscode.postMessage({
              command: 'executeTask',
              task: task,
            });
          }
          
          function analyzeCode() {
            document.getElementById('analyze-btn').disabled = true;
            document.getElementById('analyze-btn').textContent = 'Analyzing...';
            
            vscode.postMessage({
              command: 'analyzeCode',
            });
          }
          
          function refreshStatus() {
            vscode.postMessage({
              command: 'getStatus',
            });
          }
          
          function showResult(result) {
            // 重置按钮
            document.getElementById('execute-btn').disabled = false;
            document.getElementById('execute-btn').textContent = 'Execute Task';
            document.getElementById('analyze-btn').disabled = false;
            document.getElementById('analyze-btn').textContent = 'Analyze Current File';
            
            const resultContainer = document.getElementById('result-container');
            const resultEl = document.getElementById('result');
            const thinkingContainer = document.getElementById('thinking-container');
            const thinkingEl = document.getElementById('thinking');
            
            // 显示结果
            resultContainer.style.display = 'block';
            resultEl.className = result.success ? 'result success' : 'result error';
            
            if (result.success) {
              resultEl.textContent = result.response || 'Task completed successfully';
              
              // 显示思考过程
              if (result.thinking) {
                thinkingContainer.style.display = 'block';
                thinkingEl.textContent = result.thinking;
              } else {
                thinkingContainer.style.display = 'none';
              }
            } else {
              resultEl.textContent = 'Error: ' + (result.error || 'Unknown error');
              thinkingContainer.style.display = 'none';
            }
            
            // 滚动到结果
            resultContainer.scrollIntoView({ behavior: 'smooth' });
          }
          
          function showAnalysis(analysis) {
            // 重置按钮
            document.getElementById('analyze-btn').disabled = false;
            document.getElementById('analyze-btn').textContent = 'Analyze Current File';
            
            const resultContainer = document.getElementById('result-container');
            const resultEl = document.getElementById('result');
            const thinkingContainer = document.getElementById('thinking-container');
            
            // 显示分析结果
            resultContainer.style.display = 'block';
            resultEl.className = analysis.success ? 'result success' : 'result error';
            
            if (analysis.success) {
              resultEl.textContent = JSON.stringify(analysis.analysis, null, 2);
            } else {
              resultEl.textContent = 'Error: ' + (analysis.error || 'Unknown error');
            }
            
            thinkingContainer.style.display = 'none';
            
            // 滚动到结果
            resultContainer.scrollIntoView({ behavior: 'smooth' });
          }
        </script>
      </body>
      </html>
    `;
  }
}

// ==================== 实用函数 ====================

/**
 * 创建默认的CodeMaster集成配置
 */
export function createDefaultCodeMasterIntegration(
  extensionContext: vscode.ExtensionContext,
  modelAdapter: ModelAdapter,
  toolRegistry: EnhancedToolRegistry
): CodeMasterIntegrationConfig {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  const workspaceRoot = workspaceFolders?.[0]?.uri.fsPath || process.cwd();
  
  return {
    workspaceRoot,
    extensionContext,
    modelAdapter,
    toolRegistry,
    
    // 功能标志
    enableCodeContext: true,
    enableIntelligentTools: true,
    enableEnhancedThinking: true,
    enableStateMemory: true,
    
    // 性能配置
    cacheEnabled: true,
    maxFileSizeMB: 10,
    
    // 日志配置
    verboseLogging: false,
    logLevel: 'info',
  };
}

/**
 * 在CodeLine扩展中集成CodeMaster
 */
export async function integrateCodeMasterIntoCodeLine(
  extensionContext: vscode.ExtensionContext,
  existingEngine: any, // 现有的QueryEngine
  modelAdapter: ModelAdapter,
  toolRegistry: EnhancedToolRegistry
): Promise<{
  integration: CodeMasterIntegration;
  result: CodeMasterIntegrationResult;
  originalEngine: any;
}> {
  // 创建集成配置
  const config = createDefaultCodeMasterIntegration(
    extensionContext,
    modelAdapter,
    toolRegistry
  );
  
  // 创建集成管理器
  const integration = new CodeMasterIntegration(config);
  
  // 初始化
  const result = await integration.initialize();
  
  // 注册清理
  extensionContext.subscriptions.push({
    dispose: () => integration.dispose(),
  });
  
  return {
    integration,
    result,
    originalEngine: existingEngine,
  };
}

export default CodeMasterIntegration;