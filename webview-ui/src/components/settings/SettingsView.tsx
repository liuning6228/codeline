/**
 * 设置视图
 * 基于Claude Code的配置驱动设计模式
 * 提供完整的配置管理和设置界面
 */

import React, { useState, useEffect } from 'react';
import { SettingsViewConfig } from '../../config/codeline-config';
import { ConfigService } from '../../config/config-service';

interface SettingsViewProps {
  /** 设置视图配置 */
  config: SettingsViewConfig;
  /** 导航回调函数 */
  onNavigate?: (viewName: string) => void;
  /** 关闭回调 */
  onClose?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ config, onNavigate, onClose }) => {
  const [activeModule, setActiveModule] = useState<string>('model');
  const [configService] = useState(() => ConfigService.getInstance());
  const [isLoading, setIsLoading] = useState(true);
  
  // 初始化配置
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(false);
    };
    
    if (config.enabled) {
      initialize();
    }
  }, [config]);
  
  // 重置配置
  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      await configService.resetToDefaults();
      alert('Settings have been reset to defaults');
    }
  };
  
  // 导出配置
  const handleExport = () => {
    const configJson = configService.exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codeline-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // 导入配置
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          await configService.importConfig(text);
          alert('Configuration imported successfully');
        } catch (error) {
          alert('Failed to import configuration: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      }
    };
    input.click();
  };
  
  // 渲染模块内容
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'model':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">AI Model Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Model Provider</label>
                <select className="w-full p-2 bg-background border border-border rounded">
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="local">Local</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input 
                  type="password" 
                  className="w-full p-2 bg-background border border-border rounded" 
                  placeholder="Enter your API key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Default Model</label>
                <input 
                  type="text" 
                  className="w-full p-2 bg-background border border-border rounded" 
                  placeholder="gpt-4" 
                  defaultValue="gpt-4"
                />
              </div>
            </div>
          </div>
        );
        
      case 'task':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Task Execution Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Auto-execute tasks</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Require approval before execution</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Enable event streaming</span>
              </label>
              <div>
                <label className="block text-sm font-medium mb-2">Max Concurrent Tasks</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  className="w-32 p-2 bg-background border border-border rounded" 
                  defaultValue="1"
                />
              </div>
            </div>
          </div>
        );
        
      case 'tools':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Tool System Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Enable file operations</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Enable terminal execution</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Enable browser automation</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Enable MCP tools</span>
              </label>
            </div>
          </div>
        );
        
      case 'ui':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">UI & Theme Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select className="w-full p-2 bg-background border border-border rounded">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <select className="w-full p-2 bg-background border border-border rounded">
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Enable animations</span>
              </label>
            </div>
          </div>
        );
        
      case 'advanced':
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Log Level</label>
                <select className="w-full p-2 bg-background border border-border rounded">
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cache Duration (minutes)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="1440" 
                  className="w-32 p-2 bg-background border border-border rounded" 
                  defaultValue="60"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Enable experimental features</span>
              </label>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8 text-gray-400">
            <div className="text-lg mb-2">Module Not Available</div>
            <p className="text-sm">This settings module is not configured or unavailable</p>
          </div>
        );
    }
  };
  
  if (!config.enabled) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Settings View Disabled</div>
          <div className="text-gray-400 mb-4">
            The settings interface is currently disabled
          </div>
          {onClose && (
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={onClose}
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-400">Loading settings...</div>
      </div>
    );
  }
  
  const availableModules = Object.entries(config.modules)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
  
  return (
    <div className="flex h-full flex-col p-6">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Configure CodeLine to match your preferences</p>
        </div>
        <div className="flex space-x-2">
          {config.supportsImportExport && (
            <>
              <button
                onClick={handleImport}
                className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm"
              >
                Import
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm"
              >
                Export
              </button>
            </>
          )}
          {config.showResetButton && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded text-sm"
            >
              Reset
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm"
            >
              Close
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* 设置模块导航 */}
        <div className="w-64 pr-6 border-r border-border">
          <div className="space-y-1">
            {availableModules.map(module => {
              const moduleNames: Record<string, string> = {
                model: 'AI Model',
                task: 'Task Execution',
                tools: 'Tools',
                ui: 'UI & Theme',
                advanced: 'Advanced',
              };
              
              const moduleIcons: Record<string, string> = {
                model: '🤖',
                task: '⚡',
                tools: '🔧',
                ui: '🎨',
                advanced: '⚙️',
              };
              
              return (
                <button
                  key={module}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                    activeModule === module
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => setActiveModule(module)}
                >
                  <span className="text-lg">{moduleIcons[module] || '📄'}</span>
                  <span>{moduleNames[module] || module}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* 设置内容 */}
        <div className="flex-1 pl-6 overflow-auto">
          <div className="max-w-2xl">
            {renderModuleContent()}
            
            {/* 保存按钮 */}
            <div className="mt-12 pt-6 border-t border-border">
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                Save Changes
              </button>
              <button className="ml-4 px-6 py-2 bg-secondary hover:bg-secondary/80 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;