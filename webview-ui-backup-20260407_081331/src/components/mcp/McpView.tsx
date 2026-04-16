/**
 * MCP视图组件
 * 基于Cline的MCP管理功能
 * 提供MCP服务器的配置和管理界面
 * 集成统一的工具系统
 */

import React, { useState, useEffect } from 'react';
import { McpViewConfig } from '../../config/codeline-config';
import { McpService } from '../../services/mcp-service';
import type { MCPServer, MCPTool } from '../../services/mcp-service';

interface McpViewProps {
  /** MCP视图配置 */
  config: McpViewConfig;
  /** 导航回调函数 */
  onNavigate?: (viewName: string) => void;
}

const McpView: React.FC<McpViewProps> = ({ config, onNavigate }) => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [selectedTab, setSelectedTab] = useState<'servers' | 'tools' | 'usage'>('servers');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddServerDialog, setShowAddServerDialog] = useState(false);
  const [showExecuteToolDialog, setShowExecuteToolDialog] = useState(false);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [newServer, setNewServer] = useState({
    name: '',
    description: '',
    url: '',
    autoConnect: true,
  });
  
  const mcpService = McpService.getInstance();
  
  // 初始化加载数据
  useEffect(() => {
    if (config.enabled) {
      loadMCPData();
    }
  }, [config.enabled]);
  
  const loadMCPData = async () => {
    setIsLoading(true);
    try {
      const initialized = await mcpService.initialize();
      if (initialized) {
        setServers(mcpService.getServers());
        setTools(mcpService.getTools());
      }
    } catch (error) {
      console.error('Failed to load MCP data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const success = await mcpService.refresh();
      if (success) {
        setServers(mcpService.getServers());
        setTools(mcpService.getTools());
      }
    } catch (error) {
      console.error('Failed to refresh MCP data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleServer = async (serverId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await mcpService.connectServer(serverId);
      } else {
        await mcpService.disconnectServer(serverId);
      }
      setServers(mcpService.getServers());
      setTools(mcpService.getTools());
    } catch (error) {
      console.error('Failed to toggle server:', error);
    }
  };
  
  const handleToggleTool = async (toolId: string, enabled: boolean) => {
    try {
      await mcpService.toggleTool(toolId, enabled);
      setTools(mcpService.getTools());
    } catch (error) {
      console.error('Failed to toggle tool:', error);
    }
  };
  
  const handleAddServer = async () => {
    if (!newServer.name.trim() || !newServer.url.trim()) {
      alert('Please provide server name and URL');
      return;
    }
    
    try {
      const success = await mcpService.addServer(newServer);
      if (success) {
        setServers(mcpService.getServers());
        setNewServer({ name: '', description: '', url: '', autoConnect: true });
        setShowAddServerDialog(false);
      }
    } catch (error) {
      console.error('Failed to add server:', error);
    }
  };
  
  const handleRemoveServer = async (serverId: string) => {
    if (!window.confirm('Are you sure you want to remove this MCP server?')) {
      return;
    }
    
    try {
      const success = await mcpService.removeServer(serverId);
      if (success) {
        setServers(mcpService.getServers());
        setTools(mcpService.getTools());
      }
    } catch (error) {
      console.error('Failed to remove server:', error);
    }
  };
  
  const handleExecuteTool = async (tool: MCPTool) => {
    setSelectedTool(tool);
    setShowExecuteToolDialog(true);
    setExecutionResult(null);
  };
  
  const handleExecuteToolConfirm = async (params: Record<string, any>) => {
    if (!selectedTool) return;
    
    try {
      const result = await mcpService.executeTool(selectedTool.id, params);
      setExecutionResult(result);
    } catch (error) {
      console.error('Failed to execute tool:', error);
    }
  };
  
  const getStatusColor = (status: MCPServer['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-500/20';
      case 'disconnected': return 'text-gray-600 bg-gray-500/20';
      case 'error': return 'text-red-600 bg-red-500/20';
      default: return 'text-gray-600 bg-gray-500/20';
    }
  };
  
  const formatTime = (timestamp: number): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - timestamp) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // 过滤工具
  const filteredTools = searchTerm 
    ? mcpService.searchTools(searchTerm)
    : tools;
  
  // 按服务器分组工具
  const toolsByServer = servers.map(server => ({
    server,
    tools: filteredTools.filter(tool => tool.serverId === server.id),
  }));
  
  const serviceStatus = mcpService.getStatus();
  
  if (!config.enabled) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">MCP View Disabled</div>
          <div className="text-gray-400 mb-4">
            MCP tool management is currently disabled in settings
          </div>
          {onNavigate && (
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => onNavigate('settings')}
            >
              Go to Settings
            </button>
          )}
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-400">Loading MCP data...</div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col p-6">
      {/* 头部 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">MCP Tools</h1>
            <p className="text-gray-400">
              Manage Model Context Protocol servers and tools
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={refreshData}
              className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowAddServerDialog(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
            >
              Add Server
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-sm text-gray-400">
            {servers.length} server{servers.length !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-400">
            {tools.length} tool{tools.length !== 1 ? 's' : ''}
          </div>
          <div className="text-sm text-gray-400">
            {serviceStatus.availableToolCount} available
          </div>
        </div>
      </div>
      
      {/* 选项卡 */}
      <div className="flex border-b border-border mb-6">
        <button
          className={`px-4 py-2 font-medium ${selectedTab === 'servers' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setSelectedTab('servers')}
        >
          Servers
        </button>
        <button
          className={`px-4 py-2 font-medium ${selectedTab === 'tools' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setSelectedTab('tools')}
        >
          Tools
        </button>
        <button
          className={`px-4 py-2 font-medium ${selectedTab === 'usage' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setSelectedTab('usage')}
        >
          Usage
        </button>
      </div>
      
      {/* 搜索栏 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tools by name, description, or capability..."
          className="w-full p-3 bg-background border border-border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-auto">
        {selectedTab === 'servers' && (
          <div className="space-y-4">
            {servers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-lg mb-2">No MCP Servers</div>
                <p className="text-sm">Add your first MCP server to get started</p>
              </div>
            ) : (
              servers.map(server => (
                <div key={server.id} className="p-4 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-medium text-lg">{server.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{server.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{server.url}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded capitalize ${getStatusColor(server.status)}`}>
                        {server.status}
                      </span>
                      <button
                        onClick={() => handleToggleServer(server.id, server.status !== 'connected')}
                        className={`px-3 py-1 text-xs rounded ${
                          server.status === 'connected'
                            ? 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                        }`}
                      >
                        {server.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </button>
                      <button
                        onClick={() => handleRemoveServer(server.id)}
                        className="px-3 py-1 text-xs bg-red-500/20 text-red-600 rounded hover:bg-red-500/30"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-400">
                      {server.toolCount} tool{server.toolCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-gray-400">
                      Last connected: {formatTime(server.lastConnected)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {selectedTab === 'tools' && (
          <div className="space-y-6">
            {toolsByServer.map(({ server, tools }) => (
              tools.length > 0 && (
                <div key={server.id}>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="font-medium">{server.name}</div>
                    <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(server.status)}`}>
                      {server.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tools.map(tool => (
                      <div key={tool.id} className="p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium">{tool.name}</div>
                            <div className="text-sm text-gray-400 mt-1">{tool.description}</div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={tool.enabled}
                                onChange={(e) => handleToggleTool(tool.id, e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-xs">Enable</span>
                            </label>
                            <button
                              onClick={() => handleExecuteTool(tool)}
                              className="px-2 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30"
                              disabled={!tool.enabled}
                            >
                              Execute
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tool.capabilities.map(cap => (
                            <span
                              key={cap}
                              className="px-2 py-0.5 bg-secondary text-xs rounded"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-400">
                          <div>v{tool.version}</div>
                          <div>
                            Used {tool.usageCount} time{tool.usageCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
            
            {filteredTools.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-lg mb-2">
                  {searchTerm ? 'No tools found' : 'No tools available'}
                </div>
                <p className="text-sm">
                  {searchTerm ? 'Try a different search term' : 'Connect MCP servers to access tools'}
                </p>
              </div>
            )}
          </div>
        )}
        
        {selectedTab === 'usage' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <h3 className="font-medium mb-3">Tool Usage Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold">{tools.length}</div>
                  <div className="text-sm text-gray-400">Total Tools</div>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold">{serviceStatus.availableToolCount}</div>
                  <div className="text-sm text-gray-400">Available Tools</div>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold">
                    {tools.reduce((sum, tool) => sum + tool.usageCount, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Executions</div>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold">
                    {servers.filter(s => s.status === 'connected').length}
                  </div>
                  <div className="text-sm text-gray-400">Active Servers</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-border">
              <h3 className="font-medium mb-3">Recently Used Tools</h3>
              {tools
                .filter(tool => tool.lastUsed)
                .sort((a, b) => b.lastUsed - a.lastUsed)
                .slice(0, 5)
                .map(tool => (
                  <div key={tool.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-sm text-gray-400">{tool.description}</div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Last used: {formatTime(tool.lastUsed)}
                    </div>
                  </div>
                ))}
              
              {tools.filter(tool => tool.lastUsed).length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  No tool usage recorded yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 添加服务器对话框 */}
      {showAddServerDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Add MCP Server</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Server Name</label>
                <input
                  type="text"
                  className="w-full p-2 bg-background border border-border rounded"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  placeholder="My MCP Server"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  className="w-full p-2 bg-background border border-border rounded"
                  value={newServer.description}
                  onChange={(e) => setNewServer({ ...newServer, description: e.target.value })}
                  placeholder="Server description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Server URL</label>
                <input
                  type="text"
                  className="w-full p-2 bg-background border border-border rounded"
                  value={newServer.url}
                  onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                  placeholder="ws://localhost:3000 or mcp://server.example.com"
                />
              </div>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newServer.autoConnect}
                  onChange={(e) => setNewServer({ ...newServer, autoConnect: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Auto-connect on startup</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddServerDialog(false)}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddServer}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Add Server
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 执行工具对话框 */}
      {showExecuteToolDialog && selectedTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-medium mb-4">Execute Tool: {selectedTool.name}</h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400">{selectedTool.description}</div>
              <div className="text-xs text-gray-500 mt-1">Version: {selectedTool.version}</div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Parameters</h4>
                <textarea
                  className="w-full p-2 bg-background border border-border rounded font-mono text-sm"
                  rows={6}
                  placeholder={
                    'Enter JSON parameters for the tool:\n\n' +
                    'Example:\n' +
                    '{\n' +
                    '  "input": "text to process",\n' +
                    '  "options": {\n' +
                    '    "format": "json"\n' +
                    '  }\n' +
                    '}'
                  }
                />
              </div>
              
              {executionResult && (
                <div>
                  <h4 className="font-medium mb-2">Execution Result</h4>
                  <div className={`p-3 rounded ${executionResult.success ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                    <div className="font-medium">
                      {executionResult.success ? '✓ Success' : '✗ Failed'}
                    </div>
                    {executionResult.output && (
                      <pre className="mt-2 text-sm whitespace-pre-wrap">
                        {JSON.stringify(executionResult.output, null, 2)}
                      </pre>
                    )}
                    {executionResult.error && (
                      <div className="mt-2 text-sm">{executionResult.error}</div>
                    )}
                    <div className="text-xs mt-2 opacity-75">
                      Duration: {executionResult.duration}ms
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowExecuteToolDialog(false);
                  setSelectedTool(null);
                  setExecutionResult(null);
                }}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded"
              >
                {executionResult ? 'Close' : 'Cancel'}
              </button>
              {!executionResult && (
                <button
                  onClick={() => handleExecuteToolConfirm({})}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Execute Tool
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default McpView;