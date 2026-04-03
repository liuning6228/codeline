"use strict";
/**
 * 设置视图
 * 基于Claude Code的配置驱动设计模式
 * 提供完整的配置管理和设置界面
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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var config_service_1 = require("../../config/config-service");
var SettingsView = function (_a) {
    var config = _a.config, onNavigate = _a.onNavigate, onClose = _a.onClose;
    var _b = (0, react_1.useState)('model'), activeModule = _b[0], setActiveModule = _b[1];
    var configService = (0, react_1.useState)(function () { return config_service_1.ConfigService.getInstance(); })[0];
    var _c = (0, react_1.useState)(true), isLoading = _c[0], setIsLoading = _c[1];
    // 初始化配置
    (0, react_1.useEffect)(function () {
        var initialize = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setIsLoading(false);
                return [2 /*return*/];
            });
        }); };
        if (config.enabled) {
            initialize();
        }
    }, [config]);
    // 重置配置
    var handleReset = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm('Are you sure you want to reset all settings to defaults?')) return [3 /*break*/, 2];
                    return [4 /*yield*/, configService.resetToDefaults()];
                case 1:
                    _a.sent();
                    alert('Settings have been reset to defaults');
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    // 导出配置
    var handleExport = function () {
        var configJson = configService.exportConfig();
        var blob = new Blob([configJson], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'codeline-config.json';
        a.click();
        URL.revokeObjectURL(url);
    };
    // 导入配置
    var handleImport = function () {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function (e) { return __awaiter(void 0, void 0, void 0, function () {
            var file, text, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                        if (!file) return [3 /*break*/, 5];
                        return [4 /*yield*/, file.text()];
                    case 1:
                        text = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, configService.importConfig(text)];
                    case 3:
                        _b.sent();
                        alert('Configuration imported successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        alert('Failed to import configuration: ' + (error_1 instanceof Error ? error_1.message : 'Unknown error'));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        input.click();
    };
    // 渲染模块内容
    var renderModuleContent = function () {
        switch (activeModule) {
            case 'model':
                return (<div>
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
                <input type="password" className="w-full p-2 bg-background border border-border rounded" placeholder="Enter your API key"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Default Model</label>
                <input type="text" className="w-full p-2 bg-background border border-border rounded" placeholder="gpt-4" defaultValue="gpt-4"/>
              </div>
            </div>
          </div>);
            case 'task':
                return (<div>
            <h3 className="text-lg font-medium mb-4">Task Execution Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked/>
                <span>Auto-execute tasks</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded"/>
                <span>Require approval before execution</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked/>
                <span>Enable event streaming</span>
              </label>
              <div>
                <label className="block text-sm font-medium mb-2">Max Concurrent Tasks</label>
                <input type="number" min="1" max="10" className="w-32 p-2 bg-background border border-border rounded" defaultValue="1"/>
              </div>
            </div>
          </div>);
            case 'tools':
                return (<div>
            <h3 className="text-lg font-medium mb-4">Tool System Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked/>
                <span>Enable file operations</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked/>
                <span>Enable terminal execution</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked/>
                <span>Enable browser automation</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked/>
                <span>Enable MCP tools</span>
              </label>
            </div>
          </div>);
            case 'ui':
                return (<div>
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
                <input type="checkbox" className="rounded" defaultChecked/>
                <span>Enable animations</span>
              </label>
            </div>
          </div>);
            case 'advanced':
                return (<div>
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
                <input type="number" min="0" max="1440" className="w-32 p-2 bg-background border border-border rounded" defaultValue="60"/>
              </div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded"/>
                <span>Enable experimental features</span>
              </label>
            </div>
          </div>);
            case 'plugins':
                return (<div>
            <h3 className="text-lg font-medium mb-4">Plugin Management</h3>
            <div className="space-y-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Plugin System Status</h4>
                  <span className="px-2 py-1 bg-green-500/20 text-green-600 text-xs rounded">Active</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Manage CodeLine plugins to extend functionality with additional tools and features.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>Loaded plugins: 3</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Active plugins: 2</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Installed Plugins</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-500">📁</span>
                      </div>
                      <div>
                        <div className="font-medium">File Manager</div>
                        <div className="text-xs text-gray-400">v1.2.0</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked/>
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-500">🔧</span>
                      </div>
                      <div>
                        <div className="font-medium">Tool Registry</div>
                        <div className="text-xs text-gray-400">v1.0.1</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked/>
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <span className="text-purple-500">🌐</span>
                      </div>
                      <div>
                        <div className="font-medium">MCP Bridge</div>
                        <div className="text-xs text-gray-400">v0.9.3</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer"/>
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Plugin Actions</h4>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded text-sm">
                    Refresh Plugins
                  </button>
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded text-sm">
                    Install Plugin...
                  </button>
                  <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded text-sm">
                    Open Plugin Directory
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="text-sm text-gray-400">
                  <p>Plugin directories:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><code className="text-xs">~/.vscode/extensions/codeline-dev.codeline/plugins</code></li>
                    <li><code className="text-xs">/workspace/.codeline/plugins</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>);
            default:
                return (<div className="text-center py-8 text-gray-400">
            <div className="text-lg mb-2">Module Not Available</div>
            <p className="text-sm">This settings module is not configured or unavailable</p>
          </div>);
        }
    };
    if (!config.enabled) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Settings View Disabled</div>
          <div className="text-gray-400 mb-4">
            The settings interface is currently disabled
          </div>
          {onClose && (<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90" onClick={onClose}>
              Go Back
            </button>)}
        </div>
      </div>);
    }
    if (isLoading) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-lg text-gray-400">Loading settings...</div>
      </div>);
    }
    var availableModules = Object.entries(config.modules)
        .filter(function (_a) {
        var _ = _a[0], enabled = _a[1];
        return enabled;
    })
        .map(function (_a) {
        var name = _a[0];
        return name;
    });
    return (<div className="flex h-full flex-col p-6">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Configure CodeLine to match your preferences</p>
        </div>
        <div className="flex space-x-2">
          {config.supportsImportExport && (<>
              <button onClick={handleImport} className="flex items-center space-x-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Import</span>
              </button>
              <button onClick={handleExport} className="flex items-center space-x-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM13.293 5.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                <span>Export</span>
              </button>
            </>)}
          {config.showResetButton && (<button onClick={handleReset} className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span>Reset</span>
            </button>)}
          {onClose && (<button onClick={onClose} className="flex items-center space-x-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              <span>Close</span>
            </button>)}
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* 设置模块导航 */}
        <div className="w-64 pr-6 border-r border-border">
          <div className="space-y-1">
            {availableModules.map(function (module) {
            var moduleNames = {
                model: 'AI Model',
                task: 'Task Execution',
                tools: 'Tools',
                ui: 'UI & Theme',
                advanced: 'Advanced',
                plugins: 'Plugins',
            };
            var moduleIcons = {
                model: '🤖',
                task: '⚡',
                tools: '🔧',
                ui: '🎨',
                advanced: '⚙️',
                plugins: '🧩',
            };
            return (<button key={module} className={"w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ".concat(activeModule === module
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary')} onClick={function () { return setActiveModule(module); }}>
                  <span className="text-lg">{moduleIcons[module] || '📄'}</span>
                  <span>{moduleNames[module] || module}</span>
                </button>);
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
    </div>);
};
exports.default = SettingsView;
