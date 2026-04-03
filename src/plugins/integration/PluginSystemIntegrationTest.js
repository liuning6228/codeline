"use strict";
/**
 * 插件系统集成测试
 * 验证插件系统的完整功能
 * 基于Claude Code CP-20260402-003插件模式
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
exports.PluginSystemIntegrationTest = void 0;
exports.runPluginSystemIntegrationTest = runPluginSystemIntegrationTest;
var vscode = require("vscode");
var path = require("path");
var fs = require("fs/promises");
var PluginToolRegistry_1 = require("../PluginToolRegistry");
var PluginMCPHandler_1 = require("../PluginMCPHandler");
/**
 * 插件系统集成测试
 */
var PluginSystemIntegrationTest = /** @class */ (function () {
    function PluginSystemIntegrationTest(extensionContext, workspaceRoot) {
        this.pluginToolRegistry = null;
        this.pluginMCPHandler = null;
        this.testResults = [];
        this.extensionContext = extensionContext;
        this.outputChannel = vscode.window.createOutputChannel('Plugin System Integration Test');
        // 创建全局上下文
        this.globalContext = {
            extensionContext: extensionContext,
            workspaceRoot: workspaceRoot,
            cwd: workspaceRoot,
            outputChannel: this.outputChannel,
            sessionId: 'plugin-system-test-' + Date.now(),
        };
    }
    /**
     * 运行所有集成测试
     */
    PluginSystemIntegrationTest.prototype.runAllTests = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, allPassed, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.show(true);
                        this.outputChannel.appendLine('🧪 Starting Plugin System Integration Tests...');
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, 9, 11]);
                        // 运行测试套件
                        return [4 /*yield*/, this.runTestSuite('Plugin System Initialization', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.testPluginSystemInitialization()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        // 运行测试套件
                        _a.sent();
                        return [4 /*yield*/, this.runTestSuite('Plugin Tool Registration', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.testPluginToolRegistration()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.runTestSuite('Plugin MCP Integration', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.testPluginMCPIntegration()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.runTestSuite('Plugin Lifecycle Management', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.testPluginLifecycleManagement()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.runTestSuite('Plugin Configuration', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.testPluginConfiguration()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 6:
                        _a.sent();
                        // 生成测试报告
                        return [4 /*yield*/, this.generateTestReport(startTime)];
                    case 7:
                        // 生成测试报告
                        _a.sent();
                        allPassed = this.testResults.every(function (result) { return result.passed; });
                        return [2 /*return*/, allPassed];
                    case 8:
                        error_1 = _a.sent();
                        this.outputChannel.appendLine("\u274C Integration tests failed: ".concat(error_1.message));
                        return [2 /*return*/, false];
                    case 9: 
                    // 清理资源
                    return [4 /*yield*/, this.cleanup()];
                    case 10:
                        // 清理资源
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 运行测试套件
     */
    PluginSystemIntegrationTest.prototype.runTestSuite = function (suiteName, testFunction) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, duration, error_2, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine("\n\uD83D\uDCCB Test Suite: ".concat(suiteName));
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, testFunction()];
                    case 2:
                        _a.sent();
                        duration = Date.now() - startTime;
                        this.testResults.push({
                            test: suiteName,
                            passed: true,
                            message: 'All tests passed',
                            duration: duration,
                        });
                        this.outputChannel.appendLine("\u2705 ".concat(suiteName, ": PASSED (").concat(duration, "ms)"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        duration = Date.now() - startTime;
                        this.testResults.push({
                            test: suiteName,
                            passed: false,
                            message: error_2.message,
                            duration: duration,
                        });
                        this.outputChannel.appendLine("\u274C ".concat(suiteName, ": FAILED (").concat(duration, "ms) - ").concat(error_2.message));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 测试插件系统初始化
     */
    PluginSystemIntegrationTest.prototype.testPluginSystemInitialization = function () {
        return __awaiter(this, void 0, void 0, function () {
            var initialized, mcpInitialized;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 初始化插件工具注册表
                        this.pluginToolRegistry = new PluginToolRegistry_1.PluginToolRegistry({
                            enablePluginSupport: true,
                            autoLoadPlugins: true,
                            pluginToolPrefix: 'test:',
                        });
                        return [4 /*yield*/, this.pluginToolRegistry.initializeWithPlugins(this.extensionContext, this.globalContext)];
                    case 1:
                        initialized = _a.sent();
                        if (!initialized) {
                            throw new Error('Failed to initialize Plugin Tool Registry');
                        }
                        // 初始化插件MCP处理器
                        this.pluginMCPHandler = new PluginMCPHandler_1.PluginMCPHandler(this.extensionContext);
                        return [4 /*yield*/, this.pluginMCPHandler.initialize(this.globalContext.workspaceRoot, this.pluginToolRegistry)];
                    case 2:
                        mcpInitialized = _a.sent();
                        if (!mcpInitialized) {
                            throw new Error('Failed to initialize Plugin MCP Handler');
                        }
                        this.outputChannel.appendLine('✅ Plugin systems initialized successfully');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 测试插件工具注册
     */
    PluginSystemIntegrationTest.prototype.testPluginToolRegistration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pluginManager, registryState, toolRegistry, allTools;
            return __generator(this, function (_a) {
                if (!this.pluginToolRegistry) {
                    throw new Error('Plugin Tool Registry not initialized');
                }
                pluginManager = this.pluginToolRegistry.getPluginManager();
                if (!pluginManager) {
                    throw new Error('Plugin Manager not available');
                }
                registryState = this.pluginToolRegistry.getPluginRegistryState();
                this.outputChannel.appendLine("\uD83D\uDCCA Plugin Registry State: ".concat(JSON.stringify(registryState, null, 2)));
                toolRegistry = this.pluginToolRegistry.getToolRegistry();
                allTools = toolRegistry.getAllTools(this.globalContext);
                this.outputChannel.appendLine("\uD83D\uDD27 Total tools in registry: ".concat(allTools.length));
                if (allTools.length === 0) {
                    throw new Error('No tools found in registry');
                }
                this.outputChannel.appendLine('✅ Plugin tool registration test passed');
                return [2 /*return*/];
            });
        });
    };
    /**
     * 测试插件MCP集成
     */
    PluginSystemIntegrationTest.prototype.testPluginMCPIntegration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testMessage, response, statusMessage, statusResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pluginMCPHandler) {
                            throw new Error('Plugin MCP Handler not initialized');
                        }
                        testMessage = {
                            type: 'plugin_mcp_get_servers',
                            data: {},
                        };
                        return [4 /*yield*/, this.pluginMCPHandler.handlePluginMessage(testMessage)];
                    case 1:
                        response = _a.sent();
                        if (!response.success) {
                            throw new Error("MCP message handling failed: ".concat(response.error));
                        }
                        this.outputChannel.appendLine("\uD83D\uDCCA MCP Response: ".concat(JSON.stringify(response.data, null, 2)));
                        statusMessage = {
                            type: 'plugin_mcp_scan_plugins',
                            data: {},
                        };
                        return [4 /*yield*/, this.pluginMCPHandler.handlePluginMessage(statusMessage)];
                    case 2:
                        statusResponse = _a.sent();
                        if (!statusResponse.success) {
                            throw new Error("Plugin scan failed: ".concat(statusResponse.error));
                        }
                        this.outputChannel.appendLine('✅ Plugin MCP integration test passed');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 测试插件生命周期管理
     */
    PluginSystemIntegrationTest.prototype.testPluginLifecycleManagement = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pluginManager, plugins, _i, plugins_1, plugin, pluginId, state, managerState;
            return __generator(this, function (_a) {
                if (!this.pluginToolRegistry) {
                    throw new Error('Plugin Tool Registry not initialized');
                }
                pluginManager = this.pluginToolRegistry.getPluginManager();
                if (!pluginManager) {
                    throw new Error('Plugin Manager not available');
                }
                plugins = pluginManager.getPlugins();
                this.outputChannel.appendLine("\uD83D\uDCE6 Total plugins: ".concat(plugins.length));
                // 检查插件状态
                for (_i = 0, plugins_1 = plugins; _i < plugins_1.length; _i++) {
                    plugin = plugins_1[_i];
                    pluginId = plugin.metadata.id;
                    state = pluginManager.getPluginState(pluginId);
                    this.outputChannel.appendLine("  - ".concat(plugin.metadata.name, " (").concat(pluginId, "): ").concat(state));
                    if (state === 'error') {
                        throw new Error("Plugin ".concat(pluginId, " is in error state"));
                    }
                }
                managerState = pluginManager.getState();
                this.outputChannel.appendLine("\uD83D\uDCCA Plugin Manager State: loaded=".concat(managerState.loadedPlugins, ", active=").concat(managerState.activePlugins));
                this.outputChannel.appendLine('✅ Plugin lifecycle management test passed');
                return [2 /*return*/];
            });
        });
    };
    /**
     * 测试插件配置
     */
    PluginSystemIntegrationTest.prototype.testPluginConfiguration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pluginManager, plugins, _i, plugins_2, plugin, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pluginToolRegistry) {
                            throw new Error('Plugin Tool Registry not initialized');
                        }
                        pluginManager = this.pluginToolRegistry.getPluginManager();
                        if (!pluginManager) {
                            throw new Error('Plugin Manager not available');
                        }
                        plugins = pluginManager.getPlugins();
                        _i = 0, plugins_2 = plugins;
                        _a.label = 1;
                    case 1:
                        if (!(_i < plugins_2.length)) return [3 /*break*/, 6];
                        plugin = plugins_2[_i];
                        if (!plugin.configSchema) return [3 /*break*/, 5];
                        this.outputChannel.appendLine("\u2699\uFE0F Plugin ".concat(plugin.metadata.name, " has config schema"));
                        if (!plugin.updateConfig) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, plugin.updateConfig({
                                testConfig: 'integration-test-value',
                                timestamp: Date.now(),
                            })];
                    case 3:
                        _a.sent();
                        this.outputChannel.appendLine("  \u2713 Config update supported");
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        this.outputChannel.appendLine("  \u26A0\uFE0F Config update error: ".concat(error_3));
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.outputChannel.appendLine('✅ Plugin configuration test passed');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成测试报告
     */
    PluginSystemIntegrationTest.prototype.generateTestReport = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var totalDuration, passedTests, totalTests, successRate, _i, _a, result, status_1, reportPath, reportData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        totalDuration = Date.now() - startTime;
                        passedTests = this.testResults.filter(function (result) { return result.passed; }).length;
                        totalTests = this.testResults.length;
                        successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
                        this.outputChannel.appendLine('\n📊 =================================');
                        this.outputChannel.appendLine('📊 PLUGIN SYSTEM INTEGRATION TEST REPORT');
                        this.outputChannel.appendLine('📊 =================================');
                        this.outputChannel.appendLine("\uD83D\uDCCA Total Tests: ".concat(totalTests));
                        this.outputChannel.appendLine("\uD83D\uDCCA Passed: ".concat(passedTests));
                        this.outputChannel.appendLine("\uD83D\uDCCA Failed: ".concat(totalTests - passedTests));
                        this.outputChannel.appendLine("\uD83D\uDCCA Success Rate: ".concat(successRate.toFixed(1), "%"));
                        this.outputChannel.appendLine("\uD83D\uDCCA Total Duration: ".concat(totalDuration, "ms"));
                        this.outputChannel.appendLine('📊 =================================\n');
                        // 详细测试结果
                        for (_i = 0, _a = this.testResults; _i < _a.length; _i++) {
                            result = _a[_i];
                            status_1 = result.passed ? '✅ PASS' : '❌ FAIL';
                            this.outputChannel.appendLine("".concat(status_1, " ").concat(result.test, " (").concat(result.duration, "ms)"));
                            if (result.message && !result.passed) {
                                this.outputChannel.appendLine("   Message: ".concat(result.message));
                            }
                        }
                        this.outputChannel.appendLine('\n📊 =================================');
                        reportPath = path.join(this.globalContext.workspaceRoot, '.codeline', 'plugin-system-test-report.json');
                        reportData = {
                            timestamp: new Date().toISOString(),
                            totalTests: totalTests,
                            passedTests: passedTests,
                            failedTests: totalTests - passedTests,
                            successRate: successRate,
                            totalDuration: totalDuration,
                            results: this.testResults,
                        };
                        return [4 /*yield*/, fs.mkdir(path.dirname(reportPath), { recursive: true })];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, fs.writeFile(reportPath, JSON.stringify(reportData, null, 2), 'utf-8')];
                    case 2:
                        _b.sent();
                        this.outputChannel.appendLine("\uD83D\uDCCA Report saved to: ".concat(reportPath));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清理资源
     */
    PluginSystemIntegrationTest.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.outputChannel.appendLine('\n🧹 Cleaning up test resources...');
                        if (!this.pluginMCPHandler) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.pluginMCPHandler.close()];
                    case 2:
                        _a.sent();
                        this.outputChannel.appendLine('✅ Plugin MCP Handler closed');
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Failed to close Plugin MCP Handler: ".concat(error_4));
                        return [3 /*break*/, 4];
                    case 4:
                        if (!this.pluginToolRegistry) return [3 /*break*/, 8];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.pluginToolRegistry.closeWithPlugins()];
                    case 6:
                        _a.sent();
                        this.outputChannel.appendLine('✅ Plugin Tool Registry closed');
                        return [3 /*break*/, 8];
                    case 7:
                        error_5 = _a.sent();
                        this.outputChannel.appendLine("\u26A0\uFE0F Failed to close Plugin Tool Registry: ".concat(error_5));
                        return [3 /*break*/, 8];
                    case 8:
                        this.outputChannel.appendLine('🧹 Test cleanup complete');
                        return [2 /*return*/];
                }
            });
        });
    };
    return PluginSystemIntegrationTest;
}());
exports.PluginSystemIntegrationTest = PluginSystemIntegrationTest;
/**
 * 运行插件系统集成测试
 */
function runPluginSystemIntegrationTest(extensionContext, workspaceRoot) {
    return __awaiter(this, void 0, void 0, function () {
        var tester;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tester = new PluginSystemIntegrationTest(extensionContext, workspaceRoot);
                    return [4 /*yield*/, tester.runAllTests()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
