/**
 * 接口一致性验证工具
 * 用于验证真实组件和模拟组件接口的一致性
 */

export interface InterfaceMethod {
  name: string;
  type: 'method' | 'property' | 'getter' | 'setter';
  async?: boolean;
  required?: boolean;
}

export interface InterfaceSpec {
  className: string;
  methods: InterfaceMethod[];
  staticMethods?: InterfaceMethod[];
}

export interface ValidationResult {
  className: string;
  totalMethods: number;
  matchedMethods: number;
  missingMethods: string[];
  typeMismatches: Array<{ method: string; expected: string; actual: string }>;
  score: number; // 0-100
  passed: boolean;
}

/**
 * EnhancedEngineAdapter的标准接口规范
 */
export const EnhancedEngineAdapterSpec: InterfaceSpec = {
  className: 'EnhancedEngineAdapter',
  staticMethods: [
    { name: 'getInstance', type: 'method', async: false, required: true }
  ],
  methods: [
    // 核心生命周期方法
    { name: 'initialize', type: 'method', async: true, required: true },
    { name: 'dispose', type: 'method', async: false, required: false },
    { name: 'reset', type: 'method', async: false, required: false },
    
    // 状态查询方法
    { name: 'getMode', type: 'method', async: false, required: true },
    { name: 'setMode', type: 'method', async: false, required: true },
    { name: 'getEngine', type: 'method', async: false, required: true },
    { name: 'getState', type: 'method', async: false, required: true },
    
    // 对话管理方法
    { name: 'submitMessage', type: 'method', async: true, required: true },
    { name: 'getConversationState', type: 'method', async: false, required: true },
    { name: 'clearConversation', type: 'method', async: false, required: true },
    { name: 'exportConversation', type: 'method', async: false, required: true },
    { name: 'importConversation', type: 'method', async: false, required: true },
    
    // 工具管理方法
    { name: 'getToolRegistry', type: 'method', async: false, required: false },
    { name: 'registerTool', type: 'method', async: false, required: false },
    { name: 'unregisterTool', type: 'method', async: false, required: false },
    
    // 事件处理
    { name: 'onStateUpdate', type: 'method', async: false, required: false },
    { name: 'onEngineReady', type: 'method', async: false, required: false },
    { name: 'onError', type: 'method', async: false, required: false }
  ]
};

/**
 * 验证类的接口一致性
 */
export class InterfaceValidator {
  /**
   * 验证类是否符合接口规范
   */
  static validate(classInstance: any, spec: InterfaceSpec): ValidationResult {
    const result: ValidationResult = {
      className: spec.className,
      totalMethods: spec.methods.length + (spec.staticMethods?.length || 0),
      matchedMethods: 0,
      missingMethods: [],
      typeMismatches: [],
      score: 0,
      passed: false
    };
    
    const classConstructor = classInstance.constructor;
    
    // 验证静态方法
    if (spec.staticMethods) {
      for (const methodSpec of spec.staticMethods) {
        const exists = typeof classConstructor[methodSpec.name] === 'function';
        if (exists) {
          result.matchedMethods++;
        } else if (methodSpec.required) {
          result.missingMethods.push(`静态方法: ${methodSpec.name}`);
        }
      }
    }
    
    // 验证实例方法
    for (const methodSpec of spec.methods) {
      const exists = typeof classInstance[methodSpec.name] === 'function';
      
      if (exists) {
        result.matchedMethods++;
        
        // 检查方法类型（同步/异步）
        const method = classInstance[methodSpec.name];
        const isAsync = method.constructor.name === 'AsyncFunction';
        
        if (methodSpec.async !== undefined && methodSpec.async !== isAsync) {
          result.typeMismatches.push({
            method: methodSpec.name,
            expected: methodSpec.async ? '异步' : '同步',
            actual: isAsync ? '异步' : '同步'
          });
        }
      } else if (methodSpec.required) {
        result.missingMethods.push(`实例方法: ${methodSpec.name}`);
      }
    }
    
    // 计算分数
    if (result.totalMethods > 0) {
      result.score = Math.round((result.matchedMethods / result.totalMethods) * 100);
    }
    
    // 通过标准：必须方法都存在，且分数>=80
    const requiredMethodsMissing = result.missingMethods.filter(m => 
      spec.methods.find(ms => ms.name === m.replace('实例方法: ', '').replace('静态方法: ', '') && ms.required) ||
      (spec.staticMethods?.find(ms => ms.name === m.replace('静态方法: ', '') && ms.required))
    ).length === 0;
    
    result.passed = requiredMethodsMissing && result.score >= 80;
    
    return result;
  }
  
  /**
   * 生成验证报告
   */
  static generateReport(result: ValidationResult): string {
    const lines: string[] = [];
    
    lines.push(`📊 接口验证报告: ${result.className}`);
    lines.push('='.repeat(60));
    lines.push(`总分: ${result.score}/100`);
    lines.push(`状态: ${result.passed ? '✅ 通过' : '❌ 失败'}`);
    lines.push(`匹配方法: ${result.matchedMethods}/${result.totalMethods}`);
    
    if (result.missingMethods.length > 0) {
      lines.push('\n❌ 缺失方法:');
      result.missingMethods.forEach(method => lines.push(`  - ${method}`));
    }
    
    if (result.typeMismatches.length > 0) {
      lines.push('\n⚠️  类型不匹配:');
      result.typeMismatches.forEach(mismatch => 
        lines.push(`  - ${mismatch.method}: 期望${mismatch.expected}, 实际${mismatch.actual}`)
      );
    }
    
    if (result.passed) {
      lines.push('\n✅ 接口一致性验证通过');
    } else {
      lines.push('\n❌ 接口一致性验证失败');
      lines.push(`建议: 确保所有必需方法都已实现（至少80%匹配度）`);
    }
    
    return lines.join('\n');
  }
  
  /**
   * 比较两个实例的接口差异
   */
  static compareInstances(instance1: any, instance2: any, spec: InterfaceSpec): {
    instance1Result: ValidationResult;
    instance2Result: ValidationResult;
    differences: string[];
  } {
    const result1 = this.validate(instance1, spec);
    const result2 = this.validate(instance2, spec);
    
    const differences: string[] = [];
    
    // 比较方法存在性
    const instance1Methods = new Set(
      spec.methods.filter(m => typeof instance1[m.name] === 'function').map(m => m.name)
    );
    const instance2Methods = new Set(
      spec.methods.filter(m => typeof instance2[m.name] === 'function').map(m => m.name)
    );
    
    // 找出实例1有但实例2没有的方法
    for (const method of instance1Methods) {
      if (!instance2Methods.has(method)) {
        differences.push(`方法 ${method} 存在于实例1但不存在于实例2`);
      }
    }
    
    // 找出实例2有但实例1没有的方法
    for (const method of instance2Methods) {
      if (!instance1Methods.has(method)) {
        differences.push(`方法 ${method} 存在于实例2但不存在于实例1`);
      }
    }
    
    // 比较方法类型
    for (const methodSpec of spec.methods) {
      const has1 = typeof instance1[methodSpec.name] === 'function';
      const has2 = typeof instance2[methodSpec.name] === 'function';
      
      if (has1 && has2) {
        const isAsync1 = instance1[methodSpec.name].constructor.name === 'AsyncFunction';
        const isAsync2 = instance2[methodSpec.name].constructor.name === 'AsyncFunction';
        
        if (isAsync1 !== isAsync2) {
          differences.push(`方法 ${methodSpec.name} 同步性不同: 实例1=${isAsync1 ? '异步' : '同步'}, 实例2=${isAsync2 ? '异步' : '同步'}`);
        }
      }
    }
    
    return {
      instance1Result: result1,
      instance2Result: result2,
      differences
    };
  }
}

/**
 * 验证真实EnhancedEngineAdapter的接口
 */
export async function validateRealEnhancedEngineAdapter(realInstance: any): Promise<ValidationResult> {
  console.log('🔍 验证真实EnhancedEngineAdapter接口...');
  const result = InterfaceValidator.validate(realInstance, EnhancedEngineAdapterSpec);
  console.log(InterfaceValidator.generateReport(result));
  return result;
}

/**
 * 验证模拟EnhancedEngineAdapter的接口
 */
export async function validateMockEnhancedEngineAdapter(mockInstance: any): Promise<ValidationResult> {
  console.log('🔍 验证模拟EnhancedEngineAdapter接口...');
  const result = InterfaceValidator.validate(mockInstance, EnhancedEngineAdapterSpec);
  console.log(InterfaceValidator.generateReport(result));
  return result;
}

/**
 * 比较真实和模拟组件的接口
 */
export async function compareRealAndMockInterfaces(realInstance: any, mockInstance: any): Promise<{
  realResult: ValidationResult;
  mockResult: ValidationResult;
  differences: string[];
}> {
  console.log('🔍 比较真实和模拟组件接口...');
  const comparison = InterfaceValidator.compareInstances(
    realInstance,
    mockInstance,
    EnhancedEngineAdapterSpec
  );
  
  console.log(`\n📊 接口比较结果:`);
  console.log(`真实组件匹配度: ${comparison.instance1Result.score}/100`);
  console.log(`模拟组件匹配度: ${comparison.instance2Result.score}/100`);
  
  if (comparison.differences.length > 0) {
    console.log('\n⚠️  接口差异:');
    comparison.differences.forEach(diff => console.log(`  - ${diff}`));
  } else {
    console.log('\n✅ 接口完全一致');
  }
  
  return {
    realResult: comparison.instance1Result,
    mockResult: comparison.instance2Result,
    differences: comparison.differences
  };
}

export default InterfaceValidator;