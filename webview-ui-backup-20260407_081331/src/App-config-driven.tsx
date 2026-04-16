/**
 * CodeLine 主应用组件（配置驱动版本）
 * 基于Claude Code的配置驱动对话引擎模式 (CP-20260401-001)
 * 支持Cline的8视图系统动态管理
 */

import React, { useState, useEffect } from 'react';
import { ConfigService } from './config/config-service';
import { ConfigDrivenViewManager } from './config/view-manager';
import { CodeLineConfig } from './config/codeline-config';

// 视图类型（基于配置动态确定）
type ViewType = string;

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('welcome');
  const [views, setViews] = useState<Record<string, React.ComponentType<any>>>({});
  const [config, setConfig] = useState<CodeLineConfig | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewManager, setViewManager] = useState<ConfigDrivenViewManager | null>(null);
  
  // 初始化配置和视图管理器
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing CodeLine with config-driven architecture...');
      
      try {
        // 初始化配置服务
        const configService = ConfigService.getInstance();
        const loadedConfig = await configService.loadConfig();
        setConfig(loadedConfig);
        
        // 初始化视图管理器
        const manager = new ConfigDrivenViewManager();
        setViewManager(manager);
        
        // 基于配置初始化视图
        const initializedViews = await manager.initializeViews();
        setViews(initializedViews);
        
        // 设置默认视图
        const enabledViews = configService.getEnabledViews();
        if (enabledViews.length > 0) {
          // 如果是首次使用且启用了引导视图，显示引导
          if (loadedConfig.views.onboarding.enabled && loadedConfig.views.onboarding.autoStartOnFirstUse) {
            setCurrentView('onboarding');
          }
          // 如果启用了欢迎视图且配置为启动时显示，显示欢迎
          else if (loadedConfig.views.welcome.enabled && loadedConfig.views.welcome.showOnStartup) {
            setCurrentView('welcome');
          } else {
            // 否则显示第一个启用的视图
            setCurrentView(enabledViews[0]);
          }
        }
        
        // 监听配置变更
        configService.addConfigChangeListener(async (newConfig) => {
          console.log('Configuration changed, reinitializing views...');
          setConfig(newConfig);
          
          if (manager) {
            const updatedViews = await manager.reinitializeViews();
            setViews(updatedViews);
          }
        });
        
        setIsInitialized(true);
        console.log('CodeLine initialization complete');
      } catch (error) {
        console.error('Failed to initialize CodeLine:', error);
        setIsInitialized(true); // 即使出错也显示UI
      }
    };
    
    initializeApp();
    
    // 清理函数
    return () => {
      if (viewManager) {
        // 清理资源（如果需要）
      }
    };
  }, []);
  
  // 处理视图导航
  const handleNavigate = (viewName: string) => {
    if (views[viewName]) {
      setCurrentView(viewName);
    } else {
      console.warn(`View ${viewName} not found or not initialized`);
    }
  };
  
  // 渲染当前视图
  const renderCurrentView = () => {
    const ViewComponent = views[currentView];
    
    if (!ViewComponent) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold mb-2">View Not Found</div>
            <div className="text-gray-400 mb-4">
              The view "{currentView}" is not available or not initialized.
            </div>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => handleNavigate('chat')}
            >
              Go to Chat
            </button>
          </div>
        </div>
      );
    }
    
    // 获取视图配置
    const viewConfig = config?.views[currentView as keyof CodeLineConfig['views']] || {};
    
    // 创建视图属性
    const viewProps = {
      config: viewConfig,
      onNavigate: handleNavigate,
    };
    
    return React.createElement(ViewComponent, viewProps);
  };
  
  // 获取导航菜单项
  const getNavigationItems = () => {
    if (!viewManager) return [];
    return viewManager.createNavigationItems(currentView, handleNavigate);
  };
  
  // 获取应用标题
  const getAppTitle = () => {
    if (!viewManager || !config) return 'CodeLine';
    
    const viewDisplayName = viewManager.getViewDisplayName(currentView);
    return `CodeLine - ${viewDisplayName}`;
  };
  
  if (!isInitialized) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="text-3xl font-bold mb-4">CodeLine</div>
          <div className="text-lg text-gray-400 mb-6">Your AI Coding Assistant</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
            <span className="ml-2 text-sm text-gray-400">Initializing configuration...</span>
          </div>
        </div>
      </div>
    );
  }
  
  const navigationItems = getNavigationItems();
  
  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* 顶部导航栏 - 基于配置动态生成 */}
      <nav className="flex items-center border-b border-border bg-secondary px-4 py-2">
        {/* 应用标志 */}
        <div className="flex items-center space-x-3 mr-6">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">CL</span>
          </div>
          <div className="text-sm font-semibold">CodeLine</div>
        </div>
        
        {/* 视图导航菜单 */}
        <div className="flex items-center space-x-1 flex-1">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 capitalize ${
                item.isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-secondary'
              }`}
              onClick={item.onClick}
              title={item.description}
              disabled={!item.enabled}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        
        {/* 右侧状态信息 */}
        <div className="ml-auto flex items-center space-x-4">
          {config?.ui.showVersion && (
            <div className="text-xs text-gray-400">
              v{config.ui.version}
            </div>
          )}
          
          {/* 配置状态指示器 */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="text-xs text-gray-400">
              {navigationItems.length} view{navigationItems.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* 快速操作菜单（如果需要） */}
          <button
            className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded"
            onClick={() => handleNavigate('settings')}
          >
            ⚙️ Settings
          </button>
        </div>
      </nav>
      
      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto">
        {config ? renderCurrentView() : (
          <div className="flex h-full items-center justify-center">
            <div className="text-lg text-gray-400">Loading configuration...</div>
          </div>
        )}
      </main>
      
      {/* 底部状态栏（可选） */}
      {config?.ui.showVersion && (
        <div className="border-t border-border bg-secondary px-4 py-1">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">
              CodeLine v{config.ui.version} • {currentView} view
            </div>
            <div className="text-xs text-gray-400">
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;