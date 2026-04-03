import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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

export class ProjectAnalyzer {
  public async analyzeCurrentWorkspace(): Promise<ProjectContext> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return this.getDefaultContext();
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    return this.analyzeDirectory(rootPath);
  }

  private async analyzeDirectory(rootPath: string): Promise<ProjectContext> {
    // Detect project type based on configuration files
    const projectType = await this.detectProjectType(rootPath);
    const language = await this.detectLanguage(rootPath);
    const framework = await this.detectFramework(rootPath);
    const files = await this.collectRelevantFiles(rootPath);
    const dependencies = await this.extractDependencies(rootPath);
    const codeStyle = await this.analyzeCodeStyle(rootPath);
    const architecture = await this.detectArchitecture(rootPath);

    return {
      projectType,
      language,
      framework,
      rootPath,
      files,
      dependencies,
      codeStyle,
      architecture
    };
  }

  /**
   * 安全解析JSON文件，自动清理Markdown代码块
   * @param filePath JSON文件路径
   * @returns 解析后的JSON对象，如果解析失败则返回null
   */
  private safeParseJsonFile(filePath: string): any | null {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.safeParseJsonString(content);
    } catch (error) {
      console.error(`Failed to read or parse JSON file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * 安全解析JSON字符串，自动清理Markdown代码块
   * @param jsonString JSON字符串
   * @returns 解析后的JSON对象
   * @throws 如果清理后仍然不是有效的JSON
   */
  private safeParseJsonString(jsonString: string): any {
    // 清理可能存在的Markdown代码块
    let cleanedContent = jsonString.trim();
    if (cleanedContent.startsWith('```')) {
      const firstNewline = cleanedContent.indexOf('\n');
      if (firstNewline !== -1) {
        cleanedContent = cleanedContent.substring(firstNewline + 1);
      } else {
        cleanedContent = cleanedContent.substring(3);
      }
    }
    const lastBackticks = cleanedContent.lastIndexOf('```');
    if (lastBackticks !== -1) {
      cleanedContent = cleanedContent.substring(0, lastBackticks);
    }
    cleanedContent = cleanedContent.trim();
    
    return JSON.parse(cleanedContent);
  }

  private async detectProjectType(rootPath: string): Promise<string> {
    const files = fs.readdirSync(rootPath);
    
    if (files.includes('package.json')) {
      try {
        const packageJson = this.safeParseJsonFile(path.join(rootPath, 'package.json'));
        if (packageJson) {
          if (packageJson.dependencies?.['react'] || packageJson.devDependencies?.['react']) {
            return 'react';
          }
          if (packageJson.dependencies?.['vue'] || packageJson.devDependencies?.['vue']) {
            return 'vue';
          }
          return 'node';
        }
      } catch (error) {
        console.error('Failed to parse package.json:', error);
        // 如果解析失败，尝试检测其他项目类型
      }
    }
    
    if (files.includes('pom.xml') || files.includes('build.gradle')) {
      return 'java';
    }
    
    if (files.includes('requirements.txt') || files.includes('setup.py')) {
      return 'python';
    }
    
    if (files.includes('go.mod')) {
      return 'go';
    }
    
    return 'unknown';
  }

  private async detectLanguage(rootPath: string): Promise<string> {
    const projectType = await this.detectProjectType(rootPath);
    
    switch (projectType) {
      case 'react':
      case 'vue':
      case 'node':
        return 'javascript/typescript';
      case 'java':
        return 'java';
      case 'python':
        return 'python';
      case 'go':
        return 'go';
      default:
        return 'unknown';
    }
  }

  private async detectFramework(rootPath: string): Promise<string | undefined> {
    const projectType = await this.detectProjectType(rootPath);
    
    if (projectType === 'java') {
      // Check for Spring Boot
      if (fs.existsSync(path.join(rootPath, 'pom.xml'))) {
        const pomContent = fs.readFileSync(path.join(rootPath, 'pom.xml'), 'utf8');
        if (pomContent.includes('spring-boot-starter')) {
          return 'spring-boot';
        }
      }
    }
    
    if (projectType === 'node') {
      const packageJsonPath = path.join(rootPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = this.safeParseJsonFile(packageJsonPath);
          if (packageJson && packageJson.dependencies?.['express']) {
            return 'express';
          }
        } catch (error) {
          console.error('Failed to parse package.json in detectFramework:', error);
        }
      }
    }
    
    return undefined;
  }

  private async collectRelevantFiles(rootPath: string): Promise<string[]> {
    const relevantExtensions = ['.js', '.ts', '.java', '.py', '.go', '.rs', '.cpp', '.c'];
    const files: string[] = [];
    
    const collect = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip common directories
          if (!['node_modules', '.git', 'dist', 'build', 'target'].includes(item)) {
            collect(fullPath);
          }
        } else {
          const ext = path.extname(item);
          if (relevantExtensions.includes(ext)) {
            files.push(fullPath.replace(rootPath + '/', ''));
          }
        }
      }
    };
    
    collect(rootPath);
    return files.slice(0, 50); // Limit to 50 files
  }

  private async extractDependencies(rootPath: string): Promise<string[]> {
    const dependencies: string[] = [];
    const projectType = await this.detectProjectType(rootPath);
    
    if (projectType === 'node') {
      const packageJsonPath = path.join(rootPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = this.safeParseJsonFile(packageJsonPath);
          if (packageJson) {
            if (packageJson.dependencies) {
              dependencies.push(...Object.keys(packageJson.dependencies));
            }
            if (packageJson.devDependencies) {
              dependencies.push(...Object.keys(packageJson.devDependencies));
            }
          }
        } catch (error) {
          console.error('Error parsing package.json:', error);
        }
      }
    }
    
    return dependencies.slice(0, 20); // Limit to top 20 dependencies
  }

  private async analyzeCodeStyle(rootPath: string): Promise<ProjectContext['codeStyle']> {
    // Default code style
    const defaultStyle: ProjectContext['codeStyle'] = {
      indent: 2,
      quoteStyle: 'single',
      lineEnding: 'lf'
    };
    
    // Try to analyze from existing files
    const sampleFiles = await this.getSampleFiles(rootPath);
    if (sampleFiles.length === 0) {
      return defaultStyle;
    }
    
    // Simple analysis: check first file
    try {
      const firstFile = sampleFiles[0];
      const content = fs.readFileSync(path.join(rootPath, firstFile), 'utf8');
      
      // Detect indentation
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.startsWith('  ') && !line.startsWith('    ')) {
          defaultStyle.indent = 2;
          break;
        } else if (line.startsWith('    ')) {
          defaultStyle.indent = 4;
          break;
        } else if (line.startsWith('\t')) {
          defaultStyle.indent = 8; // Tab usually 8 spaces
          break;
        }
      }
      
      // Detect quote style
      if (content.includes("'") && content.includes('"')) {
        // Count both
        const singleQuotes = (content.match(/'/g) || []).length;
        const doubleQuotes = (content.match(/"/g) || []).length;
        defaultStyle.quoteStyle = singleQuotes > doubleQuotes ? 'single' : 'double';
      } else if (content.includes("'")) {
        defaultStyle.quoteStyle = 'single';
      } else if (content.includes('"')) {
        defaultStyle.quoteStyle = 'double';
      }
      
      // Detect line ending
      if (content.includes('\r\n')) {
        defaultStyle.lineEnding = 'crlf';
      } else {
        defaultStyle.lineEnding = 'lf';
      }
    } catch (error) {
      console.error('Error analyzing code style:', error);
    }
    
    return defaultStyle;
  }

  private async getSampleFiles(rootPath: string): Promise<string[]> {
    const allFiles = await this.collectRelevantFiles(rootPath);
    return allFiles.slice(0, 5); // First 5 files as sample
  }

  private async detectArchitecture(rootPath: string): Promise<string | undefined> {
    const projectType = await this.detectProjectType(rootPath);
    const framework = await this.detectFramework(rootPath);
    
    if (projectType === 'java' && framework === 'spring-boot') {
      // Check for typical Spring Boot structure
      const hasController = this.checkForPattern(rootPath, /@RestController|@Controller/);
      const hasService = this.checkForPattern(rootPath, /@Service/);
      const hasRepository = this.checkForPattern(rootPath, /@Repository/);
      
      if (hasController && hasService) {
        return 'controller-service-repository';
      }
    }
    
    if (projectType === 'node') {
      // Check for MVC or similar
      const hasRoutes = fs.existsSync(path.join(rootPath, 'routes')) || 
                       this.checkForPattern(rootPath, /router\.|app\.(get|post|put|delete)/);
      const hasModels = fs.existsSync(path.join(rootPath, 'models')) || 
                       fs.existsSync(path.join(rootPath, 'schemas'));
      
      if (hasRoutes && hasModels) {
        return 'mvc';
      }
    }
    
    return undefined;
  }

  private checkForPattern(rootPath: string, pattern: RegExp): boolean {
    try {
      const files = this.getAllFiles(rootPath, ['.java', '.js', '.ts']);
      for (const file of files.slice(0, 20)) { // Check first 20 files
        const content = fs.readFileSync(path.join(rootPath, file), 'utf8');
        if (pattern.test(content)) {
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking pattern:', error);
    }
    return false;
  }

  private getAllFiles(rootPath: string, extensions: string[]): string[] {
    const files: string[] = [];
    
    const collect = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build', 'target'].includes(item)) {
            collect(fullPath);
          }
        } else {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath.replace(rootPath + '/', ''));
          }
        }
      }
    };
    
    collect(rootPath);
    return files;
  }

  private getDefaultContext(): ProjectContext {
    return {
      projectType: 'unknown',
      language: 'unknown',
      rootPath: '',
      files: [],
      dependencies: [],
      codeStyle: {
        indent: 2,
        quoteStyle: 'single',
        lineEnding: 'lf'
      }
    };
  }
}