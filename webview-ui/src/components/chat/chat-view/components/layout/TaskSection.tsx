/**
 * TaskSection - Task execution display area
 * Shows task header, progress, and metrics
 */

import React from 'react';

interface TaskSectionProps {
  task?: {
    text?: string;
    status?: string;
  };
  apiMetrics?: {
    totalCost?: number;
    totalTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
  };
  isProcessing?: boolean;
  progress?: number;
  progressMessage?: string;
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  task,
  apiMetrics,
  isProcessing,
  progress,
  progressMessage,
}) => {
  if (!task) return null;

  return (
    <div className="border-b border-border px-4 py-3">
      {/* Task Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="w-3 h-3 rounded-full bg-cline animate-pulse" />
          )}
          <h3 className="text-sm font-medium text-foreground truncate max-w-md">
            {task.text || 'Current Task'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {apiMetrics && (
            <div className="text-xs text-description">
              {apiMetrics.totalCost !== undefined && (
                <span className="mr-2">${apiMetrics.totalCost.toFixed(4)}</span>
              )}
              {apiMetrics.totalTokens !== undefined && (
                <span>{apiMetrics.totalTokens.toLocaleString()} tokens</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && progress !== undefined && (
        <div className="mb-2">
          <div className="h-1 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-cline transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progressMessage && (
            <div className="text-xs text-description mt-1">
              {progressMessage}
            </div>
          )}
        </div>
      )}

      {/* Status */}
      {task.status && (
        <div className="text-xs text-description">
          Status: {task.status}
        </div>
      )}
    </div>
  );
};

export default TaskSection;
