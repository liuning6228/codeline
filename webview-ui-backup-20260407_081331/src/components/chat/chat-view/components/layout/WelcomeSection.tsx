/**
 * WelcomeSection - Welcome/landing page for the chat
 * Based on Cline's WelcomeSection component
 */

import React from 'react';

interface WelcomeSectionProps {
  onNavigate?: (view: string) => void;
  taskHistory?: any[];
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ 
  onNavigate,
  taskHistory = [] 
}) => {
  return (
    <div className="flex-1 overflow-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            Welcome to CodeLine
          </h1>
          <p className="text-sm text-description">
            Your AI-powered coding assistant
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-sm font-medium mb-3 text-foreground">Quick Actions</h2>
          <div className="grid gap-2">
            <QuickActionButton
              title="Explain Code"
              description="Ask me to explain selected code"
              onClick={() => onNavigate?.('chat')}
            />
            <QuickActionButton
              title="Fix Bugs"
              description="Find and fix issues in your code"
              onClick={() => onNavigate?.('chat')}
            />
            <QuickActionButton
              title="Write Tests"
              description="Generate tests for your code"
              onClick={() => onNavigate?.('chat')}
            />
            <QuickActionButton
              title="Refactor"
              description="Improve code quality and structure"
              onClick={() => onNavigate?.('chat')}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="mb-8">
          <h2 className="text-sm font-medium mb-3 text-foreground">Tips</h2>
          <div className="bg-code rounded-md p-4 text-sm">
            <ul className="space-y-2 text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-cline">@</span>
                <span>Use <code className="text-preformat">@filename</code> to reference files</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cline">/</span>
                <span>Type <code className="text-preformat">/</code> for quick commands</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cline">Plan</span>
                <span>Switch to Plan mode for complex tasks</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Recent Tasks */}
        {taskHistory.length > 0 && (
          <div>
            <h2 className="text-sm font-medium mb-3 text-foreground">Recent Tasks</h2>
            <div className="space-y-2">
              {taskHistory.slice(0, 5).map((task, index) => (
                <div
                  key={task.id || index}
                  className="p-3 bg-code rounded-md hover:bg-list-hover cursor-pointer transition-colors"
                  onClick={() => onNavigate?.('chat')}
                >
                  <div className="text-sm text-foreground truncate">
                    {task.task || task.description}
                  </div>
                  <div className="text-xs text-description mt-1">
                    {task.ts ? new Date(task.ts).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Action Button component
const QuickActionButton: React.FC<{
  title: string;
  description: string;
  onClick?: () => void;
}> = ({ title, description, onClick }) => (
  <button
    className="flex items-center gap-3 p-3 bg-code rounded-md hover:bg-list-hover transition-colors text-left w-full"
    onClick={onClick}
  >
    <div className="w-8 h-8 rounded bg-button-secondary flex items-center justify-center text-button-secondary-foreground text-sm">
      {title.charAt(0)}
    </div>
    <div>
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="text-xs text-description">{description}</div>
    </div>
  </button>
);

export default WelcomeSection;
