"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WelcomeView = function (_a) {
    var onGetStarted = _a.onGetStarted;
    var examplePrompts = [
        'Create a React component for a login form',
        'Write a Python function to process CSV data',
        'Explain how async/await works in JavaScript',
        'Help me debug this TypeScript error',
        'Design a database schema for a todo app',
    ];
    var features = [
        {
            title: 'AI-Powered Coding',
            description: 'Get intelligent code suggestions and explanations',
            icon: '💡'
        },
        {
            title: 'Context-Aware',
            description: 'Understands your project structure and codebase',
            icon: '📁'
        },
        {
            title: 'Multi-Model Support',
            description: 'Works with DeepSeek, Claude, GPT, and Qwen',
            icon: '🤖'
        },
        {
            title: 'Real-Time Feedback',
            description: 'Get instant responses as you code',
            icon: '⚡'
        },
    ];
    return (<div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full border border-border bg-secondary px-4 py-2">
            <span className="mr-2">✨</span>
            <span className="text-sm">New & Improved</span>
          </div>
          
          <h1 className="mb-4 text-4xl font-bold">
            Welcome to <span className="text-primary">CodeLine</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Your intelligent coding assistant that combines Cline's autonomous capabilities 
            with advanced AI models to help you code faster and smarter.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-semibold">Why Choose CodeLine?</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map(function (feature, index) { return (<div key={index} className="rounded-lg border border-border p-6 hover:bg-secondary/50">
                <div className="mb-4 text-2xl">{feature.icon}</div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>); })}
          </div>
        </div>

        {/* Quick Start */}
        <div className="mb-12">
          <h2 className="mb-6 text-center text-2xl font-semibold">Quick Start</h2>
          <div className="rounded-lg border border-border bg-secondary p-8">
            <div className="mb-6 text-center">
              <p className="text-lg">
                Try asking CodeLine anything about coding, or pick an example:
              </p>
            </div>
            
            <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {examplePrompts.map(function (prompt, index) { return (<button key={index} className="rounded-lg border border-border bg-background p-4 text-left hover:bg-background/80" onClick={onGetStarted}>
                  <p className="text-sm">{prompt}</p>
                </button>); })}
            </div>

            <div className="flex justify-center">
              <button onClick={onGetStarted} className="rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground hover:bg-primary/90">
                Get Started with CodeLine
              </button>
            </div>
          </div>
        </div>

        {/* Setup Tips */}
        <div className="rounded-lg border border-border p-6">
          <h3 className="mb-4 text-xl font-semibold">Quick Setup Tips</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">1.</span>
              <span>
                <strong>Configure your API key</strong> in Settings to enable AI models
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">2.</span>
              <span>
                <strong>Use @ references</strong> like <code>@file</code>, <code>@problems</code> to provide context
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">3.</span>
              <span>
                <strong>Try example tasks</strong> to see CodeLine in action
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 mt-1 text-primary">4.</span>
              <span>
                <strong>Check the History</strong> to review past conversations
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>);
};
exports.default = WelcomeView;
