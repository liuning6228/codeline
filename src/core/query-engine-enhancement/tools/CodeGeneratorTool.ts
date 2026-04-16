/**
 * CodeGeneratorTool - 代码生成器工具
 * 
 * 基于用户需求生成代码，支持多种编程语言和模式
 * 功能：
 * 1. 根据描述生成完整代码文件
 * 2. 生成函数/类/接口定义
 * 3. 支持模板和代码模式
 * 4. 语法检查和格式化
 * 5. 集成代码片段库
 */

import * as vscode from 'vscode';
import { EnhancedBaseTool, type EnhancedToolContext } from '../../tool/EnhancedBaseTool';
import { z } from '../../tool/ZodCompatibility';
import { ToolCategory, ToolCapabilities, PermissionLevel } from '../../tool/Tool';
import { CodeContextEnhancer } from '../CodeContextEnhancer';

/**
 * 代码生成器工具参数
 */
export interface CodeGeneratorParameters {
  /** 代码描述/需求 */
  description: string;
  
  /** 目标编程语言 */
  language: string;
  
  /** 代码类型：function, class, interface, module, file, test, documentation */
  codeType: 'function' | 'class' | 'interface' | 'module' | 'file' | 'test' | 'documentation' | 'snippet';
  
  /** 目标文件路径（可选，如果为空则生成到临时文件） */
  targetFilePath?: string;
  
  /** 代码模板（可选，指定特定模板） */
  template?: string;
  
  /** 代码风格：functional, oop, procedural, declarative */
  style?: 'functional' | 'oop' | 'procedural' | 'declarative';
  
  /** 是否包含测试 */
  includeTests?: boolean;
  
  /** 是否包含文档 */
  includeDocumentation?: boolean;
  
  /** 是否包含示例用法 */
  includeExamples?: boolean;
  
  /** 代码复杂性：simple, moderate, complex */
  complexity?: 'simple' | 'moderate' | 'complex';
  
  /** 附加约束和需求 */
  constraints?: string[];
}

/**
 * 代码生成器工具结果
 */
export interface CodeGeneratorResult {
  /** 生成的代码 */
  generatedCode: string;
  
  /** 文件路径（如果保存到文件） */
  filePath?: string;
  
  /** 语言 */
  language: string;
  
  /** 代码类型 */
  codeType: string;
  
  /** 代码质量评估 */
  quality: {
    syntaxValid: boolean;
    followsBestPractices: boolean;
    hasComments: boolean;
    complexityScore: number;
  };
  
  /** 生成统计 */
  statistics: {
    linesOfCode: number;
    functions: number;
    classes: number;
    comments: number;
    generationTime: number;
  };
  
  /** 建议和改进 */
  suggestions: string[];
  
  /** 测试代码（如果包含测试） */
  testCode?: string;
  
  /** 文档（如果包含文档） */
  documentation?: string;
  
  /** 示例用法（如果包含示例） */
  examples?: string[];
}

/**
 * 代码生成器工具
 */
export class CodeGeneratorTool extends EnhancedBaseTool<CodeGeneratorParameters, CodeGeneratorResult> {
  
  // ==================== 工具定义 ====================
  
  /**
   * 工具ID
   */
  static readonly TOOL_ID = 'code_generator';
  
  /**
   * 工具名称
   */
  static readonly TOOL_NAME = 'Code Generator';
  
  /**
   * 工具描述
   */
  static readonly TOOL_DESCRIPTION = 'Generates code based on requirements, supporting multiple programming languages and patterns';
  
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
    isDestructive: false,
    requiresWorkspace: true,
    supportsStreaming: true,
    requiresFileAccess: true,
    canModifyFiles: true,
    canReadFiles: true,
    canExecuteCommands: false,
    canAccessNetwork: false,
    requiresModel: true,
  };
  
  /**
   * 权限级别
   */
  static readonly PERMISSION_LEVEL = PermissionLevel.WRITE;
  
  // ==================== 抽象属性实现 ====================
  
  readonly id = CodeGeneratorTool.TOOL_ID;
  readonly name = CodeGeneratorTool.TOOL_NAME;
  readonly description = CodeGeneratorTool.TOOL_DESCRIPTION;
  readonly version = '1.0.0';
  readonly author = 'CodeLine Team';
  readonly category = CodeGeneratorTool.TOOL_CATEGORY;
  
  // 工具能力getter已经在EnhancedBaseTool中实现
  // inputSchema getter已经在EnhancedBaseTool中实现
  
  // ==================== 日志方法 ====================
  
  protected logInfo(message: string): void {
    console.log(`[CodeGeneratorTool] INFO: ${message}`);
  }
  
  protected logWarn(message: string): void {
    console.warn(`[CodeGeneratorTool] WARN: ${message}`);
  }
  
  protected logError(message: string): void {
    console.error(`[CodeGeneratorTool] ERROR: ${message}`);
  }
  
  // ==================== 核心执行方法 ====================
  
  /**
   * 执行工具核心逻辑
   */
  protected async executeCore(
    input: CodeGeneratorParameters,
    context: EnhancedToolContext
  ): Promise<CodeGeneratorResult> {
    // 使用现有的executeImplementation方法，传递适配的上下文
    return await this.executeImplementation(input, context);
  }
  
  // ==================== 参数模式 ====================
  
  /**
   * 创建参数模式
   */
  protected createParameterSchema() {
    return z.object({
      description: z.string()
        .min(1, 'Description is required')
        .max(1000, 'Description too long')
        .describe('Code description/requirements'),
      
      language: z.string()
        .min(1, 'Language is required')
        .default('typescript')
        .describe('Target programming language'),
      
      codeType: z.enum(['function', 'class', 'interface', 'module', 'file', 'test', 'documentation', 'snippet'])
        .default('function')
        .describe('Type of code to generate'),
      
      targetFilePath: z.string()
        .optional()
        .describe('Target file path (optional, generates to temp file if empty)'),
      
      template: z.string()
        .optional()
        .describe('Code template (optional, specifies a particular template)'),
      
      style: z.enum(['functional', 'oop', 'procedural', 'declarative'])
        .default('functional')
        .describe('Coding style'),
      
      includeTests: z.boolean()
        .default(false)
        .describe('Whether to include tests'),
      
      includeDocumentation: z.boolean()
        .default(true)
        .describe('Whether to include documentation'),
      
      includeExamples: z.boolean()
        .default(false)
        .describe('Whether to include example usage'),
      
      complexity: z.enum(['simple', 'moderate', 'complex'])
        .default('moderate')
        .describe('Code complexity level'),
      
      constraints: z.array(z.string())
        .default([])
        .describe('Additional constraints and requirements'),
    });
  }
  
  // ==================== 工具执行 ====================
  
  /**
   * 执行工具
   */
  protected async executeImplementation(
    params: CodeGeneratorParameters,
    context: any
  ): Promise<CodeGeneratorResult> {
    const startTime = Date.now();
    
    try {
      this.logInfo(`Starting code generation: ${params.description.substring(0, 100)}...`);
      this.logInfo(`Language: ${params.language}, Type: ${params.codeType}, Style: ${params.style}`);
      
      // 1. 准备生成上下文
      const generationContext = await this.prepareGenerationContext(params, context);
      
      // 2. 生成代码
      const generatedCode = await this.generateCode(params, generationContext);
      
      // 3. 验证语法
      const syntaxValid = await this.validateSyntax(generatedCode, params.language);
      
      // 4. 保存到文件（如果需要）
      let filePath: string | undefined;
      if (params.targetFilePath) {
        filePath = await this.saveToFile(generatedCode, params.targetFilePath);
      }
      
      // 5. 生成测试代码（如果需要）
      let testCode: string | undefined;
      if (params.includeTests) {
        testCode = await this.generateTestCode(generatedCode, params, generationContext);
      }
      
      // 6. 生成文档（如果需要）
      let documentation: string | undefined;
      if (params.includeDocumentation) {
        documentation = await this.generateDocumentation(generatedCode, params, generationContext);
      }
      
      // 7. 生成示例（如果需要）
      let examples: string[] | undefined;
      if (params.includeExamples) {
        examples = await this.generateExamples(generatedCode, params, generationContext);
      }
      
      // 8. 分析代码质量
      const quality = await this.analyzeCodeQuality(generatedCode, params.language);
      
      // 9. 计算统计信息
      const statistics = this.calculateStatistics(generatedCode, testCode, startTime);
      
      // 10. 生成改进建议
      const suggestions = await this.generateSuggestions(generatedCode, params, quality);
      
      const result: CodeGeneratorResult = {
        generatedCode,
        filePath,
        language: params.language,
        codeType: params.codeType,
        quality,
        statistics,
        suggestions,
        testCode,
        documentation,
        examples,
      };
      
      this.logInfo(`Code generation completed successfully`);
      this.logInfo(`Lines of code: ${statistics.linesOfCode}, Generation time: ${statistics.generationTime}ms`);
      
      return result;
      
    } catch (error: any) {
      this.logError(`Code generation failed: ${error.message}`);
      throw error;
    }
  }
  
  // ==================== 私有方法 ====================
  
  /**
   * 准备生成上下文
   */
  private async prepareGenerationContext(
    params: CodeGeneratorParameters,
    context: any
  ): Promise<any> {
    const generationContext: any = {
      timestamp: Date.now(),
      params,
      workspaceRoot: context.workspaceRoot,
    };
    
    // 如果提供了目标文件路径，分析该文件
    if (params.targetFilePath && context.workspaceRoot) {
      try {
        const codeEnhancer = new CodeContextEnhancer(context.workspaceRoot);
        const fileAnalysis = await codeEnhancer.analyzeFile(params.targetFilePath);
        
        generationContext.existingFile = {
          path: params.targetFilePath,
          language: fileAnalysis.language,
          lineCount: fileAnalysis.lineCount,
          functions: fileAnalysis.functions.length,
          classes: fileAnalysis.classes.length,
        };
      } catch (error) {
        const err = error as Error;
        this.logWarn(`Could not analyze existing file: ${err.message}`);
      }
    }
    
    // 获取项目上下文（如果可用）
    if (context.workspaceRoot) {
      try {
        const codeEnhancer = new CodeContextEnhancer(context.workspaceRoot);
        const projectAnalysis = await codeEnhancer.analyzeProject();
        
        generationContext.project = {
          name: projectAnalysis.name,
          totalFiles: projectAnalysis.files.length,
          languages: Object.entries<number>(projectAnalysis.languageDistribution.byLanguage)
            .filter(([_, count]) => count > 0)
            .map(([lang, count]) => ({ language: lang, fileCount: count })),
        };
      } catch (error) {
        const err = error as Error;
        this.logWarn(`Could not analyze project: ${err.message}`);
      }
    }
    
    return generationContext;
  }
  
  /**
   * 生成代码
   */
  private async generateCode(
    params: CodeGeneratorParameters,
    context: any
  ): Promise<string> {
    // 构建生成提示
    const prompt = this.buildGenerationPrompt(params, context);
    
    // 调用模型生成代码
    const generatedCode = await this.callModelForCodeGeneration(prompt, params, context);
    
    // 后处理代码
    const processedCode = await this.postProcessCode(generatedCode, params);
    
    return processedCode;
  }
  
  /**
   * 构建生成提示
   */
  private buildGenerationPrompt(
    params: CodeGeneratorParameters,
    context: any
  ): string {
    let prompt = `# Code Generation Task
Language: ${params.language}
Code Type: ${params.codeType}
Style: ${params.style}
Complexity: ${params.complexity}

## Requirements:
${params.description}

## Constraints:`;
    
    if (params.constraints && params.constraints.length > 0) {
      prompt += `\n${params.constraints.map(c => `- ${c}`).join('\n')}`;
    } else {
      prompt += `\n- Follow best practices for ${params.language}`;
      prompt += `\n- Write clean, maintainable code`;
      prompt += `\n- Include appropriate error handling`;
    }
    
    if (params.includeDocumentation) {
      prompt += `\n\n## Documentation Requirements:
- Include comprehensive documentation
- Use ${params.language} standard documentation format
- Document all parameters and return values
- Include usage examples if appropriate`;
    }
    
    if (params.includeTests) {
      prompt += `\n\n## Testing Requirements:
- Include unit tests
- Cover edge cases
- Use appropriate testing framework for ${params.language}`;
    }
    
    // 添加上下文信息
    if (context.existingFile) {
      prompt += `\n\n## Existing File Context:
- File: ${context.existingFile.path}
- Language: ${context.existingFile.language}
- Current size: ${context.existingFile.lineCount} lines
- Functions: ${context.existingFile.functions}
- Classes: ${context.existingFile.classes}

Generate code that fits well with the existing file structure and style.`;
    }
    
    if (context.project) {
      prompt += `\n\n## Project Context:
- Project: ${context.project.name}
- Total files: ${context.project.totalFiles}
- Main languages: ${context.project.languages.map((l: {language: string, fileCount: number}) => `${l.language} (${l.fileCount} files)`).join(', ')}`;
    }
    
    prompt += `\n\n## Generated Code:
Please generate the complete code. Output only the code, no additional text or explanations.`;
    
    return prompt;
  }
  
  /**
   * 调用模型生成代码
   */
  private async callModelForCodeGeneration(
    prompt: string,
    params: CodeGeneratorParameters,
    context: any
  ): Promise<string> {
    // 使用上下文中的模型适配器（如果可用）
    if (context?.modelAdapter) {
      try {
        const response = await context.modelAdapter.generate(prompt, {
          maxTokens: 4000,
          temperature: 0.3,
          stop: ['# Generated Code:', '## End of Code', '```'],
        });
        
        return response.content;
      } catch (error) {
        const err = error as Error;
        this.logWarn(`Model generation failed, using template: ${err.message}`);
      }
    }
    
    // 回退到模板生成
    return this.generateFromTemplate(params);
  }
  
  /**
   * 从模板生成代码
   */
  private generateFromTemplate(params: CodeGeneratorParameters): string {
    // 基础模板
    let template = '';
    
    switch (params.codeType) {
      case 'function':
        template = this.generateFunctionTemplate(params);
        break;
      case 'class':
        template = this.generateClassTemplate(params);
        break;
      case 'interface':
        template = this.generateInterfaceTemplate(params);
        break;
      case 'module':
        template = this.generateModuleTemplate(params);
        break;
      case 'test':
        template = this.generateTestTemplate(params);
        break;
      case 'documentation':
        template = this.generateDocumentationTemplate(params);
        break;
      default:
        template = this.generateFileTemplate(params);
    }
    
    return template;
  }
  
  /**
   * 生成函数模板
   */
  private generateFunctionTemplate(params: CodeGeneratorParameters): string {
    const functionName = this.extractFunctionName(params.description);
    
    switch (params.language.toLowerCase()) {
      case 'typescript':
      case 'javascript':
        return `/**
 * ${params.description}
 * 
 * @param {any} input - Input parameter
 * @returns {any} Result
 */
function ${functionName}(input: any): any {
  // TODO: Implement function logic
  throw new Error('Function not implemented');
}

export default ${functionName};
`;
        
      case 'python':
        return `def ${functionName}(input):
    """
    ${params.description}
    
    Args:
        input: Input parameter
        
    Returns:
        Result
    """
    # TODO: Implement function logic
    raise NotImplementedError("Function not implemented")`;
        
      default:
        return `// ${params.description}
// TODO: Implement in ${params.language}`;
    }
  }
  
  /**
   * 生成类模板
   */
  private generateClassTemplate(params: CodeGeneratorParameters): string {
    const className = this.extractClassName(params.description);
    
    switch (params.language.toLowerCase()) {
      case 'typescript':
        return `/**
 * ${params.description}
 */
class ${className} {
  private data: any;
  
  /**
   * Creates a new ${className} instance
   */
  constructor(data?: any) {
    this.data = data || {};
  }
  
  /**
   * Example method
   */
  public exampleMethod(): any {
    // TODO: Implement method logic
    return this.data;
  }
  
  /**
   * Another method
   */
  public anotherMethod(param: string): string {
    // TODO: Implement method logic
    return param;
  }
}

export default ${className};
`;
        
      default:
        return `// ${params.description}
// TODO: Implement class in ${params.language}`;
    }
  }
  
  /**
   * 生成接口模板
   */
  private generateInterfaceTemplate(params: CodeGeneratorParameters): string {
    const interfaceName = this.extractInterfaceName(params.description);
    
    switch (params.language.toLowerCase()) {
      case 'typescript':
        return `/**
 * ${params.description}
 */
interface ${interfaceName} {
  /** Example property */
  exampleProperty: string;
  
  /** Example method */
  exampleMethod(param: string): number;
  
  /** Another method */
  anotherMethod(): Promise<void>;
}

export default ${interfaceName};
`;
        
      default:
        return `// ${params.description}
// TODO: Implement interface in ${params.language}`;
    }
  }
  
  /**
   * 生成模块模板
   */
  private generateModuleTemplate(params: CodeGeneratorParameters): string {
    const moduleName = this.extractModuleName(params.description);
    
    switch (params.language.toLowerCase()) {
      case 'typescript':
        return `/**
 * ${params.description}
 */

// Export constants
export const CONSTANTS = {
  VERSION: '1.0.0',
  NAME: '${moduleName}',
};

// Export types
export type ${moduleName}Options = {
  enabled: boolean;
  timeout: number;
};

// Export functions
export function initialize(options: ${moduleName}Options): void {
  // TODO: Implement initialization
}

export function process(data: any): any {
  // TODO: Implement processing logic
  return data;
}

export function cleanup(): void {
  // TODO: Implement cleanup logic
}

// Default export
export default {
  CONSTANTS,
  initialize,
  process,
  cleanup,
};
`;
        
      default:
        return `// ${params.description} module
// TODO: Implement module in ${params.language}`;
    }
  }
  
  /**
   * 生成测试模板
   */
  private generateTestTemplate(params: CodeGeneratorParameters): string {
    const testName = this.extractTestName(params.description);
    
    switch (params.language.toLowerCase()) {
      case 'typescript':
        return `/**
 * Tests for ${testName}
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('${testName}', () => {
  beforeEach(() => {
    // Setup before each test
  });
  
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
  
  it('should handle edge cases', () => {
    // TODO: Add edge case tests
  });
});
`;
        
      default:
        return `// Tests for: ${params.description}
// TODO: Implement tests in ${params.language}`;
    }
  }
  
  /**
   * 生成文档模板
   */
  private generateDocumentationTemplate(params: CodeGeneratorParameters): string {
    return `# ${params.description}

## Overview
This document describes the implementation.

## Usage
\`\`\`${params.language}
// Example usage
const result = exampleFunction();
\`\`\`

## API Reference
### Functions
- \`exampleFunction()\`: Example function

### Classes
- \`ExampleClass\`: Example class

## Examples
More examples to be added.
`;
  }
  
  /**
   * 生成文件模板
   */
  private generateFileTemplate(params: CodeGeneratorParameters): string {
    return `// File: Generated code
// Language: ${params.language}
// Description: ${params.description}
// Generated at: ${new Date().toISOString()}

// TODO: Implement based on requirements
console.log('Generated file template');
`;
  }
  
  /**
   * 提取函数名
   */
  private extractFunctionName(description: string): string {
    // 简化实现：从描述中提取第一个有意义的词
    const words = description.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && /^[a-z]/.test(word)) {
        return this.capitalizeFirstLetter(word);
      }
    }
    return 'exampleFunction';
  }
  
  /**
   * 提取类名
   */
  private extractClassName(description: string): string {
    const words = description.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && /^[a-z]/.test(word)) {
        return this.capitalizeFirstLetter(word);
      }
    }
    return 'ExampleClass';
  }
  
  /**
   * 提取接口名
   */
  private extractInterfaceName(description: string): string {
    const baseName = this.extractClassName(description);
    return `I${baseName}`;
  }
  
  /**
   * 提取模块名
   */
  private extractModuleName(description: string): string {
    const words = description.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && /^[a-z]/.test(word)) {
        return this.capitalizeFirstLetter(word);
      }
    }
    return 'ExampleModule';
  }
  
  /**
   * 提取测试名
   */
  private extractTestName(description: string): string {
    const words = description.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && /^[a-z]/.test(word)) {
        return this.capitalizeFirstLetter(word);
      }
    }
    return 'ExampleTest';
  }
  
  /**
   * 首字母大写
   */
  private capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  
  /**
   * 后处理代码
   */
  private async postProcessCode(
    code: string,
    params: CodeGeneratorParameters
  ): Promise<string> {
    // 1. 移除多余的空白行
    let processed = code.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // 2. 确保文件末尾有换行
    if (!processed.endsWith('\n')) {
      processed += '\n';
    }
    
    // 3. 根据语言进行特定处理
    switch (params.language.toLowerCase()) {
      case 'typescript':
      case 'javascript':
        // 确保使用一致的引号
        processed = processed.replace(/"/g, "'");
        break;
      case 'python':
        // 确保使用4空格缩进
        processed = processed.replace(/\t/g, '    ');
        break;
    }
    
    return processed;
  }
  
  /**
   * 验证语法
   */
  private async validateSyntax(
    code: string,
    language: string
  ): Promise<boolean> {
    // 简化实现：基本验证
    try {
      switch (language.toLowerCase()) {
        case 'typescript':
        case 'javascript':
          // 检查基本语法
          if (code.includes('syntax error') || code.includes('parse error')) {
            return false;
          }
          // 检查括号匹配
          const openBraces = (code.match(/{/g) || []).length;
          const closeBraces = (code.match(/}/g) || []).length;
          if (openBraces !== closeBraces) {
            this.logWarn(`Brace mismatch: ${openBraces} opening vs ${closeBraces} closing`);
          }
          break;
          
        case 'python':
          // 检查缩进
          if (code.includes('IndentationError') || code.includes('SyntaxError')) {
            return false;
          }
          break;
      }
      
      return true;
    } catch (error) {
      const err = error as Error;
      this.logWarn(`Syntax validation failed: ${err.message}`);
      return false;
    }
  }
  
  /**
   * 保存到文件
   */
  private async saveToFile(
    code: string,
    filePath: string
  ): Promise<string> {
    try {
      // 确保目录存在
      const dir = require('path').dirname(filePath);
      const fs = require('fs');
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // 写入文件
      fs.writeFileSync(filePath, code, 'utf8');
      
      this.logInfo(`Code saved to: ${filePath}`);
      return filePath;
      
    } catch (error: any) {
      this.logError(`Failed to save file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 生成测试代码
   */
  private async generateTestCode(
    code: string,
    params: CodeGeneratorParameters,
    context: any
  ): Promise<string> {
    // 简化实现：生成基础测试模板
    const testName = this.extractTestName(params.description);
    
    return `// Tests for ${testName}
// Generated based on: ${params.description}

// TODO: Implement comprehensive tests
console.log('Test template for generated code');
`;
  }
  
  /**
   * 生成文档
   */
  private async generateDocumentation(
    code: string,
    params: CodeGeneratorParameters,
    context: any
  ): Promise<string> {
    // 简化实现：生成基础文档
    return `# Documentation for Generated Code

## Overview
This code was generated based on: ${params.description}

## Language
${params.language}

## Code Type
${params.codeType}

## Style
${params.style}

## Usage Instructions
1. Import/use the generated code
2. Follow the examples below
3. Adapt as needed for your use case

## Generated Code
\`\`\`${params.language}
${code.substring(0, 500)}...
\`\`\`
`;
  }
  
  /**
   * 生成示例
   */
  private async generateExamples(
    code: string,
    params: CodeGeneratorParameters,
    context: any
  ): Promise<string[]> {
    // 简化实现：生成基础示例
    return [
      `// Example 1: Basic usage
const result = exampleFunction();`,
      `// Example 2: With parameters
const result = exampleFunction({ param: 'value' });`,
      `// Example 3: Error handling
try {
  const result = exampleFunction();
} catch (error) {
  console.error('Error:', error);
}`,
    ];
  }
  
  /**
   * 分析代码质量
   */
  private async analyzeCodeQuality(
    code: string,
    language: string
  ): Promise<{
    syntaxValid: boolean;
    followsBestPractices: boolean;
    hasComments: boolean;
    complexityScore: number;
  }> {
    // 简化实现：基础质量分析
    const lines = code.split('\n');
    const totalLines = lines.length;
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') ||
      line.trim().startsWith('/*') ||
      line.trim().includes('*/')
    ).length;
    
    const commentRatio = totalLines > 0 ? commentLines / totalLines : 0;
    const hasComments = commentRatio > 0.1; // 至少10%的注释
    
    // 检查最佳实践
    let followsBestPractices = true;
    if (language.toLowerCase() === 'typescript' || language.toLowerCase() === 'javascript') {
      if (code.includes('any')) {
        followsBestPractices = false; // 使用any类型不是最佳实践
      }
      if (code.includes('console.log') && !code.includes('development')) {
        // 生产代码中应避免console.log
        followsBestPractices = false;
      }
    }
    
    // 计算复杂度分数（简化）
    const complexityScore = Math.min(lines.length / 100, 1.0); // 基于行数
    
    return {
      syntaxValid: true, // 假设语法检查通过
      followsBestPractices,
      hasComments,
      complexityScore,
    };
  }
  
  /**
   * 计算统计信息
   */
  private calculateStatistics(
    code: string,
    testCode: string | undefined,
    startTime: number
  ): {
    linesOfCode: number;
    functions: number;
    classes: number;
    comments: number;
    generationTime: number;
  } {
    const lines = code.split('\n');
    const totalLines = lines.length;
    
    // 统计函数和类（简化）
    const functions = (code.match(/function\s+\w+|def\s+\w+/g) || []).length;
    const classes = (code.match(/class\s+\w+|interface\s+\w+/g) || []).length;
    
    // 统计注释
    const comments = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') ||
      line.trim().startsWith('/*') ||
      line.trim().includes('*/')
    ).length;
    
    const generationTime = Date.now() - startTime;
    
    return {
      linesOfCode: totalLines,
      functions,
      classes,
      comments,
      generationTime,
    };
  }
  
  /**
   * 生成改进建议
   */
  private async generateSuggestions(
    code: string,
    params: CodeGeneratorParameters,
    quality: any
  ): Promise<string[]> {
    const suggestions: string[] = [];
    
    if (!quality.followsBestPractices) {
      suggestions.push('Consider using more specific types instead of "any"');
      suggestions.push('Remove or wrap console.log statements for production code');
    }
    
    if (!quality.hasComments) {
      suggestions.push('Add more comments to improve code readability');
      suggestions.push('Document complex algorithms and business logic');
    }
    
    if (quality.complexityScore > 0.8) {
      suggestions.push('Code is complex, consider breaking it into smaller functions');
      suggestions.push('Add unit tests for complex logic');
    }
    
    if (params.language.toLowerCase() === 'typescript') {
      suggestions.push('Add TypeScript type definitions for all functions and variables');
      suggestions.push('Consider using interfaces for complex data structures');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Code looks good! Consider adding error handling for edge cases');
    }
    
    return suggestions;
  }
  
  // ==================== 工具元数据 ====================
  
  /**
   * 获取工具ID
   */
  getToolId(): string {
    return CodeGeneratorTool.TOOL_ID;
  }
  
  /**
   * 获取工具名称
   */
  getToolName(): string {
    return CodeGeneratorTool.TOOL_NAME;
  }
  
  /**
   * 获取工具描述
   */
  getToolDescription(): string {
    return CodeGeneratorTool.TOOL_DESCRIPTION;
  }
  
  /**
   * 获取工具类别
   */
  getToolCategory(): ToolCategory {
    return CodeGeneratorTool.TOOL_CATEGORY;
  }
  
  /**
   * 获取工具能力
   */
  getToolCapabilities(): ToolCapabilities {
    return CodeGeneratorTool.TOOL_CAPABILITIES;
  }
  
  /**
   * 获取权限级别
   */
  getPermissionLevel(): PermissionLevel {
    return CodeGeneratorTool.PERMISSION_LEVEL;
  }
}

export default CodeGeneratorTool;