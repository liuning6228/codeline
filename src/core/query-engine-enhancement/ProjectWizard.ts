/**
 * ProjectWizard - 项目向导系统
 * 
 * 提供智能项目创建和初始化功能：
 * 1. 项目模板选择和管理
 * 2. 项目配置生成
 * 3. 依赖安装和管理
 * 4. 项目结构生成
 * 5. 工具链设置
 */

import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import { promisify } from 'util';
import { CodeGeneratorTool } from './tools/CodeGeneratorTool';
import { FileEditorTool } from './tools/FileEditorTool';
import { CodeAnalysisTool } from './tools/CodeAnalysisTool';
import { PerformanceMonitor } from './PerformanceMonitor';

const exec = promisify(child_process.exec);

/**
 * 项目类型
 */
export type ProjectType = 
  | 'nodejs'          // Node.js应用
  | 'typescript'      // TypeScript库
  | 'react'          // React应用
  | 'vue'            // Vue应用
  | 'angular'        // Angular应用
  | 'nextjs'         // Next.js应用
  | 'express'        // Express API
  | 'nestjs'         // NestJS应用
  | 'cli'            // CLI工具
  | 'library'        // 通用库
  | 'webcomponent'   // Web组件库
  | 'mobile'         // 移动应用
  | 'desktop';       // 桌面应用

/**
 * 项目模板
 */
export interface ProjectTemplate {
  /** 模板ID */
  id: string;
  
  /** 模板名称 */
  name: string;
  
  /** 模板描述 */
  description: string;
  
  /** 项目类型 */
  type: ProjectType;
  
  /** 模板版本 */
  version: string;
  
  /** 作者 */
  author?: string;
  
  /** 模板目录 */
  templateDir?: string;
  
  /** 模板文件 */
  files: Array<{
    /** 源文件路径（相对于模板目录） */
    source: string;
    
    /** 目标文件路径（相对于项目目录） */
    target: string;
    
    /** 是否模板文件（需要变量替换） */
    isTemplate?: boolean;
    
    /** 文件权限 */
    permissions?: string;
  }>;
  
  /** 依赖配置 */
  dependencies: {
    /** 生产依赖 */
    dependencies?: Record<string, string>;
    
    /** 开发依赖 */
    devDependencies?: Record<string, string>;
    
    /** 可选依赖 */
    optionalDependencies?: Record<string, string>;
    
    /** 对等依赖 */
    peerDependencies?: Record<string, string>;
  };
  
  /** 脚本配置 */
  scripts?: Record<string, string>;
  
  /** 配置 */
  config?: {
    /** TypeScript配置 */
    typescript?: any;
    
    /** ESLint配置 */
    eslint?: any;
    
    /** Prettier配置 */
    prettier?: any;
    
    /** Jest配置 */
    jest?: any;
    
    /** Webpack配置 */
    webpack?: any;
    
    /** Vite配置 */
    vite?: any;
  };
  
  /** 创建后指令 */
  postCreate?: Array<{
    /** 指令类型 */
    type: 'command' | 'script' | 'question';
    
    /** 指令内容 */
    content: string;
    
    /** 工作目录 */
    cwd?: string;
    
    /** 环境变量 */
    env?: Record<string, string>;
  }>;
}

/**
 * 项目配置
 */
export interface ProjectConfig {
  /** 项目名称 */
  name: string;
  
  /** 项目描述 */
  description?: string;
  
  /** 项目版本 */
  version: string;
  
  /** 作者 */
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  
  /** 许可证 */
  license?: string;
  
  /** 仓库信息 */
  repository?: {
    type: 'git';
    url: string;
  };
  
  /** 关键词 */
  keywords?: string[];
  
  /** 项目类型 */
  type: ProjectType;
  
  /** 使用的模板 */
  template: string;
  
  /** 项目路径 */
  projectPath: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 项目创建选项
 */
export interface ProjectCreationOptions {
  /** 项目名称 */
  name: string;
  
  /** 项目描述 */
  description?: string;
  
  /** 项目类型 */
  type: ProjectType;
  
  /** 项目路径（目录） */
  path: string;
  
  /** 使用的模板ID */
  templateId?: string;
  
  /** 作者信息 */
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  
  /** 许可证 */
  license?: string;
  
  /** 版本 */
  version?: string;
  
  /** 是否初始化Git仓库 */
  initGit?: boolean;
  
  /** 是否安装依赖 */
  installDependencies?: boolean;
  
  /** 包管理器 */
  packageManager?: 'npm' | 'yarn' | 'pnpm';
  
  /** 是否创建README */
  createReadme?: boolean;
  
  /** 是否创建LICENSE */
  createLicense?: boolean;
  
  /** 是否创建GitHub Actions工作流 */
  createGitHubActions?: boolean;
  
  /** 是否启用TypeScript */
  enableTypeScript?: boolean;
  
  /** 是否启用测试 */
  enableTesting?: boolean;
  
  /** 是否启用ESLint */
  enableEslint?: boolean;
  
  /** 是否启用Prettier */
  enablePrettier?: boolean;
  
  /** 仓库URL */
  repository?: string;
  
  /** 关键词 */
  keywords?: string[];
  
  /** 自定义配置 */
  customConfig?: Record<string, any>;
}

/**
 * 项目创建结果
 */
export interface ProjectCreationResult {
  /** 是否成功 */
  success: boolean;
  
  /** 项目配置 */
  config: ProjectConfig;
  
  /** 创建的文件 */
  createdFiles: string[];
  
  /** 安装的依赖 */
  installedDependencies: {
    dependencies: string[];
    devDependencies: string[];
  };
  
  /** 执行的命令 */
  executedCommands: Array<{
    command: string;
    success: boolean;
    output?: string;
    error?: string;
  }>;
  
  /** 性能指标 */
  performance: {
    /** 总时间（毫秒） */
    totalTime: number;
    
    /** 模板复制时间 */
    templateCopyTime: number;
    
    /** 依赖安装时间 */
    dependencyInstallTime: number;
    
    /** 配置生成时间 */
    configGenerationTime: number;
  };
  
  /** 错误信息 */
  error?: string;
  
  /** 建议 */
  suggestions: string[];
}

/**
 * 项目向导配置
 */
export interface ProjectWizardConfig {
  /** 模板目录 */
  templatesDir: string;
  
  /** 默认作者 */
  defaultAuthor?: {
    name: string;
    email?: string;
    url?: string;
  };
  
  /** 默认许可证 */
  defaultLicense: string;
  
  /** 默认版本 */
  defaultVersion: string;
  
  /** 包管理器 */
  packageManager: 'npm' | 'yarn' | 'pnpm';
  
  /** 是否自动初始化Git */
  autoInitGit: boolean;
  
  /** 是否自动安装依赖 */
  autoInstallDependencies: boolean;
  
  /** 性能监控配置 */
  performanceMonitoring: {
    enabled: boolean;
    interval: number;
  };
}

/**
 * 项目向导
 */
export class ProjectWizard {
  private config: ProjectWizardConfig;
  private codeGenerator: CodeGeneratorTool;
  private fileEditor: FileEditorTool;
  private codeAnalyzer: CodeAnalysisTool;
  private performanceMonitor?: PerformanceMonitor;
  private workspaceRoot: string;
  
  // 模板缓存
  private templates: Map<string, ProjectTemplate> = new Map();
  
  constructor(
    workspaceRoot: string,
    codeGenerator: CodeGeneratorTool,
    fileEditor: FileEditorTool,
    codeAnalyzer: CodeAnalysisTool,
    performanceMonitor?: PerformanceMonitor,
    config?: Partial<ProjectWizardConfig>
  ) {
    this.workspaceRoot = workspaceRoot;
    this.codeGenerator = codeGenerator;
    this.fileEditor = fileEditor;
    this.codeAnalyzer = codeAnalyzer;
    this.performanceMonitor = performanceMonitor;
    
    this.config = {
      templatesDir: path.join(workspaceRoot, 'project-templates'),
      defaultLicense: 'MIT',
      defaultVersion: '1.0.0',
      packageManager: 'npm',
      autoInitGit: true,
      autoInstallDependencies: true,
      performanceMonitoring: {
        enabled: true,
        interval: 5000,
      },
      ...config,
    };
    
    // 初始化模板
    this.initializeTemplates();
    
    console.log('🚀 Project Wizard initialized');
  }
  
  /**
   * 创建新项目
   */
  public async createProject(
    options: ProjectCreationOptions
  ): Promise<ProjectCreationResult> {
    const startTime = Date.now();
    const createdFiles: string[] = [];
    const executedCommands: Array<{
      command: string;
      success: boolean;
      output?: string;
      error?: string;
    }> = [];
    
    try {
      console.log(`🚀 Creating project: ${options.name}`);
      console.log(`   Type: ${options.type}, Path: ${options.path}`);
      
      // 验证选项
      this.validateOptions(options);
      
      // 确定模板
      const template = await this.getTemplate(options);
      
      // 创建项目目录
      const projectPath = path.resolve(options.path, options.name);
      if (fs.existsSync(projectPath)) {
        throw new Error(`Project directory already exists: ${projectPath}`);
      }
      
      fs.mkdirSync(projectPath, { recursive: true });
      createdFiles.push(projectPath);
      
      // 1. 复制模板文件
      const templateCopyStartTime = Date.now();
      await this.copyTemplateFiles(template, projectPath, options, createdFiles);
      const templateCopyTime = Date.now() - templateCopyStartTime;
      
      // 2. 生成配置文件
      const configGenerationStartTime = Date.now();
      const config = await this.generateProjectConfig(template, projectPath, options);
      const configGenerationTime = Date.now() - configGenerationStartTime;
      
      // 3. 安装依赖
      let dependencyInstallTime = 0;
      const installedDependencies = {
        dependencies: [] as string[],
        devDependencies: [] as string[],
      };
      
      if (options.installDependencies ?? this.config.autoInstallDependencies) {
        const dependencyInstallStartTime = Date.now();
        const installResult = await this.installDependencies(template, projectPath, options, executedCommands);
        dependencyInstallTime = Date.now() - dependencyInstallStartTime;
        installedDependencies.dependencies = installResult.dependencies;
        installedDependencies.devDependencies = installResult.devDependencies;
      }
      
      // 4. 初始化Git仓库
      if (options.initGit ?? this.config.autoInitGit) {
        await this.initGitRepository(projectPath, executedCommands);
      }
      
      // 5. 执行创建后指令
      await this.executePostCreateCommands(template, projectPath, options, executedCommands);
      
      const totalTime = Date.now() - startTime;
      
      const result: ProjectCreationResult = {
        success: true,
        config,
        createdFiles,
        installedDependencies,
        executedCommands,
        performance: {
          totalTime,
          templateCopyTime,
          dependencyInstallTime,
          configGenerationTime,
        },
        suggestions: this.generateSuggestions(options, template),
      };
      
      console.log(`✅ Project created successfully: ${options.name}`);
      console.log(`   Time: ${totalTime}ms, Files: ${createdFiles.length}, Dependencies: ${installedDependencies.dependencies.length + installedDependencies.devDependencies.length}`);
      
      // 记录性能指标
      if (this.performanceMonitor) {
        this.performanceMonitor.recordToolExecution('create_project', totalTime, true);
      }
      
      return result;
      
    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      
      console.error(`❌ Project creation failed: ${error.message}`);
      
      // 记录错误
      if (this.performanceMonitor) {
        this.performanceMonitor.recordError('project_creation', error.message);
      }
      
      return {
        success: false,
        config: this.createDefaultConfig(options),
        createdFiles,
        installedDependencies: {
          dependencies: [],
          devDependencies: [],
        },
        executedCommands,
        performance: {
          totalTime,
          templateCopyTime: 0,
          dependencyInstallTime: 0,
          configGenerationTime: 0,
        },
        error: error.message,
        suggestions: ['Check the error details and try again'],
      };
    }
  }
  
  /**
   * 列出可用模板
   */
  public listTemplates(filter?: { type?: ProjectType }): ProjectTemplate[] {
    let templates = Array.from(this.templates.values());
    
    if (filter?.type) {
      templates = templates.filter(t => t.type === filter.type);
    }
    
    return templates;
  }
  
  /**
   * 获取模板详情
   */
  public getTemplateDetails(templateId: string): ProjectTemplate | undefined {
    return this.templates.get(templateId);
  }
  
  /**
   * 添加自定义模板
   */
  public async addTemplate(template: ProjectTemplate): Promise<void> {
    // 验证模板
    this.validateTemplate(template);
    
    // 添加到缓存
    this.templates.set(template.id, template);
    
    // 保存到文件系统
    await this.saveTemplate(template);
    
    console.log(`✅ Template added: ${template.name} (${template.id})`);
  }
  
  /**
   * 删除模板
   */
  public async removeTemplate(templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    
    // 从缓存移除
    this.templates.delete(templateId);
    
    // 从文件系统删除
    await this.deleteTemplate(templateId);
    
    console.log(`🗑️  Template removed: ${templateId}`);
  }
  
  /**
   * 更新项目配置
   */
  public async updateProjectConfig(
    projectPath: string,
    updates: Partial<ProjectConfig>
  ): Promise<ProjectConfig> {
    const configPath = path.join(projectPath, 'project-wizard.json');
    
    let config: ProjectConfig;
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      throw new Error('Project configuration not found');
    }
    
    // 更新配置
    const updatedConfig = {
      ...config,
      ...updates,
      updatedAt: new Date(),
    };
    
    // 保存配置
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf8');
    
    // 更新package.json
    await this.updatePackageJson(projectPath, updatedConfig);
    
    console.log(`✅ Project config updated: ${projectPath}`);
    
    return updatedConfig;
  }
  
  /**
   * 验证项目结构
   */
  public async validateProjectStructure(projectPath: string): Promise<{
    valid: boolean;
    issues: Array<{
      type: 'missing_file' | 'invalid_file' | 'missing_dependency' | 'config_error';
      description: string;
      severity: 'low' | 'medium' | 'high';
      suggestedFix?: string;
    }>;
  }> {
    const issues: Array<{
      type: 'missing_file' | 'invalid_file' | 'missing_dependency' | 'config_error';
      description: string;
      severity: 'low' | 'medium' | 'high';
      suggestedFix?: string;
    }> = [];
    
    // 检查项目目录是否存在
    if (!fs.existsSync(projectPath)) {
      return {
        valid: false,
        issues: [{
          type: 'missing_file',
          description: `Project directory does not exist: ${projectPath}`,
          severity: 'high',
        }],
      };
    }
    
    // 检查package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      issues.push({
        type: 'missing_file',
        description: 'package.json not found',
        severity: 'high',
        suggestedFix: 'Create a package.json file',
      });
    } else {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // 检查必要字段
        if (!packageJson.name) {
          issues.push({
            type: 'config_error',
            description: 'package.json missing name field',
            severity: 'medium',
            suggestedFix: 'Add "name" field to package.json',
          });
        }
        
        if (!packageJson.version) {
          issues.push({
            type: 'config_error',
            description: 'package.json missing version field',
            severity: 'medium',
            suggestedFix: 'Add "version" field to package.json',
          });
        }
      } catch (error: any) {
        issues.push({
          type: 'invalid_file',
          description: `Invalid package.json: ${error.message}`,
          severity: 'high',
          suggestedFix: 'Fix JSON syntax in package.json',
        });
      }
    }
    
    // 检查README.md
    const readmePath = path.join(projectPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      issues.push({
        type: 'missing_file',
        description: 'README.md not found',
        severity: 'low',
        suggestedFix: 'Create a README.md file',
      });
    }
    
    // 检查项目配置
    const configPath = path.join(projectPath, 'project-wizard.json');
    if (!fs.existsSync(configPath)) {
      issues.push({
        type: 'missing_file',
        description: 'Project wizard configuration not found',
        severity: 'low',
        suggestedFix: 'Run project wizard to generate configuration',
      });
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }
  
  /**
   * 获取项目统计
   */
  public async getProjectStats(projectPath: string): Promise<{
    fileCount: number;
    lineCount: number;
    dependencyCount: number;
    lastModified: Date;
    size: number;
  }> {
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project path does not exist: ${projectPath}`);
    }
    
    let fileCount = 0;
    let lineCount = 0;
    let totalSize = 0;
    let lastModified = new Date(0);
    
    // 遍历项目文件
    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        // 忽略node_modules和.git目录
        if (file === 'node_modules' || file === '.git' || file.startsWith('.')) {
          continue;
        }
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          fileCount++;
          totalSize += stat.size;
          
          if (stat.mtime > lastModified) {
            lastModified = stat.mtime;
          }
          
          // 计算行数（文本文件）
          if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.json') || 
              file.endsWith('.md') || file.endsWith('.yml') || file.endsWith('.yaml')) {
            try {
              const content = fs.readFileSync(filePath, 'utf8');
              lineCount += content.split('\n').length;
            } catch {
              // 忽略二进制文件
            }
          }
        }
      }
    };
    
    walkDir(projectPath);
    
    // 计算依赖数量
    let dependencyCount = 0;
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        dependencyCount = 
          (packageJson.dependencies ? Object.keys(packageJson.dependencies).length : 0) +
          (packageJson.devDependencies ? Object.keys(packageJson.devDependencies).length : 0);
      } catch {
        // 忽略错误
      }
    }
    
    return {
      fileCount,
      lineCount,
      dependencyCount,
      lastModified,
      size: totalSize,
    };
  }
  
  // ==================== 私有方法 ====================
  
  /**
   * 初始化模板
   */
  private initializeTemplates(): void {
    // 创建模板目录
    if (!fs.existsSync(this.config.templatesDir)) {
      fs.mkdirSync(this.config.templatesDir, { recursive: true });
      console.log(`📁 Created templates directory: ${this.config.templatesDir}`);
    }
    
    // 加载内置模板
    this.loadBuiltinTemplates();
    
    // 加载自定义模板
    this.loadCustomTemplates();
  }
  
  /**
   * 加载内置模板
   */
  private loadBuiltinTemplates(): void {
    const builtinTemplates: ProjectTemplate[] = [
      // Node.js模板
      {
        id: 'nodejs-basic',
        name: 'Basic Node.js',
        description: 'Basic Node.js project with TypeScript support',
        type: 'nodejs',
        version: '1.0.0',
        files: [
          { source: 'package.json.template', target: 'package.json', isTemplate: true },
          { source: 'tsconfig.json', target: 'tsconfig.json' },
          { source: 'src/index.ts', target: 'src/index.ts' },
          { source: 'README.md.template', target: 'README.md', isTemplate: true },
        ],
        dependencies: {
          dependencies: {},
          devDependencies: {
            'typescript': '^5.0.0',
            '@types/node': '^20.0.0',
            'ts-node': '^10.9.0',
          },
        },
        scripts: {
          'start': 'ts-node src/index.ts',
          'build': 'tsc',
          'dev': 'ts-node-dev src/index.ts',
        },
      },
      
      // TypeScript库模板
      {
        id: 'typescript-library',
        name: 'TypeScript Library',
        description: 'TypeScript library with testing and linting',
        type: 'typescript',
        version: '1.0.0',
        files: [
          { source: 'package.json.template', target: 'package.json', isTemplate: true },
          { source: 'tsconfig.json', target: 'tsconfig.json' },
          { source: 'tsconfig.build.json', target: 'tsconfig.build.json' },
          { source: 'src/index.ts', target: 'src/index.ts' },
          { source: 'tests/index.test.ts', target: 'tests/index.test.ts' },
          { source: '.eslintrc.json', target: '.eslintrc.json' },
          { source: '.prettierrc', target: '.prettierrc' },
          { source: 'README.md.template', target: 'README.md', isTemplate: true },
        ],
        dependencies: {
          devDependencies: {
            'typescript': '^5.0.0',
            '@types/node': '^20.0.0',
            'jest': '^29.0.0',
            '@types/jest': '^29.0.0',
            'ts-jest': '^29.0.0',
            'eslint': '^8.0.0',
            '@typescript-eslint/eslint-plugin': '^6.0.0',
            '@typescript-eslint/parser': '^6.0.0',
            'prettier': '^3.0.0',
          },
        },
        scripts: {
          'build': 'tsc -p tsconfig.build.json',
          'test': 'jest',
          'lint': 'eslint src/**/*.ts',
          'format': 'prettier --write src/**/*.ts',
        },
      },
      
      // React应用模板
      {
        id: 'react-app',
        name: 'React Application',
        description: 'React application with Vite and TypeScript',
        type: 'react',
        version: '1.0.0',
        files: [
          { source: 'package.json.template', target: 'package.json', isTemplate: true },
          { source: 'vite.config.ts', target: 'vite.config.ts' },
          { source: 'tsconfig.json', target: 'tsconfig.json' },
          { source: 'src/main.tsx', target: 'src/main.tsx' },
          { source: 'src/App.tsx', target: 'src/App.tsx' },
          { source: 'src/index.css', target: 'src/index.css' },
          { source: 'public/vite.svg', target: 'public/vite.svg' },
          { source: 'README.md.template', target: 'README.md', isTemplate: true },
        ],
        dependencies: {
          dependencies: {
            'react': '^18.0.0',
            'react-dom': '^18.0.0',
          },
          devDependencies: {
            '@types/react': '^18.0.0',
            '@types/react-dom': '^18.0.0',
            '@vitejs/plugin-react': '^4.0.0',
            'typescript': '^5.0.0',
            'vite': '^4.0.0',
          },
        },
        scripts: {
          'dev': 'vite',
          'build': 'vite build',
          'preview': 'vite preview',
          'lint': 'eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
        },
      },
    ];
    
    // 添加内置模板
    builtinTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
    
    console.log(`📦 Loaded ${builtinTemplates.length} built-in templates`);
  }
  
  /**
   * 加载自定义模板
   */
  private loadCustomTemplates(): void {
    try {
      const templateFiles = fs.readdirSync(this.config.templatesDir)
        .filter(file => file.endsWith('.json'));
      
      for (const file of templateFiles) {
        try {
          const templatePath = path.join(this.config.templatesDir, file);
          const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
          this.templates.set(templateData.id, templateData);
        } catch (error: any) {
          console.error(`Failed to load template ${file}: ${error.message}`);
        }
      }
      
      console.log(`📂 Loaded ${templateFiles.length} custom templates`);
    } catch (error: any) {
      // 忽略错误（目录可能为空）
    }
  }
  
  /**
   * 保存模板
   */
  private async saveTemplate(template: ProjectTemplate): Promise<void> {
    const templatePath = path.join(this.config.templatesDir, `${template.id}.json`);
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2), 'utf8');
  }
  
  /**
   * 删除模板
   */
  private async deleteTemplate(templateId: string): Promise<void> {
    const templatePath = path.join(this.config.templatesDir, `${templateId}.json`);
    if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath);
    }
  }
  
  /**
   * 验证选项
   */
  private validateOptions(options: ProjectCreationOptions): void {
    if (!options.name) {
      throw new Error('Project name is required');
    }
    
    if (!options.name.match(/^[@a-z0-9][a-z0-9._-]*$/i)) {
      throw new Error('Invalid project name. Use only letters, numbers, dashes, underscores, and dots');
    }
    
    if (!options.type) {
      throw new Error('Project type is required');
    }
    
    if (!options.path) {
      throw new Error('Project path is required');
    }
    
    // 检查路径是否存在
    const parentDir = path.dirname(path.resolve(options.path));
    if (!fs.existsSync(parentDir)) {
      throw new Error(`Parent directory does not exist: ${parentDir}`);
    }
  }
  
  /**
   * 验证模板
   */
  private validateTemplate(template: ProjectTemplate): void {
    if (!template.id) {
      throw new Error('Template ID is required');
    }
    
    if (!template.name) {
      throw new Error('Template name is required');
    }
    
    if (!template.type) {
      throw new Error('Template type is required');
    }
    
    if (!template.files || template.files.length === 0) {
      throw new Error('Template must have at least one file');
    }
  }
  
  /**
   * 获取模板
   */
  private async getTemplate(options: ProjectCreationOptions): Promise<ProjectTemplate> {
    // 如果指定了模板ID，使用该模板
    if (options.templateId) {
      const template = this.templates.get(options.templateId);
      if (!template) {
        throw new Error(`Template not found: ${options.templateId}`);
      }
      return template;
    }
    
    // 否则根据项目类型查找模板
    const matchingTemplates = Array.from(this.templates.values())
      .filter(t => t.type === options.type);
    
    if (matchingTemplates.length === 0) {
      throw new Error(`No templates found for project type: ${options.type}`);
    }
    
    // 使用第一个匹配的模板
    return matchingTemplates[0];
  }
  
  /**
   * 复制模板文件
   */
  private async copyTemplateFiles(
    template: ProjectTemplate,
    projectPath: string,
    options: ProjectCreationOptions,
    createdFiles: string[]
  ): Promise<void> {
    console.log(`   Copying template files...`);
    
    // 创建项目目录结构
    for (const file of template.files) {
      const targetPath = path.join(projectPath, file.target);
      const targetDir = path.dirname(targetPath);
      
      // 创建目录
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        createdFiles.push(targetDir);
      }
      
      // 处理模板文件
      if (file.isTemplate) {
        await this.processTemplateFile(template, file, targetPath, options);
      } else if (template.templateDir) {
        // 从模板目录复制文件
        const sourcePath = path.join(template.templateDir, file.source);
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, targetPath);
        } else {
          // 创建默认文件内容
          await this.createDefaultFile(targetPath, file, options);
        }
      } else {
        // 创建默认文件内容
        await this.createDefaultFile(targetPath, file, options);
      }
      
      createdFiles.push(targetPath);
      
      // 设置文件权限
      if (file.permissions) {
        fs.chmodSync(targetPath, file.permissions);
      }
    }
  }
  
  /**
   * 处理模板文件
   */
  private async processTemplateFile(
    template: ProjectTemplate,
    file: ProjectTemplate['files'][0],
    targetPath: string,
    options: ProjectCreationOptions
  ): Promise<void> {
    let content = '';
    
    // 根据文件类型生成内容
    if (file.target === 'package.json') {
      content = this.generatePackageJson(template, options);
    } else if (file.target === 'README.md') {
      content = this.generateReadme(template, options);
    } else if (file.target === 'LICENSE') {
      content = this.generateLicense(options);
    } else {
      // 默认模板内容
      content = `# ${options.name}\n\nGenerated by Project Wizard\n`;
    }
    
    fs.writeFileSync(targetPath, content, 'utf8');
  }
  
  /**
   * 创建默认文件
   */
  private async createDefaultFile(
    targetPath: string,
    file: ProjectTemplate['files'][0],
    options: ProjectCreationOptions
  ): Promise<void> {
    const ext = path.extname(file.target);
    let content = '';
    
    switch (ext) {
      case '.ts':
        content = `// ${options.name}\n// Generated by Project Wizard\n\nexport function hello(): string {\n  return 'Hello, ${options.name}!'\n}\n`;
        break;
      case '.js':
        content = `// ${options.name}\n// Generated by Project Wizard\n\nfunction hello() {\n  return 'Hello, ${options.name}!'\n}\n\nmodule.exports = { hello };\n`;
        break;
      case '.json':
        content = '{\n  "name": "' + options.name + '"\n}\n';
        break;
      case '.md':
        content = `# ${options.name}\n\n${options.description || 'Project generated by Project Wizard'}\n`;
        break;
      default:
        content = `# ${options.name}\n\nGenerated by Project Wizard\n`;
    }
    
    fs.writeFileSync(targetPath, content, 'utf8');
  }
  
  /**
   * 生成package.json
   */
  private generatePackageJson(
    template: ProjectTemplate,
    options: ProjectCreationOptions
  ): string {
    const packageJson = {
      name: options.name,
      version: options.version || this.config.defaultVersion,
      description: options.description || `${options.name} project`,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: template.scripts || {},
      dependencies: template.dependencies.dependencies || {},
      devDependencies: template.dependencies.devDependencies || {},
      optionalDependencies: template.dependencies.optionalDependencies || {},
      peerDependencies: template.dependencies.peerDependencies || {},
      author: options.author || this.config.defaultAuthor,
      license: options.license || this.config.defaultLicense,
      repository: options.repository ? { type: 'git' as const, url: options.repository } : undefined,
      keywords: options.keywords,
      engines: {
        node: '>=16.0.0',
      },
      ...options.customConfig,
    };
    
    return JSON.stringify(packageJson, null, 2);
  }
  
  /**
   * 生成README
   */
  private generateReadme(
    template: ProjectTemplate,
    options: ProjectCreationOptions
  ): string {
    return `# ${options.name}

${options.description || `${options.name} project generated by Project Wizard`}

## Project Type
${template.name} (${template.type})

## Getting Started

### Installation
\`\`\`bash
cd ${options.name}
${this.config.packageManager} install
\`\`\`

### Development
\`\`\`bash
${this.config.packageManager} run dev
\`\`\`

### Build
\`\`\`bash
${this.config.packageManager} run build
\`\`\`

### Testing
\`\`\`bash
${this.config.packageManager} run test
\`\`\`

## Scripts

${Object.entries(template.scripts || {})
  .map(([name, script]) => `- \`${this.config.packageManager} run ${name}\`: ${script}`)
  .join('\n')}

## License

${options.license || this.config.defaultLicense}
`;
  }
  
  /**
   * 生成许可证
   */
  private generateLicense(options: ProjectCreationOptions): string {
    const year = new Date().getFullYear();
    const author = options.author?.name || 'Author';
    
    if (options.license === 'MIT') {
      return `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
    }
    
    // 默认返回空许可证
    return `${options.license || this.config.defaultLicense} License

Copyright (c) ${year} ${author}
`;
  }
  
  /**
   * 生成项目配置
   */
  private async generateProjectConfig(
    template: ProjectTemplate,
    projectPath: string,
    options: ProjectCreationOptions
  ): Promise<ProjectConfig> {
    const config: ProjectConfig = {
      name: options.name,
      description: options.description,
      version: options.version || this.config.defaultVersion,
      author: options.author,
      license: options.license || this.config.defaultLicense,
      repository: options.repository ? { type: 'git' as const, url: options.repository } : undefined,
      type: options.type,
      template: template.id,
      projectPath,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // 保存配置
    const configPath = path.join(projectPath, 'project-wizard.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    
    return config;
  }
  
  /**
   * 创建默认配置
   */
  private createDefaultConfig(options: ProjectCreationOptions): ProjectConfig {
    return {
      name: options.name,
      description: options.description,
      version: options.version || this.config.defaultVersion,
      author: options.author,
      license: options.license || this.config.defaultLicense,
      type: options.type,
      template: options.templateId || 'unknown',
      projectPath: path.resolve(options.path, options.name),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  /**
   * 安装依赖
   */
  private async installDependencies(
    template: ProjectTemplate,
    projectPath: string,
    options: ProjectCreationOptions,
    executedCommands: ProjectCreationResult['executedCommands']
  ): Promise<{ dependencies: string[]; devDependencies: string[] }> {
    console.log(`   Installing dependencies...`);
    
    const dependencies = Object.keys(template.dependencies.dependencies || {});
    const devDependencies = Object.keys(template.dependencies.devDependencies || {});
    
    const packageManager = options.packageManager || this.config.packageManager;
    
    try {
      // 安装生产依赖
      if (dependencies.length > 0) {
        const deps = Object.entries(template.dependencies.dependencies || {})
          .map(([name, version]) => `${name}@${version}`)
          .join(' ');
        
        const command = `${packageManager} install ${deps}`;
        const result = await this.executeCommand(command, projectPath);
        
        executedCommands.push({
          command,
          success: result.success,
          output: result.output,
          error: result.error,
        });
      }
      
      // 安装开发依赖
      if (devDependencies.length > 0) {
        const devDeps = Object.entries(template.dependencies.devDependencies || {})
          .map(([name, version]) => `${name}@${version}`)
          .join(' ');
        
        const command = `${packageManager} install --save-dev ${devDeps}`;
        const result = await this.executeCommand(command, projectPath);
        
        executedCommands.push({
          command,
          success: result.success,
          output: result.output,
          error: result.error,
        });
      }
      
      return { dependencies, devDependencies };
      
    } catch (error: any) {
      console.warn(`   Warning: Dependency installation failed: ${error.message}`);
      return { dependencies, devDependencies };
    }
  }
  
  /**
   * 初始化Git仓库
   */
  private async initGitRepository(
    projectPath: string,
    executedCommands: ProjectCreationResult['executedCommands']
  ): Promise<void> {
    console.log(`   Initializing Git repository...`);
    
    try {
      // 初始化Git
      const initResult = await this.executeCommand('git init', projectPath);
      executedCommands.push({
        command: 'git init',
        success: initResult.success,
        output: initResult.output,
        error: initResult.error,
      });
      
      // 创建.gitignore
      const gitignoreContent = `node_modules/
dist/
build/
coverage/
.env
.DS_Store
*.log
`;
      fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignoreContent, 'utf8');
      
      // 初始提交
      const addResult = await this.executeCommand('git add .', projectPath);
      executedCommands.push({
        command: 'git add .',
        success: addResult.success,
        output: addResult.output,
        error: addResult.error,
      });
      
      const commitResult = await this.executeCommand('git commit -m "Initial commit"', projectPath);
      executedCommands.push({
        command: 'git commit -m "Initial commit"',
        success: commitResult.success,
        output: commitResult.output,
        error: commitResult.error,
      });
      
    } catch (error: any) {
      console.warn(`   Warning: Git initialization failed: ${error.message}`);
    }
  }
  
  /**
   * 执行创建后指令
   */
  private async executePostCreateCommands(
    template: ProjectTemplate,
    projectPath: string,
    options: ProjectCreationOptions,
    executedCommands: ProjectCreationResult['executedCommands']
  ): Promise<void> {
    if (!template.postCreate || template.postCreate.length === 0) {
      return;
    }
    
    console.log(`   Executing post-create commands...`);
    
    for (const command of template.postCreate) {
      try {
        let result;
        
        if (command.type === 'command') {
          result = await this.executeCommand(command.content, command.cwd || projectPath, command.env);
        } else if (command.type === 'script') {
          // 执行脚本文件
          const scriptPath = path.join(projectPath, command.content);
          if (fs.existsSync(scriptPath)) {
            result = await this.executeCommand(`node ${scriptPath}`, command.cwd || projectPath, command.env);
          }
        }
        
        if (result) {
          executedCommands.push({
            command: command.content,
            success: result.success,
            output: result.output,
            error: result.error,
          });
        }
      } catch (error: any) {
        console.warn(`   Warning: Post-create command failed: ${error.message}`);
      }
    }
  }
  
  /**
   * 更新package.json
   */
  private async updatePackageJson(
    projectPath: string,
    config: ProjectConfig
  ): Promise<void> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return;
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // 更新字段
      packageJson.name = config.name;
      packageJson.description = config.description;
      packageJson.version = config.version;
      packageJson.author = config.author;
      packageJson.license = config.license;
      packageJson.repository = config.repository;
      packageJson.keywords = config.keywords;
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    } catch (error: any) {
      console.warn(`   Warning: Failed to update package.json: ${error.message}`);
    }
  }
  
  /**
   * 执行命令
   */
  private async executeCommand(
    command: string,
    cwd: string,
    env?: Record<string, string>
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    try {
      const result = await exec(command, {
        cwd,
        env: { ...process.env, ...env },
      });
      
      return {
        success: true,
        output: result.stdout,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        output: error.stdout,
      };
    }
  }
  
  /**
   * 生成建议
   */
  private generateSuggestions(
    options: ProjectCreationOptions,
    template: ProjectTemplate
  ): string[] {
    const suggestions: string[] = [];
    
    // 基于项目类型的建议
    switch (options.type) {
      case 'react':
      case 'vue':
      case 'angular':
        suggestions.push('Consider adding state management (Redux, Vuex, NgRx)');
        suggestions.push('Add routing for multi-page applications');
        suggestions.push('Configure build optimization for production');
        break;
      
      case 'nodejs':
      case 'express':
      case 'nestjs':
        suggestions.push('Add environment configuration management');
        suggestions.push('Set up logging and monitoring');
        suggestions.push('Configure database connection if needed');
        break;
      
      case 'cli':
        suggestions.push('Add command-line argument parsing (commander, yargs)');
        suggestions.push('Create proper help documentation');
        suggestions.push('Set up automated testing for CLI commands');
        break;
      
      case 'library':
        suggestions.push('Add comprehensive API documentation');
        suggestions.push('Set up automated publishing to npm');
        suggestions.push('Add example usage in README');
        break;
    }
    
    // 通用建议
    suggestions.push('Set up CI/CD pipeline for automated testing and deployment');
    suggestions.push('Add code quality tools (ESLint, Prettier, Husky)');
    suggestions.push('Create comprehensive test suite');
    suggestions.push('Set up error tracking and monitoring');
    
    return suggestions.slice(0, 5); // 限制为5条建议
  }
}

/**
 * 创建项目向导
 */
export function createProjectWizard(
  workspaceRoot: string,
  codeGenerator: CodeGeneratorTool,
  fileEditor: FileEditorTool,
  codeAnalyzer: CodeAnalysisTool,
  performanceMonitor?: PerformanceMonitor,
  config?: Partial<ProjectWizardConfig>
): ProjectWizard {
  return new ProjectWizard(
    workspaceRoot,
    codeGenerator,
    fileEditor,
    codeAnalyzer,
    performanceMonitor,
    config
  );
}

export default ProjectWizard;