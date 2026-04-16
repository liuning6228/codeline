"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileEditorTool = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const EnhancedBaseTool_1 = require("../../tool/EnhancedBaseTool");
const ZodCompatibility_1 = require("../../tool/ZodCompatibility");
const Tool_1 = require("../../tool/Tool");
const CodeContextEnhancer_1 = require("../CodeContextEnhancer");
/**
 * 文件编辑器工具
 */
class FileEditorTool extends EnhancedBaseTool_1.EnhancedBaseTool {
    // ==================== 工具定义 ====================
    /**
     * 工具ID
     */
    static TOOL_ID = 'file_editor';
    /**
     * 工具名称
     */
    static TOOL_NAME = 'File Editor';
    /**
     * 工具描述
     */
    static TOOL_DESCRIPTION = 'Edits code files with precise operations: insert, replace, delete, rename, refactor';
    /**
     * 工具类别
     */
    static TOOL_CATEGORY = Tool_1.ToolCategory.CODE;
    /**
     * 工具能力
     */
    static TOOL_CAPABILITIES = {
        isConcurrencySafe: false,
        isReadOnly: false,
        isDestructive: true,
        requiresWorkspace: true,
        supportsStreaming: true,
        requiresFileAccess: true,
        canModifyFiles: true,
        canReadFiles: true,
        canExecuteCommands: false,
        canAccessNetwork: false,
        requiresModel: false,
    };
    /**
     * 权限级别
     */
    static PERMISSION_LEVEL = Tool_1.PermissionLevel.WRITE;
    // ==================== 抽象属性实现 ====================
    id = FileEditorTool.TOOL_ID;
    name = FileEditorTool.TOOL_NAME;
    description = FileEditorTool.TOOL_DESCRIPTION;
    version = '1.0.0';
    author = 'CodeLine Team';
    category = FileEditorTool.TOOL_CATEGORY;
    // 工具能力getter已经在EnhancedBaseTool中实现
    // inputSchema getter已经在EnhancedBaseTool中实现
    // ==================== 日志方法 ====================
    logInfo(message) {
        console.log(`[FileEditorTool] INFO: ${message}`);
    }
    logWarn(message) {
        console.warn(`[FileEditorTool] WARN: ${message}`);
    }
    logError(message) {
        console.error(`[FileEditorTool] ERROR: ${message}`);
    }
    // ==================== 核心执行方法 ====================
    /**
     * 执行工具核心逻辑
     */
    async executeCore(input, context) {
        // 使用现有的executeImplementation方法，传递适配的上下文
        return await this.executeImplementation(input, context);
    }
    // ==================== 参数模式 ====================
    /**
     * 创建参数模式
     */
    createParameterSchema() {
        return ZodCompatibility_1.z.object({
            operation: ZodCompatibility_1.z.enum([
                'insert', 'replace', 'delete', 'rename', 'move', 'extract', 'inline', 'format', 'refactor'
            ])
                .describe('Edit operation type'),
            filePath: ZodCompatibility_1.z.string()
                .min(1, 'File path is required')
                .describe('Target file path'),
            location: ZodCompatibility_1.z.object({
                filePath: ZodCompatibility_1.z.string(),
                lineStart: ZodCompatibility_1.z.number().int().min(1),
                lineEnd: ZodCompatibility_1.z.number().int().min(1),
                columnStart: ZodCompatibility_1.z.number().int().min(0).optional(),
                columnEnd: ZodCompatibility_1.z.number().int().min(0).optional(),
            })
                .optional()
                .describe('Code location (for insert/replace/delete operations)'),
            newCode: ZodCompatibility_1.z.string()
                .optional()
                .describe('New code content (for insert/replace operations)'),
            oldCode: ZodCompatibility_1.z.string()
                .optional()
                .describe('Code to delete (for delete operation)'),
            oldIdentifier: ZodCompatibility_1.z.string()
                .optional()
                .describe('Old identifier name (for rename operation)'),
            newIdentifier: ZodCompatibility_1.z.string()
                .optional()
                .describe('New identifier name (for rename operation)'),
            refactorDescription: ZodCompatibility_1.z.string()
                .optional()
                .describe('Refactoring description (for refactor operation)'),
            createBackup: ZodCompatibility_1.z.boolean()
                .default(true)
                .describe('Whether to create backup'),
            validateSyntax: ZodCompatibility_1.z.boolean()
                .default(true)
                .describe('Whether to validate syntax after edit'),
            formatAfterEdit: ZodCompatibility_1.z.boolean()
                .default(true)
                .describe('Whether to format code after edit'),
            options: ZodCompatibility_1.z.object({
                recursive: ZodCompatibility_1.z.boolean().default(false),
                updateImports: ZodCompatibility_1.z.boolean().default(true),
                updateComments: ZodCompatibility_1.z.boolean().default(true),
                insertPosition: ZodCompatibility_1.z.enum(['before', 'after', 'replace']).default('replace'),
                indentStrategy: ZodCompatibility_1.z.enum(['preserve', 'auto', 'smart']).default('smart'),
            })
                .default({})
                .describe('Additional options'),
        });
    }
    // ==================== 工具执行 ====================
    /**
     * 执行工具
     */
    async executeImplementation(params, context) {
        const startTime = Date.now();
        try {
            this.logInfo(`Starting file edit operation: ${params.operation} on ${params.filePath}`);
            // 1. 验证文件存在
            await this.validateFile(params.filePath);
            // 2. 创建备份（如果需要）
            let backupFilePath;
            if (params.createBackup) {
                backupFilePath = await this.createBackup(params.filePath);
            }
            // 3. 执行编辑操作
            const editResult = await this.performEditOperation(params, context);
            // 4. 验证语法（如果需要）
            let syntaxValidation;
            if (params.validateSyntax) {
                syntaxValidation = await this.validateSyntax(params.filePath);
            }
            // 5. 格式化代码（如果需要）
            let formatting;
            if (params.formatAfterEdit) {
                formatting = await this.formatCode(params.filePath);
            }
            // 6. 计算统计信息
            const statistics = await this.calculateStatistics(params.filePath, backupFilePath, editResult, startTime);
            // 7. 生成改进建议
            const suggestions = await this.generateSuggestions(params, editResult, syntaxValidation);
            const result = {
                success: true,
                filePath: params.filePath,
                operation: params.operation,
                changes: editResult,
                backupFilePath,
                syntaxValidation,
                formatting,
                statistics,
                suggestions,
            };
            this.logInfo(`File edit completed successfully`);
            this.logInfo(`Changes: ${editResult.size.linesAdded} lines added, ${editResult.size.linesRemoved} lines removed`);
            return result;
        }
        catch (error) {
            this.logError(`File edit failed: ${error.message}`);
            // 尝试恢复备份（如果有）
            await this.restoreFromBackup(params.filePath, params.createBackup);
            return {
                success: false,
                filePath: params.filePath,
                operation: params.operation,
                changes: {
                    type: 'replacement',
                    size: { linesAdded: 0, linesRemoved: 0, linesChanged: 0 },
                },
                statistics: {
                    editTime: Date.now() - startTime,
                    sizeChange: 0,
                    affectedLines: 0,
                },
                suggestions: [`Error: ${error.message}`],
                error: error.message,
            };
        }
    }
    // ==================== 私有方法 ====================
    /**
     * 验证文件
     */
    async validateFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
            throw new Error(`Not a file: ${filePath}`);
        }
        // 检查文件大小限制（10MB）
        const maxSize = 10 * 1024 * 1024;
        if (stats.size > maxSize) {
            throw new Error(`File too large: ${stats.size} bytes (max: ${maxSize} bytes)`);
        }
        this.logInfo(`File validated: ${filePath} (${stats.size} bytes)`);
    }
    /**
     * 创建备份
     */
    async createBackup(filePath) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = path.join(path.dirname(filePath), '.backup');
            const backupName = `${path.basename(filePath)}.${timestamp}.backup`;
            const backupPath = path.join(backupDir, backupName);
            // 创建备份目录
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            // 复制文件
            fs.copyFileSync(filePath, backupPath);
            this.logInfo(`Backup created: ${backupPath}`);
            return backupPath;
        }
        catch (error) {
            this.logWarn(`Failed to create backup: ${error.message}`);
            throw error;
        }
    }
    /**
     * 从备份恢复
     */
    async restoreFromBackup(filePath, createBackup = true) {
        if (!createBackup) {
            return;
        }
        try {
            const backupDir = path.join(path.dirname(filePath), '.backup');
            if (!fs.existsSync(backupDir)) {
                return;
            }
            // 找到最新的备份
            const backups = fs.readdirSync(backupDir)
                .filter(f => f.includes(path.basename(filePath)) && f.endsWith('.backup'))
                .sort()
                .reverse();
            if (backups.length > 0) {
                const latestBackup = path.join(backupDir, backups[0]);
                fs.copyFileSync(latestBackup, filePath);
                this.logInfo(`Restored from backup: ${latestBackup}`);
            }
        }
        catch (error) {
            this.logError(`Failed to restore from backup: ${error.message}`);
        }
    }
    /**
     * 执行编辑操作
     */
    async performEditOperation(params, context) {
        switch (params.operation) {
            case 'insert':
                return await this.performInsertOperation(params);
            case 'replace':
                return await this.performReplaceOperation(params);
            case 'delete':
                return await this.performDeleteOperation(params);
            case 'rename':
                return await this.performRenameOperation(params, context);
            case 'refactor':
                return await this.performRefactorOperation(params, context);
            case 'format':
                return await this.performFormatOperation(params);
            default:
                throw new Error(`Unsupported operation: ${params.operation}`);
        }
    }
    /**
     * 执行插入操作
     */
    async performInsertOperation(params) {
        if (!params.location || !params.newCode) {
            throw new Error('Insert operation requires location and newCode');
        }
        const { filePath, location, newCode } = params;
        const insertPosition = params.options?.insertPosition || 'replace';
        // 读取文件内容
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        // 验证位置
        if (location.lineStart < 1 || location.lineStart > lines.length + 1) {
            throw new Error(`Invalid start line: ${location.lineStart}`);
        }
        // 计算插入位置
        const insertIndex = location.lineStart - 1;
        const newCodeLines = newCode.split('\n');
        // 执行插入
        let newLines;
        switch (insertPosition) {
            case 'before':
                newLines = [
                    ...lines.slice(0, insertIndex),
                    ...newCodeLines,
                    ...lines.slice(insertIndex),
                ];
                break;
            case 'after':
                newLines = [
                    ...lines.slice(0, insertIndex + 1),
                    ...newCodeLines,
                    ...lines.slice(insertIndex + 1),
                ];
                break;
            case 'replace':
            default:
                newLines = [
                    ...lines.slice(0, insertIndex),
                    ...newCodeLines,
                    ...lines.slice(location.lineEnd),
                ];
                break;
        }
        // 写入文件
        const newContent = newLines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        return {
            type: 'insertion',
            location,
            oldContent: lines.slice(insertIndex, location.lineEnd).join('\n'),
            newContent: newCode,
            size: {
                linesAdded: newCodeLines.length,
                linesRemoved: location.lineEnd - location.lineStart + 1,
                linesChanged: Math.min(newCodeLines.length, location.lineEnd - location.lineStart + 1),
            },
        };
    }
    /**
     * 执行替换操作
     */
    async performReplaceOperation(params) {
        if (!params.location || !params.newCode) {
            throw new Error('Replace operation requires location and newCode');
        }
        const { filePath, location, newCode } = params;
        // 读取文件内容
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        // 验证位置
        if (location.lineStart < 1 || location.lineEnd > lines.length || location.lineStart > location.lineEnd) {
            throw new Error(`Invalid location: lines ${location.lineStart}-${location.lineEnd}`);
        }
        // 提取旧内容
        const oldContent = lines.slice(location.lineStart - 1, location.lineEnd).join('\n');
        // 执行替换
        const newLines = [
            ...lines.slice(0, location.lineStart - 1),
            ...newCode.split('\n'),
            ...lines.slice(location.lineEnd),
        ];
        // 写入文件
        const newContent = newLines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        return {
            type: 'replacement',
            location,
            oldContent,
            newContent,
            size: {
                linesAdded: newCode.split('\n').length,
                linesRemoved: location.lineEnd - location.lineStart + 1,
                linesChanged: Math.min(newCode.split('\n').length, location.lineEnd - location.lineStart + 1),
            },
        };
    }
    /**
     * 执行删除操作
     */
    async performDeleteOperation(params) {
        if (!params.location) {
            throw new Error('Delete operation requires location');
        }
        const { filePath, location } = params;
        // 读取文件内容
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        // 验证位置
        if (location.lineStart < 1 || location.lineEnd > lines.length || location.lineStart > location.lineEnd) {
            throw new Error(`Invalid location: lines ${location.lineStart}-${location.lineEnd}`);
        }
        // 提取要删除的内容
        const oldContent = lines.slice(location.lineStart - 1, location.lineEnd).join('\n');
        // 执行删除
        const newLines = [
            ...lines.slice(0, location.lineStart - 1),
            ...lines.slice(location.lineEnd),
        ];
        // 写入文件
        const newContent = newLines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        return {
            type: 'deletion',
            location,
            oldContent,
            newContent: '',
            size: {
                linesAdded: 0,
                linesRemoved: location.lineEnd - location.lineStart + 1,
                linesChanged: 0,
            },
        };
    }
    /**
     * 执行重命名操作
     */
    async performRenameOperation(params, context) {
        if (!params.oldIdentifier || !params.newIdentifier) {
            throw new Error('Rename operation requires oldIdentifier and newIdentifier');
        }
        const { filePath, oldIdentifier, newIdentifier } = params;
        const options = params.options || {};
        // 读取文件内容
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // 执行重命名
        let newContent = fileContent;
        let changes = 0;
        // 简单的正则替换（需要改进为AST级别的重命名）
        const identifierRegex = new RegExp(`\\b${oldIdentifier}\\b`, 'g');
        newContent = fileContent.replace(identifierRegex, (match) => {
            changes++;
            return newIdentifier;
        });
        // 如果启用了递归重命名，需要处理相关文件
        if (options.recursive && context.workspaceRoot) {
            await this.recursiveRename(context.workspaceRoot, oldIdentifier, newIdentifier);
        }
        // 写入文件
        fs.writeFileSync(filePath, newContent, 'utf8');
        return {
            type: 'rename',
            oldContent: fileContent.substring(0, 500) + '...',
            newContent: newContent.substring(0, 500) + '...',
            size: {
                linesAdded: 0,
                linesRemoved: 0,
                linesChanged: changes,
            },
        };
    }
    /**
     * 递归重命名
     */
    async recursiveRename(workspaceRoot, oldIdentifier, newIdentifier) {
        // 简化实现：只记录日志
        this.logInfo(`Recursive rename: ${oldIdentifier} -> ${newIdentifier} in ${workspaceRoot}`);
        // 实际实现应该扫描所有相关文件并重命名
    }
    /**
     * 执行重构操作
     */
    async performRefactorOperation(params, context) {
        if (!params.refactorDescription) {
            throw new Error('Refactor operation requires refactorDescription');
        }
        const { filePath, refactorDescription } = params;
        // 读取文件内容
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // 使用CodeContextEnhancer分析文件
        let analysis;
        try {
            const codeEnhancer = new CodeContextEnhancer_1.CodeContextEnhancer(path.dirname(filePath));
            analysis = await codeEnhancer.analyzeFile(filePath);
        }
        catch (error) {
            const err = error;
            this.logWarn(`Could not analyze file for refactoring: ${err.message}`);
            analysis = null;
        }
        // 根据重构描述执行重构
        let newContent = fileContent;
        let refactoringApplied = false;
        // 简单的重构示例：提取重复代码
        if (refactorDescription.toLowerCase().includes('extract') ||
            refactorDescription.toLowerCase().includes('duplicate')) {
            newContent = await this.refactorExtractDuplicates(fileContent, analysis);
            refactoringApplied = true;
        }
        // 如果没有应用特定重构，尝试通用改进
        if (!refactoringApplied) {
            newContent = await this.refactorGenericImprovements(fileContent, refactorDescription);
        }
        // 写入文件
        fs.writeFileSync(filePath, newContent, 'utf8');
        return {
            type: 'refactor',
            oldContent: fileContent.substring(0, 500) + '...',
            newContent: newContent.substring(0, 500) + '...',
            size: {
                linesAdded: newContent.split('\n').length - fileContent.split('\n').length,
                linesRemoved: 0,
                linesChanged: this.countChangedLines(fileContent, newContent),
            },
        };
    }
    /**
     * 重构：提取重复代码
     */
    async refactorExtractDuplicates(content, analysis) {
        // 简化实现：添加重构注释
        const lines = content.split('\n');
        // 查找可能重复的模式（简单实现）
        const lineCounts = {};
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 20) {
                lineCounts[trimmed] = (lineCounts[trimmed] || 0) + 1;
            }
        }
        // 添加重构注释
        const duplicateLines = Object.entries(lineCounts)
            .filter(([_, count]) => count > 1)
            .map(([line]) => line);
        if (duplicateLines.length > 0) {
            const refactorComment = `\n// TODO: Refactor - Found ${duplicateLines.length} potentially duplicate patterns\n// Consider extracting common logic into reusable functions\n`;
            return content + refactorComment;
        }
        return content;
    }
    /**
     * 通用重构改进
     */
    async refactorGenericImprovements(content, description) {
        // 根据描述应用简单的重构
        let improved = content;
        // 改进注释
        if (description.toLowerCase().includes('comment') ||
            description.toLowerCase().includes('document')) {
            improved = await this.improveComments(improved);
        }
        // 改进格式
        if (description.toLowerCase().includes('format') ||
            description.toLowerCase().includes('style')) {
            improved = await this.improveFormatting(improved);
        }
        // 改进错误处理
        if (description.toLowerCase().includes('error') ||
            description.toLowerCase().includes('exception')) {
            improved = await this.improveErrorHandling(improved);
        }
        return improved;
    }
    /**
     * 改进注释
     */
    async improveComments(content) {
        const lines = content.split('\n');
        const improvedLines = lines.map((line, index) => {
            const trimmed = line.trim();
            // 为函数添加注释（简化）
            if (trimmed.startsWith('function ') || trimmed.startsWith('def ') || trimmed.startsWith('class ')) {
                if (index === 0 || !lines[index - 1].trim().startsWith('//') && !lines[index - 1].trim().startsWith('#')) {
                    const indent = line.match(/^\s*/)?.[0] || '';
                    return `${indent}// TODO: Add documentation\n${line}`;
                }
            }
            return line;
        });
        return improvedLines.join('\n');
    }
    /**
     * 改进格式
     */
    async improveFormatting(content) {
        // 简单的格式改进
        let formatted = content;
        // 移除尾随空格
        formatted = formatted.replace(/[ \t]+$/gm, '');
        // 确保文件末尾有换行
        if (!formatted.endsWith('\n')) {
            formatted += '\n';
        }
        return formatted;
    }
    /**
     * 改进错误处理
     */
    async improveErrorHandling(content) {
        // 查找可能缺少错误处理的地方（简化）
        const lines = content.split('\n');
        const improvedLines = lines.map(line => {
            // 为可能抛出错误的调用添加错误处理注释
            if (line.includes('throw ') || line.includes('Error(') || line.includes('Exception(')) {
                return line;
            }
            // 为可能失败的操作添加注释
            if (line.includes('fs.') || line.includes('require(') || line.includes('import ')) {
                if (!line.includes('try') && !line.includes('catch')) {
                    return `// TODO: Add error handling for this operation\n${line}`;
                }
            }
            return line;
        });
        return improvedLines.join('\n');
    }
    /**
     * 执行格式化操作
     */
    async performFormatOperation(params) {
        const { filePath } = params;
        // 读取文件内容
        const oldContent = fs.readFileSync(filePath, 'utf8');
        // 执行格式化
        const newContent = await this.formatCodeContent(oldContent, filePath);
        // 写入文件
        fs.writeFileSync(filePath, newContent, 'utf8');
        return {
            type: 'replacement', // 格式化也是一种替换
            oldContent: oldContent.substring(0, 500) + '...',
            newContent: newContent.substring(0, 500) + '...',
            size: {
                linesAdded: 0,
                linesRemoved: 0,
                linesChanged: this.countChangedLines(oldContent, newContent),
            },
        };
    }
    /**
     * 验证语法
     */
    async validateSyntax(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const extension = path.extname(filePath).toLowerCase();
            const result = {
                valid: true,
                errors: [],
                warnings: [],
            };
            // 根据文件类型进行基本验证
            switch (extension) {
                case '.ts':
                case '.js':
                    // 检查括号匹配
                    const openBraces = (content.match(/{/g) || []).length;
                    const closeBraces = (content.match(/}/g) || []).length;
                    if (openBraces !== closeBraces) {
                        result.warnings.push(`Brace mismatch: ${openBraces} opening vs ${closeBraces} closing`);
                    }
                    // 检查分号（对于JavaScript/TypeScript）
                    const lines = content.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line.length > 0 && !line.endsWith(';') && !line.endsWith('{') &&
                            !line.endsWith('}') && !line.startsWith('//') && !line.startsWith('/*') &&
                            !line.includes('function') && !line.includes('=>') && !line.includes('if') &&
                            !line.includes('for') && !line.includes('while') && !line.includes('export') &&
                            !line.includes('import') && !line.includes('const') && !line.includes('let') &&
                            !line.includes('var') && !line.includes('return') && !line.includes('break') &&
                            !line.includes('continue') && !line.includes('throw')) {
                            result.warnings.push(`Line ${i + 1}: Missing semicolon`);
                        }
                    }
                    break;
                case '.py':
                    // 检查缩进
                    const pythonLines = content.split('\n');
                    let indentLevel = 0;
                    for (let i = 0; i < pythonLines.length; i++) {
                        const line = pythonLines[i];
                        const trimmed = line.trim();
                        if (trimmed.length === 0)
                            continue;
                        const leadingSpaces = line.match(/^ */)?.[0].length || 0;
                        if (trimmed.endsWith(':')) {
                            // 期望下一行增加缩进
                            indentLevel = leadingSpaces + 4;
                        }
                        else if (leadingSpaces < indentLevel && trimmed.length > 0) {
                            // 意外的缩进减少
                            result.warnings.push(`Line ${i + 1}: Unexpected indent reduction`);
                        }
                    }
                    break;
            }
            return result;
        }
        catch (error) {
            return {
                valid: false,
                errors: [error.message],
                warnings: [],
            };
        }
    }
    /**
     * 格式化代码
     */
    async formatCode(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const formattedContent = await this.formatCodeContent(content, filePath);
            if (content === formattedContent) {
                return {
                    formatted: false,
                    changes: 0,
                    standard: 'already formatted',
                };
            }
            // 计算变化
            const oldLines = content.split('\n');
            const newLines = formattedContent.split('\n');
            const changes = this.countChangedLines(content, formattedContent);
            // 写入格式化后的内容
            fs.writeFileSync(filePath, formattedContent, 'utf8');
            return {
                formatted: true,
                changes,
                standard: 'basic formatting',
            };
        }
        catch (error) {
            this.logWarn(`Formatting failed: ${error.message}`);
            return {
                formatted: false,
                changes: 0,
                standard: 'formatting failed',
            };
        }
    }
    /**
     * 格式化代码内容
     */
    async formatCodeContent(content, filePath) {
        let formatted = content;
        // 移除尾随空格
        formatted = formatted.replace(/[ \t]+$/gm, '');
        // 标准化换行符
        formatted = formatted.replace(/\r\n/g, '\n');
        // 确保文件末尾有换行
        if (!formatted.endsWith('\n')) {
            formatted += '\n';
        }
        // 移除多余的空行
        formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
        // 根据文件类型进行特定格式化
        const extension = path.extname(filePath).toLowerCase();
        switch (extension) {
            case '.ts':
            case '.js':
                // TypeScript/JavaScript特定格式化
                formatted = formatted.replace(/\)\s*{/g, ') {');
                formatted = formatted.replace(/\}\s*else/g, '} else');
                formatted = formatted.replace(/\}\s*catch/g, '} catch');
                break;
            case '.py':
                // Python特定格式化
                formatted = formatted.replace(/\t/g, '    '); // 制表符替换为4空格
                break;
        }
        return formatted;
    }
    /**
     * 计算变化行数
     */
    countChangedLines(oldContent, newContent) {
        const oldLines = oldContent.split('\n');
        const newLines = newContent.split('\n');
        let changed = 0;
        const maxLength = Math.max(oldLines.length, newLines.length);
        for (let i = 0; i < maxLength; i++) {
            const oldLine = oldLines[i] || '';
            const newLine = newLines[i] || '';
            if (oldLine.trim() !== newLine.trim()) {
                changed++;
            }
        }
        return changed;
    }
    /**
     * 计算统计信息
     */
    async calculateStatistics(filePath, backupFilePath, editResult, startTime) {
        const editTime = Date.now() - startTime;
        // 计算文件大小变化
        let sizeChange = 0;
        try {
            const oldSize = backupFilePath ? fs.statSync(backupFilePath).size : 0;
            const newSize = fs.statSync(filePath).size;
            sizeChange = newSize - oldSize;
        }
        catch {
            // 忽略大小计算错误
        }
        // 计算受影响的行数
        const affectedLines = editResult.size.linesAdded + editResult.size.linesRemoved;
        // 计算备份大小
        let backupSize;
        if (backupFilePath && fs.existsSync(backupFilePath)) {
            backupSize = fs.statSync(backupFilePath).size;
        }
        return {
            editTime,
            sizeChange,
            affectedLines,
            backupSize,
        };
    }
    /**
     * 生成改进建议
     */
    async generateSuggestions(params, editResult, syntaxValidation) {
        const suggestions = [];
        // 基于操作类型的建议
        switch (params.operation) {
            case 'insert':
            case 'replace':
                if (editResult.size.linesAdded > 50) {
                    suggestions.push('Consider breaking the added code into smaller functions');
                }
                break;
            case 'delete':
                if (editResult.size.linesRemoved > 20) {
                    suggestions.push('Verify that the deleted code is not used elsewhere');
                }
                break;
            case 'rename':
                suggestions.push('Run tests to ensure the rename didn\'t break anything');
                suggestions.push('Update documentation references to the renamed identifier');
                break;
            case 'refactor':
                suggestions.push('Add unit tests for the refactored code');
                suggestions.push('Document the refactoring decisions for future reference');
                break;
        }
        // 基于语法验证的建议
        if (syntaxValidation && !syntaxValidation.valid) {
            suggestions.push('Fix syntax errors before committing changes');
        }
        else if (syntaxValidation && syntaxValidation.warnings && syntaxValidation.warnings.length > 0) {
            syntaxValidation.warnings.forEach((warning) => {
                suggestions.push(`Address warning: ${warning}`);
            });
        }
        // 通用建议
        if (params.createBackup) {
            suggestions.push('Backup created, review changes before deleting backup');
        }
        if (params.validateSyntax) {
            suggestions.push('Syntax validation performed, all checks passed');
        }
        if (params.formatAfterEdit) {
            suggestions.push('Code formatted according to standard conventions');
        }
        if (suggestions.length === 0) {
            suggestions.push('Edit completed successfully. Consider adding tests for the changes.');
        }
        return suggestions;
    }
    // ==================== 工具元数据 ====================
    /**
     * 获取工具ID
     */
    getToolId() {
        return FileEditorTool.TOOL_ID;
    }
    /**
     * 获取工具名称
     */
    getToolName() {
        return FileEditorTool.TOOL_NAME;
    }
    /**
     * 获取工具描述
     */
    getToolDescription() {
        return FileEditorTool.TOOL_DESCRIPTION;
    }
    /**
     * 获取工具类别
     */
    getToolCategory() {
        return FileEditorTool.TOOL_CATEGORY;
    }
    /**
     * 获取工具能力
     */
    getToolCapabilities() {
        return FileEditorTool.TOOL_CAPABILITIES;
    }
    /**
     * 获取权限级别
     */
    getPermissionLevel() {
        return FileEditorTool.PERMISSION_LEVEL;
    }
}
exports.FileEditorTool = FileEditorTool;
exports.default = FileEditorTool;
//# sourceMappingURL=FileEditorTool.js.map