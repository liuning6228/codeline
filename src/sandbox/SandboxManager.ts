/**
 * 沙箱管理器
 * 提供安全的命令执行环境，支持资源限制和隔离
 */

import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 沙箱级别
 */
export type SandboxLevel = 'none' | 'low' | 'medium' | 'high';

/**
 * 沙箱资源限制配置
 */
export interface SandboxResourceLimits {
  /** 最大内存使用量（MB） */
  maxMemoryMB?: number;
  /** 最大CPU使用时间（秒） */
  maxCPUTimeSeconds?: number;
  /** 最大进程数 */
  maxProcesses?: number;
  /** 最大文件大小（MB） */
  maxFileSizeMB?: number;
  /** 最大网络连接数 */
  maxNetworkConnections?: number;
  /** 允许的文件系统访问路径 */
  allowedPaths?: string[];
  /** 禁止的文件系统访问路径 */
  forbiddenPaths?: string[];
  /** 是否允许网络访问 */
  allowNetwork?: boolean;
  /** 是否允许环境变量访问 */
  allowEnvAccess?: boolean;
  /** 是否允许执行外部程序 */
  allowExternalPrograms?: boolean;
}

/**
 * 沙箱执行结果
 */
export interface SandboxExecutionResult {
  /** 是否成功 */
  success: boolean;
  /** 标准输出 */
  stdout: string;
  /** 标准错误输出 */
  stderr: string;
  /** 退出码 */
  exitCode?: number;
  /** 执行时长（毫秒） */
  duration: number;
  /** 资源使用统计 */
  resourceUsage?: {
    /** 内存使用量（MB） */
    memoryMB: number;
    /** CPU时间（秒） */
    cpuTimeSeconds: number;
    /** 磁盘使用量（MB） */
    diskUsageMB: number;
  };
  /** 沙箱级别 */
  sandboxLevel: SandboxLevel;
  /** 是否被资源限制终止 */
  terminatedByLimits?: boolean;
}

/**
 * 沙箱管理器配置
 */
export interface SandboxManagerConfig {
  /** 默认沙箱级别 */
  defaultSandboxLevel: SandboxLevel;
  /** 资源限制配置 */
  resourceLimits: {
    [K in SandboxLevel]: SandboxResourceLimits;
  };
  /** 是否启用沙箱 */
  enabled: boolean;
  /** 沙箱工作目录 */
  sandboxRoot: string;
  /** 是否记录沙箱操作 */
  enableLogging: boolean;
  /** 最大并发沙箱数量 */
  maxConcurrentSandboxes: number;
}

/**
 * 沙箱管理器
 * 提供不同级别的命令执行隔离环境
 */
export class SandboxManager {
  private config: SandboxManagerConfig;
  private sandboxCounter = 0;
  private activeSandboxes = new Map<string, cp.ChildProcess>();
  private outputChannel: vscode.OutputChannel;
  
  constructor(config?: Partial<SandboxManagerConfig>) {
    this.config = {
      defaultSandboxLevel: 'medium',
      enabled: true,
      sandboxRoot: path.join(os.tmpdir(), 'codeline-sandbox'),
      enableLogging: true,
      maxConcurrentSandboxes: 5,
      resourceLimits: {
        none: {},
        low: {
          maxMemoryMB: 512,
          maxCPUTimeSeconds: 30,
          maxProcesses: 10,
          maxFileSizeMB: 10,
          allowedPaths: [process.cwd()],
          allowNetwork: false,
          allowEnvAccess: true,
          allowExternalPrograms: false
        },
        medium: {
          maxMemoryMB: 256,
          maxCPUTimeSeconds: 15,
          maxProcesses: 5,
          maxFileSizeMB: 5,
          allowedPaths: [process.cwd()],
          allowNetwork: false,
          allowEnvAccess: false,
          allowExternalPrograms: false
        },
        high: {
          maxMemoryMB: 128,
          maxCPUTimeSeconds: 10,
          maxProcesses: 3,
          maxFileSizeMB: 1,
          allowedPaths: [],
          allowNetwork: false,
          allowEnvAccess: false,
          allowExternalPrograms: false
        }
      },
      ...config
    };
    
    this.outputChannel = vscode.window.createOutputChannel('CodeLine Sandbox');
    this.initializeSandboxRoot();
  }
  
  /**
   * 初始化沙箱根目录
   */
  private initializeSandboxRoot(): void {
    try {
      if (!fs.existsSync(this.config.sandboxRoot)) {
        fs.mkdirSync(this.config.sandboxRoot, { recursive: true });
        this.log(`沙箱根目录已创建: ${this.config.sandboxRoot}`);
      }
      
      // 确保目录可写
      fs.accessSync(this.config.sandboxRoot, fs.constants.W_OK);
    } catch (error) {
      this.log(`沙箱根目录初始化失败: ${error}`);
      // 使用临时目录作为后备
      this.config.sandboxRoot = os.tmpdir();
    }
  }
  
  /**
   * 执行命令（带沙箱）
   */
  public async executeCommand(
    command: string,
    options: {
      cwd?: string;
      env?: NodeJS.ProcessEnv;
      timeout?: number;
      sandboxLevel?: SandboxLevel;
      onOutput?: (data: string) => void;
      onError?: (data: string) => void;
    } = {}
  ): Promise<SandboxExecutionResult> {
    const startTime = Date.now();
    const sandboxLevel = options.sandboxLevel || this.config.defaultSandboxLevel;
    
    // 如果不启用沙箱或级别为'none'，直接执行
    if (!this.config.enabled || sandboxLevel === 'none') {
      return this.executeWithoutSandbox(command, options, startTime, sandboxLevel);
    }
    
    // 检查并发限制
    if (this.activeSandboxes.size >= this.config.maxConcurrentSandboxes) {
      return {
        success: false,
        stdout: '',
        stderr: `达到最大并发沙箱限制 (${this.config.maxConcurrentSandboxes})`,
        duration: Date.now() - startTime,
        sandboxLevel
      };
    }
    
    // 创建沙箱环境
    const sandboxId = `sandbox-${++this.sandboxCounter}-${Date.now()}`;
    const sandboxPath = path.join(this.config.sandboxRoot, sandboxId);
    
    try {
      // 准备沙箱环境
      await this.prepareSandboxEnvironment(sandboxPath, sandboxLevel, options);
      
      // 在沙箱中执行命令
      const result = await this.executeInSandbox(
        command, 
        sandboxPath, 
        sandboxLevel, 
        options, 
        startTime
      );
      
      return result;
      
    } catch (error: any) {
      return {
        success: false,
        stdout: '',
        stderr: `沙箱执行失败: ${error.message}`,
        duration: Date.now() - startTime,
        sandboxLevel
      };
    } finally {
      // 清理沙箱（异步）
      this.cleanupSandbox(sandboxPath).catch(err => {
        this.log(`沙箱清理失败 ${sandboxId}: ${err}`);
      });
    }
  }
  
  /**
   * 无沙箱执行命令
   */
  private async executeWithoutSandbox(
    command: string,
    options: any,
    startTime: number,
    sandboxLevel: SandboxLevel
  ): Promise<SandboxExecutionResult> {
    return new Promise((resolve) => {
      const cwd = options.cwd || process.cwd();
      const env = options.env || process.env;
      const timeout = options.timeout || 30000;
      
      this.log(`无沙箱执行命令: ${command}`);
      
      const childProcess = cp.exec(command, { cwd, env, timeout }, (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        
        resolve({
          success: !error,
          stdout: stdout || '',
          stderr: stderr || '',
          exitCode: error?.code || 0,
          duration,
          sandboxLevel
        });
      });
      
      // 处理实时输出
      if (options.onOutput) {
        childProcess.stdout?.on('data', (data) => {
          options.onOutput?.(data.toString());
        });
      }
      
      if (options.onError) {
        childProcess.stderr?.on('data', (data) => {
          options.onError?.(data.toString());
        });
      }
    });
  }
  
  /**
   * 准备沙箱环境
   */
  private async prepareSandboxEnvironment(
    sandboxPath: string,
    sandboxLevel: SandboxLevel,
    options: any
  ): Promise<void> {
    // 创建沙箱目录
    fs.mkdirSync(sandboxPath, { recursive: true });
    
    const limits = this.config.resourceLimits[sandboxLevel];
    
    // 创建基本文件系统结构
    const dirs = ['bin', 'lib', 'usr', 'tmp', 'home'];
    for (const dir of dirs) {
      const dirPath = path.join(sandboxPath, dir);
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // 根据允许的路径创建符号链接或复制文件
    if (limits.allowedPaths && limits.allowedPaths.length > 0) {
      const allowedDir = path.join(sandboxPath, 'allowed');
      fs.mkdirSync(allowedDir, { recursive: true });
      
      for (const allowedPath of limits.allowedPaths) {
        try {
          if (fs.existsSync(allowedPath)) {
            const targetName = path.basename(allowedPath);
            const linkPath = path.join(allowedDir, targetName);
            
            // 尝试创建符号链接，如果失败则创建目录
            try {
              fs.symlinkSync(allowedPath, linkPath);
            } catch {
              // 符号链接失败，创建空目录
              fs.mkdirSync(linkPath, { recursive: true });
            }
          }
        } catch (error) {
          this.log(`无法创建允许路径链接 ${allowedPath}: ${error}`);
        }
      }
    }
    
    // 创建资源限制配置文件
    const limitsConfig = {
      sandboxLevel,
      timestamp: new Date().toISOString(),
      limits
    };
    
    fs.writeFileSync(
      path.join(sandboxPath, '.sandbox-config.json'),
      JSON.stringify(limitsConfig, null, 2)
    );
    
    this.log(`沙箱环境已准备: ${sandboxPath} (级别: ${sandboxLevel})`);
  }
  
  /**
   * 在沙箱中执行命令
   */
  private async executeInSandbox(
    command: string,
    sandboxPath: string,
    sandboxLevel: SandboxLevel,
    options: any,
    startTime: number
  ): Promise<SandboxExecutionResult> {
    return new Promise((resolve) => {
      const limits = this.config.resourceLimits[sandboxLevel];
      const cwd = path.join(sandboxPath, 'home');
      const env = this.createSandboxEnvironment(limits);
      
      // 构建受限命令
      const restrictedCommand = this.applyResourceLimits(command, limits);
      
      this.log(`沙箱执行命令: ${restrictedCommand}`);
      
      const childProcess = cp.exec(
        restrictedCommand, 
        { 
          cwd, 
          env,
          timeout: options.timeout || limits.maxCPUTimeSeconds ? limits.maxCPUTimeSeconds! * 1000 : 30000
        }, 
        (error, stdout, stderr) => {
          const duration = Date.now() - startTime;
          
          resolve({
            success: !error,
            stdout: stdout || '',
            stderr: stderr || '',
            exitCode: error?.code || 0,
            duration,
            sandboxLevel,
            terminatedByLimits: error?.signal === 'SIGKILL' || error?.signal === 'SIGTERM'
          });
        }
      );
      
      // 记录进程ID
      if (childProcess.pid) {
        this.activeSandboxes.set(sandboxPath, childProcess);
      }
      
      // 处理实时输出
      if (options.onOutput) {
        childProcess.stdout?.on('data', (data) => {
          options.onOutput?.(data.toString());
        });
      }
      
      if (options.onError) {
        childProcess.stderr?.on('data', (data) => {
          options.onError?.(data.toString());
        });
      }
      
      // 监控资源使用
      this.monitorResourceUsage(childProcess, limits, sandboxPath);
      
      // 进程结束时清理
      childProcess.on('exit', () => {
        this.activeSandboxes.delete(sandboxPath);
      });
    });
  }
  
  /**
   * 创建沙箱环境变量
   */
  private createSandboxEnvironment(limits: SandboxResourceLimits): NodeJS.ProcessEnv {
    const env = { ...process.env };
    
    // 限制环境变量访问
    if (!limits.allowEnvAccess) {
      // 只保留基本的环境变量
      const allowedVars = ['PATH', 'HOME', 'LANG', 'TERM', 'SHELL', 'USER', 'LOGNAME'];
      Object.keys(env).forEach(key => {
        if (!allowedVars.includes(key)) {
          delete env[key];
        }
      });
    }
    
    // 设置沙箱特定的环境变量
    env.CODELINE_SANDBOX = '1';
    env.SANDBOX_LEVEL = limits.maxMemoryMB ? 'restricted' : 'minimal';
    
    // 限制PATH以防执行外部程序
    if (!limits.allowExternalPrograms) {
      env.PATH = '/bin:/usr/bin';
    }
    
    return env;
  }
  
  /**
   * 应用资源限制到命令
   */
  private applyResourceLimits(command: string, limits: SandboxResourceLimits): string {
    let wrappedCommand = command;
    
    // 使用ulimit设置资源限制（如果支持）
    const ulimitParts = [];
    
    if (limits.maxMemoryMB) {
      // 转换为KB
      const memoryKB = limits.maxMemoryMB * 1024;
      ulimitParts.push(`-v ${memoryKB}`); // 虚拟内存限制
    }
    
    if (limits.maxProcesses) {
      ulimitParts.push(`-u ${limits.maxProcesses}`); // 进程数限制
    }
    
    if (limits.maxFileSizeMB) {
      // 转换为512字节块
      const fileSizeBlocks = limits.maxFileSizeMB * 2048;
      ulimitParts.push(`-f ${fileSizeBlocks}`); // 文件大小限制
    }
    
    if (ulimitParts.length > 0) {
      wrappedCommand = `ulimit ${ulimitParts.join(' ')} && ${wrappedCommand}`;
    }
    
    // 使用timeout命令设置CPU时间限制
    if (limits.maxCPUTimeSeconds) {
      wrappedCommand = `timeout ${limits.maxCPUTimeSeconds}s ${wrappedCommand}`;
    }
    
    return wrappedCommand;
  }
  
  /**
   * 监控资源使用
   */
  private monitorResourceUsage(
    childProcess: cp.ChildProcess,
    limits: SandboxResourceLimits,
    sandboxPath: string
  ): void {
    // 简单实现：定期检查进程状态
    const checkInterval = setInterval(() => {
      if (!childProcess.pid) {
        clearInterval(checkInterval);
        return;
      }
      
      // 这里可以添加更复杂的资源监控逻辑
      // 例如使用ps命令检查内存使用等
      
    }, 1000);
    
    childProcess.on('exit', () => {
      clearInterval(checkInterval);
    });
  }
  
  /**
   * 清理沙箱
   */
  private async cleanupSandbox(sandboxPath: string): Promise<void> {
    try {
      if (fs.existsSync(sandboxPath)) {
        // 递归删除沙箱目录
        const deleteRecursive = (dir: string) => {
          if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(file => {
              const curPath = path.join(dir, file);
              if (fs.lstatSync(curPath).isDirectory()) {
                deleteRecursive(curPath);
              } else {
                fs.unlinkSync(curPath);
              }
            });
            fs.rmdirSync(dir);
          }
        };
        
        deleteRecursive(sandboxPath);
        this.log(`沙箱已清理: ${sandboxPath}`);
      }
    } catch (error) {
      this.log(`沙箱清理错误 ${sandboxPath}: ${error}`);
      // 如果无法删除，至少尝试重命名以防止重用
      try {
        const oldPath = sandboxPath + '.deleted';
        fs.renameSync(sandboxPath, oldPath);
      } catch (renameError) {
        // 忽略重命名错误
      }
    }
  }
  
  /**
   * 获取当前活跃沙箱数量
   */
  public getActiveSandboxCount(): number {
    return this.activeSandboxes.size;
  }
  
  /**
   * 获取沙箱配置
   */
  public getConfig(): SandboxManagerConfig {
    return { ...this.config };
  }
  
  /**
   * 更新沙箱配置
   */
  public updateConfig(newConfig: Partial<SandboxManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.log(`沙箱配置已更新`);
  }
  
  /**
   * 启用/禁用沙箱
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.log(`沙箱已${enabled ? '启用' : '禁用'}`);
  }
  
  /**
   * 日志记录
   */
  private log(message: string): void {
    if (this.config.enableLogging) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${message}`;
      this.outputChannel.appendLine(logMessage);
    }
  }
  
  /**
   * 销毁沙箱管理器
   */
  public dispose(): void {
    // 终止所有活跃沙箱
    for (const [sandboxPath, process] of this.activeSandboxes) {
      try {
        process.kill('SIGKILL');
      } catch (error) {
        // 忽略终止错误
      }
    }
    
    this.activeSandboxes.clear();
    this.outputChannel.dispose();
  }
}

/**
 * 默认沙箱管理器实例
 */
let defaultSandboxManager: SandboxManager | undefined;

/**
 * 获取默认沙箱管理器
 */
export function getDefaultSandboxManager(): SandboxManager {
  if (!defaultSandboxManager) {
    defaultSandboxManager = new SandboxManager();
  }
  return defaultSandboxManager;
}

/**
 * 设置默认沙箱管理器
 */
export function setDefaultSandboxManager(manager: SandboxManager): void {
  defaultSandboxManager = manager;
}