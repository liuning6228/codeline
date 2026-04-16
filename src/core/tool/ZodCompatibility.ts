/**
 * Zod兼容性层 - 临时版本
 * 在zod库安装完成前使用模拟实现，安装后使用真正的zod
 */

// 尝试导入真正的zod，如果失败则使用模拟版本
let realZod: any = null;
let RealZodSchema: any = null;
let ZodError: any = null;
let ZodTypeAny: any = null;

try {
  // 尝试导入真正的zod
  const zodModule = require('zod');
  realZod = zodModule.z;
  RealZodSchema = zodModule.ZodSchema;
  ZodError = zodModule.ZodError;
  ZodTypeAny = zodModule.ZodTypeAny;
  console.log('✅ Zod兼容性层：使用真正的Zod库');
} catch (error) {
  // 如果zod未安装，使用模拟版本
  console.log('⚠️ Zod兼容性层：zod库未安装，使用模拟版本');
  
  // 模拟ZodError
  ZodError = class MockZodError extends Error {
    errors: any[];
    
    constructor(message: string, errors: any[] = []) {
      super(message);
      this.name = 'ZodError';
      this.errors = errors;
    }
  };
  
  // 模拟基础schema
  realZod = {
    string: () => createMockSchema('string'),
    number: () => createMockSchema('number'),
    boolean: () => createMockSchema('boolean'),
    any: () => createMockSchema('any'),
    object: (shape: any) => createMockSchema('object', shape),
    array: (element: any) => createMockSchema('array', element),
    union: (options: any) => createMockSchema('union', options),
    literal: (value: any) => createMockSchema('literal', value)
  };
  
  RealZodSchema = class MockRealZodSchema {
    parse(data: any) { return data; }
    safeParse(data: any) { return { success: true, data }; }
  };
  
  ZodTypeAny = RealZodSchema;
}

// ==================== 辅助函数 ====================

function createMockSchema(type: string, options?: any) {
  const schema = {
    parse(data: any) {
      // 基本类型检查
      if (type === 'string' && typeof data !== 'string') {
        throw new ZodError(`Expected string, got ${typeof data}`);
      }
      if (type === 'number' && typeof data !== 'number') {
        throw new ZodError(`Expected number, got ${typeof data}`);
      }
      if (type === 'boolean' && typeof data !== 'boolean') {
        throw new ZodError(`Expected boolean, got ${typeof data}`);
      }
      if (type === 'object' && (typeof data !== 'object' || data === null)) {
        throw new ZodError(`Expected object, got ${typeof data}`);
      }
      if (type === 'array' && !Array.isArray(data)) {
        throw new ZodError(`Expected array, got ${typeof data}`);
      }
      return data;
    },
    
    safeParse(data: any) {
      try {
        const parsed = this.parse(data);
        return { success: true, data: parsed };
      } catch (error) {
        return { success: false, error };
      }
    },
    
    // 完整的Zod方法集合（存根实现）
    min: function(min: number) { return this; },
    max: function(max: number) { return this; },
    regex: function(regex: RegExp) { return this; },
    int: function() { return this; },
    positive: function() { return this; },
    negative: function() { return this; },
    nonnegative: function() { return this; },
    nonpositive: function() { return this; },
    multipleOf: function(value: number) { return this; },
    
    // 字符串方法
    length: function(len: number) { return this; },
    email: function() { return this; },
    url: function() { return this; },
    uuid: function() { return this; },
    datetime: function(options?: any) { return this; },
    
    // 变换方法
    optional: function() { return this; },
    nullable: function() { return this; },
    nullish: function() { return this; },
    default: function(defaultValue: any) { return this; },
    transform: function(fn: any) { return this; },
    refine: function(fn: any, message?: any) { return this; },
    superRefine: function(fn: any) { return this; },
    
    // 对象方法
    passthrough: function() { return this; },
    strict: function() { return this; },
    strip: function() { return this; },
    catchall: function(schema: any) { return this; },
    extend: function(shape: any) { return this; },
    
    // 数组方法
    lengthArray: function(len: number) { return this; },
    minArray: function(min: number) { return this; },
    maxArray: function(max: number) { return this; },
    nonempty: function() { return this; },
    
    // 描述和元数据
    describe: function(description: string) { 
      (this as any)._description = description;
      return this; 
    },
    brand: function(brand: string) { return this; },
    pipe: function(schema: any) { return this; },
    
    // 类型保护
    isOptional: function() { return false; },
    isNullable: function() { return false; },
    isDefault: function() { return false; },
    
    // 自定义方法
    _shape: options,
    _type: type,
    _description: undefined as string | undefined
  };
  
  return schema;
}

// ==================== 兼容性接口定义 ====================

export interface LegacyZodSchema<T = any> {
  parse: (data: any) => T;
  safeParse: (data: any) => SafeParseResult<T>;
  
  // Zod标准方法
  optional: () => LegacyZodSchema<T | undefined>;
  nullable: () => LegacyZodSchema<T | null>;
  nullish: () => LegacyZodSchema<T | null | undefined>;
  default: (defaultValue: T) => LegacyZodSchema<T>;
  transform: <U>(fn: (val: T) => U) => LegacyZodSchema<U>;
  refine: (fn: (val: T) => boolean, message?: string) => LegacyZodSchema<T>;
  
  // 字符串方法
  min?: (min: number) => LegacyZodSchema<T>;
  max?: (max: number) => LegacyZodSchema<T>;
  length?: (len: number) => LegacyZodSchema<T>;
  email?: () => LegacyZodSchema<T>;
  url?: () => LegacyZodSchema<T>;
  uuid?: () => LegacyZodSchema<T>;
  regex?: (regex: RegExp) => LegacyZodSchema<T>;
  
  // 数字方法
  int?: () => LegacyZodSchema<T>;
  positive?: () => LegacyZodSchema<T>;
  negative?: () => LegacyZodSchema<T>;
  nonnegative?: () => LegacyZodSchema<T>;
  nonpositive?: () => LegacyZodSchema<T>;
  multipleOf?: (value: number) => LegacyZodSchema<T>;
  
  // 对象方法
  passthrough?: () => LegacyZodSchema<T>;
  strict?: () => LegacyZodSchema<T>;
  strip?: () => LegacyZodSchema<T>;
  catchall?: (schema: any) => LegacyZodSchema<T>;
  extend?: (shape: any) => LegacyZodSchema<T>;
  
  // 数组方法
  lengthArray?: (len: number) => LegacyZodSchema<T>;
  minArray?: (min: number) => LegacyZodSchema<T>;
  maxArray?: (max: number) => LegacyZodSchema<T>;
  nonempty?: () => LegacyZodSchema<T>;
  
  // 描述和元数据
  describe?: (description: string) => LegacyZodSchema<T>;
  brand?: (brand: string) => LegacyZodSchema<T>;
  pipe?: (schema: any) => LegacyZodSchema<T>;
  
  // 类型保护
  isOptional?: () => boolean;
  isNullable?: () => boolean;
  isDefault?: () => boolean;
  
  // 内部属性（用于兼容性）
  _shape?: any;
  _type?: string;
  _description?: string;
}

export interface SafeParseResult<T> {
  success: boolean;
  data?: T;
  error?: any;
}

// ==================== 兼容性包装器 ====================

export class CompatibleZodSchema<T = any> implements LegacyZodSchema<T> {
  private realSchema: any;
  
  constructor(realSchema: any) {
    this.realSchema = realSchema;
  }
  
  parse(data: any): T {
    return this.realSchema.parse(data);
  }
  
  safeParse(data: any): SafeParseResult<T> {
    const result = this.realSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const error = {
        name: 'ZodError',
        message: result.error?.message || 'Validation failed',
        errors: result.error?.errors || [],
        toString: () => `ZodError: ${result.error?.message || 'Validation failed'}`
      };
      return { success: false, error };
    }
  }
  
  // 代理所有Zod方法到真实的schema
  optional(): LegacyZodSchema<T | undefined> {
    return new CompatibleZodSchema(this.realSchema.optional?.() || this.realSchema);
  }
  
  nullable(): LegacyZodSchema<T | null> {
    return new CompatibleZodSchema(this.realSchema.nullable?.() || this.realSchema);
  }
  
  nullish(): LegacyZodSchema<T | null | undefined> {
    return new CompatibleZodSchema(this.realSchema.nullish?.() || this.realSchema);
  }
  
  default(defaultValue: T): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.default?.(defaultValue) || this.realSchema);
  }
  
  transform<U>(fn: (val: T) => U): LegacyZodSchema<U> {
    return new CompatibleZodSchema(this.realSchema.transform?.(fn) || this.realSchema);
  }
  
  refine(fn: (val: T) => boolean, message?: string): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.refine?.(fn, message) || this.realSchema);
  }
  
  // 字符串和数字方法
  min(min: number): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.min?.(min) || this.realSchema);
  }
  
  max(max: number): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.max?.(max) || this.realSchema);
  }
  
  length(len: number): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.length?.(len) || this.realSchema);
  }
  
  email(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.email?.() || this.realSchema);
  }
  
  url(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.url?.() || this.realSchema);
  }
  
  uuid(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.uuid?.() || this.realSchema);
  }
  
  regex(regex: RegExp): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.regex?.(regex) || this.realSchema);
  }
  
  int(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.int?.() || this.realSchema);
  }
  
  positive(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.positive?.() || this.realSchema);
  }
  
  negative(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.negative?.() || this.realSchema);
  }
  
  nonnegative(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.nonnegative?.() || this.realSchema);
  }
  
  nonpositive(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.nonpositive?.() || this.realSchema);
  }
  
  multipleOf(value: number): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.multipleOf?.(value) || this.realSchema);
  }
  
  // 对象方法
  passthrough(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.passthrough?.() || this.realSchema);
  }
  
  strict(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.strict?.() || this.realSchema);
  }
  
  strip(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.strip?.() || this.realSchema);
  }
  
  catchall(schema: any): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.catchall?.(schema) || this.realSchema);
  }
  
  extend(shape: any): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.extend?.(shape) || this.realSchema);
  }
  
  // 数组方法
  lengthArray(len: number): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.length?.(len) || this.realSchema);
  }
  
  minArray(min: number): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.min?.(min) || this.realSchema);
  }
  
  maxArray(max: number): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.max?.(max) || this.realSchema);
  }
  
  nonempty(): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.nonempty?.() || this.realSchema);
  }
  
  // 描述和元数据
  describe(description: string): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.describe?.(description) || this.realSchema);
  }
  
  brand(brand: string): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.brand?.(brand) || this.realSchema);
  }
  
  pipe(schema: any): LegacyZodSchema<T> {
    return new CompatibleZodSchema(this.realSchema.pipe?.(schema) || this.realSchema);
  }
  
  // 类型保护（简化实现）
  isOptional(): boolean {
    return this.realSchema.isOptional?.() || false;
  }
  
  isNullable(): boolean {
    return this.realSchema.isNullable?.() || false;
  }
  
  isDefault(): boolean {
    return this.realSchema.isDefault?.() || false;
  }
  
  // 获取真实schema
  getRealSchema(): any {
    return this.realSchema;
  }
  
  // 内部属性访问
  get _shape(): any {
    return this.realSchema._shape || this.realSchema.shape;
  }
  
  get _type(): string | undefined {
    return this.realSchema._type || 'unknown';
  }
  
  get _description(): string | undefined {
    return this.realSchema._description || this.realSchema.description;
  }
  
  isRealZodSchema(): this is { getRealSchema(): any } {
    return true;
  }
}

// ==================== 导出真正的Zod ====================

export const z = realZod;
export { ZodError };

// ==================== 工具函数 ====================

export function createCompatibleSchema<T>(schema: any): LegacyZodSchema<T> {
  return new CompatibleZodSchema(schema);
}

export function isCompatibleSchema<T>(schema: any): schema is CompatibleZodSchema<T> {
  return schema instanceof CompatibleZodSchema;
}

export function isRealZodSchema(schema: any): boolean {
  return schema && 
         typeof schema === 'object' && 
         typeof schema.parse === 'function' &&
         typeof schema.safeParse === 'function' &&
         // 真正的Zod schema通常有_def属性或_type属性
         (schema._def !== undefined || schema._type !== undefined) &&
         !isCompatibleSchema(schema);
}

export function getRealSchema<T>(schema: LegacyZodSchema<T>): any | null {
  if (isCompatibleSchema(schema)) {
    return schema.getRealSchema();
  }
  return null;
}

export function unifiedParse<T>(schema: LegacyZodSchema<T> | any, data: any): T {
  if (isRealZodSchema(schema)) {
    return schema.parse(data);
  } else {
    return schema.parse(data);
  }
}

export function unifiedSafeParse<T>(schema: LegacyZodSchema<T> | any, data: any): SafeParseResult<T> {
  if (isRealZodSchema(schema)) {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        error: result.error 
      };
    }
  } else {
    return schema.safeParse(data);
  }
}

// ==================== 迁移辅助工具 ====================

export const compatibility = {
  string: (options?: { min?: number; max?: number; regex?: RegExp }) => {
    let schema = z.string();
    if (options?.min !== undefined) schema = (schema as any).min(options.min);
    if (options?.max !== undefined) schema = (schema as any).max(options.max);
    if (options?.regex !== undefined) schema = (schema as any).regex(options.regex);
    return createCompatibleSchema(schema);
  },
  
  number: (options?: { min?: number; max?: number; int?: boolean }) => {
    let schema = z.number();
    if (options?.min !== undefined) schema = (schema as any).min(options.min);
    if (options?.max !== undefined) schema = (schema as any).max(options.max);
    if (options?.int) schema = (schema as any).int();
    return createCompatibleSchema(schema);
  },
  
  boolean: () => createCompatibleSchema(z.boolean()),
  any: () => createCompatibleSchema(z.any()),
  
  object: (shape: any) => createCompatibleSchema(z.object(shape)),
  array: (element: any) => createCompatibleSchema(z.array(element)),
  union: (options: any) => createCompatibleSchema(z.union(options)),
  literal: (value: any) => createCompatibleSchema(z.literal(value)),
  
  objectSimple: (schema: any) => createCompatibleSchema(z.object(schema)),
  
  isLegacyMockSchema: (schema: any): boolean => {
    return schema && 
           typeof schema === 'object' &&
           !isCompatibleSchema(schema) &&
           !isRealZodSchema(schema) &&
           (!!schema.parse || !!schema.safeParse);
  },
  
  createMigrationReport: (schema: any): any => {
    const report = {
      isLegacy: compatibility.isLegacyMockSchema(schema),
      isCompatible: isCompatibleSchema(schema),
      isRealZod: isRealZodSchema(schema),
      recommendedAction: 'keep' as 'keep' | 'migrate' | 'optional',
      migrationComplexity: 'low' as 'low' | 'medium' | 'high'
    };
    
    if (report.isLegacy) {
      report.recommendedAction = 'migrate';
      report.migrationComplexity = 'medium';
    } else if (report.isCompatible) {
      report.recommendedAction = 'optional';
    } else if (report.isRealZod) {
      report.recommendedAction = 'keep';
    }
    
    return report;
  }
};

// ==================== 类型导出 ====================

export type { LegacyZodSchema as ZodSchema };

// 默认导出
export default {
  z,
  ZodError,
  createCompatibleSchema,
  isCompatibleSchema,
  getRealSchema,
  unifiedParse,
  unifiedSafeParse,
  compatibility
};