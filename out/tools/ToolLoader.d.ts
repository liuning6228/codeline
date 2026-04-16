/**
 * 工具加载器
 * 负责加载和注册所有工具适配器
 */
import { ToolRegistry } from './ToolRegistry';
import { ToolContext } from './ToolInterface';
/**
 * 工具加载器配置
 */
export interface ToolLoaderConfig {
    /** 是否启用文件工具 */
    enableFileTools: boolean;
    /** 是否启用终端工具 */
    enableTerminalTools: boolean;
    /** 是否启用浏览器工具 */
    enableBrowserTools: boolean;
    /** 是否启用MCP工具 */
    enableMCPTools: boolean;
    /** 是否自动加载工具 */
    autoLoadTools: boolean;
    /** 是否显示加载进度 */
    showLoadingProgress: boolean;
    /** 加载超时时间（毫秒） */
    loadingTimeout: number;
}
/**
 * 工具加载器
 */
export declare class ToolLoader {
    private toolRegistry;
    private context;
    private config;
    private isLoaded;
    private loadingPromise;
    constructor(context: ToolContext, registry?: ToolRegistry, config?: Partial<ToolLoaderConfig>);
    /**
     * 加载所有工具
     */
    loadTools(): Promise<boolean>;
    /**
     * 内部加载实现
     */
    private loadToolsInternal;
    /**
     * 加载文件工具
     */
    private loadFileTools;
    /**
     * 加载终端工具
     */
    private loadTerminalTools;
    /**
     * 加载浏览器工具
     */
    private loadBrowserTools;
    /**
     * 加载MCP工具
     */
    private loadMCPTools;
    /**
     * 显示加载进度
     */
    private showLoadingProgress;
    /**
     * 重新加载工具
     */
    reloadTools(): Promise<boolean>;
    /**
     * 获取工具注册表
     */
    getToolRegistry(): ToolRegistry;
    /**
     * 获取加载状态
     */
    getLoadingStatus(): {
        isLoaded: boolean;
        isLoading: boolean;
        registryStatus?: any;
    };
    /**
     * 获取工具统计信息
     */
    getToolStats(): {
        totalTools: number;
        loadedTools: number;
        failedTools: number;
        toolCategories: number;
    };
    /**
     * 关闭工具加载器
     */
    close(): Promise<void>;
}
//# sourceMappingURL=ToolLoader.d.ts.map