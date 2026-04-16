"use strict";
/**
 * 账户管理视图
 * 基于Claude Code的分布式会话管理模式 (CP-20260402-004)
 * 提供用户账户管理、会话状态和使用统计
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AccountView = function (_a) {
    var config = _a.config, onNavigate = _a.onNavigate;
    var _b = (0, react_1.useState)([]), accounts = _b[0], setAccounts = _b[1];
    var _c = (0, react_1.useState)(null), activeAccount = _c[0], setActiveAccount = _c[1];
    var _d = (0, react_1.useState)(null), usageStats = _d[0], setUsageStats = _d[1];
    var _e = (0, react_1.useState)(true), isLoading = _e[0], setIsLoading = _e[1];
    // 初始化账户数据
    (0, react_1.useEffect)(function () {
        var initializeAccounts = function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockAccounts, active, mockUsageStats;
            return __generator(this, function (_a) {
                setIsLoading(true);
                try {
                    mockAccounts = [
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
                    active = mockAccounts.find(function (acc) { return acc.isActive; });
                    if (active) {
                        setActiveAccount(active.id);
                    }
                    else if (mockAccounts.length > 0) {
                        setActiveAccount(mockAccounts[0].id);
                    }
                    mockUsageStats = {
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
                }
                catch (error) {
                    console.error('Failed to initialize accounts:', error);
                }
                finally {
                    setIsLoading(false);
                }
                return [2 /*return*/];
            });
        }); };
        if (config.enabled) {
            initializeAccounts();
        }
    }, [config]);
    // 切换活动账户
    var switchActiveAccount = function (accountId) {
        setAccounts(function (prev) { return prev.map(function (acc) { return (__assign(__assign({}, acc), { isActive: acc.id === accountId })); }); });
        setActiveAccount(accountId);
    };
    // 添加新账户
    var handleAddAccount = function () {
        var newAccountId = "account-".concat(accounts.length + 1);
        var newAccount = {
            id: newAccountId,
            name: "New Account ".concat(accounts.length + 1),
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
        setAccounts(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newAccount], false); });
    };
    // 删除账户
    var handleDeleteAccount = function (accountId) {
        var filteredAccounts = accounts.filter(function (acc) { return acc.id !== accountId; });
        setAccounts(filteredAccounts);
        if (activeAccount === accountId) {
            setActiveAccount(filteredAccounts.length > 0 ? filteredAccounts[0].id : null);
        }
    };
    // 获取账户提供商标识
    var getProviderIcon = function (provider) {
        switch (provider) {
            case 'openai': return '🤖';
            case 'anthropic': return '🌀';
            case 'local': return '💻';
            default: return '🔧';
        }
    };
    // 获取账户提供商标识颜色
    var getProviderColor = function (provider) {
        switch (provider) {
            case 'openai': return 'bg-green-500/20 text-green-600';
            case 'anthropic': return 'bg-purple-500/20 text-purple-600';
            case 'local': return 'bg-blue-500/20 text-blue-600';
            default: return 'bg-gray-500/20 text-gray-600';
        }
    };
    if (!config.enabled) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Account View Disabled</div>
          <div className="text-gray-400 mb-4">
            Account management is currently disabled in settings
          </div>
          {onNavigate && (<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90" onClick={function () { return onNavigate('settings'); }}>
              Go to Settings
            </button>)}
        </div>
      </div>);
    }
    if (isLoading) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-400">Loading account information...</div>
      </div>);
    }
    var activeAccountData = accounts.find(function (acc) { return acc.id === activeAccount; });
    return (<div className="flex h-full flex-col p-6">
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
            {accounts.filter(function (a) { return a.isActive; }).length} active
          </div>
          {config.supportsAccountSync && (<button className="text-xs text-primary hover:underline">
              Sync Accounts
            </button>)}
        </div>
      </div>
      
      <div className="flex flex-1 space-x-6 overflow-hidden">
        {/* 账户列表 */}
        <div className="w-1/3 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AI Accounts</h2>
            <button onClick={handleAddAccount} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90" disabled={!config.supportsMultipleAccounts && accounts.length > 0} title={!config.supportsMultipleAccounts && accounts.length > 0 ? 'Multiple accounts not supported' : ''}>
              Add Account
            </button>
          </div>
          
          <div className="flex-1 overflow-auto space-y-3">
            {accounts.length === 0 ? (<div className="text-center py-8 text-gray-400">
                <div className="text-lg mb-2">No accounts configured</div>
                <p className="text-sm">Add an account to start using CodeLine</p>
              </div>) : (accounts.map(function (account) { return (<div key={account.id} className={"p-4 rounded-lg border cursor-pointer transition-all ".concat(activeAccount === account.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50')} onClick={function () { return switchActiveAccount(account.id); }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={"w-8 h-8 rounded-full flex items-center justify-center ".concat(getProviderColor(account.provider))}>
                        {getProviderIcon(account.provider)}
                      </div>
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
                        </div>
                      </div>
                    </div>
                    {account.isActive && (<span className="px-2 py-1 bg-green-500/20 text-green-600 text-xs rounded">
                        Active
                      </span>)}
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
                      <button onClick={function (e) {
                e.stopPropagation();
                if (account.isActive) {
                    // 不能停用活动账户
                    return;
                }
                handleDeleteAccount(account.id);
            }} className="px-2 py-1 text-xs bg-red-500/20 text-red-600 rounded hover:bg-red-500/30" disabled={account.isActive} title={account.isActive ? 'Cannot delete active account' : ''}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>); }))}
          </div>
        </div>
        
        {/* 账户详情和使用统计 */}
        <div className="w-2/3 flex flex-col space-y-6">
          {activeAccountData ? (<>
              {/* 账户详情 */}
              <div className="bg-secondary/50 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={"w-12 h-12 rounded-full flex items-center justify-center text-xl ".concat(getProviderColor(activeAccountData.provider))}>
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
                    <button onClick={function () { return switchActiveAccount(activeAccountData.id); }} className={"px-3 py-1.5 rounded text-sm ".concat(activeAccountData.isActive
                ? 'bg-green-500/20 text-green-600'
                : 'bg-primary text-primary-foreground hover:bg-primary/90')}>
                      {activeAccountData.isActive ? 'Active' : 'Set as Active'}
                    </button>
                    <button className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm" onClick={function () { return onNavigate === null || onNavigate === void 0 ? void 0 : onNavigate('settings'); }}>
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
              {config.showUsageStats && usageStats && (<div className="flex-1 flex flex-col">
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
                    {config.supportsAccountSync && (<p className="mt-1">Statistics are synchronized across devices when account sync is enabled.</p>)}
                  </div>
                </div>)}
            </>) : (<div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-semibold mb-2">No Account Selected</div>
                <div className="text-gray-400">
                  Select an account from the list to view details and usage statistics
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>);
};
exports.default = AccountView;
