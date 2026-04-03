/**
 * Task Engine 类型定义
 * 支持异步生成器事件流的类型系统
 */

import { TaskResult, TaskStep } from './taskEngine';

// ==================== 事件类型定义 ====================

/**
 * 任务事件类型枚举
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
  | 'task_progress'
  | 'task_cancelled';

/**
 * 任务事件基接口
 */
export interface TaskEvent {
  type: TaskEventType;
  timestamp: number;
  taskId?: string;
}

/**
 * 任务开始事件
 */
export interface TaskStartedEvent extends TaskEvent {
  type: 'task_started';
  taskId: string;
  description: string;
}

/**
 * 项目分析事件
 */
export interface AnalyzingProjectEvent extends TaskEvent {
  type: 'analyzing_project';
  status: 'executing' | 'completed' | 'failed';
}

/**
 * 项目分析完成事件
 */
export interface ProjectAnalyzedEvent extends TaskEvent {
  type: 'project_analyzed';
  context: {
    files: number;
    directories: number;
    languages: string[];
    dependencies?: string[];
  };
}

/**
 * AI咨询事件
 */
export interface ConsultingAIEvent extends TaskEvent {
  type: 'consulting_ai';
  status: 'executing' | 'completed' | 'failed';
}

/**
 * AI响应接收事件
 */
export interface AIResponseReceivedEvent extends TaskEvent {
  type: 'ai_response_received';
  content: string;
  tokenCount?: number;
}

/**
 * 步骤解析事件
 */
export interface StepsParsedEvent extends TaskEvent {
  type: 'steps_parsed';
  count: number;
  steps: TaskStep[];
}

/**
 * 步骤开始事件
 */
export interface StepStartedEvent extends TaskEvent {
  type: 'step_started';
  stepIndex: number;
  step: TaskStep;
  totalSteps: number;
}

/**
 * 步骤完成事件
 */
export interface StepCompletedEvent extends TaskEvent {
  type: 'step_completed';
  stepIndex: number;
  result: any;
  duration: number;
}

/**
 * 步骤失败事件
 */
export interface StepFailedEvent extends TaskEvent {
  type: 'step_failed';
  stepIndex: number;
  error: string;
  retryable: boolean;
}

/**
 * 任务完成事件
 */
export interface TaskCompletedEvent extends TaskEvent {
  type: 'task_completed';
  result: TaskResult;
  duration: number;
  completedSteps: number;
  totalSteps: number;
}

/**
 * 任务失败事件
 */
export interface TaskFailedEvent extends TaskEvent {
  type: 'task_failed';
  error: string;
  failedStep?: number;
  duration: number;
}

/**
 * 任务结束事件
 */
export interface TaskEndedEvent extends TaskEvent {
  type: 'task_ended';
}

/**
 * 任务取消事件
 */
export interface TaskCancelledEvent extends TaskEvent {
  type: 'task_cancelled';
  reason?: string;
}

/**
 * 任务进度事件
 */
export interface TaskProgressEvent extends TaskEvent {
  type: 'task_progress';
  progress: number; // 0-100
  message: string;
  currentStep?: number;
  totalSteps?: number;
}

// ==================== 配置类型 ====================

/**
 * 增强任务引擎配置
 */
export interface EnhancedTaskConfig {
  /** 任务描述 */
  description: string;
  /** 是否自动执行步骤 */
  autoExecute: boolean;
  /** 是否需要批准 */
  requireApproval: boolean;
  /** 启用实时事件流 */
  enableEventStream: boolean;
  /** 事件流发送间隔（ms） */
  eventStreamInterval?: number;
  /** 进度更新间隔（ms） */
  progressUpdateInterval?: number;
  /** 是否支持任务取消 */
  cancellable: boolean;
  /** 提示选项 */
  promptOptions?: {
    includeExamples?: boolean;
    includeConstraints?: boolean;
    includeBestPractices?: boolean;
  };
}

/**
 * 任务执行选项
 */
export interface TaskExecutionOptions {
  /** 任务ID（可选，自动生成） */
  taskId?: string;
  /** 配置覆盖 */
  configOverrides?: Partial<EnhancedTaskConfig>;
  /** 事件监听器 */
  onEvent?: (event: TaskEventUnion) => void;
  /** 进度监听器 */
  onProgress?: (progress: number, message: string) => void;
}

// ==================== 结果类型 ====================

/**
 * 流式任务执行结果
 */
export interface StreamTaskResult {
  /** 任务ID */
  taskId: string;
  /** 最终结果（如果任务完成） */
  result?: TaskResult;
  /** 错误信息（如果任务失败） */
  error?: string;
  /** 事件数量 */
  eventCount: number;
  /** 持续时间（ms） */
  duration: number;
  /** 任务状态 */
  status: 'completed' | 'failed' | 'cancelled';
  /** 步骤统计 */
  steps: {
    total: number;
    completed: number;
    failed: number;
  };
}

/**
 * 事件流处理选项
 */
export interface EventStreamOptions {
  /** 是否包括详细事件 */
  includeDetailedEvents: boolean;
  /** 事件过滤 */
  eventFilter?: (event: TaskEvent) => boolean;
  /** 事件转换 */
  eventTransform?: (event: TaskEvent) => any;
  /** 批处理大小 */
  batchSize?: number;
}

// ==================== 工具类型 ====================

/**
 * 任务事件联合类型
 */
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
 * 异步生成器返回类型
 */
export type TaskEventGenerator = AsyncGenerator<TaskEventUnion, TaskResult, void>;

/**
 * 事件回调函数类型
 */
export type TaskEventCallback = (event: TaskEventUnion) => void;

/**
 * 进度回调函数类型
 */
export type ProgressCallback = (progress: number, message: string) => void;