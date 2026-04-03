"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskEngine = void 0;
var vscode = require("vscode");
var enhancedPromptEngine_1 = require("../prompt/enhancedPromptEngine");
var browserAutomator_1 = require("../browser/browserAutomator");
var approvalWorkflow_1 = require("../workflow/approvalWorkflow");
var TaskEngine = /** @class */ (function () {
    function TaskEngine(projectAnalyzer, promptEngine, modelAdapter, fileManager, terminalExecutor, browserAutomator) {
        this.steps = [];
        this.isExecuting = false;
        this.pendingDiffs = new Map(); // diffId -> FileDiff
        this.projectAnalyzer = projectAnalyzer;
        this.promptEngine = promptEngine;
        this.enhancedPromptEngine = new enhancedPromptEngine_1.EnhancedPromptEngine();
        this.modelAdapter = modelAdapter;
        this.fileManager = fileManager;
        this.terminalExecutor = terminalExecutor;
        this.browserAutomator = browserAutomator || new browserAutomator_1.BrowserAutomator();
        this.approvalWorkflow = new approvalWorkflow_1.ApprovalWorkflow();
    }
    /**
     * 分析项目上下文（使用增强分析如果可用）
     */
    TaskEngine.prototype.analyzeProjectWithContext = function (currentFile) {
        return __awaiter(this, void 0, void 0, function () {
            var enhancedContext, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!('analyzeEnhancedWorkspace' in this.projectAnalyzer &&
                            typeof this.projectAnalyzer.analyzeEnhancedWorkspace === 'function')) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.projectAnalyzer.analyzeEnhancedWorkspace(currentFile)];
                    case 2:
                        enhancedContext = _a.sent();
                        return [2 /*return*/, enhancedContext];
                    case 3:
                        error_1 = _a.sent();
                        console.warn('Enhanced analysis failed, falling back to basic analysis:', error_1);
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.projectAnalyzer.analyzeCurrentWorkspace()];
                    case 5: 
                    // 回退到基础分析
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 开始处理一个新任务
     */
    TaskEngine.prototype.startTask = function (taskDescription_1) {
        return __awaiter(this, arguments, void 0, function (taskDescription, options) {
            var specialCommandResult, currentFile, projectContext, prompt_1, aiResponse, parsedSteps, executionResult, error_2;
            var _this = this;
            var _a;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isExecuting) {
                            return [2 /*return*/, {
                                    success: false,
                                    steps: [],
                                    output: 'Another task is already executing',
                                    error: 'Task engine busy'
                                }];
                        }
                        return [4 /*yield*/, this.handleSpecialCommand(taskDescription.trim())];
                    case 1:
                        specialCommandResult = _b.sent();
                        if (specialCommandResult) {
                            return [2 /*return*/, specialCommandResult];
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, 8, 9]);
                        this.isExecuting = true;
                        this.steps = [];
                        // 1. 分析项目上下文
                        this.addStep('info', 'Analyzing project context...');
                        currentFile = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri.fsPath;
                        return [4 /*yield*/, this.analyzeProjectWithContext(currentFile)];
                    case 3:
                        projectContext = _b.sent();
                        // 2. 创建任务上下文
                        this.currentTask = {
                            taskDescription: taskDescription,
                            projectContext: projectContext,
                            workspaceRoot: projectContext.rootPath,
                            options: __assign({ autoExecute: true, requireApproval: true, promptOptions: {
                                    includeExamples: true,
                                    includeConstraints: true,
                                    includeBestPractices: true,
                                    language: projectContext.language
                                } }, options)
                        };
                        // 3. 使用增强提示词引擎生成专业提示词（基于Qoder和Cline最佳实践）
                        this.addStep('info', 'Generating task plan with enhanced Qoder/Cline prompt engineering...');
                        prompt_1 = this.enhancedPromptEngine.generateEnhancedPrompt(taskDescription, projectContext, {
                            includeSystemPrompt: true,
                            includeContext: true,
                            languageSpecific: true
                        });
                        // 4. 调用AI模型生成任务计划
                        this.addStep('info', 'Consulting AI assistant...');
                        return [4 /*yield*/, this.callAI(prompt_1)];
                    case 4:
                        aiResponse = _b.sent();
                        // 5. 解析AI响应为可执行步骤
                        this.addStep('info', 'Parsing task plan...');
                        parsedSteps = this.parseAIResponse(aiResponse.content);
                        // 6. 将步骤添加到任务中
                        parsedSteps.forEach(function (step) { return _this.steps.push(step); });
                        executionResult = '';
                        if (!this.currentTask.options.autoExecute) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.executeSteps()];
                    case 5:
                        executionResult = _b.sent();
                        _b.label = 6;
                    case 6: return [2 /*return*/, {
                            success: true,
                            steps: this.steps,
                            output: executionResult || 'Task planned successfully. Ready for execution.',
                            error: undefined
                        }];
                    case 7:
                        error_2 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                steps: this.steps,
                                output: 'Task execution failed',
                                error: error_2.message || 'Unknown error'
                            }];
                    case 8:
                        this.isExecuting = false;
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行所有待处理的步骤
     */
    TaskEngine.prototype.executeSteps = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, i, step, result, _a, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.currentTask) {
                            throw new Error('No active task');
                        }
                        results = [];
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < this.steps.length)) return [3 /*break*/, 14];
                        step = this.steps[i];
                        if (step.status !== 'pending') {
                            return [3 /*break*/, 13];
                        }
                        // 更新步骤状态为执行中
                        this.updateStepStatus(i, 'executing');
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 12, , 13]);
                        result = '';
                        _a = step.type;
                        switch (_a) {
                            case 'file': return [3 /*break*/, 3];
                            case 'terminal': return [3 /*break*/, 5];
                            case 'browser': return [3 /*break*/, 7];
                            case 'info': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 10];
                    case 3: return [4 /*yield*/, this.executeFileStep(step)];
                    case 4:
                        result = _b.sent();
                        return [3 /*break*/, 11];
                    case 5: return [4 /*yield*/, this.executeTerminalStep(step)];
                    case 6:
                        result = _b.sent();
                        return [3 /*break*/, 11];
                    case 7: return [4 /*yield*/, this.executeBrowserStep(step)];
                    case 8:
                        result = _b.sent();
                        return [3 /*break*/, 11];
                    case 9:
                        // 信息步骤不执行实际操作
                        result = step.description;
                        return [3 /*break*/, 11];
                    case 10:
                        result = "Unsupported step type: ".concat(step.type);
                        _b.label = 11;
                    case 11:
                        step.result = result;
                        this.updateStepStatus(i, 'completed');
                        results.push("Step ".concat(i + 1, ": ").concat(step.description, " - SUCCESS\n").concat(result));
                        return [3 /*break*/, 13];
                    case 12:
                        error_3 = _b.sent();
                        step.error = error_3.message;
                        this.updateStepStatus(i, 'failed');
                        results.push("Step ".concat(i + 1, ": ").concat(step.description, " - FAILED\n").concat(error_3.message));
                        // 根据策略决定是否继续执行
                        if (this.currentTask.options.requireApproval) {
                            return [3 /*break*/, 14]; // 需要用户批准时，出错就停止
                        }
                        return [3 /*break*/, 13];
                    case 13:
                        i++;
                        return [3 /*break*/, 1];
                    case 14: return [2 /*return*/, results.join('\n\n')];
                }
            });
        });
    };
    /**
     * 获取当前任务状态
     */
    TaskEngine.prototype.getTaskStatus = function () {
        return {
            isExecuting: this.isExecuting,
            steps: this.steps,
            currentTask: this.currentTask
        };
    };
    /**
     * 批准或拒绝一个步骤
     */
    TaskEngine.prototype.approveStep = function (stepIndex, approve) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) {
            return false;
        }
        var step = this.steps[stepIndex];
        if (step.status !== 'pending' && step.status !== 'executing') {
            return false;
        }
        this.updateStepStatus(stepIndex, approve ? 'approved' : 'rejected');
        return true;
    };
    /**
     * 批准或拒绝待处理的文件差异
     */
    TaskEngine.prototype.approveDiff = function (diffId, action) {
        return __awaiter(this, void 0, void 0, function () {
            var diff, result, stepIndex, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.fileManager) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'File manager not available',
                                    error: 'File manager not initialized'
                                }];
                        }
                        diff = this.pendingDiffs.get(diffId);
                        if (!diff) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Diff not found: ".concat(diffId),
                                    error: 'Diff not found'
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        result = void 0;
                        if (!(action === 'approve')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.fileManager.applyDiff(diff)];
                    case 2:
                        // 批准更改：应用差异
                        result = _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.fileManager.revertDiff(diff)];
                    case 4:
                        // 拒绝更改：回滚到原始内容
                        result = _a.sent();
                        _a.label = 5;
                    case 5:
                        // 清理已处理的差异
                        this.pendingDiffs.delete(diffId);
                        stepIndex = this.steps.findIndex(function (step) {
                            var stepDiffId = step.description.replace(/\s+/g, '-').toLowerCase();
                            return stepDiffId === diffId;
                        });
                        if (stepIndex >= 0) {
                            this.updateStepStatus(stepIndex, action === 'approve' ? 'approved' : 'rejected');
                        }
                        return [2 /*return*/, {
                                success: result.success,
                                message: result.message,
                                error: result.error
                            }];
                    case 6:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                message: "Failed to ".concat(action, " changes: ").concat(error_4.message),
                                error: error_4.message
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取所有待处理的差异
     */
    TaskEngine.prototype.getPendingDiffs = function () {
        return Array.from(this.pendingDiffs.entries()).map(function (_a) {
            var diffId = _a[0], diff = _a[1];
            return ({ diffId: diffId, diff: diff });
        });
    };
    /**
     * 重置任务引擎
     */
    TaskEngine.prototype.reset = function () {
        this.currentTask = undefined;
        this.steps = [];
        this.pendingDiffs.clear();
        this.isExecuting = false;
    };
    /**
     * 处理特殊命令（以@开头的命令）
     */
    TaskEngine.prototype.handleSpecialCommand = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            var parts, cmd, args, _a, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!command.startsWith('@')) {
                            return [2 /*return*/, null];
                        }
                        parts = command.split(' ');
                        cmd = parts[0].toLowerCase();
                        args = parts.slice(1).join(' ');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 16, 17, 18]);
                        this.isExecuting = true;
                        this.steps = [];
                        _a = cmd;
                        switch (_a) {
                            case '@terminal': return [3 /*break*/, 2];
                            case '@term': return [3 /*break*/, 2];
                            case '@url': return [3 /*break*/, 4];
                            case '@browse': return [3 /*break*/, 4];
                            case '@problems': return [3 /*break*/, 6];
                            case '@issues': return [3 /*break*/, 6];
                            case '@snapshot': return [3 /*break*/, 8];
                            case '@help': return [3 /*break*/, 10];
                            case '@commands': return [3 /*break*/, 10];
                            case '@model': return [3 /*break*/, 12];
                        }
                        return [3 /*break*/, 14];
                    case 2: return [4 /*yield*/, this.handleTerminalCommand(args)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.handleUrlCommand(args)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, this.handleProblemsCommand()];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [4 /*yield*/, this.handleSnapshotCommand()];
                    case 9: return [2 /*return*/, _b.sent()];
                    case 10: return [4 /*yield*/, this.handleHelpCommand()];
                    case 11: return [2 /*return*/, _b.sent()];
                    case 12: return [4 /*yield*/, this.handleModelCommand(args)];
                    case 13: return [2 /*return*/, _b.sent()];
                    case 14: return [2 /*return*/, {
                            success: false,
                            steps: [],
                            output: "Unknown special command: ".concat(cmd, ". Type @help for available commands."),
                            error: 'Unknown command'
                        }];
                    case 15: return [3 /*break*/, 18];
                    case 16:
                        error_5 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                steps: [],
                                output: "Error executing special command: ".concat(error_5.message),
                                error: error_5.message
                            }];
                    case 17:
                        this.isExecuting = false;
                        return [7 /*endfinally*/];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    // ===== 特殊命令处理方法 =====
    TaskEngine.prototype.handleTerminalCommand = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            var result, htmlReport, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!command.trim()) {
                            return [2 /*return*/, {
                                    success: false,
                                    steps: [],
                                    output: 'Please provide a command to execute. Example: @terminal npm install',
                                    error: 'Missing command'
                                }];
                        }
                        this.addStep('terminal', "Execute command: ".concat(command), { command: command });
                        this.updateStepStatus(0, 'executing');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (!this.terminalExecutor) {
                            throw new Error('Terminal executor not available');
                        }
                        return [4 /*yield*/, this.terminalExecutor.executeCommand(command)];
                    case 2:
                        result = _a.sent();
                        htmlReport = this.terminalExecutor.generateHtmlReport(result);
                        this.updateStepStatus(0, result.success ? 'completed' : 'failed');
                        return [2 /*return*/, {
                                success: result.success,
                                steps: this.steps,
                                output: htmlReport,
                                summary: "Terminal command executed: ".concat(result.success ? 'Success' : 'Failed')
                            }];
                    case 3:
                        error_6 = _a.sent();
                        this.updateStepStatus(0, 'failed');
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TaskEngine.prototype.handleUrlCommand = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var result, htmlReport, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!url.trim()) {
                            return [2 /*return*/, {
                                    success: false,
                                    steps: [],
                                    output: 'Please provide a URL to open. Example: @url https://github.com/openclaw/openclaw',
                                    error: 'Missing URL'
                                }];
                        }
                        this.addStep('browser', "Browse URL: ".concat(url), { url: url });
                        this.updateStepStatus(0, 'executing');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (!this.browserAutomator) {
                            throw new Error('Browser automator not available');
                        }
                        return [4 /*yield*/, this.browserAutomator.executeSequence(url, [
                                { type: 'navigate' }
                            ])];
                    case 2:
                        result = _a.sent();
                        htmlReport = this.browserAutomator.generateHtmlReport(result);
                        this.updateStepStatus(0, result.success ? 'completed' : 'failed');
                        return [2 /*return*/, {
                                success: result.success,
                                steps: this.steps,
                                output: htmlReport,
                                summary: "Browser automation: ".concat(result.success ? 'Success' : 'Failed')
                            }];
                    case 3:
                        error_7 = _a.sent();
                        this.updateStepStatus(0, 'failed');
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TaskEngine.prototype.handleProblemsCommand = function () {
        return __awaiter(this, void 0, void 0, function () {
            var projectContext, problems, packageJson, hasSrc, hasTsConfig, hasTypeScriptFiles, enhancedProblems, codeQuality, highSeverityIssues, mediumSeverityIssues, highConfidenceSuggestions, patternNames, allProblems, problemsHtml, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.addStep('info', 'Scanning for problems in workspace');
                        this.updateStepStatus(0, 'executing');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.analyzeProjectWithContext()];
                    case 2:
                        projectContext = _a.sent();
                        problems = [];
                        packageJson = projectContext.files.find(function (f) { return f.endsWith('/package.json') || f === 'package.json'; });
                        if (!packageJson) {
                            problems.push('No package.json found - this may not be a Node.js project');
                        }
                        hasSrc = projectContext.files.some(function (f) { return f.includes('src/'); });
                        if (!hasSrc) {
                            problems.push('No src/ directory found - consider organizing code in src/');
                        }
                        hasTsConfig = projectContext.files.some(function (f) { return f.endsWith('/tsconfig.json') || f === 'tsconfig.json'; });
                        hasTypeScriptFiles = projectContext.files.some(function (f) { return f.endsWith('.ts'); });
                        if (!hasTsConfig && hasTypeScriptFiles) {
                            problems.push('TypeScript files found but no tsconfig.json - TypeScript compilation may fail');
                        }
                        enhancedProblems = [];
                        if (projectContext.codeQuality) {
                            codeQuality = projectContext.codeQuality;
                            // 基于代码质量评分
                            if (codeQuality.overallScore < 50) {
                                enhancedProblems.push("Low code quality score: ".concat(codeQuality.overallScore.toFixed(1), "/100 - consider refactoring"));
                            }
                            else if (codeQuality.overallScore < 70) {
                                enhancedProblems.push("Moderate code quality score: ".concat(codeQuality.overallScore.toFixed(1), "/100 - room for improvement"));
                            }
                            // 检查高复杂度
                            if (codeQuality.metrics.complexity > 15) {
                                enhancedProblems.push("High code complexity: ".concat(codeQuality.metrics.complexity.toFixed(2), " - consider simplifying complex functions"));
                            }
                            // 检查高重复率
                            if (codeQuality.metrics.duplicationRate > 0.2) {
                                enhancedProblems.push("High code duplication: ".concat((codeQuality.metrics.duplicationRate * 100).toFixed(1), "% - consider extracting common code"));
                            }
                            // 添加具体的代码问题
                            if (codeQuality.issues && codeQuality.issues.length > 0) {
                                highSeverityIssues = codeQuality.issues.filter(function (issue) { return issue.severity === 'high'; });
                                mediumSeverityIssues = codeQuality.issues.filter(function (issue) { return issue.severity === 'medium'; });
                                if (highSeverityIssues.length > 0) {
                                    enhancedProblems.push("Found ".concat(highSeverityIssues.length, " high-severity code issues - review recommended"));
                                }
                                if (mediumSeverityIssues.length > 0) {
                                    enhancedProblems.push("Found ".concat(mediumSeverityIssues.length, " medium-severity code issues"));
                                }
                            }
                            // 添加重构建议
                            if (codeQuality.suggestions && codeQuality.suggestions.length > 0) {
                                highConfidenceSuggestions = codeQuality.suggestions.filter(function (suggestion) { return suggestion.confidence > 0.7; });
                                if (highConfidenceSuggestions.length > 0) {
                                    enhancedProblems.push("".concat(highConfidenceSuggestions.length, " high-confidence refactoring suggestions available"));
                                }
                            }
                            // 架构模式警告
                            if (projectContext.architecturePatterns && projectContext.architecturePatterns.length > 0) {
                                patternNames = projectContext.architecturePatterns.map(function (pattern) { return pattern.name; }).join(', ');
                                enhancedProblems.push("Detected architecture patterns: ".concat(patternNames));
                            }
                        }
                        allProblems = __spreadArray(__spreadArray([], problems, true), enhancedProblems, true);
                        this.updateStepStatus(0, 'completed');
                        problemsHtml = allProblems.length > 0 ?
                            "<div class=\"problems-list\">\n          <h4>\u26A0\uFE0F Found ".concat(allProblems.length, " potential issue").concat(allProblems.length > 1 ? 's' : '', ":</h4>\n          <ul>\n            ").concat(allProblems.map(function (p) { return "<li>".concat(p, "</li>"); }).join(''), "\n          </ul>\n         </div>") :
                            "<div class=\"success-message\">\u2705 No obvious problems found in workspace.</div>";
                        return [2 /*return*/, {
                                success: true,
                                steps: this.steps,
                                output: "**Workspace Analysis**\n\n".concat(problemsHtml, "\n\n*Analyzed ").concat(projectContext.files.length, " files in workspace.*"),
                                summary: "Found ".concat(allProblems.length, " potential problems")
                            }];
                    case 3:
                        error_8 = _a.sent();
                        this.updateStepStatus(0, 'failed');
                        throw error_8;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TaskEngine.prototype.handleSnapshotCommand = function () {
        return __awaiter(this, void 0, void 0, function () {
            var projectContext, fileTypes_1, fileTypeSummary, workspaceName, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.addStep('info', 'Creating workspace snapshot');
                        this.updateStepStatus(0, 'executing');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.analyzeProjectWithContext()];
                    case 2:
                        projectContext = _a.sent();
                        this.updateStepStatus(0, 'completed');
                        fileTypes_1 = {};
                        projectContext.files.forEach(function (filePath) {
                            var fileName = filePath.split('/').pop() || filePath;
                            var ext = fileName.includes('.') ? fileName.split('.').pop() || 'other' : 'no-extension';
                            fileTypes_1[ext] = (fileTypes_1[ext] || 0) + 1;
                        });
                        fileTypeSummary = Object.entries(fileTypes_1)
                            .map(function (_a) {
                            var ext = _a[0], count = _a[1];
                            return "".concat(ext, ": ").concat(count);
                        })
                            .join(', ');
                        workspaceName = projectContext.rootPath.split('/').pop() || 'workspace';
                        return [2 /*return*/, {
                                success: true,
                                steps: this.steps,
                                output: "**Workspace Snapshot**\n\n\uD83D\uDCCA **Summary**\n- Total files: ".concat(projectContext.files.length, "\n- File types: ").concat(fileTypeSummary, "\n- Workspace: ").concat(workspaceName, "\n\n*Note: Full snapshot functionality with save/restore is not yet implemented.*"),
                                summary: "Created snapshot of ".concat(projectContext.files.length, " files")
                            }];
                    case 3:
                        error_9 = _a.sent();
                        this.updateStepStatus(0, 'failed');
                        throw error_9;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TaskEngine.prototype.handleHelpCommand = function () {
        return __awaiter(this, void 0, void 0, function () {
            var commands, commandsHtml;
            return __generator(this, function (_a) {
                commands = [
                    { command: '@terminal <command>', description: 'Execute terminal command' },
                    { command: '@term <command>', description: 'Alias for @terminal' },
                    { command: '@url <url>', description: 'Open URL in browser (browser automation required)' },
                    { command: '@problems', description: 'Scan workspace for potential issues' },
                    { command: '@issues', description: 'Alias for @problems' },
                    { command: '@snapshot', description: 'Create workspace snapshot' },
                    { command: '@model', description: 'Show current AI model configuration' },
                    { command: '@help', description: 'Show this help message' },
                    { command: '@commands', description: 'Alias for @help' }
                ];
                commandsHtml = "\n<div class=\"special-commands-help\">\n  <h3>\uD83D\uDCCB Special Commands</h3>\n  <p>These commands start with <code>@</code> and provide quick access to specific features:</p>\n  <table class=\"commands-table\">\n    <thead>\n      <tr>\n        <th>Command</th>\n        <th>Description</th>\n      </tr>\n    </thead>\n    <tbody>\n      ".concat(commands.map(function (cmd) { return "\n        <tr>\n          <td><code>".concat(cmd.command, "</code></td>\n          <td>").concat(cmd.description, "</td>\n        </tr>\n      "); }).join(''), "\n    </tbody>\n  </table>\n  <p><em>Regular task descriptions (without @) will be processed by AI for multi-step execution.</em></p>\n</div>");
                return [2 /*return*/, {
                        success: true,
                        steps: [],
                        output: commandsHtml,
                        summary: 'Special commands help'
                    }];
            });
        });
    };
    TaskEngine.prototype.handleModelCommand = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var config, modelInfo, isReady, modelHtml;
            return __generator(this, function (_a) {
                try {
                    config = this.modelAdapter.getConfiguration();
                    modelInfo = this.modelAdapter.getModelInfo();
                    isReady = this.modelAdapter.isReady();
                    modelHtml = "\n<div class=\"model-info-card\">\n  <h3>\uD83E\uDD16 AI Model Configuration</h3>\n  <table>\n    <tr><th>Status:</th><td><span class=\"".concat(isReady ? 'status-ready' : 'status-not-ready', "\">").concat(isReady ? '✅ Ready' : '⚠️ Not Configured', "</span></td></tr>\n    <tr><th>Model:</th><td><code>").concat(config.model || 'Not set', "</code></td></tr>\n    <tr><th>Base URL:</th><td><code>").concat(config.baseUrl || '(default)', "</code></td></tr>\n    <tr><th>API Key:</th><td><code>").concat(config.apiKey ? '••••••••' : 'Not set', "</code></td></tr>\n    <tr><th>Temperature:</th><td>").concat(config.temperature || 0.7, "</td></tr>\n    <tr><th>Model Info:</th><td>").concat(modelInfo, "</td></tr>\n  </table>\n  ").concat(!isReady ? '<p class="warning">⚠️ Please configure API key in settings to use AI features.</p>' : '', "\n</div>");
                    return [2 /*return*/, {
                            success: true,
                            steps: [],
                            output: modelHtml,
                            summary: 'Model configuration information'
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            steps: [],
                            output: "Error fetching model info: ".concat(error.message),
                            error: error.message
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    // ===== 私有方法 =====
    TaskEngine.prototype.addStep = function (type, description, data) {
        this.steps.push({
            type: type,
            description: description,
            status: 'pending',
            data: data
        });
    };
    TaskEngine.prototype.updateStepStatus = function (index, status) {
        if (index >= 0 && index < this.steps.length) {
            this.steps[index].status = status;
            // 通知UI更新
            this.notifyUI('stepUpdated', {
                index: index,
                step: this.steps[index]
            });
        }
    };
    TaskEngine.prototype.callAI = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var structuredPrompt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.modelAdapter.isReady()) {
                            throw new Error('AI model not configured. Please set up API key in settings.');
                        }
                        structuredPrompt = "\n".concat(prompt, "\n\n\u8BF7\u4EE5\u7ED3\u6784\u5316\u683C\u5F0F\u8FD4\u56DE\u4EFB\u52A1\u8BA1\u5212\uFF0C\u6BCF\u4E2A\u6B65\u9AA4\u5305\u542B\u4EE5\u4E0B\u4FE1\u606F\uFF1A\n1. \u6B65\u9AA4\u7C7B\u578B (file/terminal/browser/info)\n2. \u6B65\u9AA4\u63CF\u8FF0\n3. \u5177\u4F53\u64CD\u4F5C\u5185\u5BB9\uFF08\u5982\u679C\u662F\u6587\u4EF6\u64CD\u4F5C\uFF0C\u8BF7\u63D0\u4F9B\u5B8C\u6574\u4EE3\u7801\uFF09\n\n\u683C\u5F0F\u793A\u4F8B\uFF1A\n\u6B65\u9AA41: [file] \u521B\u5EFA\u7528\u6237\u670D\u52A1\u7C7B\n- \u6587\u4EF6\u8DEF\u5F84: src/services/UserService.java\n- \u4EE3\u7801\u5185\u5BB9: [\u5B8C\u6574\u7684Java\u4EE3\u7801]\n\n\u6B65\u9AA42: [terminal] \u8FD0\u884C\u5355\u5143\u6D4B\u8BD5\n- \u547D\u4EE4: mvn test -Dtest=UserServiceTest\n\n\u6B65\u9AA43: [info] \u9A8C\u8BC1\u5B9E\u73B0\n- \u68C0\u67E5: \u786E\u4FDDAPI\u7AEF\u70B9\u6B63\u5E38\u5DE5\u4F5C\n");
                        return [4 /*yield*/, this.modelAdapter.generate(structuredPrompt)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TaskEngine.prototype.parseAIResponse = function (response) {
        var _a;
        var steps = [];
        var lines = response.split('\n');
        var currentStep = null;
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var stepMatch = line.match(/步骤(\d+):\s*\[(\w+)\]\s*(.+)/i);
            if (stepMatch) {
                // 保存上一个步骤
                if (currentStep && currentStep.type && currentStep.description) {
                    steps.push(currentStep);
                }
                // 开始新步骤
                currentStep = {
                    type: stepMatch[2],
                    description: stepMatch[3].trim(),
                    status: 'pending'
                };
                continue;
            }
            // 解析步骤详情
            if (currentStep) {
                var filePathMatch = line.match(/文件路径:\s*(.+)/i);
                if (filePathMatch) {
                    currentStep.data = __assign(__assign({}, currentStep.data), { filePath: filePathMatch[1].trim() });
                }
                var commandMatch = line.match(/命令:\s*(.+)/i);
                if (commandMatch) {
                    currentStep.data = __assign(__assign({}, currentStep.data), { command: commandMatch[1].trim() });
                }
                // 检测代码块开始
                if (line.includes('代码内容:') || line.includes('代码:')) {
                    currentStep.data = __assign(__assign({}, currentStep.data), { codeContent: '' });
                }
                else if (((_a = currentStep.data) === null || _a === void 0 ? void 0 : _a.codeContent) !== undefined) {
                    // 收集代码内容
                    currentStep.data.codeContent += line + '\n';
                }
            }
        }
        // 添加最后一个步骤
        if (currentStep && currentStep.type && currentStep.description) {
            steps.push(currentStep);
        }
        // 如果没有解析到结构化步骤，回退到简单处理
        if (steps.length === 0) {
            steps.push({
                type: 'info',
                description: 'AI response processing',
                status: 'pending',
                data: { rawResponse: response }
            });
        }
        return steps;
    };
    TaskEngine.prototype.executeFileStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, filePath, codeContent, exists, result, diffId, diffHtml, fullDiffHtml;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.fileManager) {
                            throw new Error('File manager not available');
                        }
                        _a = step.data || {}, filePath = _a.filePath, codeContent = _a.codeContent;
                        if (!filePath || !codeContent) {
                            throw new Error('File step missing filePath or codeContent');
                        }
                        return [4 /*yield*/, this.fileManager.fileExists(filePath)];
                    case 1:
                        exists = _b.sent();
                        if (!exists) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.fileManager.editFileWithDiff(filePath, codeContent)];
                    case 2:
                        // 编辑现有文件
                        result = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.fileManager.createFile(filePath, codeContent)];
                    case 4:
                        // 创建新文件
                        result = _b.sent();
                        _b.label = 5;
                    case 5:
                        // 生成Cline风格的差异显示
                        if (result.diff) {
                            diffId = step.description.replace(/\s+/g, '-').toLowerCase();
                            // 存储待处理的差异
                            this.pendingDiffs.set(diffId, result.diff);
                            diffHtml = this.fileManager.generateHtmlDiff(result.diff);
                            fullDiffHtml = "\n<div class=\"diff-container\">\n  <div class=\"diff-header\">\n    <div>\n      <h3>".concat(result.diff.filePath, "</h3>\n      <div class=\"diff-summary\">").concat(result.diff.summary, "</div>\n    </div>\n    <div class=\"diff-actions\">\n      <button class=\"diff-action-btn diff-approve\" data-file-path=\"").concat(result.diff.filePath, "\" data-diff-id=\"").concat(diffId, "\">\n        \u2713 Approve\n      </button>\n      <button class=\"diff-action-btn diff-reject\" data-file-path=\"").concat(result.diff.filePath, "\" data-diff-id=\"").concat(diffId, "\">\n        \u2717 Reject\n      </button>\n    </div>\n  </div>\n  ").concat(diffHtml, "\n</div>");
                            return [2 /*return*/, "".concat(result.message, "\n\n").concat(fullDiffHtml)];
                        }
                        return [2 /*return*/, result.message];
                }
            });
        });
    };
    TaskEngine.prototype.executeTerminalStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var command, result, htmlReport, error_10;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        command = (step.data || {}).command;
                        if (!command) {
                            throw new Error('Terminal step missing command');
                        }
                        if (!this.terminalExecutor) {
                            throw new Error('Terminal executor not available');
                        }
                        // 检查命令安全性
                        if (!this.terminalExecutor.isSafeCommand(command)) {
                            throw new Error("Potentially dangerous command detected: ".concat(command));
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.terminalExecutor.executeCommand(command, {
                                cwd: (_a = this.currentTask) === null || _a === void 0 ? void 0 : _a.workspaceRoot,
                                onOutput: function (output) {
                                    // 实时输出可以发送到UI
                                    // 这里可以调用notifyUI('terminal_output', { command, output })
                                }
                            })];
                    case 2:
                        result = _b.sent();
                        htmlReport = this.terminalExecutor.generateHtmlReport(result);
                        // 更新步骤数据
                        step.data = __assign(__assign({}, step.data), { result: result });
                        return [2 /*return*/, htmlReport];
                    case 3:
                        error_10 = _b.sent();
                        throw new Error("Terminal execution failed: ".concat(error_10.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TaskEngine.prototype.executeBrowserStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, url, actions, actionsToExecute, result, htmlReport, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = step.data || {}, url = _a.url, actions = _a.actions;
                        if (!url) {
                            throw new Error('Browser step missing URL');
                        }
                        if (!this.browserAutomator) {
                            throw new Error('Browser automator not available');
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        actionsToExecute = actions || [{ type: 'navigate', url: url }];
                        return [4 /*yield*/, this.browserAutomator.executeSequence(url, actionsToExecute)];
                    case 2:
                        result = _b.sent();
                        htmlReport = this.browserAutomator.generateHtmlReport(result);
                        // 更新步骤数据
                        step.data = __assign(__assign({}, step.data), { result: result });
                        return [2 /*return*/, htmlReport];
                    case 3:
                        error_11 = _b.sent();
                        throw new Error("Browser automation failed: ".concat(error_11.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TaskEngine.prototype.notifyUI = function (event, data) {
        // 通过vscode.postMessage通知Webview
        // 需要在Extension中设置事件转发
    };
    // ===== Approval Workflow Methods =====
    /**
     * 提议一个操作到批准工作流
     */
    TaskEngine.prototype.proposeOperationApproval = function (type, description, data, options) {
        if (options === void 0) { options = {}; }
        var itemId = this.approvalWorkflow.proposeOperation(type, description, data, {
            autoExecute: options.autoExecute,
            autoApproveDelay: options.autoExecute ? 0 : undefined
        });
        // 更新相关步骤状态（如果有关联）
        var stepIndex = this.steps.findIndex(function (step) {
            return step.description.includes(description.substring(0, 50));
        });
        if (stepIndex >= 0) {
            this.updateStepStatus(stepIndex, 'pending');
        }
        return itemId;
    };
    /**
     * 获取所有待批准的项
     */
    TaskEngine.prototype.getPendingApprovals = function () {
        return this.approvalWorkflow.getPendingItems();
    };
    /**
     * 获取批准历史
     */
    TaskEngine.prototype.getApprovalHistory = function (limit) {
        return this.approvalWorkflow.getHistory(limit);
    };
    /**
     * 批准一个操作
     */
    TaskEngine.prototype.approveOperation = function (itemId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var result, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.approvalWorkflow.approveItem(itemId, { reason: reason })];
                    case 1:
                        result = _a.sent();
                        item = this.approvalWorkflow.getHistory().find(function (i) { return i.id === itemId; });
                        if (item && item.status === 'approved') {
                            // 标记为已执行（实际执行在executeSteps中处理）
                            this.approvalWorkflow.markAsExecuted(itemId, { executed: true });
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 拒绝一个操作
     */
    TaskEngine.prototype.rejectOperation = function (itemId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.approvalWorkflow.rejectItem(itemId, { reason: reason })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 批量批准操作
     */
    TaskEngine.prototype.approveOperations = function (itemIds, reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.approvalWorkflow.approveItems(itemIds, reason)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 批量拒绝操作
     */
    TaskEngine.prototype.rejectOperations = function (itemIds, reason) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.approvalWorkflow.rejectItems(itemIds, reason)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取批准工作流实例（用于UI集成）
     */
    TaskEngine.prototype.getApprovalWorkflow = function () {
        return this.approvalWorkflow;
    };
    /**
     * 生成待批准项的HTML摘要
     */
    TaskEngine.prototype.generateApprovalsHtml = function () {
        var _this = this;
        var pending = this.getPendingApprovals();
        if (pending.length === 0) {
            return '<div class="no-pending-approvals">✅ No pending approvals</div>';
        }
        var itemsHtml = pending.map(function (item) {
            return _this.approvalWorkflow.generateHtmlSummary(item);
        }).join('');
        return "\n      <div class=\"approvals-container\">\n        <h3>\u23F3 Pending Approvals (".concat(pending.length, ")</h3>\n        <div class=\"approvals-list\">\n          ").concat(itemsHtml, "\n        </div>\n        <div class=\"approvals-actions\">\n          <button class=\"approve-all-btn\" data-action=\"approve-all\">\u2705 Approve All</button>\n          <button class=\"reject-all-btn\" data-action=\"reject-all\">\u274C Reject All</button>\n        </div>\n      </div>\n    ");
    };
    return TaskEngine;
}());
exports.TaskEngine = TaskEngine;
