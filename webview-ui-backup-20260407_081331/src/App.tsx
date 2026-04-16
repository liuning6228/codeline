/**
 * CodeLine Main Application
 * Based on Cline's multi-view architecture
 */

import React from 'react';
import { ExtensionStateContextProvider, useExtensionState } from './context/ExtensionStateContext';
import { ChatView } from './components/chat/chat-view';
import { Navbar } from './components/menu/Navbar';

// Main app content - uses extension state
const AppContent: React.FC = () => {
  const {
    showSettings,
    showHistory,
    showMcp,
    showWelcome,
    didHydrateState,
    hideSettings,
    hideHistory,
    closeMcpView,
  } = useExtensionState();

  // Loading state
  if (!didHydrateState) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4 text-foreground">CodeLine</div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cline animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-cline animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-cline animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* Navbar - top right navigation */}
      <div className="flex-none flex justify-end p-2">
        <Navbar />
      </div>
      
      {/* Main Chat View - always rendered */}
      <ChatView
        isHidden={showSettings || showHistory || showMcp}
        showHistoryView={() => {}}
      />

      {/* Settings overlay - TODO: implement SettingsView */}
      {showSettings && (
        <div className="absolute inset-0 bg-background z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button onClick={hideSettings} className="text-description hover:text-foreground">
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <p className="text-description">Settings view - Coming soon</p>
          </div>
        </div>
      )}

      {/* History overlay - TODO: implement HistoryView */}
      {showHistory && (
        <div className="absolute inset-0 bg-background z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">History</h2>
            <button onClick={hideHistory} className="text-description hover:text-foreground">
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <p className="text-description">History view - Coming soon</p>
          </div>
        </div>
      )}

      {/* MCP overlay - TODO: implement McpView */}
      {showMcp && (
        <div className="absolute inset-0 bg-background z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">MCP Servers</h2>
            <button onClick={closeMcpView} className="text-description hover:text-foreground">
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <p className="text-description">MCP configuration view - Coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Root App component with provider
const App: React.FC = () => {
  return (
    <ExtensionStateContextProvider>
      <AppContent />
    </ExtensionStateContextProvider>
  );
};

export default App;
