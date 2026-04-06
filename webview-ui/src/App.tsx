/**
 * CodeLine Main Application
 * Based on Cline's multi-view architecture
 */

import React from 'react';
import { ExtensionStateContextProvider, useExtensionState } from './context/ExtensionStateContext';
import { ChatView } from './components/chat/chat-view';

// Main app content - uses extension state
const AppContent: React.FC = () => {
  const {
    showSettings,
    showHistory,
    showWelcome,
    didHydrateState,
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
      {/* Main Chat View - always rendered */}
      <ChatView
        isHidden={showSettings || showHistory}
        showHistoryView={() => {}}
      />

      {/* Settings overlay - TODO: implement SettingsView */}
      {showSettings && (
        <div className="absolute inset-0 bg-background z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Settings</h2>
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
          </div>
          <div className="flex-1 overflow-auto p-4">
            <p className="text-description">History view - Coming soon</p>
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
