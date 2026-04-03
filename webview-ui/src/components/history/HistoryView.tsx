/**
 * 历史记录视图
 * 基于Claude Code的分布式会话管理模式
 * 提供会话历史记录查看和管理
 */

import React, { useState, useEffect } from 'react';
import { HistoryViewConfig } from '../../config/codeline-config';

interface HistoryViewProps {
  /** 历史视图配置 */
  config: HistoryViewConfig;
  /** 导航回调函数 */
  onNavigate?: (viewName: string) => void;
  /** 关闭回调 */
  onClose?: () => void;
}

interface HistoryEntry {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
  type: 'chat' | 'task' | 'file' | 'command';
  tags: string[];
  size: number;
}

const HistoryView: React.FC<HistoryViewProps> = ({ config, onNavigate, onClose }) => {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // 初始化历史记录
  useEffect(() => {
    const initializeHistory = async () => {
      setIsLoading(true);
      
      try {
        // 模拟加载历史记录
        const mockHistory: HistoryEntry[] = [
          {
            id: 'hist-1',
            title: 'User Authentication Implementation',
            preview: 'Implemented JWT-based authentication system with refresh tokens and role-based access control...',
            timestamp: Date.now() - 3600000, // 1小时前
            type: 'task',
            tags: ['auth', 'backend', 'security'],
            size: 2450,
          },
          {
            id: 'hist-2',
            title: 'API Integration Discussion',
            preview: 'Discussed how to integrate with third-party payment APIs and handle webhook security...',
            timestamp: Date.now() - 7200000, // 2小时前
            type: 'chat',
            tags: ['api', 'integration', 'discussion'],
            size: 1800,
          },
          {
            id: 'hist-3',
            title: 'Database Schema Design',
            preview: 'Designed normalized database schema for user management with proper indexes and constraints...',
            timestamp: Date.now() - 86400000, // 1天前
            type: 'task',
            tags: ['database', 'design', 'schema'],
            size: 3200,
          },
          {
            id: 'hist-4',
            title: 'Frontend Component Refactoring',
            preview: 'Refactored React components to use hooks and improve performance with memoization...',
            timestamp: Date.now() - 172800000, // 2天前
            type: 'task',
            tags: ['frontend', 'react', 'refactoring'],
            size: 1950,
          },
          {
            id: 'hist-5',
            title: 'Deployment Configuration',
            preview: 'Configured CI/CD pipeline for automatic deployment to staging and production environments...',
            timestamp: Date.now() - 259200000, // 3天前
            type: 'task',
            tags: ['devops', 'deployment', 'ci-cd'],
            size: 2800,
          },
          {
            id: 'hist-6',
            title: 'Performance Optimization',
            preview: 'Identified and fixed performance bottlenecks in API response time and database queries...',
            timestamp: Date.now() - 345600000, // 4天前
            type: 'chat',
            tags: ['performance', 'optimization'],
            size: 1650,
          },
        ];
        
        // 按时间倒序排序
        const sortedHistory = mockHistory.sort((a, b) => b.timestamp - a.timestamp);
        
        // 限制数量
        const limitedHistory = sortedHistory.slice(0, config.maxHistoryItems);
        
        setHistoryEntries(limitedHistory);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (config.enabled) {
      initializeHistory();
    }
  }, [config]);
  
  // 过滤历史记录
  const filteredEntries = historyEntries.filter(entry => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.preview.toLowerCase().includes(query) ||
      entry.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });
  
  // 切换选中状态
  const toggleSelection = (entryId: string) => {
    setSelectedEntries(prev => {
      if (prev.includes(entryId)) {
        return prev.filter(id => id !== entryId);
      } else {
        return [...prev, entryId];
      }
    });
  };
  
  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedEntries.length === filteredEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries.map(entry => entry.id));
    }
  };
  
  // 删除选中条目
  const deleteSelected = () => {
    if (selectedEntries.length === 0) return;
    
    if (window.confirm(`Delete ${selectedEntries.length} selected history item(s)?`)) {
      setHistoryEntries(prev => prev.filter(entry => !selectedEntries.includes(entry.id)));
      setSelectedEntries([]);
    }
  };
  
  // 清空所有历史记录
  const clearAllHistory = () => {
    if (historyEntries.length === 0) return;
    
    if (window.confirm(`Clear all ${historyEntries.length} history items? This cannot be undone.`)) {
      setHistoryEntries([]);
      setSelectedEntries([]);
    }
  };
  
  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // 格式化文件大小
  const formatSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // 获取类型图标
  const getTypeIcon = (type: HistoryEntry['type']): string => {
    switch (type) {
      case 'chat': return '💬';
      case 'task': return '⚡';
      case 'file': return '📁';
      case 'command': return '⌨️';
      default: return '📄';
    }
  };
  
  if (!config.enabled) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">History View Disabled</div>
          <div className="text-gray-400 mb-4">
            History tracking is currently disabled in settings
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
        <div className="text-lg text-gray-400">Loading history...</div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col p-6">
      {/* 头部 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">History</h1>
            <p className="text-gray-400">
              View and manage your conversation and task history
            </p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded"
            >
              Close
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {historyEntries.length} item{historyEntries.length !== 1 ? 's' : ''} total
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={clearAllHistory}
              className="px-3 py-1.5 bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded text-sm"
              disabled={historyEntries.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
      
      {/* 搜索和筛选 */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search history..."
              className="w-full p-3 bg-background border border-border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {config.supportsSearch && (
            <button className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              Search
            </button>
          )}
        </div>
      </div>
      
      {/* 批量操作栏 */}
      {config.supportsBulkOperations && selectedEntries.length > 0 && (
        <div className="mb-6 p-4 bg-secondary/50 rounded-lg flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">{selectedEntries.length}</span> item{selectedEntries.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-2">
            <button
              onClick={deleteSelected}
              className="px-3 py-1.5 bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded text-sm"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedEntries([])}
              className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
      
      {/* 历史记录列表 */}
      <div className="flex-1 overflow-auto">
        {filteredEntries.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">
                {searchQuery ? 'No Results Found' : 'No History Yet'}
              </div>
              <div className="text-gray-400 mb-4">
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Your conversation and task history will appear here'}
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {config.supportsBulkOperations && (
              <div className="flex items-center space-x-3 p-4 bg-secondary/30 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
                <span className="text-sm text-gray-400">
                  Select all {filteredEntries.length} item{filteredEntries.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {filteredEntries.map(entry => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border border-border hover:border-primary/50 transition-all ${
                  selectedEntries.includes(entry.id) ? 'bg-primary/10 border-primary' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {config.supportsBulkOperations && (
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(entry.id)}
                      onChange={() => toggleSelection(entry.id)}
                      className="mt-1 rounded"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{getTypeIcon(entry.type)}</div>
                        <div>
                          <div className="font-medium">{entry.title}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatTime(entry.timestamp)} • {formatSize(entry.size)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded capitalize ${
                          entry.type === 'chat' ? 'bg-blue-500/20 text-blue-600' :
                          entry.type === 'task' ? 'bg-green-500/20 text-green-600' :
                          entry.type === 'file' ? 'bg-yellow-500/20 text-yellow-600' :
                          'bg-purple-500/20 text-purple-600'
                        }`}>
                          {entry.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-gray-400 mb-3 line-clamp-2">
                      {entry.preview}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-secondary text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded">
                          View
                        </button>
                        <button className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded">
                          Restore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 自动保存状态 */}
      {config.autoSaveHistory && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center text-sm text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            History is automatically saved
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;