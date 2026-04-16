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
    imports: ImportStatement[];
    exports: ExportStatement[];
    functions: FunctionInfo[];
    classes: ClassInfo[];
    interfaces: InterfaceInfo[];
    variables: VariableInfo[];
    types: TypeInfo[];
    complexity: number;
    issues: CodeIssue[];
    styleIssues: StyleIssue[];
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
    line?: number;
    startLine?: number;
    endLine?: number;
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
    conversationHistory?: Array<{
        role: string;
        content: string;
    }>;
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
/**
 * CodeContextEnhancer
 * 提供丰富的编码上下文信息
 */
export declare class CodeContextEnhancer {
    private workspaceRoot;
    private outputChannel;
    private cache;
    private analysisInProgress;
    constructor(workspaceRoot: string);
    /**
     * 初始化增强器（可选方法）
     */
    initialize(): Promise<void>;
    /**
     * 清理增强器资源（可选方法）
     */
    dispose(): Promise<void>;
    /**
     * 获取当前查询上下文
     */
    getQueryContext(userInput?: string): Promise<QueryContext>;
    /**
     * 分析当前文件
     */
    analyzeCurrentFile(): Promise<FileAnalysis | undefined>;
    /**
     * 分析项目结构
     */
    analyzeProjectStructure(): Promise<ProjectAnalysis>;
    /**
     * 提取相关代码片段
     */
    extractRelevantCodeSnippets(query: string, maxSnippets?: number): Promise<CodeSnippet[]>;
    /**
     * 分析代码变更影响
     */
    analyzeChangeImpact(changes: CodeChange[]): Promise<ImpactAnalysis>;
    /**
     * 获取编辑器状态
     */
    private getEditorState;
    /**
     * 获取最近变更
     */
    private getRecentChanges;
    /**
     * 执行文件分析
     */
    private performFileAnalysis;
    /**
     * 执行项目分析
     */
    private performProjectAnalysis;
    /**
     * 扫描目录结构
     */
    private scanDirectory;
    /**
     * 收集文件信息
     */
    private collectFiles;
    /**
     * 分析依赖
     */
    private analyzeDependencies;
    /**
     * 分析构建系统
     */
    private analyzeBuildSystem;
    /**
     * 分析测试框架
     */
    private analyzeTestFramework;
    /**
     * 分析版本控制
     */
    private analyzeVersionControl;
    /**
     * 分析语言分布
     */
    private analyzeLanguageDistribution;
    /**
     * 计算项目复杂度
     */
    private calculateProjectComplexity;
    /**
     * 提取关键词
     */
    private extractKeywords;
    /**
     * 查找相关文件
     */
    private findRelevantFiles;
    /**
     * 从文件中提取片段
     */
    private extractSnippetsFromFile;
    /**
     * 分析文件变更影响
     */
    private analyzeFileChangeImpact;
    /**
     * 计算风险等级
     */
    private calculateRiskLevel;
    /**
     * 生成建议
     */
    private generateRecommendations;
    private fileExists;
    private shouldIgnore;
    private calculateDirectoryStats;
    private getLanguageName;
    private getLanguageFromExtension;
    private isTestFile;
    private isConfigFile;
    private isSourceFile;
    private calculateComplexity;
    private runDiagnostics;
    private analyzeJavaScriptLikeFile;
    private analyzeJavaScriptFile;
    private analyzePythonFile;
    private analyzeJavaFile;
    private analyzeGoFile;
    private analyzeRustFile;
    private analyzeGenericFile;
    /**
     * 分析指定文件（兼容性方法）
     * @param filePath 文件路径
     * @returns 文件分析结果
     */
    analyzeFile(filePath: string): Promise<any>;
    /**
     * 分析项目（兼容性方法）
     * @returns 项目分析结果
     */
    analyzeProject(): Promise<any>;
    /**
     * 获取语言ID
     * @param filePath 文件路径
     * @returns 语言ID字符串
     */
    private getLanguageId;
    private getLineNumber;
}
export default CodeContextEnhancer;
//# sourceMappingURL=CodeContextEnhancer.d.ts.map