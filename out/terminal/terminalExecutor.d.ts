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
    timeout?: number;
    shell?: boolean;
    onOutput?: (data: string) => void;
    onError?: (data: string) => void;
    stopOnError?: boolean;
    updateCwd?: boolean;
}
export declare class TerminalExecutor {
    private outputChannel;
    private currentProcess?;
    private isExecuting;
    constructor();
    /**
     * 执行终端命令
     */
    executeCommand(command: string, options?: TerminalOptions): Promise<TerminalResult>;
    /**
     * 批量执行命令
     */
    executeCommands(commands: string[], options?: TerminalOptions): Promise<TerminalResult[]>;
    /**
     * 停止当前执行的命令
     */
    stopCurrentCommand(): boolean;
    /**
     * 检查命令是否安全可执行
     */
    isSafeCommand(command: string): boolean;
    /**
     * 执行命令前请求用户确认（对于高风险命令）
     */
    requestConfirmation(command: string): Promise<boolean>;
    /**
     * 获取系统信息
     */
    getSystemInfo(): {
        platform: string;
        arch: string;
        cpus: number;
        memory: string;
        shell: string;
    };
    /**
     * 分析命令输出，提取关键信息
     */
    analyzeOutput(output: string): {
        hasErrors: boolean;
        errorCount: number;
        warningCount: number;
        suggestions: string[];
    };
    /**
     * 生成命令执行的HTML报告
     */
    generateHtmlReport(result: TerminalResult): string;
    private spawnProcess;
    private escapeHtml;
}
//# sourceMappingURL=terminalExecutor.d.ts.map