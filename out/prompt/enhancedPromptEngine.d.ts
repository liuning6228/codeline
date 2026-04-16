import { ProjectContext } from '../analyzer/projectAnalyzer';
/**
 * Enhanced prompt engine based on Cline's componentized architecture and Qoder-style prompts
 */
export declare class EnhancedPromptEngine {
    private readonly systemPromptComponents;
    private readonly taskSpecificPrompts;
    /**
     * Generate a high-quality prompt based on Qoder and Cline best practices
     */
    generateEnhancedPrompt(task: string, context: ProjectContext, options?: {
        includeSystemPrompt?: boolean;
        includeContext?: boolean;
        languageSpecific?: boolean;
    }): string;
    /**
     * Generate Cline-style system prompt with components
     */
    private generateSystemPrompt;
    /**
     * Generate context section based on project analysis
     */
    private generateContextSection;
    /**
     * Determine language from context
     */
    private determineLanguage;
    private getAgentRole;
    private getObjective;
    private getRules;
    private getCapabilities;
    private getEditingFiles;
    private getTaskProgress;
    private getFeedback;
    private getSystemInfo;
    private getJavaTaskPrompt;
    private getPythonTaskPrompt;
    private getTypeScriptTaskPrompt;
    private getJavaScriptTaskPrompt;
    private getReactTaskPrompt;
    private getVueTaskPrompt;
    private getGeneralTaskPrompt;
}
//# sourceMappingURL=enhancedPromptEngine.d.ts.map