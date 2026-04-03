"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedProjectAnalyzer = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var projectAnalyzer_1 = require("./projectAnalyzer");
/**
 * 增强的项目分析器
 * 扩展原有ProjectAnalyzer，添加更深入的分析功能
 */
var EnhancedProjectAnalyzer = /** @class */ (function (_super) {
    __extends(EnhancedProjectAnalyzer, _super);
    function EnhancedProjectAnalyzer() {
        var _this = _super.call(this) || this;
        _this.workspaceRoot = '';
        return _this;
    }
    /**
     * 分析当前工作区（覆盖父类方法，保持兼容性）
     */
    EnhancedProjectAnalyzer.prototype.analyzeCurrentWorkspace = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 调用父类方法保持兼容
                return [2 /*return*/, _super.prototype.analyzeCurrentWorkspace.call(this)];
            });
        });
    };
    /**
     * 分析当前工作区，返回增强的上下文信息
     */
    EnhancedProjectAnalyzer.prototype.analyzeEnhancedWorkspace = function (focusedFile) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, workspaceFolders, _a, baseContext, dependencyGraph, moduleRelations, codeQuality, architecturePatterns, relevantContext, analysisTime, enhancedContext, error_1, baseContext;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders || workspaceFolders.length === 0) {
                            return [2 /*return*/, this.getDefaultEnhancedContext()];
                        }
                        this.workspaceRoot = workspaceFolders[0].uri.fsPath;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, Promise.all([
                                _super.prototype.analyzeCurrentWorkspace.call(this),
                                this.analyzeDependencyGraph(),
                                this.analyzeModuleRelations(),
                                this.analyzeCodeQuality(),
                                this.detectArchitecturePatterns(),
                                this.collectRelevantContext(focusedFile)
                            ])];
                    case 2:
                        _a = _b.sent(), baseContext = _a[0], dependencyGraph = _a[1], moduleRelations = _a[2], codeQuality = _a[3], architecturePatterns = _a[4], relevantContext = _a[5];
                        analysisTime = Date.now() - startTime;
                        enhancedContext = __assign(__assign({}, baseContext), { dependencyGraph: dependencyGraph, moduleRelations: moduleRelations, codeQuality: codeQuality, architecturePatterns: architecturePatterns, relevantContext: relevantContext, analysisMetadata: {
                                analysisTime: analysisTime,
                                filesAnalyzed: baseContext.files.length,
                                depth: this.determineAnalysisDepth(baseContext),
                                timestamp: new Date().toISOString()
                            } });
                        return [2 /*return*/, enhancedContext];
                    case 3:
                        error_1 = _b.sent();
                        console.error('Enhanced project analysis failed:', error_1);
                        return [4 /*yield*/, _super.prototype.analyzeCurrentWorkspace.call(this)];
                    case 4:
                        baseContext = _b.sent();
                        return [2 /*return*/, __assign(__assign({}, baseContext), { analysisMetadata: {
                                    analysisTime: Date.now() - startTime,
                                    filesAnalyzed: baseContext.files.length,
                                    depth: 'shallow',
                                    timestamp: new Date().toISOString()
                                } })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 分析依赖关系图
     */
    EnhancedProjectAnalyzer.prototype.analyzeDependencyGraph = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nodes, edges, circularDependencies, packageJsonPath, packageJson, projectName, projectVersion;
            return __generator(this, function (_a) {
                nodes = [];
                edges = [];
                circularDependencies = [];
                try {
                    packageJsonPath = path.join(this.workspaceRoot, 'package.json');
                    if (fs.existsSync(packageJsonPath)) {
                        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                        // 添加外部依赖
                        if (packageJson.dependencies) {
                            Object.entries(packageJson.dependencies).forEach(function (_a) {
                                var name = _a[0], version = _a[1];
                                nodes.push({
                                    id: "external:".concat(name),
                                    name: name,
                                    version: version,
                                    type: 'external',
                                    description: "External dependency: ".concat(name)
                                });
                            });
                        }
                        // 添加开发依赖
                        if (packageJson.devDependencies) {
                            Object.entries(packageJson.devDependencies).forEach(function (_a) {
                                var name = _a[0], version = _a[1];
                                nodes.push({
                                    id: "dev:".concat(name),
                                    name: name,
                                    version: version,
                                    type: 'dev',
                                    description: "Development dependency: ".concat(name)
                                });
                            });
                        }
                        projectName = packageJson.name || 'project';
                        projectVersion = packageJson.version || '1.0.0';
                        nodes.push({
                            id: 'project',
                            name: projectName,
                            version: projectVersion,
                            type: 'internal',
                            description: 'Current project'
                        });
                        // 创建依赖边
                        if (packageJson.dependencies) {
                            Object.keys(packageJson.dependencies).forEach(function (depName) {
                                edges.push({
                                    source: 'project',
                                    target: "external:".concat(depName),
                                    type: 'depends'
                                });
                            });
                        }
                        if (packageJson.devDependencies) {
                            Object.keys(packageJson.devDependencies).forEach(function (depName) {
                                edges.push({
                                    source: 'project',
                                    target: "dev:".concat(depName),
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
                return [2 /*return*/, {
                        nodes: nodes,
                        edges: edges,
                        circularDependencies: circularDependencies
                    }];
            });
        });
    };
    /**
     * 分析模块关系（导入/导出）
     */
    EnhancedProjectAnalyzer.prototype.analyzeModuleRelations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var relations, codeFiles, _i, _a, file, filePath, content, importRegexes, lineNumber, _b, _c, line, _d, importRegexes_1, regex, match, importPath, resolvedPath, error_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        relations = [];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.collectCodeFiles(this.workspaceRoot)];
                    case 2:
                        codeFiles = _e.sent();
                        // 分析每个文件的导入关系
                        for (_i = 0, _a = codeFiles.slice(0, 50); _i < _a.length; _i++) { // 限制分析前50个文件
                            file = _a[_i];
                            filePath = path.join(this.workspaceRoot, file);
                            content = fs.readFileSync(filePath, 'utf8');
                            importRegexes = [
                                /import\s+.*?\s+from\s+['"](.+?)['"]/g, // ES6 import
                                /require\(['"](.+?)['"]\)/g, // CommonJS require
                                /export\s+.*?\s+from\s+['"](.+?)['"]/g // ES6 export from
                            ];
                            lineNumber = 0;
                            for (_b = 0, _c = content.split('\n'); _b < _c.length; _b++) {
                                line = _c[_b];
                                lineNumber++;
                                for (_d = 0, importRegexes_1 = importRegexes; _d < importRegexes_1.length; _d++) {
                                    regex = importRegexes_1[_d];
                                    match = void 0;
                                    while ((match = regex.exec(line)) !== null) {
                                        importPath = match[1];
                                        resolvedPath = this.resolveImportPath(file, importPath);
                                        if (resolvedPath) {
                                            relations.push({
                                                sourceFile: file,
                                                targetFile: resolvedPath,
                                                importType: regex.source.includes('export') ? 'export' : 'import',
                                                lineNumber: lineNumber
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _e.sent();
                        console.error('Module relations analysis failed:', error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, relations];
                }
            });
        });
    };
    /**
     * 解析导入路径为项目相对路径
     */
    EnhancedProjectAnalyzer.prototype.resolveImportPath = function (sourceFile, importPath) {
        // 处理相对路径
        if (importPath.startsWith('.')) {
            var sourceDir = path.dirname(sourceFile);
            var resolved = path.join(sourceDir, importPath);
            // 尝试添加扩展名
            var extensions = ['.js', '.ts', '.jsx', '.tsx', '.json', ''];
            for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
                var ext = extensions_1[_i];
                var candidate = resolved + ext;
                var fullPath = path.join(this.workspaceRoot, candidate);
                if (fs.existsSync(fullPath)) {
                    return candidate;
                }
                // 尝试目录下的index文件
                var indexCandidate = path.join(resolved, "index".concat(ext));
                var indexFullPath = path.join(this.workspaceRoot, indexCandidate);
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
    };
    /**
     * 分析代码质量
     */
    EnhancedProjectAnalyzer.prototype.analyzeCodeQuality = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, issues, suggestions, codeFiles, totalFiles, totalLines, totalComplexity, _i, _a, file, filePath, content, lines, lineCount, complexity, _b, error_3, overallScore;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        metrics = {
                            linesOfCode: 0,
                            complexity: 0,
                            maintainabilityIndex: 0,
                            duplicationRate: 0
                        };
                        issues = [];
                        suggestions = [];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.collectCodeFiles(this.workspaceRoot)];
                    case 2:
                        codeFiles = _c.sent();
                        totalFiles = 0;
                        totalLines = 0;
                        totalComplexity = 0;
                        for (_i = 0, _a = codeFiles.slice(0, 30); _i < _a.length; _i++) { // 限制分析前30个文件
                            file = _a[_i];
                            filePath = path.join(this.workspaceRoot, file);
                            content = fs.readFileSync(filePath, 'utf8');
                            lines = content.split('\n');
                            lineCount = lines.length;
                            totalLines += lineCount;
                            totalFiles++;
                            complexity = this.estimateComplexity(content);
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
                        _b = metrics;
                        return [4 /*yield*/, this.estimateDuplicationRate(codeFiles)];
                    case 3:
                        _b.duplicationRate = _c.sent();
                        // 根据指标添加额外建议
                        if (metrics.complexity > 10) {
                            suggestions.push({
                                type: 'simplify',
                                description: "\u9879\u76EE\u5E73\u5747\u590D\u6742\u5EA6\u8F83\u9AD8 (".concat(metrics.complexity.toFixed(2), ")\uFF0C\u5EFA\u8BAE\u91CD\u6784\u590D\u6742\u51FD\u6570"),
                                file: 'multiple',
                                confidence: 0.7,
                                estimatedEffort: 'medium'
                            });
                        }
                        if (metrics.duplicationRate > 0.2) {
                            suggestions.push({
                                type: 'remove-duplicate',
                                description: "\u4EE3\u7801\u91CD\u590D\u7387\u8F83\u9AD8 (".concat((metrics.duplicationRate * 100).toFixed(1), "%)\uFF0C\u5EFA\u8BAE\u63D0\u53D6\u516C\u5171\u4EE3\u7801"),
                                file: 'multiple',
                                confidence: 0.8,
                                estimatedEffort: 'medium'
                            });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _c.sent();
                        console.error('Code quality analysis failed:', error_3);
                        return [3 /*break*/, 5];
                    case 5:
                        overallScore = this.calculateOverallScore(metrics, issues);
                        return [2 /*return*/, {
                                metrics: metrics,
                                issues: issues,
                                suggestions: suggestions,
                                overallScore: overallScore
                            }];
                }
            });
        });
    };
    /**
     * 估计代码复杂度
     */
    EnhancedProjectAnalyzer.prototype.estimateComplexity = function (content) {
        var complexity = 1; // 基础复杂度
        // 启发式规则
        var controlFlowKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try'];
        var operators = ['&&', '||', '?', '?:'];
        for (var _i = 0, controlFlowKeywords_1 = controlFlowKeywords; _i < controlFlowKeywords_1.length; _i++) {
            var keyword = controlFlowKeywords_1[_i];
            var regex = new RegExp("\\b".concat(keyword, "\\b"), 'g');
            var matches = content.match(regex);
            if (matches) {
                complexity += matches.length * 0.5;
            }
        }
        for (var _a = 0, operators_1 = operators; _a < operators_1.length; _a++) {
            var op = operators_1[_a];
            var regex = new RegExp("\\".concat(op), 'g');
            var matches = content.match(regex);
            if (matches) {
                complexity += matches.length * 0.3;
            }
        }
        // 函数数量（简单估算）
        var functionMatches = content.match(/(function|=>|class)\s+\w+|\w+\s*\([^)]*\)\s*{/g);
        if (functionMatches) {
            complexity += functionMatches.length * 0.8;
        }
        return Math.max(1, complexity);
    };
    /**
     * 检测代码问题
     */
    EnhancedProjectAnalyzer.prototype.detectCodeIssues = function (file, content, issues) {
        var lines = content.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var lineNumber = i + 1;
            // 长行检测
            if (line.length > 120) {
                issues.push({
                    type: 'warning',
                    category: 'style',
                    message: '行过长（建议不超过120字符）',
                    file: file,
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
    };
    /**
     * 生成重构建议
     */
    EnhancedProjectAnalyzer.prototype.generateRefactoringSuggestions = function (file, content, suggestions) {
        // 检测长函数
        var lines = content.split('\n');
        var inFunction = false;
        var functionStart = 0;
        var braceCount = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
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
                    var functionLength = i - functionStart + 1;
                    if (functionLength > 30) {
                        suggestions.push({
                            type: 'extract-method',
                            description: "\u51FD\u6570\u8FC7\u957F\uFF08".concat(functionLength, "\u884C\uFF09\uFF0C\u5EFA\u8BAE\u63D0\u53D6\u5B50\u51FD\u6570"),
                            file: file,
                            lines: [functionStart + 1, i + 1],
                            confidence: 0.6,
                            estimatedEffort: 'low'
                        });
                    }
                    inFunction = false;
                }
            }
        }
    };
    /**
     * 估计重复率（简化的基于行的重复检测）
     */
    EnhancedProjectAnalyzer.prototype.estimateDuplicationRate = function (codeFiles) {
        return __awaiter(this, void 0, void 0, function () {
            var sampleFiles, fileContents, _i, sampleFiles_1, file, content, cleaned, duplicateLines, totalLines, _a, fileContents_1, content, lines, i, sequence, _b, fileContents_2, otherContent;
            return __generator(this, function (_c) {
                if (codeFiles.length < 2)
                    return [2 /*return*/, 0];
                sampleFiles = codeFiles.slice(0, Math.min(10, codeFiles.length));
                fileContents = [];
                for (_i = 0, sampleFiles_1 = sampleFiles; _i < sampleFiles_1.length; _i++) {
                    file = sampleFiles_1[_i];
                    try {
                        content = fs.readFileSync(path.join(this.workspaceRoot, file), 'utf8');
                        cleaned = content
                            .replace(/\/\/.*$/gm, '') // 移除单行注释
                            .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
                            .replace(/\s+/g, ' ') // 合并空格
                            .trim();
                        fileContents.push(cleaned);
                    }
                    catch (error) {
                        console.error("Error reading file ".concat(file, ":"), error);
                    }
                }
                duplicateLines = 0;
                totalLines = 0;
                for (_a = 0, fileContents_1 = fileContents; _a < fileContents_1.length; _a++) {
                    content = fileContents_1[_a];
                    lines = content.split(' ');
                    totalLines += lines.length;
                    // 简化的重复检测：查找超过10个词的重复序列
                    for (i = 0; i < lines.length - 10; i++) {
                        sequence = lines.slice(i, i + 10).join(' ');
                        for (_b = 0, fileContents_2 = fileContents; _b < fileContents_2.length; _b++) {
                            otherContent = fileContents_2[_b];
                            if (otherContent !== content && otherContent.includes(sequence)) {
                                duplicateLines += 10;
                                break;
                            }
                        }
                    }
                }
                return [2 /*return*/, totalLines > 0 ? duplicateLines / totalLines : 0];
            });
        });
    };
    /**
     * 计算可维护性指数
     */
    EnhancedProjectAnalyzer.prototype.calculateMaintainabilityIndex = function (loc, complexity) {
        // 简化的可维护性指数计算
        var maxScore = 100;
        var locPenalty = Math.min(loc / 1000, 1) * 30; // LOC惩罚
        var complexityPenalty = Math.min(complexity / 20, 1) * 40; // 复杂度惩罚
        return Math.max(0, maxScore - locPenalty - complexityPenalty);
    };
    /**
     * 计算总体质量分数
     */
    EnhancedProjectAnalyzer.prototype.calculateOverallScore = function (metrics, issues) {
        var score = 100;
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
        var highSeverityIssues = issues.filter(function (issue) { return issue.severity === 'high'; });
        var mediumSeverityIssues = issues.filter(function (issue) { return issue.severity === 'medium'; });
        score -= highSeverityIssues.length * 5;
        score -= mediumSeverityIssues.length * 2;
        // 基于可维护性指数的调整
        score = (score + metrics.maintainabilityIndex) / 2;
        return Math.max(0, Math.min(100, score));
    };
    /**
     * 检测架构模式
     */
    EnhancedProjectAnalyzer.prototype.detectArchitecturePatterns = function () {
        return __awaiter(this, void 0, void 0, function () {
            var patterns, hasModels, hasViews, hasControllers, _a, _b, _c, _d, layers, hasMicroserviceIndicators, error_4;
            var _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        patterns = [];
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 11, , 12]);
                        return [4 /*yield*/, this.hasDirectoryOrFiles(['models', 'entities', 'domain'])];
                    case 2:
                        hasModels = _g.sent();
                        return [4 /*yield*/, this.hasDirectoryOrFiles(['views', 'components', 'ui'])];
                    case 3:
                        hasViews = _g.sent();
                        return [4 /*yield*/, this.hasDirectoryOrFiles(['controllers', 'handlers', 'services'])];
                    case 4:
                        hasControllers = _g.sent();
                        if (!(hasModels && hasViews && hasControllers)) return [3 /*break*/, 6];
                        _b = (_a = patterns).push;
                        _e = {
                            name: 'MVC (Model-View-Controller)',
                            confidence: 0.8,
                            evidence: ['检测到models、views、controllers目录结构']
                        };
                        return [4 /*yield*/, this.getFilesInDirectories(['models', 'views', 'controllers'])];
                    case 5:
                        _b.apply(_a, [(_e.filesInvolved = _g.sent(),
                                _e)]);
                        return [3 /*break*/, 8];
                    case 6:
                        if (!(hasModels && hasControllers)) return [3 /*break*/, 8];
                        _d = (_c = patterns).push;
                        _f = {
                            name: 'Service Layer',
                            confidence: 0.6,
                            evidence: ['检测到models和controllers/services目录']
                        };
                        return [4 /*yield*/, this.getFilesInDirectories(['models', 'controllers', 'services'])];
                    case 7:
                        _d.apply(_c, [(_f.filesInvolved = _g.sent(),
                                _f)]);
                        _g.label = 8;
                    case 8: return [4 /*yield*/, this.detectLayeredArchitecture()];
                    case 9:
                        layers = _g.sent();
                        if (layers.length >= 2) {
                            patterns.push({
                                name: 'Layered Architecture',
                                confidence: 0.7,
                                evidence: ["\u68C0\u6D4B\u5230".concat(layers.length, "\u4E2A\u6E05\u6670\u7684\u5206\u5C42")],
                                filesInvolved: []
                            });
                        }
                        return [4 /*yield*/, this.checkMicroserviceIndicators()];
                    case 10:
                        hasMicroserviceIndicators = _g.sent();
                        if (hasMicroserviceIndicators) {
                            patterns.push({
                                name: 'Microservice Indicators',
                                confidence: 0.5,
                                evidence: ['检测到微服务架构特征（多个独立服务目录）'],
                                filesInvolved: []
                            });
                        }
                        return [3 /*break*/, 12];
                    case 11:
                        error_4 = _g.sent();
                        console.error('Architecture pattern detection failed:', error_4);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/, patterns];
                }
            });
        });
    };
    /**
     * 检测分层架构
     */
    EnhancedProjectAnalyzer.prototype.detectLayeredArchitecture = function () {
        return __awaiter(this, void 0, void 0, function () {
            var layers, commonLayers, _i, commonLayers_1, layer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        layers = [];
                        commonLayers = ['presentation', 'application', 'domain', 'infrastructure', 'data'];
                        _i = 0, commonLayers_1 = commonLayers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < commonLayers_1.length)) return [3 /*break*/, 4];
                        layer = commonLayers_1[_i];
                        return [4 /*yield*/, this.hasDirectoryOrFiles([layer])];
                    case 2:
                        if (_a.sent()) {
                            layers.push(layer);
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, layers];
                }
            });
        });
    };
    /**
     * 检查微服务指标
     */
    EnhancedProjectAnalyzer.prototype.checkMicroserviceIndicators = function () {
        return __awaiter(this, void 0, void 0, function () {
            var items, serviceCount, _i, items_1, item, dirName, serviceDir, serviceItems;
            return __generator(this, function (_a) {
                items = fs.readdirSync(this.workspaceRoot, { withFileTypes: true });
                serviceCount = 0;
                for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                    item = items_1[_i];
                    if (item.isDirectory()) {
                        dirName = item.name.toLowerCase();
                        if (dirName.includes('service') || dirName.includes('api') || dirName.includes('microservice')) {
                            serviceDir = path.join(this.workspaceRoot, item.name);
                            serviceItems = fs.readdirSync(serviceDir);
                            if (serviceItems.some(function (name) { return name.includes('package.json') || name.includes('Dockerfile'); })) {
                                serviceCount++;
                            }
                        }
                    }
                }
                return [2 /*return*/, serviceCount >= 2];
            });
        });
    };
    /**
     * 收集相关上下文
     */
    EnhancedProjectAnalyzer.prototype.collectRelevantContext = function (focusedFile) {
        return __awaiter(this, void 0, void 0, function () {
            var relatedFiles, recentChanges, activeComponents, baseName, dirName, allFiles_2, _i, allFiles_1, file, relevanceScore, relationType, allFiles, filesWithStats, _a, _b, file, fileName, componentName, error_5;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        relatedFiles = [];
                        recentChanges = [];
                        activeComponents = [];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        if (!focusedFile) return [3 /*break*/, 3];
                        baseName = path.basename(focusedFile);
                        dirName = path.dirname(focusedFile);
                        return [4 /*yield*/, this.collectCodeFiles(this.workspaceRoot)];
                    case 2:
                        allFiles_2 = _c.sent();
                        for (_i = 0, allFiles_1 = allFiles_2; _i < allFiles_1.length; _i++) {
                            file = allFiles_1[_i];
                            relevanceScore = 0;
                            relationType = 'similar-code';
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
                                    relationType: relationType
                                });
                            }
                        }
                        // 排序并限制数量
                        relatedFiles.sort(function (a, b) { return b.relevanceScore - a.relevanceScore; });
                        _c.label = 3;
                    case 3: return [4 /*yield*/, this.collectCodeFiles(this.workspaceRoot)];
                    case 4:
                        allFiles = _c.sent();
                        return [4 /*yield*/, Promise.all(allFiles.slice(0, 20).map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                                var fullPath, stats;
                                return __generator(this, function (_a) {
                                    fullPath = path.join(this.workspaceRoot, file);
                                    stats = fs.statSync(fullPath);
                                    return [2 /*return*/, { file: file, mtime: stats.mtime }];
                                });
                            }); }))];
                    case 5:
                        filesWithStats = _c.sent();
                        // 按修改时间排序，取最近修改的
                        filesWithStats.sort(function (a, b) { return b.mtime.getTime() - a.mtime.getTime(); });
                        recentChanges.push.apply(recentChanges, filesWithStats.slice(0, 5).map(function (item) { return item.file; }));
                        // 检测活跃组件（基于命名约定）
                        for (_a = 0, _b = allFiles.slice(0, 20); _a < _b.length; _a++) {
                            file = _b[_a];
                            fileName = path.basename(file);
                            if (fileName.match(/^[A-Z][a-zA-Z]*\.(js|jsx|ts|tsx)$/)) {
                                componentName = fileName.replace(/\.[^/.]+$/, '');
                                activeComponents.push(componentName);
                            }
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_5 = _c.sent();
                        console.error('Relevant context collection failed:', error_5);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, {
                            focusedFile: focusedFile,
                            relatedFiles: relatedFiles.slice(0, 10), // 限制数量
                            recentChanges: recentChanges,
                            activeComponents: activeComponents
                        }];
                }
            });
        });
    };
    /**
     * 收集代码文件
     */
    EnhancedProjectAnalyzer.prototype.collectCodeFiles = function (rootPath) {
        return __awaiter(this, void 0, void 0, function () {
            var relevantExtensions, files, collect;
            return __generator(this, function (_a) {
                relevantExtensions = ['.js', '.ts', '.jsx', '.tsx', '.java', '.py', '.go', '.rs', '.cpp', '.c'];
                files = [];
                collect = function (dir) {
                    try {
                        var items = fs.readdirSync(dir);
                        for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
                            var item = items_2[_i];
                            var fullPath = path.join(dir, item);
                            var stat = fs.statSync(fullPath);
                            if (stat.isDirectory()) {
                                if (!['node_modules', '.git', 'dist', 'build', 'target', '.next', '.nuxt'].includes(item)) {
                                    collect(fullPath);
                                }
                            }
                            else {
                                var ext = path.extname(item);
                                if (relevantExtensions.includes(ext)) {
                                    var relativePath = path.relative(rootPath, fullPath);
                                    files.push(relativePath);
                                }
                            }
                        }
                    }
                    catch (error) {
                        console.error("Error collecting files from ".concat(dir, ":"), error);
                    }
                };
                collect(rootPath);
                return [2 /*return*/, files];
            });
        });
    };
    /**
     * 检查是否存在指定目录或文件
     */
    EnhancedProjectAnalyzer.prototype.hasDirectoryOrFiles = function (names) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, names_1, name_1, fullPath;
            return __generator(this, function (_a) {
                for (_i = 0, names_1 = names; _i < names_1.length; _i++) {
                    name_1 = names_1[_i];
                    fullPath = path.join(this.workspaceRoot, name_1);
                    if (fs.existsSync(fullPath)) {
                        return [2 /*return*/, true];
                    }
                }
                return [2 /*return*/, false];
            });
        });
    };
    /**
     * 获取目录中的文件列表
     */
    EnhancedProjectAnalyzer.prototype.getFilesInDirectories = function (dirs) {
        return __awaiter(this, void 0, void 0, function () {
            var files, _i, dirs_1, dir, fullPath, items, _a, items_3, item, itemPath;
            return __generator(this, function (_b) {
                files = [];
                for (_i = 0, dirs_1 = dirs; _i < dirs_1.length; _i++) {
                    dir = dirs_1[_i];
                    fullPath = path.join(this.workspaceRoot, dir);
                    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
                        items = fs.readdirSync(fullPath);
                        for (_a = 0, items_3 = items; _a < items_3.length; _a++) {
                            item = items_3[_a];
                            itemPath = path.join(fullPath, item);
                            if (!fs.statSync(itemPath).isDirectory()) {
                                files.push(path.join(dir, item));
                            }
                        }
                    }
                }
                return [2 /*return*/, files];
            });
        });
    };
    /**
     * 确定分析深度
     */
    EnhancedProjectAnalyzer.prototype.determineAnalysisDepth = function (context) {
        var fileCount = context.files.length;
        if (fileCount > 100)
            return 'medium';
        if (fileCount > 20)
            return 'medium';
        return 'shallow';
    };
    /**
     * 获取默认的增强上下文
     */
    EnhancedProjectAnalyzer.prototype.getDefaultEnhancedContext = function () {
        var baseContext = {
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
        return __assign(__assign({}, baseContext), { analysisMetadata: {
                analysisTime: 0,
                filesAnalyzed: 0,
                depth: 'shallow',
                timestamp: new Date().toISOString()
            } });
    };
    return EnhancedProjectAnalyzer;
}(projectAnalyzer_1.ProjectAnalyzer));
exports.EnhancedProjectAnalyzer = EnhancedProjectAnalyzer;
