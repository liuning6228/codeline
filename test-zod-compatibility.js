/**
 * 快速测试Zod兼容性层
 */

console.log('🔍 测试Zod兼容性层...');

try {
  // 导入Zod兼容层
  const {
    z,
    createCompatibleSchema,
    isCompatibleSchema,
    getRealSchema,
    unifiedParse,
    unifiedSafeParse,
    compatibility
  } = require('./src/core/tool/ZodCompatibility');

  console.log('✅ Zod兼容性层导入成功');
  
  // 测试1: 基础Zod功能
  console.log('\n🧪 测试1: 基础Zod功能');
  const stringSchema = z.string();
  const validResult = stringSchema.safeParse('hello');
  const invalidResult = stringSchema.safeParse(123);
  
  console.log(`  stringSchema验证'hello': ${validResult.success ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  stringSchema验证123: ${invalidResult.success ? '✅ 通过（应该失败）' : '✅ 正确失败'}`);
  
  if (!invalidResult.success) {
    console.log(`  错误信息: ${invalidResult.error?.message || '无'}`);
  }
  
  // 测试2: 兼容层功能
  console.log('\n🧪 测试2: 兼容层功能');
  const compatibleSchema = createCompatibleSchema(z.string());
  console.log(`  创建兼容schema: ${isCompatibleSchema(compatibleSchema) ? '✅ 成功' : '❌ 失败'}`);
  
  const compatibleValid = compatibleSchema.safeParse('world');
  const compatibleInvalid = compatibleSchema.safeParse(456);
  console.log(`  兼容schema验证'world': ${compatibleValid.success ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  兼容schema验证456: ${compatibleInvalid.success ? '✅ 通过（应该失败）' : '✅ 正确失败'}`);
  
  // 测试3: 统一解析函数
  console.log('\n🧪 测试3: 统一解析函数');
  const unifiedValid = unifiedSafeParse(compatibleSchema, 'unified');
  console.log(`  unifiedSafeParse验证'unified': ${unifiedValid.success ? '✅ 通过' : '❌ 失败'}`);
  
  // 测试4: 兼容性工具
  console.log('\n🧪 测试4: 兼容性工具');
  const compatString = compatibility.string();
  const compatNumber = compatibility.number({ min: 1, max: 100 });
  const compatObject = compatibility.object({
    name: z.string(),
    age: z.number()
  });
  
  console.log(`  compatibility.string(): ${typeof compatString.parse === 'function' ? '✅ 有效' : '❌ 无效'}`);
  console.log(`  compatibility.number(): ${typeof compatNumber.parse === 'function' ? '✅ 有效' : '❌ 无效'}`);
  console.log(`  compatibility.object(): ${typeof compatObject.parse === 'function' ? '✅ 有效' : '❌ 无效'}`);
  
  // 测试对象验证
  const personValid = { name: 'Alice', age: 30 };
  const personInvalid = { name: 'Bob', age: 'thirty' };
  
  const objectValidResult = compatObject.safeParse(personValid);
  const objectInvalidResult = compatObject.safeParse(personInvalid);
  
  console.log(`  对象验证（有效数据）: ${objectValidResult.success ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  对象验证（无效数据）: ${objectInvalidResult.success ? '✅ 通过（应该失败）' : '✅ 正确失败'}`);
  
  // 测试5: 获取真正的Zod schema
  console.log('\n🧪 测试5: 获取真正的Zod schema');
  const realSchema = getRealSchema(compatibleSchema);
  console.log(`  获取真正的schema: ${realSchema ? '✅ 成功' : '❌ 失败'}`);
  if (realSchema) {
    console.log(`  真正的schema类型: ${typeof realSchema.parse === 'function' ? 'ZodSchema' : '未知'}`);
  }
  
  console.log('\n🎉 所有测试完成！');
  
  // 总结
  const tests = [
    { name: '基础Zod导入', passed: !!z },
    { name: '兼容schema创建', passed: isCompatibleSchema(compatibleSchema) },
    { name: '字符串验证', passed: validResult.success && !invalidResult.success },
    { name: '统一解析', passed: unifiedValid.success },
    { name: '兼容性工具', passed: typeof compatString.parse === 'function' },
    { name: '对象验证', passed: objectValidResult.success && !objectInvalidResult.success }
  ];
  
  console.log('\n📊 测试结果摘要:');
  tests.forEach(test => {
    console.log(`  ${test.passed ? '✅' : '❌'} ${test.name}`);
  });
  
  const passedCount = tests.filter(t => t.passed).length;
  const totalCount = tests.length;
  console.log(`\n📈 通过率: ${passedCount}/${totalCount} (${((passedCount/totalCount)*100).toFixed(1)}%)`);
  
  if (passedCount === totalCount) {
    console.log('\n🎯 Zod兼容性层工作正常，可以继续实施！');
    process.exit(0);
  } else {
    console.log('\n⚠️ Zod兼容性层存在问题，需要修复。');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Zod兼容性层测试失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}