import 'mocha';
import * as assert from 'assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { FileManager } from '../../file/fileManager';

describe('FileManager Tests', () => {
    
    let fileManager: FileManager;
    let testDir: string;
    let originalCwd: string;
    
    // 设置测试环境
    beforeEach(async () => {
        // 创建临时测试目录
        testDir = path.join(os.tmpdir(), `codeline-test-${Date.now()}`);
        await fs.mkdir(testDir, { recursive: true });
        
        // 创建一些测试文件
        await fs.writeFile(
            path.join(testDir, 'test1.txt'),
            'Hello, World!\nThis is test file 1.\nThird line.'
        );
        
        await fs.writeFile(
            path.join(testDir, 'test2.md'),
            '# Markdown Test\n\nThis is a markdown file.\n\n## Section\nContent here.'
        );
        
        await fs.mkdir(path.join(testDir, 'subdir'), { recursive: true });
        await fs.writeFile(
            path.join(testDir, 'subdir', 'nested.txt'),
            'Nested file content.'
        );
        
        // 初始化 FileManager
        fileManager = new FileManager(testDir);
        
        // 保存原始工作目录
        originalCwd = process.cwd();
        process.chdir(testDir);
    });
    
    // 清理测试环境
    afterEach(async () => {
        // 恢复工作目录
        process.chdir(originalCwd);
        
        // 清理临时目录
        try {
            await fs.rm(testDir, { recursive: true, force: true });
        } catch (error) {
            console.warn(`Failed to clean up test directory: ${error}`);
        }
    });
    
    it('FileManager should be created and functional', async () => {
        assert.ok(fileManager, 'FileManager should be instantiated');
        
        // 通过功能测试验证FileManager工作正常
        const listResult = await fileManager.listDirectory('.');
        assert.ok(Array.isArray(listResult.files), 'Should be able to list files');
        
        // 验证至少能找到一个我们创建的文件
        const hasTestFile = listResult.files.some((file: any) => file.name === 'test1.txt');
        assert.ok(hasTestFile, 'Should find test1.txt in the test directory');
    });
it('listDirectory should list files and directories', async () => {
        const result = await fileManager.listDirectory('.');
        
        assert.ok(result, 'Result should exist');
        assert.ok(Array.isArray(result.files), 'files should be an array');
        assert.ok(typeof result.directories === 'number', 'directories should be a number');
        assert.ok(typeof result.filesCount === 'number', 'filesCount should be a number');
        assert.ok(typeof result.totalSize === 'number', 'totalSize should be a number');
        
        // 至少应该有3个文件（test1.txt, test2.md, subdir/nested.txt）和1个目录（subdir）
        // 注意：listDirectory只列出当前目录，不包括子目录的内容
        const files = result.files;
        assert.ok(files.length >= 3, `Should list at least 3 items, got ${files.length}`);
        
        // 验证文件信息结构
        const firstFile = files[0];
        assert.ok('name' in firstFile, 'File should have name property');
        assert.ok('path' in firstFile, 'File should have path property');
        assert.ok('type' in firstFile, 'File should have type property');
        assert.ok('size' in firstFile, 'File should have size property');
        assert.ok('modified' in firstFile, 'File should have modified property');
        
        // 验证排序：目录在前
        const directoryIndex = files.findIndex(f => f.type === 'directory');
        const fileIndex = files.findIndex(f => f.type === 'file');
        if (directoryIndex !== -1 && fileIndex !== -1) {
            assert.ok(directoryIndex < fileIndex, 'Directories should come before files');
        }
    });
it('fileExists should check file existence', async () => {
        const exists = await fileManager.fileExists('test1.txt');
        assert.strictEqual(exists, true, 'test1.txt should exist');
        
        const notExists = await fileManager.fileExists('nonexistent.txt');
        assert.strictEqual(notExists, false, 'nonexistent.txt should not exist');
    });
it('readFile should read file content', async () => {
        const content = await fileManager.readFile('test1.txt');
        assert.ok(typeof content === 'string', 'Content should be a string');
        assert.ok(content.includes('Hello, World!'), 'Content should contain expected text');
        assert.ok(content.includes('This is test file 1.'), 'Content should contain expected text');
    });
it('readFile should throw error for non-existent file', async () => {
        try {
            await fileManager.readFile('nonexistent.txt');
            assert.fail('Should have thrown an error');
        } catch (error: any) {
            assert.ok(error instanceof Error, 'Should throw an Error');
            assert.ok(error.message.includes('not exist') || error.message.includes('ENOENT'), 
                `Error message should indicate file doesn't exist: ${error.message}`);
        }
    });
it('getFileInfo should return file information', async () => {
        const info = await fileManager.getFileInfo('test1.txt');
        
        assert.ok(info, 'File info should exist');
        assert.strictEqual(info.exists, true, 'File should exist');
        assert.ok(info.size > 0, 'File size should be positive');
        assert.ok(info.lines > 0, 'File should have lines');
        assert.ok(info.modified instanceof Date, 'modified should be a Date');
    });
it('createFile should create new file with diff', async () => {
        const filePath = 'newfile.txt';
        const content = 'New file content\nSecond line\nThird line';
        
        const result = await fileManager.createFile(filePath, content);
        
        assert.strictEqual(result.success, true, 'File creation should succeed');
        assert.strictEqual(result.filePath, filePath, 'Should return correct file path');
        assert.ok(result.message, 'Should have a message');
        assert.ok(result.diff, 'Should include diff information');
        
        // 验证文件确实被创建
        const fileContent = await fs.readFile(path.join(testDir, filePath), 'utf-8');
        assert.strictEqual(fileContent, content, 'File content should match');
        
        // 验证差异信息
        const diff = result.diff!;
        assert.strictEqual(diff.filePath, filePath, 'Diff should reference correct file path');
        assert.strictEqual(diff.oldContent, '', 'Old content should be empty for new file');
        assert.strictEqual(diff.newContent, content, 'New content should match');
        assert.ok(Array.isArray(diff.changes), 'Changes should be an array');
        assert.ok(diff.summary, 'Summary should exist');
    });
it('editFileWithDiff should modify existing file with diff', async () => {
        const filePath = 'test1.txt';
        const originalContent = await fs.readFile(path.join(testDir, filePath), 'utf-8');
        const newContent = originalContent + '\nAdded line for edit test.';
        
        const result = await fileManager.editFileWithDiff(filePath, newContent);
        
        assert.strictEqual(result.success, true, 'File edit should succeed');
        assert.strictEqual(result.filePath, filePath, 'Should return correct file path');
        assert.ok(result.diff, 'Should include diff information');
        
        // 验证文件内容已更新
        const updatedContent = await fs.readFile(path.join(testDir, filePath), 'utf-8');
        assert.strictEqual(updatedContent, newContent, 'File content should be updated');
        
        // 验证差异信息
        const diff = result.diff!;
        assert.strictEqual(diff.oldContent, originalContent, 'Diff should contain original content');
        assert.strictEqual(diff.newContent, newContent, 'Diff should contain new content');
        assert.ok(diff.changes.length > 0, 'Should have changes recorded');
    });
it('deleteFile should remove file with diff', async () => {
        const filePath = 'test2.md';
        const originalContent = await fs.readFile(path.join(testDir, filePath), 'utf-8');
        
        const result = await fileManager.deleteFile(filePath);
        
        assert.strictEqual(result.success, true, 'File deletion should succeed');
        assert.strictEqual(result.filePath, filePath, 'Should return correct file path');
        
        // 验证文件已被删除
        try {
            await fs.access(path.join(testDir, filePath));
            assert.fail('File should have been deleted');
        } catch (error: any) {
            assert.ok(error.code === 'ENOENT', 'File should not exist after deletion');
        }
        
        // 验证差异信息
        const diff = result.diff!;
        assert.strictEqual(diff.oldContent, originalContent, 'Diff should contain original content');
        assert.strictEqual(diff.newContent, '', 'New content should be empty for deletion');
    });
it('searchFiles should find files by pattern', async () => {
        const results = await fileManager.searchFiles({
            pattern: '*.txt',
            recursive: true
        });
        
        assert.ok(Array.isArray(results), 'Results should be an array');
        assert.ok(results.length >= 2, 'Should find at least 2 .txt files (test1.txt, subdir/nested.txt)');
        
        // 验证结果结构
        const firstResult = results[0];
        assert.ok('path' in firstResult, 'Result should have path property');
        assert.ok('name' in firstResult, 'Result should have name property');
        assert.ok('matches' in firstResult, 'Result should have matches property');
        assert.ok(Array.isArray(firstResult.matches), 'matches should be an array');
    });
it('searchFiles should find files by content', async () => {
        const results = await fileManager.searchFiles({
            content: 'World',
            recursive: true,
            caseSensitive: false
        });
        
        assert.ok(Array.isArray(results), 'Results should be an array');
        assert.ok(results.length >= 1, 'Should find at least 1 file containing "World"');
        
        const result = results[0];
        assert.ok(result.matches.length > 0, 'Should have matches for content search');
        
        const firstMatch = result.matches[0];
        assert.ok('line' in firstMatch, 'Match should have line number');
        assert.ok('content' in firstMatch, 'Match should have content');
        assert.ok('startIndex' in firstMatch, 'Match should have startIndex');
    });
it('getWorkspaceStats should return statistics', async () => {
        const stats = await fileManager.getWorkspaceStats();
        
        assert.ok(stats, 'Stats should exist');
        assert.ok(typeof stats.totalFiles === 'number', 'totalFiles should be a number');
        assert.ok(typeof stats.totalSize === 'number', 'totalSize should be a number');
        assert.ok(typeof stats.totalLines === 'number', 'totalLines should be a number');
        assert.ok(typeof stats.byExtension === 'object', 'byExtension should be an object');
        assert.ok(typeof stats.byType === 'object', 'byType should be an object');
        
        // 验证基本计数
        // 注意：当前getWorkspaceStats实现只统计顶级目录，不递归子目录
        // 所以只统计2个文件（test1.txt, test2.md），不包括subdir/nested.txt
        assert.ok(stats.totalFiles >= 2, `Should count at least 2 files (top-level only), got ${stats.totalFiles}`);
        assert.ok(stats.totalLines >= 5, `Should count at least 5 lines, got ${stats.totalLines}`);
        assert.ok(stats.totalSize > 0, 'Total size should be positive');
        
        // 验证扩展名统计
        const txtStats = stats.byExtension['.txt'];
        if (txtStats) {
            assert.ok(txtStats.count > 0, 'Should have .txt files');
            assert.ok(txtStats.lines > 0, 'Should have lines in .txt files');
            assert.ok(txtStats.size > 0, 'Should have size for .txt files');
        }
        
        // 验证类型统计
        assert.ok(stats.byType['file'] >= 2, `Should have at least 2 files (top-level), got ${stats.byType['file']}`);
        assert.ok(stats.byType['directory'] >= 1, `Should have at least 1 directory, got ${stats.byType['directory']}`);
    });
it('renameFile should rename/move file', async () => {
        const oldPath = 'test1.txt';
        const newPath = 'renamed.txt';
        const originalContent = await fs.readFile(path.join(testDir, oldPath), 'utf-8');
        
        const result = await fileManager.renameFile(oldPath, newPath);
        
        assert.strictEqual(result.success, true, 'Rename should succeed');
        assert.strictEqual(result.filePath, newPath, 'Should return new file path');
        
        // 验证文件已被重命名
        const oldExists = await fileManager.fileExists(oldPath);
        assert.strictEqual(oldExists, false, 'Old file should not exist');
        
        const newExists = await fileManager.fileExists(newPath);
        assert.strictEqual(newExists, true, 'New file should exist');
        
        // 验证内容保持不变
        const newContent = await fs.readFile(path.join(testDir, newPath), 'utf-8');
        assert.strictEqual(newContent, originalContent, 'Content should be preserved');
    });
it('copyFile should copy file', async () => {
        const sourcePath = 'test2.md';
        const destPath = 'copy.md';
        const originalContent = await fs.readFile(path.join(testDir, sourcePath), 'utf-8');
        
        const result = await fileManager.copyFile(sourcePath, destPath);
        
        assert.strictEqual(result.success, true, 'Copy should succeed');
        assert.strictEqual(result.filePath, destPath, 'Should return destination file path');
        
        // 验证源文件仍然存在
        const sourceExists = await fileManager.fileExists(sourcePath);
        assert.strictEqual(sourceExists, true, 'Source file should still exist');
        
        // 验证目标文件被创建
        const destExists = await fileManager.fileExists(destPath);
        assert.strictEqual(destExists, true, 'Destination file should exist');
        
        // 验证内容相同
        const destContent = await fs.readFile(path.join(testDir, destPath), 'utf-8');
        assert.strictEqual(destContent, originalContent, 'Content should be identical');
    });
it('createDirectory should create directory', async () => {
        const dirPath = 'newdir';
        
        const result = await fileManager.createDirectory(dirPath);
        
        assert.strictEqual(result.success, true, 'Directory creation should succeed');
        assert.strictEqual(result.filePath, dirPath, 'Should return directory path');
        
        // 验证目录已创建
        const dirExists = await fs.access(path.join(testDir, dirPath))
            .then(() => true)
            .catch(() => false);
        assert.strictEqual(dirExists, true, 'Directory should exist');
    });
it('deleteDirectory should recursively delete directory', async () => {
        const dirPath = 'subdir';
        
        // 确保目录存在
        const dirExists = await fs.access(path.join(testDir, dirPath))
            .then(() => true)
            .catch(() => false);
        assert.strictEqual(dirExists, true, 'Directory should exist before deletion');
        
        const result = await fileManager.deleteDirectory(dirPath);
        
        assert.strictEqual(result.success, true, 'Directory deletion should succeed');
        assert.strictEqual(result.filePath, dirPath, 'Should return directory path');
        
        // 验证目录已被删除
        const stillExists = await fs.access(path.join(testDir, dirPath))
            .then(() => true)
            .catch(() => false);
        assert.strictEqual(stillExists, false, 'Directory should not exist after deletion');
    });
it('generateReadableDiff should generate readable diff', async () => {
        const oldContent = 'Line 1\nLine 2\nLine 3';
        const newContent = 'Line 1\nLine 2 modified\nLine 3\nLine 4 added';
        
        // 使用FileManager的私有方法进行测试
        // 注意：实际使用中，这个方法通过文件操作自动调用
        const filePath = 'diff_test.txt';
        await fs.writeFile(path.join(testDir, filePath), oldContent);
        
        const result = await fileManager.editFileWithDiff(filePath, newContent);
        
        assert.ok(result.diff, 'Should have diff');
        const diff = result.diff!;
        
        // 验证可读差异生成
        const readableDiff = fileManager.generateReadableDiff(diff);
        assert.ok(typeof readableDiff === 'string', 'Readable diff should be a string');
        assert.ok(readableDiff.includes('Line'), 'Diff should contain line information');
        assert.ok(readableDiff.includes('+') || readableDiff.includes('-'), 'Diff should contain change markers');
    });
it('generateHtmlDiff should generate HTML diff', async () => {
        const oldContent = 'Line 1\nLine 2\nLine 3';
        const newContent = 'Line 1\nLine 2 modified\nLine 3\nLine 4 added';
        
        const filePath = 'html_diff_test.txt';
        await fs.writeFile(path.join(testDir, filePath), oldContent);
        
        const result = await fileManager.editFileWithDiff(filePath, newContent);
        
        assert.ok(result.diff, 'Should have diff');
        const diff = result.diff!;
        
        // 验证HTML差异生成
        const htmlDiff = fileManager.generateHtmlDiff(diff);
        assert.ok(typeof htmlDiff === 'string', 'HTML diff should be a string');
        assert.ok(htmlDiff.includes('<div'), 'HTML diff should contain HTML elements');
        assert.ok(htmlDiff.includes('class="'), 'HTML diff should contain CSS classes');
        assert.ok(htmlDiff.includes('diff-line'), 'HTML diff should contain diff-line class');
    });
    
    // 边缘情况测试
it('should handle empty directory', async () => {
        const emptyDir = path.join(testDir, 'emptydir');
        await fs.mkdir(emptyDir, { recursive: true });
        
        const emptyFileManager = new FileManager(emptyDir);
        const result = await emptyFileManager.listDirectory('.');
        
        assert.strictEqual(result.files.length, 0, 'Empty directory should have no files');
        assert.strictEqual(result.directories, 0, 'Empty directory should have no subdirectories');
        assert.strictEqual(result.filesCount, 0, 'filesCount should be 0');
        assert.strictEqual(result.totalSize, 0, 'totalSize should be 0');
    });
it('should handle non-existent file operations gracefully', async () => {
        const result = await fileManager.deleteFile('non-existent-file.txt');
        assert.strictEqual(result.success, false, 'Deleting non-existent file should fail');
        assert.ok(result.error, 'Should have error message');
        assert.ok(result.message, 'Should have user-friendly message');
    });
});