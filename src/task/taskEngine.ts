import * as vscode from 'vscode';
import { EnhancedProjectAnalyzer } from '../analyzer/enhancedProjectAnalyzer';
import { ProjectAnalyzer, ProjectContext } from '../analyzer/projectAnalyzer';
import { PromptEngine, PromptOptions } from '../prompt/promptEngine';
import { EnhancedPromptEngine } from '../prompt/enhancedPromptEngine';
import { ModelAdapter, ModelResponse } from '../models/modelAdapter';
import { FileManager, FileOperationResult, FileDiff } from '../file/fileManager';
import { TerminalExecutor, TerminalResult } from '../terminal/terminalExecutor';
import { BrowserAutomator, BrowserResult } from '../browser/browserAutomator';
import { ApprovalWorkflow, ApprovalItem, ApprovalType, ApprovalStatus, ApprovalResult } from '../workflow/approvalWorkflow';

export interface TaskResult {
  success: boolean;
  steps: TaskStep[];
  output: string;
  summary?: string;
  error?: string;
}

export interface TaskStep {
  type: 'file' | 'terminal' | 'browser' | 'mcp' | 'info';
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'approved' | 'rejected';
  result?: string;
  error?: string;
  data?: any;
}

export interface TaskContext {
  taskDescription: string;
  projectContext: ProjectContext;
  currentFile?: string;
  workspaceRoot: string;
  options: TaskOptions;
}

export interface TaskOptions {
  autoExecute?: boolean;
  requireApproval?: boolean;
  promptOptions?: PromptOptions;
}

export class TaskEngine {
  private projectAnalyzer: EnhancedProjectAnalyzer;
  private promptEngine: PromptEngine;
  private enhancedPromptEngine: EnhancedPromptEngine;
  private modelAdapter: ModelAdapter;
  private fileManager: FileManager;
  private terminalExecutor: TerminalExecutor;
  private browserAutomator: BrowserAutomator;
  
  private currentTask?: TaskContext;
  private steps: TaskStep[] = [];
  private isExecuting = false;
  private pendingDiffs: Map<string, FileDiff> = new Map(); // diffId -> FileDiff
  private approvalWorkflow: ApprovalWorkflow;
  
  constructor(
    projectAnalyzer: EnhancedProjectAnalyzer,
    promptEngine: PromptEngine,
    modelAdapter: ModelAdapter,
    fileManager: FileManager,
    terminalExecutor: TerminalExecutor,
    browserAutomator?: BrowserAutomator
  ) {
    this.projectAnalyzer = projectAnalyzer;
    this.promptEngine = promptEngine;
    this.enhancedPromptEngine = new EnhancedPromptEngine();
    this.modelAdapter = modelAdapter;
    this.fileManager = fileManager;
    this.terminalExecutor = terminalExecutor;
    this.browserAutomator = browserAutomator || new BrowserAutomator();
    this.approvalWorkflow = new ApprovalWorkflow();
  }
  
  /**
   * 分析项目上下文（使用增强分析如果可用）
   */
  private async analyzeProjectWithContext(currentFile?: string): Promise<any> {
    // 尝试使用增强分析
    if ('analyzeEnhancedWorkspace' in this.projectAnalyzer && 
        typeof (this.projectAnalyzer as any).analyzeEnhancedWorkspace === 'function') {
      try {
        const enhancedContext = await (this.projectAnalyzer as any).analyzeEnhancedWorkspace(currentFile);
        return enhancedContext;
      } catch (error) {
        console.warn('Enhanced analysis failed, falling back to basic analysis:', error);
      }
    }
    
    // 回退到基础分析
    return await this.projectAnalyzer.analyzeCurrentWorkspace();
  }
  
  /**
   * 开始处理一个新任务
   */
  public async startTask(taskDescription: string, options: TaskOptions = {}): Promise<TaskResult> {
    if (this.isExecuting) {
      return {
        success: false,
        steps: [],
        output: 'Another task is already executing',
        error: 'Task engine busy'
      };
    }
    
    // 检查是否是特殊命令
    const specialCommandResult = await this.handleSpecialCommand(taskDescription.trim());
    if (specialCommandResult) {
      return specialCommandResult;
    }
    
    try {
      this.isExecuting = true;
      this.steps = [];
      
      // 1. 分析项目上下文
      this.addStep('info', 'Analyzing project context...');
      // 获取当前活动文件（如果有）
      const currentFile = vscode.window.activeTextEditor?.document.uri.fsPath;
      const projectContext = await this.analyzeProjectWithContext(currentFile);
      
      // 2. 创建任务上下文
      this.currentTask = {
        taskDescription,
        projectContext,
        workspaceRoot: projectContext.rootPath,
        options: {
          autoExecute: true,
          requireApproval: true,
          promptOptions: {
            includeExamples: true,
            includeConstraints: true,
            includeBestPractices: true,
            language: projectContext.language
          },
          ...options
        }
      };
      
      // 3. 使用增强提示词引擎生成专业提示词（基于Qoder和Cline最佳实践）
      this.addStep('info', 'Generating task plan with enhanced Qoder/Cline prompt engineering...');
      const prompt = this.enhancedPromptEngine.generateEnhancedPrompt(
        taskDescription,
        projectContext,
        {
          includeSystemPrompt: true,
          includeContext: true,
          languageSpecific: true
        }
      );
      
      // 4. 调用AI模型生成任务计划
      this.addStep('info', 'Consulting AI assistant...');
      const aiResponse = await this.callAI(prompt);
      
      // 5. 解析AI响应为可执行步骤
      this.addStep('info', 'Parsing task plan...');
      const parsedSteps = this.parseAIResponse(aiResponse.content);
      
      // 6. 将步骤添加到任务中
      parsedSteps.forEach(step => this.steps.push(step));
      
      // 7. 如果需要自动执行，开始执行步骤
      let executionResult = '';
      if (this.currentTask.options.autoExecute) {
        executionResult = await this.executeSteps();
      }
      
      return {
        success: true,
        steps: this.steps,
        output: executionResult || 'Task planned successfully. Ready for execution.',
        error: undefined
      };
      
    } catch (error: any) {
      return {
        success: false,
        steps: this.steps,
        output: 'Task execution failed',
        error: error.message || 'Unknown error'
      };
    } finally {
      this.isExecuting = false;
    }
  }
  
  /**
   * 执行所有待处理的步骤
   */
  public async executeSteps(): Promise<string> {
    if (!this.currentTask) {
      throw new Error('No active task');
    }
    
    const results: string[] = [];
    
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      
      if (step.status !== 'pending') {
        continue;
      }
      
      // 更新步骤状态为执行中
      this.updateStepStatus(i, 'executing');
      
      try {
        let result = '';
        
        switch (step.type) {
          case 'file':
            result = await this.executeFileStep(step);
            break;
          case 'terminal':
            result = await this.executeTerminalStep(step);
            break;
          case 'browser':
            result = await this.executeBrowserStep(step);
            break;
          case 'info':
            // 信息步骤不执行实际操作
            result = step.description;
            break;
          default:
            result = `Unsupported step type: ${step.type}`;
        }
        
        step.result = result;
        this.updateStepStatus(i, 'completed');
        results.push(`Step ${i + 1}: ${step.description} - SUCCESS\n${result}`);
        
      } catch (error: any) {
        step.error = error.message;
        this.updateStepStatus(i, 'failed');
        results.push(`Step ${i + 1}: ${step.description} - FAILED\n${error.message}`);
        
        // 根据策略决定是否继续执行
        if (this.currentTask.options.requireApproval) {
          break; // 需要用户批准时，出错就停止
        }
      }
    }
    
    return results.join('\n\n');
  }
  
  /**
   * 获取当前任务状态
   */
  public getTaskStatus(): { isExecuting: boolean; steps: TaskStep[]; currentTask?: TaskContext } {
    return {
      isExecuting: this.isExecuting,
      steps: this.steps,
      currentTask: this.currentTask
    };
  }
  
  /**
   * 批准或拒绝一个步骤
   */
  public approveStep(stepIndex: number, approve: boolean): boolean {
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      return false;
    }
    
    const step = this.steps[stepIndex];
    if (step.status !== 'pending' && step.status !== 'executing') {
      return false;
    }
    
    this.updateStepStatus(stepIndex, approve ? 'approved' : 'rejected');
    return true;
  }

  /**
   * 批准或拒绝待处理的文件差异
   */
  public async approveDiff(diffId: string, action: 'approve' | 'reject'): Promise<{success: boolean; message: string; error?: string}> {
    if (!this.fileManager) {
      return {
        success: false,
        message: 'File manager not available',
        error: 'File manager not initialized'
      };
    }
    
    const diff = this.pendingDiffs.get(diffId);
    if (!diff) {
      return {
        success: false,
        message: `Diff not found: ${diffId}`,
        error: 'Diff not found'
      };
    }
    
    try {
      let result: FileOperationResult;
      
      if (action === 'approve') {
        // 批准更改：应用差异
        result = await this.fileManager.applyDiff(diff);
      } else {
        // 拒绝更改：回滚到原始内容
        result = await this.fileManager.revertDiff(diff);
      }
      
      // 清理已处理的差异
      this.pendingDiffs.delete(diffId);
      
      // 更新相关步骤状态
      const stepIndex = this.steps.findIndex(step => {
        const stepDiffId = step.description.replace(/\s+/g, '-').toLowerCase();
        return stepDiffId === diffId;
      });
      
      if (stepIndex >= 0) {
        this.updateStepStatus(stepIndex, action === 'approve' ? 'approved' : 'rejected');
      }
      
      return {
        success: result.success,
        message: result.message,
        error: result.error
      };
      
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to ${action} changes: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 获取所有待处理的差异
   */
  public getPendingDiffs(): Array<{diffId: string; diff: FileDiff}> {
    return Array.from(this.pendingDiffs.entries()).map(([diffId, diff]) => ({ diffId, diff }));
  }
  
  /**
   * 重置任务引擎
   */
  public reset(): void {
    this.currentTask = undefined;
    this.steps = [];
    this.pendingDiffs.clear();
    this.isExecuting = false;
  }
  
  /**
   * 处理特殊命令（以@开头的命令）
   */
  private async handleSpecialCommand(command: string): Promise<TaskResult | null> {
    if (!command.startsWith('@')) {
      return null;
    }
    
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    try {
      this.isExecuting = true;
      this.steps = [];
      
      switch (cmd) {
        case '@terminal':
        case '@term':
          return await this.handleTerminalCommand(args);
          
        case '@url':
        case '@browse':
          return await this.handleUrlCommand(args);
          
        case '@problems':
        case '@issues':
          return await this.handleProblemsCommand();
          
        case '@snapshot':
          return await this.handleSnapshotCommand();
          
        case '@help':
        case '@commands':
          return await this.handleHelpCommand();
          
        case '@model':
          return await this.handleModelCommand(args);
          
        default:
          return {
            success: false,
            steps: [],
            output: `Unknown special command: ${cmd}. Type @help for available commands.`,
            error: 'Unknown command'
          };
      }
    } catch (error: any) {
      return {
        success: false,
        steps: [],
        output: `Error executing special command: ${error.message}`,
        error: error.message
      };
    } finally {
      this.isExecuting = false;
    }
  }
  
  // ===== 特殊命令处理方法 =====
  
  private async handleTerminalCommand(command: string): Promise<TaskResult> {
    if (!command.trim()) {
      return {
        success: false,
        steps: [],
        output: 'Please provide a command to execute. Example: @terminal npm install',
        error: 'Missing command'
      };
    }
    
    this.addStep('terminal', `Execute command: ${command}`, { command });
    this.updateStepStatus(0, 'executing');
    
    try {
      if (!this.terminalExecutor) {
        throw new Error('Terminal executor not available');
      }
      
      const result = await this.terminalExecutor.executeCommand(command);
      const htmlReport = this.terminalExecutor.generateHtmlReport(result);
      
      this.updateStepStatus(0, result.success ? 'completed' : 'failed');
      
      return {
        success: result.success,
        steps: this.steps,
        output: htmlReport,
        summary: `Terminal command executed: ${result.success ? 'Success' : 'Failed'}`
      };
      
    } catch (error: any) {
      this.updateStepStatus(0, 'failed');
      throw error;
    }
  }
  
  private async handleUrlCommand(url: string): Promise<TaskResult> {
    if (!url.trim()) {
      return {
        success: false,
        steps: [],
        output: 'Please provide a URL to open. Example: @url https://github.com/openclaw/openclaw',
        error: 'Missing URL'
      };
    }
    
    this.addStep('browser', `Browse URL: ${url}`, { url });
    this.updateStepStatus(0, 'executing');
    
    try {
      if (!this.browserAutomator) {
        throw new Error('Browser automator not available');
      }
      
      // 执行简单的浏览器导航
      const result = await this.browserAutomator.executeSequence(url, [
        { type: 'navigate' as const }
      ]);
      
      const htmlReport = this.browserAutomator.generateHtmlReport(result);
      
      this.updateStepStatus(0, result.success ? 'completed' : 'failed');
      
      return {
        success: result.success,
        steps: this.steps,
        output: htmlReport,
        summary: `Browser automation: ${result.success ? 'Success' : 'Failed'}`
      };
    } catch (error: any) {
      this.updateStepStatus(0, 'failed');
      throw error;
    }
  }
  
  private async handleProblemsCommand(): Promise<TaskResult> {
    this.addStep('info', 'Scanning for problems in workspace');
    this.updateStepStatus(0, 'executing');
    
    try {
      // 分析项目问题（使用增强分析）
      const projectContext = await this.analyzeProjectWithContext();
      
      // 简单的问题检测
      const problems: string[] = [];
      
      // 检查package.json是否存在
      const packageJson = projectContext.files.find((f: string) => f.endsWith('/package.json') || f === 'package.json');
      if (!packageJson) {
        problems.push('No package.json found - this may not be a Node.js project');
      }
      
      // 检查常用文件
      const hasSrc = projectContext.files.some((f: string) => f.includes('src/'));
      if (!hasSrc) {
        problems.push('No src/ directory found - consider organizing code in src/');
      }
      
      // 检查TypeScript配置文件
      const hasTsConfig = projectContext.files.some((f: string) => f.endsWith('/tsconfig.json') || f === 'tsconfig.json');
      const hasTypeScriptFiles = projectContext.files.some((f: string) => f.endsWith('.ts'));
      if (!hasTsConfig && hasTypeScriptFiles) {
        problems.push('TypeScript files found but no tsconfig.json - TypeScript compilation may fail');
      }
      
      // 如果使用增强分析，检查代码质量问题
      let enhancedProblems: string[] = [];
      if (projectContext.codeQuality) {
        const codeQuality = projectContext.codeQuality;
        
        // 基于代码质量评分
        if (codeQuality.overallScore < 50) {
          enhancedProblems.push(`Low code quality score: ${codeQuality.overallScore.toFixed(1)}/100 - consider refactoring`);
        } else if (codeQuality.overallScore < 70) {
          enhancedProblems.push(`Moderate code quality score: ${codeQuality.overallScore.toFixed(1)}/100 - room for improvement`);
        }
        
        // 检查高复杂度
        if (codeQuality.metrics.complexity > 15) {
          enhancedProblems.push(`High code complexity: ${codeQuality.metrics.complexity.toFixed(2)} - consider simplifying complex functions`);
        }
        
        // 检查高重复率
        if (codeQuality.metrics.duplicationRate > 0.2) {
          enhancedProblems.push(`High code duplication: ${(codeQuality.metrics.duplicationRate * 100).toFixed(1)}% - consider extracting common code`);
        }
        
        // 添加具体的代码问题
        if (codeQuality.issues && codeQuality.issues.length > 0) {
          const highSeverityIssues = codeQuality.issues.filter((issue: any) => issue.severity === 'high');
          const mediumSeverityIssues = codeQuality.issues.filter((issue: any) => issue.severity === 'medium');
          
          if (highSeverityIssues.length > 0) {
            enhancedProblems.push(`Found ${highSeverityIssues.length} high-severity code issues - review recommended`);
          }
          if (mediumSeverityIssues.length > 0) {
            enhancedProblems.push(`Found ${mediumSeverityIssues.length} medium-severity code issues`);
          }
        }
        
        // 添加重构建议
        if (codeQuality.suggestions && codeQuality.suggestions.length > 0) {
          const highConfidenceSuggestions = codeQuality.suggestions.filter((suggestion: any) => suggestion.confidence > 0.7);
          if (highConfidenceSuggestions.length > 0) {
            enhancedProblems.push(`${highConfidenceSuggestions.length} high-confidence refactoring suggestions available`);
          }
        }
        
        // 架构模式警告
        if (projectContext.architecturePatterns && projectContext.architecturePatterns.length > 0) {
          const patternNames = projectContext.architecturePatterns.map((pattern: any) => pattern.name).join(', ');
          enhancedProblems.push(`Detected architecture patterns: ${patternNames}`);
        }
      }
      
      // 合并问题列表
      const allProblems = [...problems, ...enhancedProblems];
      
      this.updateStepStatus(0, 'completed');
      
      const problemsHtml = allProblems.length > 0 ? 
        `<div class="problems-list">
          <h4>⚠️ Found ${allProblems.length} potential issue${allProblems.length > 1 ? 's' : ''}:</h4>
          <ul>
            ${allProblems.map(p => `<li>${p}</li>`).join('')}
          </ul>
         </div>` :
        `<div class="success-message">✅ No obvious problems found in workspace.</div>`;
      
      return {
        success: true,
        steps: this.steps,
        output: `**Workspace Analysis**\n\n${problemsHtml}\n\n*Analyzed ${projectContext.files.length} files in workspace.*`,
        summary: `Found ${allProblems.length} potential problems`
      };
      
    } catch (error: any) {
      this.updateStepStatus(0, 'failed');
      throw error;
    }
  }
  
  private async handleSnapshotCommand(): Promise<TaskResult> {
    this.addStep('info', 'Creating workspace snapshot');
    this.updateStepStatus(0, 'executing');
    
    try {
      const projectContext = await this.analyzeProjectWithContext();
      
      this.updateStepStatus(0, 'completed');
      
      const fileTypes: Record<string, number> = {};
      projectContext.files.forEach((filePath: string) => {
        const fileName = filePath.split('/').pop() || filePath;
        const ext = fileName.includes('.') ? fileName.split('.').pop() || 'other' : 'no-extension';
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      });
      
      const fileTypeSummary = Object.entries(fileTypes)
        .map(([ext, count]) => `${ext}: ${count}`)
        .join(', ');
      
      // 从根路径提取工作区名称
      const workspaceName = projectContext.rootPath.split('/').pop() || 'workspace';
      
      return {
        success: true,
        steps: this.steps,
        output: `**Workspace Snapshot**\n\n📊 **Summary**\n- Total files: ${projectContext.files.length}\n- File types: ${fileTypeSummary}\n- Workspace: ${workspaceName}\n\n*Note: Full snapshot functionality with save/restore is not yet implemented.*`,
        summary: `Created snapshot of ${projectContext.files.length} files`
      };
    } catch (error: any) {
      this.updateStepStatus(0, 'failed');
      throw error;
    }
  }
  
  private async handleHelpCommand(): Promise<TaskResult> {
    const commands = [
      { command: '@terminal <command>', description: 'Execute terminal command' },
      { command: '@term <command>', description: 'Alias for @terminal' },
      { command: '@url <url>', description: 'Open URL in browser (browser automation required)' },
      { command: '@problems', description: 'Scan workspace for potential issues' },
      { command: '@issues', description: 'Alias for @problems' },
      { command: '@snapshot', description: 'Create workspace snapshot' },
      { command: '@model', description: 'Show current AI model configuration' },
      { command: '@help', description: 'Show this help message' },
      { command: '@commands', description: 'Alias for @help' }
    ];
    
    const commandsHtml = `
<div class="special-commands-help">
  <h3>📋 Special Commands</h3>
  <p>These commands start with <code>@</code> and provide quick access to specific features:</p>
  <table class="commands-table">
    <thead>
      <tr>
        <th>Command</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      ${commands.map(cmd => `
        <tr>
          <td><code>${cmd.command}</code></td>
          <td>${cmd.description}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <p><em>Regular task descriptions (without @) will be processed by AI for multi-step execution.</em></p>
</div>`;
    
    return {
      success: true,
      steps: [],
      output: commandsHtml,
      summary: 'Special commands help'
    };
  }
  
  private async handleModelCommand(args: string): Promise<TaskResult> {
    try {
      const config = this.modelAdapter.getConfiguration();
      const modelInfo = this.modelAdapter.getModelInfo();
      const isReady = this.modelAdapter.isReady();
      
      const modelHtml = `
<div class="model-info-card">
  <h3>🤖 AI Model Configuration</h3>
  <table>
    <tr><th>Status:</th><td><span class="${isReady ? 'status-ready' : 'status-not-ready'}">${isReady ? '✅ Ready' : '⚠️ Not Configured'}</span></td></tr>
    <tr><th>Model:</th><td><code>${config.model || 'Not set'}</code></td></tr>
    <tr><th>Base URL:</th><td><code>${config.baseUrl || '(default)'}</code></td></tr>
    <tr><th>API Key:</th><td><code>${config.apiKey ? '••••••••' : 'Not set'}</code></td></tr>
    <tr><th>Temperature:</th><td>${config.temperature || 0.7}</td></tr>
    <tr><th>Model Info:</th><td>${modelInfo}</td></tr>
  </table>
  ${!isReady ? '<p class="warning">⚠️ Please configure API key in settings to use AI features.</p>' : ''}
</div>`;
      
      return {
        success: true,
        steps: [],
        output: modelHtml,
        summary: 'Model configuration information'
      };
    } catch (error: any) {
      return {
        success: false,
        steps: [],
        output: `Error fetching model info: ${error.message}`,
        error: error.message
      };
    }
  }
  
  // ===== 私有方法 =====
  
  private addStep(type: TaskStep['type'], description: string, data?: any): void {
    this.steps.push({
      type,
      description,
      status: 'pending',
      data
    });
  }
  
  private updateStepStatus(index: number, status: TaskStep['status']): void {
    if (index >= 0 && index < this.steps.length) {
      this.steps[index].status = status;
      
      // 通知UI更新
      this.notifyUI('stepUpdated', {
        index,
        step: this.steps[index]
      });
    }
  }
  
  private async callAI(prompt: string): Promise<ModelResponse> {
    if (!this.modelAdapter.isReady()) {
      throw new Error('AI model not configured. Please set up API key in settings.');
    }
    
    // 增强提示词，要求AI以结构化方式响应
    const structuredPrompt = `
${prompt}

请以结构化格式返回任务计划，每个步骤包含以下信息：
1. 步骤类型 (file/terminal/browser/info)
2. 步骤描述
3. 具体操作内容（如果是文件操作，请提供完整代码）

格式示例：
步骤1: [file] 创建用户服务类
- 文件路径: src/services/UserService.java
- 代码内容: [完整的Java代码]

步骤2: [terminal] 运行单元测试
- 命令: mvn test -Dtest=UserServiceTest

步骤3: [info] 验证实现
- 检查: 确保API端点正常工作
`;
    
    return await this.modelAdapter.generate(structuredPrompt);
  }
  
  private parseAIResponse(response: string): TaskStep[] {
    const steps: TaskStep[] = [];
    const lines = response.split('\n');
    
    let currentStep: Partial<TaskStep> | null = null;
    
    for (const line of lines) {
      const stepMatch = line.match(/步骤(\d+):\s*\[(\w+)\]\s*(.+)/i);
      if (stepMatch) {
        // 保存上一个步骤
        if (currentStep && currentStep.type && currentStep.description) {
          steps.push(currentStep as TaskStep);
        }
        
        // 开始新步骤
        currentStep = {
          type: stepMatch[2] as TaskStep['type'],
          description: stepMatch[3].trim(),
          status: 'pending'
        };
        continue;
      }
      
      // 解析步骤详情
      if (currentStep) {
        const filePathMatch = line.match(/文件路径:\s*(.+)/i);
        if (filePathMatch) {
          currentStep.data = { ...currentStep.data, filePath: filePathMatch[1].trim() };
        }
        
        const commandMatch = line.match(/命令:\s*(.+)/i);
        if (commandMatch) {
          currentStep.data = { ...currentStep.data, command: commandMatch[1].trim() };
        }
        
        // 检测代码块开始
        if (line.includes('代码内容:') || line.includes('代码:')) {
          currentStep.data = { ...currentStep.data, codeContent: '' };
        } else if (currentStep.data?.codeContent !== undefined) {
          // 收集代码内容
          currentStep.data.codeContent += line + '\n';
        }
      }
    }
    
    // 添加最后一个步骤
    if (currentStep && currentStep.type && currentStep.description) {
      steps.push(currentStep as TaskStep);
    }
    
    // 如果没有解析到结构化步骤，回退到简单处理
    if (steps.length === 0) {
      steps.push({
        type: 'info',
        description: 'AI response processing',
        status: 'pending',
        data: { rawResponse: response }
      });
    }
    
    return steps;
  }
  
  private async executeFileStep(step: TaskStep): Promise<string> {
    if (!this.fileManager) {
      throw new Error('File manager not available');
    }
    
    const { filePath, codeContent } = step.data || {};
    
    if (!filePath || !codeContent) {
      throw new Error('File step missing filePath or codeContent');
    }
    
    // 检查文件是否存在
    const exists = await this.fileManager.fileExists(filePath);
    
    let result: FileOperationResult;
    
    if (exists) {
      // 编辑现有文件
      result = await this.fileManager.editFileWithDiff(filePath, codeContent);
    } else {
      // 创建新文件
      result = await this.fileManager.createFile(filePath, codeContent);
    }
    
    // 生成Cline风格的差异显示
    if (result.diff) {
      const diffId = step.description.replace(/\s+/g, '-').toLowerCase();
      
      // 存储待处理的差异
      this.pendingDiffs.set(diffId, result.diff);
      
      const diffHtml = this.fileManager.generateHtmlDiff(result.diff);
      
      // 包装成完整的差异组件，包含批准/拒绝按钮
      const fullDiffHtml = `
<div class="diff-container">
  <div class="diff-header">
    <div>
      <h3>${result.diff.filePath}</h3>
      <div class="diff-summary">${result.diff.summary}</div>
    </div>
    <div class="diff-actions">
      <button class="diff-action-btn diff-approve" data-file-path="${result.diff.filePath}" data-diff-id="${diffId}">
        ✓ Approve
      </button>
      <button class="diff-action-btn diff-reject" data-file-path="${result.diff.filePath}" data-diff-id="${diffId}">
        ✗ Reject
      </button>
    </div>
  </div>
  ${diffHtml}
</div>`;
      
      return `${result.message}\n\n${fullDiffHtml}`;
    }
    
    return result.message;
  }
  
  private async executeTerminalStep(step: TaskStep): Promise<string> {
    const { command } = step.data || {};
    
    if (!command) {
      throw new Error('Terminal step missing command');
    }
    
    if (!this.terminalExecutor) {
      throw new Error('Terminal executor not available');
    }
    
    // 检查命令安全性
    if (!this.terminalExecutor.isSafeCommand(command)) {
      throw new Error(`Potentially dangerous command detected: ${command}`);
    }
    
    try {
      // 执行命令
      const result = await this.terminalExecutor.executeCommand(command, {
        cwd: this.currentTask?.workspaceRoot,
        onOutput: (output) => {
          // 实时输出可以发送到UI
          // 这里可以调用notifyUI('terminal_output', { command, output })
        }
      });
      
      // 生成HTML报告
      const htmlReport = this.terminalExecutor.generateHtmlReport(result);
      
      // 更新步骤数据
      step.data = { ...step.data, result };
      
      return htmlReport;
      
    } catch (error: any) {
      throw new Error(`Terminal execution failed: ${error.message}`);
    }
  }
  
  private async executeBrowserStep(step: TaskStep): Promise<string> {
    const { url, actions } = step.data || {};
    
    if (!url) {
      throw new Error('Browser step missing URL');
    }
    
    if (!this.browserAutomator) {
      throw new Error('Browser automator not available');
    }
    
    try {
      // 执行浏览器自动化序列
      const actionsToExecute = actions || [{ type: 'navigate' as const, url }];
      const result = await this.browserAutomator.executeSequence(url, actionsToExecute);
      
      // 生成HTML报告
      const htmlReport = this.browserAutomator.generateHtmlReport(result);
      
      // 更新步骤数据
      step.data = { ...step.data, result };
      
      return htmlReport;
      
    } catch (error: any) {
      throw new Error(`Browser automation failed: ${error.message}`);
    }
  }
  
  private notifyUI(event: string, data: any): void {
    // 通过vscode.postMessage通知Webview
    // 需要在Extension中设置事件转发
  }
  
  // ===== Approval Workflow Methods =====
  
  /**
   * 提议一个操作到批准工作流
   */
  public proposeOperationApproval(
    type: ApprovalType,
    description: string,
    data: any,
    options: { autoExecute?: boolean; taskId?: string; tags?: string[] } = {}
  ): string {
    const itemId = this.approvalWorkflow.proposeOperation(
      type,
      description,
      data,
      {
        autoExecute: options.autoExecute,
        autoApproveDelay: options.autoExecute ? 0 : undefined
      }
    );
    
    // 更新相关步骤状态（如果有关联）
    const stepIndex = this.steps.findIndex(step => 
      step.description.includes(description.substring(0, 50))
    );
    
    if (stepIndex >= 0) {
      this.updateStepStatus(stepIndex, 'pending');
    }
    
    return itemId;
  }
  
  /**
   * 获取所有待批准的项
   */
  public getPendingApprovals(): ApprovalItem[] {
    return this.approvalWorkflow.getPendingItems();
  }
  
  /**
   * 获取批准历史
   */
  public getApprovalHistory(limit?: number): ApprovalItem[] {
    return this.approvalWorkflow.getHistory(limit);
  }
  
  /**
   * 批准一个操作
   */
  public async approveOperation(itemId: string, reason?: string): Promise<ApprovalResult> {
    const result = await this.approvalWorkflow.approveItem(itemId, { reason });
    
    // 如果操作需要执行，在此处执行
    const item = this.approvalWorkflow.getHistory().find(i => i.id === itemId);
    if (item && item.status === 'approved') {
      // 标记为已执行（实际执行在executeSteps中处理）
      this.approvalWorkflow.markAsExecuted(itemId, { executed: true });
    }
    
    return result;
  }
  
  /**
   * 拒绝一个操作
   */
  public async rejectOperation(itemId: string, reason?: string): Promise<ApprovalResult> {
    return await this.approvalWorkflow.rejectItem(itemId, { reason });
  }
  
  /**
   * 批量批准操作
   */
  public async approveOperations(itemIds: string[], reason?: string): Promise<ApprovalResult[]> {
    return await this.approvalWorkflow.approveItems(itemIds, reason);
  }
  
  /**
   * 批量拒绝操作
   */
  public async rejectOperations(itemIds: string[], reason?: string): Promise<ApprovalResult[]> {
    return await this.approvalWorkflow.rejectItems(itemIds, reason);
  }
  
  /**
   * 获取批准工作流实例（用于UI集成）
   */
  public getApprovalWorkflow(): ApprovalWorkflow {
    return this.approvalWorkflow;
  }
  
  /**
   * 生成待批准项的HTML摘要
   */
  public generateApprovalsHtml(): string {
    const pending = this.getPendingApprovals();
    
    if (pending.length === 0) {
      return '<div class="no-pending-approvals">✅ No pending approvals</div>';
    }
    
    const itemsHtml = pending.map(item => 
      this.approvalWorkflow.generateHtmlSummary(item)
    ).join('');
    
    return `
      <div class="approvals-container">
        <h3>⏳ Pending Approvals (${pending.length})</h3>
        <div class="approvals-list">
          ${itemsHtml}
        </div>
        <div class="approvals-actions">
          <button class="approve-all-btn" data-action="approve-all">✅ Approve All</button>
          <button class="reject-all-btn" data-action="reject-all">❌ Reject All</button>
        </div>
      </div>
    `;
  }
}