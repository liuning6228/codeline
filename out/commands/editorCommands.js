"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorCommands = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Editor context commands similar to Cline's functionality
 */
class EditorCommands {
    codeLine;
    constructor(codeLine) {
        this.codeLine = codeLine;
    }
    /**
     * Add selected text to chat (Cline's addToChat command)
     */
    async addToChat() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage('No text selected');
            return;
        }
        const selectedText = editor.document.getText(selection);
        const filePath = editor.document.uri.fsPath;
        const fileName = filePath.split('/').pop() || 'Unknown file';
        // Get sidebar provider and send message
        const sidebarProvider = this.codeLine.getSidebarProvider();
        // Format the message with code block
        const message = `**Selected code from ${fileName}**:\n\n\`\`\`${this.getLanguageId(editor.document.languageId)}\n${selectedText}\n\`\`\``;
        // Send to sidebar
        sidebarProvider.sendMessageToChat(message);
        // Show the sidebar if not visible
        this.codeLine.showSidebar('chat');
        vscode.window.showInformationMessage(`Added ${selectedText.length} characters to chat`);
    }
    /**
     * Focus chat input in sidebar
     */
    focusChatInput() {
        const sidebarProvider = this.codeLine.getSidebarProvider();
        sidebarProvider.focusChatInput();
        this.codeLine.showSidebar('chat');
    }
    /**
     * Explain selected code
     */
    async explainCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage('No text selected');
            return;
        }
        const selectedText = editor.document.getText(selection);
        const filePath = editor.document.uri.fsPath;
        const fileName = filePath.split('/').pop() || 'Unknown file';
        const language = this.getLanguageId(editor.document.languageId);
        // Show the sidebar
        this.codeLine.showSidebar('chat');
        // Send explanation request to sidebar
        const sidebarProvider = this.codeLine.getSidebarProvider();
        const message = `Please explain this ${language} code from ${fileName}:\n\n\`\`\`${language}\n${selectedText}\n\`\`\`\n\nProvide:\n1. What this code does\n2. Key functions/methods\n3. Any potential issues\n4. Suggestions for improvement if applicable`;
        sidebarProvider.sendMessageToChat(message);
        vscode.window.showInformationMessage(`Requested explanation for selected code`);
    }
    /**
     * Improve selected code
     */
    async improveCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor');
            return;
        }
        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showInformationMessage('No text selected');
            return;
        }
        const selectedText = editor.document.getText(selection);
        const filePath = editor.document.uri.fsPath;
        const fileName = filePath.split('/').pop() || 'Unknown file';
        const language = this.getLanguageId(editor.document.languageId);
        // Show the sidebar
        this.codeLine.showSidebar('chat');
        // Send improvement request to sidebar
        const sidebarProvider = this.codeLine.getSidebarProvider();
        const message = `Please review and improve this ${language} code from ${fileName}:\n\n\`\`\`${language}\n${selectedText}\n\`\`\`\n\nProvide:\n1. Code improvements (readability, performance, etc.)\n2. Alternative implementations if applicable\n3. Best practices to follow\n4. Complete improved code`;
        sidebarProvider.sendMessageToChat(message);
        vscode.window.showInformationMessage(`Requested code improvement for selected code`);
    }
    /**
     * Generate Git commit message
     */
    async generateGitCommitMessage() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showInformationMessage('No workspace folder open');
            return;
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;
        // Get Git changes
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (!gitExtension) {
                vscode.window.showInformationMessage('Git extension not available');
                return;
            }
            if (!gitExtension.isActive) {
                await gitExtension.activate();
            }
            const git = gitExtension.exports.getAPI(1);
            const repository = git.repositories.find((repo) => repo.rootUri.fsPath === workspacePath);
            if (!repository) {
                vscode.window.showInformationMessage('No Git repository found');
                return;
            }
            // Get staged changes
            const stagedChanges = repository.state.indexChanges;
            const unstagedChanges = repository.state.workingTreeChanges;
            if ((!stagedChanges || stagedChanges.length === 0) && (!unstagedChanges || unstagedChanges.length === 0)) {
                vscode.window.showInformationMessage('No changes to commit');
                return;
            }
            // Collect change information
            const changes = [];
            if (stagedChanges && stagedChanges.length > 0) {
                changes.push('**Staged changes:**');
                stagedChanges.forEach((change) => {
                    changes.push(`- ${change.uri.fsPath.split('/').pop()} (${this.getGitChangeType(change.status)})`);
                });
            }
            if (unstagedChanges && unstagedChanges.length > 0) {
                changes.push('**Unstaged changes:**');
                unstagedChanges.forEach((change) => {
                    changes.push(`- ${change.uri.fsPath.split('/').pop()} (${this.getGitChangeType(change.status)})`);
                });
            }
            const changesText = changes.join('\n');
            // Show the sidebar
            this.codeLine.showSidebar('chat');
            // Send commit message generation request
            const sidebarProvider = this.codeLine.getSidebarProvider();
            const message = `Generate a Git commit message for these changes:\n\n${changesText}\n\nProvide:\n1. A concise commit message (50 chars or less)\n2. A more detailed description (if needed)\n3. Conventional commit format if applicable\n4. Any relevant tags or references`;
            sidebarProvider.sendMessageToChat(message);
            vscode.window.showInformationMessage(`Requested Git commit message generation`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to generate commit message: ${error}`);
        }
    }
    /**
     * Get language ID for code block formatting
     */
    getLanguageId(languageId) {
        const languageMap = {
            'javascript': 'javascript',
            'typescript': 'typescript',
            'python': 'python',
            'java': 'java',
            'c': 'c',
            'cpp': 'cpp',
            'csharp': 'csharp',
            'go': 'go',
            'rust': 'rust',
            'ruby': 'ruby',
            'php': 'php',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'markdown': 'markdown',
            'bash': 'bash',
            'shellscript': 'shell'
        };
        return languageMap[languageId] || '';
    }
    /**
     * Get Git change type description
     */
    getGitChangeType(status) {
        // Git status codes from vscode.git extension
        const statusMap = {
            1: 'added',
            2: 'deleted',
            3: 'modified',
            4: 'renamed',
            5: 'copied'
        };
        return statusMap[status] || 'unknown';
    }
}
exports.EditorCommands = EditorCommands;
//# sourceMappingURL=editorCommands.js.map