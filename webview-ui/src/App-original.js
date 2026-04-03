"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ChatView_1 = require("./components/chat/ChatView");
var SettingsView_1 = require("./components/settings/SettingsView");
var HistoryView_1 = require("./components/history/HistoryView");
var WelcomeView_1 = require("./components/welcome/WelcomeView");
require("./App.css");
function App() {
    var _a = (0, react_1.useState)('chat'), currentView = _a[0], setCurrentView = _a[1];
    var _b = (0, react_1.useState)(false), isInitialized = _b[0], setIsInitialized = _b[1];
    // 初始化应用
    (0, react_1.useEffect)(function () {
        // 模拟初始化
        var timer = setTimeout(function () {
            setIsInitialized(true);
        }, 100);
        return function () { return clearTimeout(timer); };
    }, []);
    if (!isInitialized) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-400">Loading CodeLine...</div>
      </div>);
    }
    // 根据当前视图渲染内容
    var renderView = function () {
        switch (currentView) {
            case 'chat':
                return <ChatView_1.default />;
            case 'settings':
                return <SettingsView_1.default onClose={function () { return setCurrentView('chat'); }}/>;
            case 'history':
                return <HistoryView_1.default onClose={function () { return setCurrentView('chat'); }}/>;
            case 'welcome':
                return <WelcomeView_1.default onGetStarted={function () { return setCurrentView('chat'); }}/>;
            default:
                return <ChatView_1.default />;
        }
    };
    return (<div className="flex h-full flex-col bg-background text-foreground">
      {/* 顶部导航栏 */}
      <nav className="flex items-center border-b border-border bg-secondary px-4 py-2">
        <div className="flex items-center space-x-2">
          <button className={"px-3 py-1.5 rounded-md text-sm font-medium ".concat(currentView === 'chat' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')} onClick={function () { return setCurrentView('chat'); }}>
            Chat
          </button>
          <button className={"px-3 py-1.5 rounded-md text-sm font-medium ".concat(currentView === 'history' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')} onClick={function () { return setCurrentView('history'); }}>
            History
          </button>
          <button className={"px-3 py-1.5 rounded-md text-sm font-medium ".concat(currentView === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary')} onClick={function () { return setCurrentView('settings'); }}>
            Settings
          </button>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <div className="text-xs text-gray-400">
            CodeLine v0.1.0
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>);
}
exports.default = App;
