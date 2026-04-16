import { ProjectAnalyzer, ProjectContext } from './projectAnalyzer';
import { EnhancedProjectContext } from './types';
/**
 * 增强的项目分析器
 * 扩展原有ProjectAnalyzer，添加更深入的分析功能
 */
export declare class EnhancedProjectAnalyzer extends ProjectAnalyzer {
    private workspaceRoot;
    constructor();
    /**
     * 分析当前工作区（覆盖父类方法，保持兼容性）
     */
    analyzeCurrentWorkspace(): Promise<ProjectContext>;
    /**
     * 分析当前工作区，返回增强的上下文信息
     */
    analyzeEnhancedWorkspace(focusedFile?: string): Promise<EnhancedProjectContext>;
    /**
     * 分析依赖关系图
     */
    private analyzeDependencyGraph;
    /**
     * 分析模块关系（导入/导出）
     */
    private analyzeModuleRelations;
    /**
     * 解析导入路径为项目相对路径
     */
    private resolveImportPath;
    /**
     * 分析代码质量
     */
    private analyzeCodeQuality;
    /**
     * 估计代码复杂度
     */
    private estimateComplexity;
    /**
     * 检测代码问题
     */
    private detectCodeIssues;
    /**
     * 生成重构建议
     */
    private generateRefactoringSuggestions;
    /**
     * 估计重复率（简化的基于行的重复检测）
     */
    private estimateDuplicationRate;
    /**
     * 计算可维护性指数
     */
    private calculateMaintainabilityIndex;
    /**
     * 计算总体质量分数
     */
    private calculateOverallScore;
    /**
     * 检测架构模式
     */
    private detectArchitecturePatterns;
    /**
     * 检测分层架构
     */
    private detectLayeredArchitecture;
    /**
     * 检查微服务指标
     */
    private checkMicroserviceIndicators;
    /**
     * 收集相关上下文
     */
    private collectRelevantContext;
    /**
     * 收集代码文件
     */
    private collectCodeFiles;
    /**
     * 检查是否存在指定目录或文件
     */
    private hasDirectoryOrFiles;
    /**
     * 获取目录中的文件列表
     */
    private getFilesInDirectories;
    /**
     * 确定分析深度
     */
    private determineAnalysisDepth;
    /**
     * 获取默认的增强上下文
     */
    private getDefaultEnhancedContext;
}
//# sourceMappingURL=enhancedProjectAnalyzer.d.ts.map