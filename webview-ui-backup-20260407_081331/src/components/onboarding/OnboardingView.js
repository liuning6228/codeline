"use strict";
/**
 * 引导设置视图
 * 基于Cline的引导功能
 * 提供首次使用的逐步配置向导
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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var OnboardingView = function (_a) {
    var config = _a.config, onNavigate = _a.onNavigate;
    var _b = (0, react_1.useState)(0), currentStepIndex = _b[0], setCurrentStepIndex = _b[1];
    var _c = (0, react_1.useState)([]), steps = _c[0], setSteps = _c[1];
    var _d = (0, react_1.useState)(false), isCompleted = _d[0], setIsCompleted = _d[1];
    // 初始化引导步骤
    (0, react_1.useEffect)(function () {
        if (config.enabled) {
            var initializedSteps = config.steps.map(function (step) { return (__assign(__assign({}, step), { completed: false })); });
            setSteps(initializedSteps);
        }
    }, [config]);
    // 标记步骤为完成
    var completeStep = function (stepId) {
        setSteps(function (prev) { return prev.map(function (step) {
            if (step.id === stepId) {
                return __assign(__assign({}, step), { completed: true });
            }
            return step;
        }); });
    };
    // 下一步
    var goToNextStep = function () {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
        else {
            // 所有步骤完成
            setIsCompleted(true);
        }
    };
    // 上一步
    var goToPreviousStep = function () {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };
    // 跳过引导
    var skipOnboarding = function () {
        if (config.allowSkip) {
            var defaultView = config.defaultViewAfterOnboarding || 'chat';
            onNavigate === null || onNavigate === void 0 ? void 0 : onNavigate(defaultView);
        }
    };
    // 完成引导
    var finishOnboarding = function () {
        var defaultView = config.defaultViewAfterOnboarding || 'chat';
        onNavigate === null || onNavigate === void 0 ? void 0 : onNavigate(defaultView);
    };
    // 计算进度
    var calculateProgress = function () {
        if (steps.length === 0)
            return 0;
        var completedSteps = steps.filter(function (step) { return step.completed; }).length;
        return Math.round((completedSteps / steps.length) * 100);
    };
    // 获取当前步骤
    var currentStep = steps[currentStepIndex];
    if (!config.enabled) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Onboarding Disabled</div>
          <div className="text-gray-400 mb-4">
            The onboarding wizard is currently disabled
          </div>
          {onNavigate && (<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90" onClick={function () { return onNavigate('chat'); }}>
              Go to Chat
            </button>)}
        </div>
      </div>);
    }
    if (isCompleted) {
        return (<div className="flex h-full flex-col items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <div className="text-2xl">🎉</div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Setup Complete!</h1>
          
          <div className="text-lg text-gray-400 mb-8">
            You're all set to use CodeLine. Your AI coding assistant is ready to help you with:
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="font-medium mb-2">💬 Chat Assistance</div>
              <div className="text-sm text-gray-400">Ask questions and get code help</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="font-medium mb-2">🔧 Task Automation</div>
              <div className="text-sm text-gray-400">Automate coding tasks and refactoring</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="font-medium mb-2">📁 File Management</div>
              <div className="text-sm text-gray-400">Read, write, and organize files</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="font-medium mb-2">🔌 Tool Integration</div>
              <div className="text-sm text-gray-400">Connect with external tools via MCP</div>
            </div>
          </div>
          
          <button onClick={finishOnboarding} className="px-8 py-3 bg-primary text-primary-foreground rounded-lg text-lg font-medium hover:bg-primary/90">
            Start Using CodeLine
          </button>
          
          <div className="mt-6 text-sm text-gray-400">
            You can always change these settings later in the Settings view
          </div>
        </div>
      </div>);
    }
    // 渲染步骤内容
    var renderStepContent = function (step) {
        switch (step.id) {
            case 'welcome':
                return (<div className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <div className="text-3xl">👋</div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Welcome to CodeLine!</h2>
            
            <div className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              CodeLine is your AI-powered coding assistant that helps you write, debug, and understand code faster.
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <div className="text-xs">🤖</div>
                </div>
                <div className="text-left">
                  <div className="font-medium">AI-Powered Assistance</div>
                  <div className="text-sm text-gray-400">Get intelligent code suggestions and explanations</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="text-xs">⚡</div>
                </div>
                <div className="text-left">
                  <div className="font-medium">Task Automation</div>
                  <div className="text-sm text-gray-400">Automate repetitive coding tasks</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <div className="text-xs">🔧</div>
                </div>
                <div className="text-left">
                  <div className="font-medium">Tool Integration</div>
                  <div className="text-sm text-gray-400">Connect with your existing development tools</div>
                </div>
              </div>
            </div>
          </div>);
            case 'configure_ai':
                return (<div>
            <h2 className="text-2xl font-bold mb-4">Configure AI Model</h2>
            
            <div className="text-gray-400 mb-8">
              Choose your preferred AI model and set up API access
            </div>
            
            <div className="space-y-6">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">OpenAI GPT Models</div>
                  <div className="px-2 py-1 bg-blue-500/20 text-blue-600 text-xs rounded">Recommended</div>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  Access to GPT-4, GPT-3.5 Turbo, and other OpenAI models
                </div>
                <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded text-sm">
                  Configure API Key
                </button>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <div className="font-medium mb-2">Anthropic Claude Models</div>
                <div className="text-sm text-gray-400 mb-4">
                  Access to Claude 3 Opus, Sonnet, and Haiku
                </div>
                <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded text-sm">
                  Configure API Key
                </button>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <div className="font-medium mb-2">Local Models</div>
                <div className="text-sm text-gray-400 mb-4">
                  Run models locally on your machine (requires GPU)
                </div>
                <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded text-sm">
                  Setup Local Inference
                </button>
              </div>
            </div>
          </div>);
            case 'setup_tools':
                return (<div>
            <h2 className="text-2xl font-bold mb-4">Setup Tools</h2>
            
            <div className="text-gray-400 mb-8">
              Configure the tools CodeLine will use to help you
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="font-medium mb-2">📁 File Operations</div>
                <div className="text-sm text-gray-400 mb-4">Read, write, and search files</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-xs text-gray-400">Enabled by default</span>
                </div>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <div className="font-medium mb-2">💻 Terminal</div>
                <div className="text-sm text-gray-400 mb-4">Execute commands and scripts</div>
                <button className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-xs">
                  Enable
                </button>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <div className="font-medium mb-2">🌐 Browser</div>
                <div className="text-sm text-gray-400 mb-4">Automate web interactions</div>
                <button className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-xs">
                  Enable
                </button>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <div className="font-medium mb-2">🔌 MCP Tools</div>
                <div className="text-sm text-gray-400 mb-4">Connect external tools and services</div>
                <button className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-xs">
                  Configure
                </button>
              </div>
            </div>
          </div>);
            case 'preferences':
                return (<div>
            <h2 className="text-2xl font-bold mb-4">Set Preferences</h2>
            
            <div className="text-gray-400 mb-8">
              Customize your CodeLine experience
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="font-medium mb-2">Theme</div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                    Dark
                  </button>
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded">
                    Light
                  </button>
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded">
                    System
                  </button>
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-2">Default Task Mode</div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                    Auto Execute
                  </button>
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded">
                    Manual Approval
                  </button>
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded">
                    Step by Step
                  </button>
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-2">Notifications</div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked/>
                    <span className="text-sm">Show task completion notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked/>
                    <span className="text-sm">Show error notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded"/>
                    <span className="text-sm">Show progress notifications</span>
                  </label>
                </div>
              </div>
            </div>
          </div>);
            default:
                return (<div className="text-center">
            <div className="text-2xl font-bold mb-4">{step.title}</div>
            <div className="text-gray-400">{step.description}</div>
            <button onClick={function () { return completeStep(step.id); }} className="mt-8 px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
              Mark as Complete
            </button>
          </div>);
        }
    };
    if (!currentStep) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-400">Loading onboarding steps...</div>
      </div>);
    }
    var progress = calculateProgress();
    return (<div className="flex h-full flex-col p-8">
      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-400">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <div className="text-sm text-gray-400">{progress}% Complete</div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: "".concat(progress, "%") }}/>
        </div>
      </div>
      
      {/* 步骤指示器 */}
      <div className="flex justify-center space-x-4 mb-12">
        {steps.map(function (step, index) { return (<div key={step.id} className={"flex items-center ".concat(index < steps.length - 1 ? 'flex-1' : '')}>
            <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm ".concat(index === currentStepIndex
                ? 'bg-primary text-primary-foreground'
                : step.completed
                    ? 'bg-green-500/20 text-green-600'
                    : 'bg-secondary text-gray-400')}>
              {step.completed ? '✓' : index + 1}
            </div>
            {index < steps.length - 1 && (<div className={"flex-1 h-1 mx-2 ".concat(step.completed ? 'bg-green-500/20' : 'bg-secondary')}/>)}
          </div>); })}
      </div>
      
      {/* 步骤标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{currentStep.title}</h1>
        <div className="text-lg text-gray-400">{currentStep.description}</div>
        {currentStep.required && (<div className="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-600 text-xs rounded-full">
            Required
          </div>)}
      </div>
      
      {/* 步骤内容 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          {renderStepContent(currentStep)}
        </div>
      </div>
      
      {/* 导航按钮 */}
      <div className="mt-12 flex justify-between">
        <div>
          {currentStepIndex > 0 && (<button onClick={goToPreviousStep} className="px-6 py-2 bg-secondary hover:bg-secondary/80 rounded">
              ← Previous
            </button>)}
        </div>
        
        <div className="flex space-x-4">
          {config.allowSkip && (<button onClick={skipOnboarding} className="px-6 py-2 text-gray-400 hover:text-gray-300">
              Skip Setup
            </button>)}
          
          <button onClick={function () {
            completeStep(currentStep.id);
            goToNextStep();
        }} className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
            {currentStepIndex === steps.length - 1 ? 'Complete Setup' : 'Continue →'}
          </button>
        </div>
      </div>
      
      {/* 步骤说明 */}
      <div className="mt-6 text-center text-sm text-gray-400">
        {currentStep.required ? 'This step is required to use CodeLine.' : 'This step is optional. You can configure it later in Settings.'}
      </div>
    </div>);
};
exports.default = OnboardingView;
