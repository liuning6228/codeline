/**
 * 沙箱管理器
 * 提供安全的命令执行环境，限制资源访问和操作
 */
import { TerminalProcessConfig } from '../executor/TerminalProcess';
/**
 * 沙箱配置
 */
export interface SandboxConfig {
    /** 工作目录限制 */
    workspaceRoot: string;
    /** 允许的文件系统访问路径 */
    allowedPaths: string[];
    /** 禁止的命令模式 */
    forbiddenPatterns: RegExp[];
    /** 最大执行时间（毫秒） */
    maxExecutionTime: number;
    /** 最大输出大小（字节） */
    maxOutputSize: number;
    /** 是否允许网络访问 */
    allowNetwork: boolean;
    /** 环境变量白名单 */
    allowedEnvVars: string[];
    /** 用户ID限制 */
    runAsUser?: string;
    /** 组ID限制 */
    runAsGroup?: string;
}
/**
 * 沙箱执行结果
 */
export interface SandboxExecutionResult {
    success: boolean;
    result?: any;
    error?: Error;
    violations?: string[];
    resourceUsage?: {
        cpuTime: number;
        memoryUsage: number;
        diskRead: number;
        diskWrite: number;
    };
}
/**
 * 沙箱管理器
 */
export declare class SandboxManager {
    private config;
    private tempDirs;
    constructor(config?: Partial<SandboxConfig>);
    /**
     * 检查命令是否安全
     */
    validateCommand(command: string): {
        safe: boolean;
        violations: string[];
        suggestedCommand?: string;
    };
    /**
     * 在沙箱中执行命令
     */
    executeInSandbox(command: string, options?: Partial<TerminalProcessConfig>): Promise<SandboxExecutionResult>;
    /**
     * 创建受限文件系统视图
     */
    createRestrictedFSView(targetDir: string): Promise<string>;
    /**
     * 清理所有临时资源
     */
    cleanup(): Promise<void>;
    private sanitizeCommand;
    private createTempWorkspace;
    private prepareEnvironment;
    private cleanupTempWorkspace;
}
/**
 * 创建沙箱管理器实例
 */
export declare function createSandboxManager(config?: Partial<SandboxConfig>): SandboxManager;
//# sourceMappingURL=SandboxManager.d.ts.map