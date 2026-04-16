/**
 * 模拟ProjectAnalyzer - 用于测试EnhancedEngineAdapter
 */
export class MockProjectAnalyzer {
  async analyzeProject(projectPath: string, options?: any): Promise<any> {
    console.log('MockProjectAnalyzer: 分析项目', projectPath);
    return {
      languageStats: {
        TypeScript: { files: 25, lines: 4500 },
        JavaScript: { files: 10, lines: 1200 },
        JSON: { files: 5, lines: 500 }
      },
      dependencies: ['typescript', 'vscode', 'react', 'node-fetch'],
      projectStructure: {
        src: ['core', 'models', 'prompt', 'tool'],
        test: ['unit', 'integration'],
        config: ['tsconfig.json', 'package.json']
      },
      complexity: { score: 7.2, recommendations: ['添加更多测试', '重构大型函数'] }
    };
  }
  
  async getFileContext(filePath: string): Promise<any> {
    console.log('MockProjectAnalyzer: 获取文件上下文', filePath);
    return {
      content: '// 模拟文件内容\nfunction example() {\n  return "Hello World";\n}',
      imports: ['path', 'fs', 'vscode'],
      exports: ['example'],
      references: ['otherFile.ts'],
      dependencies: ['node:path', 'node:fs']
    };
  }
}