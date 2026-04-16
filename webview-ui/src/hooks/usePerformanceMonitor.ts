/**
 * usePerformanceMonitor Hook
 * 
 * Phase 5 性能优化的一部分
 * 用于监控React组件渲染性能和性能瓶颈
 */

import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  /** 组件首次渲染时间 */
  initialRenderTime: number;
  /** 组件重渲染次数 */
  reRenderCount: number;
  /** 最近渲染时间 */
  lastRenderTime: number;
  /** 平均渲染时间 */
  averageRenderTime: number;
  /** 最长渲染时间 */
  maxRenderTime: number;
}

interface PerformanceOptions {
  /** 组件名称（用于标识） */
  componentName: string;
  /** 是否在控制台输出性能数据 */
  logToConsole?: boolean;
  /** 性能阈值（毫秒），超过则警告 */
  warningThresholdMs?: number;
  /** 采样率（0-1），1表示记录所有渲染 */
  sampleRate?: number;
  /** 启用详细时间测量 */
  enableDetailedTiming?: boolean;
}

/**
 * React性能监控Hook
 * 用于跟踪组件渲染性能
 */
export const usePerformanceMonitor = (options: PerformanceOptions) => {
  const {
    componentName,
    logToConsole = process.env.NODE_ENV === 'development',
    warningThresholdMs = 16, // 60fps的目标帧时间
    sampleRate = 0.1, // 10%的采样率
    enableDetailedTiming = false,
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    initialRenderTime: 0,
    reRenderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    maxRenderTime: 0,
  });

  const renderStartTimeRef = useRef<number>(0);
  const detailedMetricsRef = useRef<{
    renderTimes: number[];
    updateTimes: number[];
    effectTimes: number[];
  }>({
    renderTimes: [],
    updateTimes: [],
    effectTimes: [],
  });

  // 测量渲染开始
  const startMeasurement = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  // 测量渲染结束
  const endMeasurement = useCallback((phase: 'render' | 'update' | 'effect' = 'render') => {
    const endTime = performance.now();
    const renderTime = endTime - renderStartTimeRef.current;

    // 更新基础指标
    const metrics = metricsRef.current;
    
    if (metrics.initialRenderTime === 0) {
      metrics.initialRenderTime = renderTime;
    } else {
      metrics.reRenderCount++;
    }
    
    metrics.lastRenderTime = renderTime;
    
    // 更新平均渲染时间
    const totalRenders = metrics.reRenderCount + 1;
    metrics.averageRenderTime = 
      (metrics.averageRenderTime * (totalRenders - 1) + renderTime) / totalRenders;
    
    // 更新最大渲染时间
    if (renderTime > metrics.maxRenderTime) {
      metrics.maxRenderTime = renderTime;
    }

    // 存储详细指标
    if (enableDetailedTiming) {
      detailedMetricsRef.current[`${phase}Times`].push(renderTime);
      
      // 限制数组大小，避免内存泄漏
      if (detailedMetricsRef.current[`${phase}Times`].length > 1000) {
        detailedMetricsRef.current[`${phase}Times`].shift();
      }
    }

    // 随机采样，避免性能开销过大
    if (Math.random() < sampleRate) {
      // 检查是否超过警告阈值
      if (renderTime > warningThresholdMs && logToConsole) {
        console.warn(
          `⚠️ 性能警告: ${componentName} 渲染时间 ${renderTime.toFixed(2)}ms ` +
          `超过阈值 ${warningThresholdMs}ms`
        );
      }

      // 定期记录性能指标
      if (logToConsole && metrics.reRenderCount % 100 === 0) {
        console.log(
          `📊 ${componentName} 性能指标: ` +
          `平均 ${metrics.averageRenderTime.toFixed(2)}ms, ` +
          `最大 ${metrics.maxRenderTime.toFixed(2)}ms, ` +
          `重渲染 ${metrics.reRenderCount} 次`
        );
      }
    }
  }, [componentName, warningThresholdMs, sampleRate, logToConsole, enableDetailedTiming]);

  // 获取当前性能指标
  const getMetrics = useCallback(() => {
    return {
      ...metricsRef.current,
      // 计算更多派生指标
      fps: metricsRef.current.averageRenderTime > 0 
        ? 1000 / metricsRef.current.averageRenderTime 
        : 0,
      isBelowThreshold: metricsRef.current.averageRenderTime <= warningThresholdMs,
      // 详细指标
      detailed: enableDetailedTiming ? detailedMetricsRef.current : undefined,
    };
  }, [warningThresholdMs, enableDetailedTiming]);

  // 重置指标
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      initialRenderTime: 0,
      reRenderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      maxRenderTime: 0,
    };
    if (enableDetailedTiming) {
      detailedMetricsRef.current = {
        renderTimes: [],
        updateTimes: [],
        effectTimes: [],
      };
    }
  }, [enableDetailedTiming]);

  // 自动开始测量组件渲染
  useEffect(() => {
    startMeasurement();
    
    // 在开发环境中，监听渲染完成
    if (logToConsole) {
      const handleRenderComplete = () => {
        endMeasurement('render');
      };
      
      // 使用setTimeout确保在渲染完成后执行
      const timer = setTimeout(handleRenderComplete, 0);
      return () => clearTimeout(timer);
    }
    
    return () => {
      endMeasurement('render');
    };
  }, [startMeasurement, endMeasurement, logToConsole]);

  return {
    startMeasurement,
    endMeasurement,
    getMetrics,
    resetMetrics,
  };
};

/**
 * 用于测量特定代码块执行时间的工具函数
 */
export const measureExecutionTime = <T>(
  fn: () => T,
  label: string = 'Code execution',
  logToConsole: boolean = process.env.NODE_ENV === 'development'
): T => {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  
  if (logToConsole) {
    console.log(`⏱️ ${label}: ${executionTime.toFixed(2)}ms`);
  }
  
  return result;
};

/**
 * 创建性能监控的HOC（高阶组件）
 */
export const withPerformanceMonitor = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
  options?: Partial<PerformanceOptions>
) => {
  const ComponentWithPerformanceMonitor = (props: P) => {
    const { startMeasurement, endMeasurement } = usePerformanceMonitor({
      componentName,
      logToConsole: false, // HOC内部不直接记录
      ...options,
    });
    
    startMeasurement();
    
    // 在组件渲染完成后结束测量
    const result = <WrappedComponent {...props} />;
    
    // 使用useEffect确保在渲染完成后记录
    const { useEffect } = require('react');
    useEffect(() => {
      endMeasurement('render');
    }, [endMeasurement]);
    
    return result;
  };
  
  ComponentWithPerformanceMonitor.displayName = `WithPerformanceMonitor(${componentName})`;
  
  return ComponentWithPerformanceMonitor;
};

export default usePerformanceMonitor;