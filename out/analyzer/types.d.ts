import { ProjectContext } from './projectAnalyzer';
/**
 * 增强的项目上下文接口
 */
export interface EnhancedProjectContext extends ProjectContext {
    dependencyGraph?: DependencyGraph;
    moduleRelations?: ModuleRelation[];
    codeQuality?: CodeQualityReport;
    architecturePatterns?: ArchitecturePattern[];
    relevantContext?: RelevantContext;
    analysisMetadata?: AnalysisMetadata;
}
/**
 * 依赖关系图
 */
export interface DependencyGraph {
    nodes: DependencyNode[];
    edges: DependencyEdge[];
    circularDependencies: string[][];
}
/**
 * 依赖节点
 */
export interface DependencyNode {
    id: string;
    name: string;
    version?: string;
    type: 'external' | 'internal' | 'dev';
    description?: string;
}
/**
 * 依赖边
 */
export interface DependencyEdge {
    source: string;
    target: string;
    type: 'depends' | 'dev-depends' | 'peer-depends';
    weight?: number;
}
/**
 * 模块关系
 */
export interface ModuleRelation {
    sourceFile: string;
    targetFile: string;
    importType: 'import' | 'require' | 'export' | 'reference';
    lineNumber?: number;
}
/**
 * 代码质量报告
 */
export interface CodeQualityReport {
    metrics: CodeMetrics;
    issues: CodeIssue[];
    suggestions: RefactoringSuggestion[];
    overallScore: number;
}
/**
 * 代码度量
 */
export interface CodeMetrics {
    linesOfCode: number;
    complexity: number;
    maintainabilityIndex: number;
    duplicationRate: number;
    testCoverage?: number;
}
/**
 * 代码问题
 */
export interface CodeIssue {
    type: 'warning' | 'error' | 'info';
    category: 'style' | 'performance' | 'security' | 'maintainability';
    message: string;
    file: string;
    line?: number;
    column?: number;
    severity: 'low' | 'medium' | 'high';
}
/**
 * 重构建议
 */
export interface RefactoringSuggestion {
    type: 'extract-method' | 'rename' | 'simplify' | 'remove-duplicate' | 'optimize';
    description: string;
    file: string;
    lines?: number[];
    confidence: number;
    estimatedEffort: 'low' | 'medium' | 'high';
}
/**
 * 架构模式
 */
export interface ArchitecturePattern {
    name: string;
    confidence: number;
    evidence: string[];
    filesInvolved: string[];
}
/**
 * 相关上下文
 */
export interface RelevantContext {
    focusedFile?: string;
    relatedFiles: RelatedFile[];
    recentChanges: string[];
    activeComponents: string[];
}
/**
 * 相关文件
 */
export interface RelatedFile {
    path: string;
    relevanceScore: number;
    relationType: 'imports' | 'imported-by' | 'same-module' | 'similar-code' | 'co-changed';
}
/**
 * 分析元数据
 */
export interface AnalysisMetadata {
    analysisTime: number;
    filesAnalyzed: number;
    depth: 'shallow' | 'medium' | 'deep';
    timestamp: string;
}
//# sourceMappingURL=types.d.ts.map