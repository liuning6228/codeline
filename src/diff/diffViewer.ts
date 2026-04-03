import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const fsReadFile = promisify(fs.readFile);
const fsWriteFile = promisify(fs.writeFile);
const fsUnlink = promisify(fs.unlink);
const fsExists = promisify(fs.exists);

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

/**
 * Cline-style diff viewer that opens multi-file diff views in the workspace
 * with visual comparison and approval workflow.
 */
export class DiffViewer {
  private static tempDir: string | undefined;
  private static tempFiles: string[] = [];

  /**
   * Open multi-file diff view in workspace (Cline style)
   */
  public static async openMultiFileDiff(
    changedFiles: ChangedFile[],
    options: DiffViewOptions = {}
  ): Promise<{ applied: boolean; rejected: boolean }> {
    const title = options.title || 'CodeLine Changes';
    const showApplyButton = options.showApplyButton ?? true;
    const showRejectButton = options.showRejectButton ?? true;

    // Create temp directory for diff files
    const tempDir = await this.getTempDir();
    const tempFiles: { left: vscode.Uri; right: vscode.Uri; originalPath: string }[] = [];

    // Create temporary files for each diff
    for (const file of changedFiles) {
      const leftUri = await this.createTempFile(tempDir, `${path.basename(file.absolutePath)}.original`, file.before);
      const rightUri = await this.createTempFile(tempDir, `${path.basename(file.absolutePath)}.modified`, file.after);
      
      tempFiles.push({
        left: leftUri,
        right: rightUri,
        originalPath: file.absolutePath
      });
    }

    // Open diff editors in groups
    const appliedFiles: string[] = [];
    const rejectedFiles: string[] = [];

    // Show a quick pick to let user choose which files to view
    if (changedFiles.length > 1) {
      const fileChoices = changedFiles.map((file, index) => ({
        label: `${path.basename(file.absolutePath)}`,
        description: file.relativePath,
        detail: `Lines changed: ${this.calculateChangeCount(file.before, file.after)}`,
        index
      }));

      // Open first file diff immediately
      if (tempFiles.length > 0) {
        await this.openSingleDiff(tempFiles[0].left, tempFiles[0].right, `${title} - ${path.basename(tempFiles[0].originalPath)}`);
      }

      // Show notification with action buttons
      const result = await vscode.window.showInformationMessage(
        `${changedFiles.length} files changed. Review changes in diff view.`,
        { modal: true },
        'Apply All',
        'Reject All',
        'Review Each'
      );

      if (result === 'Apply All') {
        // Clean up temp files
        await this.cleanupTempFiles();
        return { applied: true, rejected: false };
      } else if (result === 'Reject All') {
        await this.cleanupTempFiles();
        return { applied: false, rejected: true };
      } else {
        // Let user review each file
        for (let i = 0; i < tempFiles.length; i++) {
          const tempFile = tempFiles[i];
          const changedFile = changedFiles[i];
          
          const action = await vscode.window.showInformationMessage(
            `Review changes to ${path.basename(changedFile.absolutePath)}`,
            { modal: true },
            'Apply',
            'Reject',
            'Skip'
          );

          if (action === 'Apply') {
            appliedFiles.push(changedFile.absolutePath);
            // Apply the changes
            await fsWriteFile(changedFile.absolutePath, changedFile.after, 'utf8');
          } else if (action === 'Reject') {
            rejectedFiles.push(changedFile.absolutePath);
          }
        }

        await this.cleanupTempFiles();
        return { 
          applied: appliedFiles.length > 0, 
          rejected: rejectedFiles.length === changedFiles.length 
        };
      }
    } else {
      // Single file - open diff directly
      const tempFile = tempFiles[0];
      await this.openSingleDiff(tempFile.left, tempFile.right, title);

      // Show action buttons in the diff editor itself
      const result = await vscode.window.showInformationMessage(
        'Apply these changes?',
        { modal: true },
        'Apply Changes',
        'Reject Changes'
      );

      await this.cleanupTempFiles();

      if (result === 'Apply Changes') {
        // Apply the changes
        const changedFile = changedFiles[0];
        await fsWriteFile(changedFile.absolutePath, changedFile.after, 'utf8');
        return { applied: true, rejected: false };
      } else {
        return { applied: false, rejected: true };
      }
    }
  }

  /**
   * Open a single diff editor
   */
  private static async openSingleDiff(leftUri: vscode.Uri, rightUri: vscode.Uri, title: string): Promise<void> {
    // Use VS Code's diff command to open diff editor in workspace
    await vscode.commands.executeCommand('vscode.diff', leftUri, rightUri, title);
    
    // Try to move the diff editor to a new editor group (Cline style)
    try {
      // Close any existing diff editor first
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      
      // Open in new editor group to the side
      await vscode.commands.executeCommand('workbench.action.splitEditorRight');
      await vscode.commands.executeCommand('vscode.diff', leftUri, rightUri, title);
      
      // Focus the diff editor
      await vscode.commands.executeCommand('workbench.action.focusRightGroup');
    } catch (error) {
      // Fallback to regular diff opening
      console.warn('Failed to open diff in new editor group:', error);
    }
  }

  /**
   * Create a temporary file with content
   */
  private static async createTempFile(tempDir: string, filename: string, content: string): Promise<vscode.Uri> {
    const filePath = path.join(tempDir, filename);
    await fsWriteFile(filePath, content, 'utf8');
    this.tempFiles.push(filePath);
    return vscode.Uri.file(filePath);
  }

  /**
   * Get or create temp directory
   */
  private static async getTempDir(): Promise<string> {
    if (!this.tempDir) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      const workspacePath = workspaceFolders && workspaceFolders.length > 0 
        ? workspaceFolders[0].uri.fsPath 
        : process.cwd();
      
      const tempDir = path.join(workspacePath, '.codeline', 'temp', Date.now().toString());
      
      if (!(await fsExists(tempDir))) {
        await fs.promises.mkdir(tempDir, { recursive: true });
      }
      
      this.tempDir = tempDir;
    }
    return this.tempDir;
  }

  /**
   * Clean up temporary files
   */
  private static async cleanupTempFiles(): Promise<void> {
    for (const file of this.tempFiles) {
      try {
        await fsUnlink(file);
      } catch (error) {
        // Ignore errors
      }
    }
    this.tempFiles = [];
    
    if (this.tempDir) {
      try {
        await fs.promises.rm(this.tempDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore errors
      }
      this.tempDir = undefined;
    }
  }

  /**
   * Calculate approximate change count for display
   */
  private static calculateChangeCount(before: string, after: string): number {
    const beforeLines = before.split('\n').length;
    const afterLines = after.split('\n').length;
    return Math.abs(beforeLines - afterLines);
  }

  /**
   * Create unified diff string for display
   */
  public static createUnifiedDiff(file: ChangedFile): string {
    const beforeLines = file.before.split('\n');
    const afterLines = file.after.split('\n');
    
    let diff = `--- ${file.relativePath} (original)\n`;
    diff += `+++ ${file.relativePath} (modified)\n`;
    
    // Simple diff algorithm for display (simplified)
    const maxLines = Math.max(beforeLines.length, afterLines.length);
    for (let i = 0; i < maxLines; i++) {
      const beforeLine = beforeLines[i] || '';
      const afterLine = afterLines[i] || '';
      
      if (beforeLine !== afterLine) {
        if (beforeLine && afterLine) {
          diff += `- ${beforeLine}\n`;
          diff += `+ ${afterLine}\n`;
        } else if (beforeLine) {
          diff += `- ${beforeLine}\n`;
        } else if (afterLine) {
          diff += `+ ${afterLine}\n`;
        }
      } else {
        diff += `  ${beforeLine}\n`;
      }
    }
    
    return diff;
  }

  /**
   * Show diff in output channel (fallback)
   */
  public static showDiffInOutput(changedFiles: ChangedFile[], title: string = 'CodeLine Changes'): void {
    const outputChannel = vscode.window.createOutputChannel('CodeLine Diff');
    outputChannel.show(true);
    
    outputChannel.appendLine(`=== ${title} ===\n`);
    
    for (const file of changedFiles) {
      outputChannel.appendLine(`File: ${file.relativePath}`);
      outputChannel.appendLine(this.createUnifiedDiff(file));
      outputChannel.appendLine('');
    }
    
    outputChannel.appendLine('=== End of Diff ===');
  }
}