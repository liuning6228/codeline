"use strict";
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
exports.ProjectWizard = void 0;
exports.createProjectWizard = createProjectWizard;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process = __importStar(require("child_process"));
const util_1 = require("util");
const exec = (0, util_1.promisify)(child_process.exec);
/**
 * 项目向导
 */
class ProjectWizard {
    config;
    codeGenerator;
    fileEditor;
    codeAnalyzer;
    performanceMonitor;
    workspaceRoot;
    // 模板缓存
    templates = new Map();
    constructor(workspaceRoot, codeGenerator, fileEditor, codeAnalyzer, performanceMonitor, config) {
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
    async createProject(options) {
        const startTime = Date.now();
        const createdFiles = [];
        const executedCommands = [];
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
                dependencies: [],
                devDependencies: [],
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
            const result = {
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
        }
        catch (error) {
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
    listTemplates(filter) {
        let templates = Array.from(this.templates.values());
        if (filter?.type) {
            templates = templates.filter(t => t.type === filter.type);
        }
        return templates;
    }
    /**
     * 获取模板详情
     */
    getTemplateDetails(templateId) {
        return this.templates.get(templateId);
    }
    /**
     * 添加自定义模板
     */
    async addTemplate(template) {
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
    async removeTemplate(templateId) {
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
    async updateProjectConfig(projectPath, updates) {
        const configPath = path.join(projectPath, 'project-wizard.json');
        let config;
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        else {
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
    async validateProjectStructure(projectPath) {
        const issues = [];
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
        }
        else {
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
            }
            catch (error) {
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
    async getProjectStats(projectPath) {
        if (!fs.existsSync(projectPath)) {
            throw new Error(`Project path does not exist: ${projectPath}`);
        }
        let fileCount = 0;
        let lineCount = 0;
        let totalSize = 0;
        let lastModified = new Date(0);
        // 遍历项目文件
        const walkDir = (dir) => {
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
                }
                else {
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
                        }
                        catch {
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
            }
            catch {
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
    initializeTemplates() {
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
    loadBuiltinTemplates() {
        const builtinTemplates = [
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
    loadCustomTemplates() {
        try {
            const templateFiles = fs.readdirSync(this.config.templatesDir)
                .filter(file => file.endsWith('.json'));
            for (const file of templateFiles) {
                try {
                    const templatePath = path.join(this.config.templatesDir, file);
                    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
                    this.templates.set(templateData.id, templateData);
                }
                catch (error) {
                    console.error(`Failed to load template ${file}: ${error.message}`);
                }
            }
            console.log(`📂 Loaded ${templateFiles.length} custom templates`);
        }
        catch (error) {
            // 忽略错误（目录可能为空）
        }
    }
    /**
     * 保存模板
     */
    async saveTemplate(template) {
        const templatePath = path.join(this.config.templatesDir, `${template.id}.json`);
        fs.writeFileSync(templatePath, JSON.stringify(template, null, 2), 'utf8');
    }
    /**
     * 删除模板
     */
    async deleteTemplate(templateId) {
        const templatePath = path.join(this.config.templatesDir, `${templateId}.json`);
        if (fs.existsSync(templatePath)) {
            fs.unlinkSync(templatePath);
        }
    }
    /**
     * 验证选项
     */
    validateOptions(options) {
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
    validateTemplate(template) {
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
    async getTemplate(options) {
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
    async copyTemplateFiles(template, projectPath, options, createdFiles) {
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
            }
            else if (template.templateDir) {
                // 从模板目录复制文件
                const sourcePath = path.join(template.templateDir, file.source);
                if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, targetPath);
                }
                else {
                    // 创建默认文件内容
                    await this.createDefaultFile(targetPath, file, options);
                }
            }
            else {
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
    async processTemplateFile(template, file, targetPath, options) {
        let content = '';
        // 根据文件类型生成内容
        if (file.target === 'package.json') {
            content = this.generatePackageJson(template, options);
        }
        else if (file.target === 'README.md') {
            content = this.generateReadme(template, options);
        }
        else if (file.target === 'LICENSE') {
            content = this.generateLicense(options);
        }
        else {
            // 默认模板内容
            content = `# ${options.name}\n\nGenerated by Project Wizard\n`;
        }
        fs.writeFileSync(targetPath, content, 'utf8');
    }
    /**
     * 创建默认文件
     */
    async createDefaultFile(targetPath, file, options) {
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
    generatePackageJson(template, options) {
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
            repository: options.repository ? { type: 'git', url: options.repository } : undefined,
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
    generateReadme(template, options) {
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
    generateLicense(options) {
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
    async generateProjectConfig(template, projectPath, options) {
        const config = {
            name: options.name,
            description: options.description,
            version: options.version || this.config.defaultVersion,
            author: options.author,
            license: options.license || this.config.defaultLicense,
            repository: options.repository ? { type: 'git', url: options.repository } : undefined,
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
    createDefaultConfig(options) {
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
    async installDependencies(template, projectPath, options, executedCommands) {
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
        }
        catch (error) {
            console.warn(`   Warning: Dependency installation failed: ${error.message}`);
            return { dependencies, devDependencies };
        }
    }
    /**
     * 初始化Git仓库
     */
    async initGitRepository(projectPath, executedCommands) {
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
        }
        catch (error) {
            console.warn(`   Warning: Git initialization failed: ${error.message}`);
        }
    }
    /**
     * 执行创建后指令
     */
    async executePostCreateCommands(template, projectPath, options, executedCommands) {
        if (!template.postCreate || template.postCreate.length === 0) {
            return;
        }
        console.log(`   Executing post-create commands...`);
        for (const command of template.postCreate) {
            try {
                let result;
                if (command.type === 'command') {
                    result = await this.executeCommand(command.content, command.cwd || projectPath, command.env);
                }
                else if (command.type === 'script') {
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
            }
            catch (error) {
                console.warn(`   Warning: Post-create command failed: ${error.message}`);
            }
        }
    }
    /**
     * 更新package.json
     */
    async updatePackageJson(projectPath, config) {
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
        }
        catch (error) {
            console.warn(`   Warning: Failed to update package.json: ${error.message}`);
        }
    }
    /**
     * 执行命令
     */
    async executeCommand(command, cwd, env) {
        try {
            const result = await exec(command, {
                cwd,
                env: { ...process.env, ...env },
            });
            return {
                success: true,
                output: result.stdout,
            };
        }
        catch (error) {
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
    generateSuggestions(options, template) {
        const suggestions = [];
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
exports.ProjectWizard = ProjectWizard;
/**
 * 创建项目向导
 */
function createProjectWizard(workspaceRoot, codeGenerator, fileEditor, codeAnalyzer, performanceMonitor, config) {
    return new ProjectWizard(workspaceRoot, codeGenerator, fileEditor, codeAnalyzer, performanceMonitor, config);
}
exports.default = ProjectWizard;
//# sourceMappingURL=ProjectWizard.js.map