/**
 * 对比测试框架
 * 
 * 同时测试真实EnhancedEngineAdapter和模拟EnhancedEngineAdapter，
 * 比较它们的功能、性能和输出
 */

import * as assert from 'assert';
import { RealEnhancedEngineAdapterWrapper } from '../adapters/RealEnhancedEngineAdapterWrapper';
import { RealComponentLoader } from '../loaders/RealComponentLoader';
import { createExtensionContext } from '../mocks/vscodeExtended';

// ==================== 对比测试配置 ====================

const COMPARISON_CONFIG = {
  verbose: true,
  enableStreaming: false,
  defaultMode: 'act' as const,
  context: createExtensionContext(),
};

// ==================== 对比测试结果 ====================

interface ComparisonResult {
  testName: string;
  realComponent: {
    success: boolean;
    error?: string;
    result?: any;
    timeMs?: number;
  };
  mockComponent: {
    success: boolean;
    error?: string;
    result?: any;
    timeMs?: number;
  };
  passed: boolean;
  differences?: string[];
}

// ==================== 对比测试套件 ====================

describe('对比测试: 真实组件 vs 模拟组件', () => {
  let realAdapterWrapper: any;
  let mockAdapterWrapper: RealEnhancedEngineAdapterWrapper;
  let comparisonResults: ComparisonResult[] = [];
  
  // 在每个测试套件后输出对比报告
  after(() => {
    console.log('\n' + '='.repeat(80));
    console.log('📊 对比测试报告');
    console.log('='.repeat(80));
    
    let totalTests = comparisonResults.length;
    let passedTests = comparisonResults.filter(r => r.passed).length;
    let failedTests = totalTests - passedTests;
    
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📈 性能对比:');
    comparisonResults.forEach(result => {
      if (result.realComponent.timeMs && result.mockComponent.timeMs) {
        const realTime = result.realComponent.timeMs;
        const mockTime = result.mockComponent.timeMs;
        const diff = mockTime - realTime;
        const diffPercent = (diff / realTime) * 100;
        console.log(`  ${result.testName}: 真实=${realTime.toFixed(2)}ms, 模拟=${mockTime.toFixed(2)}ms, 差异=${diffPercent.toFixed(1)}%`);
      }
    });
  });
  
  // ========== 测试1: 组件加载对比 ==========
  
  describe('组件加载对比', () => {
    it('应该都能成功加载组件', async function() {
      const testName = '组件加载';
      const result: ComparisonResult = {
        testName,
        realComponent: { success: false },
        mockComponent: { success: false },
        passed: false
      };
      
      // 测试真实组件加载
      console.log('\n🔍 测试真实组件加载...');
      const realStartTime = performance.now();
      try {
        const loader = new RealComponentLoader({ verbose: false });
        const loadResult = loader.load();
        const realEndTime = performance.now();
        
        result.realComponent.success = loadResult.success;
        result.realComponent.error = loadResult.error;
        result.realComponent.timeMs = realEndTime - realStartTime;
        
        console.log(`✅ 真实组件加载: ${loadResult.success ? '成功' : '失败'}`);
        if (!loadResult.success) {
          console.log(`   错误: ${loadResult.error}`);
        }
      } catch (error: any) {
        result.realComponent.error = error.message;
        console.error(`❌ 真实组件加载异常: ${error.message}`);
      }
      
      // 测试模拟组件加载
      console.log('\n🔍 测试模拟组件加载...');
      const mockStartTime = performance.now();
      try {
        mockAdapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
          ...COMPARISON_CONFIG,
        }, {
          useRealComponent: false,
          verbose: false,
        });
        
        const mockEndTime = performance.now();
        result.mockComponent.success = true;
        result.mockComponent.timeMs = mockEndTime - mockStartTime;
        
        console.log('✅ 模拟组件加载成功');
      } catch (error: any) {
        result.mockComponent.success = false;
        result.mockComponent.error = error.message;
        console.error(`❌ 模拟组件加载异常: ${error.message}`);
      }
      
      // 评估结果
      result.passed = result.realComponent.success && result.mockComponent.success;
      comparisonResults.push(result);
      
      assert.ok(result.realComponent.success, '真实组件应该加载成功');
      assert.ok(result.mockComponent.success, '模拟组件应该加载成功');
    });
  });
  
  // ========== 测试2: 初始化对比 ==========
  
  describe('初始化对比', () => {
    before(async () => {
      console.log('\n🔄 准备初始化对比测试...');
      
      // 创建模拟适配器
      mockAdapterWrapper = RealEnhancedEngineAdapterWrapper.getInstance({
        ...COMPARISON_CONFIG,
      }, {
        useRealComponent: false,
        verbose: false,
      });
    });
    
    it('应该都能成功初始化', async function() {
      const testName = '初始化';
      const result: ComparisonResult = {
        testName,
        realComponent: { success: false },
        mockComponent: { success: false },
        passed: false
      };
      
      // 测试真实组件初始化
      console.log('\n🔍 测试真实组件初始化...');
      const realStartTime = performance.now();
      try {
        const loader = new RealComponentLoader({ verbose: false });
        const realInstance = loader.createInstance({
          extension: {
            modelAdapter: {
              generate: async () => ({
                content: '模拟响应',
                usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
                model: 'mock-model'
              })
            },
            projectAnalyzer: { analyzeProject: async () => ({ files: [] }) },
            promptEngine: { generatePrompt: async () => '模拟提示词' },
            verbose: false
          },
          context: COMPARISON_CONFIG.context,
          verbose: true,
          defaultMode: 'act'
        });
        
        const initResult = await realInstance.initialize();
        const realEndTime = performance.now();
        
        result.realComponent.success = initResult === true;
        result.realComponent.result = { initialized: initResult };
        result.realComponent.timeMs = realEndTime - realStartTime;
        
        console.log(`✅ 真实组件初始化: ${initResult ? '成功' : '失败'}`);
        
        // 保存真实实例供后续测试使用
        (global as any).realAdapterInstance = realInstance;
      } catch (error: any) {
        result.realComponent.error = error.message;
        console.error(`❌ 真实组件初始化异常: ${error.message}`);
      }
      
      // 测试模拟组件初始化
      console.log('\n🔍 测试模拟组件初始化...');
      const mockStartTime = performance.now();
      try {
        const initResult = await mockAdapterWrapper.initialize();
        const mockEndTime = performance.now();
        
        result.mockComponent.success = initResult === true;
        result.mockComponent.result = { initialized: initResult };
        result.mockComponent.timeMs = mockEndTime - mockStartTime;
        
        console.log(`✅ 模拟组件初始化: ${initResult ? '成功' : '失败'}`);
      } catch (error: any) {
        result.mockComponent.error = error.message;
        console.error(`❌ 模拟组件初始化异常: ${error.message}`);
      }
      
      // 评估结果
      result.passed = result.realComponent.success && result.mockComponent.success;
      comparisonResults.push(result);
      
      assert.ok(result.realComponent.success, '真实组件应该初始化成功');
      assert.ok(result.mockComponent.success, '模拟组件应该初始化成功');
    });
  });
  
  // ========== 测试3: 基本功能对比 ==========
  
  describe('基本功能对比', () => {
    it('应该具有相同的基本功能', async () => {
      // this.timeout(15000); // 在自定义测试运行器中不支持
      
      const testName = '基本功能';
      const result: ComparisonResult = {
        testName,
        realComponent: { success: false },
        mockComponent: { success: false },
        passed: false,
        differences: []
      };
      
      // 检查真实组件功能
      console.log('\n🔍 检查真实组件基本功能...');
      try {
        const realInstance = (global as any).realAdapterInstance;
        if (!realInstance) {
          result.realComponent.error = '真实实例未找到';
          console.error('❌ 真实实例未找到');
        } else {
          // 测试获取模式
          const realMode = realInstance.getMode();
          console.log(`✅ 真实组件模式: ${realMode}`);
          
          // 测试获取引擎
          const realEngine = realInstance.getEngine();
          console.log(`✅ 真实组件引擎: ${realEngine ? '可用' : '不可用'}`);
          
          // 测试获取状态
          const realState = realInstance.getState();
          console.log(`✅ 真实组件状态: 引擎就绪=${realState.engineReady}, 工具数量=${realState.toolCount}`);
          
          result.realComponent.success = true;
          result.realComponent.result = {
            mode: realMode,
            hasEngine: !!realEngine,
            state: realState
          };
        }
      } catch (error: any) {
        result.realComponent.error = error.message;
        console.error(`❌ 真实组件功能检查异常: ${error.message}`);
      }
      
      // 检查模拟组件功能
      console.log('\n🔍 检查模拟组件基本功能...');
      try {
        // 测试获取模式
        const mockMode = mockAdapterWrapper.getMode();
        console.log(`✅ 模拟组件模式: ${mockMode}`);
        
        // 测试获取引擎
        const mockEngine = mockAdapterWrapper.getEngine();
        console.log(`✅ 模拟组件引擎: ${mockEngine ? '可用' : '不可用'}`);
        
        // 测试获取状态
        const mockState = mockAdapterWrapper.getState();
        console.log(`✅ 模拟组件状态: 引擎就绪=${mockState.engineReady}, 工具数量=${mockState.toolCount}`);
        
        result.mockComponent.success = true;
        result.mockComponent.result = {
          mode: mockMode,
          hasEngine: !!mockEngine,
          state: mockState
        };
      } catch (error: any) {
        result.mockComponent.error = error.message;
        console.error(`❌ 模拟组件功能检查异常: ${error.message}`);
      }
      
      // 比较结果
      if (result.realComponent.success && result.mockComponent.success) {
        const realResult = result.realComponent.result!;
        const mockResult = result.mockComponent.result!;
        
        // 检查模式是否相同
        if (realResult.mode !== mockResult.mode) {
          result.differences!.push(`模式不同: 真实=${realResult.mode}, 模拟=${mockResult.mode}`);
        }
        
        // 检查引擎可用性
        if (realResult.hasEngine !== mockResult.hasEngine) {
          result.differences!.push(`引擎可用性不同: 真实=${realResult.hasEngine}, 模拟=${mockResult.hasEngine}`);
        }
        
        // 检查状态
        if (realResult.state.engineReady !== mockResult.state.engineReady) {
          result.differences!.push(`引擎就绪状态不同: 真实=${realResult.state.engineReady}, 模拟=${mockResult.state.engineReady}`);
        }
        
        result.passed = result.differences!.length === 0;
      }
      
      comparisonResults.push(result);
      
      if (result.differences && result.differences.length > 0) {
        console.log('\n⚠️  发现差异:');
        result.differences.forEach(diff => console.log(`  - ${diff}`));
      }
      
      assert.ok(result.realComponent.success, '真实组件应该通过功能检查');
      assert.ok(result.mockComponent.success, '模拟组件应该通过功能检查');
      if (result.differences && result.differences.length > 0) {
        console.warn('注意: 组件间存在功能差异');
      }
    });
  });
  
  // ========== 测试4: 模式切换对比 ==========
  
  describe('模式切换对比', () => {
    it('应该都能成功切换模式', async function() {
      const testName = '模式切换';
      const result: ComparisonResult = {
        testName,
        realComponent: { success: false },
        mockComponent: { success: false },
        passed: false,
        differences: []
      };
      
      // 测试真实组件模式切换
      console.log('\n🔍 测试真实组件模式切换...');
      try {
        const realInstance = (global as any).realAdapterInstance;
        if (!realInstance) {
          result.realComponent.error = '真实实例未找到';
          console.error('❌ 真实实例未找到');
        } else {
          // 获取初始模式
          const initialRealMode = realInstance.getMode();
          
          // 切换到plan模式
          realInstance.setMode('plan');
          const realPlanMode = realInstance.getMode();
          
          // 切换回act模式
          realInstance.setMode('act');
          const realActMode = realInstance.getMode();
          
          console.log(`✅ 真实组件模式切换: ${initialRealMode} → ${realPlanMode} → ${realActMode}`);
          
          result.realComponent.success = true;
          result.realComponent.result = {
            initialMode: initialRealMode,
            planMode: realPlanMode,
            finalMode: realActMode
          };
        }
      } catch (error: any) {
        result.realComponent.error = error.message;
        console.error(`❌ 真实组件模式切换异常: ${error.message}`);
      }
      
      // 测试模拟组件模式切换
      console.log('\n🔍 测试模拟组件模式切换...');
      try {
        // 获取初始模式
        const initialMockMode = mockAdapterWrapper.getMode();
        
        // 切换到plan模式
        mockAdapterWrapper.setMode('plan');
        const mockPlanMode = mockAdapterWrapper.getMode();
        
        // 切换回act模式
        mockAdapterWrapper.setMode('act');
        const mockActMode = mockAdapterWrapper.getMode();
        
        console.log(`✅ 模拟组件模式切换: ${initialMockMode} → ${mockPlanMode} → ${mockActMode}`);
        
        result.mockComponent.success = true;
        result.mockComponent.result = {
          initialMode: initialMockMode,
          planMode: mockPlanMode,
          finalMode: mockActMode
        };
      } catch (error: any) {
        result.mockComponent.error = error.message;
        console.error(`❌ 模拟组件模式切换异常: ${error.message}`);
      }
      
      // 比较结果
      if (result.realComponent.success && result.mockComponent.success) {
        const realResult = result.realComponent.result!;
        const mockResult = result.mockComponent.result!;
        
        // 检查初始模式
        if (realResult.initialMode !== mockResult.initialMode) {
          result.differences!.push(`初始模式不同: 真实=${realResult.initialMode}, 模拟=${mockResult.initialMode}`);
        }
        
        // 检查plan模式
        if (realResult.planMode !== mockResult.planMode) {
          result.differences!.push(`plan模式不同: 真实=${realResult.planMode}, 模拟=${mockResult.planMode}`);
        }
        
        // 检查最终模式
        if (realResult.finalMode !== mockResult.finalMode) {
          result.differences!.push(`最终模式不同: 真实=${realResult.finalMode}, 模拟=${mockResult.finalMode}`);
        }
        
        result.passed = result.differences!.length === 0;
      }
      
      comparisonResults.push(result);
      
      if (result.differences && result.differences.length > 0) {
        console.log('\n⚠️  发现差异:');
        result.differences.forEach(diff => console.log(`  - ${diff}`));
      }
      
      assert.ok(result.realComponent.success, '真实组件应该通过模式切换测试');
      assert.ok(result.mockComponent.success, '模拟组件应该通过模式切换测试');
    });
  });
  
  // ========== 测试5: 性能对比 ==========
  
  describe('性能对比', () => {
    it('应该测量性能差异', async () => {
      // this.timeout(30000); // 在自定义测试运行器中不支持
      
      const testName = '性能测量';
      const result: ComparisonResult = {
        testName,
        realComponent: { success: false },
        mockComponent: { success: false },
        passed: false
      };
      
      // 测试真实组件性能（如果可用）
      console.log('\n📊 测量真实组件性能...');
      const realInstance = (global as any).realAdapterInstance;
      if (realInstance) {
        try {
          // 简单性能测试：多次获取模式
          const iterations = 100;
          const realStartTime = performance.now();
          
          for (let i = 0; i < iterations; i++) {
            realInstance.getMode();
          }
          
          const realEndTime = performance.now();
          const realTimePerCall = (realEndTime - realStartTime) / iterations;
          
          result.realComponent.success = true;
          result.realComponent.timeMs = realTimePerCall;
          
          console.log(`✅ 真实组件性能: ${realTimePerCall.toFixed(4)}ms/调用 (${iterations}次迭代)`);
        } catch (error: any) {
          result.realComponent.error = error.message;
          console.error(`❌ 真实组件性能测试异常: ${error.message}`);
        }
      } else {
        console.log('⚠️  跳过真实组件性能测试（实例不可用）');
      }
      
      // 测试模拟组件性能
      console.log('\n📊 测量模拟组件性能...');
      try {
        // 简单性能测试：多次获取模式
        const iterations = 100;
        const mockStartTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
          mockAdapterWrapper.getMode();
        }
        
        const mockEndTime = performance.now();
        const mockTimePerCall = (mockEndTime - mockStartTime) / iterations;
        
        result.mockComponent.success = true;
        result.mockComponent.timeMs = mockTimePerCall;
        
        console.log(`✅ 模拟组件性能: ${mockTimePerCall.toFixed(4)}ms/调用 (${iterations}次迭代)`);
      } catch (error: any) {
        result.mockComponent.error = error.message;
        console.error(`❌ 模拟组件性能测试异常: ${error.message}`);
      }
      
      // 评估结果
      result.passed = result.realComponent.success || result.mockComponent.success;
      comparisonResults.push(result);
      
      assert.ok(result.mockComponent.success, '模拟组件应该通过性能测试');
    });
  });
});

// ==================== 辅助函数 ====================

// 使用Node.js的performance模块
import { performance } from 'perf_hooks';

// ==================== 导出对比测试函数 ====================

/**
 * 运行完整的对比测试
 */
export async function runComparisonTests(): Promise<ComparisonResult[]> {
  console.log('🚀 开始对比测试: 真实组件 vs 模拟组件');
  
  try {
    // 这里可以集成更复杂的测试逻辑
    // 目前依赖Mocha测试框架运行
    
    console.log('✅ 对比测试框架已就绪');
    console.log('   请在Mocha中运行: npm test -- --grep "对比测试"');
    
    return [];
  } catch (error: any) {
    console.error('❌ 对比测试失败:', error.message);
    return [];
  }
}

export default runComparisonTests;