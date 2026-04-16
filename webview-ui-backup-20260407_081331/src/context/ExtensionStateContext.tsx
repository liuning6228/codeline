/**
 * CodeLine Extension State Context
 * Based on Cline's architecture for centralized state management
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Message types
export interface ClineMessage {
  ts: number;
  type: 'ask' | 'say';
  ask?: string;
  say?: string;
  text?: string;
  images?: string[];
  partial?: boolean;
  [key: string]: any;
}

// Task history item
export interface HistoryItem {
  id: string;
  task: string;
  ts: number;
  status: 'completed' | 'failed' | 'in_progress';
  [key: string]: any;
}

// Extension state interface
export interface ExtensionState {
  // Messages
  clineMessages: ClineMessage[];
  
  // Task state
  taskHistory: HistoryItem[];
  currentTask?: string;
  isProcessing: boolean;
  
  // API configuration
  apiConfiguration?: {
    providerId: string;
    modelId: string;
    apiKey?: string;
    baseUrl?: string;
  };
  
  // Mode
  mode: 'plan' | 'act';
  
  // UI state
  version: string;
  didHydrateState: boolean;
  showWelcome: boolean;
  
  // View state
  showSettings: boolean;
  showHistory: boolean;
  showMcp: boolean;
  mcpTab?: string; // For MCP configuration tab
  
  // Settings
  telemetrySetting: 'unset' | 'enabled' | 'disabled';
}

// Context type with setters
export interface ExtensionStateContextType extends ExtensionState {
  // Setters
  setClineMessages: (messages: ClineMessage[]) => void;
  addMessage: (message: ClineMessage) => void;
  clearMessages: () => void;
  
  setTaskHistory: (history: HistoryItem[]) => void;
  setCurrentTask: (task: string | undefined) => void;
  setIsProcessing: (processing: boolean) => void;
  
  setApiConfiguration: (config: ExtensionState['apiConfiguration']) => void;
  
  setMode: (mode: 'plan' | 'act') => void;
  
  setShowSettings: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setShowMcp: (show: boolean) => void;
  setMcpTab: (tab: string | undefined) => void;
  setShowWelcome: (show: boolean) => void;
  
  // Navigation
  navigateToSettings: () => void;
  navigateToHistory: () => void;
  navigateToChat: () => void;
  navigateToMcp: (tab?: string) => void;
  closeMcpView: () => void;
  hideSettings: () => void;
  hideHistory: () => void;
  
  // Message handlers
  sendMessage: (text: string, images?: string[]) => void;
  handleExtensionMessage: (message: any) => void;
  
  // Callbacks
  onRelinquishControl: (callback: () => void) => () => void;
}

// Default state
const defaultState: ExtensionState = {
  clineMessages: [],
  taskHistory: [],
  isProcessing: false,
  mode: 'act',
  version: '0.2.0',
  didHydrateState: false,
  showWelcome: true,
  showSettings: false,
  showHistory: false,
  showMcp: false,
  telemetrySetting: 'unset',
};

// Create context
export const ExtensionStateContext = createContext<ExtensionStateContextType | undefined>(undefined);

// Provider component
export const ExtensionStateContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Core state
  const [clineMessages, setClineMessages] = useState<ClineMessage[]>([]);
  const [taskHistory, setTaskHistory] = useState<HistoryItem[]>([]);
  const [currentTask, setCurrentTask] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiConfiguration, setApiConfiguration] = useState<ExtensionState['apiConfiguration']>();
  const [mode, setMode] = useState<'plan' | 'act'>('act');
  const [version] = useState('0.2.0');
  const [didHydrateState, setDidHydrateState] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMcp, setShowMcp] = useState(false);
  const [mcpTab, setMcpTab] = useState<string | undefined>();
  const [telemetrySetting, setTelemetrySetting] = useState<'unset' | 'enabled' | 'disabled'>('unset');
  
  // Control relinquish callbacks
  const relinquishControlCallbacks = useRef<Set<() => void>>(new Set());
  
  // Add message
  const addMessage = useCallback((message: ClineMessage) => {
    setClineMessages(prev => [...prev, message]);
  }, []);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setClineMessages([]);
  }, []);
  
  // Navigation functions
  const navigateToSettings = useCallback(() => {
    setShowSettings(true);
    setShowHistory(false);
    setShowWelcome(false);
  }, []);
  
  const navigateToHistory = useCallback(() => {
    setShowHistory(true);
    setShowSettings(false);
    setShowWelcome(false);
  }, []);
  
  const navigateToChat = useCallback(() => {
    setShowSettings(false);
    setShowHistory(false);
    setShowWelcome(false);
  }, []);
  
  const hideSettings = useCallback(() => {
    setShowSettings(false);
  }, []);
  
  const hideHistory = useCallback(() => {
    setShowHistory(false);
  }, []);
  
  // MCP navigation
  const navigateToMcp = useCallback((tab?: string) => {
    setShowMcp(true);
    if (tab) setMcpTab(tab);
    setShowSettings(false);
    setShowHistory(false);
    setShowWelcome(false);
  }, []);
  
  const closeMcpView = useCallback(() => {
    setShowMcp(false);
    setMcpTab(undefined);
  }, []);
  
  // Send message to VS Code extension
  const sendMessage = useCallback((text: string, images?: string[]) => {
    // Post message to VS Code
    if (typeof acquireVsCodeApi !== 'undefined') {
      const vscode = acquireVsCodeApi();
      vscode.postMessage({
        command: 'sendMessage',
        text,
        images: images || [],
      });
    } else {
      // Fallback for development
      console.log('sendMessage:', text, images);
      // Simulate response
      setTimeout(() => {
        addMessage({
          ts: Date.now(),
          type: 'say',
          say: 'completion_result',
          text: `Received: ${text}. This is a simulated response.`,
        });
        setIsProcessing(false);
      }, 1000);
    }
    
    // Add user message
    addMessage({
      ts: Date.now(),
      type: 'say',
      say: 'user_feedback',
      text,
      images,
    });
    
    setIsProcessing(true);
  }, [addMessage]);
  
  // Handle messages from VS Code extension
  const handleExtensionMessage = useCallback((message: any) => {
    console.log('Received extension message:', message);
    
    switch (message.command || message.type) {
      case 'state':
        // Hydrate state from extension
        if (message.state) {
          setClineMessages(message.state.clineMessages || []);
          setTaskHistory(message.state.taskHistory || []);
          setApiConfiguration(message.state.apiConfiguration);
          setMode(message.state.mode || 'act');
          setTelemetrySetting(message.state.telemetrySetting || 'unset');
          setDidHydrateState(true);
          setShowWelcome(!message.state.currentTask);
        }
        break;
        
      case 'addMessage':
      case 'message':
        addMessage({
          ts: message.ts || Date.now(),
          type: message.type === 'ask' ? 'ask' : 'say',
          ask: message.ask,
          say: message.say,
          text: message.text || message.content,
          images: message.images,
          partial: message.partial,
        });
        break;
        
      case 'taskStarted':
        setCurrentTask(message.task);
        setIsProcessing(true);
        setShowWelcome(false);
        break;
        
      case 'taskCompleted':
        setCurrentTask(undefined);
        setIsProcessing(false);
        if (message.historyItem) {
          setTaskHistory(prev => [...prev, message.historyItem]);
        }
        break;
        
      case 'taskError':
        setIsProcessing(false);
        addMessage({
          ts: Date.now(),
          type: 'say',
          say: 'api_req_failed',
          text: message.error,
        });
        break;
        
      case 'partialMessage':
        // Update last partial message or add new one
        setClineMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.partial && lastMessage.ts === message.ts) {
            return [...prev.slice(0, -1), { ...lastMessage, text: message.text }];
          }
          return [...prev, {
            ts: message.ts,
            type: 'say',
            say: message.say,
            text: message.text,
            partial: true,
          }];
        });
        break;
        
      case 'clearMessages':
        clearMessages();
        break;
        
      case 'modeChanged':
        setMode(message.mode);
        break;
        
      default:
        console.log('Unknown message type:', message);
    }
  }, [addMessage, clearMessages]);
  
  // Register relinquish control callback
  const onRelinquishControl = useCallback((callback: () => void) => {
    relinquishControlCallbacks.current.add(callback);
    return () => {
      relinquishControlCallbacks.current.delete(callback);
    };
  }, []);
  
  // Listen for messages from VS Code
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      handleExtensionMessage(event.data);
    };
    
    window.addEventListener('message', handleMessage);
    
    // Request initial state
    if (typeof acquireVsCodeApi !== 'undefined') {
      const vscode = acquireVsCodeApi();
      vscode.postMessage({ command: 'requestState' });
    }
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleExtensionMessage]);
  
  const value: ExtensionStateContextType = {
    // State
    clineMessages,
    taskHistory,
    currentTask,
    isProcessing,
    apiConfiguration,
    mode,
    version,
    didHydrateState,
    showWelcome,
    showSettings,
    showHistory,
    showMcp,
    mcpTab,
    telemetrySetting,
    
    // Setters
    setClineMessages,
    addMessage,
    clearMessages,
    setTaskHistory,
    setCurrentTask,
    setIsProcessing,
    setApiConfiguration,
    setMode,
    setShowSettings,
    setShowHistory,
    setShowMcp,
    setMcpTab,
    setShowWelcome,
    
    // Navigation
    navigateToSettings,
    navigateToHistory,
    navigateToChat,
    navigateToMcp,
    closeMcpView,
    hideSettings,
    hideHistory,
    
    // Message handlers
    sendMessage,
    handleExtensionMessage,
    
    // Callbacks
    onRelinquishControl,
  };
  
  return (
    <ExtensionStateContext.Provider value={value}>
      {children}
    </ExtensionStateContext.Provider>
  );
};

// Hook to use extension state
export const useExtensionState = (): ExtensionStateContextType => {
  const context = useContext(ExtensionStateContext);
  if (!context) {
    throw new Error('useExtensionState must be used within ExtensionStateContextProvider');
  }
  return context;
};

export default ExtensionStateContext;
