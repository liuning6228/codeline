"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HistoryView = ({ onClose }) => {
    // 模拟历史记录数据
    const conversations = [
        {
            id: '1',
            title: 'Implement login functionality',
            preview: 'User requested a login system with JWT authentication...',
            timestamp: new Date('2024-03-18T10:30:00'),
            messageCount: 15
        },
        {
            id: '2',
            title: 'Fix responsive design issues',
            preview: 'Help fixing mobile responsiveness for dashboard...',
            timestamp: new Date('2024-03-17T14:20:00'),
            messageCount: 8
        },
        {
            id: '3',
            title: 'Database schema design',
            preview: 'Design schema for e-commerce application...',
            timestamp: new Date('2024-03-16T09:15:00'),
            messageCount: 12
        },
        {
            id: '4',
            title: 'API endpoint implementation',
            preview: 'Create REST API for user management...',
            timestamp: new Date('2024-03-15T16:45:00'),
            messageCount: 10
        },
    ];
    return (<div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Conversation History</h1>
            <p className="mt-1 text-gray-400">
              Browse and restore previous conversations
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 hover:bg-secondary">
            Back to Chat
          </button>
        </div>

        {conversations.length === 0 ? (<div className="flex h-64 items-center justify-center rounded-lg border border-border">
            <div className="text-center">
              <p className="text-lg text-gray-500">No conversation history yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Start chatting to see your history here
              </p>
            </div>
          </div>) : (<div className="space-y-3">
            {conversations.map((conversation) => (<div key={conversation.id} className="rounded-lg border border-border p-4 hover:bg-secondary/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{conversation.title}</h3>
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                      {conversation.preview}
                    </p>
                    <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        {conversation.timestamp.toLocaleDateString()} at{' '}
                        {conversation.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span>{conversation.messageCount} messages</span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    <button className="rounded border border-border px-3 py-1 text-sm hover:bg-secondary">
                      View
                    </button>
                    <button className="rounded border border-border px-3 py-1 text-sm hover:bg-secondary">
                      Restore
                    </button>
                    <button className="rounded border border-border px-3 py-1 text-sm text-red-400 hover:bg-secondary">
                      Delete
                    </button>
                  </div>
                </div>
              </div>))}
          </div>)}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <div className="text-sm text-gray-500">
            Showing {conversations.length} conversations
          </div>
          <div className="flex space-x-2">
            <button className="rounded border border-border px-3 py-1 text-sm hover:bg-secondary">
              Export All
            </button>
            <button className="rounded border border-border px-3 py-1 text-sm hover:bg-secondary">
              Clear All History
            </button>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = HistoryView;
//# sourceMappingURL=HistoryView.js.map