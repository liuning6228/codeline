"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChatHeader = ({ onClearChat }) => {
    return (<div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold">CodeLine Chat</h1>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-400">Connected</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/80" onClick={onClearChat}>
          Clear Chat
        </button>
        
        <div className="relative">
          <button className="flex items-center space-x-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/80">
            <span>Model: DeepSeek</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>);
};
exports.default = ChatHeader;
//# sourceMappingURL=ChatHeader.js.map