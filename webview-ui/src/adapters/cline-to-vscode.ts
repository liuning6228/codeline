/**
 * Cline GRPC服务到VS Code API适配器
 * 
 * 这个适配器将Cline的GRPC客户端调用转换为VS Code的postMessage API调用
 * 遵循CLINE_UI_CLAUDE_CORE_PLAN.md中的架构设计
 */

// 声明VS Code API类型
declare const acquireVsCodeApi: () => {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
};

// 获取VS Code API实例
let vscode: ReturnType<typeof acquireVsCodeApi> | null = null;

/**
 * 获取VS Code API实例
 */
function getVscode() {
  if (!vscode && typeof acquireVsCodeApi === 'function') {
    vscode = acquireVsCodeApi();
  }
  return vscode;
}

/**
 * 通用适配函数：发送消息到VS Code扩展
 */
async function sendToVscode<T = any>(command: string, data?: any): Promise<T> {
  const vs = getVscode();
  if (!vs) {
    throw new Error('VS Code API not available');
  }
  
  return new Promise((resolve, reject) => {
    // 创建唯一ID用于响应匹配
    const messageId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // 设置消息处理器（临时）
    const messageHandler = (event: MessageEvent) => {
      const response = event.data;
      if (response.messageId === messageId) {
        window.removeEventListener('message', messageHandler);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data);
        }
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // 发送消息
    vs.postMessage({
      command,
      data,
      messageId,
    });
    
    // 设置超时
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      reject(new Error(`VS Code command '${command}' timed out`));
    }, 30000); // 30秒超时
  });
}

// ------------------------------------------------------------
// 文件操作适配器（Cline FileServiceClient → VS Code API）
// ------------------------------------------------------------

export interface FileServiceAdapter {
  openFileRelativePath(path: string): Promise<void>;
  selectFiles(supportsImages: boolean): Promise<{images: string[], files: string[]}>;
  copyToClipboard(text: string): Promise<void>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  listFiles(path?: string): Promise<string[]>;
}

/**
 * 文件服务适配器实现
 */
export const fileServiceAdapter: FileServiceAdapter = {
  async openFileRelativePath(path: string): Promise<void> {
    return sendToVscode('file.openRelativePath', { path });
  },

  async selectFiles(supportsImages: boolean): Promise<{images: string[], files: string[]}> {
    return sendToVscode('file.selectFiles', { supportsImages });
  },

  async copyToClipboard(text: string): Promise<void> {
    return sendToVscode('file.copyToClipboard', { text });
  },

  async readFile(path: string): Promise<string> {
    const result = await sendToVscode<{ content: string }>('file.read', { path });
    return result.content;
  },

  async writeFile(path: string, content: string): Promise<void> {
    return sendToVscode('file.write', { path, content });
  },

  async listFiles(path?: string): Promise<string[]> {
    const result = await sendToVscode<{ files: string[] }>('file.list', { path });
    return result.files;
  },
};

// ------------------------------------------------------------
// 工具执行适配器（UI → Claude Code工具系统）
// ------------------------------------------------------------

export interface ToolResult {
  success: boolean;
  output?: string;
  files?: Array<{ path: string; content: string }>;
  error?: string;
  executionId: string;
}

export interface ToolProgress {
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
  isIndeterminate?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  category?: string;
  parameters?: Record<string, any>;
}

export interface ToolServiceAdapter {
  executeTool(toolName: string, params: any): Promise<ToolResult>;
  streamProgress(callback: (progress: ToolProgress) => void): void;
  cancelTool(executionId: string): Promise<void>;
  getToolList(): Promise<ToolDefinition[]>;
}

/**
 * 工具服务适配器实现
 */
export class ToolServiceAdapterImpl implements ToolServiceAdapter {
  private progressCallbacks: Array<(progress: ToolProgress) => void> = [];
  
  async executeTool(toolName: string, params: any): Promise<ToolResult> {
    return sendToVscode<ToolResult>('tool.execute', { toolName, params });
  }

  streamProgress(callback: (progress: ToolProgress) => void): void {
    this.progressCallbacks.push(callback);
    
    // 监听VS Code的进度消息
    window.addEventListener('message', (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'tool.progress') {
        this.progressCallbacks.forEach(cb => cb(message.data));
      }
    });
  }

  async cancelTool(executionId: string): Promise<void> {
    return sendToVscode('tool.cancel', { executionId });
  }

  async getToolList(): Promise<ToolDefinition[]> {
    return sendToVscode<ToolDefinition[]>('tool.list');
  }
}

export const toolServiceAdapter = new ToolServiceAdapterImpl();

// ------------------------------------------------------------
// UI服务适配器
// ------------------------------------------------------------

export interface ShowWebviewEvent {
  view: 'chat' | 'mcp' | 'history' | 'settings' | 'account';
  data?: any;
}

export interface AddToInputEvent {
  text: string;
}

export interface UiServiceAdapter {
  subscribeToShowWebview(callback: (event: ShowWebviewEvent) => void): () => void;
  subscribeToAddToInput(callback: (event: AddToInputEvent) => void): () => void;
  showAnnouncement(): Promise<void>;
  navigateTo(view: 'chat' | 'mcp' | 'history' | 'settings' | 'account', data?: any): Promise<void>;
  clearTask(): Promise<void>;
}

/**
 * UI服务适配器实现
 */
export class UiServiceAdapterImpl implements UiServiceAdapter {
  private showWebviewCallbacks: Array<(event: ShowWebviewEvent) => void> = [];
  private addToInputCallbacks: Array<(event: AddToInputEvent) => void> = [];

  constructor() {
    // 设置消息监听器
    window.addEventListener('message', (event: MessageEvent) => {
      const message = event.data;
      
      if (message.command === 'ui.showWebview') {
        this.showWebviewCallbacks.forEach(cb => cb(message.data));
      } else if (message.command === 'ui.addToInput') {
        this.addToInputCallbacks.forEach(cb => cb(message.data));
      }
    });
  }

  subscribeToShowWebview(callback: (event: ShowWebviewEvent) => void): () => void {
    this.showWebviewCallbacks.push(callback);
    return () => {
      const index = this.showWebviewCallbacks.indexOf(callback);
      if (index > -1) {
        this.showWebviewCallbacks.splice(index, 1);
      }
    };
  }

  subscribeToAddToInput(callback: (event: AddToInputEvent) => void): () => void {
    this.addToInputCallbacks.push(callback);
    return () => {
      const index = this.addToInputCallbacks.indexOf(callback);
      if (index > -1) {
        this.addToInputCallbacks.splice(index, 1);
      }
    };
  }

  async showAnnouncement(): Promise<void> {
    return sendToVscode('ui.showAnnouncement');
  }

  async navigateTo(view: 'chat' | 'mcp' | 'history' | 'settings' | 'account', data?: any): Promise<void> {
    return sendToVscode('ui.navigate', { view, data });
  }

  async clearTask(): Promise<void> {
    return sendToVscode('clearTask');
  }
}

export const uiServiceAdapter = new UiServiceAdapterImpl();

// ------------------------------------------------------------
// GRPC客户端适配器包装器
// ------------------------------------------------------------

/**
 * TaskServiceClient适配器 - 替换原始的GRPC TaskServiceClient
 */
export class AdaptedTaskServiceClient {
  static async clearTask(request: any = {}): Promise<any> {
    await uiServiceAdapter.clearTask();
    return {};
  }

  static async newTask(request: any): Promise<any> {
    return sendToVscode('task.new', request);
  }

  static async askResponse(request: any): Promise<any> {
    return sendToVscode('task.askResponse', request);
  }

  static async cancelTask(request: any): Promise<any> {
    return sendToVscode('task.cancel', request);
  }

  static async deleteTask(request: any): Promise<any> {
    return sendToVscode('task.delete', request);
  }

  static async getTaskStatus(request: any): Promise<any> {
    return sendToVscode<{ status: string }>('task.status', request);
  }
}

/**
 * FileServiceClient适配器 - 替换原始的GRPC FileServiceClient
 */
export class AdaptedFileServiceClient {
  static async readFile(request: { path: string }): Promise<{ content: string }> {
    const content = await fileServiceAdapter.readFile(request.path);
    return { content };
  }

  static async writeFile(request: { path: string; content: string }): Promise<{ success: boolean }> {
    await fileServiceAdapter.writeFile(request.path, request.content);
    return { success: true };
  }

  static async listFiles(request: { path?: string }): Promise<{ files: string[] }> {
    const files = await fileServiceAdapter.listFiles(request.path);
    return { files };
  }

  static async openFileRelativePath(request: { path: string }): Promise<any> {
    await fileServiceAdapter.openFileRelativePath(request.path);
    return {};
  }

  static async selectFiles(request: { supportsImages: boolean }): Promise<{ images: string[], files: string[] }> {
    return fileServiceAdapter.selectFiles(request.supportsImages);
  }

  static async copyToClipboard(request: { text: string }): Promise<any> {
    await fileServiceAdapter.copyToClipboard(request.text);
    return {};
  }
}

/**
 * 导出适配后的GRPC客户端，用于替换原始实现
 * 注意：完整导出在文件末尾，这里只保留注释
 */
// GrpcAdapters的完整导出在文件末尾

// ------------------------------------------------------------
// UiServiceClient适配器 - 替换原始的GRPC UiServiceClient
// ------------------------------------------------------------

export class AdaptedUiServiceClient {
  static async onDidShowAnnouncement(request: any): Promise<{value: boolean}> {
    await uiServiceAdapter.showAnnouncement();
    return {value: true};
  }

  static subscribeToShowWebview(
    request: any,
    callbacks: {
      onResponse: (event: any) => void;
      onError?: (error: Error) => void;
      onComplete?: () => void;
    }
  ): () => void {
    return uiServiceAdapter.subscribeToShowWebview((event) => {
      callbacks.onResponse(event);
    });
  }

  static subscribeToAddToInput(
    request: any,
    callbacks: {
      onResponse: (event: any) => void;
      onError?: (error: Error) => void;
      onComplete?: () => void;
    }
  ): () => void {
    return uiServiceAdapter.subscribeToAddToInput((event) => {
      callbacks.onResponse(event);
    });
  }
}

// ------------------------------------------------------------
// StateServiceClient适配器 - 替换原始的GRPC StateServiceClient
// ------------------------------------------------------------

export class AdaptedStateServiceClient {
  static async dismissBanner(request: {value: string}): Promise<{success: boolean}> {
    // 通过VS Code API处理横幅关闭
    return sendToVscode<{success: boolean}>('state.dismissBanner', request);
  }
}

// ------------------------------------------------------------
// AccountServiceClient适配器 - 替换原始的GRPC AccountServiceClient
// ------------------------------------------------------------

export class AdaptedAccountServiceClient {
  static async getUserOrganizations(request: any): Promise<{organizations: Array<any>}> {
    return sendToVscode<{organizations: Array<any>}>('account.getUserOrganizations', request);
  }
  
  static subscribeToAuthStatusUpdate(request: any, callbacks: any): () => void {
    // 订阅认证状态更新
    const unsubscribe = uiServiceAdapter.subscribeToShowWebview((event) => {
      if (event.type === 'authStatusUpdate') {
        callbacks.onResponse(event.data);
      }
    });
    
    return unsubscribe;
  }
  
  static async accountLoginClicked(request: any): Promise<any> {
    return sendToVscode('account.loginClicked', request);
  }
  
  static async accountLogoutClicked(request: any): Promise<any> {
    return sendToVscode('account.logoutClicked', request);
  }
  
  static async authStateChanged(request: any): Promise<any> {
    return sendToVscode<{user: any}>('account.authStateChanged', request);
  }
  
  static async getUserCredits(request: any): Promise<any> {
    return sendToVscode<{balance: any}>('account.getUserCredits', request);
  }
  
  static async getOrganizationCredits(request: any): Promise<any> {
    return sendToVscode<{balance: any}>('account.getOrganizationCredits', request);
  }
  
  static async setUserOrganization(request: any): Promise<any> {
    return sendToVscode('account.setUserOrganization', request);
  }
  
  static async openrouterAuthClicked(request: any): Promise<any> {
    return sendToVscode('account.openrouterAuthClicked', request);
  }
  
  static async requestyAuthClicked(request: any): Promise<any> {
    return sendToVscode('account.requestyAuthClicked', request);
  }
  
  static async hicapAuthClicked(request: any): Promise<any> {
    return sendToVscode('account.hicapAuthClicked', request);
  }
  
  static async getRedirectUrl(request: any): Promise<any> {
    return sendToVscode<{value: string}>('account.getRedirectUrl', request);
  }
  
  static async openAiCodexSignIn(request: any): Promise<any> {
    return sendToVscode('account.openAiCodexSignIn', request);
  }
  
  static async openAiCodexSignOut(request: any): Promise<any> {
    return sendToVscode('account.openAiCodexSignOut', request);
  }
}

// ------------------------------------------------------------
// BrowserServiceClient适配器 - 替换原始的GRPC BrowserServiceClient
// ------------------------------------------------------------

export class AdaptedBrowserServiceClient {
  static async getBrowserConnectionInfo(request: any): Promise<any> {
    return sendToVscode<{info: any}>('browser.getConnectionInfo', request);
  }
  
  static async openImage(request: {value: string}): Promise<any> {
    // 通过文件服务打开图片
    await fileServiceAdapter.openFileRelativePath(request.value);
    return {};
  }
}

// ------------------------------------------------------------
// WorktreeServiceClient适配器 - 替换原始的GRPC WorktreeServiceClient
// ------------------------------------------------------------

export class AdaptedWorktreeServiceClient {
  static async listWorktrees(request: any): Promise<any> {
    return sendToVscode<{worktrees: any[]}>('worktree.list', request);
  }
  
  static async trackWorktreeViewOpened(request: any): Promise<any> {
    return sendToVscode('worktree.trackViewOpened', request);
  }
}

// ------------------------------------------------------------
// McpServiceClient适配器 - 替换原始的GRPC McpServiceClient
// ------------------------------------------------------------

export class AdaptedMcpServiceClient {
  static async getMcpMarketplaceCatalog(request: any): Promise<{servers: Array<any>}> {
    return sendToVscode<{servers: Array<any>}>('mcp.getMarketplaceCatalog', request);
  }
  
  static async getMcpServer(request: any): Promise<{name: string, status: string}> {
    return sendToVscode<{name: string, status: string}>('mcp.getServer', request);
  }
}

// ------------------------------------------------------------
// ModelsServiceClient适配器 - 替换原始的GRPC ModelsServiceClient
// ------------------------------------------------------------

export class AdaptedModelsServiceClient {
  static async getModels(request: any): Promise<{models: Array<any>}> {
    return sendToVscode<{models: Array<any>}>('models.getModels', request);
  }
  
  static async getDefaultModel(request: any): Promise<{model: any}> {
    return sendToVscode<{model: any}>('models.getDefaultModel', request);
  }
}

// ------------------------------------------------------------
// SlashServiceClient适配器 - 替换原始的GRPC SlashServiceClient
// ------------------------------------------------------------

export class AdaptedSlashServiceClient {
  static async executeSlashCommand(request: any): Promise<any> {
    return sendToVscode('slash.executeCommand', request);
  }
}

// ------------------------------------------------------------
// CheckpointsServiceClient适配器 - 替换原始的GRPC CheckpointsServiceClient
// ------------------------------------------------------------

export class AdaptedCheckpointsServiceClient {
  static async listCheckpoints(request: any): Promise<{checkpoints: Array<any>}> {
    return sendToVscode<{checkpoints: Array<any>}>('checkpoints.list', request);
  }
}

// ------------------------------------------------------------
// OcaAccountServiceClient适配器 - 替换原始的GRPC OcaAccountServiceClient
// ------------------------------------------------------------

export class AdaptedOcaAccountServiceClient {
  static async signIn(request: any): Promise<any> {
    return sendToVscode('oca.signIn', request);
  }
  
  static async signOut(request: any): Promise<any> {
    return sendToVscode('oca.signOut', request);
  }
}

// ------------------------------------------------------------
// WebServiceClient适配器 - 替换原始的GRPC WebServiceClient
// ------------------------------------------------------------

export class AdaptedWebServiceClient {
  static async openUrl(request: {value: string}): Promise<any> {
    // 通过VS Code API打开URL
    return sendToVscode('web.openUrl', request);
  }
  
  static async capturePage(request: any): Promise<any> {
    // 暂时不支持页面捕获
    return sendToVscode('web.capturePage', request);
  }
}

// ------------------------------------------------------------
// 导出所有适配后的GRPC客户端
// ------------------------------------------------------------

export const GrpcAdapters = {
  TaskServiceClient: AdaptedTaskServiceClient,
  FileServiceClient: AdaptedFileServiceClient,
  UiServiceClient: AdaptedUiServiceClient,
  StateServiceClient: AdaptedStateServiceClient,
  AccountServiceClient: AdaptedAccountServiceClient,
  BrowserServiceClient: AdaptedBrowserServiceClient,
  WorktreeServiceClient: AdaptedWorktreeServiceClient,
  McpServiceClient: AdaptedMcpServiceClient,
  ModelsServiceClient: AdaptedModelsServiceClient,
  SlashServiceClient: AdaptedSlashServiceClient,
  CheckpointsServiceClient: AdaptedCheckpointsServiceClient,
  OcaAccountServiceClient: AdaptedOcaAccountServiceClient,
  WebServiceClient: AdaptedWebServiceClient,
  // 其他服务适配器可以按需添加
};

// 默认导出
export default {
  fileServiceAdapter,
  toolServiceAdapter,
  uiServiceAdapter,
  GrpcAdapters,
};