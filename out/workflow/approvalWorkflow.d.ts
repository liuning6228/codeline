import { FileDiff } from '../file/fileManager';
import { BrowserResult } from '../browser/browserAutomator';
/**
 * 终端命令接口
 */
export interface TerminalCommand {
    command: string;
    cwd?: string;
    options?: any;
}
/**
 * 批准项类型
 */
export type ApprovalType = 'file' | 'terminal' | 'browser' | 'mcp';
/**
 * 批准项状态
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';
/**
 * 批准项接口
 */
export interface ApprovalItem {
    /** 唯一标识符 */
    id: string;
    /** 批准项类型 */
    type: ApprovalType;
    /** 批准项描述（用户可读） */
    description: string;
    /** 详细数据 */
    data: FileDiff | TerminalCommand | BrowserResult | any;
    /** 当前状态 */
    status: ApprovalStatus;
    /** 创建时间 */
    createdAt: Date;
    /** 批准/拒绝时间 */
    resolvedAt?: Date;
    /** 执行时间（如果已执行） */
    executedAt?: Date;
    /** 执行结果 */
    executionResult?: any;
    /** 拒绝原因（如果被拒绝） */
    rejectionReason?: string;
    /** 关联的任务ID */
    taskId?: string;
    /** 用户标签（用于分组） */
    tags?: string[];
}
/**
 * 批准选项
 */
export interface ApprovalOptions {
    /** 是否需要立即用户确认 */
    requireConfirmation?: boolean;
    /** 是否允许批量批准 */
    allowBatch?: boolean;
    /** 自动批准延迟（毫秒，0表示不自动批准） */
    autoApproveDelay?: number;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 批准后自动执行 */
    autoExecute?: boolean;
    /** 失败时重试次数 */
    retryCount?: number;
}
/**
 * 批准结果
 */
export interface ApprovalResult {
    success: boolean;
    itemId: string;
    action: 'approved' | 'rejected';
    timestamp: Date;
    reason?: string;
    executionResult?: any;
}
/**
 * 用户批准工作流管理器
 *
 * 实现Cline风格的"提议-批准"工作流，让用户可以：
 * 1. 预览AI提议的操作
 * 2. 批量批准或拒绝操作
 * 3. 查看批准历史
 * 4. 配置批准策略
 */
export declare class ApprovalWorkflow {
    private pendingItems;
    private historyItems;
    private listeners;
    /**
     * 提议一个新操作，等待用户批准
     */
    proposeOperation(type: ApprovalType, description: string, data: any, options?: ApprovalOptions): string;
    /**
     * 批准一个待处理项
     */
    approveItem(itemId: string, options?: {
        reason?: string;
        auto?: boolean;
    }): Promise<ApprovalResult>;
    /**
     * 拒绝一个待处理项
     */
    rejectItem(itemId: string, options?: {
        reason?: string;
        auto?: boolean;
    }): Promise<ApprovalResult>;
    /**
     * 批量批准多个待处理项
     */
    approveItems(itemIds: string[], reason?: string): Promise<ApprovalResult[]>;
    /**
     * 批量拒绝多个待处理项
     */
    rejectItems(itemIds: string[], reason?: string): Promise<ApprovalResult[]>;
    /**
     * 标记项为已执行
     */
    markAsExecuted(itemId: string, result: any): void;
    /**
     * 标记项为执行失败
     */
    markAsFailed(itemId: string, error: any): void;
    /**
     * 获取所有待处理项
     */
    getPendingItems(): ApprovalItem[];
    /**
     * 获取批准历史
     */
    getHistory(limit?: number): ApprovalItem[];
    /**
     * 按标签获取待处理项
     */
    getPendingItemsByTag(tag: string): ApprovalItem[];
    /**
     * 获取项统计信息
     */
    getStats(): {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        executed: number;
        failed: number;
    };
    /**
     * 清理旧的历史记录
     */
    cleanupHistory(maxAgeDays?: number): number;
    /**
     * 清除所有待处理项
     */
    clearPending(): number;
    /**
     * 添加状态变化监听器
     */
    addListener(listener: (item: ApprovalItem) => void): void;
    /**
     * 移除状态变化监听器
     */
    removeListener(listener: (item: ApprovalItem) => void): void;
    /**
     * 导出批准历史到JSON
     */
    exportHistory(): string;
    /**
     * 导入批准历史从JSON
     */
    importHistory(json: string): void;
    private generateId;
    private moveToHistory;
    private notifyListeners;
    /**
     * 生成批准项的HTML摘要（用于UI显示）
     */
    generateHtmlSummary(item: ApprovalItem): string;
    /**
     * 生成批量批准操作的HTML摘要
     */
    generateBatchHtmlSummary(items: ApprovalItem[]): string;
    private getTypeIcon;
    private getStatusText;
}
//# sourceMappingURL=approvalWorkflow.d.ts.map