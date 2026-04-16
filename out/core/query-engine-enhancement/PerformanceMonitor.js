"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
exports.createPerformanceMonitor = createPerformanceMonitor;
exports.withPerformanceMonitoring = withPerformanceMonitoring;
const os = __importStar(require("os"));
const process = __importStar(require("process"));
/**
 * 性能监控器
 */
class PerformanceMonitor {
    config;
    metrics;
    events = [];
    alerts = [];
    monitoringInterval;
    startTime;
    requestCount = 0;
    errorCount = 0;
    cacheHits = 0;
    cacheMisses = 0;
    // 响应时间历史
    responseTimes = [];
    constructor(config) {
        this.config = {
            monitoringInterval: 5000, // 5秒
            enableMemoryMonitoring: true,
            enableCpuMonitoring: true,
            enableCacheMonitoring: true,
            historySize: 1000,
            thresholds: {
                maxResponseTime: 1000, // 1秒
                maxMemoryUsage: 500, // 500MB
                maxErrorRate: 5, // 5%
                minCacheHitRate: 80, // 80%
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
    start() {
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
    stop() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
            console.log('🛑 Performance monitoring stopped');
        }
    }
    /**
     * 记录工具执行事件
     */
    recordToolExecution(toolId, duration, success, error) {
        const event = {
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
    recordCacheHit() {
        this.cacheHits++;
        const event = {
            type: 'cache_hit',
            timestamp: new Date(),
        };
        this.events.push(event);
    }
    /**
     * 记录缓存未命中
     */
    recordCacheMiss() {
        this.cacheMisses++;
        const event = {
            type: 'cache_miss',
            timestamp: new Date(),
        };
        this.events.push(event);
    }
    /**
     * 记录错误
     */
    recordError(errorType, error) {
        this.errorCount++;
        const event = {
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
    getMetrics() {
        // 更新实时指标
        this.updateRealTimeMetrics();
        return { ...this.metrics };
    }
    /**
     * 获取性能报告
     */
    getReport() {
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
    reset() {
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
    exportData(format = 'json') {
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
    createInitialMetrics() {
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
    collectSystemMetrics() {
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
    collectMetrics() {
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
    collectMemoryMetrics() {
        const memoryUsage = process.memoryUsage();
        this.metrics.memoryUsage = {
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024), // MB
            rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
            max: Math.max(this.metrics.memoryUsage.max, Math.round(memoryUsage.rss / 1024 / 1024)),
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
    collectCpuMetrics() {
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
    collectCacheMetrics() {
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
    collectThroughputMetrics() {
        const uptimeSeconds = (new Date().getTime() - this.startTime.getTime()) / 1000;
        const requestsPerSecond = uptimeSeconds > 0 ? this.requestCount / uptimeSeconds : 0;
        this.metrics.throughput = {
            requestsPerSecond,
            totalRequests: this.requestCount,
            peakRequestsPerSecond: Math.max(this.metrics.throughput.peakRequestsPerSecond, requestsPerSecond),
        };
    }
    /**
     * 更新实时指标
     */
    updateRealTimeMetrics() {
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
    calculatePercentile(sortedValues, percentile) {
        if (sortedValues.length === 0)
            return 0;
        const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
        return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
    }
    /**
     * 获取平均响应时间
     */
    getAverageResponseTime() {
        if (this.responseTimes.length === 0)
            return 0;
        return this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
    }
    /**
     * 获取错误率
     */
    getErrorRate() {
        if (this.requestCount === 0)
            return 0;
        return (this.errorCount / this.requestCount) * 100;
    }
    /**
     * 获取缓存命中率
     */
    getCacheHitRate() {
        const total = this.cacheHits + this.cacheMisses;
        if (total === 0)
            return 0;
        return (this.cacheHits / total) * 100;
    }
    /**
     * 按类型统计错误
     */
    countErrorsByType() {
        const errorTypes = {};
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
    checkThresholds() {
        // 阈值检查已经在各个收集方法中完成
        // 这里可以添加全局阈值检查
    }
    /**
     * 记录告警
     */
    recordAlert(alert) {
        if (!this.config.alerts.enabled) {
            return;
        }
        const fullAlert = {
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
            }
            catch (error) {
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
    generateRecommendations() {
        const recommendations = [];
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
    convertToCSV(data) {
        // 简化实现：只导出摘要数据
        const rows = [];
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
exports.PerformanceMonitor = PerformanceMonitor;
/**
 * 创建性能监控器
 */
function createPerformanceMonitor(config) {
    return new PerformanceMonitor(config);
}
/**
 * 工具性能包装器
 */
function withPerformanceMonitoring(toolId, fn, monitor) {
    return (async (...args) => {
        const startTime = Date.now();
        let success = false;
        let error;
        try {
            const result = await fn(...args);
            success = true;
            return result;
        }
        catch (err) {
            error = err.message;
            monitor.recordError('tool_execution', error);
            throw err;
        }
        finally {
            const duration = Date.now() - startTime;
            monitor.recordToolExecution(toolId, duration, success, error);
        }
    });
}
exports.default = PerformanceMonitor;
//# sourceMappingURL=PerformanceMonitor.js.map