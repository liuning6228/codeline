export interface FileDiff {
    filePath: string;
    oldContent: string;
    newContent: string;
    changes: LineChange[];
    summary: string;
}
export interface LineChange {
    type: 'added' | 'removed' | 'modified';
    oldLineNumber?: number;
    newLineNumber?: number;
    content: string;
}
export interface FileOperationResult {
    success: boolean;
    filePath: string;
    diff?: FileDiff;
    error?: string;
    message: string;
}
export declare class FileManager {
    private workspaceRoot;
    constructor(workspaceRoot: string);
    /**
     * 创建新文件
     */
    createFile(filePath: string, content: string): Promise<FileOperationResult>;
    /**
     * 编辑文件（带差异计算）- 立即写入模式
     */
    editFileWithDiff(filePath: string, newContent: string): Promise<FileOperationResult>;
    /**
     * 准备文件编辑（Cline风格）- 不立即写入，只返回diff供预览
     */
    prepareFileEdit(filePath: string, newContent: string): Promise<FileOperationResult>;
    /**
     * 删除文件
     */
    deleteFile(filePath: string): Promise<FileOperationResult>;
    /**
     * 检查文件是否存在
     */
    fileExists(filePath: string): Promise<boolean>;
    /**
     * 读取文件内容
     */
    readFile(filePath: string): Promise<string>;
    /**
     * 读取文件内容（带行数限制）
     */
    readFileWithLimits(filePath: string, offset?: number, limit?: number): Promise<FileOperationResult>;
    /**
     * 移动文件（重命名文件的别名）
     */
    moveFile(sourcePath: string, destPath: string): Promise<FileOperationResult>;
    /**
     * 获取文件信息
     */
    getFileInfo(filePath: string): Promise<{
        exists: boolean;
        size: number;
        modified: Date;
        lines: number;
    }>;
    /**
     * 列出目录内容
     */
    listDirectory(dirPath?: string): Promise<{
        files: Array<{
            name: string;
            path: string;
            type: 'file' | 'directory' | 'symlink' | 'other';
            size: number;
            modified: Date;
            extension?: string;
        }>;
        directories: number;
        filesCount: number;
        totalSize: number;
    }>;
    /**
     * 重命名或移动文件
     */
    renameFile(oldPath: string, newPath: string): Promise<FileOperationResult>;
    /**
     * 复制文件
     */
    copyFile(sourcePath: string, destPath: string): Promise<FileOperationResult>;
    /**
     * 创建目录
     */
    createDirectory(dirPath: string): Promise<FileOperationResult>;
    /**
     * 删除目录（递归）
     */
    deleteDirectory(dirPath: string): Promise<FileOperationResult>;
    /**
     * 搜索文件（基于名称或内容）
     */
    searchFiles(options?: {
        pattern?: string;
        content?: string;
        recursive?: boolean;
        caseSensitive?: boolean;
        maxResults?: number;
    }): Promise<Array<{
        path: string;
        name: string;
        matches: Array<{
            line: number;
            content: string;
            startIndex: number;
        }>;
    }>>;
    /**
     * 获取文件统计信息（整个工作区）
     */
    getWorkspaceStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        totalLines: number;
        byExtension: Record<string, {
            count: number;
            size: number;
            lines: number;
        }>;
        byType: Record<string, number>;
    }>;
    /**
     * 应用差异（用户批准后）
     */
    applyDiff(diff: FileDiff): Promise<FileOperationResult>;
    /**
     * 撤销差异（回滚更改）
     */
    revertDiff(diff: FileDiff): Promise<FileOperationResult>;
    /**
     * 批量应用多个差异
     */
    applyDiffs(diffs: FileDiff[]): Promise<FileOperationResult[]>;
    private resolvePath;
    private ensureDirectoryExists;
    private readFileIfExists;
    private openFileInEditor;
    private refreshFileInEditor;
    /**
     * 简单的差异计算算法
     * 注：对于生产环境，应该使用更成熟的diff库
     */
    private calculateChanges;
    private generateDiffSummary;
    /**
     * 生成可读的差异显示（用于UI）
     */
    generateReadableDiff(diff: FileDiff): string;
    /**
     * 生成HTML格式的差异显示（用于Webview）
     */
    generateHtmlDiff(diff: FileDiff): string;
    private escapeHtml;
    /**
     * 检查文件名是否匹配模式（支持简单通配符）
     */
    private matchesPattern;
    /**
     * 在文件内容中搜索文本
     */
    private searchInContent;
}
//# sourceMappingURL=fileManager.d.ts.map