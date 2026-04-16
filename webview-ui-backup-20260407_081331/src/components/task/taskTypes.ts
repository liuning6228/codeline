/**
 * 任务相关类型定义
 * 与后端taskTypes.ts保持同步
 */

export type TaskEventType = 
  | 'task_started'
  | 'analyzing_project'
  | 'project_analyzed'
  | 'consulting_ai'
  | 'ai_response_received'
  | 'steps_parsed'
  | 'step_started'
  | 'step_completed'
  | 'step_failed'
  | 'task_completed'
  | 'task_failed'
  | 'task_ended'
  | 'task_cancelled'
  | 'task_progress';

export interface TaskEvent {
  type: TaskEventType;
  timestamp: number;
  taskId?: string;
}

export interface TaskStartedEvent extends TaskEvent {
  type: 'task_started';
  taskId: string;
  description: string;
}

export interface AnalyzingProjectEvent extends TaskEvent {
  type: 'analyzing_project';
  status: 'executing' | 'completed' | 'failed';
}

export interface ProjectAnalyzedEvent extends TaskEvent {
  type: 'project_analyzed';
  context: {
    files: number;
    directories: number;
    languages: string[];
    dependencies?: string[];
  };
}

export interface ConsultingAIEvent extends TaskEvent {
  type: 'consulting_ai';
  status: 'executing' | 'completed' | 'failed';
}

export interface AIResponseReceivedEvent extends TaskEvent {
  type: 'ai_response_received';
  content: string;
  tokenCount?: number;
}

export interface StepsParsedEvent extends TaskEvent {
  type: 'steps_parsed';
  count: number;
  steps: TaskStep[];
}

export interface StepStartedEvent extends TaskEvent {
  type: 'step_started';
  stepIndex: number;
  step: TaskStep;
  totalSteps: number;
}

export interface StepCompletedEvent extends TaskEvent {
  type: 'step_completed';
  stepIndex: number;
  result: any;
  duration: number;
}

export interface StepFailedEvent extends TaskEvent {
  type: 'step_failed';
  stepIndex: number;
  error: string;
  retryable: boolean;
}

export interface TaskCompletedEvent extends TaskEvent {
  type: 'task_completed';
  result: TaskResult;
  duration: number;
  completedSteps: number;
  totalSteps: number;
}

export interface TaskFailedEvent extends TaskEvent {
  type: 'task_failed';
  error: string;
  failedStep?: number;
  duration: number;
}

export interface TaskEndedEvent extends TaskEvent {
  type: 'task_ended';
}

export interface TaskCancelledEvent extends TaskEvent {
  type: 'task_cancelled';
  reason?: string;
}

export interface TaskProgressEvent extends TaskEvent {
  type: 'task_progress';
  progress: number; // 0-100
  message: string;
  currentStep?: number;
  totalSteps?: number;
}

// 与后端类型保持一致
export interface TaskStep {
  description: string;
  action: string;
  parameters: any;
}

export interface TaskResult {
  success: boolean;
  steps: Array<{
    index: number;
    description: string;
    status: string;
    result: any;
  }>;
  summary: string;
  error?: string;
}

export interface StreamTaskResult {
  taskId: string;
  result?: TaskResult;
  error?: string;
  eventCount: number;
  duration: number;
  status: 'completed' | 'failed' | 'cancelled';
  steps: {
    total: number;
    completed: number;
    failed: number;
  };
}

export type TaskEventUnion = 
  | TaskStartedEvent
  | AnalyzingProjectEvent
  | ProjectAnalyzedEvent
  | ConsultingAIEvent
  | AIResponseReceivedEvent
  | StepsParsedEvent
  | StepStartedEvent
  | StepCompletedEvent
  | StepFailedEvent
  | TaskCompletedEvent
  | TaskFailedEvent
  | TaskEndedEvent
  | TaskCancelledEvent
  | TaskProgressEvent;

/**
 * 任务状态
 */
export interface TaskState {
  taskId: string | null;
  status: 'idle' | 'starting' | 'analyzing' | 'consulting' | 'executing' | 'completed' | 'failed' | 'cancelled';
  description: string;
  progress: number; // 0-100
  currentStep: number;
  totalSteps: number;
  steps: TaskStep[];
  stepResults: Array<{
    index: number;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    result?: any;
    error?: string;
  }>;
  events: TaskEventUnion[];
  startTime: number | null;
  endTime: number | null;
  error?: string;
}

/**
 * 任务配置
 */
export interface TaskSectionConfig {
  showProgressBar: boolean;
  showStepsList: boolean;
  showEventsLog: boolean;
  autoScroll: boolean;
  maxVisibleSteps: number;
  maxVisibleEvents: number;
}