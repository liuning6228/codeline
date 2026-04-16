/**
 * CollaborationExample - 协作功能演示
 *
 * 演示如何使用CollaborationEngine进行代码协作和审查
 */
/**
 * 协作演示结果
 */
export interface CollaborationDemoResult {
    /** 演示名称 */
    demoName: string;
    /** 是否成功 */
    success: boolean;
    /** 演示步骤 */
    steps: Array<{
        /** 步骤名称 */
        name: string;
        /** 描述 */
        description: string;
        /** 是否通过 */
        passed: boolean;
        /** 详细信息 */
        details?: any;
    }>;
    /** 协作统计 */
    collaborationStats?: {
        /** 会话数量 */
        sessionCount: number;
        /** 用户数量 */
        userCount: number;
        /** 评论数量 */
        commentCount: number;
        /** 已解决的评论数量 */
        resolvedCommentCount: number;
        /** 建议的编辑数量 */
        suggestedEditCount: number;
        /** 已应用的编辑数量 */
        appliedEditCount: number;
    };
    /** 性能报告 */
    performanceReport?: any;
    /** 建议 */
    suggestions: string[];
}
/**
 * 协作功能演示
 */
export declare class CollaborationExample {
    private workspaceRoot;
    private testFilesDir;
    constructor(workspaceRoot: string);
    /**
     * 运行所有演示
     */
    runAllDemos(): Promise<CollaborationDemoResult[]>;
    /**
     * 演示1: 设置和初始化
     */
    private demoSetup;
    /**
     * 演示2: 会话管理
     */
    private demoSessionManagement;
    /**
     * 演示3: 代码审查
     */
    private demoCodeReview;
    /**
     * 演示4: 编辑建议
     */
    private demoEditSuggestions;
    /**
     * 演示5: 权限系统
     */
    private demoPermissions;
    /**
     * 演示6: 数据持久化
     */
    private demoDataPersistence;
    /**
     * 演示7: 与现有工具集成
     */
    private demoIntegrationWithTools;
    /**
     * 创建测试用户
     */
    private createTestUsers;
    /**
     * 创建测试文件
     */
    private createTestFiles;
    /**
     * 清理测试文件
     */
    private cleanup;
    /**
     * 生成总结报告
     */
    private generateSummaryReport;
    /**
     * 收集所有建议
     */
    private collectAllSuggestions;
    /**
     * 生成下一步建议
     */
    private generateNextSteps;
}
/**
 * 运行协作演示
 */
export declare function runCollaborationDemos(workspaceRoot?: string): Promise<void>;
export default CollaborationExample;
//# sourceMappingURL=CollaborationExample.d.ts.map