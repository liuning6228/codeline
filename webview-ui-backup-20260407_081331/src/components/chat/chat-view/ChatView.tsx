/**
 * ChatView - Main chat view component
 * Combines all chat sub-components into a complete chat interface
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useExtensionState } from '@/context/ExtensionStateContext';
import {
  ChatLayout,
  WelcomeSection,
  TaskSection,
  MessagesArea,
  InputSection,
  ActionButtons,
} from './components/layout';

interface ChatViewProps {
  isHidden?: boolean;
  showHistoryView?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  isHidden = false,
  showHistoryView,
}) => {
  const {
    clineMessages,
    taskHistory,
    currentTask,
    isProcessing,
    mode,
    setMode,
    sendMessage,
  } = useExtensionState();

  // Local state
  const [inputValue, setInputValue] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Get the first message as task if it exists
  const task = useMemo(() => {
    if (clineMessages.length > 0) {
      const firstMessage = clineMessages[0];
      return {
        text: firstMessage.text,
        status: isProcessing ? 'in_progress' : 'completed',
      };
    }
    return undefined;
  }, [clineMessages, isProcessing]);

  // Messages after the task
  const chatMessages = useMemo(() => {
    return clineMessages.slice(1);
  }, [clineMessages]);

  // Toggle row expansion
  const handleToggleExpand = useCallback((ts: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(ts)) {
        next.delete(ts);
      } else {
        next.add(ts);
      }
      return next;
    });
  }, []);

  // Handle send message
  const handleSend = useCallback(() => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, sendMessage]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    // TODO: Implement cancel
    console.log('Cancel task');
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    setInputValue('');
    setExpandedRows(new Set());
  }, []);

  // Placeholder text based on state
  const placeholderText = useMemo(() => {
    if (task) {
      return 'Type a message...';
    }
    return 'What would you like me to help you with?';
  }, [task]);

  return (
    <ChatLayout isHidden={isHidden}>
      {/* Task section (when task is active) */}
      {task && (
        <TaskSection
          task={task}
          isProcessing={isProcessing}
          progress={isProcessing ? 50 : undefined}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Welcome section (when no task) */}
        {!task && (
          <WelcomeSection
            taskHistory={taskHistory}
            onNavigate={() => textAreaRef.current?.focus()}
          />
        )}

        {/* Messages area (when task is active) */}
        {task && chatMessages.length > 0 && (
          <MessagesArea
            messages={chatMessages}
            expandedRows={expandedRows}
            onToggleExpand={handleToggleExpand}
          />
        )}
      </div>

      {/* Action buttons */}
      <ActionButtons
        isProcessing={isProcessing}
        onCancel={handleCancel}
        onClear={handleClear}
      />

      {/* Input section */}
      <InputSection
        inputValue={inputValue}
        setInputValue={setInputValue}
        placeholderText={placeholderText}
        sendingDisabled={isProcessing}
        onSend={handleSend}
        mode={mode}
        onModeChange={setMode}
        textAreaRef={textAreaRef}
      />
    </ChatLayout>
  );
};

export default ChatView;
