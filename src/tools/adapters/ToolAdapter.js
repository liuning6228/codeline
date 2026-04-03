"use strict";
/**
 * 工具适配器基类
 * 为现有模块提供统一的工具接口适配
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
exports.BaseToolAdapter = void 0;
var vscode = require("vscode");
/**
 * 基础工具适配器
 */
var BaseToolAdapter = /** @class */ (function () {
    function BaseToolAdapter(id, name, description, version, author, capabilities, parameterSchema) {
        if (capabilities === void 0) { capabilities = []; }
        this.id = id;
        this.name = name;
        this.description = description;
        this.version = version;
        this.author = author;
        this.capabilities = capabilities;
        this.parameterSchema = parameterSchema;
        this.outputChannel = vscode.window.createOutputChannel("CodeLine Tool: ".concat(name));
    }
    /**
     * 默认实现：总是启用
     */
    BaseToolAdapter.prototype.isEnabled = function (context) {
        return true;
    };
    /**
     * 默认实现：不支持并发
     */
    BaseToolAdapter.prototype.isConcurrencySafe = function (context) {
        return false;
    };
    /**
     * 默认实现：不是只读
     */
    BaseToolAdapter.prototype.isReadOnly = function (context) {
        return false;
    };
    /**
     * 默认实现：不是破坏性操作
     */
    BaseToolAdapter.prototype.isDestructive = function (context) {
        return false;
    };
    /**
     * 默认权限检查：允许所有操作
     */
    BaseToolAdapter.prototype.checkPermissions = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        allowed: true,
                        requiresUserConfirmation: false,
                    }];
            });
        });
    };
    /**
     * 默认参数验证：总是有效
     */
    BaseToolAdapter.prototype.validateParameters = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        valid: true,
                        sanitizedParams: params,
                    }];
            });
        });
    };
    /**
     * 默认取消方法：不支持取消
     */
    BaseToolAdapter.prototype.cancel = function (executionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.outputChannel.appendLine("\u26A0\uFE0F Tool ".concat(this.id, " does not support cancellation"));
                return [2 /*return*/, false];
            });
        });
    };
    /**
     * 默认显示名称：使用工具名称
     */
    BaseToolAdapter.prototype.getDisplayName = function (params) {
        return this.name;
    };
    /**
     * 默认活动描述：使用工具描述
     */
    BaseToolAdapter.prototype.getActivityDescription = function (params) {
        return "".concat(this.name, ": ").concat(this.description);
    };
    /**
     * 报告进度
     */
    BaseToolAdapter.prototype.reportProgress = function (onProgress, progress) {
        if (onProgress) {
            onProgress(progress);
        }
    };
    /**
     * 创建成功结果
     */
    BaseToolAdapter.prototype.createSuccessResult = function (output, duration, metadata) {
        return {
            success: true,
            output: output,
            toolId: this.id,
            duration: duration,
            timestamp: new Date(),
            metadata: metadata,
        };
    };
    /**
     * 创建失败结果
     */
    BaseToolAdapter.prototype.createErrorResult = function (error, duration, metadata) {
        return {
            success: false,
            error: error,
            toolId: this.id,
            duration: duration,
            timestamp: new Date(),
            metadata: metadata,
        };
    };
    /**
     * 关闭输出通道
     */
    BaseToolAdapter.prototype.dispose = function () {
        this.outputChannel.dispose();
    };
    return BaseToolAdapter;
}());
exports.BaseToolAdapter = BaseToolAdapter;
