import * as vscode from 'vscode';
import { CodeLineExtension } from '../extension';
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isExternal?: boolean;
}
export declare class CodeLineChatPanel {
    static currentPanel: CodeLineChatPanel | undefined;
    private readonly panel;
    private readonly extension;
    private readonly context;
    private messages;
    private isProcessing;
    private currentView;
    private toolProgressService;
    private configManager;
    private permissionManager;
    private autoApprovalSettings;
    static createOrShow(context: vscode.ExtensionContext, extension: CodeLineExtension): void;
    private constructor();
    /**
     * 从存储加载自动批准设置
     */
    private loadAutoApprovalSettings;
    show(): Promise<void>;
    private handleWebviewMessage;
    private handleSaveSettings;
    private handleTestConnection;
    private handleResetSettings;
    private handleApproveDiff;
    /**
     * 添加助手消息到聊天
     */
    private addAssistantMessage;
    /**
     * 格式化文件命令结果为可读消息
     */
    private formatFileCommandResult;
    /**
     * 格式化文件大小（B, KB, MB, GB）
     */
    private formatFileSize;
    private handleUserMessage;
    private handleTaskExecution;
    private handleEditMessage;
    private handleRegenerateMessage;
    private handleFileCommand;
    private sendMessageToWebview;
    private updateWebview;
    private getWebviewContent;
    private escapeHtml;
    private handleSignOut;
    private handleUpgradeAccount;
    private handleAddMCP;
    /**
     * 处理流式任务执行请求
     */
    private handleTaskExecutionWithStream;
    /**
     * 处理从extension转发过来的任务事件
     * 用于扩展的事件转发机制
     */
    private handleTaskEvent;
    /**
     * 处理加载自动批准设置请求
     */
    private handleLoadAutoApproveSettings;
    /**
     * 处理更新自动批准设置请求
     */
    private handleUpdateAutoApproveSettings;
    /**
     * 处理加载配置请求
     */
    private handleLoadConfig;
    /**
     * 处理保存配置请求
     */
    private handleSaveConfig;
    private dispose;
}
//# sourceMappingURL=chatPanel.d.ts.map