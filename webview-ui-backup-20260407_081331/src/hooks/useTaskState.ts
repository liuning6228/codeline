import { useState, useCallback, useEffect } from 'react';
import { TaskState, TaskEventUnion, TaskStep } from '../components/task/taskTypes';

const initialState: TaskState = {
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

export const useTaskState = () => {
  const [taskState, setTaskState] = useState<TaskState>(initialState);

  // 处理任务事件
  const handleTaskEvent = useCallback((event: TaskEventUnion) => {
    console.log('Task event received:', event);
    
    setTaskState(prev => {
      const newEvents = [...prev.events, event];
      
      // 根据事件类型更新状态
      switch (event.type) {
        case 'task_started':
          return {
            ...initialState,
            taskId: event.taskId,
            description: event.description,
            status: 'starting',
            progress: 0,
            events: newEvents,
            startTime: event.timestamp,
          };
          
        case 'analyzing_project':
          return {
            ...prev,
            status: event.status === 'executing' ? 'analyzing' : prev.status,
            events: newEvents,
          };
          
        case 'project_analyzed':
          return {
            ...prev,
            events: newEvents,
          };
          
        case 'consulting_ai':
          return {
            ...prev,
            status: event.status === 'executing' ? 'consulting' : prev.status,
            events: newEvents,
          };
          
        case 'ai_response_received':
          return {
            ...prev,
            events: newEvents,
          };
          
        case 'steps_parsed':
          const steps = event.steps || [];
          const stepResults = steps.map((_, index) => ({
            index,
            status: 'pending' as const,
          }));
          
          return {
            ...prev,
            steps,
            stepResults,
            totalSteps: event.count,
            events: newEvents,
          };
          
        case 'step_started':
          const stepResultsStarted = [...prev.stepResults];
          if (stepResultsStarted[event.stepIndex]) {
            stepResultsStarted[event.stepIndex] = {
              ...stepResultsStarted[event.stepIndex],
              status: 'executing',
            };
          }
          
          return {
            ...prev,
            status: 'executing',
            currentStep: event.stepIndex + 1,
            stepResults: stepResultsStarted,
            events: newEvents,
          };
          
        case 'step_completed':
          const stepResultsCompleted = [...prev.stepResults];
          if (stepResultsCompleted[event.stepIndex]) {
            stepResultsCompleted[event.stepIndex] = {
              ...stepResultsCompleted[event.stepIndex],
              status: 'completed',
              result: event.result,
            };
          }
          
          // 计算进度
          const completedSteps = stepResultsCompleted.filter(s => s.status === 'completed').length;
          const progress = prev.totalSteps > 0 
            ? Math.floor((completedSteps / prev.totalSteps) * 100)
            : prev.progress;
            
          return {
            ...prev,
            stepResults: stepResultsCompleted,
            progress,
            events: newEvents,
          };
          
        case 'step_failed':
          const stepResultsFailed = [...prev.stepResults];
          if (stepResultsFailed[event.stepIndex]) {
            stepResultsFailed[event.stepIndex] = {
              ...stepResultsFailed[event.stepIndex],
              status: 'failed',
              error: event.error,
            };
          }
          
          return {
            ...prev,
            stepResults: stepResultsFailed,
            events: newEvents,
          };
          
        case 'task_progress':
          return {
            ...prev,
            progress: event.progress,
            events: newEvents,
          };
          
        case 'task_completed':
          return {
            ...prev,
            status: 'completed',
            progress: 100,
            endTime: event.timestamp,
            events: newEvents,
          };
          
        case 'task_failed':
          return {
            ...prev,
            status: 'failed',
            error: event.error,
            endTime: event.timestamp,
            events: newEvents,
          };
          
        case 'task_cancelled':
          return {
            ...prev,
            status: 'cancelled',
            endTime: event.timestamp,
            events: newEvents,
          };
          
        case 'task_ended':
          return {
            ...prev,
            endTime: prev.endTime || event.timestamp,
            events: newEvents,
          };
          
        default:
          return {
            ...prev,
            events: newEvents,
          };
      }
    });
  }, []);

  // 启动任务
  const startTask = useCallback((description: string) => {
    // 这里应该通过VS Code API发送任务开始命令
    // 实际的事件将通过handleTaskEvent处理
    console.log('Starting task:', description);
    
    // 创建初始任务开始事件
    const startEvent: TaskEventUnion = {
      type: 'task_started',
      taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description,
      timestamp: Date.now(),
    };
    
    handleTaskEvent(startEvent);
  }, [handleTaskEvent]);

  // 取消任务
  const cancelTask = useCallback(() => {
    // 这里应该通过VS Code API发送取消命令
    console.log('Cancelling task:', taskState.taskId);
    
    const cancelEvent: TaskEventUnion = {
      type: 'task_cancelled',
      reason: 'User requested cancellation',
      timestamp: Date.now(),
      taskId: taskState.taskId || undefined,
    };
    
    handleTaskEvent(cancelEvent);
  }, [taskState.taskId, handleTaskEvent]);

  // 重试步骤
  const retryStep = useCallback((stepIndex: number) => {
    console.log('Retrying step:', stepIndex);
    
    // 这里应该通过VS Code API发送重试命令
    // 暂时只更新本地状态
    setTaskState(prev => {
      const stepResults = [...prev.stepResults];
      if (stepResults[stepIndex]) {
        stepResults[stepIndex] = {
          ...stepResults[stepIndex],
          status: 'pending',
          error: undefined,
        };
      }
      
      return {
        ...prev,
        stepResults,
      };
    });
  }, []);

  // 清除任务状态
  const clearTask = useCallback(() => {
    setTaskState(initialState);
  }, []);

  // 设置任务描述
  const setTaskDescription = useCallback((description: string) => {
    setTaskState(prev => ({
      ...prev,
      description,
    }));
  }, []);

  // 获取任务统计
  const getTaskStats = useCallback(() => {
    const completedSteps = taskState.stepResults.filter(s => s.status === 'completed').length;
    const failedSteps = taskState.stepResults.filter(s => s.status === 'failed').length;
    const totalSteps = taskState.stepResults.length;
    
    let duration = 0;
    if (taskState.startTime) {
      const endTime = taskState.endTime || Date.now();
      duration = Math.floor((endTime - taskState.startTime) / 1000);
    }
    
    return {
      completedSteps,
      failedSteps,
      totalSteps,
      duration,
      progress: taskState.progress,
      eventCount: taskState.events.length,
    };
  }, [taskState]);

  // 导出状态和操作
  return {
    taskState,
    setTaskState,
    handleTaskEvent,
    startTask,
    cancelTask,
    retryStep,
    clearTask,
    setTaskDescription,
    getTaskStats,
  };
};