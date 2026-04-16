/**
 * 权限管理器
 * 管理Claude Code三层权限架构的规则
 */
import { EnhancedPermissionRule, PermissionSource, PermissionRulesImportResult, PermissionRulesExportOptions, PermissionSystemConfig } from './PermissionTypes';
/**
 * 权限管理器配置
 */
export interface PermissionManagerConfig extends PermissionSystemConfig {
    /** 规则存储目录 */
    rulesDirectory?: string;
    /** 是否自动保存变更 */
    autoSave?: boolean;
    /** 自动保存延迟（毫秒） */
    autoSaveDelay?: number;
    /** 是否启用规则验证 */
    enableValidation?: boolean;
    /** 是否记录操作日志 */
    logOperations?: boolean;
}
/**
 * 规则变更事件
 */
export interface RuleChangeEvent {
    type: 'added' | 'updated' | 'removed' | 'imported' | 'exported';
    ruleId?: string;
    source?: PermissionSource;
    timestamp: Date;
    userId?: string;
}
/**
 * 权限管理器
 */
export declare class PermissionManager {
    private config;
    private rules;
    private ruleIndex;
    private autoSaveTimer;
    private changeListeners;
    constructor(config?: PermissionManagerConfig);
    /**
     * 初始化索引
     */
    private initializeIndex;
    /**
     * 添加规则
     */
    addRule(rule: EnhancedPermissionRule): boolean;
    /**
     * 更新规则
     */
    updateRule(ruleId: string, updates: Partial<EnhancedPermissionRule>): boolean;
    /**
     * 删除规则
     */
    removeRule(ruleId: string): boolean;
    /**
     * 获取规则
     */
    getRule(ruleId: string): EnhancedPermissionRule | undefined;
    /**
     * 获取规则列表
     */
    getRules(options?: {
        source?: PermissionSource;
        toolId?: string;
        action?: 'allow' | 'deny' | 'ask';
        enabled?: boolean;
    }): EnhancedPermissionRule[];
    /**
     * 根据来源获取规则
     */
    getRulesBySource(source: PermissionSource): EnhancedPermissionRule[];
    /**
     * 导入规则
     */
    importRules(rules: EnhancedPermissionRule[]): PermissionRulesImportResult;
    /**
     * 导出规则
     */
    exportRules(options?: PermissionRulesExportOptions): EnhancedPermissionRule[];
    /**
     * 保存到文件
     */
    saveToFile(filePath?: string): Promise<void>;
    /**
     * 从文件加载
     */
    loadFromFile(filePath?: string): Promise<void>;
    /**
     * 加载默认规则
     */
    private loadDefaultRules;
    /**
     * 获取默认规则
     */
    private getDefaultRules;
    /**
     * 加载所有规则（从配置目录）
     */
    private loadRules;
    /**
     * 验证规则
     */
    private validateRule;
    /**
     * 调度自动保存
     */
    private scheduleAutoSave;
    /**
     * 通知变更
     */
    private notifyChange;
    /**
     * 添加变更监听器
     */
    addChangeListener(listener: (event: RuleChangeEvent) => void): void;
    /**
     * 移除变更监听器
     */
    removeChangeListener(listener: (event: RuleChangeEvent) => void): void;
    /**
     * 获取统计信息
     */
    getStats(): {
        totalRules: number;
        bySource: Record<PermissionSource, number>;
        byAction: Record<string, number>;
        enabledRules: number;
    };
    /**
     * 清理资源
     */
    dispose(): void;
}
//# sourceMappingURL=PermissionManager.d.ts.map