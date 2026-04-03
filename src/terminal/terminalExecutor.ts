import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as os from 'os';

export interface TerminalResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
  duration?: number;
  command: string;
  timestamp: Date;
}

export interface TerminalOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeout?: number; // 毫秒
  shell?: boolean;
  // 实时输出回调
  onOutput?: (data: string) => void;
  onError?: (data: string) => void;
  // 批量执行选项
  stopOnError?: boolean;
  updateCwd?: boolean;
}

export class TerminalExecutor {
  private outputChannel: vscode.OutputChannel;
  private currentProcess?: cp.ChildProcess;
  private isExecuting = false;
  
  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('CodeLine Terminal');
  }
  
  /**
   * 执行终端命令
   */
  public async executeCommand(command: string, options: TerminalOptions = {}): Promise<TerminalResult> {
    if (this.isExecuting) {
      return {
        success: false,
        output: '',
        error: 'Another command is already executing',
        command,
        timestamp: new Date()
      };
    }
    
    const startTime = Date.now();
    this.isExecuting = true;
    
    try {
      this.outputChannel.show(true);
      this.outputChannel.appendLine(`$ ${command}`);
      this.outputChannel.appendLine('---');
      
      const result = await this.spawnProcess(command, options);
      const duration = Date.now() - startTime;
      
      this.outputChannel.appendLine('---');
      this.outputChannel.appendLine(`Exit code: ${result.exitCode}, Duration: ${duration}ms`);
      
      return {
        success: result.exitCode === 0,
        output: result.output,
        error: result.error,
        exitCode: result.exitCode,
        duration,
        command,
        timestamp: new Date()
      };
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        output: '',
        error: error.message,
        command,
        duration,
        timestamp: new Date()
      };
    } finally {
      this.isExecuting = false;
    }
  }
  
  /**
   * 批量执行命令
   */
  public async executeCommands(commands: string[], options: TerminalOptions = {}): Promise<TerminalResult[]> {
    const results: TerminalResult[] = [];
    
    for (const command of commands) {
      try {
        const result = await this.executeCommand(command, options);
        results.push(result);
        
        // 如果命令失败，可以选择停止执行后续命令
        if (!result.success && options.stopOnError !== false) {
          break;
        }
        
        // 更新工作目录（如果有变化）
        if (result.success && options.updateCwd && result.output.trim()) {
          // 可以解析输出更新cwd，这里简化处理
        }
      } catch (error: any) {
        results.push({
          success: false,
          output: '',
          error: error.message,
          command,
          timestamp: new Date()
        });
        break;
      }
    }
    
    return results;
  }
  
  /**
   * 停止当前执行的命令
   */
  public stopCurrentCommand(): boolean {
    if (this.currentProcess && !this.currentProcess.killed) {
      this.currentProcess.kill('SIGTERM');
      this.outputChannel.appendLine('\n[Command terminated by user]');
      return true;
    }
    return false;
  }
  
  /**
   * 检查命令是否安全可执行
   */
  public isSafeCommand(command: string): boolean {
    const dangerousCommands = [
      'rm -rf /',
      'rm -rf /*',
      'dd if=/dev/zero',
      'mkfs',
      'format',
      'chmod -R 777 /',
      'chown -R root:root /',
      ':(){ :|:& };:'
    ];
    
    const lowerCommand = command.toLowerCase();
    return !dangerousCommands.some(dangerous => lowerCommand.includes(dangerous));
  }
  
  /**
   * 执行命令前请求用户确认（对于高风险命令）
   */
  public async requestConfirmation(command: string): Promise<boolean> {
    if (!this.isSafeCommand(command)) {
      const result = await vscode.window.showWarningMessage(
        `This command appears to be dangerous: ${command}`,
        { modal: true },
        'Execute Anyway',
        'Cancel'
      );
      return result === 'Execute Anyway';
    }
    
    // 对于其他命令，显示确认对话框
    const result = await vscode.window.showInformationMessage(
      `Execute command: ${command}`,
      'Execute',
      'Cancel'
    );
    return result === 'Execute';
  }
  
  /**
   * 获取系统信息
   */
  public getSystemInfo(): {
    platform: string;
    arch: string;
    cpus: number;
    memory: string;
    shell: string;
  } {
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
      shell: process.env.SHELL || (os.platform() === 'win32' ? 'cmd.exe' : 'bash')
    };
  }
  
  /**
   * 分析命令输出，提取关键信息
   */
  public analyzeOutput(output: string): {
    hasErrors: boolean;
    errorCount: number;
    warningCount: number;
    suggestions: string[];
  } {
    const lines = output.split('\n');
    let hasErrors = false;
    let errorCount = 0;
    let warningCount = 0;
    const suggestions: string[] = [];
    
    // 简单的错误和警告检测
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('error') || lowerLine.includes('failed') || lowerLine.includes('exception')) {
        hasErrors = true;
        errorCount++;
        
        // 根据错误类型提供建议
        if (lowerLine.includes('permission denied')) {
          suggestions.push('Try running with sudo or check file permissions');
        } else if (lowerLine.includes('command not found')) {
          suggestions.push('Check if the command is installed and in PATH');
        } else if (lowerLine.includes('no such file or directory')) {
          suggestions.push('Check if the file path exists');
        }
      } else if (lowerLine.includes('warning')) {
        warningCount++;
      }
    }
    
    return {
      hasErrors,
      errorCount,
      warningCount,
      suggestions
    };
  }
  
  /**
   * 生成命令执行的HTML报告
   */
  public generateHtmlReport(result: TerminalResult): string {
    const analysis = this.analyzeOutput(result.output + (result.error || ''));
    const statusClass = result.success ? 'terminal-success' : 'terminal-error';
    const statusIcon = result.success ? '✅' : '❌';
    
    return `
<div class="terminal-result ${statusClass}">
  <div class="terminal-header">
    <h3>${statusIcon} Terminal Command</h3>
    <div class="terminal-meta">
      <span>Exit code: ${result.exitCode ?? 'N/A'}</span>
      <span>Duration: ${result.duration ?? 0}ms</span>
      <span>${result.timestamp.toLocaleTimeString()}</span>
    </div>
  </div>
  
  <div class="terminal-command">
    <code>$ ${result.command}</code>
  </div>
  
  <div class="terminal-output">
    <pre>${this.escapeHtml(result.output || '(no output)')}</pre>
  </div>
  
  ${result.error ? `
  <div class="terminal-error-output">
    <h4>Error Output:</h4>
    <pre>${this.escapeHtml(result.error)}</pre>
  </div>
  ` : ''}
  
  <div class="terminal-analysis">
    <h4>Analysis:</h4>
    <ul>
      <li>Errors: ${analysis.errorCount}</li>
      <li>Warnings: ${analysis.warningCount}</li>
      ${analysis.suggestions.length > 0 ? `
      <li>Suggestions:</li>
      <ul>
        ${analysis.suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
      ` : ''}
    </ul>
  </div>
</div>`;
  }
  
  // ===== 私有方法 =====
  
  private async spawnProcess(command: string, options: TerminalOptions): Promise<{
    output: string;
    error: string;
    exitCode: number;
  }> {
    return new Promise((resolve, reject) => {
      const cwd = options.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
      const env = { ...process.env, ...options.env };
      const shell = options.shell ?? true;
      
      this.currentProcess = cp.spawn(command, {
        cwd,
        env,
        shell,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let error = '';
      
      // 实时输出处理
      this.currentProcess.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        
        // 输出到VS Code输出面板
        this.outputChannel.append(text);
        
        // 实时回调（用于UI更新）
        if (options.onOutput) {
          options.onOutput(text);
        }
      });
      
      this.currentProcess.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        error += text;
        
        // 错误输出到VS Code输出面板
        this.outputChannel.append(text);
        
        // 实时回调
        if (options.onError) {
          options.onError(text);
        } else if (options.onOutput) {
          options.onOutput(text);
        }
      });
      
      this.currentProcess.on('close', (code) => {
        this.currentProcess = undefined;
        resolve({
          output: output.trim(),
          error: error.trim(),
          exitCode: code ?? 0
        });
      });
      
      this.currentProcess.on('error', (err) => {
        this.currentProcess = undefined;
        reject(err);
      });
      
      // 设置超时
      if (options.timeout) {
        setTimeout(() => {
          if (this.currentProcess && !this.currentProcess.killed) {
            this.currentProcess.kill('SIGTERM');
            reject(new Error(`Command timed out after ${options.timeout}ms`));
          }
        }, options.timeout);
      }
    });
  }
  
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}