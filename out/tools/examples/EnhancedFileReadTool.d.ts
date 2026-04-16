/**
 * 增强文件读取工具示例
 * 演示如何使用EnhancedBaseTool创建同时支持新旧接口的工具
 */
import { EnhancedBaseTool } from '../../core/tool/EnhancedBaseTool';
import { ToolCategory } from '../../core/tool/Tool';
/**
 * 文件读取工具的输入参数
 */
interface FileReadInput {
    /** 文件路径 */
    filePath: string;
    /** 编码格式 */
    encoding?: 'utf-8' | 'utf-16' | 'ascii' | 'base64';
    /** 是否返回行数统计 */
    includeLineCount?: boolean;
}
/**
 * 文件读取工具的输出结果
 */
interface FileReadOutput {
    /** 文件内容 */
    content: string;
    /** 文件大小（字节） */
    size: number;
    /** 行数（如果请求） */
    lineCount?: number;
    /** 编码 */
    encoding: string;
    /** 读取成功 */
    success: boolean;
}
/**
 * 增强文件读取工具
 * 演示EnhancedBaseTool的双接口兼容特性
 */
export declare class EnhancedFileReadTool extends EnhancedBaseTool<FileReadInput, FileReadOutput> {
    readonly id = "enhanced-file-read";
    readonly name = "\u589E\u5F3A\u6587\u4EF6\u8BFB\u53D6\u5DE5\u5177";
    readonly description = "\u8BFB\u53D6\u6587\u4EF6\u5185\u5BB9\u5E76\u8FD4\u56DE\u7EDF\u8BA1\u4FE1\u606F\uFF0C\u6F14\u793AEnhancedBaseTool\u7684\u53CC\u63A5\u53E3\u517C\u5BB9\u6027";
    readonly version = "1.0.0";
    readonly author = "CodeLine\u5F00\u53D1\u56E2\u961F";
    readonly category = ToolCategory.FILE;
    private readonly customZodSchema;
    private readonly customParameterSchema;
    private readonly customCapabilities;
    constructor();
    /**
     * 核心执行方法
     */
    protected executeCore(input: FileReadInput, context: any): Promise<FileReadOutput>;
    /**
     * 重写inputSchema获取器
     */
    get inputSchema(): any;
    /**
     * 重写parameterSchema获取器
     */
    get parameterSchema(): {
        filePath: {
            type: string;
            description: string;
            required: boolean;
        };
        encoding: {
            type: string;
            description: string;
            required: boolean;
            enum: string[];
        };
        includeLineCount: {
            type: string;
            description: string;
            required: boolean;
            default: boolean;
        };
    };
    /**
     * 重写capabilities获取器
     */
    get capabilities(): {
        isConcurrencySafe: boolean;
        isReadOnly: boolean;
        isDestructive: boolean;
        requiresWorkspace: boolean;
        supportsStreaming: boolean;
    };
    /**
     * 重写权限检查方法
     */
    protected checkPermissionsForNew(input: FileReadInput, context: any): Promise<any>;
    /**
     * 工具使用报告
     */
    getToolReport(): {
        toolName: string;
        compatibility: {
            hasZodSchema: boolean;
            hasParameterSchema: boolean;
            supportsNewInterface: boolean;
            supportsOldInterface: boolean;
            migrationStatus: "enhanced";
            recommendations: string;
        };
        features: {
            supportsZodValidation: boolean;
            supportsLegacyInterface: boolean;
            supportsPermissionChecks: boolean;
            exampleUsage: {
                newInterface: string;
                oldInterface: string;
            };
        };
    };
}
/**
 * 使用createEnhancedTool工厂函数创建工具
 */
export declare const createFileReadTool: () => EnhancedBaseTool<FileReadInput, FileReadOutput>;
/**
 * 测试函数：演示EnhancedBaseTool的使用
 */
export declare function testEnhancedTool(): Promise<{
    tool: EnhancedFileReadTool;
    newTool: import("../../core/tool/Tool").Tool<FileReadInput, FileReadOutput>;
    oldTool: import("../ToolInterface").Tool<FileReadInput, FileReadOutput>;
    factoryTool: EnhancedBaseTool<FileReadInput, FileReadOutput>;
}>;
export {};
//# sourceMappingURL=EnhancedFileReadTool.d.ts.map