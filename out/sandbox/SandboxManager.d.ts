/**
 * 沙箱管理器
 * 提供安全的命令执行环境，支持资源限制和隔离
 */
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
export declare class SandboxManager {
    private config;
    private sandboxCounter;
    private activeSandboxes;
    private outputChannel;
    constructor(config?: Partial<SandboxManagerConfig>);
    /**
     * 初始化沙箱根目录
     */
    private initializeSandboxRoot;
    /**
     * 执行命令（带沙箱）
     */
    executeCommand(command: string, options?: {
        cwd?: string;
        env?: NodeJS.ProcessEnv;
        timeout?: number;
        sandboxLevel?: SandboxLevel;
        onOutput?: (data: string) => void;
        onError?: (data: string) => void;
    }): Promise<SandboxExecutionResult>;
    /**
     * 无沙箱执行命令
     */
    private executeWithoutSandbox;
    /**
     * 准备沙箱环境
     */
    private prepareSandboxEnvironment;
    /**
     * 在沙箱中执行命令
     */
    private executeInSandbox;
    /**
     * 创建沙箱环境变量
     */
    private createSandboxEnvironment;
    /**
     * 应用资源限制到命令
     */
    private applyResourceLimits;
    /**
     * 监控资源使用
     */
    private monitorResourceUsage;
    /**
     * 清理沙箱
     */
    private cleanupSandbox;
    /**
     * 获取当前活跃沙箱数量
     */
    getActiveSandboxCount(): number;
    /**
     * 获取沙箱配置
     */
    getConfig(): SandboxManagerConfig;
    /**
     * 更新沙箱配置
     */
    updateConfig(newConfig: Partial<SandboxManagerConfig>): void;
    /**
     * 启用/禁用沙箱
     */
    setEnabled(enabled: boolean): void;
    /**
     * 日志记录
     */
    private log;
    /**
     * 销毁沙箱管理器
     */
    dispose(): void;
}
/**
 * 获取默认沙箱管理器
 */
export declare function getDefaultSandboxManager(): SandboxManager;
/**
 * 设置默认沙箱管理器
 */
export declare function setDefaultSandboxManager(manager: SandboxManager): void;
//# sourceMappingURL=SandboxManager.d.ts.map