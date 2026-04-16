import * as vscode from 'vscode';
export interface ChangedFile {
    relativePath: string;
    absolutePath: string;
    before: string;
    after: string;
}
export interface DiffViewOptions {
    title?: string;
    showApplyButton?: boolean;
    showRejectButton?: boolean;
    contextDescription?: string;
}
export interface DiffPreviewResult {
    applied: boolean;
    rejected: boolean;
    tempLeftUri?: vscode.Uri;
    tempRightUri?: vscode.Uri;
}
/**
 * Cline-style diff viewer that opens multi-file diff views in the workspace
 * with visual comparison and approval workflow.
 *
 * Features:
 * - Creates temporary files for before/after comparison
 * - Opens VS Code's built-in diff editor
 * - Supports approval workflow with apply/reject buttons
 */
export declare class DiffViewer {
    private static tempDir;
    private static tempFiles;
    private static activeDiffEditors;
    /**
     * Open multi-file diff view in workspace (Cline style)
     * Creates temporary files for before/after comparison and opens VS Code's diff editor
     */
    static openMultiFileDiff(changedFiles: ChangedFile[], options?: DiffViewOptions): Promise<DiffPreviewResult>;
    /**
     * Create a diff preview without applying changes
     * Returns the temp file URIs for external handling
     */
    static createDiffPreview(filePath: string, oldContent: string, newContent: string): Promise<{
        leftUri: vscode.Uri;
        rightUri: vscode.Uri;
    }>;
    /**
     * Open a diff editor for preview
     */
    static openDiffEditor(leftUri: vscode.Uri, rightUri: vscode.Uri, title: string, originalFilePath?: string): Promise<void>;
    /**
     * Open a single diff editor
     */
    private static openSingleDiff;
    /**
     * Create a temporary file with content
     */
    private static createTempFile;
    /**
     * Get or create temp directory
     */
    private static getTempDir;
    /**
     * Clean up temporary files
     */
    private static cleanupTempFiles;
    /**
     * Calculate approximate change count for display
     */
    private static calculateChangeCount;
    /**
     * Sanitize file path for use as a temporary filename
     * Replaces path separators and special characters with underscores
     */
    private static sanitizeFileName;
    /**
     * Create unified diff string for display
     */
    static createUnifiedDiff(file: ChangedFile): string;
    /**
     * Show diff in output channel (fallback)
     */
    static showDiffInOutput(changedFiles: ChangedFile[], title?: string): void;
}
//# sourceMappingURL=diffViewer.d.ts.map