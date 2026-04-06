/**
 * TerminalProcess - 终端进程执行器
 * 提供流式命令执行、输出捕获和进程管理
 */

import * as child_process from 'child_process';
import * as vscode from 'vscode';
import { EventEmitter } from 'events';

/**
 * 终端进程配置
 */
export interface TerminalProcessConfig {
  command: string;
  args?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  timeout?: number; // 毫秒
  shell?: boolean | string;
  maxBuffer?: number;
  encoding?: BufferEncoding;
  killSignal?: NodeJS.Signals;
  uid?: number;
  gid?: number;
}

/**
 * 进程输出事件
 */
export interface ProcessOutputEvent {
  type: 'stdout' | 'stderr';
  data: string;
  timestamp: Date;
}

/**
 * 进程状态
 */
export enum ProcessState {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

/**
 * 进程结果
 */
export interface ProcessResult {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  duration: number; // 毫秒
  state: ProcessState;
  error?: Error;
}

/**
 * 终端进程类
 */
export class TerminalProcess extends EventEmitter {
  private process: child_process.ChildProcess | null = null;
  private config: TerminalProcessConfig;
  private state: ProcessState = ProcessState.PENDING;
  private startTime: Date | null = null;
  private endTime: Date | null = null;
  private stdout = '';
  private stderr = '';
  private timeoutId: NodeJS.Timeout | null = null;
  private isDisposed = false;

  constructor(config: TerminalProcessConfig) {
    super();
    this.config = {
      shell: true,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024, // 1MB
      ...config
    };
  }

  /**
   * 启动进程
   */
  public start(): Promise<ProcessResult> {
    if (this.state !== ProcessState.PENDING) {
      return Promise.reject(new Error(`Process already ${this.state}`));
    }

    return new Promise((resolve, reject) => {
      try {
        this.startTime = new Date();
        this.state = ProcessState.RUNNING;
        
        // 设置超时
        if (this.config.timeout && this.config.timeout > 0) {
          this.timeoutId = setTimeout(() => {
            this.handleTimeout();
          }, this.config.timeout);
        }

        // 启动进程
        this.process = child_process.spawn(
          this.config.command,
          this.config.args || [],
          {
            cwd: this.config.cwd,
            env: { ...process.env, ...this.config.env },
            shell: this.config.shell,
            stdio: ['pipe', 'pipe', 'pipe']
          }
        );

        // 捕获输出
        this.process.stdout?.on('data', (data: Buffer) => {
          const output = data.toString(this.config.encoding);
          this.stdout += output;
          this.emit('output', {
            type: 'stdout',
            data: output,
            timestamp: new Date()
          } as ProcessOutputEvent);
        });

        this.process.stderr?.on('data', (data: Buffer) => {
          const output = data.toString(this.config.encoding);
          this.stderr += output;
          this.emit('output', {
            type: 'stderr',
            data: output,
            timestamp: new Date()
          } as ProcessOutputEvent);
        });

        // 进程结束
        this.process.on('close', (exitCode: number | null, signal: NodeJS.Signals | null) => {
          this.handleClose(exitCode, signal);
          resolve(this.getResult());
        });

        this.process.on('error', (error: Error) => {
          this.handleError(error);
          reject(error);
        });

        // 发出启动事件
        this.emit('start', { pid: this.process.pid, command: this.config.command });
      } catch (error) {
        this.handleError(error as Error);
        reject(error);
      }
    });
  }

  /**
   * 停止进程
   */
  public stop(signal: NodeJS.Signals = 'SIGTERM'): boolean {
    if (!this.process || this.state !== ProcessState.RUNNING) {
      return false;
    }

    try {
      this.process.kill(signal);
      this.state = ProcessState.CANCELLED;
      this.cleanup();
      this.emit('cancelled', { signal });
      return true;
    } catch (error) {
      console.error('Failed to stop process:', error);
      return false;
    }
  }

  /**
   * 获取进程状态
   */
  public getState(): ProcessState {
    return this.state;
  }

  /**
   * 获取进程ID
   */
  public getPid(): number | null {
    return this.process?.pid ?? null;
  }

  /**
   * 获取输出
   */
  public getOutput(): { stdout: string; stderr: string } {
    return {
      stdout: this.stdout,
      stderr: this.stderr
    };
  }

  /**
   * 获取运行时间
   */
  public getDuration(): number | null {
    if (!this.startTime) return null;
    const end = this.endTime || new Date();
    return end.getTime() - this.startTime.getTime();
  }

  /**
   * 写入输入（如果进程支持）
   */
  public writeInput(data: string): boolean {
    if (!this.process || !this.process.stdin || this.state !== ProcessState.RUNNING) {
      return false;
    }

    try {
      this.process.stdin.write(data);
      return true;
    } catch (error) {
      console.error('Failed to write to stdin:', error);
      return false;
    }
  }

  /**
   * 关闭输入流
   */
  public endInput(): boolean {
    if (!this.process || !this.process.stdin || this.state !== ProcessState.RUNNING) {
      return false;
    }

    try {
      this.process.stdin.end();
      return true;
    } catch (error) {
      console.error('Failed to end stdin:', error);
      return false;
    }
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.isDisposed) return;
    
    this.stop();
    this.cleanup();
    
    this.removeAllListeners();
    this.isDisposed = true;
  }

  // ==================== 私有方法 ====================

  private handleClose(exitCode: number | null, signal: NodeJS.Signals | null): void {
    this.endTime = new Date();
    this.cleanupTimeout();
    
    if (this.state === ProcessState.CANCELLED) {
      // 已处理取消
      return;
    }
    
    this.state = exitCode === 0 ? ProcessState.COMPLETED : ProcessState.FAILED;
    
    this.emit('close', { exitCode, signal, duration: this.getDuration() });
  }

  private handleError(error: Error): void {
    this.endTime = new Date();
    this.state = ProcessState.FAILED;
    this.cleanupTimeout();
    
    this.emit('error', error);
  }

  private handleTimeout(): void {
    this.endTime = new Date();
    this.state = ProcessState.TIMEOUT;
    
    // 尝试终止进程
    if (this.process) {
      this.process.kill('SIGKILL');
    }
    
    this.cleanup();
    this.emit('timeout', { duration: this.getDuration() });
  }

  private cleanup(): void {
    this.cleanupTimeout();
    
    if (this.process) {
      // 移除事件监听器以避免内存泄漏
      this.process.removeAllListeners();
      this.process = null;
    }
  }

  private cleanupTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private getResult(): ProcessResult {
    const duration = this.getDuration() || 0;
    
    return {
      exitCode: this.process?.exitCode ?? null,
      signal: this.process?.signalCode ?? null,
      stdout: this.stdout,
      stderr: this.stderr,
      duration,
      state: this.state,
      ...(this.state === ProcessState.FAILED && { error: new Error('Process failed') })
    };
  }
}

/**
 * 创建终端进程
 */
export function createTerminalProcess(config: TerminalProcessConfig): TerminalProcess {
  return new TerminalProcess(config);
}

/**
 * 执行命令并返回结果
 */
export async function executeCommand(
  command: string,
  options?: Omit<TerminalProcessConfig, 'command'>
): Promise<ProcessResult> {
  const process = new TerminalProcess({
    command,
    ...options
  });
  
  // 收集输出
  const outputChunks: string[] = [];
  process.on('output', (event: ProcessOutputEvent) => {
    outputChunks.push(event.data);
  });
  
  try {
    const result = await process.start();
    return result;
  } finally {
    process.dispose();
  }
}