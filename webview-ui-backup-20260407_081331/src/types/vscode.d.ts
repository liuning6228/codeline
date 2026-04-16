/**
 * VS Code Webview API type declarations
 */

// Global VS Code API declaration
declare function acquireVsCodeApi(): VSCodeAPI;

interface VSCodeAPI {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

// Extend window interface
declare global {
  interface Window {
    acquireVsCodeApi?: () => VSCodeAPI;
  }
}

// Make this a module
export {};
