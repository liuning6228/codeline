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
exports.useTaskState = void 0;
var react_1 = require("react");
var initialState = {
    taskId: null,
    status: 'idle',
    description: '',
    progress: 0,
    currentStep: 0,
    totalSteps: 0,
    steps: [],
    stepResults: [],
    events: [],
    startTime: null,
    endTime: null,
    error: undefined,
};
var useTaskState = function () {
    var _a = (0, react_1.useState)(initialState), taskState = _a[0], setTaskState = _a[1];
    // 处理任务事件
    var handleTaskEvent = (0, react_1.useCallback)(function (event) {
        console.log('Task event received:', event);
        setTaskState(function (prev) {
            var newEvents = __spreadArray(__spreadArray([], prev.events, true), [event], false);
            // 根据事件类型更新状态
            switch (event.type) {
                case 'task_started':
                    return __assign(__assign({}, initialState), { taskId: event.taskId, description: event.description, status: 'starting', progress: 0, events: newEvents, startTime: event.timestamp });
                case 'analyzing_project':
                    return __assign(__assign({}, prev), { status: event.status === 'executing' ? 'analyzing' : prev.status, events: newEvents });
                case 'project_analyzed':
                    return __assign(__assign({}, prev), { events: newEvents });
                case 'consulting_ai':
                    return __assign(__assign({}, prev), { status: event.status === 'executing' ? 'consulting' : prev.status, events: newEvents });
                case 'ai_response_received':
                    return __assign(__assign({}, prev), { events: newEvents });
                case 'steps_parsed':
                    var steps = event.steps || [];
                    var stepResults = steps.map(function (_, index) { return ({
                        index: index,
                        status: 'pending',
                    }); });
                    return __assign(__assign({}, prev), { steps: steps, stepResults: stepResults, totalSteps: event.count, events: newEvents });
                case 'step_started':
                    var stepResultsStarted = __spreadArray([], prev.stepResults, true);
                    if (stepResultsStarted[event.stepIndex]) {
                        stepResultsStarted[event.stepIndex] = __assign(__assign({}, stepResultsStarted[event.stepIndex]), { status: 'executing' });
                    }
                    return __assign(__assign({}, prev), { status: 'executing', currentStep: event.stepIndex + 1, stepResults: stepResultsStarted, events: newEvents });
                case 'step_completed':
                    var stepResultsCompleted = __spreadArray([], prev.stepResults, true);
                    if (stepResultsCompleted[event.stepIndex]) {
                        stepResultsCompleted[event.stepIndex] = __assign(__assign({}, stepResultsCompleted[event.stepIndex]), { status: 'completed', result: event.result });
                    }
                    // 计算进度
                    var completedSteps = stepResultsCompleted.filter(function (s) { return s.status === 'completed'; }).length;
                    var progress = prev.totalSteps > 0
                        ? Math.floor((completedSteps / prev.totalSteps) * 100)
                        : prev.progress;
                    return __assign(__assign({}, prev), { stepResults: stepResultsCompleted, progress: progress, events: newEvents });
                case 'step_failed':
                    var stepResultsFailed = __spreadArray([], prev.stepResults, true);
                    if (stepResultsFailed[event.stepIndex]) {
                        stepResultsFailed[event.stepIndex] = __assign(__assign({}, stepResultsFailed[event.stepIndex]), { status: 'failed', error: event.error });
                    }
                    return __assign(__assign({}, prev), { stepResults: stepResultsFailed, events: newEvents });
                case 'task_progress':
                    return __assign(__assign({}, prev), { progress: event.progress, events: newEvents });
                case 'task_completed':
                    return __assign(__assign({}, prev), { status: 'completed', progress: 100, endTime: event.timestamp, events: newEvents });
                case 'task_failed':
                    return __assign(__assign({}, prev), { status: 'failed', error: event.error, endTime: event.timestamp, events: newEvents });
                case 'task_cancelled':
                    return __assign(__assign({}, prev), { status: 'cancelled', endTime: event.timestamp, events: newEvents });
                case 'task_ended':
                    return __assign(__assign({}, prev), { endTime: prev.endTime || event.timestamp, events: newEvents });
                default:
                    return __assign(__assign({}, prev), { events: newEvents });
            }
        });
    }, []);
    // 启动任务
    var startTask = (0, react_1.useCallback)(function (description) {
        // 这里应该通过VS Code API发送任务开始命令
        // 实际的事件将通过handleTaskEvent处理
        console.log('Starting task:', description);
        // 创建初始任务开始事件
        var startEvent = {
            type: 'task_started',
            taskId: "task_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
            description: description,
            timestamp: Date.now(),
        };
        handleTaskEvent(startEvent);
    }, [handleTaskEvent]);
    // 取消任务
    var cancelTask = (0, react_1.useCallback)(function () {
        // 这里应该通过VS Code API发送取消命令
        console.log('Cancelling task:', taskState.taskId);
        var cancelEvent = {
            type: 'task_cancelled',
            reason: 'User requested cancellation',
            timestamp: Date.now(),
            taskId: taskState.taskId || undefined,
        };
        handleTaskEvent(cancelEvent);
    }, [taskState.taskId, handleTaskEvent]);
    // 重试步骤
    var retryStep = (0, react_1.useCallback)(function (stepIndex) {
        console.log('Retrying step:', stepIndex);
        // 这里应该通过VS Code API发送重试命令
        // 暂时只更新本地状态
        setTaskState(function (prev) {
            var stepResults = __spreadArray([], prev.stepResults, true);
            if (stepResults[stepIndex]) {
                stepResults[stepIndex] = __assign(__assign({}, stepResults[stepIndex]), { status: 'pending', error: undefined });
            }
            return __assign(__assign({}, prev), { stepResults: stepResults });
        });
    }, []);
    // 清除任务状态
    var clearTask = (0, react_1.useCallback)(function () {
        setTaskState(initialState);
    }, []);
    // 设置任务描述
    var setTaskDescription = (0, react_1.useCallback)(function (description) {
        setTaskState(function (prev) { return (__assign(__assign({}, prev), { description: description })); });
    }, []);
    // 获取任务统计
    var getTaskStats = (0, react_1.useCallback)(function () {
        var completedSteps = taskState.stepResults.filter(function (s) { return s.status === 'completed'; }).length;
        var failedSteps = taskState.stepResults.filter(function (s) { return s.status === 'failed'; }).length;
        var totalSteps = taskState.stepResults.length;
        var duration = 0;
        if (taskState.startTime) {
            var endTime = taskState.endTime || Date.now();
            duration = Math.floor((endTime - taskState.startTime) / 1000);
        }
        return {
            completedSteps: completedSteps,
            failedSteps: failedSteps,
            totalSteps: totalSteps,
            duration: duration,
            progress: taskState.progress,
            eventCount: taskState.events.length,
        };
    }, [taskState]);
    // 导出状态和操作
    return {
        taskState: taskState,
        setTaskState: setTaskState,
        handleTaskEvent: handleTaskEvent,
        startTask: startTask,
        cancelTask: cancelTask,
        retryStep: retryStep,
        clearTask: clearTask,
        setTaskDescription: setTaskDescription,
        getTaskStats: getTaskStats,
    };
};
exports.useTaskState = useTaskState;
