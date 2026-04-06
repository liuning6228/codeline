/**
 * MessagesArea - Virtualized message list area
 * Uses react-virtuoso for performance
 */

import React, { useRef, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { ClineMessage } from '@/context/ExtensionStateContext';

interface MessagesAreaProps {
  messages: ClineMessage[];
  expandedRows: Set<number>;
  onToggleExpand: (ts: number) => void;
  onHeightChange?: (isTaller: boolean) => void;
}

export const MessagesArea: React.FC<MessagesAreaProps> = ({
  messages,
  expandedRows,
  onToggleExpand,
  onHeightChange,
}) => {
  const virtuosoRef = useRef<any>(null);

  const itemContent = useCallback((index: number) => {
    const message = messages[index];
    const isExpanded = expandedRows.has(message.ts);
    const isLast = index === messages.length - 1;

    return (
      <MessageRow
        key={message.ts}
        message={message}
        isExpanded={isExpanded}
        isLast={isLast}
        onToggleExpand={() => onToggleExpand(message.ts)}
        onHeightChange={onHeightChange}
      />
    );
  }, [messages, expandedRows, onToggleExpand, onHeightChange]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        itemContent={(index) => itemContent(index)}
        followOutput="smooth"
        alignToBottom
        className="h-full"
      />
    </div>
  );
};

// Message Row component
const MessageRow: React.FC<{
  message: ClineMessage;
  isExpanded: boolean;
  isLast: boolean;
  onToggleExpand: () => void;
  onHeightChange?: (isTaller: boolean) => void;
}> = ({ message, isExpanded, onToggleExpand }) => {
  const isUserMessage = message.type === 'say' && message.say === 'user_feedback';
  const isAssistantMessage = message.type === 'say' && (message.say === 'text' || message.say === 'completion_result');

  return (
    <div className={`px-4 py-2 ${
      isUserMessage ? 'bg-sidebar' : ''
    }`}>
      {isUserMessage ? (
        <UserMessageContent message={message} />
      ) : isAssistantMessage ? (
        <AssistantMessageContent message={message} isExpanded={isExpanded} onToggleExpand={onToggleExpand} />
      ) : (
        <GenericMessageContent message={message} />
      )}
    </div>
  );
};

// User Message
const UserMessageContent: React.FC<{ message: ClineMessage }> = ({ message }) => (
  <div className="flex items-start gap-2">
    <div className="flex-1">
      <div className="text-sm text-foreground whitespace-pre-wrap">
        {message.text}
      </div>
      {message.images && message.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {message.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Attached image ${i + 1}`}
              className="max-w-32 max-h-32 rounded border border-border"
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

// Assistant Message
const AssistantMessageContent: React.FC<{
  message: ClineMessage;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({ message, isExpanded, onToggleExpand }) => (
  <div className="flex items-start gap-2">
    <div className="flex-1">
      <div className={`text-sm text-foreground whitespace-pre-wrap ${
        !isExpanded ? 'line-clamp-6' : ''
      }`}>
        {message.text}
      </div>
      {message.text && message.text.length > 500 && (
        <button
          className="text-xs text-link hover:text-link-hover mt-1"
          onClick={onToggleExpand}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  </div>
);

// Generic Message
const GenericMessageContent: React.FC<{ message: ClineMessage }> = ({ message }) => (
  <div className="text-sm text-description">
    {message.text || `[${
      message.type === 'ask' ? message.ask : message.say
    }]`}
  </div>
);

export default MessagesArea;
