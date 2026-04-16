"use strict";
/**
 * Zod兼容性层 - 临时版本
 * 在zod库安装完成前使用模拟实现，安装后使用真正的zod
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compatibility = exports.ZodError = exports.z = exports.CompatibleZodSchema = void 0;
exports.createCompatibleSchema = createCompatibleSchema;
exports.isCompatibleSchema = isCompatibleSchema;
exports.isRealZodSchema = isRealZodSchema;
exports.getRealSchema = getRealSchema;
exports.unifiedParse = unifiedParse;
exports.unifiedSafeParse = unifiedSafeParse;
// 尝试导入真正的zod，如果失败则使用模拟版本
let realZod = null;
let RealZodSchema = null;
let ZodError = null;
exports.ZodError = ZodError;
let ZodTypeAny = null;
try {
    // 尝试导入真正的zod
    const zodModule = require('zod');
    realZod = zodModule.z;
    RealZodSchema = zodModule.ZodSchema;
    exports.ZodError = ZodError = zodModule.ZodError;
    ZodTypeAny = zodModule.ZodTypeAny;
    console.log('✅ Zod兼容性层：使用真正的Zod库');
}
catch (error) {
    // 如果zod未安装，使用模拟版本
    console.log('⚠️ Zod兼容性层：zod库未安装，使用模拟版本');
    // 模拟ZodError
    exports.ZodError = ZodError = class MockZodError extends Error {
        errors;
        constructor(message, errors = []) {
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
        object: (shape) => createMockSchema('object', shape),
        array: (element) => createMockSchema('array', element),
        union: (options) => createMockSchema('union', options),
        literal: (value) => createMockSchema('literal', value)
    };
    RealZodSchema = class MockRealZodSchema {
        parse(data) { return data; }
        safeParse(data) { return { success: true, data }; }
    };
    ZodTypeAny = RealZodSchema;
}
// ==================== 辅助函数 ====================
function createMockSchema(type, options) {
    const schema = {
        parse(data) {
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
        safeParse(data) {
            try {
                const parsed = this.parse(data);
                return { success: true, data: parsed };
            }
            catch (error) {
                return { success: false, error };
            }
        },
        // 完整的Zod方法集合（存根实现）
        min: function (min) { return this; },
        max: function (max) { return this; },
        regex: function (regex) { return this; },
        int: function () { return this; },
        positive: function () { return this; },
        negative: function () { return this; },
        nonnegative: function () { return this; },
        nonpositive: function () { return this; },
        multipleOf: function (value) { return this; },
        // 字符串方法
        length: function (len) { return this; },
        email: function () { return this; },
        url: function () { return this; },
        uuid: function () { return this; },
        datetime: function (options) { return this; },
        // 变换方法
        optional: function () { return this; },
        nullable: function () { return this; },
        nullish: function () { return this; },
        default: function (defaultValue) { return this; },
        transform: function (fn) { return this; },
        refine: function (fn, message) { return this; },
        superRefine: function (fn) { return this; },
        // 对象方法
        passthrough: function () { return this; },
        strict: function () { return this; },
        strip: function () { return this; },
        catchall: function (schema) { return this; },
        extend: function (shape) { return this; },
        // 数组方法
        lengthArray: function (len) { return this; },
        minArray: function (min) { return this; },
        maxArray: function (max) { return this; },
        nonempty: function () { return this; },
        // 描述和元数据
        describe: function (description) {
            this._description = description;
            return this;
        },
        brand: function (brand) { return this; },
        pipe: function (schema) { return this; },
        // 类型保护
        isOptional: function () { return false; },
        isNullable: function () { return false; },
        isDefault: function () { return false; },
        // 自定义方法
        _shape: options,
        _type: type,
        _description: undefined
    };
    return schema;
}
// ==================== 兼容性包装器 ====================
class CompatibleZodSchema {
    realSchema;
    constructor(realSchema) {
        this.realSchema = realSchema;
    }
    parse(data) {
        return this.realSchema.parse(data);
    }
    safeParse(data) {
        const result = this.realSchema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data };
        }
        else {
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
    optional() {
        return new CompatibleZodSchema(this.realSchema.optional?.() || this.realSchema);
    }
    nullable() {
        return new CompatibleZodSchema(this.realSchema.nullable?.() || this.realSchema);
    }
    nullish() {
        return new CompatibleZodSchema(this.realSchema.nullish?.() || this.realSchema);
    }
    default(defaultValue) {
        return new CompatibleZodSchema(this.realSchema.default?.(defaultValue) || this.realSchema);
    }
    transform(fn) {
        return new CompatibleZodSchema(this.realSchema.transform?.(fn) || this.realSchema);
    }
    refine(fn, message) {
        return new CompatibleZodSchema(this.realSchema.refine?.(fn, message) || this.realSchema);
    }
    // 字符串和数字方法
    min(min) {
        return new CompatibleZodSchema(this.realSchema.min?.(min) || this.realSchema);
    }
    max(max) {
        return new CompatibleZodSchema(this.realSchema.max?.(max) || this.realSchema);
    }
    length(len) {
        return new CompatibleZodSchema(this.realSchema.length?.(len) || this.realSchema);
    }
    email() {
        return new CompatibleZodSchema(this.realSchema.email?.() || this.realSchema);
    }
    url() {
        return new CompatibleZodSchema(this.realSchema.url?.() || this.realSchema);
    }
    uuid() {
        return new CompatibleZodSchema(this.realSchema.uuid?.() || this.realSchema);
    }
    regex(regex) {
        return new CompatibleZodSchema(this.realSchema.regex?.(regex) || this.realSchema);
    }
    int() {
        return new CompatibleZodSchema(this.realSchema.int?.() || this.realSchema);
    }
    positive() {
        return new CompatibleZodSchema(this.realSchema.positive?.() || this.realSchema);
    }
    negative() {
        return new CompatibleZodSchema(this.realSchema.negative?.() || this.realSchema);
    }
    nonnegative() {
        return new CompatibleZodSchema(this.realSchema.nonnegative?.() || this.realSchema);
    }
    nonpositive() {
        return new CompatibleZodSchema(this.realSchema.nonpositive?.() || this.realSchema);
    }
    multipleOf(value) {
        return new CompatibleZodSchema(this.realSchema.multipleOf?.(value) || this.realSchema);
    }
    // 对象方法
    passthrough() {
        return new CompatibleZodSchema(this.realSchema.passthrough?.() || this.realSchema);
    }
    strict() {
        return new CompatibleZodSchema(this.realSchema.strict?.() || this.realSchema);
    }
    strip() {
        return new CompatibleZodSchema(this.realSchema.strip?.() || this.realSchema);
    }
    catchall(schema) {
        return new CompatibleZodSchema(this.realSchema.catchall?.(schema) || this.realSchema);
    }
    extend(shape) {
        return new CompatibleZodSchema(this.realSchema.extend?.(shape) || this.realSchema);
    }
    // 数组方法
    lengthArray(len) {
        return new CompatibleZodSchema(this.realSchema.length?.(len) || this.realSchema);
    }
    minArray(min) {
        return new CompatibleZodSchema(this.realSchema.min?.(min) || this.realSchema);
    }
    maxArray(max) {
        return new CompatibleZodSchema(this.realSchema.max?.(max) || this.realSchema);
    }
    nonempty() {
        return new CompatibleZodSchema(this.realSchema.nonempty?.() || this.realSchema);
    }
    // 描述和元数据
    describe(description) {
        return new CompatibleZodSchema(this.realSchema.describe?.(description) || this.realSchema);
    }
    brand(brand) {
        return new CompatibleZodSchema(this.realSchema.brand?.(brand) || this.realSchema);
    }
    pipe(schema) {
        return new CompatibleZodSchema(this.realSchema.pipe?.(schema) || this.realSchema);
    }
    // 类型保护（简化实现）
    isOptional() {
        return this.realSchema.isOptional?.() || false;
    }
    isNullable() {
        return this.realSchema.isNullable?.() || false;
    }
    isDefault() {
        return this.realSchema.isDefault?.() || false;
    }
    // 获取真实schema
    getRealSchema() {
        return this.realSchema;
    }
    // 内部属性访问
    get _shape() {
        return this.realSchema._shape || this.realSchema.shape;
    }
    get _type() {
        return this.realSchema._type || 'unknown';
    }
    get _description() {
        return this.realSchema._description || this.realSchema.description;
    }
    isRealZodSchema() {
        return true;
    }
}
exports.CompatibleZodSchema = CompatibleZodSchema;
// ==================== 导出真正的Zod ====================
exports.z = realZod;
// ==================== 工具函数 ====================
function createCompatibleSchema(schema) {
    return new CompatibleZodSchema(schema);
}
function isCompatibleSchema(schema) {
    return schema instanceof CompatibleZodSchema;
}
function isRealZodSchema(schema) {
    return schema &&
        typeof schema === 'object' &&
        typeof schema.parse === 'function' &&
        typeof schema.safeParse === 'function' &&
        // 真正的Zod schema通常有_def属性或_type属性
        (schema._def !== undefined || schema._type !== undefined) &&
        !isCompatibleSchema(schema);
}
function getRealSchema(schema) {
    if (isCompatibleSchema(schema)) {
        return schema.getRealSchema();
    }
    return null;
}
function unifiedParse(schema, data) {
    if (isRealZodSchema(schema)) {
        return schema.parse(data);
    }
    else {
        return schema.parse(data);
    }
}
function unifiedSafeParse(schema, data) {
    if (isRealZodSchema(schema)) {
        const result = schema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data };
        }
        else {
            return {
                success: false,
                error: result.error
            };
        }
    }
    else {
        return schema.safeParse(data);
    }
}
// ==================== 迁移辅助工具 ====================
exports.compatibility = {
    string: (options) => {
        let schema = exports.z.string();
        if (options?.min !== undefined)
            schema = schema.min(options.min);
        if (options?.max !== undefined)
            schema = schema.max(options.max);
        if (options?.regex !== undefined)
            schema = schema.regex(options.regex);
        return createCompatibleSchema(schema);
    },
    number: (options) => {
        let schema = exports.z.number();
        if (options?.min !== undefined)
            schema = schema.min(options.min);
        if (options?.max !== undefined)
            schema = schema.max(options.max);
        if (options?.int)
            schema = schema.int();
        return createCompatibleSchema(schema);
    },
    boolean: () => createCompatibleSchema(exports.z.boolean()),
    any: () => createCompatibleSchema(exports.z.any()),
    object: (shape) => createCompatibleSchema(exports.z.object(shape)),
    array: (element) => createCompatibleSchema(exports.z.array(element)),
    union: (options) => createCompatibleSchema(exports.z.union(options)),
    literal: (value) => createCompatibleSchema(exports.z.literal(value)),
    objectSimple: (schema) => createCompatibleSchema(exports.z.object(schema)),
    isLegacyMockSchema: (schema) => {
        return schema &&
            typeof schema === 'object' &&
            !isCompatibleSchema(schema) &&
            !isRealZodSchema(schema) &&
            (!!schema.parse || !!schema.safeParse);
    },
    createMigrationReport: (schema) => {
        const report = {
            isLegacy: exports.compatibility.isLegacyMockSchema(schema),
            isCompatible: isCompatibleSchema(schema),
            isRealZod: isRealZodSchema(schema),
            recommendedAction: 'keep',
            migrationComplexity: 'low'
        };
        if (report.isLegacy) {
            report.recommendedAction = 'migrate';
            report.migrationComplexity = 'medium';
        }
        else if (report.isCompatible) {
            report.recommendedAction = 'optional';
        }
        else if (report.isRealZod) {
            report.recommendedAction = 'keep';
        }
        return report;
    }
};
// 默认导出
exports.default = {
    z: exports.z,
    ZodError,
    createCompatibleSchema,
    isCompatibleSchema,
    getRealSchema,
    unifiedParse,
    unifiedSafeParse,
    compatibility: exports.compatibility
};
//# sourceMappingURL=ZodCompatibility.js.map