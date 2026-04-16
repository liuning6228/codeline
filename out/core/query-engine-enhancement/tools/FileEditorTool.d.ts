/**
 * FileEditorTool - 文件编辑器工具
 *
 * 编辑现有代码文件，支持精确的代码修改操作：
 * 1. 插入代码片段到指定位置
 * 2. 替换现有代码片段
 * 3. 删除代码片段
 * 4. 重命名标识符
 * 5. 重构代码结构
 * 6. 格式化代码
 */
import { EnhancedBaseTool, type EnhancedToolContext } from '../../tool/EnhancedBaseTool';
import { ToolCategory, ToolCapabilities, PermissionLevel } from '../../tool/Tool';
/**
 * 文件编辑操作类型
 */
export type EditOperation = 'insert' | 'replace' | 'delete' | 'rename' | 'move' | 'extract' | 'inline' | 'format' | 'refactor';
/**
 * 代码位置
 */
export interface CodeLocation {
    /** 文件路径 */
    filePath?: string;
    /** 起始行（1-based） */
    lineStart: number;
    /** 结束行（1-based） */
    lineEnd: number;
    /** 起始列（可选，0-based） */
    columnStart?: number;
    /** 结束列（可选，0-based） */
    columnEnd?: number;
}
/**
 * 文件编辑器工具参数
 */
export interface FileEditorParameters {
    /** 编辑操作类型 */
    operation: EditOperation;
    /** 目标文件路径 */
    filePath: string;
    /** 代码位置（对于insert/replace/delete操作） */
    location?: CodeLocation;
    /** 新代码内容（对于insert/replace操作） */
    newCode?: string;
    /** 要删除的代码内容（对于delete操作） */
    oldCode?: string;
    /** 旧标识符名（对于rename操作） */
    oldIdentifier?: string;
    /** 新标识符名（对于rename操作） */
    newIdentifier?: string;
    /** 重构描述（对于refactor操作） */
    refactorDescription?: string;
    /** 是否创建备份 */
    createBackup?: boolean;
    /** 是否验证语法 */
    validateSyntax?: boolean;
    /** 是否格式化代码 */
    formatAfterEdit?: boolean;
    /** 额外选项 */
    options?: {
        /** 是否递归重命名（对于rename操作） */
        recursive?: boolean;
        /** 是否更新导入/导出（对于rename操作） */
        updateImports?: boolean;
        /** 是否更新注释（对于rename操作） */
        updateComments?: boolean;
        /** 插入位置：before, after, replace */
        insertPosition?: 'before' | 'after' | 'replace';
        /** 缩进策略：preserve, auto, smart */
        indentStrategy?: 'preserve' | 'auto' | 'smart';
    };
}
/**
 * 文件编辑器工具结果
 */
export interface FileEditorResult {
    /** 操作是否成功 */
    success: boolean;
    /** 编辑的文件路径 */
    filePath: string;
    /** 执行的操作 */
    operation: EditOperation;
    /** 变更详情 */
    changes: {
        /** 变更类型 */
        type: 'insertion' | 'deletion' | 'replacement' | 'rename' | 'refactor';
        /** 位置 */
        location?: CodeLocation;
        /** 旧内容（如果有） */
        oldContent?: string;
        /** 新内容（如果有） */
        newContent?: string;
        /** 变更大小（行数） */
        size: {
            linesAdded: number;
            linesRemoved: number;
            linesChanged: number;
        };
    };
    /** 备份文件路径（如果创建了备份） */
    backupFilePath?: string;
    /** 语法验证结果 */
    syntaxValidation?: {
        valid: boolean;
        errors?: string[];
        warnings?: string[];
    };
    /** 格式化结果（如果执行了格式化） */
    formatting?: {
        formatted: boolean;
        changes?: number;
        standard?: string;
    };
    /** 统计信息 */
    statistics: {
        /** 编辑时间（毫秒） */
        editTime: number;
        /** 文件大小变化（字节） */
        sizeChange: number;
        /** 受影响的行数 */
        affectedLines: number;
        /** 备份大小（字节） */
        backupSize?: number;
    };
    /** 错误信息（如果失败） */
    error?: string;
    /** 建议和改进 */
    suggestions: string[];
}
/**
 * 文件编辑器工具
 */
export declare class FileEditorTool extends EnhancedBaseTool<FileEditorParameters, FileEditorResult> {
    /**
     * 工具ID
     */
    static readonly TOOL_ID = "file_editor";
    /**
     * 工具名称
     */
    static readonly TOOL_NAME = "File Editor";
    /**
     * 工具描述
     */
    static readonly TOOL_DESCRIPTION = "Edits code files with precise operations: insert, replace, delete, rename, refactor";
    /**
     * 工具类别
     */
    static readonly TOOL_CATEGORY: ToolCategory;
    /**
     * 工具能力
     */
    static readonly TOOL_CAPABILITIES: ToolCapabilities;
    /**
     * 权限级别
     */
    static readonly PERMISSION_LEVEL = PermissionLevel.WRITE;
    readonly id = "file_editor";
    readonly name = "File Editor";
    readonly description = "Edits code files with precise operations: insert, replace, delete, rename, refactor";
    readonly version = "1.0.0";
    readonly author = "CodeLine Team";
    readonly category: ToolCategory;
    protected logInfo(message: string): void;
    protected logWarn(message: string): void;
    protected logError(message: string): void;
    /**
     * 执行工具核心逻辑
     */
    protected executeCore(input: FileEditorParameters, context: EnhancedToolContext): Promise<FileEditorResult>;
    /**
     * 创建参数模式
     */
    protected createParameterSchema(): any;
    /**
     * 执行工具
     */
    protected executeImplementation(params: FileEditorParameters, context: any): Promise<FileEditorResult>;
    /**
     * 验证文件
     */
    private validateFile;
    /**
     * 创建备份
     */
    private createBackup;
    /**
     * 从备份恢复
     */
    private restoreFromBackup;
    /**
     * 执行编辑操作
     */
    private performEditOperation;
    /**
     * 执行插入操作
     */
    private performInsertOperation;
    /**
     * 执行替换操作
     */
    private performReplaceOperation;
    /**
     * 执行删除操作
     */
    private performDeleteOperation;
    /**
     * 执行重命名操作
     */
    private performRenameOperation;
    /**
     * 递归重命名
     */
    private recursiveRename;
    /**
     * 执行重构操作
     */
    private performRefactorOperation;
    /**
     * 重构：提取重复代码
     */
    private refactorExtractDuplicates;
    /**
     * 通用重构改进
     */
    private refactorGenericImprovements;
    /**
     * 改进注释
     */
    private improveComments;
    /**
     * 改进格式
     */
    private improveFormatting;
    /**
     * 改进错误处理
     */
    private improveErrorHandling;
    /**
     * 执行格式化操作
     */
    private performFormatOperation;
    /**
     * 验证语法
     */
    private validateSyntax;
    /**
     * 格式化代码
     */
    private formatCode;
    /**
     * 格式化代码内容
     */
    private formatCodeContent;
    /**
     * 计算变化行数
     */
    private countChangedLines;
    /**
     * 计算统计信息
     */
    private calculateStatistics;
    /**
     * 生成改进建议
     */
    private generateSuggestions;
    /**
     * 获取工具ID
     */
    getToolId(): string;
    /**
     * 获取工具名称
     */
    getToolName(): string;
    /**
     * 获取工具描述
     */
    getToolDescription(): string;
    /**
     * 获取工具类别
     */
    getToolCategory(): ToolCategory;
    /**
     * 获取工具能力
     */
    getToolCapabilities(): ToolCapabilities;
    /**
     * 获取权限级别
     */
    getPermissionLevel(): PermissionLevel;
}
export default FileEditorTool;
//# sourceMappingURL=FileEditorTool.d.ts.map