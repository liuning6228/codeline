/**
 * VS Code Extension Communication Service
 * Provides a clean API for webview <-> extension communication
 */

// Message types
export interface VSCodeMessage {
  command: string;
  [key: string]: any;
}

export interface ExtensionMessage {
  type?: string;
  command?: string;
  [key: string]: any;
}

// VS Code API wrapper
class VSCodeService {
  private vscode: VSCodeAPI | null = null;
  private messageListeners: Set<(message: ExtensionMessage) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    
    try {
      // Try to get VS Code API
      if (typeof acquireVsCodeApi !== 'undefined') {
        this.vscode = acquireVsCodeApi();
      }
      
      // Listen for messages from extension
      window.addEventListener('message', (event) => {
        const message = event.data;
        this.messageListeners.forEach(listener => {
          try {
            listener(message);
          } catch (error) {
            console.error('Error in message listener:', error);
          }
        });
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('VS Code API not available:', error);
    }
  }

  /**
   * Check if running in VS Code environment
   */
  isInVSCode(): boolean {
    return this.vscode !== null;
  }

  /**
   * Send message to VS Code extension
   */
  postMessage(message: VSCodeMessage): void {
    if (this.vscode) {
      this.vscode.postMessage(message);
    } else {
      console.log('[DEV] postMessage:', message);
    }
  }

  /**
   * Subscribe to messages from VS Code extension
   */
  subscribe(listener: (message: ExtensionMessage) => void): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  /**
   * Request current state from extension
   */
  requestState(): void {
    this.postMessage({ command: 'requestState' });
  }

  /**
   * Send a chat message
   */
  sendMessage(text: string, images?: string[]): void {
    this.postMessage({
      command: 'sendMessage',
      text,
      images: images || [],
    });
  }

  /**
   * Execute a task
   */
  executeTask(task: string): void {
    this.postMessage({
      command: 'executeTask',
      task,
    });
  }

  /**
   * Cancel current task
   */
  cancelTask(): void {
    this.postMessage({ command: 'cancelTask' });
  }

  /**
   * Switch mode (plan/act)
   */
  setMode(mode: 'plan' | 'act'): void {
    this.postMessage({ command: 'setMode', mode });
  }

  /**
   * Open settings
   */
  openSettings(): void {
    this.postMessage({ command: 'openSettings' });
  }

  /**
   * Clear chat history
   */
  clearChat(): void {
    this.postMessage({ command: 'clearChat' });
  }

  /**
   * Get file content
   */
  async getFileContent(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const requestId = `getFileContent-${Date.now()}`;
      
      const unsubscribe = this.subscribe((message) => {
        if (message.command === 'fileContent' && message.requestId === requestId) {
          unsubscribe();
          if (message.error) {
            reject(new Error(message.error));
          } else {
            resolve(message.content);
          }
        }
      });
      
      this.postMessage({
        command: 'getFileContent',
        path,
        requestId,
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        unsubscribe();
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }

  /**
   * Search files
   */
  async searchFiles(query: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const requestId = `searchFiles-${Date.now()}`;
      
      const unsubscribe = this.subscribe((message) => {
        if (message.command === 'searchFilesResult' && message.requestId === requestId) {
          unsubscribe();
          if (message.error) {
            reject(new Error(message.error));
          } else {
            resolve(message.files || []);
          }
        }
      });
      
      this.postMessage({
        command: 'searchFiles',
        query,
        requestId,
      });
      
      setTimeout(() => {
        unsubscribe();
        reject(new Error('Request timeout'));
      }, 30000);
    });
  }

  /**
   * Save state to extension
   */
  saveState(state: any): void {
    if (this.vscode) {
      this.vscode.setState(state);
    }
  }

  /**
   * Get saved state
   */
  getState<T = any>(): T | undefined {
    if (this.vscode) {
      return this.vscode.getState() as T;
    }
    return undefined;
  }
}

// VS Code API interface
interface VSCodeAPI {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

// Export singleton instance
export const vscodeService = new VSCodeService();

// Export convenience functions
export const isInVSCode = () => vscodeService.isInVSCode();
export const postMessage = (message: VSCodeMessage) => vscodeService.postMessage(message);
export const subscribe = (listener: (message: ExtensionMessage) => void) => vscodeService.subscribe(listener);
export const sendMessage = (text: string, images?: string[]) => vscodeService.sendMessage(text, images);
export const executeTask = (task: string) => vscodeService.executeTask(task);
export const cancelTask = () => vscodeService.cancelTask();
export const setMode = (mode: 'plan' | 'act') => vscodeService.setMode(mode);

export default vscodeService;
