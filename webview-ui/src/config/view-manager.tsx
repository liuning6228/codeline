/**
 * CodeLine 视图管理器
 * 基于配置驱动的视图系统，支持Cline的8视图动态管理
 */

import React, { ComponentType } from 'react';
import { CodeLineConfig } from './codeline-config';
import { ConfigService } from './config-service';

// 视图组件映射类型
export interface ViewComponentMap {
  [viewName: string]: ComponentType<any>;
}

// 视图属性接口
export interface ViewProps {
  /** 视图配置 */
  config: any;
  /** 导航回调函数 */
  onNavigate?: (viewName: string) => void;
  /** 视图特定的其他属性 */
  [key: string]: any;
}

/**
 * 配置驱动的视图管理器
 * 基于Claude Code的配置驱动对话引擎模式 (CP-20260401-001)
 */
export class ConfigDrivenViewManager {
  private configService: ConfigService;
  private viewComponents: ViewComponentMap = {};
  private viewFactories: Map<string, (config: any) => ComponentType<any>> = new Map();
  
  constructor() {
    this.configService = ConfigService.getInstance();
    this.registerBuiltinViewFactories();
  }
  
  /**
   * 注册内置视图工厂
   */
  private registerBuiltinViewFactories(): void {
    // 聊天视图工厂
    this.registerViewFactory('chat', async (config) => {
      const { default: ChatView } = await import('../components/chat/ChatView');
      return (props: ViewProps) => React.createElement(ChatView, props);
    });
    
    // 设置视图工厂
    this.registerViewFactory('settings', async (config) => {
      const { default: SettingsView } = await import('../components/settings/SettingsView');
      return (props: ViewProps) => React.createElement(SettingsView, {
        ...props,
        onClose: () => props.onNavigate?.('chat'),
      });
    });
    
    // 历史视图工厂
    this.registerViewFactory('history', async (config) => {
      const { default: HistoryView } = await import('../components/history/HistoryView');
      return (props: ViewProps) => React.createElement(HistoryView, {
        ...props,
        onClose: () => props.onNavigate?.('chat'),
      });
    });
    
    // 欢迎视图工厂
    this.registerViewFactory('welcome', async (config) => {
      const { default: WelcomeView } = await import('../components/welcome/WelcomeView');
      return (props: ViewProps) => React.createElement(WelcomeView, {
        ...props,
        onGetStarted: () => props.onNavigate?.('chat'),
      });
    });
    
    // MCP视图工厂
    this.registerViewFactory('mcp', async (config) => {
      try {
        const { default: McpView } = await import('../components/mcp/McpView');
        return (props: ViewProps) => React.createElement(McpView, props);
      } catch (error) {
        console.error('Failed to load MCP view:', error);
        // 返回占位符作为后备
        const McpPlaceholder = (props: ViewProps) => (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">MCP View</div>
              <div className="text-gray-400 mb-4">
                Model Context Protocol configuration interface
              </div>
              <div className="text-sm text-gray-500">
                Coming soon - Full MCP integration with dynamic tool loading
              </div>
            </div>
          </div>
        );
        return McpPlaceholder;
      }
    });
    
    // 账户视图工厂
    this.registerViewFactory('account', async (config) => {
      try {
        const { default: AccountView } = await import('../components/account/AccountView');
        return (props: ViewProps) => React.createElement(AccountView, props);
      } catch (error) {
        console.error('Failed to load Account view:', error);
        // 返回占位符作为后备
        const AccountPlaceholder = (props: ViewProps) => (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">Account View</div>
              <div className="text-gray-400 mb-4">
                User account management and preferences
              </div>
              <div className="text-sm text-gray-500">
                Coming soon - Multi-account support with usage statistics
              </div>
            </div>
          </div>
        );
        return AccountPlaceholder;
      }
    });
    
    // 工作区视图工厂
    this.registerViewFactory('worktrees', async (config) => {
      try {
        const { default: WorktreesView } = await import('../components/worktrees/WorktreesView');
        return (props: ViewProps) => React.createElement(WorktreesView, props);
      } catch (error) {
        console.error('Failed to load Worktrees view:', error);
        // 返回占位符作为后备
        const WorktreesPlaceholder = (props: ViewProps) => (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">Worktrees View</div>
              <div className="text-gray-400 mb-4">
                Workspace snapshots and version management
              </div>
              <div className="text-sm text-gray-500">
                Coming soon - State snapshotting and difference comparison
              </div>
            </div>
          </div>
        );
        return WorktreesPlaceholder;
      }
    });
    
    // 引导视图工厂
    this.registerViewFactory('onboarding', async (config) => {
      try {
        const { default: OnboardingView } = await import('../components/onboarding/OnboardingView');
        return (props: ViewProps) => React.createElement(OnboardingView, props);
      } catch (error) {
        console.error('Failed to load Onboarding view:', error);
        // 返回占位符作为后备
        const OnboardingPlaceholder = (props: ViewProps) => (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">Onboarding View</div>
              <div className="text-gray-400 mb-4">
                Guided setup and configuration wizard
              </div>
              <div className="text-sm text-gray-500">
                Coming soon - Step-by-step configuration guide
              </div>
            </div>
          </div>
        );
        return OnboardingPlaceholder;
      }
    });
  }
  
  /**
   * 注册视图工厂
   */
  public registerViewFactory(
    viewName: string, 
    factory: (config: any) => Promise<ComponentType<any>>
  ): void {
    this.viewFactories.set(viewName, async (config: any) => {
      try {
        return await factory(config);
      } catch (error) {
        console.error(`Failed to create view factory for ${viewName}:`, error);
        // 返回错误占位符组件
        return (props: ViewProps) => (
          <div className="flex h-full items-center justify-center text-red-500">
            <div>
              <div className="text-xl font-semibold">Error Loading {viewName}</div>
              <div className="text-sm mt-2">Failed to load view component</div>
            </div>
          </div>
        );
      }
    });
  }
  
  /**
   * 基于配置初始化视图
   */
  public async initializeViews(): Promise<ViewComponentMap> {
    const config = this.configService.getConfig();
    const enabledViews = this.configService.getEnabledViews();
    
    console.log(`Initializing ${enabledViews.length} enabled views:`, enabledViews);
    
    // 清空现有视图组件
    this.viewComponents = {};
    
    // 为每个启用的视图创建组件
    for (const viewName of enabledViews) {
      try {
        const viewConfig = config.views[viewName as keyof CodeLineConfig['views']];
        await this.initializeView(viewName, viewConfig);
      } catch (error) {
        console.error(`Failed to initialize view ${viewName}:`, error);
      }
    }
    
    return { ...this.viewComponents };
  }
  
  /**
   * 初始化单个视图
   */
  private async initializeView(viewName: string, viewConfig: any): Promise<void> {
    const factory = this.viewFactories.get(viewName);
    
    if (!factory) {
      console.warn(`No factory registered for view: ${viewName}`);
      
      // 创建默认占位符组件
      this.viewComponents[viewName] = (props: ViewProps) => (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold mb-2">{viewName} View</div>
            <div className="text-gray-400">
              View component not implemented yet
            </div>
          </div>
        </div>
      );
      return;
    }
    
    try {
      // 使用工厂创建组件
      const component = await factory(viewConfig);
      this.viewComponents[viewName] = component;
      
      console.log(`View ${viewName} initialized successfully`);
    } catch (error) {
      console.error(`Failed to create view ${viewName}:`, error);
      
      // 创建错误组件
      this.viewComponents[viewName] = (props: ViewProps) => (
        <div className="flex h-full items-center justify-center text-red-500">
          <div>
            <div className="text-xl font-semibold">Error Loading {viewName}</div>
            <div className="text-sm mt-2">{error instanceof Error ? error.message : 'Unknown error'}</div>
          </div>
        </div>
      );
    }
  }
  
  /**
   * 获取视图组件
   */
  public getViewComponent(viewName: string): ComponentType<any> | undefined {
    return this.viewComponents[viewName];
  }
  
  /**
   * 获取所有视图组件
   */
  public getViewComponents(): ViewComponentMap {
    return { ...this.viewComponents };
  }
  
  /**
   * 重新初始化视图（配置更新后）
   */
  public async reinitializeViews(): Promise<ViewComponentMap> {
    console.log('Reinitializing views due to configuration change');
    return await this.initializeViews();
  }
  
  /**
   * 获取视图显示名称
   */
  public getViewDisplayName(viewName: string): string {
    const displayNames: Record<string, string> = {
      'chat': 'Chat',
      'settings': 'Settings',
      'history': 'History',
      'mcp': 'MCP',
      'account': 'Account',
      'worktrees': 'Worktrees',
      'welcome': 'Welcome',
      'onboarding': 'Onboarding',
    };
    
    return displayNames[viewName] || viewName.charAt(0).toUpperCase() + viewName.slice(1);
  }
  
  /**
   * 获取视图图标（占位符）
   */
  public getViewIcon(viewName: string): string {
    const icons: Record<string, string> = {
      'chat': '💬',
      'settings': '⚙️',
      'history': '📚',
      'mcp': '🔧',
      'account': '👤',
      'worktrees': '📁',
      'welcome': '👋',
      'onboarding': '🚀',
    };
    
    return icons[viewName] || '📄';
  }
  
  /**
   * 获取视图描述
   */
  public getViewDescription(viewName: string): string {
    const descriptions: Record<string, string> = {
      'chat': 'Chat with CodeLine AI assistant',
      'settings': 'Configure CodeLine preferences and settings',
      'history': 'View conversation history and past tasks',
      'mcp': 'Manage Model Context Protocol tools and connections',
      'account': 'Manage user accounts and usage statistics',
      'worktrees': 'Workspace snapshots and version management',
      'welcome': 'Welcome screen with quick actions',
      'onboarding': 'Guided setup and configuration',
    };
    
    return descriptions[viewName] || `${viewName} view`;
  }
  
  /**
   * 检查视图是否已初始化
   */
  public isViewInitialized(viewName: string): boolean {
    return !!this.viewComponents[viewName];
  }
  
  /**
   * 获取视图配置
   */
  public getViewConfig(viewName: keyof CodeLineConfig['views']): any {
    return this.configService.getViewConfig(viewName);
  }
  
  /**
   * 创建导航菜单项
   */
  public createNavigationItems(currentView: string, onNavigate: (viewName: string) => void) {
    const enabledViews = this.configService.getEnabledViews();
    const config = this.configService.getConfig();
    
    return enabledViews.map(viewName => {
      const viewConfig = config.views[viewName as keyof CodeLineConfig['views']];
      const isActive = currentView === viewName;
      
      return {
        id: viewName,
        name: this.getViewDisplayName(viewName),
        icon: this.getViewIcon(viewName),
        description: this.getViewDescription(viewName),
        enabled: viewConfig.enabled,
        isActive,
        onClick: () => onNavigate(viewName),
      };
    });
  }
}