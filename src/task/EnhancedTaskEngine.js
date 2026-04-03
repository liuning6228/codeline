"use strict";
/**
 * 增强任务引擎 - 支持异步生成器事件流
 * 基于现有TaskEngine，添加实时事件反馈能力
 *
 * 设计原则：
 * 1. 保持向后兼容：现有startTask() API不变
 * 2. 新增executeTask()异步生成器API
 * 3. 实时事件流：任务执行过程中的详细状态更新
 * 4. 支持任务取消和进度跟踪
 */
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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedTaskEngine = void 0;
var taskEngine_1 = require("./taskEngine");
var EnhancedTaskEngine = /** @class */ (function () {
    function EnhancedTaskEngine(projectAnalyzer, promptEngine, modelAdapter, fileManager, terminalExecutor, browserAutomator) {
        this.projectAnalyzer = projectAnalyzer;
        this.promptEngine = promptEngine;
        this.modelAdapter = modelAdapter;
        this.fileManager = fileManager;
        this.terminalExecutor = terminalExecutor;
        this.browserAutomator = browserAutomator;
        this.activeTasks = new Map();
        // 重用现有TaskEngine实例
        this.taskEngine = new taskEngine_1.TaskEngine(projectAnalyzer, promptEngine, modelAdapter, fileManager, terminalExecutor, browserAutomator);
    }
    /**
     * 生成唯一的任务ID
     */
    EnhancedTaskEngine.prototype.generateTaskId = function () {
        return "task_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    /**
     * 异步生成器版本的任务执行
     * 返回一个AsyncGenerator，产生实时事件流
     */
    EnhancedTaskEngine.prototype.executeTask = function (description_1) {
        return __asyncGenerator(this, arguments, function executeTask_1(description, options) {
            var taskId, startTime, projectContext, aiResponse, parsedSteps, stepResults, i, step, stepResult, stepError_1, finalResult, error_1;
            var _a;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        taskId = options.taskId || this.generateTaskId();
                        startTime = Date.now();
                        return [4 /*yield*/, __await(this.createTaskStartedEvent(taskId, description, startTime))];
                    case 1: 
                    // 发送任务开始事件
                    return [4 /*yield*/, _b.sent()];
                    case 2:
                        // 发送任务开始事件
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 36, , 41]);
                        return [4 /*yield*/, __await(this.createAnalyzingProjectEvent(taskId, startTime))];
                    case 4: 
                    // 发送项目分析开始事件
                    return [4 /*yield*/, _b.sent()];
                    case 5:
                        // 发送项目分析开始事件
                        _b.sent();
                        return [4 /*yield*/, __await(this.analyzeProjectWithContext())];
                    case 6:
                        projectContext = _b.sent();
                        return [4 /*yield*/, __await(this.createProjectAnalyzedEvent(taskId, projectContext))];
                    case 7: return [4 /*yield*/, _b.sent()];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, __await(this.createConsultingAIEvent(taskId, startTime))];
                    case 9: 
                    // 发送AI咨询开始事件
                    return [4 /*yield*/, _b.sent()];
                    case 10:
                        // 发送AI咨询开始事件
                        _b.sent();
                        return [4 /*yield*/, __await(this.getAIResponse(description, projectContext))];
                    case 11:
                        aiResponse = _b.sent();
                        return [4 /*yield*/, __await(this.createAIResponseReceivedEvent(taskId, aiResponse))];
                    case 12: return [4 /*yield*/, _b.sent()];
                    case 13:
                        _b.sent();
                        parsedSteps = this.parseAIResponse(aiResponse);
                        return [4 /*yield*/, __await(this.createStepsParsedEvent(taskId, parsedSteps))];
                    case 14: return [4 /*yield*/, _b.sent()];
                    case 15:
                        _b.sent();
                        stepResults = [];
                        i = 0;
                        _b.label = 16;
                    case 16:
                        if (!(i < parsedSteps.length)) return [3 /*break*/, 29];
                        step = parsedSteps[i];
                        return [4 /*yield*/, __await(this.createStepStartedEvent(taskId, i, step, parsedSteps.length))];
                    case 17: 
                    // 发送步骤开始事件
                    return [4 /*yield*/, _b.sent()];
                    case 18:
                        // 发送步骤开始事件
                        _b.sent();
                        _b.label = 19;
                    case 19:
                        _b.trys.push([19, 25, , 28]);
                        return [4 /*yield*/, __await(this.createTaskProgressEvent(taskId, Math.floor((i / parsedSteps.length) * 50) + 25, // 25-75%范围
                            "Executing step ".concat(i + 1, "/").concat(parsedSteps.length, ": ").concat(step.description)))];
                    case 20: 
                    // 发送进度更新
                    return [4 /*yield*/, _b.sent()];
                    case 21:
                        // 发送进度更新
                        _b.sent();
                        return [4 /*yield*/, __await(this.executeStep(step))];
                    case 22:
                        stepResult = _b.sent();
                        stepResults.push(stepResult);
                        return [4 /*yield*/, __await(this.createStepCompletedEvent(taskId, i, stepResult, startTime))];
                    case 23: 
                    // 发送步骤完成事件
                    return [4 /*yield*/, _b.sent()];
                    case 24:
                        // 发送步骤完成事件
                        _b.sent();
                        return [3 /*break*/, 28];
                    case 25:
                        stepError_1 = _b.sent();
                        return [4 /*yield*/, __await(this.createStepFailedEvent(taskId, i, stepError_1))];
                    case 26: 
                    // 发送步骤失败事件
                    return [4 /*yield*/, _b.sent()];
                    case 27:
                        // 发送步骤失败事件
                        _b.sent();
                        // 根据配置决定是否继续
                        if ((_a = options.configOverrides) === null || _a === void 0 ? void 0 : _a.requireApproval) {
                            // 需要用户批准时抛出错误
                            throw stepError_1;
                        }
                        return [3 /*break*/, 28];
                    case 28:
                        i++;
                        return [3 /*break*/, 16];
                    case 29: return [4 /*yield*/, __await(this.generateFinalResult(stepResults))];
                    case 30:
                        finalResult = _b.sent();
                        return [4 /*yield*/, __await(this.createTaskCompletedEvent(taskId, finalResult, startTime, parsedSteps.length, stepResults.length))];
                    case 31: 
                    // 发送任务完成事件
                    return [4 /*yield*/, _b.sent()];
                    case 32:
                        // 发送任务完成事件
                        _b.sent();
                        return [4 /*yield*/, __await(this.createTaskEndedEvent(taskId, startTime))];
                    case 33: 
                    // 发送任务结束事件
                    return [4 /*yield*/, _b.sent()];
                    case 34:
                        // 发送任务结束事件
                        _b.sent();
                        return [4 /*yield*/, __await(finalResult)];
                    case 35: return [2 /*return*/, _b.sent()];
                    case 36:
                        error_1 = _b.sent();
                        return [4 /*yield*/, __await(this.createTaskFailedEvent(taskId, error_1, startTime))];
                    case 37: 
                    // 发送任务失败事件
                    return [4 /*yield*/, _b.sent()];
                    case 38:
                        // 发送任务失败事件
                        _b.sent();
                        return [4 /*yield*/, __await(this.createTaskEndedEvent(taskId, startTime))];
                    case 39: 
                    // 发送任务结束事件
                    return [4 /*yield*/, _b.sent()];
                    case 40:
                        // 发送任务结束事件
                        _b.sent();
                        throw error_1;
                    case 41: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 保持向后兼容的startTask方法
     * 包装executeTask的异步生成器，返回Promise
     */
    EnhancedTaskEngine.prototype.startTask = function (description, config) {
        return __awaiter(this, void 0, void 0, function () {
            var events, finalResult, _a, events_1, events_1_1, event_1, e_1_1;
            var _b, e_1, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        events = this.executeTask(description, {
                            configOverrides: {
                                autoExecute: config.autoExecute !== false,
                                requireApproval: config.requireApproval || false,
                                enableEventStream: false, // 兼容模式下不启用事件流
                                cancellable: false
                            }
                        });
                        finalResult = null;
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 6, 7, 12]);
                        _a = true, events_1 = __asyncValues(events);
                        _e.label = 2;
                    case 2: return [4 /*yield*/, events_1.next()];
                    case 3:
                        if (!(events_1_1 = _e.sent(), _b = events_1_1.done, !_b)) return [3 /*break*/, 5];
                        _d = events_1_1.value;
                        _a = false;
                        event_1 = _d;
                        // 如果任务完成，保存结果
                        if (event_1.type === 'task_completed') {
                            finalResult = event_1.result;
                        }
                        // 如果任务失败，抛出错误
                        if (event_1.type === 'task_failed') {
                            throw new Error(event_1.error);
                        }
                        _e.label = 4;
                    case 4:
                        _a = true;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 12];
                    case 6:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 12];
                    case 7:
                        _e.trys.push([7, , 10, 11]);
                        if (!(!_a && !_b && (_c = events_1.return))) return [3 /*break*/, 9];
                        return [4 /*yield*/, _c.call(events_1)];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 11: return [7 /*endfinally*/];
                    case 12:
                        if (!finalResult) {
                            throw new Error('Task completed without result');
                        }
                        return [2 /*return*/, finalResult];
                }
            });
        });
    };
    /**
     * 取消正在执行的任务
     */
    EnhancedTaskEngine.prototype.cancelTask = function (taskId) {
        var task = this.activeTasks.get(taskId);
        if (task) {
            task.cancelled = true;
            return true;
        }
        return false;
    };
    /**
     * 获取任务状态
     */
    EnhancedTaskEngine.prototype.getTaskStatus = function (taskId) {
        var task = this.activeTasks.get(taskId);
        if (!task)
            return null;
        // 这里可以扩展为更详细的状态跟踪
        return {
            status: 'running',
            progress: 0,
            events: 0
        };
    };
    // ==================== 事件创建辅助方法 ====================
    EnhancedTaskEngine.prototype.createTaskStartedEvent = function (taskId, description, timestamp) {
        return {
            type: 'task_started',
            taskId: taskId,
            description: description,
            timestamp: timestamp
        };
    };
    EnhancedTaskEngine.prototype.createAnalyzingProjectEvent = function (taskId, timestamp) {
        return {
            type: 'analyzing_project',
            status: 'executing',
            timestamp: timestamp,
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createProjectAnalyzedEvent = function (taskId, context) {
        return {
            type: 'project_analyzed',
            context: {
                files: context.files || 0,
                directories: context.directories || 0,
                languages: context.languages || [],
                dependencies: context.dependencies || []
            },
            timestamp: Date.now(),
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createConsultingAIEvent = function (taskId, timestamp) {
        return {
            type: 'consulting_ai',
            status: 'executing',
            timestamp: timestamp,
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createAIResponseReceivedEvent = function (taskId, response) {
        return {
            type: 'ai_response_received',
            content: response.content || '',
            tokenCount: response.tokenCount,
            timestamp: Date.now(),
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createStepsParsedEvent = function (taskId, steps) {
        return {
            type: 'steps_parsed',
            count: steps.length,
            steps: steps,
            timestamp: Date.now(),
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createStepStartedEvent = function (taskId, stepIndex, step, totalSteps) {
        return {
            type: 'step_started',
            stepIndex: stepIndex,
            step: step,
            totalSteps: totalSteps,
            timestamp: Date.now(),
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createStepCompletedEvent = function (taskId, stepIndex, result, startTime) {
        return {
            type: 'step_completed',
            stepIndex: stepIndex,
            result: result,
            duration: Date.now() - startTime,
            timestamp: Date.now(),
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createStepFailedEvent = function (taskId, stepIndex, error) {
        return {
            type: 'step_failed',
            stepIndex: stepIndex,
            error: error.message || String(error),
            retryable: true,
            timestamp: Date.now(),
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createTaskCompletedEvent = function (taskId, result, startTime, totalSteps, completedSteps) {
        return {
            type: 'task_completed',
            result: result,
            duration: Date.now() - startTime,
            completedSteps: completedSteps,
            totalSteps: totalSteps,
            timestamp: Date.now(),
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createTaskFailedEvent = function (taskId, error, startTime) {
        return {
            type: 'task_failed',
            error: error.message || String(error),
            duration: Date.now() - startTime,
            timestamp: Date.now(),
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createTaskEndedEvent = function (taskId, startTime) {
        return {
            type: 'task_ended',
            timestamp: Date.now(),
            taskId: taskId
        };
    };
    EnhancedTaskEngine.prototype.createTaskProgressEvent = function (taskId, progress, message) {
        return {
            type: 'task_progress',
            progress: progress,
            message: message,
            timestamp: Date.now(),
            taskId: taskId
        };
    };
    // ==================== 任务执行核心方法（重用现有逻辑） ====================
    EnhancedTaskEngine.prototype.analyzeProjectWithContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 重用现有TaskEngine的项目分析逻辑
                // 这里简化实现，实际应该调用this.taskEngine的相应方法
                return [2 /*return*/, {
                        files: 10,
                        directories: 2,
                        languages: ['TypeScript', 'JavaScript'],
                        dependencies: ['axios']
                    }];
            });
        });
    };
    EnhancedTaskEngine.prototype.getAIResponse = function (description, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 重用现有TaskEngine的AI调用逻辑
                // 这里简化实现
                return [2 /*return*/, {
                        content: "AI response for: ".concat(description),
                        tokenCount: 100
                    }];
            });
        });
    };
    EnhancedTaskEngine.prototype.parseAIResponse = function (response) {
        // 重用现有TaskEngine的步骤解析逻辑
        // 这里简化实现
        return [
            {
                type: 'info',
                description: 'Step 1: Analyze requirements',
                status: 'pending',
                data: { action: 'analyze' }
            },
            {
                type: 'info',
                description: 'Step 2: Implement solution',
                status: 'pending',
                data: { action: 'implement' }
            }
        ];
    };
    EnhancedTaskEngine.prototype.executeStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 重用现有TaskEngine的步骤执行逻辑
                // 这里简化实现
                return [2 /*return*/, { success: true, result: "Executed: ".concat(step.description) }];
            });
        });
    };
    EnhancedTaskEngine.prototype.generateFinalResult = function (stepResults) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 重用现有TaskEngine的结果生成逻辑
                // 这里简化实现
                return [2 /*return*/, {
                        success: true,
                        steps: stepResults.map(function (r, i) { return ({
                            type: 'info',
                            description: "Step ".concat(i + 1),
                            status: 'completed',
                            result: JSON.stringify(r),
                            data: { index: i, result: r }
                        }); }),
                        output: stepResults.map(function (r) { return JSON.stringify(r); }).join('\n'),
                        summary: 'Task completed successfully'
                    }];
            });
        });
    };
    /**
     * 流式任务执行（高级API）
     * 返回StreamTaskResult，包含详细统计信息
     */
    EnhancedTaskEngine.prototype.executeTaskWithStream = function (description_1) {
        return __awaiter(this, arguments, void 0, function (description, options) {
            var taskId, startTime, events, generator, finalResult, error, _a, generator_1, generator_1_1, event_2, task, e_2_1, duration, completedSteps, failedSteps, totalSteps, err_1;
            var _b, e_2, _c, _d;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        taskId = options.taskId || this.generateTaskId();
                        startTime = Date.now();
                        events = [];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 14, , 15]);
                        generator = this.executeTask(description, __assign(__assign({}, options), { taskId: taskId }));
                        this.activeTasks.set(taskId, { generator: generator, cancelled: false });
                        finalResult = void 0;
                        error = void 0;
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 7, 8, 13]);
                        _a = true, generator_1 = __asyncValues(generator);
                        _e.label = 3;
                    case 3: return [4 /*yield*/, generator_1.next()];
                    case 4:
                        if (!(generator_1_1 = _e.sent(), _b = generator_1_1.done, !_b)) return [3 /*break*/, 6];
                        _d = generator_1_1.value;
                        _a = false;
                        event_2 = _d;
                        events.push(event_2);
                        // 调用事件回调
                        if (options.onEvent) {
                            options.onEvent(event_2);
                        }
                        // 处理进度回调
                        if (event_2.type === 'task_progress' && options.onProgress) {
                            options.onProgress(event_2.progress, event_2.message);
                        }
                        // 保存最终结果
                        if (event_2.type === 'task_completed') {
                            finalResult = event_2.result;
                        }
                        // 保存错误信息
                        if (event_2.type === 'task_failed') {
                            error = event_2.error;
                        }
                        task = this.activeTasks.get(taskId);
                        if (task === null || task === void 0 ? void 0 : task.cancelled) {
                            // 发送取消事件
                            events.push({
                                type: 'task_cancelled',
                                reason: 'User requested cancellation',
                                timestamp: Date.now(),
                                taskId: taskId
                            });
                            return [3 /*break*/, 6];
                        }
                        _e.label = 5;
                    case 5:
                        _a = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_2_1 = _e.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _e.trys.push([8, , 11, 12]);
                        if (!(!_a && !_b && (_c = generator_1.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _c.call(generator_1)];
                    case 9:
                        _e.sent();
                        _e.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_2) throw e_2.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13:
                        // 清理活动任务
                        this.activeTasks.delete(taskId);
                        duration = Date.now() - startTime;
                        completedSteps = events.filter(function (e) { return e.type === 'step_completed'; }).length;
                        failedSteps = events.filter(function (e) { return e.type === 'step_failed'; }).length;
                        totalSteps = events.filter(function (e) { return e.type === 'step_started'; }).length;
                        return [2 /*return*/, {
                                taskId: taskId,
                                result: finalResult,
                                error: error,
                                eventCount: events.length,
                                duration: duration,
                                status: error ? 'failed' : finalResult ? 'completed' : 'cancelled',
                                steps: {
                                    total: totalSteps,
                                    completed: completedSteps,
                                    failed: failedSteps
                                }
                            }];
                    case 14:
                        err_1 = _e.sent();
                        this.activeTasks.delete(taskId);
                        throw err_1;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    return EnhancedTaskEngine;
}());
exports.EnhancedTaskEngine = EnhancedTaskEngine;
