/**
 * 性能基准测试
 * 
 * 测试EnhancedEngineAdapter的性能指标：
 * 1. 初始化时间
 * 2. 消息处理延迟
 * 3. 工具调用性能
 * 4. 并发处理能力
 * 5. 内存使用情况
 */

import { RealEnhancedEngineAdapterWrapper } from '../adapters/RealEnhancedEngineAdapterWrapper';
import { createExtensionContext } from '../mocks/vscodeExtended';

// ==================== 性能基准配置 ====================

const BENCHMARK_CONFIG = {
  verbose: false,
  enableStreaming: false,
  defaultMode: 'act' as const,
  context: createExtensionContext(),
};

const BENCHMARK_ITERATIONS = {
  initialization: 10,      // 初始化测试迭代次数
  messageProcessing: 20,   // 消息处理测试迭代次数
  toolExecution: 15,       // 工具执行测试迭代次数
  concurrent: 5,           // 并发测试迭代次数
};

// ==================== 性能统计工具 ====================

class PerformanceStats {
  private measurements: number[] = [];
  private name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  record(value: number): void {
    this.measurements.push(value);
  }
  
  getResults(): PerformanceResult {
    if (this.measurements.length === 0) {
      return {
        name: this.name,
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        total: 0
      };
    }
    
    const sorted = [...this.measurements].sort((a, b) => a - b);
    const count = sorted.length;
    const total = sorted.reduce((sum, val) => sum + val, 0);
    const avg = total / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p50 = sorted[Math.floor(count * 0.5)];
    const p95 = sorted[Math.floor(count * 0.95)];
    const p99 = sorted[Math.floor(count * 0.99)];
    
    return {
      name: this.name,
      count,
      avg,
      min,
      max,
      p50,
      p95,
      p99,
      total
    };
  }
  
  clear(): void {
    this.measurements = [];
  }
}

interface PerformanceResult {
  name: string;
  count: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  total: number;
}

// ==================== 性能测试套件 ====================

describe('性能基准测试', () => {
  
  // 性能统计
  const initializationStats = new PerformanceStats('初始化时间');
  const messageStats = new PerformanceStats('消息处理延迟');
  const toolCallStats = new PerformanceStats('工具调用延迟');
  const concurrentStats = new PerformanceStats('并发处理');
  
  // 在每个测试套件后输出性能报告
  after(() => {
    console.log('\n' + '='.repeat(80));
    console.log('📊 性能基准测试报告');
    console.log('='.repeat(80));
    
    const allStats = [
      initializationStats,
      messageStats,
      toolCallStats,
      concurrentStats
    ];
    
    allStats.forEach(stats => {
      const results = stats.getResults();
      if (results.count > 0) {
        console.log(`\n${results.name}:`);
        console.log(`  迭代次数: ${results.count}`);
        console.log(`  平均时间: ${results.avg.toFixed(2)}ms`);
        console.log(`  最小时间: ${results.min.toFixed(2)}ms`);
        console.log(`  最大时间: ${results.max.toFixed(2)}ms`);
        console.log(`  P50: ${results.p50.toFixed(2)}ms`);
        console.log(`  P95: ${results.p95.toFixed(2)}ms`);
        console.log(`  P99: ${results.p99.toFixed(2)}ms`);
        console.log(`  总时间: ${results.total.toFixed(2)}ms`);
      }
    });
  });
  
  // ========== 测试1: 初始化性能 ==========
  
  describe('初始化性能', () => {
    it('应该测量初始化时间', async () => {
      //  // 设置更长超时时间 - 在自定义测试运行器中不支持
      
      console.log('🧪 测试初始化性能...');
      
      for (let i = 0; i < BENCHMARK_ITERATIONS.initialization; i++) {
        const startTime = performance.now();
        
        const adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
          ...BENCHMARK_CONFIG,
          onEngineReady: () => {},
          onStateUpdate: () => {},
        }, {
          useRealComponent: false,
          verbose: false,
        });
        
        await adapterWrapper.initialize();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        initializationStats.record(duration);
        
        // 清理资源
        adapterWrapper.reset();
        
        if (BENCHMARK_CONFIG.verbose) {
          console.log(`  迭代 ${i + 1}: ${duration.toFixed(2)}ms`);
        }
      }
      
      console.log(`✅ 完成 ${BENCHMARK_ITERATIONS.initialization} 次初始化测试`);
    });
  });
  
  // ========== 测试2: 消息处理性能 ==========
  
  describe('消息处理性能', () => {
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    
    before(async () => {
      console.log('🧪 准备消息处理性能测试...');
      adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...BENCHMARK_CONFIG,
      }, {
        useRealComponent: false,
        verbose: false,
      });
      
      await adapterWrapper.initialize();
    });
    
    after(() => {
      adapterWrapper.reset();
    });
    
    it('应该测量消息处理延迟', async function() {
      
      
      console.log('🧪 测试消息处理性能...');
      
      // 测试不同类型消息
      const testMessages = [
        '你好，请介绍你自己',
        '请帮我分析代码',
        '读取当前目录的文件',
        '执行一个简单的命令',
        '这个任务需要工具调用吗？',
        '请帮我计划一个重构任务',
        '分析这个文件的内容',
        '检查代码质量问题',
        '执行性能测试',
        '生成测试报告'
      ];
      
      for (let i = 0; i < BENCHMARK_ITERATIONS.messageProcessing; i++) {
        const messageIndex = i % testMessages.length;
        const message = testMessages[messageIndex];
        
        const startTime = performance.now();
        const response = await adapterWrapper.submitMessage(message);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        messageStats.record(duration);
        
        if (BENCHMARK_CONFIG.verbose) {
          console.log(`  消息 "${message.substring(0, 20)}...": ${duration.toFixed(2)}ms, 成功: ${response.success}`);
        }
      }
      
      console.log(`✅ 完成 ${BENCHMARK_ITERATIONS.messageProcessing} 次消息处理测试`);
    });
    
    it('应该测量模式切换后的消息处理性能', async function() {
      
      
      console.log('🧪 测试模式切换后的消息处理...');
      
      // 测试plan模式
      adapterWrapper.setMode('plan');
      
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        const response = await adapterWrapper.submitMessage(`计划一个重构任务 ${i}`);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        messageStats.record(duration);
        
        if (BENCHMARK_CONFIG.verbose) {
          console.log(`  Plan模式消息: ${duration.toFixed(2)}ms`);
        }
      }
      
      // 切换回act模式
      adapterWrapper.setMode('act');
    });
  });
  
  // ========== 测试3: 工具调用性能 ==========
  
  describe('工具调用性能', () => {
    let adapterWrapper: RealEnhancedEngineAdapterWrapper;
    
    before(async () => {
      console.log('🧪 准备工具调用性能测试...');
      adapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...BENCHMARK_CONFIG,
      }, {
        useRealComponent: false,
        verbose: false,
      });
      
      await adapterWrapper.initialize();
    });
    
    after(() => {
      adapterWrapper.reset();
    });
    
    it('应该测量工具调用延迟', async function() {
      
      
      console.log('🧪 测试工具调用性能...');
      
      // 测试可能触发工具调用的消息
      const toolTriggerMessages = [
        '请读取当前目录的package.json文件',
        '执行ls命令查看文件列表',
        '分析代码质量问题',
        '写入一个测试文件',
        '读取README.md文件'
      ];
      
      for (let i = 0; i < BENCHMARK_ITERATIONS.toolExecution; i++) {
        const messageIndex = i % toolTriggerMessages.length;
        const message = toolTriggerMessages[messageIndex];
        
        const startTime = performance.now();
        const response = await adapterWrapper.submitMessage(message);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        toolCallStats.record(duration);
        
        if (BENCHMARK_CONFIG.verbose) {
          const hasToolCalls = response.toolCalls && response.toolCalls.length > 0;
          console.log(`  工具调用测试 "${message.substring(0, 20)}...": ${duration.toFixed(2)}ms, 工具调用: ${hasToolCalls ? '是' : '否'}`);
        }
      }
      
      console.log(`✅ 完成 ${BENCHMARK_ITERATIONS.toolExecution} 次工具调用测试`);
    });
  });
  
  // ========== 测试4: 并发处理性能 ==========
  
  describe('并发处理性能', () => {
    it('应该测量并发消息处理能力', async function() {
      
      
      console.log('🧪 测试并发处理性能...');
      
      const concurrencyLevels = [2, 3, 5];
      
      for (const concurrency of concurrencyLevels) {
        console.log(`\n  并发级别: ${concurrency}`);
        
        for (let iteration = 0; iteration < BENCHMARK_ITERATIONS.concurrent; iteration++) {
          const adapters: RealEnhancedEngineAdapterWrapper[] = [];
          
          // 创建多个适配器实例
          for (let i = 0; i < concurrency; i++) {
            const adapter = RealEnhancedEngineAdapterWrapper.getInstance({
              ...BENCHMARK_CONFIG,
              context: createExtensionContext(),
            }, {
              useRealComponent: false,
              verbose: false,
            });
            
            adapters.push(adapter);
          }
          
          // 并发初始化
          const initStartTime = performance.now();
          await Promise.all(adapters.map(adapter => adapter.initialize()));
          const initEndTime = performance.now();
          
          // 并发发送消息
          const messagePromises = adapters.map((adapter, index) => 
            adapter.submitMessage(`并发测试消息 ${index}`)
          );
          
          const messageStartTime = performance.now();
          await Promise.all(messagePromises);
          const messageEndTime = performance.now();
          
          const totalDuration = messageEndTime - initStartTime;
          const avgDuration = totalDuration / concurrency;
          
          concurrentStats.record(avgDuration);
          
          if (BENCHMARK_CONFIG.verbose) {
            console.log(`    迭代 ${iteration + 1}: 平均 ${avgDuration.toFixed(2)}ms/适配器`);
          }
          
          // 清理资源
          adapters.forEach(adapter => adapter.reset());
        }
      }
      
      console.log(`\n✅ 完成并发处理测试`);
    });
  });
  
  // ========== 测试5: 内存使用情况 ==========
  
  describe('内存使用情况', () => {
    it('应该评估内存使用趋势', async function() {
      
      
      console.log('🧪 评估内存使用情况...');
      
      if (typeof process.memoryUsage !== 'function') {
        console.log('  ⚠️  process.memoryUsage() 不可用，跳过内存测试');
        return;
      }
      
      const initialMemory = process.memoryUsage();
      const adapterWrappers: RealEnhancedEngineAdapterWrapper[] = [];
      
      // 创建多个适配器实例以观察内存增长
      const instancesToCreate = 10;
      
      for (let i = 0; i < instancesToCreate; i++) {
        const adapter = RealEnhancedEngineAdapterWrapper.getInstance({
          ...BENCHMARK_CONFIG,
          context: createExtensionContext(),
        }, {
          useRealComponent: false,
          verbose: false,
        });
        
        await adapter.initialize();
        adapterWrappers.push(adapter);
        
        // 发送一些消息
        await adapter.submitMessage(`内存测试消息 ${i}`);
        
        if (i % 5 === 0) {
          const currentMemory = process.memoryUsage();
          const heapUsedDiff = currentMemory.heapUsed - initialMemory.heapUsed;
          const heapTotalDiff = currentMemory.heapTotal - initialMemory.heapTotal;
          
          console.log(`  实例 ${i + 1}: 堆使用增加 ${(heapUsedDiff / 1024 / 1024).toFixed(2)}MB, 堆总量增加 ${(heapTotalDiff / 1024 / 1024).toFixed(2)}MB`);
        }
      }
      
      // 清理资源
      adapterWrappers.forEach(adapter => adapter.reset());
      
      const finalMemory = process.memoryUsage();
      const heapUsedDiff = finalMemory.heapUsed - initialMemory.heapUsed;
      
      console.log(`✅ 内存测试完成，总堆使用增加: ${(heapUsedDiff / 1024 / 1024).toFixed(2)}MB`);
      
      // 验证内存不会过度增长
      if (heapUsedDiff > 100 * 1024 * 1024) { // 超过100MB
        console.warn(`⚠️  警告: 内存使用增长较大`);
      }
    });
  });
});

// ==================== 辅助函数 ====================

// performance.now() 的兼容性处理
const performance = {
  now: (): number => {
    if (typeof window !== 'undefined' && window.performance) {
      return window.performance.now();
    }
    if (typeof global !== 'undefined' && global.performance) {
      return global.performance.now();
    }
    return Date.now();
  }
};

// ==================== 导出性能测试函数 ====================

/**
 * 运行完整的性能基准测试
 */
export async function runPerformanceBenchmarks(): Promise<PerformanceResult[]> {
  console.log('🚀 开始性能基准测试...');
  
  try {
    // 这里可以集成更复杂的性能测试逻辑
    // 目前依赖Mocha测试框架运行
    
    console.log('✅ 性能基准测试框架已就绪');
    console.log('   请在Mocha中运行: npm test -- --grep "性能基准测试"');
    
    return [];
  } catch (error: any) {
    console.error('❌ 性能基准测试失败:', error.message);
    return [];
  }
}

export default runPerformanceBenchmarks;