import { ProjectContext } from './projectAnalyzer';

/**
 * 增强的项目上下文接口
 */
export interface EnhancedProjectContext extends ProjectContext {
  // 依赖关系分析
  dependencyGraph?: DependencyGraph;
  
  // 模块关系分析
  moduleRelations?: ModuleRelation[];
  
  // 代码质量分析
  codeQuality?: CodeQualityReport;
  
  // 架构分析
  architecturePatterns?: ArchitecturePattern[];
  
  // 智能上下文
  relevantContext?: RelevantContext;
  
  // 分析元数据
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
  overallScore: number; // 0-100
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
  confidence: number; // 0-1
  estimatedEffort: 'low' | 'medium' | 'high';
}

/**
 * 架构模式
 */
export interface ArchitecturePattern {
  name: string;
  confidence: number; // 0-1
  evidence: string[];
  filesInvolved: string[];
}

/**
 * 相关上下文
 */
export interface RelevantContext {
  focusedFile?: string;
  relatedFiles: RelatedFile[];
  recentChanges: string[]; // 最近修改的文件
  activeComponents: string[]; // 当前活跃组件
}

/**
 * 相关文件
 */
export interface RelatedFile {
  path: string;
  relevanceScore: number; // 0-1
  relationType: 'imports' | 'imported-by' | 'same-module' | 'similar-code' | 'co-changed';
}

/**
 * 分析元数据
 */
export interface AnalysisMetadata {
  analysisTime: number; // 毫秒
  filesAnalyzed: number;
  depth: 'shallow' | 'medium' | 'deep';
  timestamp: string;
}