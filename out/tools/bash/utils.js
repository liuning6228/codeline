"use strict";
/**
 * BashTool 工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripEmptyLines = stripEmptyLines;
exports.isImageOutput = isImageOutput;
exports.parseDataUri = parseDataUri;
exports.buildImageToolResult = buildImageToolResult;
exports.resizeShellImageOutput = resizeShellImageOutput;
exports.resetCwdIfOutsideProject = resetCwdIfOutsideProject;
exports.stdErrAppendShellResetMessage = stdErrAppendShellResetMessage;
exports.commandHasAnyCd = commandHasAnyCd;
exports.splitCommand_DEPRECATED = splitCommand_DEPRECATED;
exports.extractBaseCommand = extractBaseCommand;
exports.isOutputTruncated = isOutputTruncated;
exports.getOutputPreview = getOutputPreview;
/**
 * 去除首尾的空行（保留内容行内的空白）
 */
function stripEmptyLines(content) {
    const lines = content.split('\n');
    // 找到第一个非空行
    let startIndex = 0;
    while (startIndex < lines.length && (lines[startIndex]?.trim() === '')) {
        startIndex++;
    }
    // 找到最后一个非空行
    let endIndex = lines.length - 1;
    while (endIndex >= 0 && (lines[endIndex]?.trim() === '')) {
        endIndex--;
    }
    // 如果所有行都是空的，返回空字符串
    if (startIndex > endIndex) {
        return '';
    }
    // 返回非空行的切片
    return lines.slice(startIndex, endIndex + 1).join('\n');
}
/**
 * 检查内容是否是 base64 编码的图像数据 URL
 */
function isImageOutput(content) {
    return /^data:image\/[a-z0-9.+_-]+;base64,/i.test(content);
}
/**
 * 解析 data-URI 字符串
 */
function parseDataUri(s) {
    const DATA_URI_RE = /^data:([^;]+);base64,(.+)$/;
    const match = s.trim().match(DATA_URI_RE);
    if (!match || !match[1] || !match[2]) {
        return null;
    }
    return { mediaType: match[1], data: match[2] };
}
/**
 * 构建图像工具结果块
 */
function buildImageToolResult(stdout, toolUseID) {
    const parsed = parseDataUri(stdout);
    if (!parsed) {
        return null;
    }
    return {
        tool_use_id: toolUseID,
        type: 'tool_result',
        content: [
            {
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: parsed.mediaType,
                    data: parsed.data,
                },
            },
        ],
    };
}
/**
 * 调整图像输出大小
 */
async function resizeShellImageOutput(stdout, outputFilePath, fileSize) {
    // 如果不是图像输出，直接返回
    if (!isImageOutput(stdout)) {
        return null;
    }
    // 最大图像文件大小（20MB）
    const MAX_IMAGE_FILE_SIZE = 20 * 1024 * 1024;
    if (fileSize && fileSize > MAX_IMAGE_FILE_SIZE) {
        return null; // 文件太大，返回 null 以回退到文本显示
    }
    // 在实际实现中，这里应该调整图像大小
    // 简化版本：直接返回原始 stdout
    return stdout;
}
/**
 * 重置 CWD 如果在项目外部
 */
function resetCwdIfOutsideProject(permissionContext) {
    // 简化实现：总是返回 false
    // 在实际实现中，应该检查当前目录是否在允许的工作路径内
    return false;
}
/**
 * 为 shell 重置消息追加 stderr
 */
function stdErrAppendShellResetMessage(stderr) {
    if (!stderr) {
        return 'Working directory was reset to project root.';
    }
    return `${stderr}\nWorking directory was reset to project root.`;
}
/**
 * 检查命令是否包含 CD 操作
 */
function commandHasAnyCd(command) {
    const cdPatterns = [
        /^cd\b/i,
        /&&\s+cd\b/i,
        /;\s+cd\b/i,
        /\|\s+cd\b/i,
        /\|\|\s+cd\b/i,
    ];
    return cdPatterns.some(pattern => pattern.test(command));
}
/**
 * 分割命令（简化的实现）
 */
function splitCommand_DEPRECATED(command) {
    if (!command || command.trim().length === 0) {
        return [];
    }
    // 简单分割：按分号、逻辑操作符分割
    // 注意：这不是完整的 shell 解析，只用于简单情况
    const parts = [];
    let currentPart = '';
    let inQuotes = false;
    let quoteChar = '';
    for (let i = 0; i < command.length; i++) {
        const char = command[i];
        // 处理引号
        if ((char === '"' || char === "'") && (i === 0 || command[i - 1] !== '\\')) {
            if (!inQuotes) {
                inQuotes = true;
                quoteChar = char;
            }
            else if (char === quoteChar) {
                inQuotes = false;
                quoteChar = '';
            }
        }
        // 如果不是在引号内，检查分割符
        if (!inQuotes) {
            // 检查分号（命令分隔符）
            if (char === ';' && (i === 0 || command[i - 1] !== '\\')) {
                if (currentPart.trim()) {
                    parts.push(currentPart.trim());
                }
                currentPart = '';
                continue;
            }
            // 检查逻辑操作符
            if (i < command.length - 1) {
                const twoChars = command.substring(i, i + 2);
                if (twoChars === '&&' || twoChars === '||') {
                    if (currentPart.trim()) {
                        parts.push(currentPart.trim());
                    }
                    parts.push(twoChars);
                    currentPart = '';
                    i++; // 跳过第二个字符
                    continue;
                }
            }
        }
        currentPart += char;
    }
    // 添加最后一部分
    if (currentPart.trim()) {
        parts.push(currentPart.trim());
    }
    return parts;
}
/**
 * 提取命令的基础命令（第一个单词）
 */
function extractBaseCommand(command) {
    if (!command || command.trim().length === 0) {
        return '';
    }
    // 移除前导的环境变量赋值
    let remaining = command.trim();
    while (remaining.match(/^[A-Za-z_]\w*=/) && remaining.includes(' ')) {
        remaining = remaining.substring(remaining.indexOf(' ') + 1);
    }
    // 提取第一个单词
    const firstWordMatch = remaining.match(/^(\S+)/);
    if (!firstWordMatch) {
        return '';
    }
    let baseCommand = firstWordMatch[1];
    // 处理管道：获取第一个管道前的命令
    if (baseCommand.includes('|')) {
        const pipeParts = baseCommand.split('|');
        baseCommand = pipeParts[0].trim();
    }
    // 处理路径：获取命令名（不是路径）
    if (baseCommand.includes('/')) {
        const pathParts = baseCommand.split('/');
        baseCommand = pathParts[pathParts.length - 1];
    }
    return baseCommand.toLowerCase();
}
/**
 * 检查输出是否被截断
 */
function isOutputTruncated(output) {
    const MAX_OUTPUT_LENGTH = 10000; // 10KB
    return output.length > MAX_OUTPUT_LENGTH;
}
/**
 * 获取输出的预览
 */
function getOutputPreview(output, maxLength = 1000) {
    if (output.length <= maxLength) {
        return output;
    }
    const half = Math.floor(maxLength / 2);
    const beginning = output.substring(0, half);
    const end = output.substring(output.length - half);
    return `${beginning}\n... [输出被截断，共 ${output.length} 字符] ...\n${end}`;
}
//# sourceMappingURL=utils.js.map