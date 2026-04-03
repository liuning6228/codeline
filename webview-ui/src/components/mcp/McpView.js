"use strict";
/**
 * MCP视图组件
 * 基于Cline的MCP管理功能
 * 提供MCP服务器的配置和管理界面
 * 集成统一的工具系统
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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var mcp_service_1 = require("../../services/mcp-service");
var McpView = function (_a) {
    var config = _a.config, onNavigate = _a.onNavigate;
    var _b = (0, react_1.useState)([]), servers = _b[0], setServers = _b[1];
    var _c = (0, react_1.useState)([]), tools = _c[0], setTools = _c[1];
    var _d = (0, react_1.useState)('servers'), selectedTab = _d[0], setSelectedTab = _d[1];
    var _e = (0, react_1.useState)(true), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(''), searchTerm = _f[0], setSearchTerm = _f[1];
    var _g = (0, react_1.useState)(false), showAddServerDialog = _g[0], setShowAddServerDialog = _g[1];
    var _h = (0, react_1.useState)(false), showExecuteToolDialog = _h[0], setShowExecuteToolDialog = _h[1];
    var _j = (0, react_1.useState)(null), selectedTool = _j[0], setSelectedTool = _j[1];
    var _k = (0, react_1.useState)(null), executionResult = _k[0], setExecutionResult = _k[1];
    var _l = (0, react_1.useState)({
        name: '',
        description: '',
        url: '',
        autoConnect: true,
    }), newServer = _l[0], setNewServer = _l[1];
    var mcpService = mcp_service_1.McpService.getInstance();
    // 初始化加载数据
    (0, react_1.useEffect)(function () {
        if (config.enabled) {
            loadMCPData();
        }
    }, [config.enabled]);
    var loadMCPData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var initialized, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mcpService.initialize()];
                case 2:
                    initialized = _a.sent();
                    if (initialized) {
                        setServers(mcpService.getServers());
                        setTools(mcpService.getTools());
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Failed to load MCP data:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var refreshData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var success, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, mcpService.refresh()];
                case 2:
                    success = _a.sent();
                    if (success) {
                        setServers(mcpService.getServers());
                        setTools(mcpService.getTools());
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    console.error('Failed to refresh MCP data:', error_2);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleToggleServer = function (serverId, enabled) { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!enabled) return [3 /*break*/, 2];
                    return [4 /*yield*/, mcpService.connectServer(serverId)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, mcpService.disconnectServer(serverId)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    setServers(mcpService.getServers());
                    setTools(mcpService.getTools());
                    return [3 /*break*/, 6];
                case 5:
                    error_3 = _a.sent();
                    console.error('Failed to toggle server:', error_3);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleToggleTool = function (toolId, enabled) { return __awaiter(void 0, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, mcpService.toggleTool(toolId, enabled)];
                case 1:
                    _a.sent();
                    setTools(mcpService.getTools());
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Failed to toggle tool:', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleAddServer = function () { return __awaiter(void 0, void 0, void 0, function () {
        var success, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newServer.name.trim() || !newServer.url.trim()) {
                        alert('Please provide server name and URL');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mcpService.addServer(newServer)];
                case 2:
                    success = _a.sent();
                    if (success) {
                        setServers(mcpService.getServers());
                        setNewServer({ name: '', description: '', url: '', autoConnect: true });
                        setShowAddServerDialog(false);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Failed to add server:', error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleRemoveServer = function (serverId) { return __awaiter(void 0, void 0, void 0, function () {
        var success, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Are you sure you want to remove this MCP server?')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mcpService.removeServer(serverId)];
                case 2:
                    success = _a.sent();
                    if (success) {
                        setServers(mcpService.getServers());
                        setTools(mcpService.getTools());
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error('Failed to remove server:', error_6);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleExecuteTool = function (tool) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setSelectedTool(tool);
            setShowExecuteToolDialog(true);
            setExecutionResult(null);
            return [2 /*return*/];
        });
    }); };
    var handleExecuteToolConfirm = function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedTool)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mcpService.executeTool(selectedTool.id, params)];
                case 2:
                    result = _a.sent();
                    setExecutionResult(result);
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    console.error('Failed to execute tool:', error_7);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getStatusColor = function (status) {
        switch (status) {
            case 'connected': return 'text-green-600 bg-green-500/20';
            case 'disconnected': return 'text-gray-600 bg-gray-500/20';
            case 'error': return 'text-red-600 bg-red-500/20';
            default: return 'text-gray-600 bg-gray-500/20';
        }
    };
    var formatTime = function (timestamp) {
        if (!timestamp)
            return 'Never';
        var date = new Date(timestamp);
        var now = new Date();
        var diffDays = Math.floor((now.getTime() - timestamp) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        else if (diffDays === 1) {
            return 'Yesterday';
        }
        else if (diffDays < 7) {
            return "".concat(diffDays, " days ago");
        }
        else {
            return date.toLocaleDateString();
        }
    };
    // 过滤工具
    var filteredTools = searchTerm
        ? mcpService.searchTools(searchTerm)
        : tools;
    // 按服务器分组工具
    var toolsByServer = servers.map(function (server) { return ({
        server: server,
        tools: filteredTools.filter(function (tool) { return tool.serverId === server.id; }),
    }); });
    var serviceStatus = mcpService.getStatus();
    if (!config.enabled) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">MCP View Disabled</div>
          <div className="text-gray-400 mb-4">
            MCP tool management is currently disabled in settings
          </div>
          {onNavigate && (<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90" onClick={function () { return onNavigate('settings'); }}>
              Go to Settings
            </button>)}
        </div>
      </div>);
    }
    if (isLoading) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-400">Loading MCP data...</div>
      </div>);
    }
    return (<div className="flex h-full flex-col p-6">
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
            <button onClick={refreshData} className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm" disabled={isLoading}>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={function () { return setShowAddServerDialog(true); }} className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90">
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
        <button className={"px-4 py-2 font-medium ".concat(selectedTab === 'servers' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-300')} onClick={function () { return setSelectedTab('servers'); }}>
          Servers
        </button>
        <button className={"px-4 py-2 font-medium ".concat(selectedTab === 'tools' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-300')} onClick={function () { return setSelectedTab('tools'); }}>
          Tools
        </button>
        <button className={"px-4 py-2 font-medium ".concat(selectedTab === 'usage' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-300')} onClick={function () { return setSelectedTab('usage'); }}>
          Usage
        </button>
      </div>
      
      {/* 搜索栏 */}
      <div className="mb-6">
        <input type="text" placeholder="Search tools by name, description, or capability..." className="w-full p-3 bg-background border border-border rounded-lg" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }}/>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-auto">
        {selectedTab === 'servers' && (<div className="space-y-4">
            {servers.length === 0 ? (<div className="text-center py-8 text-gray-400">
                <div className="text-lg mb-2">No MCP Servers</div>
                <p className="text-sm">Add your first MCP server to get started</p>
              </div>) : (servers.map(function (server) { return (<div key={server.id} className="p-4 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-medium text-lg">{server.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{server.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{server.url}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={"px-2 py-1 text-xs rounded capitalize ".concat(getStatusColor(server.status))}>
                        {server.status}
                      </span>
                      <button onClick={function () { return handleToggleServer(server.id, server.status !== 'connected'); }} className={"px-3 py-1 text-xs rounded ".concat(server.status === 'connected'
                    ? 'bg-red-500/20 text-red-600 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-600 hover:bg-green-500/30')}>
                        {server.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </button>
                      <button onClick={function () { return handleRemoveServer(server.id); }} className="px-3 py-1 text-xs bg-red-500/20 text-red-600 rounded hover:bg-red-500/30">
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
                </div>); }))}
          </div>)}
        
        {selectedTab === 'tools' && (<div className="space-y-6">
            {toolsByServer.map(function (_a) {
                var server = _a.server, tools = _a.tools;
                return (tools.length > 0 && (<div key={server.id}>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="font-medium">{server.name}</div>
                    <span className={"px-2 py-0.5 text-xs rounded ".concat(getStatusColor(server.status))}>
                      {server.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tools.map(function (tool) { return (<div key={tool.id} className="p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium">{tool.name}</div>
                            <div className="text-sm text-gray-400 mt-1">{tool.description}</div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-1">
                              <input type="checkbox" checked={tool.enabled} onChange={function (e) { return handleToggleTool(tool.id, e.target.checked); }} className="rounded"/>
                              <span className="text-xs">Enable</span>
                            </label>
                            <button onClick={function () { return handleExecuteTool(tool); }} className="px-2 py-1 text-xs bg-primary/20 text-primary rounded hover:bg-primary/30" disabled={!tool.enabled}>
                              Execute
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tool.capabilities.map(function (cap) { return (<span key={cap} className="px-2 py-0.5 bg-secondary text-xs rounded">
                              {cap}
                            </span>); })}
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-400">
                          <div>v{tool.version}</div>
                          <div>
                            Used {tool.usageCount} time{tool.usageCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>); })}
                  </div>
                </div>));
            })}
            
            {filteredTools.length === 0 && (<div className="text-center py-8 text-gray-400">
                <div className="text-lg mb-2">
                  {searchTerm ? 'No tools found' : 'No tools available'}
                </div>
                <p className="text-sm">
                  {searchTerm ? 'Try a different search term' : 'Connect MCP servers to access tools'}
                </p>
              </div>)}
          </div>)}
        
        {selectedTab === 'usage' && (<div className="space-y-4">
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
                    {tools.reduce(function (sum, tool) { return sum + tool.usageCount; }, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Executions</div>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold">
                    {servers.filter(function (s) { return s.status === 'connected'; }).length}
                  </div>
                  <div className="text-sm text-gray-400">Active Servers</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-border">
              <h3 className="font-medium mb-3">Recently Used Tools</h3>
              {tools
                .filter(function (tool) { return tool.lastUsed; })
                .sort(function (a, b) { return b.lastUsed - a.lastUsed; })
                .slice(0, 5)
                .map(function (tool) { return (<div key={tool.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-sm text-gray-400">{tool.description}</div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Last used: {formatTime(tool.lastUsed)}
                    </div>
                  </div>); })}
              
              {tools.filter(function (tool) { return tool.lastUsed; }).length === 0 && (<div className="text-center py-4 text-gray-400">
                  No tool usage recorded yet
                </div>)}
            </div>
          </div>)}
      </div>
      
      {/* 添加服务器对话框 */}
      {showAddServerDialog && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Add MCP Server</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Server Name</label>
                <input type="text" className="w-full p-2 bg-background border border-border rounded" value={newServer.name} onChange={function (e) { return setNewServer(__assign(__assign({}, newServer), { name: e.target.value })); }} placeholder="My MCP Server"/>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input type="text" className="w-full p-2 bg-background border border-border rounded" value={newServer.description} onChange={function (e) { return setNewServer(__assign(__assign({}, newServer), { description: e.target.value })); }} placeholder="Server description"/>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Server URL</label>
                <input type="text" className="w-full p-2 bg-background border border-border rounded" value={newServer.url} onChange={function (e) { return setNewServer(__assign(__assign({}, newServer), { url: e.target.value })); }} placeholder="ws://localhost:3000 or mcp://server.example.com"/>
              </div>
              
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={newServer.autoConnect} onChange={function (e) { return setNewServer(__assign(__assign({}, newServer), { autoConnect: e.target.checked })); }} className="rounded"/>
                <span className="text-sm">Auto-connect on startup</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={function () { return setShowAddServerDialog(false); }} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded">
                Cancel
              </button>
              <button onClick={handleAddServer} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                Add Server
              </button>
            </div>
          </div>
        </div>)}
      
      {/* 执行工具对话框 */}
      {showExecuteToolDialog && selectedTool && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-medium mb-4">Execute Tool: {selectedTool.name}</h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400">{selectedTool.description}</div>
              <div className="text-xs text-gray-500 mt-1">Version: {selectedTool.version}</div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Parameters</h4>
                <textarea className="w-full p-2 bg-background border border-border rounded font-mono text-sm" rows={6} placeholder={'Enter JSON parameters for the tool:\n\n' +
                'Example:\n' +
                '{\n' +
                '  "input": "text to process",\n' +
                '  "options": {\n' +
                '    "format": "json"\n' +
                '  }\n' +
                '}'}/>
              </div>
              
              {executionResult && (<div>
                  <h4 className="font-medium mb-2">Execution Result</h4>
                  <div className={"p-3 rounded ".concat(executionResult.success ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600')}>
                    <div className="font-medium">
                      {executionResult.success ? '✓ Success' : '✗ Failed'}
                    </div>
                    {executionResult.output && (<pre className="mt-2 text-sm whitespace-pre-wrap">
                        {JSON.stringify(executionResult.output, null, 2)}
                      </pre>)}
                    {executionResult.error && (<div className="mt-2 text-sm">{executionResult.error}</div>)}
                    <div className="text-xs mt-2 opacity-75">
                      Duration: {executionResult.duration}ms
                    </div>
                  </div>
                </div>)}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={function () {
                setShowExecuteToolDialog(false);
                setSelectedTool(null);
                setExecutionResult(null);
            }} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded">
                {executionResult ? 'Close' : 'Cancel'}
              </button>
              {!executionResult && (<button onClick={function () { return handleExecuteToolConfirm({}); }} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                  Execute Tool
                </button>)}
            </div>
          </div>
        </div>)}
    </div>);
};
exports.default = McpView;
