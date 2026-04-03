/**
 * CodeLine 统一配置接口
 * 基于Claude Code的配置驱动对话引擎模式 (CP-20260401-001)
 * 支持Cline的8视图系统动态管理
 */

// ==================== 视图配置 ====================

export interface ChatViewConfig {
  /** 是否启用聊天视图 */
  enabled: boolean;
  /** 默认消息历史 */
  defaultMessages?: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  /** 是否显示任务区域 */
  showTaskSection: boolean;
  /** 是否支持文件上传 */
  supportsFileUpload: boolean;
  /** 是否支持@语法 */
  supportsAtSyntax: boolean;
  /** 自动发送消息延迟（毫秒） */
  autoSendDelay?: number;
}

export interface SettingsViewConfig {
  /** 是否启用设置视图 */
  enabled: boolean;
  /** 可配置的模块 */
  modules: {
    /** AI模型设置 */
    model: boolean;
    /** 任务执行设置 */
    task: boolean;
    /** 工具设置 */
    tools: boolean;
    /** UI设置 */
    ui: boolean;
    /** 高级设置 */
    advanced: boolean;
  };
  /** 是否支持配置导出/导入 */
  supportsImportExport: boolean;
  /** 是否显示重置按钮 */
  showResetButton: boolean;
}

export interface HistoryViewConfig {
  /** 是否启用历史视图 */
  enabled: boolean;
  /** 最大历史记录数量 */
  maxHistoryItems: number;
  /** 是否支持搜索 */
  supportsSearch: boolean;
  /** 是否支持批量操作 */
  supportsBulkOperations: boolean;
  /** 自动保存历史记录 */
  autoSaveHistory: boolean;
}

export interface McpViewConfig {
  /** 是否启用MCP视图 */
  enabled: boolean;
  /** 最大MCP连接数 */
  maxConnections: number;
  /** 支持的MCP协议版本 */
  supportedProtocols: string[];
  /** 是否显示MCP工具列表 */
  showToolList: boolean;
  /** 是否允许动态加载 */
  allowDynamicLoading: boolean;
  /** 默认MCP服务器配置 */
  defaultServers?: Array<{
    name: string;
    url: string;
    enabled: boolean;
  }>;
}

export interface AccountViewConfig {
  /** 是否启用账户视图 */
  enabled: boolean;
  /** 是否支持多账户 */
  supportsMultipleAccounts: boolean;
  /** 支持的认证方式 */
  authenticationMethods: Array<'api_key' | 'oauth' | 'local'>;
  /** 是否显示使用统计 */
  showUsageStats: boolean;
  /** 是否支持账户同步 */
  supportsAccountSync: boolean;
}

export interface WorktreesViewConfig {
  /** 是否启用工作区视图 */
  enabled: boolean;
  /** 最大工作区快照数量 */
  maxSnapshots: number;
  /** 支持的快照类型 */
  snapshotTypes: Array<'manual' | 'auto' | 'task'>;
  /** 是否显示差异比较 */
  showDiffView: boolean;
  /** 自动快照间隔（分钟，0表示禁用） */
  autoSnapshotInterval: number;
}

export interface WelcomeViewConfig {
  /** 是否启用欢迎视图 */
  enabled: boolean;
  /** 是否在启动时显示 */
  showOnStartup: boolean;
  /** 欢迎消息 */
  welcomeMessage: string;
  /** 快速操作按钮 */
  quickActions: Array<{
    label: string;
    description: string;
    view: string;
  }>;
  /** 是否显示版本信息 */
  showVersionInfo: boolean;
}

export interface OnboardingViewConfig {
  /** 是否启用引导视图 */
  enabled: boolean;
  /** 引导步骤配置 */
  steps: Array<{
    id: string;
    title: string;
    description: string;
    required: boolean;
    component?: string;
  }>;
  /** 是否支持跳过引导 */
  allowSkip: boolean;
  /** 自动启动引导（首次使用） */
  autoStartOnFirstUse: boolean;
  /** 引导完成后的默认视图 */
  defaultViewAfterOnboarding: string;
}

// ==================== 任务执行配置 ====================

export interface TaskExecutionConfig {
  /** 是否自动执行任务 */
  autoExecute: boolean;
  /** 是否需要用户批准 */
  requireApproval: boolean;
  /** 最大并行任务数 */
  maxConcurrentTasks: number;
  /** 任务超时时间（毫秒） */
  taskTimeoutMs: number;
  /** 是否启用事件流 */
  enableEventStream: boolean;
  /** 是否支持任务取消 */
  cancellable: boolean;
  /** 默认执行模式 */
  defaultExecutionMode: 'auto' | 'manual' | 'step_by_step';
  /** 允许的工具类型 */
  allowedToolTypes: Array<'file' | 'terminal' | 'browser' | 'mcp' | 'info'>;
}

// ==================== AI模型配置 ====================

export interface ModelConfig {
  /** 模型提供商 */
  provider: 'openai' | 'anthropic' | 'local' | 'custom';
  /** 模型名称 */
  modelName: string;
  /** API密钥（加密存储） */
  apiKey?: string;
  /** API基础URL */
  baseUrl?: string;
  /** 最大令牌数 */
  maxTokens: number;
  /** 温度设置 */
  temperature: number;
  /** 是否启用流式响应 */
  stream: boolean;
  /** 上下文窗口大小 */
  contextWindow: number;
  /** 自定义模型参数 */
  customParameters?: Record<string, any>;
}

// ==================== 工具系统配置 ====================

export interface ToolSystemConfig {
  /** 是否启用工具系统 */
  enabled: boolean;
  /** 支持的工具类型 */
  toolTypes: Array<'file' | 'terminal' | 'browser' | 'mcp' | 'custom'>;
  /** 最大同时运行的工具数 */
  maxConcurrentTools: number;
  /** 是否启用安全检查 */
  enableSecurityChecks: boolean;
  /** 默认工具配置 */
  defaultTools: Array<{
    name: string;
    type: string;
    enabled: boolean;
    permissions: string[];
  }>;
  /** 允许的自定义工具目录 */
  allowedCustomToolPaths: string[];
}

// ==================== UI主题配置 ====================

export interface UIConfig {
  /** 主题模式 */
  theme: 'light' | 'dark' | 'system';
  /** 主要颜色 */
  primaryColor: string;
  /** 字体大小 */
  fontSize: 'small' | 'medium' | 'large';
  /** 是否紧凑模式 */
  compactMode: boolean;
  /** 动画效果 */
  animations: {
    /** 是否启用动画 */
    enabled: boolean;
    /** 动画持续时间（毫秒） */
    duration: number;
    /** 动画类型 */
    type: 'fade' | 'slide' | 'scale';
  };
  /** 是否显示版本号 */
  showVersion: boolean;
  /** 版本号 */
  version: string;
  /** 自定义CSS类 */
  customClasses?: Record<string, string>;
}

// ==================== 主配置接口 ====================

export interface CodeLineConfig {
  /** 视图配置（支持Cline的8个视图） */
  views: {
    chat: ChatViewConfig;
    settings: SettingsViewConfig;
    history: HistoryViewConfig;
    mcp: McpViewConfig;
    account: AccountViewConfig;
    worktrees: WorktreesViewConfig;
    welcome: WelcomeViewConfig;
    onboarding: OnboardingViewConfig;
  };
  
  /** 任务执行配置 */
  taskExecution: TaskExecutionConfig;
  
  /** AI模型配置 */
  model: ModelConfig;
  
  /** 工具系统配置 */
  tools: ToolSystemConfig;
  
  /** UI主题配置 */
  ui: UIConfig;
  
  /** 元数据 */
  metadata?: {
    /** 配置版本 */
    version: string;
    /** 最后修改时间 */
    lastModified: number;
    /** 创建时间 */
    created: number;
    /** 作者 */
    author?: string;
  };
}

// ==================== 默认配置 ====================

export const defaultConfig: CodeLineConfig = {
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