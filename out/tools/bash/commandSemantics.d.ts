/**
 * 命令语义分析模块
 * 解析命令退出码的特殊含义
 */
/**
 * 命令语义分析结果
 */
export interface CommandSemanticResult {
    /** 是否是错误 */
    isError: boolean;
    /** 解释消息 */
    message?: string;
    /** 退出码 */
    exitCode: number;
}
/**
 * 命令语义分析函数
 */
export type CommandSemantic = (exitCode: number, stdout: string, stderr: string) => CommandSemanticResult;
/**
 * 获取命令的语义解释
 */
export declare function getCommandSemantic(command: string): CommandSemantic;
/**
 * 解释命令结果
 */
export declare function interpretCommandResult(command: string, exitCode: number, stdout: string, stderr: string): CommandSemanticResult;
/**
 * 检查命令是否是搜索或读取操作
 */
export declare function isSearchOrReadBashCommand(command: string): {
    isSearch: boolean;
    isRead: boolean;
    isList: boolean;
};
/**
 * 检查命令是否是静默命令（成功时不产生输出）
 */
export declare function isSilentBashCommand(command: string): boolean;
/**
 * 检查命令是否包含睡眠模式
 */
export declare function detectBlockedSleepPattern(command: string): string | null;
//# sourceMappingURL=commandSemantics.d.ts.map