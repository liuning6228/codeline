"use strict";
/**
 * CodeLine 视图管理器
 * 基于配置驱动的视图系统，支持Cline的8视图动态管理
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
exports.ConfigDrivenViewManager = void 0;
var react_1 = require("react");
var config_service_1 = require("./config-service");
/**
 * 配置驱动的视图管理器
 * 基于Claude Code的配置驱动对话引擎模式 (CP-20260401-001)
 */
var ConfigDrivenViewManager = /** @class */ (function () {
    function ConfigDrivenViewManager() {
        this.viewComponents = {};
        this.viewFactories = new Map();
        this.configService = config_service_1.ConfigService.getInstance();
        this.registerBuiltinViewFactories();
    }
    /**
     * 注册内置视图工厂
     */
    ConfigDrivenViewManager.prototype.registerBuiltinViewFactories = function () {
        var _this = this;
        // 聊天视图工厂
        this.registerViewFactory('chat', function (config) { return __awaiter(_this, void 0, void 0, function () {
            var ChatView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../components/chat/ChatView'); })];
                    case 1:
                        ChatView = (_a.sent()).default;
                        return [2 /*return*/, function (props) { return react_1.default.createElement(ChatView, props); }];
                }
            });
        }); });
        // 设置视图工厂
        this.registerViewFactory('settings', function (config) { return __awaiter(_this, void 0, void 0, function () {
            var SettingsView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../components/settings/SettingsView'); })];
                    case 1:
                        SettingsView = (_a.sent()).default;
                        return [2 /*return*/, function (props) { return react_1.default.createElement(SettingsView, __assign(__assign({}, props), { onClose: function () { var _a; return (_a = props.onNavigate) === null || _a === void 0 ? void 0 : _a.call(props, 'chat'); } })); }];
                }
            });
        }); });
        // 历史视图工厂
        this.registerViewFactory('history', function (config) { return __awaiter(_this, void 0, void 0, function () {
            var HistoryView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../components/history/HistoryView'); })];
                    case 1:
                        HistoryView = (_a.sent()).default;
                        return [2 /*return*/, function (props) { return react_1.default.createElement(HistoryView, __assign(__assign({}, props), { onClose: function () { var _a; return (_a = props.onNavigate) === null || _a === void 0 ? void 0 : _a.call(props, 'chat'); } })); }];
                }
            });
        }); });
        // 欢迎视图工厂
        this.registerViewFactory('welcome', function (config) { return __awaiter(_this, void 0, void 0, function () {
            var WelcomeView;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../components/welcome/WelcomeView'); })];
                    case 1:
                        WelcomeView = (_a.sent()).default;
                        return [2 /*return*/, function (props) { return react_1.default.createElement(WelcomeView, __assign(__assign({}, props), { onGetStarted: function () { var _a; return (_a = props.onNavigate) === null || _a === void 0 ? void 0 : _a.call(props, 'chat'); } })); }];
                }
            });
        }); });
        // MCP视图工厂
        this.registerViewFactory('mcp', function (config) { return __awaiter(_this, void 0, void 0, function () {
            var McpView_1, error_1, McpPlaceholder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../components/mcp/McpView'); })];
                    case 1:
                        McpView_1 = (_a.sent()).default;
                        return [2 /*return*/, function (props) { return react_1.default.createElement(McpView_1, props); }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Failed to load MCP view:', error_1);
                        McpPlaceholder = function (props) { return (<div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">MCP View</div>
              <div className="text-gray-400 mb-4">
                Model Context Protocol configuration interface
              </div>
              <div className="text-sm text-gray-500">
                Coming soon - Full MCP integration with dynamic tool loading
              </div>
            </div>
          </div>); };
                        return [2 /*return*/, McpPlaceholder];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        // 账户视图工厂
        this.registerViewFactory('account', function (config) { return __awaiter(_this, void 0, void 0, function () {
            var AccountView_1, error_2, AccountPlaceholder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../components/account/AccountView'); })];
                    case 1:
                        AccountView_1 = (_a.sent()).default;
                        return [2 /*return*/, function (props) { return react_1.default.createElement(AccountView_1, props); }];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Failed to load Account view:', error_2);
                        AccountPlaceholder = function (props) { return (<div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">Account View</div>
              <div className="text-gray-400 mb-4">
                User account management and preferences
              </div>
              <div className="text-sm text-gray-500">
                Coming soon - Multi-account support with usage statistics
              </div>
            </div>
          </div>); };
                        return [2 /*return*/, AccountPlaceholder];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        // 工作区视图工厂
        this.registerViewFactory('worktrees', function (config) { return __awaiter(_this, void 0, void 0, function () {
            var WorktreesView_1, error_3, WorktreesPlaceholder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../components/worktrees/WorktreesView'); })];
                    case 1:
                        WorktreesView_1 = (_a.sent()).default;
                        return [2 /*return*/, function (props) { return react_1.default.createElement(WorktreesView_1, props); }];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Failed to load Worktrees view:', error_3);
                        WorktreesPlaceholder = function (props) { return (<div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">Worktrees View</div>
              <div className="text-gray-400 mb-4">
                Workspace snapshots and version management
              </div>
              <div className="text-sm text-gray-500">
                Coming soon - State snapshotting and difference comparison
              </div>
            </div>
          </div>); };
                        return [2 /*return*/, WorktreesPlaceholder];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        // 引导视图工厂
        this.registerViewFactory('onboarding', function (config) { return __awaiter(_this, void 0, void 0, function () {
            var OnboardingView_1, error_4, OnboardingPlaceholder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../components/onboarding/OnboardingView'); })];
                    case 1:
                        OnboardingView_1 = (_a.sent()).default;
                        return [2 /*return*/, function (props) { return react_1.default.createElement(OnboardingView_1, props); }];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Failed to load Onboarding view:', error_4);
                        OnboardingPlaceholder = function (props) { return (<div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-semibold mb-2">Onboarding View</div>
              <div className="text-gray-400 mb-4">
                Guided setup and configuration wizard
              </div>
              <div className="text-sm text-gray-500">
                Coming soon - Step-by-step configuration guide
              </div>
            </div>
          </div>); };
                        return [2 /*return*/, OnboardingPlaceholder];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 注册视图工厂
     */
    ConfigDrivenViewManager.prototype.registerViewFactory = function (viewName, factory) {
        var _this = this;
        this.viewFactories.set(viewName, function (config) { return __awaiter(_this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, factory(config)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Failed to create view factory for ".concat(viewName, ":"), error_5);
                        // 返回错误占位符组件
                        return [2 /*return*/, function (props) { return (<div className="flex h-full items-center justify-center text-red-500">
            <div>
              <div className="text-xl font-semibold">Error Loading {viewName}</div>
              <div className="text-sm mt-2">Failed to load view component</div>
            </div>
          </div>); }];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 基于配置初始化视图
     */
    ConfigDrivenViewManager.prototype.initializeViews = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, enabledViews, _i, enabledViews_1, viewName, viewConfig, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = this.configService.getConfig();
                        enabledViews = this.configService.getEnabledViews();
                        console.log("Initializing ".concat(enabledViews.length, " enabled views:"), enabledViews);
                        // 清空现有视图组件
                        this.viewComponents = {};
                        _i = 0, enabledViews_1 = enabledViews;
                        _a.label = 1;
                    case 1:
                        if (!(_i < enabledViews_1.length)) return [3 /*break*/, 6];
                        viewName = enabledViews_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        viewConfig = config.views[viewName];
                        return [4 /*yield*/, this.initializeView(viewName, viewConfig)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _a.sent();
                        console.error("Failed to initialize view ".concat(viewName, ":"), error_6);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, __assign({}, this.viewComponents)];
                }
            });
        });
    };
    /**
     * 初始化单个视图
     */
    ConfigDrivenViewManager.prototype.initializeView = function (viewName, viewConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var factory, component, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        factory = this.viewFactories.get(viewName);
                        if (!factory) {
                            console.warn("No factory registered for view: ".concat(viewName));
                            // 创建默认占位符组件
                            this.viewComponents[viewName] = function (props) { return (<div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold mb-2">{viewName} View</div>
            <div className="text-gray-400">
              View component not implemented yet
            </div>
          </div>
        </div>); };
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, factory(viewConfig)];
                    case 2:
                        component = _a.sent();
                        this.viewComponents[viewName] = component;
                        console.log("View ".concat(viewName, " initialized successfully"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        console.error("Failed to create view ".concat(viewName, ":"), error_7);
                        // 创建错误组件
                        this.viewComponents[viewName] = function (props) { return (<div className="flex h-full items-center justify-center text-red-500">
          <div>
            <div className="text-xl font-semibold">Error Loading {viewName}</div>
            <div className="text-sm mt-2">{error_7 instanceof Error ? error_7.message : 'Unknown error'}</div>
          </div>
        </div>); };
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取视图组件
     */
    ConfigDrivenViewManager.prototype.getViewComponent = function (viewName) {
        return this.viewComponents[viewName];
    };
    /**
     * 获取所有视图组件
     */
    ConfigDrivenViewManager.prototype.getViewComponents = function () {
        return __assign({}, this.viewComponents);
    };
    /**
     * 重新初始化视图（配置更新后）
     */
    ConfigDrivenViewManager.prototype.reinitializeViews = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Reinitializing views due to configuration change');
                        return [4 /*yield*/, this.initializeViews()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取视图显示名称
     */
    ConfigDrivenViewManager.prototype.getViewDisplayName = function (viewName) {
        var displayNames = {
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
    };
    /**
     * 获取视图图标（占位符）
     */
    ConfigDrivenViewManager.prototype.getViewIcon = function (viewName) {
        var icons = {
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
    };
    /**
     * 获取视图描述
     */
    ConfigDrivenViewManager.prototype.getViewDescription = function (viewName) {
        var descriptions = {
            'chat': 'Chat with CodeLine AI assistant',
            'settings': 'Configure CodeLine preferences and settings',
            'history': 'View conversation history and past tasks',
            'mcp': 'Manage Model Context Protocol tools and connections',
            'account': 'Manage user accounts and usage statistics',
            'worktrees': 'Workspace snapshots and version management',
            'welcome': 'Welcome screen with quick actions',
            'onboarding': 'Guided setup and configuration',
        };
        return descriptions[viewName] || "".concat(viewName, " view");
    };
    /**
     * 检查视图是否已初始化
     */
    ConfigDrivenViewManager.prototype.isViewInitialized = function (viewName) {
        return !!this.viewComponents[viewName];
    };
    /**
     * 获取视图配置
     */
    ConfigDrivenViewManager.prototype.getViewConfig = function (viewName) {
        return this.configService.getViewConfig(viewName);
    };
    /**
     * 创建导航菜单项
     */
    ConfigDrivenViewManager.prototype.createNavigationItems = function (currentView, onNavigate) {
        var _this = this;
        var enabledViews = this.configService.getEnabledViews();
        var config = this.configService.getConfig();
        return enabledViews.map(function (viewName) {
            var viewConfig = config.views[viewName];
            var isActive = currentView === viewName;
            return {
                id: viewName,
                name: _this.getViewDisplayName(viewName),
                icon: _this.getViewIcon(viewName),
                description: _this.getViewDescription(viewName),
                enabled: viewConfig.enabled,
                isActive: isActive,
                onClick: function () { return onNavigate(viewName); },
            };
        });
    };
    return ConfigDrivenViewManager;
}());
exports.ConfigDrivenViewManager = ConfigDrivenViewManager;
