/**
 * CodeAnalysisTool - 代码分析工具
 * 
 * 分析代码质量、复杂度、依赖关系和潜在问题：
 * 1. 代码质量评估
 * 2. 复杂度计算（圈复杂度等）
 * 3. 依赖关系分析
 * 4. 代码规范检查
 * 5. 安全漏洞检测
 * 6. 性能问题识别
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { EnhancedBaseTool, type EnhancedToolContext } from '../../tool/EnhancedBaseTool';
import { z } from '../../tool/ZodCompatibility';
import { ToolCategory, ToolCapabilities, PermissionLevel } from '../../tool/Tool';
import { CodeContextEnhancer, FileAnalysis } from '../CodeContextEnhancer';

/**
 * 代码质量等级
 */
export type CodeQuality = 
  | 'excellent'      // 优秀：几乎没有问题
  | 'good'           // 良好：少量小问题
  | 'fair'           // 一般：需要改进
  | 'poor'           // 较差：较多问题
  | 'critical';      // 严重：很多严重问题

/**
 * 问题严重性
 */
export type IssueSeverity = 
  | 'critical'      // 严重：必须立即修复
  | 'high'          // 高：应该尽快修复
  | 'medium'        // 中：建议修复
  | 'low'           // 低：可以考虑修复
  | 'info';         // 信息：非错误

/**
 * 代码问题类型
 */
export type CodeIssueType = 
  | 'syntax'            // 语法问题
  | 'style'             // 代码风格
  | 'complexity'        // 复杂度问题
  | 'performance'       // 性能问题
  | 'security'         // 安全问题
  | 'maintainability'  // 可维护性问题
  | 'documentation'    // 文档问题
  | 'dependency'       // 依赖问题
  | 'duplication'      // 重复代码
  | 'bug_risk';        // 潜在bug风险

/**
 * 代码分析器工具参数
 */
export interface CodeAnalysisParameters {
  /** 要分析的代码路径 */
  codePath: string;
  
  /** 分析类型：file, directory, project */
  analysisType: 'file' | 'directory' | 'project';
  
  /** 编程语言（可选，自动检测） */
  language?: string;
  
  /** 要运行的分析器 */
  analyzers: Array<
    | 'quality'        // 代码质量
    | 'complexity'     // 复杂度
    | 'dependencies'   // 依赖关系
    | 'style'         // 代码风格
    | 'security'      // 安全
    | 'performance'   // 性能
    | 'bug_risk'      // 缺陷风险
    | 'all'           // 全部
  >;
  
  /** 分析深度：shallow, normal, deep */
  analysisDepth: 'shallow' | 'normal' | 'deep';
  
  /** 是否包括建议修复 */
  includeFixes?: boolean;
  
  /** 是否计算指标 */
  calculateMetrics?: boolean;
  
  /** 是否生成报告 */
  generateReport?: boolean;
  
  /** 自定义规则 */
  customRules?: Array<{
    id: string;
    description: string;
    pattern: string;
    severity: IssueSeverity;
  }>;
  
  /** 排除模式 */
  excludePatterns?: string[];
}

/**
 * 代码指标
 */
export interface CodeMetrics {
  /** 基本统计 */
  basic: {
    linesOfCode: number;
    files: number;
    functions: number;
    classes: number;
    comments: number;
    commentRatio: number;
    blankLines: number;
  };
  
  /** 复杂度指标 */
  complexity: {
    cyclomatic: number;          // 圈复杂度
    cognitive: number;           // 认知复杂度
    halstead: {                  // Halstead指标
      volume: number;
      difficulty: number;
      effort: number;
    };
    averageFunctionLength: number;
    maxFunctionLength: number;
  };
  
  /** 质量指标 */
  quality: {
    maintainabilityIndex: number;  // 可维护性指数
    technicalDebt: number;         // 技术债务（小时）
    codeSmells: number;            // 代码异味数量
    duplication: {                 // 重复代码
      percentage: number;
      duplicatedLines: number;
      duplicatedBlocks: number;
    };
  };
  
  /** 依赖指标 */
  dependencies: {
    external: number;             // 外部依赖数
    internal: number;             // 内部依赖数
    circular: number;             // 循环依赖数
    depth: number;                // 依赖深度
  };
}

/**
 * 代码问题
 */
export interface CodeIssue {
  /** 问题ID */
  id: string;
  
  /** 问题类型 */
  type: CodeIssueType;
  
  /** 严重性 */
  severity: IssueSeverity;
  
  /** 描述 */
  description: string;
  
  /** 位置 */
  location: {
    filePath: string;
    lineStart: number;
    lineEnd: number;
    columnStart?: number;
    columnEnd?: number;
  };
  
  /** 代码片段 */
  codeSnippet: string;
  
  /** 建议修复 */
  suggestedFix?: string;
  
  /** 规则ID */
  ruleId: string;
  
  /** 置信度（0-1） */
  confidence: number;
}

/**
 * 代码分析器工具结果
 */
export interface CodeAnalysisResult {
  /** 分析是否成功 */
  success: boolean;
  
  /** 分析的代码路径 */
  codePath: string;
  
  /** 分析类型 */
  analysisType: string;
  
  /** 代码质量等级 */
  quality: CodeQuality;
  
  /** 代码指标 */
  metrics: CodeMetrics;
  
  /** 发现的问题 */
  issues: CodeIssue[];
  
  /** 问题统计 */
  issueStats: {
    total: number;
    bySeverity: Record<IssueSeverity, number>;
    byType: Record<CodeIssueType, number>;
    criticalIssues: number;
  };
  
  /** 依赖分析 */
  dependencies?: {
    /** 外部依赖列表 */
    external: Array<{
      name: string;
      version?: string;
      type: 'production' | 'development';
    }>;
    
    /** 内部依赖图 */
    internal: Array<{
      from: string;
      to: string;
      type: 'import' | 'require' | 'extend' | 'implement';
    }>;
    
    /** 循环依赖 */
    circular: string[][];
  };
  
  /** 安全分析 */
  security?: {
    vulnerabilities: Array<{
      type: string;
      description: string;
      severity: IssueSeverity;
      location?: string;
      cve?: string;
    }>;
    recommendations: string[];
  };
  
  /** 性能分析 */
  performance?: {
    bottlenecks: Array<{
      type: 'cpu' | 'memory' | 'io' | 'network';
      description: string;
      location: string;
      impact: 'low' | 'medium' | 'high';
    }>;
    suggestions: string[];
  };
  
  /** 修复建议摘要 */
  fixSummary?: {
    quickWins: string[];
    mediumTerm: string[];
    longTerm: string[];
    estimatedEffort: {
      quick: number;    // 小时
      medium: number;
      long: number;
    };
  };
  
  /** 报告路径（如果生成报告） */
  reportPath?: string;
  
  /** 统计信息 */
  statistics: {
    /** 分析时间（毫秒） */
    analysisTime: number;
    
    /** 分析的文件数 */
    filesAnalyzed: number;
    
    /** 内存使用（MB） */
    memoryUsage?: number;
    
    /** 规则检查数 */
    rulesChecked: number;
  };
  
  /** 错误信息（如果失败） */
  error?: string;
}

/**
 * 代码分析器工具
 */
export class CodeAnalysisTool extends EnhancedBaseTool<CodeAnalysisParameters, CodeAnalysisResult> {
  
  // ==================== 工具定义 ====================
  
  /**
   * 工具ID
   */
  static readonly TOOL_ID = 'code_analyzer';
  
  /**
   * 工具名称
   */
  static readonly TOOL_NAME = 'Code Analyzer';
  
  /**
   * 工具描述
   */
  static readonly TOOL_DESCRIPTION = 'Analyzes code quality, complexity, dependencies and identifies potential issues';
  
  /**
   * 工具类别
   */
  static readonly TOOL_CATEGORY: ToolCategory = ToolCategory.CODE;
  
  /**
   * 工具能力
   */
  static readonly TOOL_CAPABILITIES: ToolCapabilities = {
    isConcurrencySafe: true,
    isReadOnly: true,
    isDestructive: false,
    requiresWorkspace: true,
    supportsStreaming: true,
    requiresFileAccess: true,
    canModifyFiles: false,
    canReadFiles: true,
    canExecuteCommands: false,
    canAccessNetwork: false,
    requiresModel: false,
  };
  
  /**
   * 权限级别
   */
  static readonly PERMISSION_LEVEL = PermissionLevel.READ;
  
  // ==================== 抽象属性实现 ====================
  
  readonly id = CodeAnalysisTool.TOOL_ID;
  readonly name = CodeAnalysisTool.TOOL_NAME;
  readonly description = CodeAnalysisTool.TOOL_DESCRIPTION;
  readonly version = '1.0.0';
  readonly author = 'CodeLine Team';
  readonly category = CodeAnalysisTool.TOOL_CATEGORY;
  
  // 工具能力getter已经在EnhancedBaseTool中实现
  // inputSchema getter已经在EnhancedBaseTool中实现
  
  // ==================== 日志方法 ====================
  
  protected logInfo(message: string): void {
    console.log(`[CodeAnalysisTool] INFO: ${message}`);
  }
  
  protected logWarn(message: string): void {
    console.warn(`[CodeAnalysisTool] WARN: ${message}`);
  }
  
  protected logError(message: string): void {
    console.error(`[CodeAnalysisTool] ERROR: ${message}`);
  }
  
  // ==================== 核心执行方法 ====================
  
  /**
   * 执行工具核心逻辑
   */
  protected async executeCore(
    input: CodeAnalysisParameters,
    context: EnhancedToolContext
  ): Promise<CodeAnalysisResult> {
    // 使用现有的executeImplementation方法，传递适配的上下文
    return await this.executeImplementation(input, context);
  }
  
  // ==================== 代码规则数据库 ====================
  
  private codeRules = {
    // 代码风格规则
    style: [
      {
        id: 'STYLE_001',
        type: 'style' as CodeIssueType,
        pattern: /console\.(log|warn|error)\(/,
        description: 'Console statements in production code',
        severity: 'medium' as IssueSeverity,
        fix: 'Remove or wrap console statements for production',
      },
      {
        id: 'STYLE_002',
        type: 'style' as CodeIssueType,
        pattern: /\b(var)\s+/,
        description: 'Use of var instead of const/let',
        severity: 'low' as IssueSeverity,
        fix: 'Replace var with const or let',
      },
      {
        id: 'STYLE_003',
        type: 'style' as CodeIssueType,
        pattern: /\/\/\s*TODO/,
        description: 'TODO comments in code',
        severity: 'info' as IssueSeverity,
        fix: 'Address TODO comments or create issues',
      },
    ],
    
    // 复杂度规则
    complexity: [
      {
        id: 'COMPLEXITY_001',
        type: 'complexity' as CodeIssueType,
        pattern: /function\s+\w+\([^)]*\)\s*\{[^}]*\}/s,
        description: 'Long function (over 50 lines)',
        severity: 'medium' as IssueSeverity,
        fix: 'Break function into smaller functions',
      },
      {
        id: 'COMPLEXITY_002',
        type: 'complexity' as CodeIssueType,
        pattern: /if\s*\([^)]*\)\s*\{[^}]*\}.*else\s*if/s,
        description: 'Complex if-else chain',
        severity: 'medium' as IssueSeverity,
        fix: 'Consider switch statement or polymorphism',
      },
    ],
    
    // 安全问题规则
    security: [
      {
        id: 'SECURITY_001',
        type: 'security' as CodeIssueType,
        pattern: /eval\(/,
        description: 'Use of eval() function',
        severity: 'high' as IssueSeverity,
        fix: 'Avoid eval(), use safer alternatives',
      },
      {
        id: 'SECURITY_002',
        type: 'security' as CodeIssueType,
        pattern: /innerHTML\s*=/,
        description: 'Direct innerHTML assignment',
        severity: 'medium' as IssueSeverity,
        fix: 'Use textContent or sanitize input',
      },
    ],
    
    // 性能问题规则
    performance: [
      {
        id: 'PERFORMANCE_001',
        type: 'performance' as CodeIssueType,
        pattern: /for\s*\([^;]*;\s*[^;]*;\s*[^)]*\)\s*\{[^}]*\.length[^}]*\}/s,
        description: 'Length property in loop condition',
        severity: 'low' as IssueSeverity,
        fix: 'Cache length before loop',
      },
    ],
    
    // 潜在bug规则
    bug_risk: [
      {
        id: 'BUG_RISK_001',
        type: 'bug_risk' as CodeIssueType,
        pattern: /==\s*(null|undefined)/,
        description: 'Loose equality with null/undefined',
        severity: 'medium' as IssueSeverity,
        fix: 'Use === for strict equality',
      },
      {
        id: 'BUG_RISK_002',
        type: 'bug_risk' as CodeIssueType,
        pattern: /\.then\([^)]*\)\.catch\([^)]*\)/,
        description: 'Missing error handling in promise chain',
        severity: 'medium' as IssueSeverity,
        fix: 'Add proper error handling',
      },
    ],
  };
  
  // ==================== 参数模式 ====================
  
  /**
   * 创建参数模式
   */
  protected createParameterSchema() {
    return z.object({
      codePath: z.string()
        .min(1, 'Code path is required')
        .describe('Path to code to analyze'),
      
      analysisType: z.enum(['file', 'directory', 'project'])
        .default('directory')
        .describe('Analysis type'),
      
      language: z.string()
        .optional()
        .describe('Programming language (auto-detected if not provided)'),
      
      analyzers: z.array(z.enum([
        'quality', 'complexity', 'dependencies', 'style', 
        'security', 'performance', 'all'
      ]))
        .default(['all'])
        .describe('Analyzers to run'),
      
      analysisDepth: z.enum(['shallow', 'normal', 'deep'])
        .default('normal')
        .describe('Analysis depth'),
      
      includeFixes: z.boolean()
        .default(true)
        .describe('Whether to include suggested fixes'),
      
      calculateMetrics: z.boolean()
        .default(true)
        .describe('Whether to calculate metrics'),
      
      generateReport: z.boolean()
        .default(false)
        .describe('Whether to generate report'),
      
      customRules: z.array(z.object({
        id: z.string(),
        description: z.string(),
        pattern: z.string(),
        severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
      }))
        .optional()
        .describe('Custom rules'),
      
      excludePatterns: z.array(z.string())
        .optional()
        .describe('Exclude patterns'),
    });
  }
  
  // ==================== 工具执行 ====================
  
  /**
   * 执行工具
   */
  protected async executeImplementation(
    params: CodeAnalysisParameters,
    context: any
  ): Promise<CodeAnalysisResult> {
    const startTime = Date.now();
    
    try {
      this.logInfo(`Starting code analysis: ${params.codePath} (${params.analysisType})`);
      this.logInfo(`Analyzers: ${params.analyzers.join(', ')}, Depth: ${params.analysisDepth}`);
      
      // 1. 验证路径
      await this.validatePath(params.codePath);
      
      // 2. 收集要分析的文件
      const files = await this.collectFiles(params);
      
      // 3. 分析文件
      const analysisResults = await this.analyzeFiles(files, params, context);
      
      // 4. 计算指标
      const metrics = params.calculateMetrics ? 
        await this.calculateMetrics(analysisResults, params) : 
        this.createDefaultMetrics();
      
      // 5. 检查问题
      const issues = await this.checkForIssues(analysisResults, params);
      
      // 6. 分析依赖关系
      let dependencies;
      if (params.analyzers.includes('dependencies') || params.analyzers.includes('all')) {
        dependencies = await this.analyzeDependencies(files, params, context);
      }
      
      // 7. 分析安全问题
      let security;
      if (params.analyzers.includes('security') || params.analyzers.includes('all')) {
        security = await this.analyzeSecurity(analysisResults, params);
      }
      
      // 8. 分析性能问题
      let performance;
      if (params.analyzers.includes('performance') || params.analyzers.includes('all')) {
        performance = await this.analyzePerformance(analysisResults, params);
      }
      
      // 9. 生成修复建议
      let fixSummary;
      if (params.includeFixes && issues.length > 0) {
        fixSummary = await this.generateFixSummary(issues, params);
      }
      
      // 10. 计算代码质量等级
      const quality = this.calculateQuality(issues, metrics);
      
      // 11. 生成报告
      let reportPath;
      if (params.generateReport) {
        reportPath = await this.generateReport(params, analysisResults, issues, metrics, context);
      }
      
      // 12. 计算统计信息
      const statistics = this.calculateStatistics(startTime, files, issues);
      
      const result: CodeAnalysisResult = {
        success: true,
        codePath: params.codePath,
        analysisType: params.analysisType,
        quality,
        metrics,
        issues,
        issueStats: this.calculateIssueStats(issues),
        dependencies,
        security,
        performance,
        fixSummary,
        reportPath,
        statistics,
      };
      
      this.logInfo(`Code analysis completed: ${files.length} files, ${issues.length} issues`);
      this.logInfo(`Quality: ${quality}, Critical issues: ${result.issueStats.criticalIssues}`);
      
      return result;
      
    } catch (error: any) {
      this.logError(`Code analysis failed: ${error.message}`);
      
      return {
        success: false,
        codePath: params.codePath,
        analysisType: params.analysisType,
        quality: 'critical',
        metrics: this.createDefaultMetrics(),
        issues: [],
        issueStats: {
          total: 0,
          bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
          byType: {
            syntax: 0, style: 0, complexity: 0, performance: 0,
            security: 0, maintainability: 0, documentation: 0,
            dependency: 0, duplication: 0, bug_risk: 0,
          },
          criticalIssues: 0,
        },
        statistics: {
          analysisTime: Date.now() - startTime,
          filesAnalyzed: 0,
          rulesChecked: 0,
        },
        error: error.message,
      };
    }
  }
  
  // ==================== 私有方法 ====================
  
  /**
   * 验证路径
   */
  private async validatePath(codePath: string): Promise<void> {
    if (!fs.existsSync(codePath)) {
      throw new Error(`Path not found: ${codePath}`);
    }
    
    const stats = fs.statSync(codePath);
    if (stats.isFile() && !codePath.match(/\.(js|ts|py|java|cpp|c|cs|php|rb|go|rs)$/i)) {
      throw new Error(`Unsupported file type: ${codePath}`);
    }
    
    this.logInfo(`Path validated: ${codePath} (${stats.isFile() ? 'file' : 'directory'})`);
  }
  
  /**
   * 收集文件
   */
  private async collectFiles(params: CodeAnalysisParameters): Promise<string[]> {
    const files: string[] = [];
    
    const stats = fs.statSync(params.codePath);
    
    if (stats.isFile()) {
      // 单个文件
      files.push(params.codePath);
    } else {
      // 目录或项目
      await this.collectFilesRecursive(params.codePath, files, params);
    }
    
    // 过滤排除模式
    const filteredFiles = this.filterExcludedFiles(files, params.excludePatterns || []);
    
    this.logInfo(`Collected ${filteredFiles.length} files (${files.length - filteredFiles.length} excluded)`);
    
    return filteredFiles;
  }
  
  /**
   * 递归收集文件
   */
  private async collectFilesRecursive(
    dirPath: string,
    files: string[],
    params: CodeAnalysisParameters
  ): Promise<void> {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        
        // 跳过常见的排除目录
        if (item.startsWith('.') || 
            item === 'node_modules' || 
            item === '.git' || 
            item === 'dist' || 
            item === 'build' ||
            item === '.next' ||
            item === '.nuxt') {
          continue;
        }
        
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          // 根据分析深度决定是否递归
          if (params.analysisDepth === 'deep' || 
              (params.analysisDepth === 'normal' && this.shouldTraverseDirectory(fullPath))) {
            await this.collectFilesRecursive(fullPath, files, params);
          }
        } else if (stats.isFile()) {
          // 只包括源代码文件
          if (this.isSourceFile(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error: any) {
      this.logWarn(`Error reading directory ${dirPath}: ${error.message}`);
    }
  }
  
  /**
   * 判断是否应该遍历目录
   */
  private shouldTraverseDirectory(dirPath: string): boolean {
    const dirName = path.basename(dirPath);
    
    // 跳过测试和文档目录（对于normal深度）
    if (dirName.includes('test') || 
        dirName.includes('spec') || 
        dirName.includes('docs') ||
        dirName.includes('documentation')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 判断是否为源代码文件
   */
  private isSourceFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    
    return [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.m', '.h',
    ].includes(ext);
  }
  
  /**
   * 过滤排除的文件
   */
  private filterExcludedFiles(files: string[], excludePatterns: string[]): string[] {
    if (excludePatterns.length === 0) {
      return files;
    }
    
    return files.filter(file => {
      const relativePath = path.relative(process.cwd(), file);
      return !excludePatterns.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(relativePath) || regex.test(file);
      });
    });
  }
  
  /**
   * 分析文件
   */
  private async analyzeFiles(
    files: string[],
    params: CodeAnalysisParameters,
    context: any
  ): Promise<Array<{
    filePath: string;
    analysis: FileAnalysis;
    content: string;
    lines: string[];
  }>> {
    const results: Array<{
      filePath: string;
      analysis: FileAnalysis;
      content: string;
      lines: string[];
    }> = [];
    
    for (const filePath of files) {
      try {
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // 使用CodeContextEnhancer分析文件
        const codeEnhancer = new CodeContextEnhancer(path.dirname(filePath));
        const analysis = await codeEnhancer.analyzeFile(filePath);
        
        results.push({
          filePath,
          analysis,
          content,
          lines,
        });
        
        if (results.length % 10 === 0) {
          this.logInfo(`Analyzed ${results.length}/${files.length} files...`);
        }
      } catch (error: any) {
        this.logWarn(`Failed to analyze ${filePath}: ${error.message}`);
      }
    }
    
    return results;
  }
  
  /**
   * 计算指标
   */
  private async calculateMetrics(
    analysisResults: Array<{ filePath: string; analysis: FileAnalysis; content: string; lines: string[] }>,
    params: CodeAnalysisParameters
  ): Promise<CodeMetrics> {
    let totalLines = 0;
    let totalFunctions = 0;
    let totalClasses = 0;
    let totalComments = 0;
    let totalBlankLines = 0;
    
    let totalCyclomaticComplexity = 0;
    let totalFunctionLength = 0;
    let maxFunctionLength = 0;
    
    // 分析每个文件
    for (const result of analysisResults) {
      const { analysis, content, lines } = result;
      
      totalLines += lines.length;
      totalFunctions += analysis.functions.length;
      totalClasses += analysis.classes.length;
      
      // 计算注释和空行
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length === 0) {
          totalBlankLines++;
        } else if (trimmed.startsWith('//') || trimmed.startsWith('#') || 
                   trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          totalComments++;
        }
      }
      
      // 计算函数复杂度
      for (const func of analysis.functions) {
        // 简单的圈复杂度估算
        const functionContent = content.substring(
          func.location?.start || 0,
          func.location?.end || content.length
        );
        
        const cyclomatic = this.estimateCyclomaticComplexity(functionContent);
        totalCyclomaticComplexity += cyclomatic;
        
        // 函数长度
        const functionLines = func.location ? 
          (func.location.endLine - func.location.startLine + 1) : 0;
        totalFunctionLength += functionLines;
        maxFunctionLength = Math.max(maxFunctionLength, functionLines);
      }
    }
    
    // 计算比率和平均值
    const commentRatio = totalLines > 0 ? totalComments / totalLines : 0;
    const averageFunctionLength = totalFunctions > 0 ? totalFunctionLength / totalFunctions : 0;
    const averageCyclomaticComplexity = totalFunctions > 0 ? totalCyclomaticComplexity / totalFunctions : 0;
    
    // 估算Halstead指标（简化）
    const halsteadVolume = this.estimateHalsteadVolume(analysisResults);
    const halsteadDifficulty = averageCyclomaticComplexity * 0.5;
    const halsteadEffort = halsteadVolume * halsteadDifficulty;
    
    // 估算可维护性指数
    const maintainabilityIndex = this.calculateMaintainabilityIndex(
      halsteadVolume,
      averageCyclomaticComplexity,
      commentRatio
    );
    
    // 估算技术债务
    const technicalDebt = this.estimateTechnicalDebt(analysisResults);
    
    // 估算重复代码（简化）
    const duplication = this.estimateDuplication(analysisResults);
    
    return {
      basic: {
        linesOfCode: totalLines - totalBlankLines - totalComments,
        files: analysisResults.length,
        functions: totalFunctions,
        classes: totalClasses,
        comments: totalComments,
        commentRatio,
        blankLines: totalBlankLines,
      },
      complexity: {
        cyclomatic: averageCyclomaticComplexity,
        cognitive: averageCyclomaticComplexity * 1.2, // 简化
        halstead: {
          volume: halsteadVolume,
          difficulty: halsteadDifficulty,
          effort: halsteadEffort,
        },
        averageFunctionLength,
        maxFunctionLength,
      },
      quality: {
        maintainabilityIndex,
        technicalDebt,
        codeSmells: this.countCodeSmells(analysisResults),
        duplication,
      },
      dependencies: {
        external: this.countExternalDependencies(analysisResults),
        internal: this.countInternalDependencies(analysisResults),
        circular: 0, // 需要更复杂的分析
        depth: 1,    // 简化
      },
    };
  }
  
  /**
   * 创建默认指标
   */
  private createDefaultMetrics(): CodeMetrics {
    return {
      basic: {
        linesOfCode: 0,
        files: 0,
        functions: 0,
        classes: 0,
        comments: 0,
        commentRatio: 0,
        blankLines: 0,
      },
      complexity: {
        cyclomatic: 0,
        cognitive: 0,
        halstead: {
          volume: 0,
          difficulty: 0,
          effort: 0,
        },
        averageFunctionLength: 0,
        maxFunctionLength: 0,
      },
      quality: {
        maintainabilityIndex: 100,
        technicalDebt: 0,
        codeSmells: 0,
        duplication: {
          percentage: 0,
          duplicatedLines: 0,
          duplicatedBlocks: 0,
        },
      },
      dependencies: {
        external: 0,
        internal: 0,
        circular: 0,
        depth: 1,
      },
    };
  }
  
  /**
   * 估算圈复杂度
   */
  private estimateCyclomaticComplexity(code: string): number {
    // 简化估算：基于控制流关键字
    const keywords = [
      'if', 'else', 'for', 'while', 'do', 'switch', 'case',
      'catch', '&&', '||', '?', '??',
    ];
    
    let complexity = 1; // 基础复杂度
    
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return Math.min(complexity, 50); // 限制最大值
  }
  
  /**
   * 估算Halstead体积
   */
  private estimateHalsteadVolume(analysisResults: any[]): number {
    // 简化估算：基于唯一操作符和操作数
    let uniqueOperators = new Set<string>();
    let uniqueOperands = new Set<string>();
    
    for (const result of analysisResults) {
      const content = result.content.toLowerCase();
      
      // 常见操作符
      const operators = ['=', '+', '-', '*', '/', '%', '==', '!=', '===', '!==', 
                        '<', '>', '<=', '>=', '&&', '||', '!', '&', '|', '^',
                        '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '%=', '++', '--'];
      
      operators.forEach(op => {
        if (content.includes(op)) {
          uniqueOperators.add(op);
        }
      });
      
      // 提取标识符作为操作数（简化）
      const identifiers = content.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
      identifiers.forEach((id: string) => {
        if (id.length > 1 && !id.match(/^\d/)) {
          uniqueOperands.add(id);
        }
      });
    }
    
    const n1 = uniqueOperators.size;
    const n2 = uniqueOperands.size;
    const N1 = n1 * 10; // 简化：假设每个操作符出现10次
    const N2 = n2 * 5;  // 简化：假设每个操作数出现5次
    
    // Halstead体积公式: V = (N1 + N2) * log2(n1 + n2)
    if (n1 + n2 === 0) return 0;
    return (N1 + N2) * Math.log2(n1 + n2);
  }
  
  /**
   * 计算可维护性指数
   */
  private calculateMaintainabilityIndex(
    halsteadVolume: number,
    cyclomaticComplexity: number,
    commentRatio: number
  ): number {
    // 简化公式：MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC) + 50 * sin(sqrt(2.4 * CM))
    // 这里使用简化版本
    const mi = 171 - 
               5.2 * Math.log(Math.max(halsteadVolume, 1)) - 
               0.23 * cyclomaticComplexity + 
               50 * Math.sin(Math.sqrt(2.4 * commentRatio));
    
    return Math.max(0, Math.min(100, mi));
  }
  
  /**
   * 估算技术债务
   */
  private estimateTechnicalDebt(analysisResults: any[]): number {
    // 简化估算：基于问题数量和复杂度
    let debt = 0;
    
    for (const result of analysisResults) {
      const { analysis, content } = result;
      
      // 每个TODO注释 = 0.5小时
      const todoMatches = content.match(/\/\/\s*TODO/g) || [];
      debt += todoMatches.length * 0.5;
      
      // 每个FIXME注释 = 1小时
      const fixmeMatches = content.match(/\/\/\s*FIXME/g) || [];
      debt += fixmeMatches.length * 1;
      
      // 每个长函数（>50行）= 2小时
      for (const func of analysis.functions) {
        if (func.location && (func.location.endLine - func.location.startLine) > 50) {
          debt += 2;
        }
      }
      
      // 每个复杂函数（圈复杂度>10）= 3小时
      for (const func of analysis.functions) {
        const functionContent = content.substring(
          func.location?.start || 0,
          func.location?.end || content.length
        );
        const complexity = this.estimateCyclomaticComplexity(functionContent);
        if (complexity > 10) {
          debt += 3;
        }
      }
    }
    
    return Math.round(debt * 10) / 10; // 保留一位小数
  }
  
  /**
   * 计算代码异味数量
   */
  private countCodeSmells(analysisResults: any[]): number {
    let smells = 0;
    
    for (const result of analysisResults) {
      const { content } = result;
      
      // 检测常见的代码异味
      if (content.includes('console.log') && !content.includes('development')) {
        smells++; // 生产代码中的console.log
      }
      
      if (content.includes('var ')) {
        smells++; // 使用var
      }
      
      if (content.includes('eval(')) {
        smells += 2; // 使用eval（更严重）
      }
      
      // 长行（>120字符）
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.length > 120 && !line.trim().startsWith('//') && !line.trim().startsWith('#')) {
          smells++;
          break; // 每个文件只计一次长行异味
        }
      }
    }
    
    return smells;
  }
  
  /**
   * 估算重复代码
   */
  private estimateDuplication(analysisResults: any[]): {
    percentage: number;
    duplicatedLines: number;
    duplicatedBlocks: number;
  } {
    // 简化估算：基于常见模式
    let duplicatedLines = 0;
    const commonPatterns = [
      'if (error) {',
      'console.error(',
      'return res.status(',
      'try {',
      'catch (error) {',
      'export default',
      'import React from',
    ];
    
    for (const pattern of commonPatterns) {
      let patternCount = 0;
      for (const result of analysisResults) {
        const { content } = result;
        if (content.includes(pattern)) {
          patternCount++;
        }
      }
      
      // 如果模式在多个文件中出现，计为重复
      if (patternCount > 1) {
        duplicatedLines += patternCount * 3; // 假设每个模式约3行
      }
    }
    
    const totalLines = analysisResults.reduce((sum, result) => {
      return sum + result.content.split('\n').length;
    }, 0);
    
    const percentage = totalLines > 0 ? (duplicatedLines / totalLines) * 100 : 0;
    
    return {
      percentage,
      duplicatedLines,
      duplicatedBlocks: Math.floor(duplicatedLines / 10), // 每10行一个块
    };
  }
  
  /**
   * 计算外部依赖数量
   */
  private countExternalDependencies(analysisResults: any[]): number {
    const externalImports = new Set<string>();
    
    for (const result of analysisResults) {
      const { content } = result;
      
      // 检测导入语句
      const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
      const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        // 排除相对路径导入
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
          const packageName = importPath.split('/')[0];
          externalImports.add(packageName);
        }
      }
      
      while ((match = requireRegex.exec(content)) !== null) {
        const requirePath = match[1];
        if (!requirePath.startsWith('.') && !requirePath.startsWith('/')) {
          const packageName = requirePath.split('/')[0];
          externalImports.add(packageName);
        }
      }
    }
    
    return externalImports.size;
  }
  
  /**
   * 计算内部依赖数量
   */
  private countInternalDependencies(analysisResults: any[]): number {
    let internalDeps = 0;
    
    for (const result of analysisResults) {
      const { content } = result;
      
      // 检测相对路径导入
      const importRegex = /import\s+.*from\s+['"](\.+\/[^'"]+)['"]/g;
      const requireRegex = /require\s*\(\s*['"](\.+\/[^'"]+)['"]\s*\)/g;
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        internalDeps++;
      }
      
      while ((match = requireRegex.exec(content)) !== null) {
        internalDeps++;
      }
    }
    
    return internalDeps;
  }
  
  /**
   * 检查问题
   */
  private async checkForIssues(
    analysisResults: Array<{ filePath: string; analysis: FileAnalysis; content: string; lines: string[] }>,
    params: CodeAnalysisParameters
  ): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    const allRules = this.getAllRules(params);
    
    for (const result of analysisResults) {
      const { filePath, content, lines } = result;
      
      // 检查每个规则
      for (const rule of allRules) {
        const regex = new RegExp(rule.pattern, 'gs');
        let match;
        
        while ((match = regex.exec(content)) !== null) {
          // 计算行号
          const position = match.index;
          const beforeMatch = content.substring(0, position);
          const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
          
          // 提取代码片段
          const startLine = Math.max(1, lineNumber - 2);
          const endLine = Math.min(lines.length, lineNumber + 2);
          const codeSnippet = lines.slice(startLine - 1, endLine).join('\n');
          
          const issue: CodeIssue = {
            id: `${rule.id}_${filePath.replace(/\W/g, '_')}_${lineNumber}`,
            type: rule.type,
            severity: rule.severity,
            description: rule.description,
            location: {
              filePath,
              lineStart: lineNumber,
              lineEnd: lineNumber,
            },
            codeSnippet,
            suggestedFix: rule.fix,
            ruleId: rule.id,
            confidence: 0.8, // 默认置信度
          };
          
          issues.push(issue);
        }
      }
    }
    
    return issues;
  }
  
  /**
   * 获取所有规则
   */
  private getAllRules(params: CodeAnalysisParameters): Array<{
    id: string;
    type: CodeIssueType;
    pattern: RegExp;
    description: string;
    severity: IssueSeverity;
    fix?: string;
  }> {
    const allRules: any[] = [];
    
    // 添加内置规则
    if (params.analyzers.includes('all') || params.analyzers.includes('style')) {
      allRules.push(...this.codeRules.style);
    }
    
    if (params.analyzers.includes('all') || params.analyzers.includes('complexity')) {
      allRules.push(...this.codeRules.complexity);
    }
    
    if (params.analyzers.includes('all') || params.analyzers.includes('security')) {
      allRules.push(...this.codeRules.security);
    }
    
    if (params.analyzers.includes('all') || params.analyzers.includes('performance')) {
      allRules.push(...this.codeRules.performance);
    }
    
    if (params.analyzers.includes('all') || params.analyzers.includes('bug_risk')) {
      allRules.push(...this.codeRules.bug_risk);
    }
    
    // 添加自定义规则
    if (params.customRules) {
      for (const customRule of params.customRules) {
        allRules.push({
          id: customRule.id,
          type: 'style' as CodeIssueType, // 默认类型
          pattern: new RegExp(customRule.pattern, 'g'),
          description: customRule.description,
          severity: customRule.severity,
          fix: 'Address custom rule violation',
        });
      }
    }
    
    return allRules;
  }
  
  /**
   * 分析依赖关系
   */
  private async analyzeDependencies(
    files: string[],
    params: CodeAnalysisParameters,
    context: any
  ): Promise<{
    external: Array<{ name: string; version?: string; type: 'production' | 'development' }>;
    internal: Array<{ from: string; to: string; type: 'import' | 'require' | 'extend' | 'implement' }>;
    circular: string[][];
  }> {
    const external: Set<string> = new Set();
    const internal: Array<{ from: string; to: string; type: 'import' | 'require' }> = [];
    
    // 尝试读取package.json获取依赖信息
    let packageJson: any = null;
    const packageJsonPath = path.join(params.codePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const content = fs.readFileSync(packageJsonPath, 'utf8');
        packageJson = JSON.parse(content);
      } catch (error) {
        this.logWarn(`Failed to parse package.json: ${error}`);
      }
    }
    
    // 分析文件导入
    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(params.codePath, filePath);
        
        // 分析导入语句
        const importRegex = /import\s+.*from\s+['"]([^'"]+)['"]/g;
        const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        
        let match;
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          await this.processDependency(importPath, relativePath, external, internal, params.codePath);
        }
        
        while ((match = requireRegex.exec(content)) !== null) {
          const requirePath = match[1];
          await this.processDependency(requirePath, relativePath, external, internal, params.codePath);
        }
      } catch (error) {
        this.logWarn(`Failed to analyze dependencies in ${filePath}: ${error}`);
      }
    }
    
    // 转换外部依赖为数组
    const externalArray = Array.from(external).map(name => ({
      name,
      version: packageJson?.dependencies?.[name] || 
               packageJson?.devDependencies?.[name] ||
               'unknown',
      type: packageJson?.dependencies?.[name] ? 'production' : 'development' as 'production' | 'development',
    }));
    
    return {
      external: externalArray,
      internal,
      circular: [], // 需要更复杂的分析来检测循环依赖
    };
  }
  
  /**
   * 处理依赖
   */
  private async processDependency(
    importPath: string,
    sourceFile: string,
    external: Set<string>,
    internal: Array<{ from: string; to: string; type: 'import' | 'require' }>,
    basePath: string
  ): Promise<void> {
    if (importPath.startsWith('.') || importPath.startsWith('/')) {
      // 内部依赖
      let targetFile = importPath;
      if (!targetFile.match(/\.(js|ts|jsx|tsx)$/)) {
        targetFile += '.js'; // 添加默认扩展名
      }
      
      internal.push({
        from: sourceFile,
        to: targetFile,
        type: 'import',
      });
    } else {
      // 外部依赖
      const packageName = importPath.split('/')[0];
      external.add(packageName);
    }
  }
  
  /**
   * 分析安全问题
   */
  private async analyzeSecurity(
    analysisResults: any[],
    params: CodeAnalysisParameters
  ): Promise<{
    vulnerabilities: Array<{ type: string; description: string; severity: IssueSeverity; location?: string; cve?: string }>;
    recommendations: string[];
  }> {
    const vulnerabilities: Array<{ type: string; description: string; severity: IssueSeverity; location?: string; cve?: string }> = [];
    const recommendations: string[] = [];
    
    for (const result of analysisResults) {
      const { filePath, content } = result;
      
      // 检查常见的安全问题
      if (content.includes('eval(')) {
        vulnerabilities.push({
          type: 'Code Injection',
          description: 'Use of eval() can lead to code injection',
          severity: 'high',
          location: filePath,
        });
        recommendations.push('Replace eval() with safer alternatives like Function() or JSON.parse()');
      }
      
      if (content.includes('innerHTML') && !content.includes('textContent')) {
        vulnerabilities.push({
          type: 'XSS',
          description: 'Direct innerHTML assignment can lead to XSS attacks',
          severity: 'medium',
          location: filePath,
        });
        recommendations.push('Use textContent instead of innerHTML, or sanitize inputs');
      }
      
      if (content.includes('localStorage') && content.includes('password')) {
        vulnerabilities.push({
          type: 'Sensitive Data Exposure',
          description: 'Storing passwords in localStorage is insecure',
          severity: 'high',
          location: filePath,
        });
        recommendations.push('Use secure storage methods like HTTP-only cookies or server-side storage');
      }
      
      if (content.includes('http://') && !content.includes('https://')) {
        vulnerabilities.push({
          type: 'Insecure Communication',
          description: 'Using HTTP instead of HTTPS',
          severity: 'medium',
          location: filePath,
        });
        recommendations.push('Use HTTPS for all communications');
      }
    }
    
    // 通用建议
    if (vulnerabilities.length > 0) {
      recommendations.push('Run security scans regularly');
      recommendations.push('Keep dependencies updated');
      recommendations.push('Implement proper input validation');
    } else {
      recommendations.push('No critical security issues found');
      recommendations.push('Continue regular security practices');
    }
    
    return {
      vulnerabilities,
      recommendations,
    };
  }
  
  /**
   * 分析性能问题
   */
  private async analyzePerformance(
    analysisResults: any[],
    params: CodeAnalysisParameters
  ): Promise<{
    bottlenecks: Array<{ type: 'cpu' | 'memory' | 'io' | 'network'; description: string; location: string; impact: 'low' | 'medium' | 'high' }>;
    suggestions: string[];
  }> {
    const bottlenecks: Array<{ type: 'cpu' | 'memory' | 'io' | 'network'; description: string; location: string; impact: 'low' | 'medium' | 'high' }> = [];
    const suggestions: string[] = [];
    
    for (const result of analysisResults) {
      const { filePath, content } = result;
      
      // 检查常见的性能问题
      if (content.includes('.length') && content.includes('for')) {
        // 检查是否在循环中访问length
        const forLoopRegex = /for\s*\([^;]*;\s*[^;]*;\s*[^)]*\)\s*\{[^}]*\.length[^}]*\}/s;
        if (forLoopRegex.test(content)) {
          bottlenecks.push({
            type: 'cpu',
            description: 'Array length accessed in loop condition',
            location: filePath,
            impact: 'low',
          });
          suggestions.push('Cache array length before loop');
        }
      }
      
      if (content.includes('JSON.stringify') && content.includes('JSON.parse')) {
        bottlenecks.push({
          type: 'cpu',
          description: 'Unnecessary JSON serialization/deserialization',
          location: filePath,
          impact: 'medium',
        });
        suggestions.push('Avoid unnecessary JSON operations');
      }
      
      if (content.includes('setInterval') && !content.includes('clearInterval')) {
        bottlenecks.push({
          type: 'memory',
          description: 'setInterval without clearInterval can cause memory leaks',
          location: filePath,
          impact: 'medium',
        });
        suggestions.push('Always clear intervals when done');
      }
    }
    
    // 通用性能建议
    if (bottlenecks.length > 0) {
      suggestions.push('Use performance profiling tools');
      suggestions.push('Consider lazy loading for large resources');
    } else {
      suggestions.push('No obvious performance bottlenecks found');
      suggestions.push('Consider load testing for performance validation');
    }
    
    return {
      bottlenecks,
      suggestions,
    };
  }
  
  /**
   * 生成修复建议摘要
   */
  private async generateFixSummary(
    issues: CodeIssue[],
    params: CodeAnalysisParameters
  ): Promise<{
    quickWins: string[];
    mediumTerm: string[];
    longTerm: string[];
    estimatedEffort: { quick: number; medium: number; long: number };
  }> {
    const quickWins: string[] = [];
    const mediumTerm: string[] = [];
    const longTerm: string[] = [];
    
    let quickEffort = 0;
    let mediumEffort = 0;
    let longEffort = 0;
    
    // 分类问题
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          quickWins.push(`Fix ${issue.type} at ${issue.location.filePath}:${issue.location.lineStart}`);
          quickEffort += 2; // 2小时每个严重问题
          break;
          
        case 'high':
          quickWins.push(`Address ${issue.type} at ${issue.location.filePath}:${issue.location.lineStart}`);
          quickEffort += 1; // 1小时每个高优先级问题
          break;
          
        case 'medium':
          mediumTerm.push(`Improve ${issue.type} at ${issue.location.filePath}:${issue.location.lineStart}`);
          mediumEffort += 0.5; // 0.5小时每个中优先级问题
          break;
          
        case 'low':
          longTerm.push(`Consider ${issue.type} at ${issue.location.filePath}:${issue.location.lineStart}`);
          longEffort += 0.25; // 0.25小时每个低优先级问题
          break;
          
        case 'info':
          longTerm.push(`Review ${issue.type} at ${issue.location.filePath}:${issue.location.lineStart}`);
          longEffort += 0.1; // 0.1小时每个信息问题
          break;
      }
    }
    
    // 限制列表长度
    const limitedQuickWins = quickWins.slice(0, 5);
    const limitedMediumTerm = mediumTerm.slice(0, 5);
    const limitedLongTerm = longTerm.slice(0, 5);
    
    // 如果没有快速修复，添加通用建议
    if (limitedQuickWins.length === 0 && issues.length > 0) {
      limitedQuickWins.push('Start with medium priority issues');
    }
    
    return {
      quickWins: limitedQuickWins,
      mediumTerm: limitedMediumTerm,
      longTerm: limitedLongTerm,
      estimatedEffort: {
        quick: Math.round(quickEffort * 10) / 10,
        medium: Math.round(mediumEffort * 10) / 10,
        long: Math.round(longEffort * 10) / 10,
      },
    };
  }
  
  /**
   * 计算代码质量等级
   */
  private calculateQuality(issues: CodeIssue[], metrics: CodeMetrics): CodeQuality {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    
    // 基于问题数量和质量指标
    if (criticalIssues > 5 || metrics.quality.maintainabilityIndex < 20) {
      return 'critical';
    } else if (criticalIssues > 0 || highIssues > 10 || metrics.quality.maintainabilityIndex < 50) {
      return 'poor';
    } else if (highIssues > 3 || metrics.quality.maintainabilityIndex < 70) {
      return 'fair';
    } else if (issues.length > 20 || metrics.quality.maintainabilityIndex < 85) {
      return 'good';
    } else {
      return 'excellent';
    }
  }
  
  /**
   * 计算问题统计
   */
  private calculateIssueStats(issues: CodeIssue[]): {
    total: number;
    bySeverity: Record<IssueSeverity, number>;
    byType: Record<CodeIssueType, number>;
    criticalIssues: number;
  } {
    const bySeverity: Record<IssueSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    
    const byType: Record<CodeIssueType, number> = {
      syntax: 0,
      style: 0,
      complexity: 0,
      performance: 0,
      security: 0,
      maintainability: 0,
      documentation: 0,
      dependency: 0,
      duplication: 0,
      bug_risk: 0,
    };
    
    for (const issue of issues) {
      bySeverity[issue.severity]++;
      byType[issue.type]++;
    }
    
    return {
      total: issues.length,
      bySeverity,
      byType,
      criticalIssues: bySeverity.critical,
    };
  }
  
  /**
   * 生成报告
   */
  private async generateReport(
    params: CodeAnalysisParameters,
    analysisResults: any[],
    issues: CodeIssue[],
    metrics: CodeMetrics,
    context: any
  ): Promise<string | undefined> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportDir = path.join(params.codePath, 'code-analysis-reports');
      const reportPath = path.join(reportDir, `analysis-${timestamp}.json`);
      
      // 创建报告目录
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      // 生成报告数据
      const report = {
        metadata: {
          timestamp: new Date().toISOString(),
          codePath: params.codePath,
          analysisType: params.analysisType,
          analyzers: params.analyzers,
          analysisDepth: params.analysisDepth,
        },
        summary: {
          quality: this.calculateQuality(issues, metrics),
          filesAnalyzed: analysisResults.length,
          totalIssues: issues.length,
          criticalIssues: this.calculateIssueStats(issues).criticalIssues,
        },
        metrics,
        issueSummary: this.calculateIssueStats(issues),
        topIssues: issues.slice(0, 20), // 只包含前20个问题
        recommendations: await this.generateRecommendations(issues, metrics),
      };
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
      
      this.logInfo(`Analysis report generated: ${reportPath}`);
      return reportPath;
      
    } catch (error: any) {
      this.logWarn(`Failed to generate report: ${error.message}`);
      return undefined;
    }
  }
  
  /**
   * 生成建议
   */
  private async generateRecommendations(issues: CodeIssue[], metrics: CodeMetrics): Promise<string[]> {
    const recommendations: string[] = [];
    
    // 基于问题类型的建议
    const issueStats = this.calculateIssueStats(issues);
    
    if (issueStats.byType.security > 0) {
      recommendations.push('Address security vulnerabilities first');
    }
    
    if (issueStats.byType.complexity > 5) {
      recommendations.push('Refactor complex code to improve maintainability');
    }
    
    if (issueStats.byType.duplication > 0) {
      recommendations.push('Reduce code duplication to improve consistency');
    }
    
    // 基于指标的建议
    if (metrics.quality.maintainabilityIndex < 50) {
      recommendations.push('Code maintainability is low, consider major refactoring');
    }
    
    if (metrics.complexity.cyclomatic > 10) {
      recommendations.push('Reduce cyclomatic complexity for better testability');
    }
    
    if (metrics.quality.technicalDebt > 40) {
      recommendations.push('Significant technical debt, allocate time for cleanup');
    }
    
    // 通用建议
    if (recommendations.length === 0 && issues.length > 0) {
      recommendations.push('Start with critical and high severity issues');
      recommendations.push('Establish code review process to prevent new issues');
    } else if (issues.length === 0) {
      recommendations.push('Code quality is good, maintain current practices');
    }
    
    return recommendations.slice(0, 5); // 限制为5条建议
  }
  
  /**
   * 计算统计信息
   */
  private calculateStatistics(
    startTime: number,
    files: string[],
    issues: CodeIssue[]
  ): {
    analysisTime: number;
    filesAnalyzed: number;
    memoryUsage?: number;
    rulesChecked: number;
  } {
    const analysisTime = Date.now() - startTime;
    
    // 尝试获取内存使用
    let memoryUsage: number | undefined;
    try {
      const used = process.memoryUsage();
      memoryUsage = Math.round(used.heapUsed / 1024 / 1024); // MB
    } catch {
      // 忽略内存获取错误
    }
    
    // 估算规则检查数（基于问题数量和文件数）
    const rulesChecked = issues.length * 2 + files.length * 5;
    
    return {
      analysisTime,
      filesAnalyzed: files.length,
      memoryUsage,
      rulesChecked,
    };
  }
  
  // ==================== 工具元数据 ====================
  
  /**
   * 获取工具ID
   */
  getToolId(): string {
    return CodeAnalysisTool.TOOL_ID;
  }
  
  /**
   * 获取工具名称
   */
  getToolName(): string {
    return CodeAnalysisTool.TOOL_NAME;
  }
  
  /**
   * 获取工具描述
   */
  getToolDescription(): string {
    return CodeAnalysisTool.TOOL_DESCRIPTION;
  }
  
  /**
   * 获取工具类别
   */
  getToolCategory(): ToolCategory {
    return CodeAnalysisTool.TOOL_CATEGORY;
  }
  
  /**
   * 获取工具能力
   */
  getToolCapabilities(): ToolCapabilities {
    return CodeAnalysisTool.TOOL_CAPABILITIES;
  }
  
  /**
   * 获取权限级别
   */
  getPermissionLevel(): PermissionLevel {
    return CodeAnalysisTool.PERMISSION_LEVEL;
  }
}

export default CodeAnalysisTool;