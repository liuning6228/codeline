"use strict";
/**
 * 历史记录视图
 * 基于Claude Code的分布式会话管理模式
 * 提供会话历史记录查看和管理
 */
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
var HistoryView = function (_a) {
    var config = _a.config, onNavigate = _a.onNavigate, onClose = _a.onClose;
    var _b = (0, react_1.useState)([]), historyEntries = _b[0], setHistoryEntries = _b[1];
    var _c = (0, react_1.useState)([]), selectedEntries = _c[0], setSelectedEntries = _c[1];
    var _d = (0, react_1.useState)(''), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = (0, react_1.useState)(true), isLoading = _e[0], setIsLoading = _e[1];
    // 初始化历史记录
    (0, react_1.useEffect)(function () {
        var initializeHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockHistory, sortedHistory, limitedHistory;
            return __generator(this, function (_a) {
                setIsLoading(true);
                try {
                    mockHistory = [
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
                    sortedHistory = mockHistory.sort(function (a, b) { return b.timestamp - a.timestamp; });
                    limitedHistory = sortedHistory.slice(0, config.maxHistoryItems);
                    setHistoryEntries(limitedHistory);
                }
                catch (error) {
                    console.error('Failed to load history:', error);
                }
                finally {
                    setIsLoading(false);
                }
                return [2 /*return*/];
            });
        }); };
        if (config.enabled) {
            initializeHistory();
        }
    }, [config]);
    // 过滤历史记录
    var filteredEntries = historyEntries.filter(function (entry) {
        if (!searchQuery.trim())
            return true;
        var query = searchQuery.toLowerCase();
        return (entry.title.toLowerCase().includes(query) ||
            entry.preview.toLowerCase().includes(query) ||
            entry.tags.some(function (tag) { return tag.toLowerCase().includes(query); }));
    });
    // 切换选中状态
    var toggleSelection = function (entryId) {
        setSelectedEntries(function (prev) {
            if (prev.includes(entryId)) {
                return prev.filter(function (id) { return id !== entryId; });
            }
            else {
                return __spreadArray(__spreadArray([], prev, true), [entryId], false);
            }
        });
    };
    // 全选/取消全选
    var toggleSelectAll = function () {
        if (selectedEntries.length === filteredEntries.length) {
            setSelectedEntries([]);
        }
        else {
            setSelectedEntries(filteredEntries.map(function (entry) { return entry.id; }));
        }
    };
    // 删除选中条目
    var deleteSelected = function () {
        if (selectedEntries.length === 0)
            return;
        if (window.confirm("Delete ".concat(selectedEntries.length, " selected history item(s)?"))) {
            setHistoryEntries(function (prev) { return prev.filter(function (entry) { return !selectedEntries.includes(entry.id); }); });
            setSelectedEntries([]);
        }
    };
    // 清空所有历史记录
    var clearAllHistory = function () {
        if (historyEntries.length === 0)
            return;
        if (window.confirm("Clear all ".concat(historyEntries.length, " history items? This cannot be undone."))) {
            setHistoryEntries([]);
            setSelectedEntries([]);
        }
    };
    // 格式化时间
    var formatTime = function (timestamp) {
        var date = new Date(timestamp);
        var now = new Date();
        var diffMs = now.getTime() - timestamp;
        var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        else if (diffDays === 1) {
            return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        else if (diffDays < 7) {
            return "".concat(diffDays, " days ago");
        }
        else {
            return date.toLocaleDateString();
        }
    };
    // 格式化文件大小
    var formatSize = function (size) {
        if (size < 1024)
            return "".concat(size, " B");
        if (size < 1024 * 1024)
            return "".concat((size / 1024).toFixed(1), " KB");
        return "".concat((size / (1024 * 1024)).toFixed(1), " MB");
    };
    // 获取类型图标
    var getTypeIcon = function (type) {
        switch (type) {
            case 'chat': return '💬';
            case 'task': return '⚡';
            case 'file': return '📁';
            case 'command': return '⌨️';
            default: return '📄';
        }
    };
    if (!config.enabled) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">History View Disabled</div>
          <div className="text-gray-400 mb-4">
            History tracking is currently disabled in settings
          </div>
          {onClose && (<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90" onClick={onClose}>
              Go Back
            </button>)}
        </div>
      </div>);
    }
    if (isLoading) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-400">Loading history...</div>
      </div>);
    }
    return (<div className="flex h-full flex-col p-6">
      {/* 头部 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">History</h1>
            <p className="text-gray-400">
              View and manage your conversation and task history
            </p>
          </div>
          
          {onClose && (<button onClick={onClose} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded">
              Close
            </button>)}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {historyEntries.length} item{historyEntries.length !== 1 ? 's' : ''} total
          </div>
          
          <div className="flex space-x-2">
            <button onClick={clearAllHistory} className="px-3 py-1.5 bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded text-sm" disabled={historyEntries.length === 0}>
              Clear All
            </button>
          </div>
        </div>
      </div>
      
      {/* 搜索和筛选 */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input type="text" placeholder="Search history..." className="w-full p-3 bg-background border border-border rounded-lg" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }}/>
          </div>
          
          {config.supportsSearch && (<button className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              Search
            </button>)}
        </div>
      </div>
      
      {/* 批量操作栏 */}
      {config.supportsBulkOperations && selectedEntries.length > 0 && (<div className="mb-6 p-4 bg-secondary/50 rounded-lg flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium">{selectedEntries.length}</span> item{selectedEntries.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-2">
            <button onClick={deleteSelected} className="px-3 py-1.5 bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded text-sm">
              Delete Selected
            </button>
            <button onClick={function () { return setSelectedEntries([]); }} className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm">
              Clear Selection
            </button>
          </div>
        </div>)}
      
      {/* 历史记录列表 */}
      <div className="flex-1 overflow-auto">
        {filteredEntries.length === 0 ? (<div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">
                {searchQuery ? 'No Results Found' : 'No History Yet'}
              </div>
              <div className="text-gray-400 mb-4">
                {searchQuery
                ? 'Try a different search term'
                : 'Your conversation and task history will appear here'}
              </div>
              {searchQuery && (<button onClick={function () { return setSearchQuery(''); }} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded">
                  Clear Search
                </button>)}
            </div>
          </div>) : (<div className="space-y-4">
            {config.supportsBulkOperations && (<div className="flex items-center space-x-3 p-4 bg-secondary/30 rounded-lg">
                <input type="checkbox" checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0} onChange={toggleSelectAll} className="rounded"/>
                <span className="text-sm text-gray-400">
                  Select all {filteredEntries.length} item{filteredEntries.length !== 1 ? 's' : ''}
                </span>
              </div>)}
            
            {filteredEntries.map(function (entry) { return (<div key={entry.id} className={"p-4 rounded-lg border border-border hover:border-primary/50 transition-all ".concat(selectedEntries.includes(entry.id) ? 'bg-primary/10 border-primary' : '')}>
                <div className="flex items-start space-x-4">
                  {config.supportsBulkOperations && (<input type="checkbox" checked={selectedEntries.includes(entry.id)} onChange={function () { return toggleSelection(entry.id); }} className="mt-1 rounded"/>)}
                  
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
                        <span className={"px-2 py-1 text-xs rounded capitalize ".concat(entry.type === 'chat' ? 'bg-blue-500/20 text-blue-600' :
                    entry.type === 'task' ? 'bg-green-500/20 text-green-600' :
                        entry.type === 'file' ? 'bg-yellow-500/20 text-yellow-600' :
                            'bg-purple-500/20 text-purple-600')}>
                          {entry.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-gray-400 mb-3 line-clamp-2">
                      {entry.preview}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map(function (tag) { return (<span key={tag} className="px-2 py-0.5 bg-secondary text-xs rounded">
                            {tag}
                          </span>); })}
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
              </div>); })}
          </div>)}
      </div>
      
      {/* 自动保存状态 */}
      {config.autoSaveHistory && (<div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center text-sm text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            History is automatically saved
          </div>
        </div>)}
    </div>);
};
exports.default = HistoryView;
