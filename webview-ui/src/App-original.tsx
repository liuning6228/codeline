import { useState, useEffect } from 'react'
import ChatView from './components/chat/ChatView'
import SettingsView from './components/settings/SettingsView'
import HistoryView from './components/history/HistoryView'
import WelcomeView from './components/welcome/WelcomeView'
import './App.css'

// 视图类型
type ViewType = 'chat' | 'settings' | 'history' | 'welcome'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('chat')
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化应用
  useEffect(() => {
    // 模拟初始化
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-400">Loading CodeLine...</div>
      </div>
    )
  }

  // 根据当前视图渲染内容
  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatView />
      case 'settings':
        return <SettingsView onClose={() => setCurrentView('chat')} />
      case 'history':
        return <HistoryView onClose={() => setCurrentView('chat')} />
      case 'welcome':
        return <WelcomeView onGetStarted={() => setCurrentView('chat')} />
      default:
        return <ChatView />
    }
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* 顶部导航栏 */}
      <nav className="flex items-center border-b border-border bg-secondary px-4 py-2">
        <div className="flex items-center space-x-2">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentView === 'chat' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
            onClick={() => setCurrentView('chat')}
          >
            Chat
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentView === 'history' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
            onClick={() => setCurrentView('history')}
          >
            History
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentView === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
            onClick={() => setCurrentView('settings')}
          >
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
    </div>
  )
}

export default App