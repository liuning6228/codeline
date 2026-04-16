/**
 * VS Code API Bridge
 * 
 * Provides a clean interface between the React webview and VS Code extension.
 * Based on VS Code WebView API patterns.
 */

// ============================================================================
// VS Code API Types
// ============================================================================

declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage(message: any): void;
      getState(): any;
      setState(state: any): void;
    };
  }
}

export interface VSCodeApi {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

export interface VSCodeMessage {
  command: string;
  [key: string]: any;
}

// ============================================================================
// Message Types
// ============================================================================

export type MessageHandler = (message: VSCodeMessage) => void | Promise<void>;

export interface MessageHandlers {
  [command: string]: MessageHandler;
}

// ============================================================================
// VS Code Bridge Implementation
// ============================================================================

export class VSCodeBridge {
  private vscodeApi: VSCodeApi | null = null;
  private messageHandlers: MessageHandlers = {};
  private initialized = false;
  
  constructor() {
    this.initialize();
  }
  
  /**
   * Initialize VS Code API
   */
  private initialize(): void {
    if (typeof window !== 'undefined' && window.acquireVsCodeApi) {
      try {
        this.vscodeApi = window.acquireVsCodeApi();
        this.setupMessageListener();
        this.initialized = true;
        console.log('VS Code API initialized successfully');
      } catch (error) {
        console.error('Failed to initialize VS Code API:', error);
      }
    } else {
      console.warn('VS Code API not available in current context. Using mock API.');
      this.vscodeApi = this.createMockApi();
      this.initialized = true;
    }
  }
  
  /**
   * Setup message listener for messages from VS Code extension
   */
  private setupMessageListener(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      const message = event.data as VSCodeMessage;
      
      // Find and execute handler for this command
      const handler = this.messageHandlers[message.command];
      if (handler) {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in message handler for command "${message.command}":`, error);
        }
      } else {
        console.warn(`No handler registered for command: ${message.command}`);
      }
    });
  }
  
  /**
   * Register a handler for a specific command
   */
  registerHandler(command: string, handler: MessageHandler): void {
    this.messageHandlers[command] = handler;
  }
  
  /**
   * Unregister a handler for a command
   */
  unregisterHandler(command: string): void {
    delete this.messageHandlers[command];
  }
  
  /**
   * Send a message to VS Code extension
   */
  postMessage(message: VSCodeMessage): void {
    if (!this.initialized || !this.vscodeApi) {
      console.error('VS Code API not initialized. Message not sent:', message);
      return;
    }
    
    try {
      this.vscodeApi.postMessage(message);
      console.log('Message sent to VS Code:', message.command);
    } catch (error) {
      console.error('Failed to send message to VS Code:', error);
    }
  }
  
  /**
   * Get current state from VS Code
   */
  getState(): any {
    if (!this.initialized || !this.vscodeApi) {
      console.warn('VS Code API not initialized. Returning empty state.');
      return {};
    }
    
    return this.vscodeApi.getState() || {};
  }
  
  /**
   * Set state in VS Code
   */
  setState(state: any): void {
    if (!this.initialized || !this.vscodeApi) {
      console.warn('VS Code API not initialized. State not saved.');
      return;
    }
    
    try {
      this.vscodeApi.setState(state);
      console.log('State saved to VS Code');
    } catch (error) {
      console.error('Failed to save state to VS Code:', error);
    }
  }
  
  /**
   * Check if VS Code API is available
   */
  isAvailable(): boolean {
    return this.initialized && this.vscodeApi !== null;
  }
  
  // ==========================================================================
  // Convenience Methods for Common Operations
  // ==========================================================================
  
  /**
   * Send ready signal to extension
   */
  sendReady(): void {
    this.postMessage({ command: 'webviewReady' });
  }
  
  /**
   * Send user message to extension
   */
  sendUserMessage(text: string, images?: string[]): void {
    this.postMessage({
      command: 'sendMessage',
      text,
      images
    });
  }
  
  /**
   * Request file selection
   */
  requestFileSelection(supportsImages: boolean): void {
    this.postMessage({
      command: 'selectFiles',
      supportsImages
    });
  }
  
  /**
   * Open file in editor
   */
  openFile(path: string): void {
    this.postMessage({
      command: 'openFile',
      path
    });
  }
  
  /**
   * Read file contents
   */
  readFile(path: string): void {
    this.postMessage({
      command: 'readFile',
      path
    });
  }
  
  /**
   * Write file contents
   */
  writeFile(path: string, content: string): void {
    this.postMessage({
      command: 'writeFile',
      path,
      content
    });
  }
  
  /**
   * Execute terminal command
   */
  executeCommand(command: string, workingDirectory?: string): void {
    this.postMessage({
      command: 'executeCommand',
      cmd: command,
      cwd: workingDirectory
    });
  }
  
  /**
   * Navigate to a view
   */
  navigateToView(view: string): void {
    this.postMessage({
      command: 'navigate',
      view
    });
  }
  
  /**
   * Clear current task
   */
  clearTask(): void {
    this.postMessage({
      command: 'clearTask',
      data: {}
    });
  }
  
  /**
   * Request project analysis
   */
  analyzeProject(): void {
    this.postMessage({
      command: 'analyzeProject'
    });
  }
  
  // ==========================================================================
  // Mock API for development outside VS Code
  // ==========================================================================
  
  private createMockApi(): VSCodeApi {
    console.log('Using mock VS Code API for development');
    
    // Mock state storage
    let mockState: any = {};
    
    return {
      postMessage: (message: VSCodeMessage) => {
        console.log('Mock VS Code API - Message received:', message);
        
        // Simulate responses for development
        this.simulateResponse(message);
      },
      
      getState: () => {
        return mockState;
      },
      
      setState: (state: any) => {
        mockState = { ...mockState, ...state };
        console.log('Mock VS Code API - State updated:', mockState);
      }
    };
  }
  
  /**
   * Simulate responses from VS Code for development
   */
  private simulateResponse(message: VSCodeMessage): void {
    // Simulate delayed responses for better development experience
    setTimeout(() => {
      switch (message.command) {
        case 'selectFiles':
          // Simulate file selection
          window.dispatchEvent(new MessageEvent('message', {
            data: {
              command: 'fileSelected',
              files: ['/path/to/file1.txt', '/path/to/file2.js'],
              images: []
            }
          }));
          break;
          
        case 'readFile':
          // Simulate file read
          window.dispatchEvent(new MessageEvent('message', {
            data: {
              command: 'fileRead',
              path: message.path,
              content: `Mock content of ${message.path}\nThis is simulated for development.`
            }
          }));
          break;
          
        case 'sendMessage':
          // Simulate AI response
          setTimeout(() => {
            window.dispatchEvent(new MessageEvent('message', {
              data: {
                command: 'aiResponse',
                text: `I received your message: "${message.text}". This is a simulated response for development.`,
                toolResults: []
              }
            }));
          }, 1000);
          break;
          
        case 'analyzeProject':
          // Simulate project analysis
          setTimeout(() => {
            window.dispatchEvent(new MessageEvent('message', {
              data: {
                command: 'projectAnalysis',
                analysis: {
                  projectType: 'TypeScript',
                  files: 42,
                  dependencies: 15,
                  issues: [],
                  suggestions: ['Mock analysis for development']
                }
              }
            }));
          }, 1500);
          break;
          
        case 'executeCommand':
          // Simulate command execution
          setTimeout(() => {
            window.dispatchEvent(new MessageEvent('message', {
              data: {
                command: 'commandResult',
                cmd: message.cmd,
                stdout: `Mock output for command: ${message.cmd}`,
                stderr: '',
                exitCode: 0,
                success: true
              }
            }));
          }, 800);
          break;
      }
    }, 300);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let bridgeInstance: VSCodeBridge | null = null;

export function getVSCodeBridge(): VSCodeBridge {
  if (!bridgeInstance) {
    bridgeInstance = new VSCodeBridge();
  }
  return bridgeInstance;
}

// ============================================================================
// React Hook for VS Code Bridge
// ============================================================================

import { useEffect, useState } from 'react';

export function useVSCodeBridge() {
  const [bridge] = useState(() => getVSCodeBridge());
  const [isReady, setIsReady] = useState(bridge.isAvailable());
  
  useEffect(() => {
    // Send ready signal when component mounts
    if (isReady) {
      bridge.sendReady();
    }
  }, [bridge, isReady]);
  
  return {
    bridge,
    isReady,
    postMessage: bridge.postMessage.bind(bridge),
    registerHandler: bridge.registerHandler.bind(bridge),
    unregisterHandler: bridge.unregisterHandler.bind(bridge),
    getState: bridge.getState.bind(bridge),
    setState: bridge.setState.bind(bridge)
  };
}