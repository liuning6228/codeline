/**
 * Cline GRPC API to VS Code API Adapter
 * 
 * This adapter translates Cline's GRPC service calls to VS Code postMessage API.
 * Each Cline service client is replaced with a VS Code API wrapper.
 */

// ============================================================================
// File Service Adapter (FileServiceClient)
// ============================================================================

export interface FileServiceAdapter {
  /**
   * Open a file relative to the workspace root
   * Replaces: FileServiceClient.openFileRelativePath()
   */
  openFileRelativePath(path: string): Promise<void>;
  
  /**
   * Select files or images
   * Replaces: FileServiceClient.selectFiles()
   */
  selectFiles(supportsImages: boolean): Promise<{images: string[], files: string[]}>;
  
  /**
   * Copy text to clipboard
   * Replaces: FileServiceClient.copyToClipboard()
   */
  copyToClipboard(text: string): Promise<void>;
  
  /**
   * Read file contents
   * Replaces: FileServiceClient.readFile()
   */
  readFile(path: string): Promise<string>;
  
  /**
   * Write file contents
   * Replaces: FileServiceClient.writeFile()
   */
  writeFile(path: string, content: string): Promise<void>;
  
  /**
   * Get file tree for workspace
   * Replaces: FileServiceClient.getFileTree()
   */
  getFileTree(): Promise<any>;
}

// VS Code implementation
export class VSCodeFileServiceAdapter implements FileServiceAdapter {
  private vscode: any;
  
  constructor(vscodeApi: any) {
    this.vscode = vscodeApi;
  }
  
  async openFileRelativePath(path: string): Promise<void> {
    this.vscode.postMessage({
      command: 'openFile',
      path
    });
    // Note: VS Code doesn't provide a direct promise for file opening
    return Promise.resolve();
  }
  
  async selectFiles(supportsImages: boolean): Promise<{images: string[], files: string[]}> {
    return new Promise((resolve) => {
      const listener = (event: MessageEvent) => {
        const data = event.data;
        if (data.command === 'fileSelected' && data.requestId === requestId) {
          window.removeEventListener('message', listener);
          resolve({
            images: data.images || [],
            files: data.files || []
          });
        }
      };
      
      window.addEventListener('message', listener);
      
      const requestId = Date.now().toString();
      this.vscode.postMessage({
        command: 'selectFiles',
        supportsImages,
        requestId
      });
    });
  }
  
  async copyToClipboard(text: string): Promise<void> {
    this.vscode.postMessage({
      command: 'copyToClipboard',
      text
    });
    return Promise.resolve();
  }
  
  async readFile(path: string): Promise<string> {
    return new Promise((resolve) => {
      const listener = (event: MessageEvent) => {
        const data = event.data;
        if (data.command === 'fileRead' && data.path === path) {
          window.removeEventListener('message', listener);
          resolve(data.content || '');
        }
      };
      
      window.addEventListener('message', listener);
      
      this.vscode.postMessage({
        command: 'readFile',
        path
      });
    });
  }
  
  async writeFile(path: string, content: string): Promise<void> {
    this.vscode.postMessage({
      command: 'writeFile',
      path,
      content
    });
    return Promise.resolve();
  }
  
  async getFileTree(): Promise<any> {
    return new Promise((resolve) => {
      const listener = (event: MessageEvent) => {
        const data = event.data;
        if (data.command === 'fileTree') {
          window.removeEventListener('message', listener);
          resolve(data.tree || {});
        }
      };
      
      window.addEventListener('message', listener);
      
      this.vscode.postMessage({
        command: 'getFileTree'
      });
    });
  }
}

// ============================================================================
// Tool Service Adapter (ToolServiceClient)
// ============================================================================

export interface ToolServiceAdapter {
  /**
   * Execute a tool with parameters
   * Replaces: ToolServiceClient.executeTool()
   */
  executeTool(toolName: string, params: any): Promise<any>;
  
  /**
   * Stream tool execution progress
   */
  streamProgress(callback: (progress: ToolProgress) => void): () => void;
  
  /**
   * Cancel tool execution
   */
  cancelTool(executionId: string): Promise<void>;
  
  /**
   * Get available tool list
   */
  getToolList(): Promise<ToolDefinition[]>;
}

export interface ToolProgress {
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
  indeterminate?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any;
}

// VS Code implementation
export class VSCodeToolServiceAdapter implements ToolServiceAdapter {
  private vscode: any;
  private progressCallbacks: Set<(progress: ToolProgress) => void> = new Set();
  
  constructor(vscodeApi: any) {
    this.vscode = vscodeApi;
    
    // Listen for progress updates
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (data.command === 'toolProgress') {
        const progress: ToolProgress = {
          percentage: data.percentage || 0,
          message: data.message || '',
          estimatedTimeRemaining: data.estimatedTimeRemaining,
          indeterminate: data.indeterminate
        };
        this.progressCallbacks.forEach(callback => callback(progress));
      }
    });
  }
  
  async executeTool(toolName: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent) => {
        const data = event.data;
        if (data.command === 'toolResult' && data.toolName === toolName) {
          window.removeEventListener('message', listener);
          if (data.error) {
            reject(new Error(data.error));
          } else {
            resolve(data.result);
          }
        }
      };
      
      window.addEventListener('message', listener);
      
      this.vscode.postMessage({
        command: 'executeTool',
        toolName,
        params
      });
    });
  }
  
  streamProgress(callback: (progress: ToolProgress) => void): () => void {
    this.progressCallbacks.add(callback);
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }
  
  async cancelTool(executionId: string): Promise<void> {
    this.vscode.postMessage({
      command: 'cancelTool',
      executionId
    });
    return Promise.resolve();
  }
  
  async getToolList(): Promise<ToolDefinition[]> {
    return new Promise((resolve) => {
      const listener = (event: MessageEvent) => {
        const data = event.data;
        if (data.command === 'toolList') {
          window.removeEventListener('message', listener);
          resolve(data.tools || []);
        }
      };
      
      window.addEventListener('message', listener);
      
      this.vscode.postMessage({
        command: 'getToolList'
      });
    });
  }
}

// ============================================================================
// UI Service Adapter (UiServiceClient)
// ============================================================================

export interface UiServiceAdapter {
  /**
   * Subscribe to show webview events
   */
  subscribeToShowWebview(callback: (event: ShowWebviewEvent) => void): () => void;
  
  /**
   * Subscribe to add to input events
   */
  subscribeToAddToInput(callback: (event: AddToInputEvent) => void): () => void;
  
  /**
   * Show announcement
   */
  showAnnouncement(): Promise<void>;
}

export interface ShowWebviewEvent {
  webviewId: string;
  data?: any;
}

export interface AddToInputEvent {
  text: string;
  cursorPosition?: number;
}

// VS Code implementation
export class VSCodeUiServiceAdapter implements UiServiceAdapter {
  private vscode: any;
  private showWebviewCallbacks: Set<(event: ShowWebviewEvent) => void> = new Set();
  private addToInputCallbacks: Set<(event: AddToInputEvent) => void> = new Set();
  
  constructor(vscodeApi: any) {
    this.vscode = vscodeApi;
    
    // Listen for UI events
    window.addEventListener('message', (event) => {
      const data = event.data;
      switch (data.command) {
        case 'showWebview':
          const showEvent: ShowWebviewEvent = {
            webviewId: data.webviewId,
            data: data.data
          };
          this.showWebviewCallbacks.forEach(callback => callback(showEvent));
          break;
        case 'addToInput':
          const inputEvent: AddToInputEvent = {
            text: data.text,
            cursorPosition: data.cursorPosition
          };
          this.addToInputCallbacks.forEach(callback => callback(inputEvent));
          break;
      }
    });
  }
  
  subscribeToShowWebview(callback: (event: ShowWebviewEvent) => void): () => void {
    this.showWebviewCallbacks.add(callback);
    return () => {
      this.showWebviewCallbacks.delete(callback);
    };
  }
  
  subscribeToAddToInput(callback: (event: AddToInputEvent) => void): () => void {
    this.addToInputCallbacks.add(callback);
    return () => {
      this.addToInputCallbacks.delete(callback);
    };
  }
  
  async showAnnouncement(): Promise<void> {
    this.vscode.postMessage({
      command: 'showAnnouncement'
    });
    return Promise.resolve();
  }
}

// ============================================================================
// State Service Adapter (StateServiceClient)
// ============================================================================

export interface StateServiceAdapter {
  /**
   * Dismiss a banner/announcement
   */
  dismissBanner(bannerId: string): Promise<void>;
  
  /**
   * Get user settings
   */
  getUserSettings(): Promise<any>;
  
  /**
   * Update user settings
   */
  updateUserSettings(settings: any): Promise<void>;
}

// VS Code implementation
export class VSCodeStateServiceAdapter implements StateServiceAdapter {
  private vscode: any;
  
  constructor(vscodeApi: any) {
    this.vscode = vscodeApi;
  }
  
  async dismissBanner(bannerId: string): Promise<void> {
    this.vscode.postMessage({
      command: 'dismissBanner',
      bannerId
    });
    return Promise.resolve();
  }
  
  async getUserSettings(): Promise<any> {
    return new Promise((resolve) => {
      const listener = (event: MessageEvent) => {
        const data = event.data;
        if (data.command === 'userSettings') {
          window.removeEventListener('message', listener);
          resolve(data.settings || {});
        }
      };
      
      window.addEventListener('message', listener);
      
      this.vscode.postMessage({
        command: 'getUserSettings'
      });
    });
  }
  
  async updateUserSettings(settings: any): Promise<void> {
    this.vscode.postMessage({
      command: 'updateUserSettings',
      settings
    });
    return Promise.resolve();
  }
}

// ============================================================================
// Main Adapter Factory
// ============================================================================

export class VSCodeAdapterFactory {
  private static vscode: any;
  private static instances: Map<string, any> = new Map();
  
  static initialize(vscodeApi: any) {
    this.vscode = vscodeApi;
  }
  
  static getFileService(): FileServiceAdapter {
    if (!this.instances.has('fileService')) {
      this.instances.set('fileService', new VSCodeFileServiceAdapter(this.vscode));
    }
    return this.instances.get('fileService');
  }
  
  static getToolService(): ToolServiceAdapter {
    if (!this.instances.has('toolService')) {
      this.instances.set('toolService', new VSCodeToolServiceAdapter(this.vscode));
    }
    return this.instances.get('toolService');
  }
  
  static getUiService(): UiServiceAdapter {
    if (!this.instances.has('uiService')) {
      this.instances.set('uiService', new VSCodeUiServiceAdapter(this.vscode));
    }
    return this.instances.get('uiService');
  }
  
  static getStateService(): StateServiceAdapter {
    if (!this.instances.has('stateService')) {
      this.instances.set('stateService', new VSCodeStateServiceAdapter(this.vscode));
    }
    return this.instances.get('stateService');
  }
}