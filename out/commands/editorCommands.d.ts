import { CodeLineExtension } from '../extension';
/**
 * Editor context commands similar to Cline's functionality
 */
export declare class EditorCommands {
    private codeLine;
    constructor(codeLine: CodeLineExtension);
    /**
     * Add selected text to chat (Cline's addToChat command)
     */
    addToChat(): Promise<void>;
    /**
     * Focus chat input in sidebar
     */
    focusChatInput(): void;
    /**
     * Explain selected code
     */
    explainCode(): Promise<void>;
    /**
     * Improve selected code
     */
    improveCode(): Promise<void>;
    /**
     * Generate Git commit message
     */
    generateGitCommitMessage(): Promise<void>;
    /**
     * Get language ID for code block formatting
     */
    private getLanguageId;
    /**
     * Get Git change type description
     */
    private getGitChangeType;
}
//# sourceMappingURL=editorCommands.d.ts.map