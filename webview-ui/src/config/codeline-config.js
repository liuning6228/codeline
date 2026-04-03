"use strict";
/**
 * CodeLine 统一配置接口
 * 基于Claude Code的配置驱动对话引擎模式 (CP-20260401-001)
 * 支持Cline的8视图系统动态管理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
// ==================== 默认配置 ====================
exports.defaultConfig = {
    views: {
        chat: {
            enabled: true,
            showTaskSection: true,
            supportsFileUpload: true,
            supportsAtSyntax: true,
            autoSendDelay: 1000,
        },
        settings: {
            enabled: true,
            modules: {
                model: true,
                task: true,
                tools: true,
                ui: true,
                advanced: true,
            },
            supportsImportExport: true,
            showResetButton: true,
        },
        history: {
            enabled: true,
            maxHistoryItems: 100,
            supportsSearch: true,
            supportsBulkOperations: true,
            autoSaveHistory: true,
        },
        mcp: {
            enabled: true,
            maxConnections: 10,
            supportedProtocols: ['1.0', '1.1'],
            showToolList: true,
            allowDynamicLoading: true,
            defaultServers: [],
        },
        account: {
            enabled: true,
            supportsMultipleAccounts: true,
            authenticationMethods: ['api_key'],
            showUsageStats: true,
            supportsAccountSync: false,
        },
        worktrees: {
            enabled: true,
            maxSnapshots: 50,
            snapshotTypes: ['manual', 'auto'],
            showDiffView: true,
            autoSnapshotInterval: 0, // 禁用自动快照
        },
        welcome: {
            enabled: true,
            showOnStartup: true,
            welcomeMessage: 'Welcome to CodeLine! Your AI coding assistant.',
            quickActions: [
                {
                    label: 'Start Chat',
                    description: 'Begin a conversation with CodeLine',
                    view: 'chat',
                },
                {
                    label: 'View Settings',
                    description: 'Configure your preferences',
                    view: 'settings',
                },
                {
                    label: 'Check History',
                    description: 'View past conversations',
                    view: 'history',
                },
            ],
            showVersionInfo: true,
        },
        onboarding: {
            enabled: true,
            steps: [
                {
                    id: 'welcome',
                    title: 'Welcome to CodeLine',
                    description: 'Get started with your AI coding assistant',
                    required: true,
                },
                {
                    id: 'configure_ai',
                    title: 'Configure AI Model',
                    description: 'Set up your preferred AI model and API key',
                    required: false,
                },
                {
                    id: 'setup_tools',
                    title: 'Setup Tools',
                    description: 'Configure file, terminal, and browser tools',
                    required: false,
                },
                {
                    id: 'preferences',
                    title: 'Set Preferences',
                    description: 'Customize your CodeLine experience',
                    required: false,
                },
            ],
            allowSkip: true,
            autoStartOnFirstUse: true,
            defaultViewAfterOnboarding: 'chat',
        },
    },
    taskExecution: {
        autoExecute: true,
        requireApproval: false,
        maxConcurrentTasks: 1,
        taskTimeoutMs: 300000, // 5分钟
        enableEventStream: true,
        cancellable: true,
        defaultExecutionMode: 'auto',
        allowedToolTypes: ['file', 'terminal', 'browser', 'mcp', 'info'],
    },
    model: {
        provider: 'openai',
        modelName: 'gpt-4',
        maxTokens: 4000,
        temperature: 0.7,
        stream: true,
        contextWindow: 128000,
    },
    tools: {
        enabled: true,
        toolTypes: ['file', 'terminal', 'browser', 'mcp'],
        maxConcurrentTools: 3,
        enableSecurityChecks: true,
        defaultTools: [
            {
                name: 'File Operations',
                type: 'file',
                enabled: true,
                permissions: ['read', 'write'],
            },
            {
                name: 'Terminal',
                type: 'terminal',
                enabled: true,
                permissions: ['execute'],
            },
            {
                name: 'Browser',
                type: 'browser',
                enabled: true,
                permissions: ['navigate', 'click', 'type'],
            },
            {
                name: 'MCP Tools',
                type: 'mcp',
                enabled: true,
                permissions: ['invoke'],
            },
        ],
        allowedCustomToolPaths: [],
    },
    ui: {
        theme: 'dark',
        primaryColor: '#3b82f6', // blue-500
        fontSize: 'medium',
        compactMode: false,
        animations: {
            enabled: true,
            duration: 200,
            type: 'fade',
        },
        showVersion: true,
        version: '0.1.0',
    },
    metadata: {
        version: '1.0.0',
        lastModified: Date.now(),
        created: Date.now(),
        author: 'CodeLine Team',
    },
};
