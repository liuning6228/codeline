"use strict";
/**
 * CodeLine 主应用组件（配置驱动版本）
 * 基于Claude Code的配置驱动对话引擎模式 (CP-20260401-001)
 * 支持Cline的8视图系统动态管理
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
var config_service_1 = require("./config/config-service");
var view_manager_1 = require("./config/view-manager");
function App() {
    var _this = this;
    var _a = (0, react_1.useState)('welcome'), currentView = _a[0], setCurrentView = _a[1];
    var _b = (0, react_1.useState)({}), views = _b[0], setViews = _b[1];
    var _c = (0, react_1.useState)(null), config = _c[0], setConfig = _c[1];
    var _d = (0, react_1.useState)(false), isInitialized = _d[0], setIsInitialized = _d[1];
    var _e = (0, react_1.useState)(null), viewManager = _e[0], setViewManager = _e[1];
    // 初始化配置和视图管理器
    (0, react_1.useEffect)(function () {
        var initializeApp = function () { return __awaiter(_this, void 0, void 0, function () {
            var configService, loadedConfig, manager_1, initializedViews, enabledViews, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Initializing CodeLine with config-driven architecture...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        configService = config_service_1.ConfigService.getInstance();
                        return [4 /*yield*/, configService.loadConfig()];
                    case 2:
                        loadedConfig = _a.sent();
                        setConfig(loadedConfig);
                        manager_1 = new view_manager_1.ConfigDrivenViewManager();
                        setViewManager(manager_1);
                        return [4 /*yield*/, manager_1.initializeViews()];
                    case 3:
                        initializedViews = _a.sent();
                        setViews(initializedViews);
                        enabledViews = configService.getEnabledViews();
                        if (enabledViews.length > 0) {
                            // 如果是首次使用且启用了引导视图，显示引导
                            if (loadedConfig.views.onboarding.enabled && loadedConfig.views.onboarding.autoStartOnFirstUse) {
                                setCurrentView('onboarding');
                            }
                            // 如果启用了欢迎视图且配置为启动时显示，显示欢迎
                            else if (loadedConfig.views.welcome.enabled && loadedConfig.views.welcome.showOnStartup) {
                                setCurrentView('welcome');
                            }
                            else {
                                // 否则显示第一个启用的视图
                                setCurrentView(enabledViews[0]);
                            }
                        }
                        // 监听配置变更
                        configService.addConfigChangeListener(function (newConfig) { return __awaiter(_this, void 0, void 0, function () {
                            var updatedViews;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log('Configuration changed, reinitializing views...');
                                        setConfig(newConfig);
                                        if (!manager_1) return [3 /*break*/, 2];
                                        return [4 /*yield*/, manager_1.reinitializeViews()];
                                    case 1:
                                        updatedViews = _a.sent();
                                        setViews(updatedViews);
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                        setIsInitialized(true);
                        console.log('CodeLine initialization complete');
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Failed to initialize CodeLine:', error_1);
                        setIsInitialized(true); // 即使出错也显示UI
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        initializeApp();
        // 清理函数
        return function () {
            if (viewManager) {
                // 清理资源（如果需要）
            }
        };
    }, []);
    // 处理视图导航
    var handleNavigate = function (viewName) {
        if (views[viewName]) {
            setCurrentView(viewName);
        }
        else {
            console.warn("View ".concat(viewName, " not found or not initialized"));
        }
    };
    // 渲染当前视图
    var renderCurrentView = function () {
        var ViewComponent = views[currentView];
        if (!ViewComponent) {
            return (<div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold mb-2">View Not Found</div>
            <div className="text-gray-400 mb-4">
              The view "{currentView}" is not available or not initialized.
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90" onClick={function () { return handleNavigate('chat'); }}>
              Go to Chat
            </button>
          </div>
        </div>);
        }
        // 获取视图配置
        var viewConfig = (config === null || config === void 0 ? void 0 : config.views[currentView]) || {};
        // 创建视图属性
        var viewProps = {
            config: viewConfig,
            onNavigate: handleNavigate,
        };
        return react_1.default.createElement(ViewComponent, viewProps);
    };
    // 获取导航菜单项
    var getNavigationItems = function () {
        if (!viewManager)
            return [];
        return viewManager.createNavigationItems(currentView, handleNavigate);
    };
    // 获取应用标题
    var getAppTitle = function () {
        if (!viewManager || !config)
            return 'CodeLine';
        var viewDisplayName = viewManager.getViewDisplayName(currentView);
        return "CodeLine - ".concat(viewDisplayName);
    };
    if (!isInitialized) {
        return (<div className="flex h-full flex-col items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="text-3xl font-bold mb-4">CodeLine</div>
          <div className="text-lg text-gray-400 mb-6">Your AI Coding Assistant</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
            <span className="ml-2 text-sm text-gray-400">Initializing configuration...</span>
          </div>
        </div>
      </div>);
    }
    var navigationItems = getNavigationItems();
    return (<div className="flex h-full flex-col bg-background text-foreground">
      {/* 顶部导航栏 - 基于配置动态生成 */}
      <nav className="flex items-center border-b border-border bg-secondary px-4 py-2">
        {/* 应用标志 */}
        <div className="flex items-center space-x-3 mr-6">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">CL</span>
          </div>
          <div className="text-sm font-semibold">CodeLine</div>
        </div>
        
        {/* 视图导航菜单 */}
        <div className="flex items-center space-x-1 flex-1">
          {navigationItems.map(function (item) { return (<button key={item.id} className={"px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 capitalize ".concat(item.isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary')} onClick={item.onClick} title={item.description} disabled={!item.enabled}>
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>); })}
        </div>
        
        {/* 右侧状态信息 */}
        <div className="ml-auto flex items-center space-x-4">
          {(config === null || config === void 0 ? void 0 : config.ui.showVersion) && (<div className="text-xs text-gray-400">
              v{config.ui.version}
            </div>)}
          
          {/* 配置状态指示器 */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="text-xs text-gray-400">
              {navigationItems.length} view{navigationItems.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* 快速操作菜单（如果需要） */}
          <button className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded" onClick={function () { return handleNavigate('settings'); }}>
            ⚙️ Settings
          </button>
        </div>
      </nav>
      
      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto">
        {config ? renderCurrentView() : (<div className="flex h-full items-center justify-center">
            <div className="text-lg text-gray-400">Loading configuration...</div>
          </div>)}
      </main>
      
      {/* 底部状态栏（可选） */}
      {(config === null || config === void 0 ? void 0 : config.ui.showVersion) && (<div className="border-t border-border bg-secondary px-4 py-1">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">
              CodeLine v{config.ui.version} • {currentView} view
            </div>
            <div className="text-xs text-gray-400">
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>)}
    </div>);
}
exports.default = App;
