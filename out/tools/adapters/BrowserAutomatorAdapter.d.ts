/**
 * 浏览器自动化适配器
 * 将现有的 BrowserAutomator 模块适配到统一的工具接口
 */
import { BrowserAction, BrowserResult } from '../../browser/browserAutomator';
import { BaseToolAdapter } from './ToolAdapter';
import { ToolContext, ToolResult, PermissionResult, ValidationResult, ToolProgress } from '../ToolInterface';
/**
 * 浏览器自动化参数类型
 */
export interface BrowserAutomationParams {
    /** 操作模式 */
    mode: 'navigate' | 'extract' | 'test' | 'sequence';
    /** URL地址 */
    url?: string;
    /** 动作序列（仅用于sequence模式） */
    actions?: BrowserAction[];
    /** 选择器（用于extract/test模式） */
    selector?: string;
    /** 文本内容（用于test模式） */
    text?: string;
    /** 等待选择器 */
    waitForSelector?: string;
    /** 是否等待导航完成 */
    waitForNavigation?: boolean;
    /** 评估函数 */
    evaluateFn?: string;
    /** 输出格式 */
    outputFormat?: 'text' | 'html' | 'json';
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 用户代理 */
    userAgent?: string;
}
/**
 * 浏览器自动化结果类型
 */
export interface BrowserAutomationResultData {
    /** 浏览器执行结果 */
    result: BrowserResult;
    /** 提取的数据 */
    extractedData?: any;
    /** 页面信息 */
    pageInfo?: {
        url: string;
        title?: string;
        contentLength: number;
        contentType?: string;
    };
}
/**
 * 浏览器自动化适配器
 */
export declare class BrowserAutomatorAdapter extends BaseToolAdapter<BrowserAutomationParams, BrowserAutomationResultData> {
    private browserAutomator;
    constructor(context: ToolContext);
    /**
     * 检查权限 - 浏览器自动化需要特别注意
     */
    checkPermissions(params: BrowserAutomationParams, context: ToolContext): Promise<PermissionResult>;
    /**
     * 验证参数
     */
    validateParameters(params: BrowserAutomationParams, context: ToolContext): Promise<ValidationResult>;
    /**
     * 执行浏览器自动化
     */
    execute(params: BrowserAutomationParams, context: ToolContext, onProgress?: (progress: ToolProgress) => void): Promise<ToolResult<BrowserAutomationResultData>>;
    /**
     * 检查是否为只读操作
     */
    isReadOnly(context: ToolContext): boolean;
    /**
     * 获取显示名称
     */
    getDisplayName(params?: BrowserAutomationParams): string;
    /**
     * 获取活动描述
     */
    getActivityDescription(params: BrowserAutomationParams): string;
    /**
     * 检查URL安全性
     */
    private isUrlSafe;
    /**
     * 工厂方法：创建浏览器自动化适配器
     */
    static create(context: ToolContext): BrowserAutomatorAdapter;
}
//# sourceMappingURL=BrowserAutomatorAdapter.d.ts.map