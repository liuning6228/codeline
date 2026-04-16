/**
 * 适配器主入口文件
 * 
 * 统一导出所有适配器，供UI组件使用
 * 遵循CLINE_UI_CLAUDE_CORE_PLAN.md中的架构设计
 */

// Cline GRPC到VS Code API适配器
export {
  fileServiceAdapter,
  toolServiceAdapter,
  uiServiceAdapter,
  GrpcAdapters,
} from './cline-to-vscode';

// VS Code API到Claude Code适配器
export {
  vscodeToClaudeAdapter,
  QueryEngine,
  QueryEngineConfig,
  ToolDefinition,
  ToolProgress,
  ToolResult,
  ChatMessage,
} from './vscode-to-claude';

// 格式转换适配器
export * from './format-adapters';

// ------------------------------------------------------------
// 适配器使用工具函数
// ------------------------------------------------------------

/**
 * 检查是否在VS Code环境中运行
 */
export function isRunningInVscode(): boolean {
  return typeof acquireVsCodeApi === 'function';
}

/**
 * 安全获取VS Code API
 */
export function getVscodeApi() {
  if (typeof acquireVsCodeApi === 'function') {
    return acquireVsCodeApi();
  }
  return null;
}

/**
 * 发送消息到VS Code扩展（简化版）
 */
export async function sendToExtension<T = any>(command: string, data?: any): Promise<T> {
  const vscode = getVscodeApi();
  if (!vscode) {
    throw new Error('Not running in VS Code environment');
  }
  
  return new Promise((resolve, reject) => {
    const messageId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
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
    
    vscode.postMessage({
      command,
      data,
      messageId,
    });
    
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      reject(new Error(`Command '${command}' timed out`));
    }, 30000);
  });
}

/**
 * 发送GRPC请求（兼容现有代码）
 */
export async function sendGrpcRequest<T = any>(service: string, method: string, request: any): Promise<T> {
  return sendToExtension('grpc.request', {
    service,
    method,
    request,
  });
}

// ------------------------------------------------------------
// 类型导出
// ------------------------------------------------------------

export type {
  FileServiceAdapter,
  ToolServiceAdapter,
  UiServiceAdapter,
  ShowWebviewEvent,
  AddToInputEvent,
} from './cline-to-vscode';

// ------------------------------------------------------------
// 适配器配置
// ------------------------------------------------------------

export const adapterConfig = {
  // 超时设置
  timeoutMs: 30000,
  
  // 重试设置
  maxRetries: 3,
  retryDelayMs: 1000,
  
  // 调试模式
  debug: process.env.NODE_ENV === 'development',
  
  // 是否启用模拟模式
  enableMock: !isRunningInVscode(),
};

// 默认导出
export default {
  fileServiceAdapter: isRunningInVscode() ? require('./cline-to-vscode').fileServiceAdapter : null,
  toolServiceAdapter: isRunningInVscode() ? require('./cline-to-vscode').toolServiceAdapter : null,
  uiServiceAdapter: isRunningInVscode() ? require('./cline-to-vscode').uiServiceAdapter : null,
  GrpcAdapters: isRunningInVscode() ? require('./cline-to-vscode').GrpcAdapters : null,
  vscodeToClaudeAdapter: require('./vscode-to-claude').vscodeToClaudeAdapter,
  sendToExtension,
  isRunningInVscode,
  adapterConfig,
};