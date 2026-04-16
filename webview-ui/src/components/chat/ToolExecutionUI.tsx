/**
 * ToolExecutionUI 组件
 * Phase 4 任务4.2: 创建ToolExecutionUI组件
 * 
 * 显示工具执行状态，支持流式输出和进度显示
 * 特别为EnhancedBashTool等增强工具设计
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ClineMessage } from "@shared/ExtensionMessage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  PlayCircle, 
  StopCircle, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Terminal,
  Clock,
  Cpu,
  FileText,
  Code,
  Settings,
  Loader2
} from "lucide-react";

interface ToolExecutionProgress {
  /** 进度类型 */
  type: 'enhanced_bash_output' | 'enhanced_bash_error' | 'tool_start' | 'tool_complete' | 'tool_progress';
  /** 进度数据 */
  data: any;
  /** 进度值 (0-1) */
  progress?: number;
  /** 进度消息 */
  message?: string;
  /** 时间戳 */
  timestamp: number;
}

interface ToolExecutionInfo {
  /** 工具ID */
  toolId: string;
  /** 工具名称 */
  toolName: string;
  /** 执行ID */
  executionId: string;
  /** 开始时间 */
  startTime: number;
  /** 结束时间 */
  endTime?: number;
  /** 状态 */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** 输入参数 */
  input?: any;
  /** 输出结果 */
  output?: any;
  /** 错误信息 */
  error?: string;
  /** 进度历史 */
  progressHistory: ToolExecutionProgress[];
  /** 资源使用 */
  resourceUsage?: {
    cpu?: number;
    memory?: number;
    executionTime?: number;
  };
  /** 是否使用沙箱 */
  sandboxEnabled?: boolean;
  /** 权限状态 */
  permissionStatus?: {
    allowed: boolean;
    requiresConfirmation: boolean;
    confirmed?: boolean;
    riskLevel: number;
    ruleMatch?: any[];
  };
}

interface ToolExecutionUIProps {
  /** 工具执行信息 */
  executionInfo: ToolExecutionInfo;
  /** 是否可交互 */
  interactive?: boolean;
  /** 是否默认展开 */
  defaultExpanded?: boolean;
  /** 取消回调 */
  onCancel?: (executionId: string) => void;
  /** 查看详情回调 */
  onViewDetails?: (executionId: string) => void;
  /** 重新执行回调 */
  onRetry?: (executionId: string, input?: any) => void;
  /** 复制输出回调 */
  onCopyOutput?: (output: string) => void;
}

/**
 * 获取状态图标
 */
const getStatusIcon = (status: ToolExecutionInfo['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-gray-400" />;
    case 'running':
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'cancelled':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    default:
      return <Settings className="w-4 h-4 text-gray-400" />;
  }
};

/**
 * 获取状态颜色
 */
const getStatusColor = (status: ToolExecutionInfo['status']) => {
  switch (status) {
    case 'pending':
      return 'text-gray-400 bg-gray-100';
    case 'running':
      return 'text-blue-500 bg-blue-50';
    case 'completed':
      return 'text-green-500 bg-green-50';
    case 'failed':
      return 'text-red-500 bg-red-50';
    case 'cancelled':
      return 'text-yellow-500 bg-yellow-50';
    default:
      return 'text-gray-500 bg-gray-50';
  }
};

/**
 * 获取工具图标
 */
const getToolIcon = (toolId: string) => {
  if (toolId.includes('bash') || toolId.includes('terminal')) {
    return <Terminal className="w-4 h-4" />;
  } else if (toolId.includes('file')) {
    return <FileText className="w-4 h-4" />;
  } else if (toolId.includes('code')) {
    return <Code className="w-4 h-4" />;
  }
  return <Settings className="w-4 h-4" />;
};

/**
 * 格式化执行时间
 */
const formatExecutionTime = (startTime: number, endTime?: number) => {
  const duration = endTime ? endTime - startTime : Date.now() - startTime;
  
  if (duration < 1000) {
    return `${duration}ms`;
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
};

/**
 * 渲染进度条
 */
const ProgressBar: React.FC<{ 
  progress?: number; 
  indeterminate?: boolean;
  color?: string;
}> = ({ progress = 0, indeterminate = false, color = "bg-blue-500" }) => {
  if (indeterminate) {
    return (
      <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-slide"></div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
      <div 
        className={`h-full ${color} transition-all duration-300 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
      />
    </div>
  );
};

/**
 * 渲染流式输出
 */
const StreamOutput: React.FC<{ 
  output: string;
  type?: 'stdout' | 'stderr' | 'info' | 'error';
  autoScroll?: boolean;
}> = ({ output, type = 'stdout', autoScroll = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output, autoScroll]);
  
  const getOutputClass = () => {
    switch (type) {
      case 'stderr':
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-800 bg-gray-50';
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "font-mono text-sm p-2 rounded max-h-48 overflow-y-auto whitespace-pre-wrap",
        getOutputClass()
      )}
    >
      {output || <span className="text-gray-400 italic">无输出</span>}
    </div>
  );
};

/**
 * ToolExecutionUI 主组件
 */
export const ToolExecutionUI: React.FC<ToolExecutionUIProps> = ({
  executionInfo,
  interactive = true,
  defaultExpanded = false,
  onCancel,
  onViewDetails,
  onRetry,
  onCopyOutput,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showDetails, setShowDetails] = useState(false);
  
  // 最近输出历史（用于流式显示）
  const recentOutputs = useMemo(() => {
    return executionInfo.progressHistory
      .filter(p => p.type.includes('output') || p.type.includes('error'))
      .slice(-10) // 只显示最近10条
      .map(p => ({
        type: p.type.includes('error') ? 'stderr' : 'stdout',
        text: p.message || JSON.stringify(p.data),
        timestamp: p.timestamp,
      }));
  }, [executionInfo.progressHistory]);
  
  // 合并输出文本
  const combinedOutput = useMemo(() => {
    return recentOutputs.map(o => o.text).join('\n');
  }, [recentOutputs]);
  
  // 当前进度
  const currentProgress = useMemo(() => {
    const progressEvents = executionInfo.progressHistory.filter(p => p.progress !== undefined);
    if (progressEvents.length === 0) return undefined;
    
    // 取最新的进度
    return progressEvents[progressEvents.length - 1].progress;
  }, [executionInfo.progressHistory]);
  
  // 资源使用信息
  const resourceInfo = useMemo(() => {
    if (!executionInfo.resourceUsage) return null;
    
    const info = [];
    if (executionInfo.resourceUsage.cpu !== undefined) {
      info.push(`CPU: ${executionInfo.resourceUsage.cpu}%`);
    }
    if (executionInfo.resourceUsage.memory !== undefined) {
      info.push(`内存: ${(executionInfo.resourceUsage.memory / 1024 / 1024).toFixed(1)}MB`);
    }
    if (executionInfo.resourceUsage.executionTime !== undefined) {
      info.push(`时间: ${formatExecutionTime(
        executionInfo.startTime, 
        executionInfo.startTime + executionInfo.resourceUsage.executionTime
      )}`);
    }
    
    return info.join(' · ');
  }, [executionInfo.resourceUsage, executionInfo.startTime]);
  
  // 权限状态信息
  const permissionInfo = useMemo(() => {
    if (!executionInfo.permissionStatus) return null;
    
    const { allowed, requiresConfirmation, confirmed, riskLevel } = executionInfo.permissionStatus;
    
    if (!requiresConfirmation) {
      return allowed ? '自动允许' : '自动拒绝';
    }
    
    if (confirmed === undefined) {
      return `需要确认 (风险等级: ${riskLevel}/10)`;
    }
    
    return confirmed ? '用户确认允许' : '用户确认拒绝';
  }, [executionInfo.permissionStatus]);
  
  // 处理取消
  const handleCancel = useCallback(() => {
    if (onCancel && interactive && executionInfo.status === 'running') {
      onCancel(executionInfo.executionId);
    }
  }, [onCancel, interactive, executionInfo.executionId, executionInfo.status]);
  
  // 处理查看详情
  const handleViewDetails = useCallback(() => {
    if (onViewDetails) {
      onViewDetails(executionInfo.executionId);
    }
  }, [onViewDetails, executionInfo.executionId]);
  
  // 处理重试
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry(executionInfo.executionId, executionInfo.input);
    }
  }, [onRetry, executionInfo.executionId, executionInfo.input]);
  
  // 处理复制输出
  const handleCopyOutput = useCallback(() => {
    if (onCopyOutput && executionInfo.output) {
      const outputText = typeof executionInfo.output === 'string' 
        ? executionInfo.output 
        : JSON.stringify(executionInfo.output, null, 2);
      onCopyOutput(outputText);
    }
  }, [onCopyOutput, executionInfo.output]);
  
  // 渲染状态标签
  const renderStatusBadge = () => (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
      getStatusColor(executionInfo.status)
    )}>
      {getStatusIcon(executionInfo.status)}
      <span className="capitalize">
        {executionInfo.status === 'running' ? '执行中' : 
         executionInfo.status === 'completed' ? '已完成' :
         executionInfo.status === 'failed' ? '失败' :
         executionInfo.status === 'cancelled' ? '已取消' : '等待中'}
      </span>
    </div>
  );
  
  // 渲染沙箱和权限标签
  const renderSecurityBadges = () => (
    <div className="flex flex-wrap gap-1">
      {executionInfo.sandboxEnabled && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-purple-50 text-purple-700">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <span>沙箱执行</span>
        </div>
      )}
      
      {permissionInfo && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-indigo-50 text-indigo-700">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <span>{permissionInfo}</span>
        </div>
      )}
    </div>
  );
  
  // 渲染操作按钮
  const renderActionButtons = () => (
    <div className="flex items-center gap-1">
      {executionInfo.status === 'running' && interactive && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="h-7 px-2"
        >
          <StopCircle className="w-3 h-3 mr-1" />
          取消
        </Button>
      )}
      
      {(executionInfo.status === 'completed' || executionInfo.status === 'failed') && interactive && onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="h-7 px-2"
        >
          <PlayCircle className="w-3 h-3 mr-1" />
          重试
        </Button>
      )}
      
      {executionInfo.output && interactive && onCopyOutput && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyOutput}
          className="h-7 px-2"
        >
          复制输出
        </Button>
      )}
      
      {interactive && onViewDetails && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewDetails}
          className="h-7 px-2"
        >
          详情
        </Button>
      )}
    </div>
  );
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-all duration-200",
      executionInfo.status === 'running' ? 'border-blue-200 bg-blue-50/30' :
      executionInfo.status === 'completed' ? 'border-green-200 bg-green-50/30' :
      executionInfo.status === 'failed' ? 'border-red-200 bg-red-50/30' :
      executionInfo.status === 'cancelled' ? 'border-yellow-200 bg-yellow-50/30' :
      'border-gray-200 bg-gray-50/30'
    )}>
      {/* 头部 - 折叠/展开区域 */}
      <div 
        className={cn(
          "flex items-center justify-between p-3 cursor-pointer hover:bg-black/5 transition-colors",
          isExpanded && "border-b"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getToolIcon(executionInfo.toolId)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">
                {executionInfo.toolName}
              </h3>
              {renderStatusBadge()}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>ID: {executionInfo.executionId.substring(0, 8)}...</span>
              <span>·</span>
              <span>开始: {new Date(executionInfo.startTime).toLocaleTimeString()}</span>
              {executionInfo.endTime && (
                <>
                  <span>·</span>
                  <span>时长: {formatExecutionTime(executionInfo.startTime, executionInfo.endTime)}</span>
                </>
              )}
              {resourceInfo && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    {resourceInfo}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {renderSecurityBadges()}
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>
      
      {/* 展开的内容 */}
      {isExpanded && (
        <div className="p-3 space-y-4">
          {/* 进度条 */}
          {executionInfo.status === 'running' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">执行进度</span>
                <span className="font-medium">
                  {currentProgress !== undefined ? `${Math.round(currentProgress * 100)}%` : '进行中...'}
                </span>
              </div>
              <ProgressBar 
                progress={currentProgress} 
                indeterminate={currentProgress === undefined}
              />
            </div>
          )}
          
          {/* 流式输出预览 */}
          {recentOutputs.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">实时输出</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-7 px-2 text-xs"
                >
                  {showDetails ? '隐藏详情' : '显示详情'}
                </Button>
              </div>
              <StreamOutput 
                output={combinedOutput}
                type="stdout"
                autoScroll={executionInfo.status === 'running'}
              />
            </div>
          )}
          
          {/* 输入参数 */}
          {executionInfo.input && showDetails && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">输入参数</span>
              <pre className="text-xs p-2 bg-gray-50 rounded overflow-x-auto">
                {typeof executionInfo.input === 'string' 
                  ? executionInfo.input 
                  : JSON.stringify(executionInfo.input, null, 2)}
              </pre>
            </div>
          )}
          
          {/* 输出结果 */}
          {executionInfo.output && showDetails && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">输出结果</span>
                {interactive && onCopyOutput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyOutput}
                    className="h-7 px-2 text-xs"
                  >
                    复制
                  </Button>
                )}
              </div>
              <pre className="text-xs p-2 bg-gray-50 rounded overflow-x-auto">
                {typeof executionInfo.output === 'string' 
                  ? executionInfo.output 
                  : JSON.stringify(executionInfo.output, null, 2)}
              </pre>
            </div>
          )}
          
          {/* 错误信息 */}
          {executionInfo.error && showDetails && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-red-700">错误信息</span>
              <div className="p-2 bg-red-50 rounded text-red-700 text-xs">
                {executionInfo.error}
              </div>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-gray-500">
              最后更新: {new Date().toLocaleTimeString()}
            </div>
            {renderActionButtons()}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ToolExecutionUI 容器组件 - 用于管理多个工具执行实例
 */
export const ToolExecutionUIContainer: React.FC<{
  executions: ToolExecutionInfo[];
  maxVisible?: number;
  onExecutionAction?: (action: string, executionId: string, data?: any) => void;
}> = ({ executions, maxVisible = 5, onExecutionAction }) => {
  const [visibleCount, setVisibleCount] = useState(maxVisible);
  
  const sortedExecutions = useMemo(() => {
    return [...executions].sort((a, b) => b.startTime - a.startTime);
  }, [executions]);
  
  const visibleExecutions = useMemo(() => {
    return sortedExecutions.slice(0, visibleCount);
  }, [sortedExecutions, visibleCount]);
  
  const handleExecutionAction = useCallback((action: string, executionId: string, data?: any) => {
    if (onExecutionAction) {
      onExecutionAction(action, executionId, data);
    }
  }, [onExecutionAction]);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">工具执行状态</h3>
        <div className="text-xs text-gray-500">
          总计: {executions.length} | 运行中: {executions.filter(e => e.status === 'running').length}
        </div>
      </div>
      
      <div className="space-y-2">
        {visibleExecutions.map(execution => (
          <ToolExecutionUI
            key={execution.executionId}
            executionInfo={execution}
            interactive={true}
            onCancel={(id) => handleExecutionAction('cancel', id)}
            onViewDetails={(id) => handleExecutionAction('view_details', id)}
            onRetry={(id, input) => handleExecutionAction('retry', id, { input })}
            onCopyOutput={(output) => handleExecutionAction('copy_output', execution.executionId, { output })}
          />
        ))}
      </div>
      
      {executions.length > visibleCount && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibleCount(prev => prev + maxVisible)}
            className="text-xs"
          >
            显示更多 ({executions.length - visibleCount} 个)
          </Button>
        </div>
      )}
      
      {executions.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>暂无工具执行记录</p>
        </div>
      )}
    </div>
  );
};

export default ToolExecutionUI;