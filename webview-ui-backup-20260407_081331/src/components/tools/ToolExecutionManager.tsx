/**
 * 工具执行管理器
 * 管理多个工具执行状态，提供统一的生命周期管理
 */

import { useState, useEffect, useCallback } from 'react';
import ToolExecution, { ToolExecutionState, ToolProgressEvent } from './ToolExecution';

interface ToolExecutionManagerProps {
  /** 初始执行状态列表 */
  initialExecutions?: ToolExecutionState[];
  /** 是否自动清除完成的执行 */
  autoClearCompleted?: boolean;
  /** 自动清除延迟（毫秒） */
  autoClearDelay?: number;
  /** 最大显示数量 */
  maxVisibleExecutions?: number;
  /** 执行状态更新回调 */
  onExecutionUpdate?: (executions: ToolExecutionState[]) => void;
  /** 取消回调 */
  onCancel?: (executionId: string) => void;
  /** 重试回调 */
  onRetry?: (executionId: string) => void;
  /** 清除回调 */
  onClear?: (executionId: string) => void;
}

/**
 * 工具执行管理器组件
 */
export default function ToolExecutionManager({
  initialExecutions = [],
  autoClearCompleted = true,
  autoClearDelay = 5000,
  maxVisibleExecutions = 5,
  onExecutionUpdate,
  onCancel,
  onRetry,
  onClear
}: ToolExecutionManagerProps) {
  const [executions, setExecutions] = useState<ToolExecutionState[]>(initialExecutions);
  const [visibleCount, setVisibleCount] = useState(maxVisibleExecutions);

  // 更新执行状态
  const updateExecution = useCallback((executionId: string, updates: Partial<ToolExecutionState>) => {
    setExecutions(prev => prev.map(exec => 
      exec.executionId === executionId 
        ? { ...exec, ...updates }
        : exec
    ));
  }, []);

  // 添加新执行
  const addExecution = useCallback((execution: ToolExecutionState) => {
    setExecutions(prev => {
      // 检查是否已存在相同ID的执行
      const existingIndex = prev.findIndex(exec => exec.executionId === execution.executionId);
      
      if (existingIndex >= 0) {
        // 更新现有执行
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...execution };
        return updated;
      } else {
        // 添加新执行
        return [execution, ...prev];
      }
    });
  }, []);

  // 移除执行
  const removeExecution = useCallback((executionId: string) => {
    setExecutions(prev => prev.filter(exec => exec.executionId !== executionId));
  }, []);

  // 处理进度事件
  const handleProgressEvent = useCallback((event: ToolProgressEvent & { executionId: string }) => {
    const { executionId, type, progress, message, data, timestamp } = event;
    
    updateExecution(executionId, {
      status: 'executing',
      progress,
      message,
      metadata: data
    });

    // 处理特定类型的事件
    switch (type) {
      case 'enhanced_bash_start':
        updateExecution(executionId, {
          toolName: 'Bash 命令执行',
          message: `开始执行: ${data?.command?.substring(0, 50) || '命令'}${data?.command?.length > 50 ? '...' : ''}`
        });
        break;
        
      case 'enhanced_bash_parsed':
        updateExecution(executionId, {
          message: `命令解析: ${data?.semantic?.type || '未知类型'} (风险等级: ${data?.semantic?.riskLevel || 0}/10)`,
          metadata: { ...data, riskLevel: data?.semantic?.riskLevel }
        });
        break;
        
      case 'enhanced_bash_sandbox':
        updateExecution(executionId, {
          message: `沙箱执行 (级别: ${data?.sandboxLevel || 'medium'})`,
          metadata: { ...data }
        });
        break;
        
      case 'enhanced_bash_executing':
        updateExecution(executionId, {
          message: '直接执行命令',
          metadata: { ...data }
        });
        break;
        
      case 'enhanced_bash_output':
        // 流式输出
        updateExecution(executionId, {
          streaming: true,
          streamContent: (prev => prev + (data?.data || '')).slice(-5000), // 限制长度
          metadata: { ...data }
        });
        break;
        
      case 'enhanced_bash_complete':
        updateExecution(executionId, {
          status: 'completed',
          progress: 1.0,
          message: `执行完成 (${data?.duration || 0}ms)`,
          endTime: new Date(),
          duration: data?.duration,
          output: data?.result,
          metadata: { ...data }
        });
        break;
        
      case 'enhanced_bash_error':
        updateExecution(executionId, {
          status: 'failed',
          progress: 1.0,
          message: `执行失败: ${data?.error || '未知错误'}`,
          endTime: new Date(),
          error: data?.error,
          metadata: { ...data }
        });
        break;
    }
  }, [updateExecution]);

  // 处理完成状态
  const handleCompletion = useCallback((executionId: string, result: any, error?: string) => {
    const now = new Date();
    
    if (error) {
      updateExecution(executionId, {
        status: 'failed',
        progress: 1.0,
        message: `执行失败: ${error}`,
        endTime: now,
        error,
        output: result
      });
    } else {
      updateExecution(executionId, {
        status: 'completed',
        progress: 1.0,
        message: '执行完成',
        endTime: now,
        duration: result?.duration,
        output: result,
        warnings: result?.warnings,
        suggestions: result?.suggestions,
        riskLevel: result?.riskLevel
      });
    }
  }, [updateExecution]);

  // 自动清除完成的执行
  useEffect(() => {
    if (!autoClearCompleted) return;

    const completedExecutions = executions.filter(exec => 
      exec.status === 'completed' || exec.status === 'failed' || exec.status === 'cancelled'
    );

    if (completedExecutions.length === 0) return;

    const timer = setTimeout(() => {
      setExecutions(prev => prev.filter(exec => 
        !(exec.status === 'completed' || exec.status === 'failed' || exec.status === 'cancelled')
      ));
    }, autoClearDelay);

    return () => clearTimeout(timer);
  }, [executions, autoClearCompleted, autoClearDelay]);

  // 通知父组件状态更新
  useEffect(() => {
    onExecutionUpdate?.(executions);
  }, [executions, onExecutionUpdate]);

  // 处理取消
  const handleCancel = useCallback((executionId: string) => {
    updateExecution(executionId, {
      status: 'cancelled',
      progress: 1.0,
      message: '已取消',
      endTime: new Date()
    });
    
    onCancel?.(executionId);
  }, [updateExecution, onCancel]);

  // 处理重试
  const handleRetry = useCallback((executionId: string) => {
    const execution = executions.find(exec => exec.executionId === executionId);
    if (!execution) return;

    updateExecution(executionId, {
      status: 'pending',
      progress: 0,
      message: '等待重试...',
      startTime: new Date(),
      endTime: undefined,
      error: undefined,
      output: undefined
    });
    
    onRetry?.(executionId);
  }, [executions, updateExecution, onRetry]);

  // 处理清除
  const handleClear = useCallback((executionId: string) => {
    removeExecution(executionId);
    onClear?.(executionId);
  }, [removeExecution, onClear]);

  // 计算可见的执行
  const visibleExecutions = executions.slice(0, visibleCount);
  const hiddenCount = Math.max(0, executions.length - visibleCount);

  // 渲染空状态
  if (executions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        暂无工具执行记录
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* 控制栏 */}
      <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded">
        <div className="text-xs font-medium text-gray-700">
          工具执行 ({executions.length})
        </div>
        <div className="flex items-center space-x-2">
          {hiddenCount > 0 && (
            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setVisibleCount(prev => prev + maxVisibleExecutions)}
            >
              显示更多 ({hiddenCount})
            </button>
          )}
          {visibleCount > maxVisibleExecutions && (
            <button
              type="button"
              className="text-xs text-gray-600 hover:text-gray-800"
              onClick={() => setVisibleCount(maxVisibleExecutions)}
            >
              收起
            </button>
          )}
          {executions.length > 0 && (
            <button
              type="button"
              className="text-xs text-red-600 hover:text-red-800"
              onClick={() => setExecutions([])}
            >
              清除所有
            </button>
          )}
        </div>
      </div>

      {/* 执行列表 */}
      <div className="space-y-2">
        {visibleExecutions.map(execution => (
          <ToolExecution
            key={execution.executionId}
            executionState={execution}
            showDetails={true}
            cancellable={execution.status === 'executing'}
            onCancel={handleCancel}
            onRetry={handleRetry}
            onClear={handleClear}
          />
        ))}
      </div>

      {/* 隐藏的执行计数 */}
      {hiddenCount > 0 && (
        <div className="text-center text-xs text-gray-500 py-2">
          还有 {hiddenCount} 个执行记录被隐藏
        </div>
      )}

      {/* API 导出 */}
      <div style={{ display: 'none' }}>
        {/* 这个div用于通过ref暴露API */}
      </div>
    </div>
  );
}

/**
 * 工具执行管理器钩子
 */
export function useToolExecutionManager(initialExecutions?: ToolExecutionState[]) {
  const [executions, setExecutions] = useState<ToolExecutionState[]>(initialExecutions || []);
  const [managerRef, setManagerRef] = useState<any>(null);

  // 添加执行
  const addExecution = useCallback((execution: ToolExecutionState) => {
    setExecutions(prev => {
      const existingIndex = prev.findIndex(exec => exec.executionId === execution.executionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...execution };
        return updated;
      }
      return [execution, ...prev];
    });
  }, []);

  // 更新执行
  const updateExecution = useCallback((executionId: string, updates: Partial<ToolExecutionState>) => {
    setExecutions(prev => prev.map(exec => 
      exec.executionId === executionId ? { ...exec, ...updates } : exec
    ));
  }, []);

  // 移除执行
  const removeExecution = useCallback((executionId: string) => {
    setExecutions(prev => prev.filter(exec => exec.executionId !== executionId));
  }, []);

  // 处理进度事件
  const handleProgressEvent = useCallback((event: ToolProgressEvent & { executionId: string }) => {
    const execution = executions.find(exec => exec.executionId === event.executionId);
    
    if (!execution) {
      // 创建新的执行记录
      addExecution({
        executionId: event.executionId,
        toolId: event.data?.toolId || 'unknown',
        toolName: getToolName(event.data?.toolId),
        status: 'executing',
        progress: event.progress,
        message: event.message,
        startTime: event.timestamp,
        streaming: event.type.includes('output'),
        metadata: event.data
      });
    } else {
      // 更新现有执行
      updateExecution(event.executionId, {
        progress: event.progress,
        message: event.message,
        metadata: { ...execution.metadata, ...event.data },
        ...(event.type.includes('output') && { 
          streaming: true,
          streamContent: (execution.streamContent || '') + (event.data?.data || '')
        })
      });
    }
  }, [executions, addExecution, updateExecution]);

  // 获取工具名称
  const getToolName = (toolId?: string) => {
    switch (toolId) {
      case 'enhanced-bash':
        return 'Bash 命令执行';
      case 'bash':
        return 'Bash 工具';
      case 'file':
        return '文件操作';
      case 'git':
        return 'Git 操作';
      case 'search':
        return '代码搜索';
      default:
        return toolId ? `${toolId} 工具` : '未知工具';
    }
  };

  // 暴露的API
  const api = {
    executions,
    addExecution,
    updateExecution,
    removeExecution,
    handleProgressEvent,
    clearAll: () => setExecutions([])
  };

  return {
    executions,
    managerRef: setManagerRef,
    ...api
  };
}