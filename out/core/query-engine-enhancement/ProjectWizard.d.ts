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
import { CodeGeneratorTool } from './tools/CodeGeneratorTool';
import { FileEditorTool } from './tools/FileEditorTool';
import { CodeAnalysisTool } from './tools/CodeAnalysisTool';
import { PerformanceMonitor } from './PerformanceMonitor';
/**
 * 项目类型
 */
export type ProjectType = 'nodejs' | 'typescript' | 'react' | 'vue' | 'angular' | 'nextjs' | 'express' | 'nestjs' | 'cli' | 'library' | 'webcomponent' | 'mobile' | 'desktop';
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
export declare class ProjectWizard {
    private config;
    private codeGenerator;
    private fileEditor;
    private codeAnalyzer;
    private performanceMonitor?;
    private workspaceRoot;
    private templates;
    constructor(workspaceRoot: string, codeGenerator: CodeGeneratorTool, fileEditor: FileEditorTool, codeAnalyzer: CodeAnalysisTool, performanceMonitor?: PerformanceMonitor, config?: Partial<ProjectWizardConfig>);
    /**
     * 创建新项目
     */
    createProject(options: ProjectCreationOptions): Promise<ProjectCreationResult>;
    /**
     * 列出可用模板
     */
    listTemplates(filter?: {
        type?: ProjectType;
    }): ProjectTemplate[];
    /**
     * 获取模板详情
     */
    getTemplateDetails(templateId: string): ProjectTemplate | undefined;
    /**
     * 添加自定义模板
     */
    addTemplate(template: ProjectTemplate): Promise<void>;
    /**
     * 删除模板
     */
    removeTemplate(templateId: string): Promise<void>;
    /**
     * 更新项目配置
     */
    updateProjectConfig(projectPath: string, updates: Partial<ProjectConfig>): Promise<ProjectConfig>;
    /**
     * 验证项目结构
     */
    validateProjectStructure(projectPath: string): Promise<{
        valid: boolean;
        issues: Array<{
            type: 'missing_file' | 'invalid_file' | 'missing_dependency' | 'config_error';
            description: string;
            severity: 'low' | 'medium' | 'high';
            suggestedFix?: string;
        }>;
    }>;
    /**
     * 获取项目统计
     */
    getProjectStats(projectPath: string): Promise<{
        fileCount: number;
        lineCount: number;
        dependencyCount: number;
        lastModified: Date;
        size: number;
    }>;
    /**
     * 初始化模板
     */
    private initializeTemplates;
    /**
     * 加载内置模板
     */
    private loadBuiltinTemplates;
    /**
     * 加载自定义模板
     */
    private loadCustomTemplates;
    /**
     * 保存模板
     */
    private saveTemplate;
    /**
     * 删除模板
     */
    private deleteTemplate;
    /**
     * 验证选项
     */
    private validateOptions;
    /**
     * 验证模板
     */
    private validateTemplate;
    /**
     * 获取模板
     */
    private getTemplate;
    /**
     * 复制模板文件
     */
    private copyTemplateFiles;
    /**
     * 处理模板文件
     */
    private processTemplateFile;
    /**
     * 创建默认文件
     */
    private createDefaultFile;
    /**
     * 生成package.json
     */
    private generatePackageJson;
    /**
     * 生成README
     */
    private generateReadme;
    /**
     * 生成许可证
     */
    private generateLicense;
    /**
     * 生成项目配置
     */
    private generateProjectConfig;
    /**
     * 创建默认配置
     */
    private createDefaultConfig;
    /**
     * 安装依赖
     */
    private installDependencies;
    /**
     * 初始化Git仓库
     */
    private initGitRepository;
    /**
     * 执行创建后指令
     */
    private executePostCreateCommands;
    /**
     * 更新package.json
     */
    private updatePackageJson;
    /**
     * 执行命令
     */
    private executeCommand;
    /**
     * 生成建议
     */
    private generateSuggestions;
}
/**
 * 创建项目向导
 */
export declare function createProjectWizard(workspaceRoot: string, codeGenerator: CodeGeneratorTool, fileEditor: FileEditorTool, codeAnalyzer: CodeAnalysisTool, performanceMonitor?: PerformanceMonitor, config?: Partial<ProjectWizardConfig>): ProjectWizard;
export default ProjectWizard;
//# sourceMappingURL=ProjectWizard.d.ts.map