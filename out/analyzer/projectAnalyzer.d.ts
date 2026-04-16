export interface ProjectContext {
    projectType: string;
    language: string;
    framework?: string;
    rootPath: string;
    files: string[];
    dependencies: string[];
    codeStyle: {
        indent: number;
        quoteStyle: 'single' | 'double';
        lineEnding: string;
    };
    architecture?: string;
}
export declare class ProjectAnalyzer {
    analyzeCurrentWorkspace(): Promise<ProjectContext>;
    private analyzeDirectory;
    /**
     * 安全解析JSON文件，自动清理Markdown代码块
     * @param filePath JSON文件路径
     * @returns 解析后的JSON对象，如果解析失败则返回null
     */
    private safeParseJsonFile;
    /**
     * 安全解析JSON字符串，自动清理Markdown代码块
     * @param jsonString JSON字符串
     * @returns 解析后的JSON对象
     * @throws 如果清理后仍然不是有效的JSON
     */
    private safeParseJsonString;
    private detectProjectType;
    private detectLanguage;
    private detectFramework;
    private collectRelevantFiles;
    private extractDependencies;
    private analyzeCodeStyle;
    private getSampleFiles;
    private detectArchitecture;
    private checkForPattern;
    private getAllFiles;
    private getDefaultContext;
}
//# sourceMappingURL=projectAnalyzer.d.ts.map