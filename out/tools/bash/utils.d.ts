/**
 * BashTool 工具函数
 */
/**
 * 去除首尾的空行（保留内容行内的空白）
 */
export declare function stripEmptyLines(content: string): string;
/**
 * 检查内容是否是 base64 编码的图像数据 URL
 */
export declare function isImageOutput(content: string): boolean;
/**
 * 解析 data-URI 字符串
 */
export declare function parseDataUri(s: string): {
    mediaType: string;
    data: string;
} | null;
/**
 * 构建图像工具结果块
 */
export declare function buildImageToolResult(stdout: string, toolUseID: string): any;
/**
 * 调整图像输出大小
 */
export declare function resizeShellImageOutput(stdout: string, outputFilePath?: string, fileSize?: number): Promise<string | null>;
/**
 * 重置 CWD 如果在项目外部
 */
export declare function resetCwdIfOutsideProject(permissionContext: any): boolean;
/**
 * 为 shell 重置消息追加 stderr
 */
export declare function stdErrAppendShellResetMessage(stderr: string): string;
/**
 * 检查命令是否包含 CD 操作
 */
export declare function commandHasAnyCd(command: string): boolean;
/**
 * 分割命令（简化的实现）
 */
export declare function splitCommand_DEPRECATED(command: string): string[];
/**
 * 提取命令的基础命令（第一个单词）
 */
export declare function extractBaseCommand(command: string): string;
/**
 * 检查输出是否被截断
 */
export declare function isOutputTruncated(output: string): boolean;
/**
 * 获取输出的预览
 */
export declare function getOutputPreview(output: string, maxLength?: number): string;
//# sourceMappingURL=utils.d.ts.map