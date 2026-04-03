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
var react_1 = require("react");
var ChatInput_1 = require("./ChatInput");
var MessageList_1 = require("./MessageList");
var ChatHeader_1 = require("./ChatHeader");
var TaskSection_1 = require("../task/TaskSection");
var useTaskState_1 = require("../../hooks/useTaskState");
var vscode_1 = require("../../lib/vscode");
var ChatView = function () {
    var _a = (0, react_1.useState)([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m CodeLine, your AI coding assistant. How can I help you today?',
            timestamp: new Date()
        }
    ]), messages = _a[0], setMessages = _a[1];
    var _b = (0, react_1.useState)(false), isProcessing = _b[0], setIsProcessing = _b[1];
    var messagesEndRef = (0, react_1.useRef)(null);
    // 任务状态管理
    var _c = (0, useTaskState_1.useTaskState)(), taskState = _c.taskState, handleTaskEvent = _c.handleTaskEvent, startTask = _c.startTask, cancelTask = _c.cancelTask, retryStep = _c.retryStep, clearTask = _c.clearTask, setTaskDescription = _c.setTaskDescription;
    // 滚动到底部
    var scrollToBottom = function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    (0, react_1.useEffect)(function () {
        scrollToBottom();
    }, [messages]);
    // 监听来自 VS Code 扩展的消息
    (0, react_1.useEffect)(function () {
        var handleMessage = function (event) {
            var message = event.data;
            console.log('Received message from VSCode:', message);
            switch (message.command) {
                case 'taskResult':
                    // 处理任务结果
                    console.log('Task result:', message.result);
                    // 可以根据需要将任务结果添加到消息中
                    break;
                case 'taskError':
                    // 处理任务错误
                    console.error('Task error:', message.error);
                    // 显示错误消息
                    break;
                case 'task_event':
                    // 处理任务事件
                    if (message.event) {
                        handleTaskEvent(message.event);
                    }
                    break;
                case 'task_progress':
                    // 处理任务进度更新
                    console.log('Task progress:', message.progress, message.message);
                    // 可以更新进度显示
                    break;
                case 'history':
                    // 处理历史记录
                    if (message.messages) {
                        setMessages(message.messages);
                    }
                    break;
                case 'configUpdated':
                    // 处理配置更新
                    console.log('Config updated:', message.config);
                    break;
                case 'typing':
                    // 处理打字指示器
                    setIsProcessing(message.isTyping || false);
                    break;
            }
        };
        window.addEventListener('message', handleMessage);
        return function () {
            window.removeEventListener('message', handleMessage);
        };
    }, [handleTaskEvent]);
    // 处理发送消息
    var handleSendMessage = function (content) { return __awaiter(void 0, void 0, void 0, function () {
        var userMessage, isTaskDescription;
        return __generator(this, function (_a) {
            if (!content.trim() || isProcessing)
                return [2 /*return*/];
            userMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: content,
                timestamp: new Date()
            };
            setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [userMessage], false); });
            setIsProcessing(true);
            // 通过 VS Code API 发送消息
            vscode_1.default.sendMessage(content);
            isTaskDescription = content.length > 20 && (content.toLowerCase().includes('create') ||
                content.toLowerCase().includes('implement') ||
                content.toLowerCase().includes('fix') ||
                content.toLowerCase().includes('add') ||
                content.toLowerCase().includes('refactor') ||
                content.toLowerCase().includes('update'));
            if (isTaskDescription && vscode_1.default.isInVSCode()) {
                // 如果是任务描述，启动任务
                setTaskDescription(content);
                startTask(content);
                // 通过 VS Code API 执行任务
                vscode_1.default.executeTask(content);
            }
            else {
                // 模拟 AI 回复（如果没有 VS Code 环境）
                if (!vscode_1.default.isInVSCode()) {
                    setTimeout(function () {
                        var assistantMessage = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: "I received your message: \"".concat(content, "\". This is a simulated response. In the real implementation, this would connect to an AI model."),
                            timestamp: new Date()
                        };
                        setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [assistantMessage], false); });
                        setIsProcessing(false);
                    }, 1000);
                }
            }
            return [2 /*return*/];
        });
    }); };
    // 清除聊天记录
    var handleClearChat = function () {
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: 'Chat cleared. How can I help you today?',
                timestamp: new Date()
            }
        ]);
        vscode_1.default.clearChat();
    };
    // 处理任务取消
    var handleCancelTask = function () {
        if (vscode_1.default.isInVSCode()) {
            // 通过 VS Code API 取消任务
            // 注意：需要扩展支持取消命令
            vscode_1.default.postMessage({
                command: 'cancelTask',
                taskId: taskState.taskId
            });
        }
        cancelTask();
    };
    // 处理步骤重试
    var handleRetryStep = function (stepIndex) {
        if (vscode_1.default.isInVSCode()) {
            // 通过 VS Code API 重试步骤
            vscode_1.default.postMessage({
                command: 'retryStep',
                taskId: taskState.taskId,
                stepIndex: stepIndex
            });
        }
        retryStep(stepIndex);
    };
    // 处理清除任务
    var handleClearTask = function () {
        clearTask();
    };
    return (<div className="flex h-full flex-col">
      <ChatHeader_1.default onClearChat={handleClearChat}/>
      
      <div className="flex-1 overflow-auto">
        {/* 消息列表 */}
        <div className="p-4">
          <MessageList_1.default messages={messages}/>
          {isProcessing && (<div className="flex items-center space-x-2 p-4 text-gray-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
              <span className="ml-2 text-sm">Thinking...</span>
            </div>)}
          <div ref={messagesEndRef}/>
        </div>
        
        {/* 任务区域 */}
        <TaskSection_1.default taskState={taskState} config={{
            showProgressBar: true,
            showStepsList: true,
            showEventsLog: true,
            autoScroll: true,
            maxVisibleSteps: 5,
            maxVisibleEvents: 10,
        }} onCancelTask={handleCancelTask} onRetryStep={handleRetryStep} onClearTask={handleClearTask}/>
      </div>

      <div className="border-t border-border p-4">
        <ChatInput_1.default onSendMessage={handleSendMessage} disabled={isProcessing}/>
      </div>
    </div>);
};
exports.default = ChatView;
