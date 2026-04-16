/**
 * CollaborationEngine - 协作引擎
 *
 * 提供实时代码协作功能：
 * 1. 代码审查和评论
 * 2. 实时代码编辑建议
 * 3. 协作会话管理
 * 4. 变更冲突解决
 * 5. 权限和访问控制
 */
import { EventEmitter } from 'events';
import { FileEditorTool, EditOperation, CodeLocation } from './tools/FileEditorTool';
import { CodeAnalysisTool } from './tools/CodeAnalysisTool';
import { PerformanceMonitor } from './PerformanceMonitor';
/**
 * 协作用户
 */
export interface CollaborationUser {
    /** 用户ID */
    id: string;
    /** 用户名 */
    name: string;
    /** 用户邮箱 */
    email?: string;
    /** 用户角色 */
    role: 'owner' | 'admin' | 'editor' | 'reviewer' | 'viewer';
    /** 用户头像URL */
    avatarUrl?: string;
    /** 在线状态 */
    online: boolean;
    /** 最后活动时间 */
    lastActive: Date;
}
/**
 * 代码评论
 */
export interface CodeComment {
    /** 评论ID */
    id: string;
    /** 评论内容 */
    content: string;
    /** 评论位置 */
    location: CodeLocation & {
        filePath: string;
    };
    /** 评论作者 */
    author: CollaborationUser;
    /** 创建时间 */
    createdAt: Date;
    /** 更新时间 */
    updatedAt: Date;
    /** 是否已解决 */
    resolved: boolean;
    /** 解决时间 */
    resolvedAt?: Date;
    /** 解决者 */
    resolvedBy?: CollaborationUser;
    /** 回复 */
    replies: Array<{
        id: string;
        content: string;
        author: CollaborationUser;
        createdAt: Date;
    }>;
    /** 建议的编辑 */
    suggestedEdit?: {
        /** 编辑操作 */
        operation: EditOperation;
        /** 旧内容 */
        oldContent?: string;
        /** 新内容 */
        newContent?: string;
        /** 是否已应用 */
        applied: boolean;
        /** 应用时间 */
        appliedAt?: Date;
        /** 应用者 */
        appliedBy?: CollaborationUser;
    };
}
/**
 * 协作会话
 */
export interface CollaborationSession {
    /** 会话ID */
    id: string;
    /** 会话名称 */
    name: string;
    /** 会话描述 */
    description?: string;
    /** 项目路径 */
    projectPath: string;
    /** 会话所有者 */
    owner: CollaborationUser;
    /** 会话成员 */
    members: CollaborationUser[];
    /** 会话状态 */
    status: 'active' | 'paused' | 'archived' | 'completed';
    /** 创建时间 */
    createdAt: Date;
    /** 更新时间 */
    updatedAt: Date;
    /** 会话设置 */
    settings: {
        /** 是否允许匿名访问 */
        allowAnonymous: boolean;
        /** 是否允许实时编辑 */
        allowRealTimeEditing: boolean;
        /** 是否需要审核 */
        requireApproval: boolean;
        /** 评论通知设置 */
        commentNotifications: 'all' | 'mentions' | 'none';
        /** 编辑权限 */
        editPermissions: 'owners' | 'admins' | 'editors' | 'all';
        /** 评论权限 */
        commentPermissions: 'owners' | 'admins' | 'editors' | 'reviewers' | 'all';
    };
    /** 会话统计 */
    statistics: {
        /** 评论数量 */
        commentCount: number;
        /** 已解决的评论数量 */
        resolvedCommentCount: number;
        /** 建议的编辑数量 */
        suggestedEditCount: number;
        /** 已应用的编辑数量 */
        appliedEditCount: number;
        /** 活跃用户数量 */
        activeUserCount: number;
    };
}
/**
 * 实时编辑事件
 */
export interface RealTimeEditEvent {
    /** 事件类型 */
    type: 'edit' | 'cursor_move' | 'selection_change' | 'presence_update';
    /** 用户 */
    user: CollaborationUser;
    /** 时间戳 */
    timestamp: Date;
    /** 编辑数据 */
    data?: {
        /** 文件路径 */
        filePath: string;
        /** 编辑操作 */
        operation: EditOperation;
        /** 位置 */
        location?: CodeLocation;
        /** 旧内容 */
        oldContent?: string;
        /** 新内容 */
        newContent?: string;
    };
    /** 光标位置 */
    cursor?: {
        filePath: string;
        line: number;
        column: number;
    };
    /** 选择范围 */
    selection?: {
        filePath: string;
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
}
/**
 * 协作引擎配置
 */
export interface CollaborationEngineConfig {
    /** 数据存储路径 */
    dataStoragePath: string;
    /** 是否启用实时协作 */
    enableRealTimeCollaboration: boolean;
    /** 实时协作服务器URL */
    realTimeServerUrl?: string;
    /** 会话自动保存间隔（毫秒） */
    autoSaveInterval: number;
    /** 最大会话数量 */
    maxSessions: number;
    /** 最大评论数量（每个文件） */
    maxCommentsPerFile: number;
    /** 权限配置 */
    permissions: {
        /** 默认用户角色 */
        defaultUserRole: CollaborationUser['role'];
        /** 允许的角色 */
        allowedRoles: CollaborationUser['role'][];
        /** 角色权限映射 */
        rolePermissions: Record<CollaborationUser['role'], string[]>;
    };
    /** 性能监控配置 */
    performanceMonitoring: {
        /** 是否启用性能监控 */
        enabled: boolean;
        /** 监控间隔 */
        interval: number;
    };
}
/**
 * 协作引擎事件
 */
export type CollaborationEngineEvent = 'session_created' | 'session_updated' | 'session_deleted' | 'user_joined' | 'user_left' | 'comment_added' | 'comment_updated' | 'comment_resolved' | 'edit_suggested' | 'edit_applied' | 'real_time_edit' | 'cursor_moved' | 'error';
/**
 * 协作引擎
 */
export declare class CollaborationEngine extends EventEmitter {
    private config;
    private fileEditor;
    private codeAnalyzer;
    private performanceMonitor?;
    private workspaceRoot;
    private sessions;
    private comments;
    private users;
    private realTimeConnections;
    private activeSessions;
    private autoSaveTimer?;
    constructor(workspaceRoot: string, fileEditor: FileEditorTool, codeAnalyzer: CodeAnalysisTool, performanceMonitor?: PerformanceMonitor, config?: Partial<CollaborationEngineConfig>);
    /**
     * 创建协作会话
     */
    createSession(name: string, owner: CollaborationUser, options?: {
        description?: string;
        projectPath?: string;
        settings?: Partial<CollaborationSession['settings']>;
    }): Promise<CollaborationSession>;
    /**
     * 加入会话
     */
    joinSession(sessionId: string, user: CollaborationUser): Promise<CollaborationSession>;
    /**
     * 离开会话
     */
    leaveSession(sessionId: string, userId: string): Promise<void>;
    /**
     * 添加代码评论
     */
    addComment(sessionId: string, filePath: string, location: CodeLocation, content: string, author: CollaborationUser): Promise<CodeComment>;
    /**
     * 解决评论
     */
    resolveComment(sessionId: string, commentId: string, resolvedBy: CollaborationUser): Promise<CodeComment>;
    /**
     * 建议编辑
     */
    suggestEdit(sessionId: string, commentId: string, editOperation: EditOperation, suggestedBy: CollaborationUser, oldContent?: string, newContent?: string): Promise<CodeComment>;
    /**
     * 应用编辑建议
     */
    applyEdit(sessionId: string, commentId: string, appliedBy: CollaborationUser): Promise<{
        comment: CodeComment;
        editResult: any;
    }>;
    /**
     * 获取会话信息
     */
    getSession(sessionId: string): CollaborationSession | undefined;
    /**
     * 获取会话列表
     */
    getSessions(filter?: {
        status?: CollaborationSession['status'][];
        ownerId?: string;
        active?: boolean;
    }): CollaborationSession[];
    /**
     * 获取文件评论
     */
    getFileComments(filePath: string, filter?: {
        resolved?: boolean;
        authorId?: string;
    }): CodeComment[];
    /**
     * 获取会话统计
     */
    getSessionStatistics(sessionId: string): CollaborationSession['statistics'];
    /**
     * 关闭会话
     */
    closeSession(sessionId: string): Promise<void>;
    /**
     * 删除会话
     */
    deleteSession(sessionId: string, requestedBy: CollaborationUser): Promise<void>;
    /**
     * 保存协作数据
     */
    saveData(): Promise<void>;
    /**
     * 加载协作数据
     */
    loadData(): Promise<void>;
    /**
     * 销毁协作引擎
     */
    destroy(): Promise<void>;
    /**
     * 初始化数据存储
     */
    private initializeDataStorage;
    /**
     * 开始自动保存
     */
    private startAutoSave;
    /**
     * 停止自动保存
     */
    private stopAutoSave;
    /**
     * 生成会话ID
     */
    private generateSessionId;
    /**
     * 生成评论ID
     */
    private generateCommentId;
    /**
     * 查找评论
     */
    private findCommentById;
    /**
     * 检查权限
     */
    private checkPermission;
    /**
     * 计算活跃用户数量
     */
    private countActiveUsers;
    /**
     * 连接实时服务器
     */
    private connectToRealTimeServer;
    /**
     * 处理实时消息
     */
    private handleRealTimeMessage;
    /**
     * 发送实时消息
     */
    private sendRealTimeMessage;
}
/**
 * 创建协作引擎
 */
export declare function createCollaborationEngine(workspaceRoot: string, fileEditor: FileEditorTool, codeAnalyzer: CodeAnalysisTool, performanceMonitor?: PerformanceMonitor, config?: Partial<CollaborationEngineConfig>): CollaborationEngine;
export default CollaborationEngine;
//# sourceMappingURL=CollaborationEngine.d.ts.map