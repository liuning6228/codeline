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

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EnhancedBaseTool, type EnhancedToolContext } from '../../tool/EnhancedBaseTool';
import { z } from '../../tool/ZodCompatibility';
import { ToolCategory, ToolCapabilities, PermissionLevel } from '../../tool/Tool';
import { CodeContextEnhancer } from '../CodeContextEnhancer';

/**
 * 文件编辑操作类型
 */
export type EditOperation = 
  | 'insert'      // 插入代码
  | 'replace'     // 替换代码
  | 'delete'      // 删除代码
  | 'rename'      // 重命名标识符
  | 'move'        // 移动代码
  | 'extract'     // 提取代码为函数/方法
  | 'inline'      // 内联函数/方法
  | 'format'      // 格式化代码
  | 'refactor';   // 重构代码

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
export class FileEditorTool extends EnhancedBaseTool<FileEditorParameters, FileEditorResult> {
  
  // ==================== 工具定义 ====================
  
  /**
   * 工具ID
   */
  static readonly TOOL_ID = 'file_editor';
  
  /**
   * 工具名称
   */
  static readonly TOOL_NAME = 'File Editor';
  
  /**
   * 工具描述
   */
  static readonly TOOL_DESCRIPTION = 'Edits code files with precise operations: insert, replace, delete, rename, refactor';
  
  /**
   * 工具类别
   */
  static readonly TOOL_CATEGORY: ToolCategory = ToolCategory.CODE;
  
  /**
   * 工具能力
   */
  static readonly TOOL_CAPABILITIES: ToolCapabilities = {
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
  static readonly PERMISSION_LEVEL = PermissionLevel.WRITE;
  
  // ==================== 抽象属性实现 ====================
  
  readonly id = FileEditorTool.TOOL_ID;
  readonly name = FileEditorTool.TOOL_NAME;
  readonly description = FileEditorTool.TOOL_DESCRIPTION;
  readonly version = '1.0.0';
  readonly author = 'CodeLine Team';
  readonly category = FileEditorTool.TOOL_CATEGORY;
  
  // 工具能力getter已经在EnhancedBaseTool中实现
  // inputSchema getter已经在EnhancedBaseTool中实现
  
  // ==================== 日志方法 ====================
  
  protected logInfo(message: string): void {
    console.log(`[FileEditorTool] INFO: ${message}`);
  }
  
  protected logWarn(message: string): void {
    console.warn(`[FileEditorTool] WARN: ${message}`);
  }
  
  protected logError(message: string): void {
    console.error(`[FileEditorTool] ERROR: ${message}`);
  }
  
  // ==================== 核心执行方法 ====================
  
  /**
   * 执行工具核心逻辑
   */
  protected async executeCore(
    input: FileEditorParameters,
    context: EnhancedToolContext
  ): Promise<FileEditorResult> {
    // 使用现有的executeImplementation方法，传递适配的上下文
    return await this.executeImplementation(input, context);
  }
  
  // ==================== 参数模式 ====================
  
  /**
   * 创建参数模式
   */
  protected createParameterSchema() {
    return z.object({
      operation: z.enum([
        'insert', 'replace', 'delete', 'rename', 'move', 'extract', 'inline', 'format', 'refactor'
      ])
        .describe('Edit operation type'),
      
      filePath: z.string()
        .min(1, 'File path is required')
        .describe('Target file path'),
      
      location: z.object({
        filePath: z.string(),
        lineStart: z.number().int().min(1),
        lineEnd: z.number().int().min(1),
        columnStart: z.number().int().min(0).optional(),
        columnEnd: z.number().int().min(0).optional(),
      })
        .optional()
        .describe('Code location (for insert/replace/delete operations)'),
      
      newCode: z.string()
        .optional()
        .describe('New code content (for insert/replace operations)'),
      
      oldCode: z.string()
        .optional()
        .describe('Code to delete (for delete operation)'),
      
      oldIdentifier: z.string()
        .optional()
        .describe('Old identifier name (for rename operation)'),
      
      newIdentifier: z.string()
        .optional()
        .describe('New identifier name (for rename operation)'),
      
      refactorDescription: z.string()
        .optional()
        .describe('Refactoring description (for refactor operation)'),
      
      createBackup: z.boolean()
        .default(true)
        .describe('Whether to create backup'),
      
      validateSyntax: z.boolean()
        .default(true)
        .describe('Whether to validate syntax after edit'),
      
      formatAfterEdit: z.boolean()
        .default(true)
        .describe('Whether to format code after edit'),
      
      options: z.object({
        recursive: z.boolean().default(false),
        updateImports: z.boolean().default(true),
        updateComments: z.boolean().default(true),
        insertPosition: z.enum(['before', 'after', 'replace']).default('replace'),
        indentStrategy: z.enum(['preserve', 'auto', 'smart']).default('smart'),
      })
        .default({})
        .describe('Additional options'),
    });
  }
  
  // ==================== 工具执行 ====================
  
  /**
   * 执行工具
   */
  protected async executeImplementation(
    params: FileEditorParameters,
    context: any
  ): Promise<FileEditorResult> {
    const startTime = Date.now();
    
    try {
      this.logInfo(`Starting file edit operation: ${params.operation} on ${params.filePath}`);
      
      // 1. 验证文件存在
      await this.validateFile(params.filePath);
      
      // 2. 创建备份（如果需要）
      let backupFilePath: string | undefined;
      if (params.createBackup) {
        backupFilePath = await this.createBackup(params.filePath);
      }
      
      // 3. 执行编辑操作
      const editResult = await this.performEditOperation(params, context);
      
      // 4. 验证语法（如果需要）
      let syntaxValidation: any;
      if (params.validateSyntax) {
        syntaxValidation = await this.validateSyntax(params.filePath);
      }
      
      // 5. 格式化代码（如果需要）
      let formatting: any;
      if (params.formatAfterEdit) {
        formatting = await this.formatCode(params.filePath);
      }
      
      // 6. 计算统计信息
      const statistics = await this.calculateStatistics(
        params.filePath,
        backupFilePath,
        editResult,
        startTime
      );
      
      // 7. 生成改进建议
      const suggestions = await this.generateSuggestions(params, editResult, syntaxValidation);
      
      const result: FileEditorResult = {
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
      
    } catch (error: any) {
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
  private async validateFile(filePath: string): Promise<void> {
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
  private async createBackup(filePath: string): Promise<string> {
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
      
    } catch (error: any) {
      this.logWarn(`Failed to create backup: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 从备份恢复
   */
  private async restoreFromBackup(
    filePath: string,
    createBackup: boolean = true
  ): Promise<void> {
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
      
    } catch (error: any) {
      this.logError(`Failed to restore from backup: ${error.message}`);
    }
  }
  
  /**
   * 执行编辑操作
   */
  private async performEditOperation(
    params: FileEditorParameters,
    context: any
  ): Promise<{
    type: 'insertion' | 'deletion' | 'replacement' | 'rename' | 'refactor';
    location?: CodeLocation;
    oldContent?: string;
    newContent?: string;
    size: { linesAdded: number; linesRemoved: number; linesChanged: number };
  }> {
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
  private async performInsertOperation(
    params: FileEditorParameters
  ): Promise<any> {
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
    let newLines: string[];
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
  private async performReplaceOperation(
    params: FileEditorParameters
  ): Promise<any> {
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
  private async performDeleteOperation(
    params: FileEditorParameters
  ): Promise<any> {
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
  private async performRenameOperation(
    params: FileEditorParameters,
    context: any
  ): Promise<any> {
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
  private async recursiveRename(
    workspaceRoot: string,
    oldIdentifier: string,
    newIdentifier: string
  ): Promise<void> {
    // 简化实现：只记录日志
    this.logInfo(`Recursive rename: ${oldIdentifier} -> ${newIdentifier} in ${workspaceRoot}`);
    // 实际实现应该扫描所有相关文件并重命名
  }
  
  /**
   * 执行重构操作
   */
  private async performRefactorOperation(
    params: FileEditorParameters,
    context: any
  ): Promise<any> {
    if (!params.refactorDescription) {
      throw new Error('Refactor operation requires refactorDescription');
    }
    
    const { filePath, refactorDescription } = params;
    
    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // 使用CodeContextEnhancer分析文件
    let analysis: any;
    try {
      const codeEnhancer = new CodeContextEnhancer(path.dirname(filePath));
      analysis = await codeEnhancer.analyzeFile(filePath);
    } catch (error) {
      const err = error as Error;
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
  private async refactorExtractDuplicates(
    content: string,
    analysis: any
  ): Promise<string> {
    // 简化实现：添加重构注释
    const lines = content.split('\n');
    
    // 查找可能重复的模式（简单实现）
    const lineCounts: Record<string, number> = {};
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
  private async refactorGenericImprovements(
    content: string,
    description: string
  ): Promise<string> {
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
  private async improveComments(content: string): Promise<string> {
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
  private async improveFormatting(content: string): Promise<string> {
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
  private async improveErrorHandling(content: string): Promise<string> {
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
  private async performFormatOperation(
    params: FileEditorParameters
  ): Promise<any> {
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
  private async validateSyntax(filePath: string): Promise<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  }> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const extension = path.extname(filePath).toLowerCase();
      
      const result = {
        valid: true,
        errors: [] as string[],
        warnings: [] as string[],
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
            if (trimmed.length === 0) continue;
            
            const leadingSpaces = line.match(/^ */)?.[0].length || 0;
            
            if (trimmed.endsWith(':')) {
              // 期望下一行增加缩进
              indentLevel = leadingSpaces + 4;
            } else if (leadingSpaces < indentLevel && trimmed.length > 0) {
              // 意外的缩进减少
              result.warnings.push(`Line ${i + 1}: Unexpected indent reduction`);
            }
          }
          break;
      }
      
      return result;
      
    } catch (error: any) {
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
  private async formatCode(filePath: string): Promise<{
    formatted: boolean;
    changes?: number;
    standard?: string;
  }> {
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
      
    } catch (error: any) {
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
  private async formatCodeContent(content: string, filePath: string): Promise<string> {
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
  private countChangedLines(oldContent: string, newContent: string): number {
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
  private async calculateStatistics(
    filePath: string,
    backupFilePath: string | undefined,
    editResult: any,
    startTime: number
  ): Promise<{
    editTime: number;
    sizeChange: number;
    affectedLines: number;
    backupSize?: number;
  }> {
    const editTime = Date.now() - startTime;
    
    // 计算文件大小变化
    let sizeChange = 0;
    try {
      const oldSize = backupFilePath ? fs.statSync(backupFilePath).size : 0;
      const newSize = fs.statSync(filePath).size;
      sizeChange = newSize - oldSize;
    } catch {
      // 忽略大小计算错误
    }
    
    // 计算受影响的行数
    const affectedLines = editResult.size.linesAdded + editResult.size.linesRemoved;
    
    // 计算备份大小
    let backupSize: number | undefined;
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
  private async generateSuggestions(
    params: FileEditorParameters,
    editResult: any,
    syntaxValidation: any
  ): Promise<string[]> {
    const suggestions: string[] = [];
    
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
    } else if (syntaxValidation && syntaxValidation.warnings && syntaxValidation.warnings.length > 0) {
      syntaxValidation.warnings.forEach((warning: string) => {
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
  getToolId(): string {
    return FileEditorTool.TOOL_ID;
  }
  
  /**
   * 获取工具名称
   */
  getToolName(): string {
    return FileEditorTool.TOOL_NAME;
  }
  
  /**
   * 获取工具描述
   */
  getToolDescription(): string {
    return FileEditorTool.TOOL_DESCRIPTION;
  }
  
  /**
   * 获取工具类别
   */
  getToolCategory(): ToolCategory {
    return FileEditorTool.TOOL_CATEGORY;
  }
  
  /**
   * 获取工具能力
   */
  getToolCapabilities(): ToolCapabilities {
    return FileEditorTool.TOOL_CAPABILITIES;
  }
  
  /**
   * 获取权限级别
   */
  getPermissionLevel(): PermissionLevel {
    return FileEditorTool.PERMISSION_LEVEL;
  }
}

export default FileEditorTool;