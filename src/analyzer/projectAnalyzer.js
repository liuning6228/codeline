"use strict";
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
exports.ProjectAnalyzer = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var ProjectAnalyzer = /** @class */ (function () {
    function ProjectAnalyzer() {
    }
    ProjectAnalyzer.prototype.analyzeCurrentWorkspace = function () {
        return __awaiter(this, void 0, void 0, function () {
            var workspaceFolders, rootPath;
            return __generator(this, function (_a) {
                workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders || workspaceFolders.length === 0) {
                    return [2 /*return*/, this.getDefaultContext()];
                }
                rootPath = workspaceFolders[0].uri.fsPath;
                return [2 /*return*/, this.analyzeDirectory(rootPath)];
            });
        });
    };
    ProjectAnalyzer.prototype.analyzeDirectory = function (rootPath) {
        return __awaiter(this, void 0, void 0, function () {
            var projectType, language, framework, files, dependencies, codeStyle, architecture;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.detectProjectType(rootPath)];
                    case 1:
                        projectType = _a.sent();
                        return [4 /*yield*/, this.detectLanguage(rootPath)];
                    case 2:
                        language = _a.sent();
                        return [4 /*yield*/, this.detectFramework(rootPath)];
                    case 3:
                        framework = _a.sent();
                        return [4 /*yield*/, this.collectRelevantFiles(rootPath)];
                    case 4:
                        files = _a.sent();
                        return [4 /*yield*/, this.extractDependencies(rootPath)];
                    case 5:
                        dependencies = _a.sent();
                        return [4 /*yield*/, this.analyzeCodeStyle(rootPath)];
                    case 6:
                        codeStyle = _a.sent();
                        return [4 /*yield*/, this.detectArchitecture(rootPath)];
                    case 7:
                        architecture = _a.sent();
                        return [2 /*return*/, {
                                projectType: projectType,
                                language: language,
                                framework: framework,
                                rootPath: rootPath,
                                files: files,
                                dependencies: dependencies,
                                codeStyle: codeStyle,
                                architecture: architecture
                            }];
                }
            });
        });
    };
    ProjectAnalyzer.prototype.detectProjectType = function (rootPath) {
        return __awaiter(this, void 0, void 0, function () {
            var files, packageJson;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                files = fs.readdirSync(rootPath);
                if (files.includes('package.json')) {
                    packageJson = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8'));
                    if (((_a = packageJson.dependencies) === null || _a === void 0 ? void 0 : _a['react']) || ((_b = packageJson.devDependencies) === null || _b === void 0 ? void 0 : _b['react'])) {
                        return [2 /*return*/, 'react'];
                    }
                    if (((_c = packageJson.dependencies) === null || _c === void 0 ? void 0 : _c['vue']) || ((_d = packageJson.devDependencies) === null || _d === void 0 ? void 0 : _d['vue'])) {
                        return [2 /*return*/, 'vue'];
                    }
                    return [2 /*return*/, 'node'];
                }
                if (files.includes('pom.xml') || files.includes('build.gradle')) {
                    return [2 /*return*/, 'java'];
                }
                if (files.includes('requirements.txt') || files.includes('setup.py')) {
                    return [2 /*return*/, 'python'];
                }
                if (files.includes('go.mod')) {
                    return [2 /*return*/, 'go'];
                }
                return [2 /*return*/, 'unknown'];
            });
        });
    };
    ProjectAnalyzer.prototype.detectLanguage = function (rootPath) {
        return __awaiter(this, void 0, void 0, function () {
            var projectType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.detectProjectType(rootPath)];
                    case 1:
                        projectType = _a.sent();
                        switch (projectType) {
                            case 'react':
                            case 'vue':
                            case 'node':
                                return [2 /*return*/, 'javascript/typescript'];
                            case 'java':
                                return [2 /*return*/, 'java'];
                            case 'python':
                                return [2 /*return*/, 'python'];
                            case 'go':
                                return [2 /*return*/, 'go'];
                            default:
                                return [2 /*return*/, 'unknown'];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ProjectAnalyzer.prototype.detectFramework = function (rootPath) {
        return __awaiter(this, void 0, void 0, function () {
            var projectType, pomContent, packageJsonPath, packageJson;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.detectProjectType(rootPath)];
                    case 1:
                        projectType = _b.sent();
                        if (projectType === 'java') {
                            // Check for Spring Boot
                            if (fs.existsSync(path.join(rootPath, 'pom.xml'))) {
                                pomContent = fs.readFileSync(path.join(rootPath, 'pom.xml'), 'utf8');
                                if (pomContent.includes('spring-boot-starter')) {
                                    return [2 /*return*/, 'spring-boot'];
                                }
                            }
                        }
                        if (projectType === 'node') {
                            packageJsonPath = path.join(rootPath, 'package.json');
                            if (fs.existsSync(packageJsonPath)) {
                                packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                                if ((_a = packageJson.dependencies) === null || _a === void 0 ? void 0 : _a['express']) {
                                    return [2 /*return*/, 'express'];
                                }
                            }
                        }
                        return [2 /*return*/, undefined];
                }
            });
        });
    };
    ProjectAnalyzer.prototype.collectRelevantFiles = function (rootPath) {
        return __awaiter(this, void 0, void 0, function () {
            var relevantExtensions, files, collect;
            return __generator(this, function (_a) {
                relevantExtensions = ['.js', '.ts', '.java', '.py', '.go', '.rs', '.cpp', '.c'];
                files = [];
                collect = function (dir) {
                    var items = fs.readdirSync(dir);
                    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                        var item = items_1[_i];
                        var fullPath = path.join(dir, item);
                        var stat = fs.statSync(fullPath);
                        if (stat.isDirectory()) {
                            // Skip common directories
                            if (!['node_modules', '.git', 'dist', 'build', 'target'].includes(item)) {
                                collect(fullPath);
                            }
                        }
                        else {
                            var ext = path.extname(item);
                            if (relevantExtensions.includes(ext)) {
                                files.push(fullPath.replace(rootPath + '/', ''));
                            }
                        }
                    }
                };
                collect(rootPath);
                return [2 /*return*/, files.slice(0, 50)]; // Limit to 50 files
            });
        });
    };
    ProjectAnalyzer.prototype.extractDependencies = function (rootPath) {
        return __awaiter(this, void 0, void 0, function () {
            var dependencies, projectType, packageJsonPath, packageJson;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dependencies = [];
                        return [4 /*yield*/, this.detectProjectType(rootPath)];
                    case 1:
                        projectType = _a.sent();
                        if (projectType === 'node') {
                            packageJsonPath = path.join(rootPath, 'package.json');
                            if (fs.existsSync(packageJsonPath)) {
                                try {
                                    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                                    if (packageJson.dependencies) {
                                        dependencies.push.apply(dependencies, Object.keys(packageJson.dependencies));
                                    }
                                    if (packageJson.devDependencies) {
                                        dependencies.push.apply(dependencies, Object.keys(packageJson.devDependencies));
                                    }
                                }
                                catch (error) {
                                    console.error('Error parsing package.json:', error);
                                }
                            }
                        }
                        return [2 /*return*/, dependencies.slice(0, 20)]; // Limit to top 20 dependencies
                }
            });
        });
    };
    ProjectAnalyzer.prototype.analyzeCodeStyle = function (rootPath) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultStyle, sampleFiles, firstFile, content, lines, _i, lines_1, line, singleQuotes, doubleQuotes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        defaultStyle = {
                            indent: 2,
                            quoteStyle: 'single',
                            lineEnding: 'lf'
                        };
                        return [4 /*yield*/, this.getSampleFiles(rootPath)];
                    case 1:
                        sampleFiles = _a.sent();
                        if (sampleFiles.length === 0) {
                            return [2 /*return*/, defaultStyle];
                        }
                        // Simple analysis: check first file
                        try {
                            firstFile = sampleFiles[0];
                            content = fs.readFileSync(path.join(rootPath, firstFile), 'utf8');
                            lines = content.split('\n');
                            for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                                line = lines_1[_i];
                                if (line.startsWith('  ') && !line.startsWith('    ')) {
                                    defaultStyle.indent = 2;
                                    break;
                                }
                                else if (line.startsWith('    ')) {
                                    defaultStyle.indent = 4;
                                    break;
                                }
                                else if (line.startsWith('\t')) {
                                    defaultStyle.indent = 8; // Tab usually 8 spaces
                                    break;
                                }
                            }
                            // Detect quote style
                            if (content.includes("'") && content.includes('"')) {
                                singleQuotes = (content.match(/'/g) || []).length;
                                doubleQuotes = (content.match(/"/g) || []).length;
                                defaultStyle.quoteStyle = singleQuotes > doubleQuotes ? 'single' : 'double';
                            }
                            else if (content.includes("'")) {
                                defaultStyle.quoteStyle = 'single';
                            }
                            else if (content.includes('"')) {
                                defaultStyle.quoteStyle = 'double';
                            }
                            // Detect line ending
                            if (content.includes('\r\n')) {
                                defaultStyle.lineEnding = 'crlf';
                            }
                            else {
                                defaultStyle.lineEnding = 'lf';
                            }
                        }
                        catch (error) {
                            console.error('Error analyzing code style:', error);
                        }
                        return [2 /*return*/, defaultStyle];
                }
            });
        });
    };
    ProjectAnalyzer.prototype.getSampleFiles = function (rootPath) {
        return __awaiter(this, void 0, void 0, function () {
            var allFiles;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.collectRelevantFiles(rootPath)];
                    case 1:
                        allFiles = _a.sent();
                        return [2 /*return*/, allFiles.slice(0, 5)]; // First 5 files as sample
                }
            });
        });
    };
    ProjectAnalyzer.prototype.detectArchitecture = function (rootPath) {
        return __awaiter(this, void 0, void 0, function () {
            var projectType, framework, hasController, hasService, hasRepository, hasRoutes, hasModels;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.detectProjectType(rootPath)];
                    case 1:
                        projectType = _a.sent();
                        return [4 /*yield*/, this.detectFramework(rootPath)];
                    case 2:
                        framework = _a.sent();
                        if (projectType === 'java' && framework === 'spring-boot') {
                            hasController = this.checkForPattern(rootPath, /@RestController|@Controller/);
                            hasService = this.checkForPattern(rootPath, /@Service/);
                            hasRepository = this.checkForPattern(rootPath, /@Repository/);
                            if (hasController && hasService) {
                                return [2 /*return*/, 'controller-service-repository'];
                            }
                        }
                        if (projectType === 'node') {
                            hasRoutes = fs.existsSync(path.join(rootPath, 'routes')) ||
                                this.checkForPattern(rootPath, /router\.|app\.(get|post|put|delete)/);
                            hasModels = fs.existsSync(path.join(rootPath, 'models')) ||
                                fs.existsSync(path.join(rootPath, 'schemas'));
                            if (hasRoutes && hasModels) {
                                return [2 /*return*/, 'mvc'];
                            }
                        }
                        return [2 /*return*/, undefined];
                }
            });
        });
    };
    ProjectAnalyzer.prototype.checkForPattern = function (rootPath, pattern) {
        try {
            var files = this.getAllFiles(rootPath, ['.java', '.js', '.ts']);
            for (var _i = 0, _a = files.slice(0, 20); _i < _a.length; _i++) { // Check first 20 files
                var file = _a[_i];
                var content = fs.readFileSync(path.join(rootPath, file), 'utf8');
                if (pattern.test(content)) {
                    return true;
                }
            }
        }
        catch (error) {
            console.error('Error checking pattern:', error);
        }
        return false;
    };
    ProjectAnalyzer.prototype.getAllFiles = function (rootPath, extensions) {
        var files = [];
        var collect = function (dir) {
            var items = fs.readdirSync(dir);
            for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
                var item = items_2[_i];
                var fullPath = path.join(dir, item);
                var stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    if (!['node_modules', '.git', 'dist', 'build', 'target'].includes(item)) {
                        collect(fullPath);
                    }
                }
                else {
                    var ext = path.extname(item);
                    if (extensions.includes(ext)) {
                        files.push(fullPath.replace(rootPath + '/', ''));
                    }
                }
            }
        };
        collect(rootPath);
        return files;
    };
    ProjectAnalyzer.prototype.getDefaultContext = function () {
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
    };
    return ProjectAnalyzer;
}());
exports.ProjectAnalyzer = ProjectAnalyzer;
