/**
 * 增强文件读取工具示例
 * 演示如何使用EnhancedBaseTool创建同时支持新旧接口的工具
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { EnhancedBaseTool, createEnhancedTool, adaptLegacyTool } from '../../core/tool/EnhancedBaseTool';
import { z } from '../../core/tool/ZodCompatibility';
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
export class EnhancedFileReadTool extends EnhancedBaseTool<FileReadInput, FileReadOutput> {
  readonly id = 'enhanced-file-read';
  readonly name = '增强文件读取工具';
  readonly description = '读取文件内容并返回统计信息，演示EnhancedBaseTool的双接口兼容性';
  readonly version = '1.0.0';
  readonly author = 'CodeLine开发团队';
  readonly category = ToolCategory.FILE;
  
  // 自定义Zod schema
  private readonly customZodSchema = z.object({
    filePath: z.string().describe('要读取的文件路径'),
    encoding: z.enum(['utf-8', 'utf-16', 'ascii', 'base64']).optional().describe('文件编码格式'),
    includeLineCount: z.boolean().optional().describe('是否包含行数统计')
  });
  
  // 自定义parameterSchema（旧接口）
  private readonly customParameterSchema = {
    filePath: {
      type: 'string',
      description: '要读取的文件路径',
      required: true
    },
    encoding: {
      type: 'string',
      description: '文件编码格式',
      required: false,
      enum: ['utf-8', 'utf-16', 'ascii', 'base64']
    },
    includeLineCount: {
      type: 'boolean',
      description: '是否包含行数统计',
      required: false,
      default: false
    }
  };
  
  // 自定义能力
  private readonly customCapabilities = [
    'read-only',
    'requires-workspace'
  ];
  
  constructor() {
    super({
      enableZodValidation: true,
      maintainLegacyCompatibility: true,
      permissionLevel: 'basic',
      supportMCP: false,
      defaultTimeout: 10000
    });
  }
  
  /**
   * 核心执行方法
   */
  protected async executeCore(
    input: FileReadInput, 
    context: any
  ): Promise<FileReadOutput> {
    const workspaceRoot = context.workspaceRoot || context.cwd;
    const fullPath = path.isAbsolute(input.filePath) 
      ? input.filePath 
      : path.join(workspaceRoot, input.filePath);
    
    const encoding = input.encoding || 'utf-8';
    const includeLineCount = input.includeLineCount || false;
    
    try {
      // 读取文件
      const uri = vscode.Uri.file(fullPath);
      const fileContent = await vscode.workspace.fs.readFile(uri);
      
      // 解码内容
      let content: string;
      if (encoding === 'base64') {
        content = Buffer.from(fileContent).toString('base64');
      } else {
        content = Buffer.from(fileContent).toString(encoding as BufferEncoding);
      }
      
      // 计算行数
      let lineCount: number | undefined;
      if (includeLineCount) {
        lineCount = content.split('\n').length;
      }
      
      return {
        content: content.substring(0, 1000) + (content.length > 1000 ? '... (截断)' : ''), // 限制输出大小
        size: fileContent.length,
        lineCount,
        encoding,
        success: true
      };
      
    } catch (error) {
      throw new Error(`读取文件失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 重写inputSchema获取器
   */
  override get inputSchema() {
    return this.customZodSchema;
  }
  
  /**
   * 重写parameterSchema获取器
   */
  override get parameterSchema() {
    return this.customParameterSchema;
  }
  
  /**
   * 重写capabilities获取器
   */
  override get capabilities() {
    return {
      isConcurrencySafe: true,
      isReadOnly: true,
      isDestructive: false,
      requiresWorkspace: true,
      supportsStreaming: false
    };
  }
  
  /**
   * 重写权限检查方法
   */
  protected override async checkPermissionsForNew(
    input: FileReadInput, 
    context: any
  ): Promise<any> {
    // 对于文件读取操作，检查文件是否在workspace内
    const workspaceRoot = context.workspaceRoot || context.cwd;
    const fullPath = path.isAbsolute(input.filePath) 
      ? input.filePath 
      : path.join(workspaceRoot, input.filePath);
    
    // 检查文件是否在workspace内（简单的路径检查）
    const isInWorkspace = fullPath.startsWith(workspaceRoot);
    
    return {
      allowed: isInWorkspace,
      requiresUserConfirmation: !isInWorkspace,
      reason: isInWorkspace 
        ? '文件在workspace内，允许读取' 
        : '文件不在workspace内，需要用户确认',
      level: isInWorkspace ? 'read' : 'write',
      autoApprove: isInWorkspace
    };
  }
  
  /**
   * 工具使用报告
   */
  getToolReport() {
    return {
      toolName: this.name,
      compatibility: this.getCompatibilityReport(),
      features: {
        supportsZodValidation: true,
        supportsLegacyInterface: true,
        supportsPermissionChecks: true,
        exampleUsage: {
          newInterface: `const tool = new EnhancedFileReadTool();
const result = await tool.execute({ filePath: 'README.md' }, context);`,
          oldInterface: `const tool = new EnhancedFileReadTool();
const result = await tool.executeForOld({ filePath: 'README.md' }, context);`
        }
      }
    };
  }
}

/**
 * 使用createEnhancedTool工厂函数创建工具
 */
export const createFileReadTool = () => {
  return createEnhancedTool<FileReadInput, FileReadOutput>({
    id: 'factory-file-read',
    name: '工厂创建的文件读取工具',
    description: '使用createEnhancedTool工厂函数创建的示例工具',
    category: ToolCategory.FILE,
    version: '1.0.0',
    author: 'CodeLine开发团队',
    inputSchema: z.object({
      filePath: z.string().describe('要读取的文件路径'),
      encoding: z.enum(['utf-8', 'utf-16', 'ascii', 'base64']).optional(),
      includeLineCount: z.boolean().optional()
    }),
    capabilities: ['read-only', 'requires-workspace'],
    execute: async (input: FileReadInput, context: any) => {
      // 直接实现执行逻辑
      const workspaceRoot = context.workspaceRoot || context.cwd;
      const fullPath = path.isAbsolute(input.filePath) 
        ? input.filePath 
        : path.join(workspaceRoot, input.filePath);
      
      const encoding = input.encoding || 'utf-8';
      const includeLineCount = input.includeLineCount || false;
      
      try {
        // 读取文件
        const uri = vscode.Uri.file(fullPath);
        const fileContent = await vscode.workspace.fs.readFile(uri);
        
        // 解码内容
        let content: string;
        if (encoding === 'base64') {
          content = Buffer.from(fileContent).toString('base64');
        } else {
          content = Buffer.from(fileContent).toString(encoding as BufferEncoding);
        }
        
        // 计算行数
        let lineCount: number | undefined;
        if (includeLineCount) {
          lineCount = content.split('\n').length;
        }
        
        return {
          content: content.substring(0, 1000) + (content.length > 1000 ? '... (截断)' : ''), // 限制输出大小
          size: fileContent.length,
          lineCount,
          encoding,
          success: true
        };
        
      } catch (error) {
        throw new Error(`读取文件失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  });
};

/**
 * 测试函数：演示EnhancedBaseTool的使用
 */
export async function testEnhancedTool() {
  console.log('=== 测试EnhancedBaseTool双接口兼容性 ===');
  
  // 创建工具实例
  const tool = new EnhancedFileReadTool();
  
  // 1. 测试兼容性报告
  console.log('1. 兼容性报告:');
  console.log(tool.getCompatibilityReport());
  
  // 2. 测试获取新旧接口实例
  console.log('\n2. 获取新旧接口实例:');
  const newTool = tool.getNewToolInstance();
  const oldTool = tool.getOldToolInstance();
  console.log('新接口工具ID:', newTool.id);
  console.log('旧接口工具ID:', oldTool.id);
  
  // 3. 测试工厂函数
  console.log('\n3. 测试工厂函数:');
  const factoryTool = createFileReadTool();
  console.log('工厂工具ID:', factoryTool.id);
  
  return {
    tool,
    newTool,
    oldTool,
    factoryTool
  };
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  testEnhancedTool().catch(console.error);
}