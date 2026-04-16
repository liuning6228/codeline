/**
 * Zod兼容性层 - 临时版本
 * 在zod库安装完成前使用模拟实现，安装后使用真正的zod
 */
declare let ZodError: any;
export interface LegacyZodSchema<T = any> {
    parse: (data: any) => T;
    safeParse: (data: any) => SafeParseResult<T>;
    optional: () => LegacyZodSchema<T | undefined>;
    nullable: () => LegacyZodSchema<T | null>;
    nullish: () => LegacyZodSchema<T | null | undefined>;
    default: (defaultValue: T) => LegacyZodSchema<T>;
    transform: <U>(fn: (val: T) => U) => LegacyZodSchema<U>;
    refine: (fn: (val: T) => boolean, message?: string) => LegacyZodSchema<T>;
    min?: (min: number) => LegacyZodSchema<T>;
    max?: (max: number) => LegacyZodSchema<T>;
    length?: (len: number) => LegacyZodSchema<T>;
    email?: () => LegacyZodSchema<T>;
    url?: () => LegacyZodSchema<T>;
    uuid?: () => LegacyZodSchema<T>;
    regex?: (regex: RegExp) => LegacyZodSchema<T>;
    int?: () => LegacyZodSchema<T>;
    positive?: () => LegacyZodSchema<T>;
    negative?: () => LegacyZodSchema<T>;
    nonnegative?: () => LegacyZodSchema<T>;
    nonpositive?: () => LegacyZodSchema<T>;
    multipleOf?: (value: number) => LegacyZodSchema<T>;
    passthrough?: () => LegacyZodSchema<T>;
    strict?: () => LegacyZodSchema<T>;
    strip?: () => LegacyZodSchema<T>;
    catchall?: (schema: any) => LegacyZodSchema<T>;
    extend?: (shape: any) => LegacyZodSchema<T>;
    lengthArray?: (len: number) => LegacyZodSchema<T>;
    minArray?: (min: number) => LegacyZodSchema<T>;
    maxArray?: (max: number) => LegacyZodSchema<T>;
    nonempty?: () => LegacyZodSchema<T>;
    describe?: (description: string) => LegacyZodSchema<T>;
    brand?: (brand: string) => LegacyZodSchema<T>;
    pipe?: (schema: any) => LegacyZodSchema<T>;
    isOptional?: () => boolean;
    isNullable?: () => boolean;
    isDefault?: () => boolean;
    _shape?: any;
    _type?: string;
    _description?: string;
}
export interface SafeParseResult<T> {
    success: boolean;
    data?: T;
    error?: any;
}
export declare class CompatibleZodSchema<T = any> implements LegacyZodSchema<T> {
    private realSchema;
    constructor(realSchema: any);
    parse(data: any): T;
    safeParse(data: any): SafeParseResult<T>;
    optional(): LegacyZodSchema<T | undefined>;
    nullable(): LegacyZodSchema<T | null>;
    nullish(): LegacyZodSchema<T | null | undefined>;
    default(defaultValue: T): LegacyZodSchema<T>;
    transform<U>(fn: (val: T) => U): LegacyZodSchema<U>;
    refine(fn: (val: T) => boolean, message?: string): LegacyZodSchema<T>;
    min(min: number): LegacyZodSchema<T>;
    max(max: number): LegacyZodSchema<T>;
    length(len: number): LegacyZodSchema<T>;
    email(): LegacyZodSchema<T>;
    url(): LegacyZodSchema<T>;
    uuid(): LegacyZodSchema<T>;
    regex(regex: RegExp): LegacyZodSchema<T>;
    int(): LegacyZodSchema<T>;
    positive(): LegacyZodSchema<T>;
    negative(): LegacyZodSchema<T>;
    nonnegative(): LegacyZodSchema<T>;
    nonpositive(): LegacyZodSchema<T>;
    multipleOf(value: number): LegacyZodSchema<T>;
    passthrough(): LegacyZodSchema<T>;
    strict(): LegacyZodSchema<T>;
    strip(): LegacyZodSchema<T>;
    catchall(schema: any): LegacyZodSchema<T>;
    extend(shape: any): LegacyZodSchema<T>;
    lengthArray(len: number): LegacyZodSchema<T>;
    minArray(min: number): LegacyZodSchema<T>;
    maxArray(max: number): LegacyZodSchema<T>;
    nonempty(): LegacyZodSchema<T>;
    describe(description: string): LegacyZodSchema<T>;
    brand(brand: string): LegacyZodSchema<T>;
    pipe(schema: any): LegacyZodSchema<T>;
    isOptional(): boolean;
    isNullable(): boolean;
    isDefault(): boolean;
    getRealSchema(): any;
    get _shape(): any;
    get _type(): string | undefined;
    get _description(): string | undefined;
    isRealZodSchema(): this is {
        getRealSchema(): any;
    };
}
export declare const z: any;
export { ZodError };
export declare function createCompatibleSchema<T>(schema: any): LegacyZodSchema<T>;
export declare function isCompatibleSchema<T>(schema: any): schema is CompatibleZodSchema<T>;
export declare function isRealZodSchema(schema: any): boolean;
export declare function getRealSchema<T>(schema: LegacyZodSchema<T>): any | null;
export declare function unifiedParse<T>(schema: LegacyZodSchema<T> | any, data: any): T;
export declare function unifiedSafeParse<T>(schema: LegacyZodSchema<T> | any, data: any): SafeParseResult<T>;
export declare const compatibility: {
    string: (options?: {
        min?: number;
        max?: number;
        regex?: RegExp;
    }) => LegacyZodSchema<unknown>;
    number: (options?: {
        min?: number;
        max?: number;
        int?: boolean;
    }) => LegacyZodSchema<unknown>;
    boolean: () => LegacyZodSchema<unknown>;
    any: () => LegacyZodSchema<unknown>;
    object: (shape: any) => LegacyZodSchema<unknown>;
    array: (element: any) => LegacyZodSchema<unknown>;
    union: (options: any) => LegacyZodSchema<unknown>;
    literal: (value: any) => LegacyZodSchema<unknown>;
    objectSimple: (schema: any) => LegacyZodSchema<unknown>;
    isLegacyMockSchema: (schema: any) => boolean;
    createMigrationReport: (schema: any) => any;
};
export type { LegacyZodSchema as ZodSchema };
declare const _default: {
    z: any;
    ZodError: any;
    createCompatibleSchema: typeof createCompatibleSchema;
    isCompatibleSchema: typeof isCompatibleSchema;
    getRealSchema: typeof getRealSchema;
    unifiedParse: typeof unifiedParse;
    unifiedSafeParse: typeof unifiedSafeParse;
    compatibility: {
        string: (options?: {
            min?: number;
            max?: number;
            regex?: RegExp;
        }) => LegacyZodSchema<unknown>;
        number: (options?: {
            min?: number;
            max?: number;
            int?: boolean;
        }) => LegacyZodSchema<unknown>;
        boolean: () => LegacyZodSchema<unknown>;
        any: () => LegacyZodSchema<unknown>;
        object: (shape: any) => LegacyZodSchema<unknown>;
        array: (element: any) => LegacyZodSchema<unknown>;
        union: (options: any) => LegacyZodSchema<unknown>;
        literal: (value: any) => LegacyZodSchema<unknown>;
        objectSimple: (schema: any) => LegacyZodSchema<unknown>;
        isLegacyMockSchema: (schema: any) => boolean;
        createMigrationReport: (schema: any) => any;
    };
};
export default _default;
//# sourceMappingURL=ZodCompatibility.d.ts.map