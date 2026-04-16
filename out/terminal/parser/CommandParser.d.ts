/**
 * 命令解析器
 * 解析Shell命令，提取命令结构、参数和语义信息
 */
/**
 * 命令类型
 */
export declare enum CommandType {
    FILE_OPERATION = "file_operation",
    PROCESS_MANAGEMENT = "process_management",
    NETWORK = "network",
    SYSTEM_INFO = "system_info",
    PACKAGE_MANAGEMENT = "package_management",
    VERSION_CONTROL = "version_control",
    BUILD_TOOL = "build_tool",
    TEXT_PROCESSING = "text_processing",
    OTHER = "other"
}
/**
 * 命令语义分析结果
 */
export interface CommandSemantic {
    /** 命令类型 */
    type: CommandType;
    /** 危险等级 (0-10) */
    riskLevel: number;
    /** 是否只读操作 */
    readOnly: boolean;
    /** 是否影响系统状态 */
    systemImpact: boolean;
    /** 建议的沙箱级别 */
    suggestedSandboxLevel: 'none' | 'low' | 'medium' | 'high';
    /** 关键词 */
    keywords: string[];
    /** 描述 */
    description: string;
}
/**
 * 解析后的命令结构
 */
export interface ParsedCommand {
    /** 原始命令 */
    raw: string;
    /** 命令名称 */
    command: string;
    /** 参数列表 */
    args: string[];
    /** 选项映射 */
    options: Record<string, string | boolean>;
    /** 重定向信息 */
    redirects: {
        stdin?: string;
        stdout?: string;
        stderr?: string;
        append: boolean;
    };
    /** 管道命令列表 */
    pipeline: ParsedCommand[];
    /** 后台运行 */
    background: boolean;
    /** 工作目录（如果指定） */
    cwd?: string;
    /** 环境变量（如果指定） */
    env: Record<string, string>;
    /** 语义分析结果 */
    semantic?: CommandSemantic;
}
/**
 * 命令解析器
 */
export declare class CommandParser {
    private static readonly DANGEROUS_PATTERNS;
    private static readonly READ_ONLY_COMMANDS;
    private static readonly COMMAND_SEMANTICS;
    /**
     * 解析命令字符串
     */
    parse(command: string): ParsedCommand;
    /**
     * 分析命令语义
     */
    analyzeSemantics(parsed: ParsedCommand): CommandSemantic;
    /**
     * 验证命令安全性
     */
    validateSafety(parsed: ParsedCommand): {
        safe: boolean;
        warnings: string[];
        riskLevel: number;
    };
    /**
     * 获取命令建议
     */
    getSuggestions(parsed: ParsedCommand): string[];
    private tokenize;
    private extractOptions;
    private extractRedirects;
    private extractPipeline;
}
/**
 * 创建命令解析器实例
 */
export declare function createCommandParser(): CommandParser;
//# sourceMappingURL=CommandParser.d.ts.map