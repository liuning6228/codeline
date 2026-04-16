"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborationEngine = void 0;
exports.createCollaborationEngine = createCollaborationEngine;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const events_1 = require("events");
/**
 * 协作引擎
 */
class CollaborationEngine extends events_1.EventEmitter {
    config;
    fileEditor;
    codeAnalyzer;
    performanceMonitor;
    workspaceRoot;
    // 数据存储
    sessions = new Map();
    comments = new Map(); // filePath -> comments
    users = new Map();
    // 实时协作状态
    realTimeConnections = new Map();
    activeSessions = new Set();
    // 自动保存定时器
    autoSaveTimer;
    constructor(workspaceRoot, fileEditor, codeAnalyzer, performanceMonitor, config) {
        super();
        this.workspaceRoot = workspaceRoot;
        this.fileEditor = fileEditor;
        this.codeAnalyzer = codeAnalyzer;
        this.performanceMonitor = performanceMonitor;
        this.config = {
            dataStoragePath: path.join(workspaceRoot, '.collaboration-data'),
            enableRealTimeCollaboration: false,
            autoSaveInterval: 30000, // 30秒
            maxSessions: 100,
            maxCommentsPerFile: 1000,
            permissions: {
                defaultUserRole: 'viewer',
                allowedRoles: ['owner', 'admin', 'editor', 'reviewer', 'viewer'],
                rolePermissions: {
                    owner: ['create_session', 'delete_session', 'invite_users', 'edit_settings', 'edit_code', 'add_comments', 'resolve_comments', 'apply_edits'],
                    admin: ['invite_users', 'edit_settings', 'edit_code', 'add_comments', 'resolve_comments', 'apply_edits'],
                    editor: ['edit_code', 'add_comments', 'resolve_comments'],
                    reviewer: ['add_comments', 'resolve_comments'],
                    viewer: ['view_code', 'view_comments'],
                },
            },
            performanceMonitoring: {
                enabled: true,
                interval: 5000,
            },
            ...config,
        };
        // 初始化数据存储
        this.initializeDataStorage();
        // 启动自动保存
        this.startAutoSave();
        console.log('🚀 Collaboration Engine initialized');
    }
    /**
     * 创建协作会话
     */
    async createSession(name, owner, options = {}) {
        const sessionId = this.generateSessionId();
        const projectPath = options.projectPath || this.workspaceRoot;
        // 验证项目路径
        if (!fs.existsSync(projectPath)) {
            throw new Error(`Project path does not exist: ${projectPath}`);
        }
        // 创建会话
        const session = {
            id: sessionId,
            name,
            description: options.description,
            projectPath,
            owner,
            members: [owner],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
                allowAnonymous: false,
                allowRealTimeEditing: false,
                requireApproval: true,
                commentNotifications: 'mentions',
                editPermissions: 'editors',
                commentPermissions: 'reviewers',
                ...options.settings,
            },
            statistics: {
                commentCount: 0,
                resolvedCommentCount: 0,
                suggestedEditCount: 0,
                appliedEditCount: 0,
                activeUserCount: 1,
            },
        };
        // 保存会话
        this.sessions.set(sessionId, session);
        this.users.set(owner.id, owner);
        // 标记为活跃会话
        this.activeSessions.add(sessionId);
        // 发出事件
        this.emit('session_created', session);
        console.log(`✅ Session created: ${name} (${sessionId})`);
        return session;
    }
    /**
     * 加入会话
     */
    async joinSession(sessionId, user) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // 检查用户是否已经是成员
        const existingMember = session.members.find(m => m.id === user.id);
        if (!existingMember) {
            // 添加用户到会话
            session.members.push(user);
            session.updatedAt = new Date();
            session.statistics.activeUserCount = this.countActiveUsers(sessionId);
            // 保存用户
            this.users.set(user.id, user);
        }
        else {
            // 更新用户状态
            existingMember.online = true;
            existingMember.lastActive = new Date();
        }
        // 发出事件
        this.emit('user_joined', { session, user });
        console.log(`✅ User joined: ${user.name} -> ${session.name}`);
        return session;
    }
    /**
     * 离开会话
     */
    async leaveSession(sessionId, userId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // 更新用户状态
        const user = session.members.find(m => m.id === userId);
        if (user) {
            user.online = false;
            user.lastActive = new Date();
            session.updatedAt = new Date();
            session.statistics.activeUserCount = this.countActiveUsers(sessionId);
            // 发出事件
            this.emit('user_left', { session, user });
            console.log(`✅ User left: ${user.name} <- ${session.name}`);
        }
    }
    /**
     * 添加代码评论
     */
    async addComment(sessionId, filePath, location, content, author) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // 验证文件路径
        const fullPath = path.join(session.projectPath, filePath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        // 验证用户权限
        this.checkPermission(session, author, 'add_comments');
        // 创建评论
        const comment = {
            id: this.generateCommentId(),
            content,
            location: { ...location, filePath },
            author,
            createdAt: new Date(),
            updatedAt: new Date(),
            resolved: false,
            replies: [],
        };
        // 保存评论
        const fileComments = this.comments.get(filePath) || [];
        fileComments.push(comment);
        this.comments.set(filePath, fileComments);
        // 更新会话统计
        session.statistics.commentCount++;
        session.updatedAt = new Date();
        // 发出事件
        this.emit('comment_added', { session, comment });
        // 记录性能指标
        if (this.performanceMonitor) {
            this.performanceMonitor.recordToolExecution('add_comment', 0, true);
        }
        console.log(`✅ Comment added: ${content.substring(0, 50)}...`);
        return comment;
    }
    /**
     * 解决评论
     */
    async resolveComment(sessionId, commentId, resolvedBy) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // 查找评论
        const comment = this.findCommentById(commentId);
        if (!comment) {
            throw new Error(`Comment not found: ${commentId}`);
        }
        // 验证用户权限
        this.checkPermission(session, resolvedBy, 'resolve_comments');
        // 更新评论
        comment.resolved = true;
        comment.resolvedAt = new Date();
        comment.resolvedBy = resolvedBy;
        comment.updatedAt = new Date();
        // 更新会话统计
        session.statistics.resolvedCommentCount++;
        session.updatedAt = new Date();
        // 发出事件
        this.emit('comment_resolved', { session, comment });
        console.log(`✅ Comment resolved: ${commentId}`);
        return comment;
    }
    /**
     * 建议编辑
     */
    async suggestEdit(sessionId, commentId, editOperation, suggestedBy, oldContent, newContent) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // 查找评论
        const comment = this.findCommentById(commentId);
        if (!comment) {
            throw new Error(`Comment not found: ${commentId}`);
        }
        // 验证用户权限
        this.checkPermission(session, suggestedBy, 'add_comments');
        // 添加建议的编辑
        comment.suggestedEdit = {
            operation: editOperation,
            oldContent,
            newContent,
            applied: false,
        };
        comment.updatedAt = new Date();
        // 更新会话统计
        session.statistics.suggestedEditCount++;
        session.updatedAt = new Date();
        // 发出事件
        this.emit('edit_suggested', { session, comment });
        console.log(`✅ Edit suggested for comment: ${commentId}`);
        return comment;
    }
    /**
     * 应用编辑建议
     */
    async applyEdit(sessionId, commentId, appliedBy) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // 查找评论
        const comment = this.findCommentById(commentId);
        if (!comment) {
            throw new Error(`Comment not found: ${commentId}`);
        }
        if (!comment.suggestedEdit) {
            throw new Error(`No suggested edit for comment: ${commentId}`);
        }
        // 验证用户权限
        this.checkPermission(session, appliedBy, 'apply_edits');
        // 应用编辑
        const fullPath = path.join(session.projectPath, comment.location.filePath);
        let editResult;
        try {
            // 创建简化的工具上下文
            const toolContext = {
                workspaceRoot: session.projectPath,
                workspaceFolders: undefined,
                extensionContext: undefined,
                outputChannel: undefined,
                abortController: new AbortController(),
                permissionContext: {
                    mode: 'default',
                    alwaysAllowRules: {},
                    alwaysDenyRules: {},
                    alwaysAskRules: {},
                    isBypassPermissionsModeAvailable: false,
                },
                showInformationMessage: () => Promise.resolve(undefined),
                showWarningMessage: () => Promise.resolve(undefined),
                showErrorMessage: () => Promise.resolve(undefined),
                readFile: async (path) => {
                    return await fs.promises.readFile(path, 'utf-8');
                },
                writeFile: async (path, content) => {
                    await fs.promises.writeFile(path, content, 'utf-8');
                },
                fileExists: async (path) => {
                    try {
                        await fs.promises.access(path);
                        return true;
                    }
                    catch {
                        return false;
                    }
                },
            };
            // 使用FileEditorTool应用编辑
            // 注意：FileEditorTool只支持单次操作，我们取第一个操作
            const editOperation = comment.suggestedEdit.operation; // 转换为EditOperation
            editResult = await this.fileEditor.execute({
                filePath: fullPath,
                operation: editOperation,
                location: {
                    lineStart: comment.location.lineStart,
                    lineEnd: comment.location.lineEnd,
                    columnStart: comment.location.columnStart,
                    columnEnd: comment.location.columnEnd,
                },
                oldCode: comment.suggestedEdit.oldContent,
                newCode: comment.suggestedEdit.newContent,
                createBackup: true,
                validateSyntax: true,
            }, toolContext);
        }
        catch (error) {
            throw new Error(`Failed to apply edit: ${error.message}`);
        }
        // 更新评论
        comment.suggestedEdit.applied = true;
        comment.suggestedEdit.appliedAt = new Date();
        comment.suggestedEdit.appliedBy = appliedBy;
        comment.updatedAt = new Date();
        // 更新会话统计
        session.statistics.appliedEditCount++;
        session.updatedAt = new Date();
        // 发出事件
        this.emit('edit_applied', { session, comment, editResult });
        console.log(`✅ Edit applied for comment: ${commentId}`);
        return { comment, editResult };
    }
    /**
     * 获取会话信息
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    /**
     * 获取会话列表
     */
    getSessions(filter) {
        let sessions = Array.from(this.sessions.values());
        if (filter) {
            if (filter.status) {
                sessions = sessions.filter(s => filter.status.includes(s.status));
            }
            if (filter.ownerId) {
                sessions = sessions.filter(s => s.owner.id === filter.ownerId);
            }
            if (filter.active) {
                sessions = sessions.filter(s => this.activeSessions.has(s.id));
            }
        }
        return sessions;
    }
    /**
     * 获取文件评论
     */
    getFileComments(filePath, filter) {
        const comments = this.comments.get(filePath) || [];
        if (filter) {
            return comments.filter(comment => {
                if (filter.resolved !== undefined && comment.resolved !== filter.resolved) {
                    return false;
                }
                if (filter.authorId && comment.author.id !== filter.authorId) {
                    return false;
                }
                return true;
            });
        }
        return comments;
    }
    /**
     * 获取会话统计
     */
    getSessionStatistics(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        return { ...session.statistics };
    }
    /**
     * 关闭会话
     */
    async closeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // 更新会话状态
        session.status = 'completed';
        session.updatedAt = new Date();
        // 移除活跃会话
        this.activeSessions.delete(sessionId);
        // 发出事件
        this.emit('session_updated', session);
        console.log(`✅ Session closed: ${session.name} (${sessionId})`);
    }
    /**
     * 删除会话
     */
    async deleteSession(sessionId, requestedBy) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // 验证权限（只有所有者可以删除）
        if (session.owner.id !== requestedBy.id && requestedBy.role !== 'owner') {
            throw new Error('Only session owner can delete the session');
        }
        // 删除会话
        this.sessions.delete(sessionId);
        this.activeSessions.delete(sessionId);
        // 发出事件
        this.emit('session_deleted', session);
        console.log(`🗑️  Session deleted: ${session.name} (${sessionId})`);
    }
    /**
     * 保存协作数据
     */
    async saveData() {
        const dataPath = this.config.dataStoragePath;
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
        }
        const data = {
            sessions: Array.from(this.sessions.entries()),
            comments: Array.from(this.comments.entries()),
            users: Array.from(this.users.entries()),
            activeSessions: Array.from(this.activeSessions),
            timestamp: new Date().toISOString(),
        };
        const filePath = path.join(dataPath, 'collaboration-data.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`💾 Collaboration data saved: ${filePath}`);
    }
    /**
     * 加载协作数据
     */
    async loadData() {
        const filePath = path.join(this.config.dataStoragePath, 'collaboration-data.json');
        if (!fs.existsSync(filePath)) {
            console.log('No existing collaboration data found');
            return;
        }
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            // 加载数据
            this.sessions = new Map(data.sessions);
            this.comments = new Map(data.comments);
            this.users = new Map(data.users);
            this.activeSessions = new Set(data.activeSessions);
            console.log(`📂 Collaboration data loaded: ${filePath}`);
            console.log(`   Sessions: ${this.sessions.size}, Comments: ${this.comments.size}, Users: ${this.users.size}`);
        }
        catch (error) {
            console.error(`Failed to load collaboration data: ${error.message}`);
        }
    }
    /**
     * 销毁协作引擎
     */
    async destroy() {
        // 停止自动保存
        this.stopAutoSave();
        // 保存数据
        await this.saveData();
        // 关闭所有实时连接
        this.realTimeConnections.forEach((ws, sessionId) => {
            ws.close();
        });
        this.realTimeConnections.clear();
        // 清空数据
        this.sessions.clear();
        this.comments.clear();
        this.users.clear();
        this.activeSessions.clear();
        // 移除所有事件监听器
        this.removeAllListeners();
        console.log('🛑 Collaboration Engine destroyed');
    }
    // ==================== 私有方法 ====================
    /**
     * 初始化数据存储
     */
    initializeDataStorage() {
        const dataPath = this.config.dataStoragePath;
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
            console.log(`📁 Created collaboration data directory: ${dataPath}`);
        }
        // 加载现有数据
        this.loadData().catch(console.error);
    }
    /**
     * 开始自动保存
     */
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        this.autoSaveTimer = setInterval(() => {
            this.saveData().catch(error => {
                console.error(`Auto-save failed: ${error.message}`);
            });
        }, this.config.autoSaveInterval);
        console.log(`🔄 Auto-save enabled (every ${this.config.autoSaveInterval}ms)`);
    }
    /**
     * 停止自动保存
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = undefined;
        }
    }
    /**
     * 生成会话ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 生成评论ID
     */
    generateCommentId() {
        return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 查找评论
     */
    findCommentById(commentId) {
        for (const comments of this.comments.values()) {
            const comment = comments.find(c => c.id === commentId);
            if (comment)
                return comment;
        }
        return undefined;
    }
    /**
     * 检查权限
     */
    checkPermission(session, user, permission) {
        const userRole = user.role;
        const allowedPermissions = this.config.permissions.rolePermissions[userRole] || [];
        // 会话所有者有所有权限
        if (session.owner.id === user.id) {
            return;
        }
        // 检查权限
        if (!allowedPermissions.includes(permission)) {
            throw new Error(`User ${user.name} (${userRole}) does not have permission: ${permission}`);
        }
        // 检查会话特定权限
        if (permission === 'edit_code' && session.settings.editPermissions !== 'all') {
            const allowedRoles = session.settings.editPermissions;
            if (allowedRoles === 'owners' && userRole !== 'owner') {
                throw new Error('Only owners can edit code in this session');
            }
            else if (allowedRoles === 'admins' && !['owner', 'admin'].includes(userRole)) {
                throw new Error('Only admins and owners can edit code in this session');
            }
            else if (allowedRoles === 'editors' && !['owner', 'admin', 'editor'].includes(userRole)) {
                throw new Error('Only editors, admins and owners can edit code in this session');
            }
        }
        if (permission === 'add_comments' && session.settings.commentPermissions !== 'all') {
            const allowedRoles = session.settings.commentPermissions;
            if (allowedRoles === 'owners' && userRole !== 'owner') {
                throw new Error('Only owners can add comments in this session');
            }
            else if (allowedRoles === 'admins' && !['owner', 'admin'].includes(userRole)) {
                throw new Error('Only admins and owners can add comments in this session');
            }
            else if (allowedRoles === 'editors' && !['owner', 'admin', 'editor'].includes(userRole)) {
                throw new Error('Only editors, admins and owners can add comments in this session');
            }
            else if (allowedRoles === 'reviewers' && !['owner', 'admin', 'editor', 'reviewer'].includes(userRole)) {
                throw new Error('Only reviewers, editors, admins and owners can add comments in this session');
            }
        }
    }
    /**
     * 计算活跃用户数量
     */
    countActiveUsers(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return 0;
        return session.members.filter(member => member.online).length;
    }
    /**
     * 连接实时服务器
     */
    async connectToRealTimeServer(sessionId) {
        if (!this.config.realTimeServerUrl) {
            throw new Error('Real-time server URL not configured');
        }
        const ws = new WebSocket(`${this.config.realTimeServerUrl}/session/${sessionId}`);
        ws.onopen = () => {
            console.log(`🔗 Connected to real-time server for session: ${sessionId}`);
            this.realTimeConnections.set(sessionId, ws);
        };
        ws.onclose = () => {
            console.log(`🔌 Disconnected from real-time server for session: ${sessionId}`);
            this.realTimeConnections.delete(sessionId);
        };
        ws.onerror = (error) => {
            console.error(`❌ Real-time connection error for session ${sessionId}:`, error);
            this.emit('error', error);
        };
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleRealTimeMessage(sessionId, data);
            }
            catch (error) {
                console.error('Failed to parse real-time message:', error);
            }
        };
        return ws;
    }
    /**
     * 处理实时消息
     */
    handleRealTimeMessage(sessionId, message) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        switch (message.type) {
            case 'edit':
                this.emit('real_time_edit', {
                    session,
                    edit: message.data,
                    timestamp: new Date(),
                });
                break;
            case 'cursor_move':
                this.emit('cursor_moved', {
                    session,
                    cursor: message.data,
                    timestamp: new Date(),
                });
                break;
            case 'presence_update':
                // 更新用户在线状态
                if (message.data.userId && message.data.online !== undefined) {
                    const user = session.members.find(m => m.id === message.data.userId);
                    if (user) {
                        user.online = message.data.online;
                        user.lastActive = new Date();
                    }
                }
                break;
        }
    }
    /**
     * 发送实时消息
     */
    sendRealTimeMessage(sessionId, message) {
        const ws = this.realTimeConnections.get(sessionId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
}
exports.CollaborationEngine = CollaborationEngine;
/**
 * 创建协作引擎
 */
function createCollaborationEngine(workspaceRoot, fileEditor, codeAnalyzer, performanceMonitor, config) {
    return new CollaborationEngine(workspaceRoot, fileEditor, codeAnalyzer, performanceMonitor, config);
}
exports.default = CollaborationEngine;
//# sourceMappingURL=CollaborationEngine.js.map