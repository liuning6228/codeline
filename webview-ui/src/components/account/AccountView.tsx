/**
 * 账户管理视图
 * 基于Claude Code的分布式会话管理模式 (CP-20260402-004)
 * 提供用户账户管理、会话状态和使用统计
 */

import React, { useState, useEffect } from 'react';
import { AccountViewConfig } from '../../config/codeline-config';

interface AccountViewProps {
  /** 账户视图配置 */
  config: AccountViewConfig;
  /** 导航回调函数 */
  onNavigate?: (viewName: string) => void;
}

interface UserAccount {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  provider: 'openai' | 'anthropic' | 'local' | 'custom';
  apiKey?: string;
  lastUsed: number;
  isActive: boolean;
  usage: {
    tokens: number;
    requests: number;
    cost: number;
  };
  preferences: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
  };
}

interface UsageStats {
  daily: {
    tokens: number;
    requests: number;
    cost: number;
  };
  weekly: {
    tokens: number;
    requests: number;
    cost: number;
  };
  monthly: {
    tokens: number;
    requests: number;
    cost: number;
  };
  total: {
    tokens: number;
    requests: number;
    cost: number;
  };
}

const AccountView: React.FC<AccountViewProps> = ({ config, onNavigate }) => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 初始化账户数据
  useEffect(() => {
    const initializeAccounts = async () => {
      setIsLoading(true);
      
      try {
        // 模拟加载账户数据
        const mockAccounts: UserAccount[] = [
          {
            id: 'account-1',
            name: 'OpenAI Account',
            email: 'user@example.com',
            provider: 'openai',
            lastUsed: Date.now() - 86400000, // 1天前
            isActive: true,
            usage: {
              tokens: 125000,
              requests: 450,
              cost: 2.50,
            },
            preferences: {
              defaultModel: 'gpt-4',
              temperature: 0.7,
              maxTokens: 4000,
            },
          },
          {
            id: 'account-2',
            name: 'Anthropic Account',
            email: 'user@example.com',
            provider: 'anthropic',
            lastUsed: Date.now() - 172800000, // 2天前
            isActive: false,
            usage: {
              tokens: 85000,
              requests: 320,
              cost: 1.80,
            },
            preferences: {
              defaultModel: 'claude-3-opus',
              temperature: 0.8,
              maxTokens: 8000,
            },
          },
          {
            id: 'account-3',
            name: 'Local Model',
            provider: 'local',
            lastUsed: Date.now() - 604800000, // 7天前
            isActive: false,
            usage: {
              tokens: 45000,
              requests: 180,
              cost: 0,
            },
            preferences: {
              defaultModel: 'llama-3-70b',
              temperature: 0.6,
              maxTokens: 2000,
            },
          },
        ];
        
        setAccounts(mockAccounts);
        
        // 设置活动账户
        const active = mockAccounts.find(acc => acc.isActive);
        if (active) {
          setActiveAccount(active.id);
        } else if (mockAccounts.length > 0) {
          setActiveAccount(mockAccounts[0].id);
        }
        
        // 模拟使用统计
        const mockUsageStats: UsageStats = {
          daily: {
            tokens: 1250,
            requests: 45,
            cost: 0.025,
          },
          weekly: {
            tokens: 8750,
            requests: 315,
            cost: 0.175,
          },
          monthly: {
            tokens: 37500,
            requests: 1350,
            cost: 0.75,
          },
          total: {
            tokens: 255000,
            requests: 950,
            cost: 4.30,
          },
        };
        
        setUsageStats(mockUsageStats);
      } catch (error) {
        console.error('Failed to initialize accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (config.enabled) {
      initializeAccounts();
    }
  }, [config]);
  
  // 切换活动账户
  const switchActiveAccount = (accountId: string) => {
    setAccounts(prev => prev.map(acc => ({
      ...acc,
      isActive: acc.id === accountId,
    })));
    setActiveAccount(accountId);
  };
  
  // 添加新账户
  const handleAddAccount = () => {
    const newAccountId = `account-${accounts.length + 1}`;
    const newAccount: UserAccount = {
      id: newAccountId,
      name: `New Account ${accounts.length + 1}`,
      provider: 'custom',
      lastUsed: Date.now(),
      isActive: false,
      usage: {
        tokens: 0,
        requests: 0,
        cost: 0,
      },
      preferences: {
        defaultModel: 'gpt-4',
        temperature: 0.7,
        maxTokens: 4000,
      },
    };
    
    setAccounts(prev => [...prev, newAccount]);
  };
  
  // 删除账户
  const handleDeleteAccount = (accountId: string) => {
    const filteredAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(filteredAccounts);
    
    if (activeAccount === accountId) {
      setActiveAccount(filteredAccounts.length > 0 ? filteredAccounts[0].id : null);
    }
  };
  
  // 获取账户提供商标识
  const getProviderIcon = (provider: UserAccount['provider']): string => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'anthropic': return '🌀';
      case 'local': return '💻';
      default: return '🔧';
    }
  };
  
  // 获取账户提供商标识颜色
  const getProviderColor = (provider: UserAccount['provider']): string => {
    switch (provider) {
      case 'openai': return 'bg-green-500/20 text-green-600';
      case 'anthropic': return 'bg-purple-500/20 text-purple-600';
      case 'local': return 'bg-blue-500/20 text-blue-600';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };
  
  if (!config.enabled) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Account View Disabled</div>
          <div className="text-gray-400 mb-4">
            Account management is currently disabled in settings
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
        <div className="text-lg text-gray-400">Loading account information...</div>
      </div>
    );
  }
  
  const activeAccountData = accounts.find(acc => acc.id === activeAccount);
  
  return (
    <div className="flex h-full flex-col p-6">
      {/* 头部 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Management</h1>
        <p className="text-gray-400">
          Manage your AI accounts, usage statistics, and preferences
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} configured
          </div>
          <div className="text-sm text-gray-400">
            {accounts.filter(a => a.isActive).length} active
          </div>
          {config.supportsAccountSync && (
            <button className="text-xs text-primary hover:underline">
              Sync Accounts
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 space-x-6 overflow-hidden">
        {/* 账户列表 */}
        <div className="w-1/3 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AI Accounts</h2>
            <button
              onClick={handleAddAccount}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
              disabled={!config.supportsMultipleAccounts && accounts.length > 0}
              title={!config.supportsMultipleAccounts && accounts.length > 0 ? 'Multiple accounts not supported' : ''}
            >
              Add Account
            </button>
          </div>
          
          <div className="flex-1 overflow-auto space-y-3">
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-lg mb-2">No accounts configured</div>
                <p className="text-sm">Add an account to start using CodeLine</p>
              </div>
            ) : (
              accounts.map(account => (
                <div
                  key={account.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    activeAccount === account.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => switchActiveAccount(account.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getProviderColor(account.provider)}`}>
                        {getProviderIcon(account.provider)}
                      </div>
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
                        </div>
                      </div>
                    </div>
                    {account.isActive && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-600 text-xs rounded">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-xs text-gray-400 mb-1">Last Used</div>
                    <div className="text-sm">
                      {new Date(account.lastUsed).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-gray-400">
                      {account.usage.tokens.toLocaleString()} tokens
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (account.isActive) {
                            // 不能停用活动账户
                            return;
                          }
                          handleDeleteAccount(account.id);
                        }}
                        className="px-2 py-1 text-xs bg-red-500/20 text-red-600 rounded hover:bg-red-500/30"
                        disabled={account.isActive}
                        title={account.isActive ? 'Cannot delete active account' : ''}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* 账户详情和使用统计 */}
        <div className="w-2/3 flex flex-col space-y-6">
          {activeAccountData ? (
            <>
              {/* 账户详情 */}
              <div className="bg-secondary/50 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getProviderColor(activeAccountData.provider)}`}>
                      {getProviderIcon(activeAccountData.provider)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{activeAccountData.name}</h2>
                      <p className="text-gray-400">
                        {activeAccountData.email || 'No email configured'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => switchActiveAccount(activeAccountData.id)}
                      className={`px-3 py-1.5 rounded text-sm ${
                        activeAccountData.isActive
                          ? 'bg-green-500/20 text-green-600'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {activeAccountData.isActive ? 'Active' : 'Set as Active'}
                    </button>
                    <button
                      className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm"
                      onClick={() => onNavigate?.('settings')}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Preferences</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Default Model</span>
                        <span className="font-medium">{activeAccountData.preferences.defaultModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Temperature</span>
                        <span className="font-medium">{activeAccountData.preferences.temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Max Tokens</span>
                        <span className="font-medium">{activeAccountData.preferences.maxTokens.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Authentication</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Provider</span>
                        <span className="font-medium capitalize">{activeAccountData.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">API Key</span>
                        <span className="font-mono text-sm">
                          {activeAccountData.apiKey ? '••••••••' : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 使用统计 */}
              {config.showUsageStats && usageStats && (
                <div className="flex-1 flex flex-col">
                  <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Daily Usage</div>
                      <div className="text-2xl font-bold">{usageStats.daily.tokens.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">tokens used today</div>
                    </div>
                    
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Monthly Usage</div>
                      <div className="text-2xl font-bold">${usageStats.monthly.cost.toFixed(2)}</div>
                      <div className="text-sm text-gray-400">cost this month</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Total Tokens</div>
                      <div className="text-lg font-semibold">{usageStats.total.tokens.toLocaleString()}</div>
                    </div>
                    
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Total Requests</div>
                      <div className="text-lg font-semibold">{usageStats.total.requests.toLocaleString()}</div>
                    </div>
                    
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Total Cost</div>
                      <div className="text-lg font-semibold">${usageStats.total.cost.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-400">
                    <p>Usage statistics are reset at the beginning of each month.</p>
                    {config.supportsAccountSync && (
                      <p className="mt-1">Statistics are synchronized across devices when account sync is enabled.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-semibold mb-2">No Account Selected</div>
                <div className="text-gray-400">
                  Select an account from the list to view details and usage statistics
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountView;