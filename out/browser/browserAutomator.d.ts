export interface BrowserAction {
    type: 'navigate' | 'extract' | 'test';
    selector?: string;
    text?: string;
    url?: string;
    waitForSelector?: string;
    waitForNavigation?: boolean;
    evaluateFn?: string;
    outputFormat?: 'text' | 'html' | 'json';
}
export interface BrowserResult {
    success: boolean;
    output: string;
    error?: string;
    actions: BrowserAction[];
    duration: number;
    url?: string;
}
export interface BrowserOptions {
    timeout?: number;
    headers?: Record<string, string>;
    userAgent?: string;
}
export declare class BrowserAutomator {
    private outputChannel;
    private isInitialized;
    constructor();
    /**
     * 初始化浏览器实例（轻量级HTTP客户端）
     */
    initialize(options?: BrowserOptions): Promise<boolean>;
    /**
     * 执行浏览器自动化序列（简化版）
     */
    executeSequence(url: string, actions: BrowserAction[]): Promise<BrowserResult>;
    /**
     * 执行单个浏览器动作（简化版）
     */
    private executeAction;
    /**
     * 获取URL内容
     */
    private fetchUrl;
    /**
     * 测试连接
     */
    private testConnection;
    /**
     * 生成浏览器自动化结果的HTML报告
     */
    generateHtmlReport(result: BrowserResult): string;
    /**
     * 执行简单的网页抓取
     */
    scrapePage(url: string, selectors: Record<string, string>): Promise<Record<string, string>>;
    /**
     * 测试浏览器连接和功能
     */
    testBrowser(): Promise<boolean>;
    /**
     * 关闭浏览器（清理资源）
     */
    close(): Promise<void>;
    /**
     * 获取浏览器状态
     */
    getStatus(): {
        initialized: boolean;
        lightweight: boolean;
        outputChannel: boolean;
    };
    private escapeHtml;
}
//# sourceMappingURL=browserAutomator.d.ts.map