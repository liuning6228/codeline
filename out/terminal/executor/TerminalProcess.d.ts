/**
 * TerminalProcess - 终端进程执行器
 * 提供流式命令执行、输出捕获和进程管理
 */
import { EventEmitter } from 'events';
/**
 * 终端进程配置
 */
export interface TerminalProcessConfig {
    command: string;
    args?: string[];
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    timeout?: number;
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
export declare enum ProcessState {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    TIMEOUT = "timeout"
}
/**
 * 进程结果
 */
export interface ProcessResult {
    exitCode: number | null;
    signal: NodeJS.Signals | null;
    stdout: string;
    stderr: string;
    duration: number;
    state: ProcessState;
    error?: Error;
}
/**
 * 终端进程类
 */
export declare class TerminalProcess extends EventEmitter {
    private process;
    private config;
    private state;
    private startTime;
    private endTime;
    private stdout;
    private stderr;
    private timeoutId;
    private isDisposed;
    constructor(config: TerminalProcessConfig);
    /**
     * 启动进程
     */
    start(): Promise<ProcessResult>;
    /**
     * 停止进程
     */
    stop(signal?: NodeJS.Signals): boolean;
    /**
     * 获取进程状态
     */
    getState(): ProcessState;
    /**
     * 获取进程ID
     */
    getPid(): number | null;
    /**
     * 获取输出
     */
    getOutput(): {
        stdout: string;
        stderr: string;
    };
    /**
     * 获取运行时间
     */
    getDuration(): number | null;
    /**
     * 写入输入（如果进程支持）
     */
    writeInput(data: string): boolean;
    /**
     * 关闭输入流
     */
    endInput(): boolean;
    /**
     * 清理资源
     */
    dispose(): void;
    private handleClose;
    private handleError;
    private handleTimeout;
    private cleanup;
    private cleanupTimeout;
    private getResult;
}
/**
 * 创建终端进程
 */
export declare function createTerminalProcess(config: TerminalProcessConfig): TerminalProcess;
/**
 * 执行命令并返回结果
 */
export declare function executeCommand(command: string, options?: Omit<TerminalProcessConfig, 'command'>): Promise<ProcessResult>;
//# sourceMappingURL=TerminalProcess.d.ts.map