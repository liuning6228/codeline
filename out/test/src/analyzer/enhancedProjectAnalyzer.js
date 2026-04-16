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
exports.EnhancedProjectAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const projectAnalyzer_1 = require("./projectAnalyzer");
/**
 * 增强的项目分析器
 * 扩展原有ProjectAnalyzer，添加更深入的分析功能
 */
class EnhancedProjectAnalyzer extends projectAnalyzer_1.ProjectAnalyzer {
    workspaceRoot = '';
    constructor() {
        super();
    }
    /**
     * 分析当前工作区（覆盖父类方法，保持兼容性）
     */
    async analyzeCurrentWorkspace() {
        // 调用父类方法保持兼容
        return super.analyzeCurrentWorkspace();
    }
    /**
     * 分析当前工作区，返回增强的上下文信息
     */
    async analyzeEnhancedWorkspace(focusedFile) {
        const startTime = Date.now();
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return this.getDefaultEnhancedContext();
        }
        this.workspaceRoot = workspaceFolders[0].uri.fsPath;
        try {
            // 并行执行基础分析和增强分析
            const [baseContext, dependencyGraph, moduleRelations, codeQuality, architecturePatterns, relevantContext] = await Promise.all([
                super.analyzeCurrentWorkspace(),
                this.analyzeDependencyGraph(),
                this.analyzeModuleRelations(),
                this.analyzeCodeQuality(),
                this.detectArchitecturePatterns(),
                this.collectRelevantContext(focusedFile)
            ]);
            const analysisTime = Date.now() - startTime;
            // 构建增强的上下文
            const enhancedContext = {
                ...baseContext,
                dependencyGraph,
                moduleRelations,
                codeQuality,
                architecturePatterns,
                relevantContext,
                analysisMetadata: {
                    analysisTime,
                    filesAnalyzed: baseContext.files.length,
                    depth: this.determineAnalysisDepth(baseContext),
                    timestamp: new Date().toISOString()
                }
            };
            return enhancedContext;
        }
        catch (error) {
            console.error('Enhanced project analysis failed:', error);
            // 回退到基础分析
            const baseContext = await super.analyzeCurrentWorkspace();
            return {
                ...baseContext,
                analysisMetadata: {
                    analysisTime: Date.now() - startTime,
                    filesAnalyzed: baseContext.files.length,
                    depth: 'shallow',
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
    /**
     * 分析依赖关系图
     */
    async analyzeDependencyGraph() {
        const nodes = [];
        const edges = [];
        const circularDependencies = [];
        try {
            // 分析package.json (Node.js项目)
            const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                // 添加外部依赖
                if (packageJson.dependencies) {
                    Object.entries(packageJson.dependencies).forEach(([name, version]) => {
                        nodes.push({
                            id: `external:${name}`,
                            name,
                            version: version,
                            type: 'external',
                            description: `External dependency: ${name}`
                        });
                    });
                }
                // 添加开发依赖
                if (packageJson.devDependencies) {
                    Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
                        nodes.push({
                            id: `dev:${name}`,
                            name,
                            version: version,
                            type: 'dev',
                            description: `Development dependency: ${name}`
                        });
                    });
                }
                // 添加项目本身
                const projectName = packageJson.name || 'project';
                const projectVersion = packageJson.version || '1.0.0';
                nodes.push({
                    id: 'project',
                    name: projectName,
                    version: projectVersion,
                    type: 'internal',
                    description: 'Current project'
                });
                // 创建依赖边
                if (packageJson.dependencies) {
                    Object.keys(packageJson.dependencies).forEach(depName => {
                        edges.push({
                            source: 'project',
                            target: `external:${depName}`,
                            type: 'depends'
                        });
                    });
                }
                if (packageJson.devDependencies) {
                    Object.keys(packageJson.devDependencies).forEach(depName => {
                        edges.push({
                            source: 'project',
                            target: `dev:${depName}`,
                            type: 'dev-depends'
                        });
                    });
                }
            }
            // 简单检测循环依赖（启发式）
            // 这里可以实现更复杂的循环依赖检测算法
        }
        catch (error) {
            console.error('Dependency graph analysis failed:', error);
        }
        return {
            nodes,
            edges,
            circularDependencies
        };
    }
    /**
     * 分析模块关系（导入/导出）
     */
    async analyzeModuleRelations() {
        const relations = [];
        try {
            // 收集所有代码文件
            const codeFiles = await this.collectCodeFiles(this.workspaceRoot);
            // 分析每个文件的导入关系
            for (const file of codeFiles.slice(0, 50)) { // 限制分析前50个文件
                const filePath = path.join(this.workspaceRoot, file);
                const content = fs.readFileSync(filePath, 'utf8');
                // 简单正则匹配导入语句
                const importRegexes = [
                    /import\s+.*?\s+from\s+['"](.+?)['"]/g, // ES6 import
                    /require\(['"](.+?)['"]\)/g, // CommonJS require
                    /export\s+.*?\s+from\s+['"](.+?)['"]/g // ES6 export from
                ];
                let lineNumber = 0;
                for (const line of content.split('\n')) {
                    lineNumber++;
                    for (const regex of importRegexes) {
                        let match;
                        while ((match = regex.exec(line)) !== null) {
                            const importPath = match[1];
                            // 解析相对路径
                            const resolvedPath = this.resolveImportPath(file, importPath);
                            if (resolvedPath) {
                                relations.push({
                                    sourceFile: file,
                                    targetFile: resolvedPath,
                                    importType: regex.source.includes('export') ? 'export' : 'import',
                                    lineNumber
                                });
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Module relations analysis failed:', error);
        }
        return relations;
    }
    /**
     * 解析导入路径为项目相对路径
     */
    resolveImportPath(sourceFile, importPath) {
        // 处理相对路径
        if (importPath.startsWith('.')) {
            const sourceDir = path.dirname(sourceFile);
            const resolved = path.join(sourceDir, importPath);
            // 尝试添加扩展名
            const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json', ''];
            for (const ext of extensions) {
                const candidate = resolved + ext;
                const fullPath = path.join(this.workspaceRoot, candidate);
                if (fs.existsSync(fullPath)) {
                    return candidate;
                }
                // 尝试目录下的index文件
                const indexCandidate = path.join(resolved, `index${ext}`);
                const indexFullPath = path.join(this.workspaceRoot, indexCandidate);
                if (fs.existsSync(indexFullPath)) {
                    return indexCandidate;
                }
            }
        }
        // 处理node_modules路径（简单跳过）
        if (importPath.startsWith('@') || !importPath.startsWith('.')) {
            return null; // 外部模块，不追踪
        }
        return null;
    }
    /**
     * 分析代码质量
     */
    async analyzeCodeQuality() {
        const metrics = {
            linesOfCode: 0,
            complexity: 0,
            maintainabilityIndex: 0,
            duplicationRate: 0
        };
        const issues = [];
        const suggestions = [];
        try {
            // 收集所有代码文件
            const codeFiles = await this.collectCodeFiles(this.workspaceRoot);
            // 分析代码度量
            let totalFiles = 0;
            let totalLines = 0;
            let totalComplexity = 0;
            for (const file of codeFiles.slice(0, 30)) { // 限制分析前30个文件
                const filePath = path.join(this.workspaceRoot, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                const lineCount = lines.length;
                totalLines += lineCount;
                totalFiles++;
                // 简单复杂度估算（基于行数和结构）
                const complexity = this.estimateComplexity(content);
                totalComplexity += complexity;
                // 检测常见问题
                this.detectCodeIssues(file, content, issues);
                // 生成重构建议
                this.generateRefactoringSuggestions(file, content, suggestions);
            }
            // 计算指标
            metrics.linesOfCode = totalLines;
            metrics.complexity = totalFiles > 0 ? totalComplexity / totalFiles : 0;
            metrics.maintainabilityIndex = this.calculateMaintainabilityIndex(totalLines, metrics.complexity);
            metrics.duplicationRate = await this.estimateDuplicationRate(codeFiles);
            // 根据指标添加额外建议
            if (metrics.complexity > 10) {
                suggestions.push({
                    type: 'simplify',
                    description: `项目平均复杂度较高 (${metrics.complexity.toFixed(2)})，建议重构复杂函数`,
                    file: 'multiple',
                    confidence: 0.7,
                    estimatedEffort: 'medium'
                });
            }
            if (metrics.duplicationRate > 0.2) {
                suggestions.push({
                    type: 'remove-duplicate',
                    description: `代码重复率较高 (${(metrics.duplicationRate * 100).toFixed(1)}%)，建议提取公共代码`,
                    file: 'multiple',
                    confidence: 0.8,
                    estimatedEffort: 'medium'
                });
            }
        }
        catch (error) {
            console.error('Code quality analysis failed:', error);
        }
        // 计算总体分数
        const overallScore = this.calculateOverallScore(metrics, issues);
        return {
            metrics,
            issues,
            suggestions,
            overallScore
        };
    }
    /**
     * 估计代码复杂度
     */
    estimateComplexity(content) {
        let complexity = 1; // 基础复杂度
        // 启发式规则
        const controlFlowKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try'];
        const operators = ['&&', '||', '?', '?:'];
        for (const keyword of controlFlowKeywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const matches = content.match(regex);
            if (matches) {
                complexity += matches.length * 0.5;
            }
        }
        for (const op of operators) {
            const regex = new RegExp(`\\${op}`, 'g');
            const matches = content.match(regex);
            if (matches) {
                complexity += matches.length * 0.3;
            }
        }
        // 函数数量（简单估算）
        const functionMatches = content.match(/(function|=>|class)\s+\w+|\w+\s*\([^)]*\)\s*{/g);
        if (functionMatches) {
            complexity += functionMatches.length * 0.8;
        }
        return Math.max(1, complexity);
    }
    /**
     * 检测代码问题
     */
    detectCodeIssues(file, content, issues) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            // 长行检测
            if (line.length > 120) {
                issues.push({
                    type: 'warning',
                    category: 'style',
                    message: '行过长（建议不超过120字符）',
                    file,
                    line: lineNumber,
                    severity: 'low'
                });
            }
            // TODO: 添加更多检测规则
            // - 未使用的变量
            // - 魔法数字
            // - 复杂的嵌套
            // - 重复代码模式
        }
    }
    /**
     * 生成重构建议
     */
    generateRefactoringSuggestions(file, content, suggestions) {
        // 检测长函数
        const lines = content.split('\n');
        let inFunction = false;
        let functionStart = 0;
        let braceCount = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // 简单的函数检测
            if (line.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|class\s+\w+/)) {
                inFunction = true;
                functionStart = i;
                braceCount = 0;
            }
            if (inFunction) {
                braceCount += (line.match(/{/g) || []).length;
                braceCount -= (line.match(/}/g) || []).length;
                // 函数结束
                if (braceCount <= 0 && line.includes('}')) {
                    const functionLength = i - functionStart + 1;
                    if (functionLength > 30) {
                        suggestions.push({
                            type: 'extract-method',
                            description: `函数过长（${functionLength}行），建议提取子函数`,
                            file,
                            lines: [functionStart + 1, i + 1],
                            confidence: 0.6,
                            estimatedEffort: 'low'
                        });
                    }
                    inFunction = false;
                }
            }
        }
    }
    /**
     * 估计重复率（简化的基于行的重复检测）
     */
    async estimateDuplicationRate(codeFiles) {
        if (codeFiles.length < 2)
            return 0;
        const sampleFiles = codeFiles.slice(0, Math.min(10, codeFiles.length));
        const fileContents = [];
        for (const file of sampleFiles) {
            try {
                const content = fs.readFileSync(path.join(this.workspaceRoot, file), 'utf8');
                // 清理内容，移除空格和注释以进行简单比较
                const cleaned = content
                    .replace(/\/\/.*$/gm, '') // 移除单行注释
                    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
                    .replace(/\s+/g, ' ') // 合并空格
                    .trim();
                fileContents.push(cleaned);
            }
            catch (error) {
                console.error(`Error reading file ${file}:`, error);
            }
        }
        // 简单相似性检测（基于子字符串）
        let duplicateLines = 0;
        let totalLines = 0;
        for (const content of fileContents) {
            const lines = content.split(' ');
            totalLines += lines.length;
            // 简化的重复检测：查找超过10个词的重复序列
            for (let i = 0; i < lines.length - 10; i++) {
                const sequence = lines.slice(i, i + 10).join(' ');
                for (const otherContent of fileContents) {
                    if (otherContent !== content && otherContent.includes(sequence)) {
                        duplicateLines += 10;
                        break;
                    }
                }
            }
        }
        return totalLines > 0 ? duplicateLines / totalLines : 0;
    }
    /**
     * 计算可维护性指数
     */
    calculateMaintainabilityIndex(loc, complexity) {
        // 简化的可维护性指数计算
        const maxScore = 100;
        const locPenalty = Math.min(loc / 1000, 1) * 30; // LOC惩罚
        const complexityPenalty = Math.min(complexity / 20, 1) * 40; // 复杂度惩罚
        return Math.max(0, maxScore - locPenalty - complexityPenalty);
    }
    /**
     * 计算总体质量分数
     */
    calculateOverallScore(metrics, issues) {
        let score = 100;
        // 基于度量的惩罚
        if (metrics.complexity > 15)
            score -= 20;
        else if (metrics.complexity > 10)
            score -= 10;
        else if (metrics.complexity > 5)
            score -= 5;
        if (metrics.duplicationRate > 0.3)
            score -= 25;
        else if (metrics.duplicationRate > 0.2)
            score -= 15;
        else if (metrics.duplicationRate > 0.1)
            score -= 5;
        // 基于问题的惩罚
        const highSeverityIssues = issues.filter(issue => issue.severity === 'high');
        const mediumSeverityIssues = issues.filter(issue => issue.severity === 'medium');
        score -= highSeverityIssues.length * 5;
        score -= mediumSeverityIssues.length * 2;
        // 基于可维护性指数的调整
        score = (score + metrics.maintainabilityIndex) / 2;
        return Math.max(0, Math.min(100, score));
    }
    /**
     * 检测架构模式
     */
    async detectArchitecturePatterns() {
        const patterns = [];
        try {
            // 检测MVC模式
            const hasModels = await this.hasDirectoryOrFiles(['models', 'entities', 'domain']);
            const hasViews = await this.hasDirectoryOrFiles(['views', 'components', 'ui']);
            const hasControllers = await this.hasDirectoryOrFiles(['controllers', 'handlers', 'services']);
            if (hasModels && hasViews && hasControllers) {
                patterns.push({
                    name: 'MVC (Model-View-Controller)',
                    confidence: 0.8,
                    evidence: ['检测到models、views、controllers目录结构'],
                    filesInvolved: await this.getFilesInDirectories(['models', 'views', 'controllers'])
                });
            }
            else if (hasModels && hasControllers) {
                patterns.push({
                    name: 'Service Layer',
                    confidence: 0.6,
                    evidence: ['检测到models和controllers/services目录'],
                    filesInvolved: await this.getFilesInDirectories(['models', 'controllers', 'services'])
                });
            }
            // 检测分层架构
            const layers = await this.detectLayeredArchitecture();
            if (layers.length >= 2) {
                patterns.push({
                    name: 'Layered Architecture',
                    confidence: 0.7,
                    evidence: [`检测到${layers.length}个清晰的分层`],
                    filesInvolved: []
                });
            }
            // 检测微服务特征
            const hasMicroserviceIndicators = await this.checkMicroserviceIndicators();
            if (hasMicroserviceIndicators) {
                patterns.push({
                    name: 'Microservice Indicators',
                    confidence: 0.5,
                    evidence: ['检测到微服务架构特征（多个独立服务目录）'],
                    filesInvolved: []
                });
            }
        }
        catch (error) {
            console.error('Architecture pattern detection failed:', error);
        }
        return patterns;
    }
    /**
     * 检测分层架构
     */
    async detectLayeredArchitecture() {
        const layers = [];
        const commonLayers = ['presentation', 'application', 'domain', 'infrastructure', 'data'];
        for (const layer of commonLayers) {
            if (await this.hasDirectoryOrFiles([layer])) {
                layers.push(layer);
            }
        }
        return layers;
    }
    /**
     * 检查微服务指标
     */
    async checkMicroserviceIndicators() {
        const items = fs.readdirSync(this.workspaceRoot, { withFileTypes: true });
        // 查找类似服务的目录
        let serviceCount = 0;
        for (const item of items) {
            if (item.isDirectory()) {
                const dirName = item.name.toLowerCase();
                if (dirName.includes('service') || dirName.includes('api') || dirName.includes('microservice')) {
                    // 检查目录内是否有独立的配置文件
                    const serviceDir = path.join(this.workspaceRoot, item.name);
                    const serviceItems = fs.readdirSync(serviceDir);
                    if (serviceItems.some(name => name.includes('package.json') || name.includes('Dockerfile'))) {
                        serviceCount++;
                    }
                }
            }
        }
        return serviceCount >= 2;
    }
    /**
     * 收集相关上下文
     */
    async collectRelevantContext(focusedFile) {
        const relatedFiles = [];
        const recentChanges = [];
        const activeComponents = [];
        try {
            // 如果有焦点文件，查找相关文件
            if (focusedFile) {
                const baseName = path.basename(focusedFile);
                const dirName = path.dirname(focusedFile);
                // 查找相关文件（相同目录、相似名称等）
                const allFiles = await this.collectCodeFiles(this.workspaceRoot);
                for (const file of allFiles) {
                    let relevanceScore = 0;
                    let relationType = 'similar-code';
                    // 相同目录
                    if (path.dirname(file) === dirName) {
                        relevanceScore += 0.3;
                        relationType = 'same-module';
                    }
                    // 相似文件名
                    if (path.basename(file).includes(baseName.replace(/\.[^/.]+$/, ''))) {
                        relevanceScore += 0.4;
                    }
                    // 导入关系（需要模块关系分析）
                    // 这里简化处理
                    if (relevanceScore > 0) {
                        relatedFiles.push({
                            path: file,
                            relevanceScore: Math.min(1, relevanceScore),
                            relationType
                        });
                    }
                }
                // 排序并限制数量
                relatedFiles.sort((a, b) => b.relevanceScore - a.relevanceScore);
            }
            // 检测活跃组件（基于文件修改时间）
            const allFiles = await this.collectCodeFiles(this.workspaceRoot);
            const filesWithStats = await Promise.all(allFiles.slice(0, 20).map(async (file) => {
                const fullPath = path.join(this.workspaceRoot, file);
                const stats = fs.statSync(fullPath);
                return { file, mtime: stats.mtime };
            }));
            // 按修改时间排序，取最近修改的
            filesWithStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
            recentChanges.push(...filesWithStats.slice(0, 5).map(item => item.file));
            // 检测活跃组件（基于命名约定）
            for (const file of allFiles.slice(0, 20)) {
                const fileName = path.basename(file);
                if (fileName.match(/^[A-Z][a-zA-Z]*\.(js|jsx|ts|tsx)$/)) {
                    const componentName = fileName.replace(/\.[^/.]+$/, '');
                    activeComponents.push(componentName);
                }
            }
        }
        catch (error) {
            console.error('Relevant context collection failed:', error);
        }
        return {
            focusedFile,
            relatedFiles: relatedFiles.slice(0, 10), // 限制数量
            recentChanges,
            activeComponents
        };
    }
    /**
     * 收集代码文件
     */
    async collectCodeFiles(rootPath) {
        const relevantExtensions = ['.js', '.ts', '.jsx', '.tsx', '.java', '.py', '.go', '.rs', '.cpp', '.c'];
        const files = [];
        const collect = (dir) => {
            try {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        if (!['node_modules', '.git', 'dist', 'build', 'target', '.next', '.nuxt'].includes(item)) {
                            collect(fullPath);
                        }
                    }
                    else {
                        const ext = path.extname(item);
                        if (relevantExtensions.includes(ext)) {
                            const relativePath = path.relative(rootPath, fullPath);
                            files.push(relativePath);
                        }
                    }
                }
            }
            catch (error) {
                console.error(`Error collecting files from ${dir}:`, error);
            }
        };
        collect(rootPath);
        return files;
    }
    /**
     * 检查是否存在指定目录或文件
     */
    async hasDirectoryOrFiles(names) {
        for (const name of names) {
            const fullPath = path.join(this.workspaceRoot, name);
            if (fs.existsSync(fullPath)) {
                return true;
            }
        }
        return false;
    }
    /**
     * 获取目录中的文件列表
     */
    async getFilesInDirectories(dirs) {
        const files = [];
        for (const dir of dirs) {
            const fullPath = path.join(this.workspaceRoot, dir);
            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
                const items = fs.readdirSync(fullPath);
                for (const item of items) {
                    const itemPath = path.join(fullPath, item);
                    if (!fs.statSync(itemPath).isDirectory()) {
                        files.push(path.join(dir, item));
                    }
                }
            }
        }
        return files;
    }
    /**
     * 确定分析深度
     */
    determineAnalysisDepth(context) {
        const fileCount = context.files.length;
        if (fileCount > 100)
            return 'medium';
        if (fileCount > 20)
            return 'medium';
        return 'shallow';
    }
    /**
     * 获取默认的增强上下文
     */
    getDefaultEnhancedContext() {
        const baseContext = {
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
        return {
            ...baseContext,
            analysisMetadata: {
                analysisTime: 0,
                filesAnalyzed: 0,
                depth: 'shallow',
                timestamp: new Date().toISOString()
            }
        };
    }
}
exports.EnhancedProjectAnalyzer = EnhancedProjectAnalyzer;
//# sourceMappingURL=enhancedProjectAnalyzer.js.map