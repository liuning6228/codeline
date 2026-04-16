/**
 * 工具执行状态组件
 * 显示工具执行的实时进度、输出和状态
 */

import { useState, useEffect } from 'react';

/**
 * 工具执行状态
 */
export interface ToolExecutionState {
  /** 执行ID */
  executionId: string;
  /** 工具ID */
  toolId: string;
  /** 工具名称 */
  toolName: string;
  /** 执行状态 */
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  /** 进度 (0-1) */
  progress: number;
  /** 当前消息 */
  message: string;
  /** 开始时间 */
  startTime: Date;
  /** 结束时间 */
  endTime?: Date;
  /** 执行时长（毫秒） */
  duration?: number;
  /** 输出数据 */
  output?: any;
  /** 错误信息 */
  error?: string;
  /** 是否流式输出 */
  streaming?: boolean;
  /** 流式输出内容 */
  streamContent?: string;
  /** 风险等级 (0-10) */
  riskLevel?: number;
  /** 警告信息 */
  warnings?: string[];
  /** 建议 */
  suggestions?: string[];
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 工具执行进度事件
 */
export interface ToolProgressEvent {
  type: string;
  progress: number;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}

interface ToolExecutionProps {
  /** 执行状态 */
  executionState: ToolExecutionState;
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 是否可取消 */
  cancellable?: boolean;
  /** 取消回调 */
  onCancel?: (executionId: string) => void;
  /** 重试回调 */
  onRetry?: (executionId: string) => void;
  /** 清除回调 */
  onClear?: (executionId: string) => void;
}

/**
 * 工具执行组件
 */
export default function ToolExecution({
  executionState,
  showDetails = true,
  cancellable = true,
  onCancel,
  onRetry,
  onClear
}: ToolExecutionProps) {
  const [expanded, setExpanded] = useState(false);
  const [localStreamContent, setLocalStreamContent] = useState('');

  // 更新流式内容
  useEffect(() => {
    if (executionState.streamContent) {
      setLocalStreamContent(executionState.streamContent);
    }
  }, [executionState.streamContent]);

  // 计算状态颜色
  const getStatusColor = () => {
    switch (executionState.status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'executing':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-300';
      case 'failed':
        return 'bg-red-50 text-red-800 border-red-300';
      case 'cancelled':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 计算状态图标
  const getStatusIcon = () => {
    switch (executionState.status) {
      case 'pending':
        return '⏳';
      case 'executing':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '⏹️';
      default:
        return '📋';
    }
  };

  // 格式化时长
  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // 格式化时间
  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // 获取风险等级颜色
  const getRiskColor = (level?: number) => {
    if (!level) return 'text-gray-600';
    if (level >= 8) return 'text-red-600 font-bold';
    if (level >= 5) return 'text-orange-600';
    if (level >= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  // 获取风险等级文本
  const getRiskText = (level?: number) => {
    if (!level) return '未知';
    if (level >= 8) return '极高风险';
    if (level >= 5) return '高风险';
    if (level >= 3) return '中风险';
    return '低风险';
  };

  // 渲染进度条
  const renderProgressBar = () => {
    if (executionState.status === 'executing' || executionState.progress > 0) {
      return (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>进度: {Math.round(executionState.progress * 100)}%</span>
            <span>{executionState.message}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${executionState.progress * 100}%` }}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  // 渲染流式输出
  const renderStreamOutput = () => {
    if (!executionState.streaming && !localStreamContent) return null;

    return (
      <div className="mt-3 border-t pt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">实时输出:</span>
          <button
            type="button"
            className="text-xs text-blue-600 hover:text-blue-800"
            onClick={() => setLocalStreamContent('')}
          >
            清除
          </button>
        </div>
        <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded max-h-40 overflow-auto font-mono whitespace-pre-wrap">
          {localStreamContent || executionState.streamContent}
        </pre>
      </div>
    );
  };

  // 渲染输出详情
  const renderOutputDetails = () => {
    if (!executionState.output && !executionState.error) return null;

    return (
      <div className="mt-3 border-t pt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">执行结果:</span>
        </div>

        {executionState.error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
            <div className="text-sm font-medium text-red-800">错误:</div>
            <pre className="text-xs text-red-700 mt-1 whitespace-pre-wrap">{executionState.error}</pre>
          </div>
        )}

        {executionState.output && (
          <div className="space-y-2">
            {executionState.output.stdout && (
              <div>
                <div className="text-xs font-medium text-gray-700">标准输出:</div>
                <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32 font-mono whitespace-pre-wrap">
                  {executionState.output.stdout}
                </pre>
              </div>
            )}

            {executionState.output.stderr && (
              <div>
                <div className="text-xs font-medium text-gray-700">标准错误:</div>
                <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-auto max-h-32 font-mono whitespace-pre-wrap text-red-700">
                  {executionState.output.stderr}
                </pre>
              </div>
            )}

            {executionState.output.duration && (
              <div className="text-xs text-gray-600">
                执行时间: {formatDuration(executionState.output.duration)}
              </div>
            )}

            {executionState.output.exitCode !== undefined && (
              <div className="text-xs text-gray-600">
                退出码: {executionState.output.exitCode}
                {executionState.output.exitCode === 0 ? ' (成功)' : ' (失败)'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 渲染警告和建议
  const renderWarningsAndSuggestions = () => {
    if (
      (!executionState.warnings || executionState.warnings.length === 0) &&
      (!executionState.suggestions || executionState.suggestions.length === 0)
    ) {
      return null;
    }

    return (
      <div className="mt-3 border-t pt-2">
        <div className="text-xs font-medium text-gray-700 mb-1">安全分析:</div>

        {executionState.riskLevel !== undefined && (
          <div className="mb-2">
            <span className="text-xs">风险等级: </span>
            <span className={`text-xs font-medium ${getRiskColor(executionState.riskLevel)}`}>
              {getRiskText(executionState.riskLevel)} ({executionState.riskLevel}/10)
            </span>
          </div>
        )}

        {executionState.warnings && executionState.warnings.length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-medium text-orange-700">警告:</div>
            <ul className="text-xs text-orange-600 mt-1 list-disc list-inside space-y-1">
              {executionState.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {executionState.suggestions && executionState.suggestions.length > 0 && (
          <div>
            <div className="text-xs font-medium text-blue-700">建议:</div>
            <ul className="text-xs text-blue-600 mt-1 list-disc list-inside space-y-1">
              {executionState.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // 渲染元数据
  const renderMetadata = () => {
    if (!executionState.metadata || !expanded) return null;

    return (
      <div className="mt-3 border-t pt-2">
        <div className="text-xs font-medium text-gray-700 mb-1">元数据:</div>
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(executionState.metadata, null, 2)}
        </pre>
      </div>
    );
  };

  // 渲染操作按钮
  const renderActionButtons = () => {
    const buttons = [];

    if (cancellable && executionState.status === 'executing' && onCancel) {
      buttons.push(
        <button
          key="cancel"
          type="button"
          className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded"
          onClick={() => onCancel(executionState.executionId)}
        >
          取消
        </button>
      );
    }

    if (executionState.status === 'failed' && onRetry) {
      buttons.push(
        <button
          key="retry"
          type="button"
          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
          onClick={() => onRetry(executionState.executionId)}
        >
          重试
        </button>
      );
    }

    if ((executionState.status === 'completed' || executionState.status === 'failed' || executionState.status === 'cancelled') && onClear) {
      buttons.push(
        <button
          key="clear"
          type="button"
          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
          onClick={() => onClear(executionState.executionId)}
        >
          清除
        </button>
      );
    }

    if (buttons.length === 0) return null;

    return (
      <div className="flex items-center justify-end space-x-2 mt-3 border-t pt-2">
        {buttons}
      </div>
    );
  };

  return (
    <div className={`border rounded-lg p-3 mb-3 ${getStatusColor()} transition-all duration-300`}>
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 flex items-center justify-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{executionState.toolName}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/50">
                {getStatusIcon()} {executionState.status}
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {executionState.toolId} • 开始于 {formatTime(executionState.startTime)}
              {executionState.endTime && ` • 结束于 ${formatTime(executionState.endTime)}`}
              {executionState.duration && ` • 耗时 ${formatDuration(executionState.duration)}`}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showDetails && (
            <button
              type="button"
              className="text-xs text-gray-600 hover:text-gray-800"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '收起详情' : '展开详情'}
            </button>
          )}
        </div>
      </div>

      {/* 进度条 */}
      {renderProgressBar()}

      {/* 详细信息区域 */}
      {(expanded || !showDetails) && (
        <div className="mt-3">
          {/* 当前消息 */}
          {executionState.message && executionState.status === 'executing' && (
            <div className="text-sm text-gray-700 mb-2">{executionState.message}</div>
          )}

          {/* 流式输出 */}
          {renderStreamOutput()}

          {/* 输出详情 */}
          {renderOutputDetails()}

          {/* 警告和建议 */}
          {renderWarningsAndSuggestions()}

          {/* 元数据 */}
          {renderMetadata()}

          {/* 操作按钮 */}
          {renderActionButtons()}
        </div>
      )}
    </div>
  );
}