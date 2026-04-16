/**
 * MCP响应类型定义
 * 从MCPHandler.ts提取以支持独立导入
 */
export interface MCPResponse {
    /** 是否成功 */
    success: boolean;
    /** 响应数据（可选） */
    data?: any;
    /** 错误信息（可选） */
    error?: string;
    /** 消息ID（可选） */
    messageId?: string;
    /** 时间戳（可选） */
    timestamp?: number;
    /** 处理时长（毫秒，可选） */
    duration?: number;
    /** 性能指标（可选） */
    metrics?: {
        /** 工具执行时间（毫秒） */
        toolExecutionTime?: number;
        /** 验证时间（毫秒） */
        validationTime?: number;
        /** 权限检查时间（毫秒） */
        permissionCheckTime?: number;
    };
}
//# sourceMappingURL=MCPResponse.d.ts.map