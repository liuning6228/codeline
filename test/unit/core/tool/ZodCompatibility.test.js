/**
 * Zod兼容性测试
 * 测试ZodCompatibility层是否正常工作
 */

const { expect } = require('chai');
const { describe, it, beforeEach, afterEach } = require('mocha');

// 导入Zod兼容层
const {
  z,
  ZodSchema,
  createCompatibleSchema,
  isCompatibleSchema,
  getRealSchema,
  unifiedParse,
  unifiedSafeParse,
  compatibility,
  ZodError
} = require('../../../../core/tool/ZodCompatibility');

describe('Zod Compatibility Layer', () => {
  describe('基础功能测试', () => {
    it('应该正确导入z对象', () => {
      expect(z).to.be.an('object');
      expect(z.string).to.be.a('function');
      expect(z.number).to.be.a('function');
      expect(z.boolean).to.be.a('function');
      expect(z.object).to.be.a('function');
    });
    
    it('应该能够创建和使用Zod schema', () => {
      const stringSchema = z.string();
      expect(stringSchema.parse).to.be.a('function');
      expect(stringSchema.safeParse).to.be.a('function');
      
      // 测试有效字符串
      const validResult = stringSchema.safeParse('test');
      expect(validResult.success).to.be.true;
      expect(validResult.data).to.equal('test');
      
      // 测试无效字符串（数字）
      const invalidResult = stringSchema.safeParse(123);
      expect(invalidResult.success).to.be.false;
      expect(invalidResult.error).to.exist;
    });
  });
  
  describe('兼容层功能测试', () => {
    it('应该能够创建兼容schema', () => {
      const realSchema = z.string();
      const compatibleSchema = createCompatibleSchema(realSchema);
      
      expect(isCompatibleSchema(compatibleSchema)).to.be.true;
      expect(compatibleSchema.parse).to.be.a('function');
      expect(compatibleSchema.safeParse).to.be.a('function');
    });
    
    it('兼容schema应该正常工作', () => {
      const compatibleSchema = createCompatibleSchema(z.string());
      
      // 测试解析
      const parsed = compatibleSchema.parse('hello');
      expect(parsed).to.equal('hello');
      
      // 测试安全解析 - 有效
      const validResult = compatibleSchema.safeParse('world');
      expect(validResult.success).to.be.true;
      expect(validResult.data).to.equal('world');
      
      // 测试安全解析 - 无效
      const invalidResult = compatibleSchema.safeParse(123);
      expect(invalidResult.success).to.be.false;
      expect(invalidResult.error).to.exist;
    });
    
    it('应该能够获取真正的Zod schema', () => {
      const realSchema = z.string();
      const compatibleSchema = createCompatibleSchema(realSchema);
      
      const extractedSchema = getRealSchema(compatibleSchema);
      expect(extractedSchema).to.exist;
      expect(extractedSchema.parse).to.be.a('function');
    });
  });
  
  describe('统一解析函数测试', () => {
    it('unifiedParse应该处理兼容schema', () => {
      const compatibleSchema = createCompatibleSchema(z.string());
      const result = unifiedParse(compatibleSchema, 'test');
      expect(result).to.equal('test');
    });
    
    it('unifiedSafeParse应该处理兼容schema', () => {
      const compatibleSchema = createCompatibleSchema(z.string());
      
      // 有效情况
      const validResult = unifiedSafeParse(compatibleSchema, 'valid');
      expect(validResult.success).to.be.true;
      expect(validResult.data).to.equal('valid');
      
      // 无效情况
      const invalidResult = unifiedSafeParse(compatibleSchema, 123);
      expect(invalidResult.success).to.be.false;
      expect(invalidResult.error).to.exist;
    });
  });
  
  describe('兼容性工具测试', () => {
    it('compatibility.string应该工作', () => {
      const schema = compatibility.string();
      expect(schema.parse).to.be.a('function');
      
      const result = schema.safeParse('test');
      expect(result.success).to.be.true;
    });
    
    it('compatibility.number应该工作', () => {
      const schema = compatibility.number();
      
      const validResult = schema.safeParse(123);
      expect(validResult.success).to.be.true;
      
      const invalidResult = schema.safeParse('not a number');
      expect(invalidResult.success).to.be.false;
    });
    
    it('compatibility.object应该工作', () => {
      const schema = compatibility.object({
        name: z.string(),
        age: z.number()
      });
      
      const validData = { name: 'John', age: 30 };
      const validResult = schema.safeParse(validData);
      expect(validResult.success).to.be.true;
      
      const invalidData = { name: 'John', age: 'thirty' };
      const invalidResult = schema.safeParse(invalidData);
      expect(invalidResult.success).to.be.false;
    });
    
    it('应该检测旧模拟schema', () => {
      // 创建一个旧模拟schema
      const legacySchema = {
        parse: (data) => data,
        safeParse: (data) => ({ success: true, data })
      };
      
      const report = compatibility.createMigrationReport(legacySchema);
      expect(report.isLegacy).to.be.true;
      expect(report.recommendedAction).to.equal('migrate');
    });
  });
  
  describe('错误处理测试', () => {
    it('应该正确处理ZodError', () => {
      const schema = z.string();
      
      try {
        schema.parse(123);
        throw new Error('应该抛出错误');
      } catch (error) {
        expect(error).to.exist;
        expect(error.name).to.include('ZodError');
      }
    });
    
    it('兼容schema应该提供有用的错误信息', () => {
      const compatibleSchema = createCompatibleSchema(z.string());
      
      const result = compatibleSchema.safeParse(123);
      expect(result.success).to.be.false;
      expect(result.error).to.exist;
      expect(result.error.message).to.be.a('string');
    });
  });
  
  describe('性能测试', () => {
    it('应该能够快速处理多次验证', function() {
      this.timeout(5000); // 5秒超时
      
      const schema = z.string();
      const iterations = 1000;
      
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        schema.safeParse(`test-${i}`);
      }
      
      const duration = Date.now() - startTime;
      const avgTimePerCall = duration / iterations;
      
      // 期望平均每次调用时间小于10ms
      console.log(`Zod性能: ${iterations}次调用耗时${duration}ms，平均${avgTimePerCall.toFixed(3)}ms/次`);
      expect(avgTimePerCall).to.be.lessThan(10);
    });
  });
});