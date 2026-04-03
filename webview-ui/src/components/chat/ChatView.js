"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const ChatInput_1 = __importDefault(require("./ChatInput"));
const MessageList_1 = __importDefault(require("./MessageList"));
const ChatHeader_1 = __importDefault(require("./ChatHeader"));
const ChatView = () => {
    const [messages, setMessages] = (0, react_1.useState)([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m CodeLine, your AI coding assistant. How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const messagesEndRef = (0, react_1.useRef)(null);
    // 滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    (0, react_1.useEffect)(() => {
        scrollToBottom();
    }, [messages]);
    // 处理发送消息
    const handleSendMessage = async (content) => {
        if (!content.trim() || isProcessing)
            return;
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsProcessing(true);
        // 模拟 AI 回复
        setTimeout(() => {
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I received your message: "${content}". This is a simulated response. In the real implementation, this would connect to an AI model.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsProcessing(false);
        }, 1000);
    };
    // 清除聊天记录
    const handleClearChat = () => {
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: 'Chat cleared. How can I help you today?',
                timestamp: new Date()
            }
        ]);
    };
    return (<div className="flex h-full flex-col">
      <ChatHeader_1.default onClearChat={handleClearChat}/>
      
      <div className="flex-1 overflow-auto p-4">
        <MessageList_1.default messages={messages}/>
        {isProcessing && (<div className="flex items-center space-x-2 p-4 text-gray-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
            <span className="ml-2 text-sm">Thinking...</span>
          </div>)}
        <div ref={messagesEndRef}/>
      </div>

      <div className="border-t border-border p-4">
        <ChatInput_1.default onSendMessage={handleSendMessage} disabled={isProcessing}/>
      </div>
    </div>);
};
exports.default = ChatView;
//# sourceMappingURL=ChatView.js.map