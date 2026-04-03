import { Message } from './ChatView'

interface MessageListProps {
  messages: Message[]
}

const MessageList = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="mb-2 text-lg">No messages yet</p>
          <p className="text-sm">Start a conversation with CodeLine</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`rounded-lg border border-border p-4 ${message.role === 'user' ? 'ml-4 bg-secondary' : 'mr-4 bg-background'}`}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${message.role === 'user' ? 'bg-primary' : message.role === 'assistant' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium capitalize">
                {message.role}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {message.content}
            </pre>
          </div>
          
          {/* 操作按钮 */}
          <div className="mt-3 flex justify-end space-x-2">
            {message.role === 'assistant' && (
              <>
                <button className="rounded border border-border px-2 py-1 text-xs hover:bg-secondary">
                  Copy
                </button>
                <button className="rounded border border-border px-2 py-1 text-xs hover:bg-secondary">
                  Regenerate
                </button>
                <button className="rounded border border-border px-2 py-1 text-xs hover:bg-secondary">
                  Insert to Editor
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessageList