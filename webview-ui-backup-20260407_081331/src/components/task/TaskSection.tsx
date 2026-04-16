import { useState, useEffect, useRef } from 'react';
import { TaskState, TaskEventUnion, TaskStep, TaskSectionConfig } from './taskTypes';
import './TaskSection.css';

interface TaskSectionProps {
  taskState: TaskState;
  config?: Partial<TaskSectionConfig>;
  onCancelTask?: () => void;
  onRetryStep?: (stepIndex: number) => void;
  onClearTask?: () => void;
}

const defaultConfig: TaskSectionConfig = {
  showProgressBar: true,
  showStepsList: true,
  showEventsLog: false,
  autoScroll: true,
  maxVisibleSteps: 10,
  maxVisibleEvents: 20,
};

const TaskSection: React.FC<TaskSectionProps> = ({
  taskState,
  config = {},
  onCancelTask,
  onRetryStep,
  onClearTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEventsExpanded, setIsEventsExpanded] = useState(false);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  
  const mergedConfig = { ...defaultConfig, ...config };
  
  // 自动滚动到底部
  useEffect(() => {
    if (mergedConfig.autoScroll && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [taskState.events, mergedConfig.autoScroll]);

  // 计算任务持续时间
  const getTaskDuration = () => {
    if (!taskState.startTime) return 0;
    const endTime = taskState.endTime || Date.now();
    return Math.floor((endTime - taskState.startTime) / 1000); // 秒
  };

  // 格式化持续时间
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // 获取状态图标
  const getStatusIcon = () => {
    switch (taskState.status) {
      case 'idle':
        return '⏸️';
      case 'starting':
        return '🚀';
      case 'analyzing':
        return '🔍';
      case 'consulting':
        return '🤖';
      case 'executing':
        return '⚡';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '⏹️';
      default:
        return '🔵';
    }
  };

  // 获取状态颜色
  const getStatusColor = () => {
    switch (taskState.status) {
      case 'idle':
        return 'text-gray-500';
      case 'starting':
      case 'analyzing':
      case 'consulting':
      case 'executing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'cancelled':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // 获取步骤状态图标
  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'executing':
        return '⚡';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '🔵';
    }
  };

  // 获取步骤状态颜色
  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'executing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // 获取事件图标
  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      'task_started': '🚀',
      'analyzing_project': '🔍',
      'project_analyzed': '📊',
      'consulting_ai': '🤖',
      'ai_response_received': '💬',
      'steps_parsed': '📝',
      'step_started': '⚡',
      'step_completed': '✅',
      'step_failed': '❌',
      'task_completed': '🎉',
      'task_failed': '💥',
      'task_ended': '🏁',
      'task_cancelled': '⏹️',
      'task_progress': '📈',
    };
    return icons[type] || '📌';
  };

  // 获取事件颜色
  const getEventColor = (type: string) => {
    if (type.includes('failed')) return 'text-red-500';
    if (type.includes('completed')) return 'text-green-500';
    if (type.includes('cancelled')) return 'text-yellow-500';
    if (type.includes('progress') || type.includes('started')) return 'text-blue-500';
    return 'text-gray-500';
  };

  // 事件简化显示
  const getEventSummary = (event: TaskEventUnion) => {
    switch (event.type) {
      case 'task_started':
        return `Task started: ${(event as any).description}`;
      case 'analyzing_project':
        return `Analyzing project...`;
      case 'project_analyzed':
        const ctx = (event as any).context;
        return `Project analyzed: ${ctx.files} files, ${ctx.languages.join(', ')}`;
      case 'consulting_ai':
        return `Consulting AI...`;
      case 'ai_response_received':
        return `AI response received`;
      case 'steps_parsed':
        return `Steps parsed: ${(event as any).count} steps`;
      case 'step_started':
        const step = (event as any).step;
        return `Step ${(event as any).stepIndex + 1} started: ${step.description}`;
      case 'step_completed':
        return `Step ${(event as any).stepIndex + 1} completed`;
      case 'step_failed':
        return `Step ${(event as any).stepIndex + 1} failed: ${(event as any).error}`;
      case 'task_completed':
        return `Task completed in ${formatDuration((event as any).duration / 1000)}`;
      case 'task_failed':
        return `Task failed: ${(event as any).error}`;
      case 'task_cancelled':
        return `Task cancelled: ${(event as any).reason || 'User requested'}`;
      case 'task_progress':
        return `Progress: ${(event as any).progress}% - ${(event as any).message}`;
      default:
        return event.type;
    }
  };

  // 如果没有活动任务，不显示组件
  if (taskState.status === 'idle' && taskState.events.length === 0) {
    return null;
  }

  const visibleSteps = mergedConfig.showStepsList ? 
    taskState.stepResults.slice(0, mergedConfig.maxVisibleSteps) : [];
  const visibleEvents = mergedConfig.showEventsLog ?
    taskState.events.slice(-mergedConfig.maxVisibleEvents) : [];

  return (
    <div className="task-section cline-slide-in border-t border-[#2a2a2a] bg-gradient-to-b from-[#1a1a1a] to-[#151515]">
      {/* 头部 - Cline风格 */}
      <div 
        className="task-section-header flex items-center justify-between cursor-pointer cline-slide-in"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <span className="text-lg bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            {getStatusIcon()}
          </span>
          <div>
            <h3 className={`font-medium text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent`}>
              {taskState.status === 'idle' ? '📋 Task History' : `🚀 Task: ${taskState.description}`}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-[#888888] mt-1">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Status: {taskState.status}</span>
              </span>
              {taskState.taskId && (
                <span className="px-1.5 py-0.5 bg-[#2a2a2a] rounded text-xs">
                  ID: {taskState.taskId.substring(0, 8)}...
                </span>
              )}
              {taskState.startTime && (
                <span>⏱️ {formatDuration(getTaskDuration())}</span>
              )}
              <span>📈 {taskState.progress}%</span>
              {taskState.totalSteps > 0 && (
                <span>📋 {taskState.currentStep}/{taskState.totalSteps}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {taskState.status === 'executing' && onCancelTask && (
            <button
              className="cline-button cline-button-danger"
              onClick={(e) => {
                e.stopPropagation();
                onCancelTask();
              }}
            >
              Cancel
            </button>
          )}
          
          {onClearTask && (taskState.status === 'completed' || taskState.status === 'failed' || taskState.status === 'cancelled') && (
            <button
              className="cline-button cline-button-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onClearTask();
              }}
            >
              Clear
            </button>
          )}
          
          <span className="text-[#666666] transform transition-transform">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {/* 折叠内容 */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-4">
          {/* 进度条 - Cline风格 */}
          {mergedConfig.showProgressBar && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="cline-stat-label">Progress</span>
                <span className="cline-stat-value">{taskState.progress}%</span>
              </div>
              <div className="cline-progress-bar">
                <div 
                  className="cline-progress-fill"
                  style={{ width: `${taskState.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 步骤列表 - Cline风格 */}
          {mergedConfig.showStepsList && visibleSteps.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-[#cccccc] text-sm">Execution Steps</h4>
                <div className="cline-stat-card !p-1.5 !rounded-lg">
                  <span className="text-xs text-[#888888]">
                    {taskState.stepResults.filter(s => s.status === 'completed').length}/{taskState.stepResults.length} completed
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {visibleSteps.map((stepResult, index) => (
                  <div 
                    key={index}
                    className="cline-step-item"
                  >
                    <div className={`cline-step-status ${stepResult.status}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#cccccc] truncate">
                          <span className="text-[#666666] text-xs mr-2">#{index + 1}</span>
                          {taskState.steps[index]?.description || 'Unknown step'}
                        </span>
                        <span className={`text-xs font-medium ${
                          stepResult.status === 'completed' ? 'text-green-400' :
                          stepResult.status === 'executing' ? 'text-blue-400' :
                          stepResult.status === 'failed' ? 'text-red-400' : 'text-[#888888]'
                        }`}>
                          {stepResult.status}
                        </span>
                      </div>
                      {stepResult.error && (
                        <div className="text-xs text-red-300 mt-1 px-2 py-1 bg-red-900/30 rounded">
                          {stepResult.error}
                        </div>
                      )}
                    </div>
                    {stepResult.status === 'failed' && onRetryStep && (
                      <button
                        className="cline-button cline-button-primary text-xs !px-2 !py-1"
                        onClick={() => onRetryStep(index)}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                ))}
                {taskState.stepResults.length > mergedConfig.maxVisibleSteps && (
                  <div className="text-center text-xs text-[#666666] py-2">
                    Showing {mergedConfig.maxVisibleSteps} of {taskState.stepResults.length} steps
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 事件日志 */}
          <div className="space-y-2">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsEventsExpanded(!isEventsExpanded)}
            >
              <h4 className="font-medium text-gray-300">
                Events ({taskState.events.length})
              </h4>
              <span className="text-xs text-gray-400">
                {isEventsExpanded ? '▼' : '▶'} {visibleEvents.length} shown
              </span>
            </div>
            
            {isEventsExpanded && visibleEvents.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto text-sm bg-black/20 rounded p-2">
                {visibleEvents.map((event, index) => (
                  <div 
                    key={index}
                    className={`flex items-start space-x-2 p-1 rounded ${index % 2 === 0 ? 'bg-black/10' : ''}`}
                  >
                    <span className={`text-xs ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className={`font-medium ${getEventColor(event.type)}`}>
                          {event.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 mt-0.5">
                        {getEventSummary(event)}
                      </div>
                    </div>
                  </div>
                ))}
                {taskState.events.length > mergedConfig.maxVisibleEvents && (
                  <div className="text-center text-xs text-gray-400 py-2">
                    Showing {mergedConfig.maxVisibleEvents} of {taskState.events.length} events
                  </div>
                )}
                <div ref={eventsEndRef} />
              </div>
            )}

            {isEventsExpanded && visibleEvents.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-4">
                No events recorded
              </div>
            )}
          </div>

          {/* 状态统计 */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-black/20 rounded p-2">
              <div className="text-gray-400">Steps</div>
              <div className="font-medium">
                {taskState.stepResults.filter(s => s.status === 'completed').length} / {taskState.stepResults.length}
              </div>
            </div>
            <div className="bg-black/20 rounded p-2">
              <div className="text-gray-400">Events</div>
              <div className="font-medium">{taskState.events.length}</div>
            </div>
            <div className="bg-black/20 rounded p-2">
              <div className="text-gray-400">Duration</div>
              <div className="font-medium">{formatDuration(getTaskDuration())}</div>
            </div>
            <div className="bg-black/20 rounded p-2">
              <div className="text-gray-400">Progress</div>
              <div className="font-medium">{taskState.progress}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSection;