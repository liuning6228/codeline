/**
 * 文件管理工具适配器
 * 将现有的 FileManager 模块适配到统一的工具接口
 */

import * as vscode from 'vscode';
import { FileManager, FileOperationResult } from '../../file/fileManager';
import { BaseToolAdapter } from './ToolAdapter';
import { ToolContext, ToolResult, PermissionResult, ValidationResult, ToolProgress, ToolCategory } from '../ToolInterface';

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
export class FileManagerAdapter extends BaseToolAdapter<FileOperationParams, FileOperationResultData> {
  private fileManager: FileManager;
  
  constructor(context: ToolContext) {
    super(
      'file-manager',
      'File Manager',
      'File system operations (create, read, update, delete, list, copy, move)',
      '1.0.0',
      'CodeLine Team',
      ['filesystem', 'file', 'directory', 'read', 'write', 'delete', 'copy', 'move'],
      {
        operation: {
          type: 'string',
          description: 'File operation type',
          required: true,
          validation: (value) => ['create', 'read', 'update', 'delete', 'list', 'copy', 'move'].includes(value),
        },
        filePath: {
          type: 'string',
          description: 'Source file path (relative to workspace)',
          required: true,
        },
        targetPath: {
          type: 'string',
          description: 'Target file path (for copy/move operations)',
          required: false,
        },
        content: {
          type: 'string',
          description: 'File content (for create/update operations)',
          required: false,
        },
        offset: {
          type: 'number',
          description: 'Line offset for reading files (1-indexed)',
          required: false,
          default: 1,
        },
        limit: {
          type: 'number',
          description: 'Maximum lines to read',
          required: false,
          default: 1000,
        },
        recursive: {
          type: 'boolean',
          description: 'Recursive listing for directories',
          required: false,
          default: false,
        },
        mode: {
          type: 'string',
          description: 'File permissions (octal)',
          required: false,
        },
      }
    );
    
    this.fileManager = new FileManager(context.workspaceRoot);
  }
  
  /**
   * 检查权限
   */
  async checkPermissions(params: FileOperationParams, context: ToolContext): Promise<PermissionResult> {
    const { operation } = params;
    
    // 检查操作权限
    switch (operation) {
      case 'read':
      case 'list':
        // 读取操作通常允许
        return {
          allowed: true,
          requiresUserConfirmation: false,
        };
        
      case 'create':
      case 'update':
        // 写入操作可能需要确认
        return {
          allowed: true,
          requiresUserConfirmation: true,
          confirmationPrompt: `Are you sure you want to ${operation} file: ${params.filePath}?`,
        };
        
      case 'delete':
        // 删除操作需要确认
        return {
          allowed: true,
          requiresUserConfirmation: true,
          confirmationPrompt: `WARNING: This will permanently delete ${params.filePath}. Are you sure?`,
        };
        
      case 'copy':
      case 'move':
        // 文件操作需要确认
        return {
          allowed: true,
          requiresUserConfirmation: true,
          confirmationPrompt: `Are you sure you want to ${operation} ${params.filePath} to ${params.targetPath}?`,
        };
        
      default:
        return {
          allowed: false,
          reason: `Unknown operation: ${operation}`,
        };
    }
  }
  
  /**
   * 验证参数
   */
  async validateParameters(params: FileOperationParams, context: ToolContext): Promise<ValidationResult> {
    const { operation, filePath, targetPath, content } = params;
    
    // 基本验证
    if (!operation) {
      return {
        valid: false,
        error: 'Operation type is required',
      };
    }
    
    // 操作特定验证
    switch (operation) {
      case 'create':
        if (!filePath) {
          return {
            valid: false,
            error: 'filePath is required for create operation',
          };
        }
        break;
        
      case 'read':
      case 'update':
      case 'delete':
        if (!filePath) {
          return {
            valid: false,
            error: 'filePath is required for read/update/delete operations',
          };
        }
        break;
        
      case 'list':
        // filePath 是可选的（默认为当前目录）
        break;
        
      case 'copy':
      case 'move':
        if (!filePath || !targetPath) {
          return {
            valid: false,
            error: 'filePath and targetPath are required for copy/move operations',
          };
        }
        break;
        
      default:
        return {
          valid: false,
          error: `Unsupported operation: ${operation}`,
        };
    }
    
    // 路径安全验证
    if (filePath && !this.isSafePath(filePath, context.workspaceRoot)) {
      return {
        valid: false,
        error: `Unsafe file path: ${filePath}`,
      };
    }
    
    if (targetPath && !this.isSafePath(targetPath, context.workspaceRoot)) {
      return {
        valid: false,
        error: `Unsafe target path: ${targetPath}`,
      };
    }
    
    return {
      valid: true,
      sanitizedParams: params,
    };
  }
  
  /**
   * 执行文件操作
   */
  async execute(
    params: FileOperationParams,
    context: ToolContext,
    onProgress?: (progress: ToolProgress) => void
  ): Promise<ToolResult<FileOperationResultData>> {
    const startTime = Date.now();
    const { operation } = params;
    
    try {
      // 报告开始进度
      this.reportProgress(onProgress, {
        type: 'file_operation_start',
        progress: 0.1,
        message: `Starting ${operation} operation`,
        data: { operation, filePath: params.filePath },
      });
      
      let result: FileOperationResult;
      
      // 执行具体操作
      switch (operation) {
        case 'create':
          this.reportProgress(onProgress, {
            type: 'file_creating',
            progress: 0.3,
            message: `Creating file: ${params.filePath}`,
          });
          result = await this.fileManager.createFile(params.filePath!, params.content || '');
          break;
          
        case 'read':
          this.reportProgress(onProgress, {
            type: 'file_reading',
            progress: 0.3,
            message: `Reading file: ${params.filePath}`,
          });
          result = await this.fileManager.readFileWithLimits(
            params.filePath!,
            params.offset || 1,
            params.limit || 1000
          );
          break;
          
        case 'update':
          this.reportProgress(onProgress, {
            type: 'file_updating',
            progress: 0.3,
            message: `Updating file: ${params.filePath}`,
          });
          result = await this.fileManager.editFileWithDiff(params.filePath!, params.content || '');
          break;
          
        case 'delete':
          this.reportProgress(onProgress, {
            type: 'file_deleting',
            progress: 0.3,
            message: `Deleting file: ${params.filePath}`,
          });
          result = await this.fileManager.deleteFile(params.filePath!);
          break;
          
        case 'list':
          this.reportProgress(onProgress, {
            type: 'directory_listing',
            progress: 0.3,
            message: `Listing directory: ${params.filePath || '.'}`,
          });
          // 调用listDirectory，忽略recursive参数（FileManager不支持）
          const listResult = await this.fileManager.listDirectory(params.filePath || '.');
          // 包装为FileOperationResult
          result = {
            success: true,
            filePath: params.filePath || '.',
            message: `Directory listed successfully with ${listResult.files.length} entries`,
            // 将列表数据放在diff字段中（类型断言，因为FileDiff期望不同的结构）
            diff: {
              filePath: params.filePath || '.',
              oldContent: '',
              newContent: '',
              changes: [],
              summary: `Directory listing with ${listResult.files.length} files, ${listResult.directories} directories`,
              // 添加额外字段存储实际列表数据
              data: listResult
            } as any
          };
          break;
          
        case 'copy':
          this.reportProgress(onProgress, {
            type: 'file_copying',
            progress: 0.3,
            message: `Copying file: ${params.filePath} -> ${params.targetPath}`,
          });
          result = await this.fileManager.copyFile(params.filePath!, params.targetPath!);
          break;
          
        case 'move':
          this.reportProgress(onProgress, {
            type: 'file_moving',
            progress: 0.3,
            message: `Moving file: ${params.filePath} -> ${params.targetPath}`,
          });
          result = await this.fileManager.moveFile(params.filePath!, params.targetPath!);
          break;
          
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
      
      // 报告完成进度
      this.reportProgress(onProgress, {
        type: 'file_operation_complete',
        progress: 1.0,
        message: `Completed ${operation} operation`,
        data: { success: result.success, filePath: params.filePath },
      });
      
      const duration = Date.now() - startTime;
      
      // 返回结果
      if (result.success) {
        return this.createSuccessResult(
          {
            result,
            // 如果有更多统计信息可以添加到这里
          },
          duration,
          {
            operation,
            filePath: params.filePath,
            targetPath: params.targetPath,
          }
        );
      } else {
        return this.createErrorResult(
          result.error || `File operation failed: ${operation}`,
          duration,
          {
            operation,
            filePath: params.filePath,
            targetPath: params.targetPath,
          }
        );
      }
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.reportProgress(onProgress, {
        type: 'file_operation_error',
        progress: 1.0,
        message: `File operation failed: ${error.message}`,
      });
      
      return this.createErrorResult(
        `File operation failed: ${error.message}`,
        duration,
        {
          operation,
          filePath: params.filePath,
          targetPath: params.targetPath,
        }
      );
    }
  }
  
  /**
   * 检查是否为只读操作
   */
  isReadOnly(context: ToolContext): boolean {
    // 读取和列表是只读操作
    return false; // 实际检查应该在 validateParameters 中
  }
  
  /**
   * 检查是否为破坏性操作
   */
  isDestructive(context: ToolContext): boolean {
    return true; // 文件操作可能是破坏性的
  }
  
  /**
   * 获取显示名称
   */
  getDisplayName(params?: FileOperationParams): string {
    const operation = params?.operation || 'file';
    return `${operation.charAt(0).toUpperCase() + operation.slice(1)} File`;
  }
  
  /**
   * 获取活动描述
   */
  getActivityDescription(params: FileOperationParams): string {
    const { operation, filePath, targetPath } = params;
    
    switch (operation) {
      case 'create':
        return `Creating file: ${filePath}`;
      case 'read':
        return `Reading file: ${filePath}`;
      case 'update':
        return `Updating file: ${filePath}`;
      case 'delete':
        return `Deleting file: ${filePath}`;
      case 'list':
        return `Listing directory: ${filePath || 'current directory'}`;
      case 'copy':
        return `Copying: ${filePath} → ${targetPath}`;
      case 'move':
        return `Moving: ${filePath} → ${targetPath}`;
      default:
        return `File operation: ${operation}`;
    }
  }
  
  /**
   * 检查路径安全性
   */
  private isSafePath(path: string, workspaceRoot: string): boolean {
    try {
      const fullPath = require('path').resolve(workspaceRoot, path);
      const normalizedPath = require('path').normalize(fullPath);
      
      // 检查是否在工作区内
      return normalizedPath.startsWith(workspaceRoot);
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 工厂方法：创建文件管理工具适配器
   */
  static create(context: ToolContext): FileManagerAdapter {
    return new FileManagerAdapter(context);
  }
}