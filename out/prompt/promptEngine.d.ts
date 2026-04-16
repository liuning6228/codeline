import { ProjectContext } from '../analyzer/projectAnalyzer';
export interface PromptOptions {
    includeExamples?: boolean;
    includeConstraints?: boolean;
    includeBestPractices?: boolean;
    language?: string;
}
export declare class PromptEngine {
    private readonly templates;
    generatePrompt(task: string, context: ProjectContext, options?: PromptOptions): string;
    private selectTemplate;
    private generateJavaPrompt;
    private generatePythonPrompt;
    private generateWebPrompt;
    private generateGeneralPrompt;
    private extractJavaConstraints;
    private extractPythonConstraints;
    private extractWebConstraints;
}
//# sourceMappingURL=promptEngine.d.ts.map