/**
 * PerformanceMonitor - 性能监控器
 * 
 * 监控编码工具的性能指标：
 * 1. 响应时间监控
 * 2. 内存使用跟踪
 * 3. 缓存命中率统计
 * 4. 错误率监控
 * 5. 性能报告生成
 */

import * as os from 'os';
import * as process from 'process';

/**
 * 性能指标类型
 */
export type PerformanceMetric = 
  | 'response_time'      // 响应时间
  | 'memory_usage'       // 内存使用
  | 'cpu_usage'          // CPU使用率
  | 'cache_hit_rate'     // 缓存命中率
  | 'error_rate'         // 错误率
  | 'throughput';        // 吞吐量

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 响应时间（毫秒） */
  responseTime: {
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
    recent: number[];
  };
  
  /** 内存使用（MB） */
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    max: number;
  };
  
  /** CPU使用率（百分比） */
  cpuUsage: {
    user: number;
    system: number;
    idle: number;
  };
  
  /** 缓存统计 */
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    maxSize: number;
  };
  
  /** 错误统计 */
  errors: {
    total: number;
    byType: Record<string, number>;
    rate: number; // 错误率（错误数/总请求数）
  };
  
  /** 吞吐量（请求/秒） */
  throughput: {
    requestsPerSecond: number;
    totalRequests: number;
    peakRequestsPerSecond: number;
  };
  
  /** 系统指标 */
  system: {
    platform: string;
    arch: string;
    cpus: number;
    totalMemory: number;
    freeMemory: number;
    uptime: number;
  };
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
  /** 监控间隔（毫秒） */
  monitoringInterval: number;
  
  /** 是否启用内存监控 */
  enableMemoryMonitoring: boolean;
  
  /** 是否启用CPU监控 */
  enableCpuMonitoring: boolean;
  
  /** 是否启用缓存监控 */
  enableCacheMonitoring: boolean;
  
  /** 历史数据保留数量 */
  historySize: number;
  
  /** 性能阈值 */
  thresholds: {
    /** 最大响应时间（毫秒） */
    maxResponseTime: number;
    
    /** 最大内存使用（MB） */
    maxMemoryUsage: number;
    
    /** 最大错误率（百分比） */
    maxErrorRate: number;
    
    /** 最小缓存命中率（百分比） */
    minCacheHitRate: number;
  };
  
  /** 告警配置 */
  alerts: {
    /** 是否启用告警 */
    enabled: boolean;
    
    /** 告警回调函数 */
    onAlert?: (alert: PerformanceAlert) => void;
  };
}

/**
 * 性能告警
 */
export interface PerformanceAlert {
  /** 告警ID */
  id: string;
  
  /** 告警级别 */
  level: 'info' | 'warning' | 'error' | 'critical';
  
  /** 告警类型 */
  type: PerformanceMetric;
  
  /** 告警消息 */
  message: string;
  
  /** 当前值 */
  currentValue: number;
  
  /** 阈值 */
  threshold: number;
  
  /** 时间戳 */
  timestamp: Date;
  
  /** 建议操作 */
  suggestedAction?: string;
}

/**
 * 性能监控事件
 */
export interface PerformanceEvent {
  /** 事件类型 */
  type: 'tool_execution' | 'cache_hit' | 'cache_miss' | 'error' | 'request';
  
  /** 工具ID（如果适用） */
  toolId?: string;
  
  /** 持续时间（毫秒） */
  duration?: number;
  
  /** 是否成功 */
  success?: boolean;
  
  /** 错误信息 */
  error?: string;
  
  /** 时间戳 */
  timestamp: Date;
  
  /** 附加数据 */
  metadata?: any;
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private metrics: PerformanceMetrics;
  private events: PerformanceEvent[] = [];
  private alerts: PerformanceAlert[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private startTime: Date;
  private requestCount = 0;
  private errorCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  
  // 响应时间历史
  private responseTimes: number[] = [];
  
  constructor(config?: Partial<PerformanceMonitorConfig>) {
    this.config = {
      monitoringInterval: 5000, // 5秒
      enableMemoryMonitoring: true,
      enableCpuMonitoring: true,
      enableCacheMonitoring: true,
      historySize: 1000,
      thresholds: {
        maxResponseTime: 1000, // 1秒
        maxMemoryUsage: 500,   // 500MB
        maxErrorRate: 5,       // 5%
        minCacheHitRate: 80,   // 80%
      },
      alerts: {
        enabled: true,
      },
      ...config,
    };
    
    this.startTime = new Date();
    this.metrics = this.createInitialMetrics();
  }
  
  /**
   * 开始监控
   */
  public start(): void {
    if (this.monitoringInterval) {
      this.stop();
    }
    
    console.log('🚀 Starting performance monitoring...');
    
    // 初始数据收集
    this.collectSystemMetrics();
    
    // 开始定期监控
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkThresholds();
    }, this.config.monitoringInterval);
  }
  
  /**
   * 停止监控
   */
  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('🛑 Performance monitoring stopped');
    }
  }
  
  /**
   * 记录工具执行事件
   */
  public recordToolExecution(
    toolId: string,
    duration: number,
    success: boolean,
    error?: string
  ): void {
    const event: PerformanceEvent = {
      type: 'tool_execution',
      toolId,
      duration,
      success,
      error,
      timestamp: new Date(),
    };
    
    this.events.push(event);
    
    // 更新请求计数
    this.requestCount++;
    
    // 更新错误计数
    if (!success) {
      this.errorCount++;
    }
    
    // 记录响应时间
    this.responseTimes.push(duration);
    
    // 保持历史数据大小
    if (this.responseTimes.length > this.config.historySize) {
      this.responseTimes = this.responseTimes.slice(-this.config.historySize);
    }
    
    if (this.events.length > this.config.historySize * 10) {
      this.events = this.events.slice(-this.config.historySize * 10);
    }
    
    // 检查响应时间阈值
    if (duration > this.config.thresholds.maxResponseTime) {
      this.recordAlert({
        level: 'warning',
        type: 'response_time',
        message: `Tool ${toolId} response time exceeds threshold`,
        currentValue: duration,
        threshold: this.config.thresholds.maxResponseTime,
        suggestedAction: 'Consider optimizing the tool or adding caching',
      });
    }
  }
  
  /**
   * 记录缓存命中
   */
  public recordCacheHit(): void {
    this.cacheHits++;
    
    const event: PerformanceEvent = {
      type: 'cache_hit',
      timestamp: new Date(),
    };
    
    this.events.push(event);
  }
  
  /**
   * 记录缓存未命中
   */
  public recordCacheMiss(): void {
    this.cacheMisses++;
    
    const event: PerformanceEvent = {
      type: 'cache_miss',
      timestamp: new Date(),
    };
    
    this.events.push(event);
  }
  
  /**
   * 记录错误
   */
  public recordError(errorType: string, error?: string): void {
    this.errorCount++;
    
    const event: PerformanceEvent = {
      type: 'error',
      error: error || errorType,
      timestamp: new Date(),
      metadata: { errorType },
    };
    
    this.events.push(event);
    
    // 检查错误率阈值
    const errorRate = this.getErrorRate();
    if (errorRate > this.config.thresholds.maxErrorRate) {
      this.recordAlert({
        level: 'error',
        type: 'error_rate',
        message: `Error rate exceeds threshold: ${errorRate.toFixed(1)}%`,
        currentValue: errorRate,
        threshold: this.config.thresholds.maxErrorRate,
        suggestedAction: 'Investigate root cause of increased errors',
      });
    }
  }
  
  /**
   * 获取当前性能指标
   */
  public getMetrics(): PerformanceMetrics {
    // 更新实时指标
    this.updateRealTimeMetrics();
    
    return { ...this.metrics };
  }
  
  /**
   * 获取性能报告
   */
  public getReport(): {
    summary: {
      uptime: number;
      totalRequests: number;
      averageResponseTime: number;
      errorRate: number;
      cacheHitRate: number;
    };
    alerts: PerformanceAlert[];
    recommendations: string[];
  } {
    const uptime = (new Date().getTime() - this.startTime.getTime()) / 1000; // 秒
    
    const summary = {
      uptime,
      totalRequests: this.requestCount,
      averageResponseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate(),
      cacheHitRate: this.getCacheHitRate(),
    };
    
    const recommendations = this.generateRecommendations();
    
    return {
      summary,
      alerts: [...this.alerts],
      recommendations,
    };
  }
  
  /**
   * 重置监控数据
   */
  public reset(): void {
    this.events = [];
    this.alerts = [];
    this.responseTimes = [];
    this.requestCount = 0;
    this.errorCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.startTime = new Date();
    this.metrics = this.createInitialMetrics();
    
    console.log('🔄 Performance monitoring data reset');
  }
  
  /**
   * 导出性能数据
   */
  public exportData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      metadata: {
        exportTime: new Date().toISOString(),
        monitoringStartTime: this.startTime.toISOString(),
        config: this.config,
      },
      metrics: this.getMetrics(),
      report: this.getReport(),
      recentEvents: this.events.slice(-100), // 最近100个事件
    };
    
    if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return JSON.stringify(data, null, 2);
  }
  
  // ==================== 私有方法 ====================
  
  /**
   * 创建初始指标
   */
  private createInitialMetrics(): PerformanceMetrics {
    return {
      responseTime: {
        min: 0,
        max: 0,
        avg: 0,
        p95: 0,
        p99: 0,
        recent: [],
      },
      memoryUsage: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
        max: 0,
      },
      cpuUsage: {
        user: 0,
        system: 0,
        idle: 100,
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        maxSize: 0,
      },
      errors: {
        total: 0,
        byType: {},
        rate: 0,
      },
      throughput: {
        requestsPerSecond: 0,
        totalRequests: 0,
        peakRequestsPerSecond: 0,
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        uptime: os.uptime(),
      },
    };
  }
  
  /**
   * 收集系统指标
   */
  private collectSystemMetrics(): void {
    this.metrics.system = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
    };
  }
  
  /**
   * 收集指标
   */
  private collectMetrics(): void {
    // 收集内存使用
    if (this.config.enableMemoryMonitoring) {
      this.collectMemoryMetrics();
    }
    
    // 收集CPU使用率
    if (this.config.enableCpuMonitoring) {
      this.collectCpuMetrics();
    }
    
    // 收集缓存统计
    if (this.config.enableCacheMonitoring) {
      this.collectCacheMetrics();
    }
    
    // 收集吞吐量
    this.collectThroughputMetrics();
  }
  
  /**
   * 收集内存指标
   */
  private collectMemoryMetrics(): void {
    const memoryUsage = process.memoryUsage();
    
    this.metrics.memoryUsage = {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      max: Math.max(
        this.metrics.memoryUsage.max,
        Math.round(memoryUsage.rss / 1024 / 1024)
      ),
    };
    
    // 检查内存阈值
    const memoryMB = this.metrics.memoryUsage.rss;
    if (memoryMB > this.config.thresholds.maxMemoryUsage) {
      this.recordAlert({
        level: 'warning',
        type: 'memory_usage',
        message: `Memory usage exceeds threshold: ${memoryMB}MB`,
        currentValue: memoryMB,
        threshold: this.config.thresholds.maxMemoryUsage,
        suggestedAction: 'Investigate memory leaks or optimize memory usage',
      });
    }
  }
  
  /**
   * 收集CPU指标
   */
  private collectCpuMetrics(): void {
    // 简化实现：使用进程CPU使用率
    const cpuUsage = process.cpuUsage();
    const totalCpu = cpuUsage.user + cpuUsage.system;
    
    // 转换为百分比（简化）
    const userPercent = (cpuUsage.user / 1000000) * 100; // 微秒转百分比
    const systemPercent = (cpuUsage.system / 1000000) * 100;
    
    this.metrics.cpuUsage = {
      user: Math.min(userPercent, 100),
      system: Math.min(systemPercent, 100),
      idle: Math.max(0, 100 - userPercent - systemPercent),
    };
  }
  
  /**
   * 收集缓存指标
   */
  private collectCacheMetrics(): void {
    const totalCacheAccess = this.cacheHits + this.cacheMisses;
    const hitRate = totalCacheAccess > 0 ? (this.cacheHits / totalCacheAccess) * 100 : 0;
    
    this.metrics.cache = {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate,
      size: 0, // 实际实现中应该跟踪缓存大小
      maxSize: 0,
    };
    
    // 检查缓存命中率阈值
    if (totalCacheAccess > 10 && hitRate < this.config.thresholds.minCacheHitRate) {
      this.recordAlert({
        level: 'warning',
        type: 'cache_hit_rate',
        message: `Cache hit rate below threshold: ${hitRate.toFixed(1)}%`,
        currentValue: hitRate,
        threshold: this.config.thresholds.minCacheHitRate,
        suggestedAction: 'Consider adjusting cache size or expiration policies',
      });
    }
  }
  
  /**
   * 收集吞吐量指标
   */
  private collectThroughputMetrics(): void {
    const uptimeSeconds = (new Date().getTime() - this.startTime.getTime()) / 1000;
    const requestsPerSecond = uptimeSeconds > 0 ? this.requestCount / uptimeSeconds : 0;
    
    this.metrics.throughput = {
      requestsPerSecond,
      totalRequests: this.requestCount,
      peakRequestsPerSecond: Math.max(
        this.metrics.throughput.peakRequestsPerSecond,
        requestsPerSecond
      ),
    };
  }
  
  /**
   * 更新实时指标
   */
  private updateRealTimeMetrics(): void {
    // 更新响应时间统计
    if (this.responseTimes.length > 0) {
      const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
      
      this.metrics.responseTime = {
        min: sortedTimes[0],
        max: sortedTimes[sortedTimes.length - 1],
        avg: sortedTimes.reduce((sum, time) => sum + time, 0) / sortedTimes.length,
        p95: this.calculatePercentile(sortedTimes, 95),
        p99: this.calculatePercentile(sortedTimes, 99),
        recent: sortedTimes.slice(-10), // 最近10个响应时间
      };
    }
    
    // 更新错误统计
    const errorRate = this.getErrorRate();
    this.metrics.errors = {
      total: this.errorCount,
      byType: this.countErrorsByType(),
      rate: errorRate,
    };
  }
  
  /**
   * 计算百分位数
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
  }
  
  /**
   * 获取平均响应时间
   */
  private getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    return this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }
  
  /**
   * 获取错误率
   */
  private getErrorRate(): number {
    if (this.requestCount === 0) return 0;
    return (this.errorCount / this.requestCount) * 100;
  }
  
  /**
   * 获取缓存命中率
   */
  private getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    if (total === 0) return 0;
    return (this.cacheHits / total) * 100;
  }
  
  /**
   * 按类型统计错误
   */
  private countErrorsByType(): Record<string, number> {
    const errorTypes: Record<string, number> = {};
    
    for (const event of this.events) {
      if (event.type === 'error' && event.metadata?.errorType) {
        const type = event.metadata.errorType;
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      }
    }
    
    return errorTypes;
  }
  
  /**
   * 检查阈值
   */
  private checkThresholds(): void {
    // 阈值检查已经在各个收集方法中完成
    // 这里可以添加全局阈值检查
  }
  
  /**
   * 记录告警
   */
  private recordAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    if (!this.config.alerts.enabled) {
      return;
    }
    
    const fullAlert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...alert,
    };
    
    this.alerts.push(fullAlert);
    
    // 保持告警数量
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    // 触发告警回调
    if (this.config.alerts.onAlert) {
      try {
        this.config.alerts.onAlert(fullAlert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    }
    
    // 输出到控制台（根据级别）
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨',
    }[alert.level];
    
    console.log(`${emoji} Performance Alert [${alert.level.toUpperCase()}]: ${alert.message}`);
  }
  
  /**
   * 生成建议
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getMetrics();
    const report = this.getReport();
    
    // 响应时间建议
    if (metrics.responseTime.avg > this.config.thresholds.maxResponseTime * 0.7) {
      recommendations.push('Response time is approaching threshold. Consider optimizing slow operations.');
    }
    
    // 内存使用建议
    if (metrics.memoryUsage.rss > this.config.thresholds.maxMemoryUsage * 0.8) {
      recommendations.push('Memory usage is high. Monitor for memory leaks and consider garbage collection optimization.');
    }
    
    // 缓存建议
    if (metrics.cache.hitRate < this.config.thresholds.minCacheHitRate) {
      recommendations.push('Cache hit rate is low. Consider increasing cache size or improving cache key strategy.');
    }
    
    // 错误率建议
    if (report.summary.errorRate > this.config.thresholds.maxErrorRate * 0.5) {
      recommendations.push('Error rate is elevated. Investigate common error patterns and add error handling.');
    }
    
    // 吞吐量建议
    if (metrics.throughput.requestsPerSecond > 100) {
      recommendations.push('High throughput detected. Ensure system can handle the load and consider scaling.');
    }
    
    // 如果没有问题，添加正面反馈
    if (recommendations.length === 0) {
      recommendations.push('Performance metrics are within acceptable ranges. Continue monitoring.');
    }
    
    return recommendations.slice(0, 5); // 限制为5条建议
  }
  
  /**
   * 转换为CSV
   */
  private convertToCSV(data: any): string {
    // 简化实现：只导出摘要数据
    const rows: string[] = [];
    
    // 添加标题
    rows.push('Metric,Value,Unit');
    
    // 添加摘要数据
    const summary = data.report.summary;
    rows.push(`Uptime,${summary.uptime},seconds`);
    rows.push(`Total Requests,${summary.totalRequests},count`);
    rows.push(`Average Response Time,${summary.averageResponseTime.toFixed(2)},ms`);
    rows.push(`Error Rate,${summary.errorRate.toFixed(2)},%`);
    rows.push(`Cache Hit Rate,${summary.cacheHitRate.toFixed(2)},%`);
    
    // 添加告警计数
    rows.push(`Total Alerts,${data.report.alerts.length},count`);
    
    return rows.join('\n');
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(
  config?: Partial<PerformanceMonitorConfig>
): PerformanceMonitor {
  return new PerformanceMonitor(config);
}

/**
 * 工具性能包装器
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  toolId: string,
  fn: T,
  monitor: PerformanceMonitor
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;
    
    try {
      const result = await fn(...args);
      success = true;
      return result;
    } catch (err: any) {
      error = err.message;
      monitor.recordError('tool_execution', error);
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      monitor.recordToolExecution(toolId, duration, success, error);
    }
  }) as T;
}

export default PerformanceMonitor;