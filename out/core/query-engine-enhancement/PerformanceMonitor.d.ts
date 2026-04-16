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
/**
 * 性能指标类型
 */
export type PerformanceMetric = 'response_time' | 'memory_usage' | 'cpu_usage' | 'cache_hit_rate' | 'error_rate' | 'throughput';
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
        rate: number;
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
export declare class PerformanceMonitor {
    private config;
    private metrics;
    private events;
    private alerts;
    private monitoringInterval?;
    private startTime;
    private requestCount;
    private errorCount;
    private cacheHits;
    private cacheMisses;
    private responseTimes;
    constructor(config?: Partial<PerformanceMonitorConfig>);
    /**
     * 开始监控
     */
    start(): void;
    /**
     * 停止监控
     */
    stop(): void;
    /**
     * 记录工具执行事件
     */
    recordToolExecution(toolId: string, duration: number, success: boolean, error?: string): void;
    /**
     * 记录缓存命中
     */
    recordCacheHit(): void;
    /**
     * 记录缓存未命中
     */
    recordCacheMiss(): void;
    /**
     * 记录错误
     */
    recordError(errorType: string, error?: string): void;
    /**
     * 获取当前性能指标
     */
    getMetrics(): PerformanceMetrics;
    /**
     * 获取性能报告
     */
    getReport(): {
        summary: {
            uptime: number;
            totalRequests: number;
            averageResponseTime: number;
            errorRate: number;
            cacheHitRate: number;
        };
        alerts: PerformanceAlert[];
        recommendations: string[];
    };
    /**
     * 重置监控数据
     */
    reset(): void;
    /**
     * 导出性能数据
     */
    exportData(format?: 'json' | 'csv'): string;
    /**
     * 创建初始指标
     */
    private createInitialMetrics;
    /**
     * 收集系统指标
     */
    private collectSystemMetrics;
    /**
     * 收集指标
     */
    private collectMetrics;
    /**
     * 收集内存指标
     */
    private collectMemoryMetrics;
    /**
     * 收集CPU指标
     */
    private collectCpuMetrics;
    /**
     * 收集缓存指标
     */
    private collectCacheMetrics;
    /**
     * 收集吞吐量指标
     */
    private collectThroughputMetrics;
    /**
     * 更新实时指标
     */
    private updateRealTimeMetrics;
    /**
     * 计算百分位数
     */
    private calculatePercentile;
    /**
     * 获取平均响应时间
     */
    private getAverageResponseTime;
    /**
     * 获取错误率
     */
    private getErrorRate;
    /**
     * 获取缓存命中率
     */
    private getCacheHitRate;
    /**
     * 按类型统计错误
     */
    private countErrorsByType;
    /**
     * 检查阈值
     */
    private checkThresholds;
    /**
     * 记录告警
     */
    private recordAlert;
    /**
     * 生成建议
     */
    private generateRecommendations;
    /**
     * 转换为CSV
     */
    private convertToCSV;
}
/**
 * 创建性能监控器
 */
export declare function createPerformanceMonitor(config?: Partial<PerformanceMonitorConfig>): PerformanceMonitor;
/**
 * 工具性能包装器
 */
export declare function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(toolId: string, fn: T, monitor: PerformanceMonitor): T;
export default PerformanceMonitor;
//# sourceMappingURL=PerformanceMonitor.d.ts.map