/**
 * VS Code Webview API 工具
 * 提供与 VS Code 扩展通信的功能
 */

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
  }
}

class VSCodeAPI {
  private vscode: ReturnType<typeof window.acquireVsCodeApi> | null = null;

  constructor() {
    if (typeof window.acquireVsCodeApi === 'function') {
      this.vscode = window.acquireVsCodeApi();
    }
  }

  /**
   * 检查是否在 VS Code Webview 环境中
   */
  isInVSCode(): boolean {
    return this.vscode !== null;
  }

  /**
   * 发送消息到 VS Code 扩展
   */
  postMessage(message: any): void {
    if (this.vscode) {
      console.log('Posting message to VSCode:', message);
      this.vscode.postMessage(message);
    } else {
      console.warn('Not in VSCode environment, message ignored:', message);
    }
  }

  /**
   * 获取状态
   */
  getState(): any {
    return this.vscode?.getState() || null;
  }

  /**
   * 设置状态
   */
  setState(state: any): void {
    if (this.vscode) {
      this.vscode.setState(state);
    }
  }

  /**
   * 执行任务（流式版本）
   */
  executeTask(task: string): void {
    this.postMessage({
      command: 'executeTaskWithStream',
      task
    });
  }

  /**
   * 执行任务（传统版本）
   */
  executeTaskLegacy(task: string): void {
    this.postMessage({
      command: 'executeTask',
      task
    });
  }

  /**
   * 发送聊天消息
   */
  sendMessage(text: string, isExternal: boolean = false, externalTimestamp?: Date): void {
    this.postMessage({
      command: 'sendMessage',
      text,
      isExternal,
      externalTimestamp
    });
  }

  /**
   * 清除聊天记录
   */
  clearChat(): void {
    this.postMessage({
      command: 'clearChat'
    });
  }

  /**
   * 获取历史记录
   */
  getHistory(): void {
    this.postMessage({
      command: 'getHistory'
    });
  }

  /**
   * 切换视图
   */
  switchView(view: string): void {
    this.postMessage({
      command: 'switchView',
      view
    });
  }

  /**
   * 保存设置
   */
  saveSettings(config: any): void {
    this.postMessage({
      command: 'saveSettings',
      config
    });
  }

  /**
   * 测试连接
   */
  testConnection(): void {
    this.postMessage({
      command: 'testConnection'
    });
  }

  /**
   * 批准差异
   */
  approveDiff(filePath: string, diffId: string, action: 'approve' | 'reject'): void {
    this.postMessage({
      command: 'approveDiff',
      filePath,
      diffId,
      action
    });
  }

  /**
   * 重置设置
   */
  resetSettings(): void {
    this.postMessage({
      command: 'resetSettings'
    });
  }

  /**
   * 文件命令
   */
  fileCommand(command: string, data?: any): void {
    this.postMessage({
      command: 'fileCommand',
      fileCommand: command,
      data
    });
  }

  /**
   * 编辑消息
   */
  editMessage(messageId: string, newContent: string): void {
    this.postMessage({
      command: 'editMessage',
      messageId,
      newContent
    });
  }

  /**
   * 重新生成消息
   */
  regenerateMessage(messageId: string): void {
    this.postMessage({
      command: 'regenerateMessage',
      messageId
    });
  }

  /**
   * 登出
   */
  signOut(): void {
    this.postMessage({
      command: 'signOut'
    });
  }

  /**
   * 升级账户
   */
  upgradeAccount(): void {
    this.postMessage({
      command: 'upgradeAccount'
    });
  }

  /**
   * 添加 MCP
   */
  addMCP(): void {
    this.postMessage({
      command: 'addMCP'
    });
  }
}

// 创建单例实例
const vscode = new VSCodeAPI();

export default vscode;