/**
 * 文件管理工具适配器
 * 将现有的 FileManager 模块适配到统一的工具接口
 */
import { FileOperationResult } from '../../file/fileManager';
import { BaseToolAdapter } from './ToolAdapter';
import { ToolContext, ToolResult, PermissionResult, ValidationResult, ToolProgress } from '../ToolInterface';
/**
 * 文件操作参数类型
 */
export interface FileOperationParams {
    /** 操作类型 */
    operation: 'create' | 'read' | 'update' | 'delete' | 'list' | 'copy' | 'move';
    /** 文件路径 */
    filePath?: string;
    /** 目标路径（用于复制/移动） */
    targetPath?: string;
    /** 文件内容（用于创建/更新） */
    content?: string;
    /** 偏移量（用于读取） */
    offset?: number;
    /** 限制（用于读取） */
    limit?: number;
    /** 是否递归（用于列表） */
    recursive?: boolean;
    /** 文件模式（权限） */
    mode?: string;
}
/**
 * 文件操作结果类型
 */
export interface FileOperationResultData {
    /** 操作结果 */
    result: FileOperationResult;
    /** 文件统计信息 */
    stats?: {
        size: number;
        isDirectory: boolean;
        isFile: boolean;
        modified: Date;
        created: Date;
    };
    /** 目录列表（仅用于列表操作） */
    listing?: Array<{
        name: string;
        type: 'file' | 'directory';
        size: number;
        modified: Date;
    }>;
}
/**
 * 文件管理工具适配器
 */
export declare class FileManagerAdapter extends BaseToolAdapter<FileOperationParams, FileOperationResultData> {
    private fileManager;
    constructor(context: ToolContext);
    /**
     * 检查权限
     */
    checkPermissions(params: FileOperationParams, context: ToolContext): Promise<PermissionResult>;
    /**
     * 验证参数
     */
    validateParameters(params: FileOperationParams, context: ToolContext): Promise<ValidationResult>;
    /**
     * 执行文件操作
     */
    execute(params: FileOperationParams, context: ToolContext, onProgress?: (progress: ToolProgress) => void): Promise<ToolResult<FileOperationResultData>>;
    /**
     * 检查是否为只读操作
     */
    isReadOnly(context: ToolContext): boolean;
    /**
     * 检查是否为破坏性操作
     */
    isDestructive(context: ToolContext): boolean;
    /**
     * 获取显示名称
     */
    getDisplayName(params?: FileOperationParams): string;
    /**
     * 获取活动描述
     */
    getActivityDescription(params: FileOperationParams): string;
    /**
     * 检查路径安全性
     */
    private isSafePath;
    /**
     * 工厂方法：创建文件管理工具适配器
     */
    static create(context: ToolContext): FileManagerAdapter;
}
//# sourceMappingURL=FileManagerAdapter.d.ts.map