/**
 * CodeContextEnhancer - 编码上下文增强器
 * 
 * 负责：
 * 1. 分析当前编辑器状态和文件内容
 * 2. 分析项目结构和依赖关系
 * 3. 提取相关代码片段和上下文
 * 4. 提供编码特定的上下文信息
 * 
 * 设计目标：为QueryEngine提供丰富的编码上下文，支持智能代码理解和生成
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

// ==================== 类型定义 ====================

/**
 * 文件分析结果
 */
export interface FileAnalysis {
  filePath: string;
  uri: vscode.Uri;
  language: string;
  languageId: string;
  size: number;
  lineCount: number;
  
  // 代码结构
  imports: ImportStatement[];
  exports: ExportStatement[];
  functions: FunctionInfo[];
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  variables: VariableInfo[];
  types: TypeInfo[];
  
  // 代码质量
  complexity: number;
  issues: CodeIssue[];
  styleIssues: StyleIssue[];
  
  // 元数据
  lastModified: Date;
  isTestFile: boolean;
  isConfigFile: boolean;
  isSourceFile: boolean;
}

/**
 * 导入语句
 */
export interface ImportStatement {
  source: string;
  specifiers: ImportSpecifier[];
  isTypeOnly: boolean;
  line: number;
}

/**
 * 导入说明符
 */
export interface ImportSpecifier {
  name: string;
  alias?: string;
  isDefault: boolean;
  isNamespace: boolean;
}

/**
 * 导出语句
 */
export interface ExportStatement {
  type: 'default' | 'named' | 'namespace' | 'all';
  specifiers: ExportSpecifier[];
  source?: string;
  line: number;
}

/**
 * 导出说明符
 */
export interface ExportSpecifier {
  name: string;
  alias?: string;
}

/**
 * 函数信息
 */
export interface FunctionInfo {
  name: string;
  parameters: ParameterInfo[];
  returnType?: string;
  body: string;
  lineStart: number;
  lineEnd: number;
  line?: number; // 兼容性属性
  startLine?: number; // 兼容性属性
  endLine?: number; // 兼容性属性
  location?: {
    start: number;
    end: number;
    startLine: number;
    endLine: number;
    startColumn?: number;
    endColumn?: number;
  };
  isAsync: boolean;
  isGenerator: boolean;
  isArrow: boolean;
  isMethod: boolean;
  isConstructor?: boolean;
  isExported?: boolean;
  visibility: 'public' | 'private' | 'protected';
  documentation?: string;
  complexity: number;
}

/**
 * 参数信息
 */
export interface ParameterInfo {
  name: string;
  type?: string;
  defaultValue?: string;
  isRest: boolean;
  isOptional: boolean;
}

/**
 * 类信息
 */
export interface ClassInfo {
  name: string;
  extends?: string;
  implements: string[];
  properties: PropertyInfo[];
  methods: MethodInfo[];
  constructors: ConstructorInfo[];
  lineStart: number;
  lineEnd: number;
  documentation?: string;
}

/**
 * 属性信息
 */
export interface PropertyInfo {
  name: string;
  type?: string;
  defaultValue?: string;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
  isReadonly: boolean;
  line: number;
}

/**
 * 方法信息
 */
export interface MethodInfo {
  name: string;
  parameters: ParameterInfo[];
  returnType?: string;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
  isAsync: boolean;
  isAbstract: boolean;
  lineStart: number;
  lineEnd: number;
}

/**
 * 构造函数信息
 */
export interface ConstructorInfo {
  parameters: ParameterInfo[];
  line: number;
}

/**
 * 接口信息
 */
export interface InterfaceInfo {
  name: string;
  extends: string[];
  properties: InterfacePropertyInfo[];
  methods: InterfaceMethodInfo[];
  lineStart: number;
  lineEnd: number;
}

/**
 * 接口属性信息
 */
export interface InterfacePropertyInfo {
  name: string;
  type: string;
  isOptional: boolean;
  isReadonly: boolean;
  line: number;
}

/**
 * 接口方法信息
 */
export interface InterfaceMethodInfo {
  name: string;
  parameters: ParameterInfo[];
  returnType: string;
  isOptional: boolean;
  line: number;
}

/**
 * 变量信息
 */
export interface VariableInfo {
  name: string;
  type?: string;
  value?: string;
  isConst: boolean;
  isLet: boolean;
  isVar: boolean;
  line: number;
}

/**
 * 类型信息
 */
export interface TypeInfo {
  name: string;
  definition: string;
  line: number;
}

/**
 * 代码问题
 */
export interface CodeIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  rule?: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  fix?: string;
}

/**
 * 风格问题
 */
export interface StyleIssue {
  type: 'format' | 'naming' | 'complexity' | 'duplication';
  message: string;
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * 项目分析结果
 */
export interface ProjectAnalysis {
  root: string;
  name: string;
  structure: DirectoryTree;
  files: FileInfo[];
  dependencies: DependencyInfo[];
  buildSystem: BuildSystemInfo;
  testFramework: TestFrameworkInfo;
  versionControl: VersionControlInfo;
  languageDistribution: LanguageDistribution;
  complexity: ProjectComplexity;
}

/**
 * 目录树
 */
export interface DirectoryTree {
  path: string;
  name: string;
  type: 'directory' | 'file';
  children: DirectoryTree[];
  size?: number;
  fileCount?: number;
  dirCount?: number;
}

/**
 * 文件信息
 */
export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  lastModified: Date;
  language?: string;
}

/**
 * 依赖信息
 */
export interface DependencyInfo {
  name: string;
  version: string;
  type: 'production' | 'development' | 'peer';
  source: 'npm' | 'yarn' | 'pnpm' | 'cargo' | 'pip' | 'maven' | 'gradle';
  filePath: string;
}

/**
 * 构建系统信息
 */
export interface BuildSystemInfo {
  type: 'npm' | 'yarn' | 'pnpm' | 'webpack' | 'vite' | 'rollup' | 'esbuild' | 'tsc' | 'unknown';
  configFile?: string;
  scripts: Record<string, string>;
  hasTypeScript: boolean;
  hasBabel: boolean;
}

/**
 * 测试框架信息
 */
export interface TestFrameworkInfo {
  type: 'jest' | 'mocha' | 'vitest' | 'cypress' | 'playwright' | 'pytest' | 'junit' | 'unknown';
  configFile?: string;
  testPatterns: string[];
  coverageThreshold?: number;
}

/**
 * 版本控制信息
 */
export interface VersionControlInfo {
  type: 'git' | 'svn' | 'none';
  branch?: string;
  commits?: number;
  contributors?: number;
  lastCommit?: Date;
  hasUncommittedChanges: boolean;
}

/**
 * 语言分布
 */
export interface LanguageDistribution {
  totalFiles: number;
  byLanguage: Record<string, number>;
  byExtension: Record<string, number>;
}

/**
 * 项目复杂度
 */
export interface ProjectComplexity {
  totalLines: number;
  totalFiles: number;
  averageComplexity: number;
  maxComplexity: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
}

/**
 * 代码片段
 */
export interface CodeSnippet {
  filePath: string;
  content: string;
  language: string;
  lineStart: number;
  lineEnd: number;
  relevance: number;
  context: string;
  metadata: {
    functionName?: string;
    className?: string;
    imports?: ImportStatement[];
    exports?: ExportStatement[];
  };
}

/**
 * 代码变更影响分析
 */
export interface ImpactAnalysis {
  changedFiles: string[];
  affectedFiles: string[];
  breakingChanges: string[];
  testAffected: boolean;
  dependenciesAffected: string[];
  complexityChange: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

/**
 * 代码变更
 */
export interface CodeChange {
  filePath: string;
  changeType: 'add' | 'modify' | 'delete' | 'rename';
  oldContent?: string;
  newContent: string;
  lineStart: number;
  lineEnd: number;
}

/**
 * 查询上下文
 */
export interface QueryContext {
  currentFile?: FileAnalysis;
  project?: ProjectAnalysis;
  editorState: EditorState;
  recentChanges: CodeChange[];
  userIntent?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * 编辑器状态
 */
export interface EditorState {
  activeDocument?: vscode.TextDocument;
  selection?: vscode.Selection;
  visibleRanges?: readonly vscode.Range[];
  workspaceFolders?: readonly vscode.WorkspaceFolder[];
  languageId?: string;
  hasSelection: boolean;
  isDirty: boolean;
}

// ==================== 编码上下文增强器 ====================

/**
 * CodeContextEnhancer
 * 提供丰富的编码上下文信息
 */
export class CodeContextEnhancer {
  private workspaceRoot: string;
  private outputChannel: vscode.OutputChannel;
  private cache: Map<string, any> = new Map();
  private analysisInProgress: Map<string, Promise<any>> = new Map();

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.outputChannel = vscode.window.createOutputChannel('CodeLine CodeContextEnhancer');
  }

  /**
   * 初始化增强器（可选方法）
   */
  public async initialize(): Promise<void> {
    // 默认实现：无操作
    this.outputChannel.appendLine('✅ CodeContextEnhancer initialized');
  }

  /**
   * 清理增强器资源（可选方法）
   */
  public async dispose(): Promise<void> {
    // 默认实现：清理缓存
    this.cache.clear();
    this.analysisInProgress.clear();
    this.outputChannel.appendLine('✅ CodeContextEnhancer disposed');
  }

  /**
   * 获取当前查询上下文
   */
  public async getQueryContext(userInput?: string): Promise<QueryContext> {
    const startTime = Date.now();
    
    try {
      // 并行获取各种上下文信息
      const [currentFile, project, editorState, recentChanges] = await Promise.all([
        this.analyzeCurrentFile().catch(() => undefined),
        this.analyzeProjectStructure().catch(() => undefined),
        this.getEditorState(),
        this.getRecentChanges().catch(() => []),
      ]);

      const context: QueryContext = {
        currentFile,
        project,
        editorState,
        recentChanges,
        userIntent: userInput,
      };

      const duration = Date.now() - startTime;
      this.outputChannel.appendLine(`✅ 查询上下文获取完成 (${duration}ms)`);
      
      return context;
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ 获取查询上下文失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 分析当前文件
   */
  public async analyzeCurrentFile(): Promise<FileAnalysis | undefined> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !editor.document) {
      return undefined;
    }

    const document = editor.document;
    const filePath = document.uri.fsPath;
    const cacheKey = `file_analysis_${filePath}_${document.version}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 检查是否正在分析
    if (this.analysisInProgress.has(cacheKey)) {
      return this.analysisInProgress.get(cacheKey);
    }
    
    // 开始分析
    const analysisPromise = this.performFileAnalysis(document);
    this.analysisInProgress.set(cacheKey, analysisPromise);
    
    try {
      const result = await analysisPromise;
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      this.analysisInProgress.delete(cacheKey);
    }
  }

  /**
   * 分析项目结构
   */
  public async analyzeProjectStructure(): Promise<ProjectAnalysis> {
    const cacheKey = `project_analysis_${this.workspaceRoot}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 检查是否正在分析
    if (this.analysisInProgress.has(cacheKey)) {
      return this.analysisInProgress.get(cacheKey);
    }
    
    // 开始分析
    const analysisPromise = this.performProjectAnalysis();
    this.analysisInProgress.set(cacheKey, analysisPromise);
    
    try {
      const result = await analysisPromise;
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      this.analysisInProgress.delete(cacheKey);
    }
  }

  /**
   * 提取相关代码片段
   */
  public async extractRelevantCodeSnippets(
    query: string,
    maxSnippets: number = 5
  ): Promise<CodeSnippet[]> {
    try {
      // 获取项目结构
      const project = await this.analyzeProjectStructure();
      
      // 根据查询关键词筛选文件
      const keywords = this.extractKeywords(query);
      const relevantFiles = await this.findRelevantFiles(keywords, project);
      
      // 从相关文件中提取片段
      const snippets: CodeSnippet[] = [];
      for (const file of relevantFiles.slice(0, 10)) { // 限制文件数量
        const fileSnippets = await this.extractSnippetsFromFile(file, keywords);
        snippets.push(...fileSnippets);
      }
      
      // 按相关性排序并限制数量
      snippets.sort((a, b) => b.relevance - a.relevance);
      return snippets.slice(0, maxSnippets);
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ 提取代码片段失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 分析代码变更影响
   */
  public async analyzeChangeImpact(changes: CodeChange[]): Promise<ImpactAnalysis> {
    try {
      const project = await this.analyzeProjectStructure();
      const analysis: ImpactAnalysis = {
        changedFiles: changes.map(c => c.filePath),
        affectedFiles: [],
        breakingChanges: [],
        testAffected: false,
        dependenciesAffected: [],
        complexityChange: 0,
        riskLevel: 'low',
        recommendations: [],
      };
      
      // 分析每个变更的影响
      for (const change of changes) {
        const fileImpact = await this.analyzeFileChangeImpact(change, project);
        
        // 合并影响
        analysis.affectedFiles.push(...fileImpact.affectedFiles);
        analysis.breakingChanges.push(...fileImpact.breakingChanges);
        analysis.dependenciesAffected.push(...fileImpact.dependenciesAffected);
        analysis.complexityChange += fileImpact.complexityChange;
        
        if (fileImpact.testAffected) {
          analysis.testAffected = true;
        }
      }
      
      // 去重
      analysis.affectedFiles = [...new Set(analysis.affectedFiles)];
      analysis.dependenciesAffected = [...new Set(analysis.dependenciesAffected)];
      
      // 评估风险等级
      analysis.riskLevel = this.calculateRiskLevel(analysis);
      
      // 生成建议
      analysis.recommendations = this.generateRecommendations(analysis);
      
      return analysis;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ 变更影响分析失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取编辑器状态
   */
  private async getEditorState(): Promise<EditorState> {
    const editor = vscode.window.activeTextEditor;
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    return {
      activeDocument: editor?.document,
      selection: editor?.selection,
      visibleRanges: editor?.visibleRanges,
      workspaceFolders,
      languageId: editor?.document.languageId,
      hasSelection: !!(editor?.selection && !editor.selection.isEmpty),
      isDirty: editor?.document.isDirty || false,
    };
  }

  /**
   * 获取最近变更
   */
  private async getRecentChanges(): Promise<CodeChange[]> {
    // 简化实现：返回空数组
    // 实际实现可以集成git或监控文件变更
    return [];
  }

  // ==================== 私有方法 ====================

  /**
   * 执行文件分析
   */
  private async performFileAnalysis(document: vscode.TextDocument): Promise<FileAnalysis> {
    const filePath = document.uri.fsPath;
    const languageId = document.languageId;
    const content = document.getText();
    const lines = content.split('\n');
    
    // 基础分析
    const analysis: FileAnalysis = {
      filePath,
      uri: document.uri,
      language: this.getLanguageName(languageId),
      languageId,
      size: content.length,
      lineCount: lines.length,
      
      // 代码结构
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      interfaces: [],
      variables: [],
      types: [],
      
      // 代码质量
      complexity: this.calculateComplexity(content),
      issues: [],
      styleIssues: [],
      
      // 元数据
      lastModified: new Date(),
      isTestFile: this.isTestFile(filePath),
      isConfigFile: this.isConfigFile(filePath),
      isSourceFile: this.isSourceFile(filePath),
    };
    
    try {
      // 根据语言进行特定分析
      switch (languageId) {
        case 'typescript':
        case 'javascript':
          await this.analyzeJavaScriptLikeFile(content, analysis);
          break;
        case 'python':
          await this.analyzePythonFile(content, analysis);
          break;
        case 'java':
          await this.analyzeJavaFile(content, analysis);
          break;
        case 'go':
          await this.analyzeGoFile(content, analysis);
          break;
        case 'rust':
          await this.analyzeRustFile(content, analysis);
          break;
        default:
          // 通用分析
          await this.analyzeGenericFile(content, analysis);
      }
      
      // 运行诊断
      analysis.issues = await this.runDiagnostics(document);
      
    } catch (error: any) {
      this.outputChannel.appendLine(`⚠️ 文件分析部分失败: ${filePath} - ${error.message}`);
    }
    
    return analysis;
  }

  /**
   * 执行项目分析
   */
  private async performProjectAnalysis(): Promise<ProjectAnalysis> {
    const startTime = Date.now();
    
    try {
      // 获取项目名称
      const projectName = path.basename(this.workspaceRoot);
      
      // 扫描目录结构
      const structure = await this.scanDirectory(this.workspaceRoot);
      
      // 收集文件信息
      const files = await this.collectFiles(this.workspaceRoot);
      
      // 分析依赖
      const dependencies = await this.analyzeDependencies();
      
      // 分析构建系统
      const buildSystem = await this.analyzeBuildSystem();
      
      // 分析测试框架
      const testFramework = await this.analyzeTestFramework();
      
      // 分析版本控制
      const versionControl = await this.analyzeVersionControl();
      
      // 分析语言分布
      const languageDistribution = await this.analyzeLanguageDistribution(files);
      
      // 计算项目复杂度
      const complexity = await this.calculateProjectComplexity(files);
      
      const analysis: ProjectAnalysis = {
        root: this.workspaceRoot,
        name: projectName,
        structure,
        files,
        dependencies,
        buildSystem,
        testFramework,
        versionControl,
        languageDistribution,
        complexity,
      };
      
      const duration = Date.now() - startTime;
      this.outputChannel.appendLine(`✅ 项目分析完成: ${files.length} 个文件 (${duration}ms)`);
      
      return analysis;
      
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ 项目分析失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 扫描目录结构
   */
  private async scanDirectory(dirPath: string, maxDepth: number = 3, currentDepth: number = 0): Promise<DirectoryTree> {
    if (currentDepth >= maxDepth) {
      return {
        path: dirPath,
        name: path.basename(dirPath),
        type: 'directory',
        children: [],
      };
    }
    
    const tree: DirectoryTree = {
      path: dirPath,
      name: path.basename(dirPath),
      type: 'directory',
      children: [],
    };
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        // 忽略常见忽略目录
        if (this.shouldIgnore(entry.name)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          const childTree = await this.scanDirectory(fullPath, maxDepth, currentDepth + 1);
          tree.children.push(childTree);
        } else {
          tree.children.push({
            path: fullPath,
            name: entry.name,
            type: 'file',
            children: [],
          });
        }
      }
      
      // 计算统计信息
      this.calculateDirectoryStats(tree);
      
    } catch (error) {
      // 忽略权限错误等
    }
    
    return tree;
  }

  /**
   * 收集文件信息
   */
  private async collectFiles(dirPath: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    
    const walk = async (currentPath: string) => {
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          
          if (this.shouldIgnore(entry.name)) {
            continue;
          }
          
          if (entry.isDirectory()) {
            await walk(fullPath);
          } else {
            try {
              const stats = await fs.stat(fullPath);
              const extension = path.extname(entry.name);
              const language = this.getLanguageFromExtension(extension);
              
              files.push({
                path: fullPath,
                name: entry.name,
                extension,
                size: stats.size,
                lastModified: stats.mtime,
                language,
              });
            } catch {
              // 忽略无法访问的文件
            }
          }
        }
      } catch (error) {
        // 忽略目录访问错误
      }
    };
    
    await walk(dirPath);
    return files;
  }

  /**
   * 分析依赖
   */
  private async analyzeDependencies(): Promise<DependencyInfo[]> {
    const dependencies: DependencyInfo[] = [];
    
    // 检查常见的依赖管理文件
    const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
    const requirementsPath = path.join(this.workspaceRoot, 'requirements.txt');
    const pomXmlPath = path.join(this.workspaceRoot, 'pom.xml');
    const cargoTomlPath = path.join(this.workspaceRoot, 'Cargo.toml');
    const goModPath = path.join(this.workspaceRoot, 'go.mod');
    
    try {
      // Node.js/npm
      if (await this.fileExists(packageJsonPath)) {
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);
        
        // 生产依赖
        if (packageJson.dependencies) {
          for (const [name, version] of Object.entries(packageJson.dependencies)) {
            dependencies.push({
              name,
              version: version as string,
              type: 'production',
              source: 'npm',
              filePath: packageJsonPath,
            });
          }
        }
        
        // 开发依赖
        if (packageJson.devDependencies) {
          for (const [name, version] of Object.entries(packageJson.devDependencies)) {
            dependencies.push({
              name,
              version: version as string,
              type: 'development',
              source: 'npm',
              filePath: packageJsonPath,
            });
          }
        }
      }
      
      // Python
      if (await this.fileExists(requirementsPath)) {
        const content = await fs.readFile(requirementsPath, 'utf-8');
        const lines = content.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
            const match = trimmed.match(/^([^>=<]+)([>=<].*)?$/);
            if (match) {
              dependencies.push({
                name: match[1].trim(),
                version: match[2]?.trim() || 'latest',
                type: 'production',
                source: 'pip',
                filePath: requirementsPath,
              });
            }
          }
        }
      }
      
      // 其他构建系统的简化实现...
      
    } catch (error: any) {
      this.outputChannel.appendLine(`⚠️ 依赖分析部分失败: ${error.message}`);
    }
    
    return dependencies;
  }

  /**
   * 分析构建系统
   */
  private async analyzeBuildSystem(): Promise<BuildSystemInfo> {
    const defaultInfo: BuildSystemInfo = {
      type: 'unknown',
      scripts: {},
      hasTypeScript: false,
      hasBabel: false,
    };
    
    try {
      // 检查常见的构建系统配置文件
      const checkPaths = [
        'package.json',
        'webpack.config.js',
        'vite.config.js',
        'rollup.config.js',
        'tsconfig.json',
        'babel.config.js',
        '.babelrc',
      ];
      
      for (const configFile of checkPaths) {
        const configPath = path.join(this.workspaceRoot, configFile);
        if (await this.fileExists(configPath)) {
          // 简化实现：根据文件名推断
          if (configFile === 'package.json') {
            defaultInfo.type = 'npm';
            try {
              const content = await fs.readFile(configPath, 'utf-8');
              const packageJson = JSON.parse(content);
              defaultInfo.scripts = packageJson.scripts || {};
              defaultInfo.configFile = configPath;
            } catch {}
          } else if (configFile.startsWith('webpack')) {
            defaultInfo.type = 'webpack';
            defaultInfo.configFile = configPath;
          } else if (configFile.startsWith('vite')) {
            defaultInfo.type = 'vite';
            defaultInfo.configFile = configPath;
          } else if (configFile.startsWith('rollup')) {
            defaultInfo.type = 'rollup';
            defaultInfo.configFile = configPath;
          }
        }
      }
      
      // 检查TypeScript
      defaultInfo.hasTypeScript = await this.fileExists(path.join(this.workspaceRoot, 'tsconfig.json'));
      
      // 检查Babel
      defaultInfo.hasBabel = await this.fileExists(path.join(this.workspaceRoot, 'babel.config.js')) ||
                            await this.fileExists(path.join(this.workspaceRoot, '.babelrc'));
      
    } catch (error) {
      // 忽略错误
    }
    
    return defaultInfo;
  }

  /**
   * 分析测试框架
   */
  private async analyzeTestFramework(): Promise<TestFrameworkInfo> {
    const defaultInfo: TestFrameworkInfo = {
      type: 'unknown',
      testPatterns: ['**/*.test.*', '**/*.spec.*', '**/test/**/*.*'],
    };
    
    try {
      // 检查常见的测试框架配置文件
      const checkPaths = [
        'jest.config.js',
        'jest.config.json',
        'mocha.opts',
        '.mocharc.js',
        '.mocharc.json',
        'vitest.config.js',
        'cypress.json',
        'playwright.config.js',
        'pytest.ini',
        'setup.cfg',
      ];
      
      for (const configFile of checkPaths) {
        const configPath = path.join(this.workspaceRoot, configFile);
        if (await this.fileExists(configPath)) {
          // 简化实现：根据文件名推断
          if (configFile.includes('jest')) {
            defaultInfo.type = 'jest';
          } else if (configFile.includes('mocha')) {
            defaultInfo.type = 'mocha';
          } else if (configFile.includes('vitest')) {
            defaultInfo.type = 'vitest';
          } else if (configFile.includes('cypress')) {
            defaultInfo.type = 'cypress';
          } else if (configFile.includes('playwright')) {
            defaultInfo.type = 'playwright';
          } else if (configFile.includes('pytest')) {
            defaultInfo.type = 'pytest';
          }
          defaultInfo.configFile = configPath;
          break;
        }
      }
      
    } catch (error) {
      // 忽略错误
    }
    
    return defaultInfo;
  }

  /**
   * 分析版本控制
   */
  private async analyzeVersionControl(): Promise<VersionControlInfo> {
    const defaultInfo: VersionControlInfo = {
      type: 'none',
      hasUncommittedChanges: false,
    };
    
    try {
      const gitPath = path.join(this.workspaceRoot, '.git');
      if (await this.fileExists(gitPath)) {
        defaultInfo.type = 'git';
        
        // 尝试获取更多git信息
        try {
          // 这里可以集成git命令获取详细信息
          // 简化实现：只检测类型
        } catch {}
      }
      
    } catch (error) {
      // 忽略错误
    }
    
    return defaultInfo;
  }

  /**
   * 分析语言分布
   */
  private async analyzeLanguageDistribution(files: FileInfo[]): Promise<LanguageDistribution> {
    const byLanguage: Record<string, number> = {};
    const byExtension: Record<string, number> = {};
    
    for (const file of files) {
      const language = file.language || 'unknown';
      const extension = file.extension || '';
      
      byLanguage[language] = (byLanguage[language] || 0) + 1;
      byExtension[extension] = (byExtension[extension] || 0) + 1;
    }
    
    return {
      totalFiles: files.length,
      byLanguage,
      byExtension,
    };
  }

  /**
   * 计算项目复杂度
   */
  private async calculateProjectComplexity(files: FileInfo[]): Promise<ProjectComplexity> {
    // 简化实现：只统计文件和行数
    // 实际实现应该分析代码复杂度
    
    let totalLines = 0;
    const sampleFiles = files.slice(0, 100); // 采样分析
    
    for (const file of sampleFiles) {
      try {
        const content = await fs.readFile(file.path, 'utf-8');
        const lines = content.split('\n').length;
        totalLines += lines;
      } catch {
        // 忽略无法读取的文件
      }
    }
    
    // 估计总行数
    const estimatedTotalLines = files.length > 0 
      ? Math.round(totalLines * (files.length / sampleFiles.length))
      : 0;
    
    return {
      totalLines: estimatedTotalLines,
      totalFiles: files.length,
      averageComplexity: 1.5, // 默认值
      maxComplexity: 10, // 默认值
      cyclomaticComplexity: Math.round(estimatedTotalLines / 50), // 估算
      cognitiveComplexity: Math.round(estimatedTotalLines / 100), // 估算
    };
  }

  /**
   * 提取关键词
   */
  private extractKeywords(query: string): string[] {
    // 简单关键词提取
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must',
      'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'this', 'that', 'these', 'those',
      'what', 'which', 'who', 'whom', 'whose',
      'how', 'why', 'when', 'where',
    ]);
    
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    return [...new Set(words)]; // 去重
  }

  /**
   * 查找相关文件
   */
  private async findRelevantFiles(keywords: string[], project: ProjectAnalysis): Promise<FileInfo[]> {
    const relevantFiles: Array<{file: FileInfo, score: number}> = [];
    
    for (const file of project.files) {
      let score = 0;
      
      // 根据文件名评分
      const fileName = file.name.toLowerCase();
      for (const keyword of keywords) {
        if (fileName.includes(keyword)) {
          score += 3;
        }
      }
      
      // 根据路径评分
      const filePath = file.path.toLowerCase();
      for (const keyword of keywords) {
        if (filePath.includes(keyword)) {
          score += 2;
        }
      }
      
      // 根据扩展名调整权重
      const isCodeFile = ['.js', '.ts', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h'].includes(file.extension);
      const isTestFile = file.path.includes('test') || file.path.includes('spec');
      
      if (isCodeFile) {
        score += 1;
      }
      
      if (isTestFile) {
        score -= 1; // 测试文件权重稍低
      }
      
      if (score > 0) {
        relevantFiles.push({ file, score });
      }
    }
    
    // 按分数排序
    relevantFiles.sort((a, b) => b.score - a.score);
    return relevantFiles.map(item => item.file);
  }

  /**
   * 从文件中提取片段
   */
  private async extractSnippetsFromFile(file: FileInfo, keywords: string[]): Promise<CodeSnippet[]> {
    const snippets: CodeSnippet[] = [];
    
    try {
      const content = await fs.readFile(file.path, 'utf-8');
      const lines = content.split('\n');
      
      // 寻找包含关键词的行
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        let hasKeyword = false;
        
        for (const keyword of keywords) {
          if (line.includes(keyword)) {
            hasKeyword = true;
            break;
          }
        }
        
        if (hasKeyword) {
          // 提取上下文片段（前后3行）
          const start = Math.max(0, i - 3);
          const end = Math.min(lines.length - 1, i + 3);
          const snippetContent = lines.slice(start, end + 1).join('\n');
          
          // 计算相关性分数
          let relevance = 0;
          for (const keyword of keywords) {
            const regex = new RegExp(keyword, 'gi');
            const matches = snippetContent.match(regex);
            if (matches) {
              relevance += matches.length;
            }
          }
          
          // 调整基于位置的权重
          const positionWeight = (lines.length - i) / lines.length; // 文件后部的权重稍高
          relevance *= (1 + positionWeight * 0.2);
          
          snippets.push({
            filePath: file.path,
            content: snippetContent,
            language: file.language || 'unknown',
            lineStart: start + 1,
            lineEnd: end + 1,
            relevance,
            context: `Found near line ${i + 1}`,
            metadata: {},
          });
        }
      }
      
    } catch (error) {
      // 忽略无法读取的文件
    }
    
    return snippets;
  }

  /**
   * 分析文件变更影响
   */
  private async analyzeFileChangeImpact(
    change: CodeChange,
    project: ProjectAnalysis
  ): Promise<{
    affectedFiles: string[];
    breakingChanges: string[];
    dependenciesAffected: string[];
    complexityChange: number;
    testAffected: boolean;
  }> {
    // 简化实现
    return {
      affectedFiles: [change.filePath],
      breakingChanges: [],
      dependenciesAffected: [],
      complexityChange: 0,
      testAffected: change.filePath.includes('test') || change.filePath.includes('spec'),
    };
  }

  /**
   * 计算风险等级
   */
  private calculateRiskLevel(analysis: ImpactAnalysis): 'low' | 'medium' | 'high' {
    if (analysis.breakingChanges.length > 0 || analysis.dependenciesAffected.length > 5) {
      return 'high';
    }
    
    if (analysis.affectedFiles.length > 10 || analysis.testAffected) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * 生成建议
   */
  private generateRecommendations(analysis: ImpactAnalysis): string[] {
    const recommendations: string[] = [];
    
    if (analysis.breakingChanges.length > 0) {
      recommendations.push('包含破坏性变更，建议进行主要版本更新');
    }
    
    if (analysis.testAffected) {
      recommendations.push('测试文件被修改，请运行相关测试');
    }
    
    if (analysis.affectedFiles.length > 5) {
      recommendations.push('影响多个文件，建议进行代码审查');
    }
    
    if (analysis.dependenciesAffected.length > 0) {
      recommendations.push('依赖关系受影响，请检查构建和部署');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('变更影响较小，可以安全提交');
    }
    
    return recommendations;
  }

  // ==================== 工具方法 ====================

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private shouldIgnore(name: string): boolean {
    const ignorePatterns = [
      'node_modules',
      '.git',
      '.vscode',
      '.idea',
      '.DS_Store',
      'dist',
      'build',
      'coverage',
      '__pycache__',
      '.pytest_cache',
      'target',
      'out',
      '.next',
      '.nuxt',
    ];
    
    return ignorePatterns.some(pattern => 
      name === pattern || name.startsWith(pattern + '.') || name.endsWith('.' + pattern)
    );
  }

  private calculateDirectoryStats(tree: DirectoryTree): void {
    let fileCount = 0;
    let dirCount = 0;
    let totalSize = 0;
    
    for (const child of tree.children) {
      if (child.type === 'directory') {
        dirCount++;
        this.calculateDirectoryStats(child);
        fileCount += child.fileCount || 0;
        dirCount += child.dirCount || 0;
        totalSize += child.size || 0;
      } else {
        fileCount++;
      }
    }
    
    tree.fileCount = fileCount;
    tree.dirCount = dirCount;
    tree.size = totalSize;
  }

  private getLanguageName(languageId: string): string {
    const languageMap: Record<string, string> = {
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'go': 'Go',
      'rust': 'Rust',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'dart': 'Dart',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'yaml': 'YAML',
      'markdown': 'Markdown',
      'xml': 'XML',
    };
    
    return languageMap[languageId] || languageId;
  }

  private getLanguageFromExtension(extension: string): string | undefined {
    const extensionMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rs': 'Rust',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.dart': 'Dart',
      '.html': 'HTML',
      '.css': 'CSS',
      '.json': 'JSON',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.md': 'Markdown',
      '.xml': 'XML',
    };
    
    return extensionMap[extension];
  }

  private isTestFile(filePath: string): boolean {
    const testPatterns = [
      /test/i,
      /spec/i,
      /\.test\./,
      /\.spec\./,
      /_test\./,
      /_spec\./,
    ];
    
    return testPatterns.some(pattern => pattern.test(filePath));
  }

  private isConfigFile(filePath: string): boolean {
    const configPatterns = [
      /config/i,
      /\.config\./,
      /\.env/,
      /package\.json/,
      /tsconfig\.json/,
      /webpack\.config/,
      /vite\.config/,
      /rollup\.config/,
      /\.gitignore/,
      /\.dockerignore/,
      /\.eslintrc/,
      /\.prettierrc/,
    ];
    
    return configPatterns.some(pattern => pattern.test(filePath));
  }

  private isSourceFile(filePath: string): boolean {
    const sourceExtensions = [
      '.js', '.ts', '.jsx', '.tsx',
      '.py', '.java', '.go', '.rs',
      '.cpp', '.c', '.cs', '.php',
      '.rb', '.swift', '.kt', '.dart',
    ];
    
    const extension = path.extname(filePath).toLowerCase();
    return sourceExtensions.includes(extension);
  }

  private calculateComplexity(content: string): number {
    // 简化实现：基于行数和结构
    const lines = content.split('\n');
    let complexity = 0;
    
    // 基于关键字增加复杂度
    const complexityKeywords = [
      'if', 'else', 'for', 'while', 'switch', 'case',
      'try', 'catch', 'finally', 'throw',
      '&&', '||', '?', ':',
      'function', '=>', 'class', 'interface',
    ];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const keyword of complexityKeywords) {
        if (lowerLine.includes(keyword)) {
          complexity++;
        }
      }
    }
    
    // 基于嵌套深度估算
    const nestingPatterns = ['{', '(', '['];
    const closingPatterns = ['}', ')', ']'];
    
    let currentDepth = 0;
    let maxDepth = 0;
    
    for (const char of content) {
      if (nestingPatterns.includes(char)) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (closingPatterns.includes(char)) {
        currentDepth--;
      }
    }
    
    complexity += maxDepth * 2;
    
    return Math.min(complexity, 100); // 限制最大复杂度
  }

  private async runDiagnostics(document: vscode.TextDocument): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    
    // 获取VS Code的诊断信息
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    
    for (const diagnostic of diagnostics) {
      issues.push({
        type: diagnostic.severity === vscode.DiagnosticSeverity.Error ? 'error' :
              diagnostic.severity === vscode.DiagnosticSeverity.Warning ? 'warning' : 'info',
        message: diagnostic.message,
        line: diagnostic.range.start.line + 1,
        column: diagnostic.range.start.character + 1,
        endLine: diagnostic.range.end.line + 1,
        endColumn: diagnostic.range.end.character + 1,
      });
    }
    
    return issues;
  }

  // 各种语言的解析方法（简化实现）
  private async analyzeJavaScriptLikeFile(content: string, analysis: FileAnalysis): Promise<void> {
    // 简化实现：使用正则表达式提取基本信息
    const lines = content.split('\n');
    
    // 提取导入语句
    const importRegex = /import\s+(?:(?:\*\s+as\s+(\w+))|(?:(?:\{([^}]+)\})|(\w+))\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      analysis.imports.push({
        source: match[4],
        specifiers: [],
        isTypeOnly: false,
        line: this.getLineNumber(content, match.index),
      });
    }
    
    // 提取导出语句
    const exportRegex = /export\s+(?:(default\s+)?(?:class|function|const|let|var|async\s+function)|(?:\{[^}]+\}))(?:\s+(\w+))?/g;
    while ((match = exportRegex.exec(content)) !== null) {
      analysis.exports.push({
        type: match[1] ? 'default' : 'named',
        specifiers: [],
        line: this.getLineNumber(content, match.index),
      });
    }
  }

  private async analyzeJavaScriptFile(content: string, analysis: FileAnalysis): Promise<void> {
    // JavaScript/TypeScript文件分析简化实现
    analysis.imports = [];
    analysis.functions = [];
    analysis.complexity = Math.min(Math.floor(content.length / 100), 10);
  }

  private async analyzePythonFile(content: string, analysis: FileAnalysis): Promise<void> {
    // Python文件分析简化实现
  }

  private async analyzeJavaFile(content: string, analysis: FileAnalysis): Promise<void> {
    // Java文件分析简化实现
  }

  private async analyzeGoFile(content: string, analysis: FileAnalysis): Promise<void> {
    // Go文件分析简化实现
  }

  private async analyzeRustFile(content: string, analysis: FileAnalysis): Promise<void> {
    // Rust文件分析简化实现
  }

  private async analyzeGenericFile(content: string, analysis: FileAnalysis): Promise<void> {
    // 通用文件分析简化实现
  }

  /**
   * 分析指定文件（兼容性方法）
   * @param filePath 文件路径
   * @returns 文件分析结果
   */
  public async analyzeFile(filePath: string): Promise<any> {
    // 简化实现：调用现有的 analyzeCurrentFile 逻辑
    this.outputChannel.appendLine(`📄 Analyzing file: ${filePath}`);
    
    // 读取文件内容
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const uri = vscode.Uri.file(filePath);
      
      // 创建基本文件分析结果
      const analysis: FileAnalysis = {
        filePath,
        uri,
        language: path.extname(filePath).substring(1),
        languageId: this.getLanguageId(filePath),
        size: content.length,
        lineCount: content.split('\n').length,
        imports: [],
        exports: [],
        functions: [],
        classes: [],
        interfaces: [],
        variables: [],
        types: [],
        complexity: 0,
        issues: [],
        styleIssues: [],
        lastModified: new Date(),
        isTestFile: filePath.includes('.test.') || filePath.includes('.spec.'),
        isConfigFile: filePath.includes('config') || filePath.includes('.json') || filePath.includes('.yml'),
        isSourceFile: true,
      };
      
      // 基于文件类型进行特定分析
      const fileExtension = path.extname(filePath).toLowerCase();
      switch (fileExtension) {
        case '.ts':
        case '.js':
          await this.analyzeJavaScriptFile(content, analysis);
          break;
        case '.py':
          await this.analyzePythonFile(content, analysis);
          break;
        case '.java':
          await this.analyzeJavaFile(content, analysis);
          break;
        case '.go':
          await this.analyzeGoFile(content, analysis);
          break;
        case '.rs':
          await this.analyzeRustFile(content, analysis);
          break;
        default:
          await this.analyzeGenericFile(content, analysis);
      }
      
      return analysis;
    } catch (error: any) {
      this.outputChannel.appendLine(`❌ Failed to analyze file ${filePath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 分析项目（兼容性方法）
   * @returns 项目分析结果
   */
  public async analyzeProject(): Promise<any> {
    // 调用现有的 analyzeProjectStructure 方法
    return await this.analyzeProjectStructure();
  }

  /**
   * 获取语言ID
   * @param filePath 文件路径
   * @returns 语言ID字符串
   */
  private getLanguageId(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascriptreact',
      '.tsx': 'typescriptreact',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.md': 'markdown',
      '.txt': 'plaintext',
    };
    
    return languageMap[ext] || 'plaintext';
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }
}

export default CodeContextEnhancer;