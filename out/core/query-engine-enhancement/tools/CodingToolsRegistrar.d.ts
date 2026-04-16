/**
 * CodingToolsRegistrar - 编码工具注册器
 *
 * 负责将编码专用工具注册到EnhancedToolRegistry
 */
import { EnhancedToolRegistry } from '../../tool/EnhancedToolRegistry';
/**
 * 编码工具注册器配置
 */
export interface CodingToolsRegistrarConfig {
    /** 是否自动注册所有编码工具 */
    autoRegister: boolean;
    /** 要注册的特定工具ID列表（如果autoRegister为false） */
    toolIds?: string[];
    /** 工具上下文 */
    context?: any;
    /** 是否覆盖已存在的工具 */
    overwriteExisting: boolean;
}
/**
 * 编码工具注册器
 */
export declare class CodingToolsRegistrar {
    private toolRegistry;
    private config;
    private registeredTools;
    constructor(toolRegistry: EnhancedToolRegistry, config?: Partial<CodingToolsRegistrarConfig>);
    /**
     * 注册所有编码工具
     */
    registerAllTools(): Promise<{
        success: boolean;
        registered: string[];
        failed: Array<{
            toolId: string;
            error: string;
        }>;
        total: number;
    }>;
    /**
     * 注册单个工具
     */
    registerTool(toolId: string): Promise<boolean>;
    /**
     * 取消注册工具
     */
    unregisterTool(toolId: string): boolean;
    /**
     * 取消注册所有编码工具
     */
    unregisterAllTools(): void;
    /**
     * 获取已注册的工具
     */
    getRegisteredTools(): Array<{
        id: string;
        name: string;
        description: string;
        category: string;
    }>;
    /**
     * 获取工具实例
     */
    getToolInstance(toolId: string): any | null;
    /**
     * 检查工具是否已注册
     */
    hasTool(toolId: string): boolean;
    /**
     * 获取工具统计
     */
    getStats(): {
        totalAvailable: number;
        totalRegistered: number;
        byCategory: Record<string, number>;
    };
    /**
     * 验证工具可用性
     */
    validateTools(): Promise<Array<{
        toolId: string;
        available: boolean;
        issues: string[];
    }>>;
}
/**
 * 创建默认的编码工具注册器配置
 */
export declare function createDefaultCodingToolsConfig(context?: any): CodingToolsRegistrarConfig;
/**
 * 在现有工具注册表中集成编码工具
 */
export declare function integrateCodingTools(toolRegistry: EnhancedToolRegistry, context?: any, config?: Partial<CodingToolsRegistrarConfig>): Promise<{
    registrar: CodingToolsRegistrar;
    registrationResult: {
        success: boolean;
        registered: string[];
        failed: Array<{
            toolId: string;
            error: string;
        }>;
        total: number;
    };
}>;
export default CodingToolsRegistrar;
//# sourceMappingURL=CodingToolsRegistrar.d.ts.map