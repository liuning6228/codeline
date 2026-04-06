import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export interface FileDiff {
  filePath: string;
  oldContent: string;
  newContent: string;
  changes: LineChange[];
  summary: string;
}

export interface LineChange {
  type: 'added' | 'removed' | 'modified';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

export interface FileOperationResult {
  success: boolean;
  filePath: string;
  diff?: FileDiff;
  error?: string;
  message: string;
}

export class FileManager {
  private workspaceRoot: string;
  
  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }
  
  /**
   * 创建新文件
   */
  public async createFile(filePath: string, content: string): Promise<FileOperationResult> {
    try {
      const fullPath = this.resolvePath(filePath);
      
      // 确保目录存在
      await this.ensureDirectoryExists(fullPath);
      
      // 写入文件
      await fs.writeFile(fullPath, content, 'utf-8');
      
      // 打开文件在编辑器中
      await this.openFileInEditor(fullPath);
      
      return {
        success: true,
        filePath,
        message: `Created file: ${filePath}`,
        diff: {
          filePath,
          oldContent: '',
          newContent: content,
          changes: this.calculateChanges('', content),
          summary: `Created new file with ${content.split('\n').length} lines`
        }
      };
    } catch (error: any) {
      return {
        success: false,
        filePath,
        error: error.message,
        message: `Failed to create file: ${filePath}`
      };
    }
  }
  
  /**
   * 编辑文件（带差异计算）- 立即写入模式
   */
  public async editFileWithDiff(filePath: string, newContent: string): Promise<FileOperationResult> {
    try {
      const fullPath = this.resolvePath(filePath);
      
      // 读取现有内容
      const oldContent = await this.readFileIfExists(fullPath);
      
      // 计算差异
      const diff = {
        filePath,
        oldContent,
        newContent,
        changes: this.calculateChanges(oldContent, newContent),
        summary: this.generateDiffSummary(oldContent, newContent)
      };
      
      // 写入新内容
      await fs.writeFile(fullPath, newContent, 'utf-8');
      
      // 刷新编辑器中的文件
      await this.refreshFileInEditor(fullPath);
      
      return {
        success: true,
        filePath,
        diff,
        message: `Updated file: ${filePath}`
      };
    } catch (error: any) {
      return {
        success: false,
        filePath,
        error: error.message,
        message: `Failed to edit file: ${filePath}`
      };
    }
  }
  
  /**
   * 准备文件编辑（Cline风格）- 不立即写入，只返回diff供预览
   */
  public async prepareFileEdit(filePath: string, newContent: string): Promise<FileOperationResult> {
    try {
      const fullPath = this.resolvePath(filePath);
      
      // 读取现有内容
      const oldContent = await this.readFileIfExists(fullPath);
      
      // 计算差异
      const diff: FileDiff = {
        filePath,
        oldContent,
        newContent,
        changes: this.calculateChanges(oldContent, newContent),
        summary: this.generateDiffSummary(oldContent, newContent)
      };
      
      return {
        success: true,
        filePath,
        diff,
        message: `Prepared edit for: ${filePath}`
      };
    } catch (error: any) {
      return {
        success: false,
        filePath,
        error: error.message,
        message: `Failed to prepare edit for: ${filePath}`
      };
    }
  }
  
  /**
   * 删除文件
   */
  public async deleteFile(filePath: string): Promise<FileOperationResult> {
    try {
      const fullPath = this.resolvePath(filePath);
      
      // 读取现有内容（用于差异）
      const oldContent = await this.readFileIfExists(fullPath);
      
      // 删除文件
      await fs.unlink(fullPath);
      
      return {
        success: true,
        filePath,
        message: `Deleted file: ${filePath}`,
        diff: {
          filePath,
          oldContent,
          newContent: '',
          changes: this.calculateChanges(oldContent, ''),
          summary: `Deleted file with ${oldContent.split('\n').length} lines`
        }
      };
    } catch (error: any) {
      return {
        success: false,
        filePath,
        error: error.message,
        message: `Failed to delete file: ${filePath}`
      };
    }
  }
  
  /**
   * 检查文件是否存在
   */
  public async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = this.resolvePath(filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * 读取文件内容
   */
  public async readFile(filePath: string): Promise<string> {
    const fullPath = this.resolvePath(filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }
  
  /**
   * 读取文件内容（带行数限制）
   */
  public async readFileWithLimits(filePath: string, offset: number = 1, limit: number = 1000): Promise<FileOperationResult> {
    try {
      const fullPath = this.resolvePath(filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      const lines = content.split('\n');
      
      // 1-indexed offset
      const startLine = Math.max(1, offset) - 1;
      const endLine = Math.min(lines.length, startLine + limit);
      const selectedLines = lines.slice(startLine, endLine);
      const selectedContent = selectedLines.join('\n');
      
      const diff: FileDiff = {
        filePath,
        oldContent: '',
        newContent: selectedContent,
        changes: this.calculateChanges('', selectedContent),
        summary: `Read ${selectedLines.length} lines from ${filePath} (lines ${offset}-${endLine})`
      };
      
      return {
        success: true,
        filePath,
        diff,
        message: `Successfully read ${selectedLines.length} lines from ${filePath}`
      };
    } catch (error: any) {
      return {
        success: false,
        filePath,
        error: error.message,
        message: `Failed to read file ${filePath}: ${error.message}`
      };
    }
  }
  
  /**
   * 移动文件（重命名文件的别名）
   */
  public async moveFile(sourcePath: string, destPath: string): Promise<FileOperationResult> {
    // 直接调用renameFile实现
    return await this.renameFile(sourcePath, destPath);
  }
  
  /**
   * 获取文件信息
   */
  public async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size: number;
    modified: Date;
    lines: number;
  }> {
    const fullPath = this.resolvePath(filePath);
    
    try {
      const stats = await fs.stat(fullPath);
      const content = await this.readFileIfExists(fullPath);
      
      return {
        exists: true,
        size: stats.size,
        modified: stats.mtime,
        lines: content.split('\n').length
      };
    } catch {
      return {
        exists: false,
        size: 0,
        modified: new Date(0),
        lines: 0
      };
    }
  }
  
  /**
   * 列出目录内容
   */
  public async listDirectory(dirPath: string = '.'): Promise<{
    files: Array<{
      name: string;
      path: string;
      type: 'file' | 'directory' | 'symlink' | 'other';
      size: number;
      modified: Date;
      extension?: string;
    }>;
    directories: number;
    filesCount: number;
    totalSize: number;
  }> {
    try {
      const fullPath = this.resolvePath(dirPath);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      
      const files: Array<{
        name: string;
        path: string;
        type: 'file' | 'directory' | 'symlink' | 'other';
        size: number;
        modified: Date;
        extension?: string;
      }> = [];
      let directories = 0;
      let filesCount = 0;
      let totalSize = 0;
      
      for (const entry of entries) {
        const entryPath = path.join(fullPath, entry.name);
        const stats = await fs.stat(entryPath);
        
        const fileInfo = {
          name: entry.name,
          path: path.relative(this.workspaceRoot, entryPath),
          type: (entry.isDirectory() ? 'directory' : 
                 entry.isFile() ? 'file' : 
                 entry.isSymbolicLink() ? 'symlink' : 'other') as 'file' | 'directory' | 'symlink' | 'other',
          size: stats.size,
          modified: stats.mtime,
          extension: entry.isFile() ? path.extname(entry.name).toLowerCase() || undefined : undefined
        };
        
        files.push(fileInfo);
        
        if (entry.isDirectory()) {
          directories++;
        } else {
          filesCount++;
          totalSize += stats.size;
        }
      }
      
      // 按类型和名称排序：目录在前，文件在后，都按字母顺序
      files.sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      });
      
      return {
        files,
        directories,
        filesCount,
        totalSize
      };
    } catch (error: any) {
      return {
        files: [],
        directories: 0,
        filesCount: 0,
        totalSize: 0
      };
    }
  }
  
  /**
   * 重命名或移动文件
   */
  public async renameFile(oldPath: string, newPath: string): Promise<FileOperationResult> {
    try {
      const oldFullPath = this.resolvePath(oldPath);
      const newFullPath = this.resolvePath(newPath);
      
      // 确保目标目录存在
      await this.ensureDirectoryExists(newFullPath);
      
      // 读取旧文件内容（用于差异）
      const oldContent = await this.readFileIfExists(oldFullPath);
      
      // 如果目标文件已存在，需要特殊处理？
      const newFileExists = await this.fileExists(newPath);
      
      // 执行重命名/移动
      await fs.rename(oldFullPath, newFullPath);
      
      // 生成差异（文件被"移动"，内容相同但路径不同）
      const diff: FileDiff = {
        filePath: oldPath, // 原始路径
        oldContent,
        newContent: oldContent, // 内容不变
        changes: [],
        summary: `Moved file from ${oldPath} to ${newPath}`
      };
      
      // 同时创建另一个差异表示新文件？
      const newFileDiff: FileDiff = {
        filePath: newPath,
        oldContent: newFileExists ? '' : '', // 如果目标文件不存在，则是创建
        newContent: oldContent,
        changes: this.calculateChanges('', oldContent),
        summary: newFileExists ? `Replaced file at ${newPath}` : `Created file at ${newPath}`
      };
      
      return {
        success: true,
        filePath: newPath,
        diff,
        message: `Moved file from ${oldPath} to ${newPath}`
      };
    } catch (error: any) {
      return {
        success: false,
        filePath: oldPath,
        error: error.message,
        message: `Failed to move file from ${oldPath} to ${newPath}`
      };
    }
  }
  
  /**
   * 复制文件
   */
  public async copyFile(sourcePath: string, destPath: string): Promise<FileOperationResult> {
    try {
      const sourceFullPath = this.resolvePath(sourcePath);
      const destFullPath = this.resolvePath(destPath);
      
      // 确保目标目录存在
      await this.ensureDirectoryExists(destFullPath);
      
      // 读取源文件内容
      const content = await fs.readFile(sourceFullPath, 'utf-8');
      
      // 复制文件
      await fs.copyFile(sourceFullPath, destFullPath);
      
      const diff: FileDiff = {
        filePath: destPath,
        oldContent: '',
        newContent: content,
        changes: this.calculateChanges('', content),
        summary: `Copied file from ${sourcePath} to ${destPath}`
      };
      
      return {
        success: true,
        filePath: destPath,
        diff,
        message: `Copied file from ${sourcePath} to ${destPath}`
      };
    } catch (error: any) {
      return {
        success: false,
        filePath: sourcePath,
        error: error.message,
        message: `Failed to copy file from ${sourcePath} to ${destPath}`
      };
    }
  }
  
  /**
   * 创建目录
   */
  public async createDirectory(dirPath: string): Promise<FileOperationResult> {
    try {
      const fullPath = this.resolvePath(dirPath);
      
      // 创建目录（包括父目录）
      await fs.mkdir(fullPath, { recursive: true });
      
      return {
        success: true,
        filePath: dirPath,
        message: `Created directory: ${dirPath}`
      };
    } catch (error: any) {
      return {
        success: false,
        filePath: dirPath,
        error: error.message,
        message: `Failed to create directory: ${dirPath}`
      };
    }
  }
  
  /**
   * 删除目录（递归）
   */
  public async deleteDirectory(dirPath: string): Promise<FileOperationResult> {
    try {
      const fullPath = this.resolvePath(dirPath);
      
      // 递归删除目录及其内容
      await fs.rm(fullPath, { recursive: true, force: true });
      
      return {
        success: true,
        filePath: dirPath,
        message: `Deleted directory: ${dirPath}`
      };
    } catch (error: any) {
      return {
        success: false,
        filePath: dirPath,
        error: error.message,
        message: `Failed to delete directory: ${dirPath}`
      };
    }
  }
  
  /**
   * 搜索文件（基于名称或内容）
   */
  public async searchFiles(options: {
    pattern?: string; // 文件名模式（支持简单通配符）
    content?: string; // 文件内容搜索
    recursive?: boolean; // 是否递归搜索子目录
    caseSensitive?: boolean; // 是否区分大小写
    maxResults?: number; // 最大结果数
  } = {}): Promise<Array<{
    path: string;
    name: string;
    matches: Array<{
      line: number;
      content: string;
      startIndex: number;
    }>;
  }>> {
    // 这是一个简化实现，实际生产环境可能需要更高效的搜索算法
    const results: Array<{
      path: string;
      name: string;
      matches: Array<{
        line: number;
        content: string;
        startIndex: number;
      }>;
    }> = [];
    const maxDepth = options.recursive ? 10 : 1;
    
    // 递归搜索目录
    const searchDir = async (currentPath: string, depth: number = 0) => {
      if (depth > maxDepth) return;
      
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const entryPath = path.join(currentPath, entry.name);
          const relativePath = path.relative(this.workspaceRoot, entryPath);
          
          if (entry.isDirectory()) {
            if (options.recursive) {
              await searchDir(entryPath, depth + 1);
            }
          } else if (entry.isFile()) {
            // 检查文件名是否匹配模式
            const nameMatches = options.pattern ? 
              this.matchesPattern(entry.name, options.pattern, options.caseSensitive) : true;
            
            let contentMatches: Array<{line: number, content: string, startIndex: number}> = [];
            
            if (nameMatches && options.content) {
              // 搜索文件内容
              try {
                const fileContent = await fs.readFile(entryPath, 'utf-8');
                contentMatches = this.searchInContent(fileContent, options.content, options.caseSensitive);
              } catch (e) {
                // 忽略无法读取的文件（如二进制文件）
              }
            }
            
            const matches = options.content ? contentMatches : [];
            
            if ((nameMatches && !options.content) || (options.content && matches.length > 0)) {
              results.push({
                path: relativePath,
                name: entry.name,
                matches
              });
              
              if (options.maxResults && results.length >= options.maxResults) {
                return; // 达到最大结果数，提前终止
              }
            }
          }
        }
      } catch (error) {
        // 忽略无法访问的目录
      }
    };
    
    await searchDir(this.workspaceRoot);
    return results;
  }
  
  /**
   * 获取文件统计信息（整个工作区）
   */
  public async getWorkspaceStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    totalLines: number;
    byExtension: Record<string, { count: number, size: number, lines: number }>;
    byType: Record<string, number>;
  }> {
    // 这是一个简化实现，实际可能需要递归扫描整个工作区
    // 这里只统计顶级目录
    const dirList = await this.listDirectory('.');
    
    let totalFiles = dirList.filesCount;
    let totalSize = dirList.totalSize;
    let totalLines = 0;
    const byExtension: Record<string, { count: number, size: number, lines: number }> = {};
    const byType: Record<string, number> = {
      'directory': dirList.directories,
      'file': dirList.filesCount,
      'symlink': 0,
      'other': 0
    };
    
    // 对每个文件，统计行数和扩展名
    for (const file of dirList.files) {
      if (file.type === 'file') {
        try {
          const content = await this.readFile(file.path);
          const lines = content.split('\n').length;
          totalLines += lines;
          
          const ext = file.extension || 'no-extension';
          if (!byExtension[ext]) {
            byExtension[ext] = { count: 0, size: 0, lines: 0 };
          }
          byExtension[ext].count++;
          byExtension[ext].size += file.size;
          byExtension[ext].lines += lines;
        } catch (e) {
          // 忽略无法读取的文件
        }
      }
    }
    
    return {
      totalFiles,
      totalSize,
      totalLines,
      byExtension,
      byType
    };
  }
  
  /**
   * 应用差异（用户批准后）
   */
  public async applyDiff(diff: FileDiff): Promise<FileOperationResult> {
    if (diff.oldContent === '') {
      // 创建新文件
      return await this.createFile(diff.filePath, diff.newContent);
    } else if (diff.newContent === '') {
      // 删除文件
      return await this.deleteFile(diff.filePath);
    } else {
      // 编辑文件
      return await this.editFileWithDiff(diff.filePath, diff.newContent);
    }
  }
  
  /**
   * 撤销差异（回滚更改）
   */
  public async revertDiff(diff: FileDiff): Promise<FileOperationResult> {
    if (diff.oldContent === '') {
      // 回滚创建 -> 删除文件
      return await this.deleteFile(diff.filePath);
    } else {
      // 回滚到旧内容
      return await this.editFileWithDiff(diff.filePath, diff.oldContent);
    }
  }
  
  /**
   * 批量应用多个差异
   */
  public async applyDiffs(diffs: FileDiff[]): Promise<FileOperationResult[]> {
    const results: FileOperationResult[] = [];
    
    for (const diff of diffs) {
      const result = await this.applyDiff(diff);
      results.push(result);
      
      // 如果某个操作失败，可以决定是否继续
      if (!result.success) {
        // 记录错误但继续执行其他文件
        console.error(`Failed to apply diff for ${diff.filePath}:`, result.error);
      }
    }
    
    return results;
  }
  
  // ===== 私有方法 =====
  
  private resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.join(this.workspaceRoot, filePath);
  }
  
  private async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
  }
  
  private async readFileIfExists(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return '';
    }
  }
  
  private async openFileInEditor(filePath: string): Promise<void> {
    try {
      const uri = vscode.Uri.file(filePath);
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document, { preview: false });
    } catch (error) {
      console.warn('Failed to open file in editor:', error);
    }
  }
  
  private async refreshFileInEditor(filePath: string): Promise<void> {
    try {
      const uri = vscode.Uri.file(filePath);
      await vscode.commands.executeCommand('workbench.action.files.revert', uri);
    } catch (error) {
      console.warn('Failed to refresh file in editor:', error);
    }
  }
  
  /**
   * 简单的差异计算算法
   * 注：对于生产环境，应该使用更成熟的diff库
   */
  private calculateChanges(oldContent: string, newContent: string): LineChange[] {
    const changes: LineChange[] = [];
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    // 简单实现：逐行比较
    const maxLength = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLength; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine === '' && newLine !== '') {
        // 新增行
        changes.push({
          type: 'added',
          newLineNumber: i + 1,
          content: newLine
        });
      } else if (oldLine !== '' && newLine === '') {
        // 删除行
        changes.push({
          type: 'removed',
          oldLineNumber: i + 1,
          content: oldLine
        });
      } else if (oldLine !== newLine) {
        // 修改行
        changes.push({
          type: 'modified',
          oldLineNumber: i + 1,
          newLineNumber: i + 1,
          content: newLine
        });
      }
    }
    
    // 如果新内容更长，添加剩余的新行
    for (let i = oldLines.length; i < newLines.length; i++) {
      changes.push({
        type: 'added',
        newLineNumber: i + 1,
        content: newLines[i]
      });
    }
    
    return changes;
  }
  
  private generateDiffSummary(oldContent: string, newContent: string): string {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const changes = this.calculateChanges(oldContent, newContent);
    
    const added = changes.filter(c => c.type === 'added').length;
    const removed = changes.filter(c => c.type === 'removed').length;
    const modified = changes.filter(c => c.type === 'modified').length;
    
    const parts: string[] = [];
    
    if (added > 0) parts.push(`${added} lines added`);
    if (removed > 0) parts.push(`${removed} lines removed`);
    if (modified > 0) parts.push(`${modified} lines modified`);
    
    if (parts.length === 0) {
      return 'No changes';
    }
    
    return parts.join(', ');
  }
  
  /**
   * 生成可读的差异显示（用于UI）
   */
  public generateReadableDiff(diff: FileDiff): string {
    const lines: string[] = [];
    
    lines.push(`File: ${diff.filePath}`);
    lines.push(`Summary: ${diff.summary}`);
    lines.push('');
    
    for (const change of diff.changes) {
      const prefix = change.type === 'added' ? '+' :
                     change.type === 'removed' ? '-' : '~';
      
      const lineInfo = change.type === 'added' ? ` (line ${change.newLineNumber})` :
                       change.type === 'removed' ? ` (line ${change.oldLineNumber})` :
                       ` (line ${change.oldLineNumber} → ${change.newLineNumber})`;
      
      lines.push(`${prefix}${lineInfo}: ${change.content}`);
    }
    
    return lines.join('\n');
  }
  
  /**
   * 生成HTML格式的差异显示（用于Webview）
   */
  public generateHtmlDiff(diff: FileDiff): string {
    const lines: string[] = [];
    
    lines.push(`<div class="diff-header">`);
    lines.push(`  <h3>${diff.filePath}</h3>`);
    lines.push(`  <div class="diff-summary">${diff.summary}</div>`);
    lines.push(`</div>`);
    lines.push(`<div class="diff-content">`);
    
    for (const change of diff.changes) {
      const className = change.type === 'added' ? 'diff-added' :
                        change.type === 'removed' ? 'diff-removed' : 'diff-modified';
      
      const lineInfo = change.type === 'added' ? `Line ${change.newLineNumber}` :
                       change.type === 'removed' ? `Line ${change.oldLineNumber}` :
                       `Line ${change.oldLineNumber} → ${change.newLineNumber}`;
      
      lines.push(`  <div class="diff-line ${className}">`);
      lines.push(`    <span class="diff-line-info">${lineInfo}:</span>`);
      lines.push(`    <span class="diff-line-content">${this.escapeHtml(change.content)}</span>`);
      lines.push(`  </div>`);
    }
    
    lines.push(`</div>`);
    
    return lines.join('\n');
  }
  
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  /**
   * 检查文件名是否匹配模式（支持简单通配符）
   */
  private matchesPattern(filename: string, pattern: string, caseSensitive: boolean = false): boolean {
    let fn = filename;
    let pat = pattern;
    
    if (!caseSensitive) {
      fn = fn.toLowerCase();
      pat = pat.toLowerCase();
    }
    
    // 将通配符模式转换为正则表达式
    const regexPattern = pat
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(fn);
  }
  
  /**
   * 在文件内容中搜索文本
   */
  private searchInContent(content: string, searchText: string, caseSensitive: boolean = false): Array<{
    line: number;
    content: string;
    startIndex: number;
  }> {
    const results: Array<{
      line: number;
      content: string;
      startIndex: number;
    }> = [];
    const lines = content.split('\n');
    const search = caseSensitive ? searchText : searchText.toLowerCase();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineToSearch = caseSensitive ? line : line.toLowerCase();
      
      let startIndex = 0;
      while ((startIndex = lineToSearch.indexOf(search, startIndex)) !== -1) {
        results.push({
          line: i + 1,
          content: line,
          startIndex
        });
        startIndex += search.length;
        
        // 限制每行的匹配数量，避免性能问题
        if (results.length > 100) break;
      }
      
      if (results.length > 100) break;
    }
    
    return results;
  }
}