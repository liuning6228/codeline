"use strict";
/**
 * 文件管理工具适配器
 * 将现有的 FileManager 模块适配到统一的工具接口
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.FileManagerAdapter = void 0;
var fileManager_1 = require("../../file/fileManager");
var ToolAdapter_1 = require("./ToolAdapter");
/**
 * 文件管理工具适配器
 */
var FileManagerAdapter = /** @class */ (function (_super) {
    __extends(FileManagerAdapter, _super);
    function FileManagerAdapter(context) {
        var _this = _super.call(this, 'file-manager', 'File Manager', 'File system operations (create, read, update, delete, list, copy, move)', '1.0.0', 'CodeLine Team', ['filesystem', 'file', 'directory', 'read', 'write', 'delete', 'copy', 'move'], {
            operation: {
                type: 'string',
                description: 'File operation type',
                required: true,
                validation: function (value) { return ['create', 'read', 'update', 'delete', 'list', 'copy', 'move'].includes(value); },
            },
            filePath: {
                type: 'string',
                description: 'Source file path (relative to workspace)',
                required: true,
            },
            targetPath: {
                type: 'string',
                description: 'Target file path (for copy/move operations)',
                required: false,
            },
            content: {
                type: 'string',
                description: 'File content (for create/update operations)',
                required: false,
            },
            offset: {
                type: 'number',
                description: 'Line offset for reading files (1-indexed)',
                required: false,
                default: 1,
            },
            limit: {
                type: 'number',
                description: 'Maximum lines to read',
                required: false,
                default: 1000,
            },
            recursive: {
                type: 'boolean',
                description: 'Recursive listing for directories',
                required: false,
                default: false,
            },
            mode: {
                type: 'string',
                description: 'File permissions (octal)',
                required: false,
            },
        }) || this;
        _this.fileManager = new fileManager_1.FileManager(context.workspaceRoot);
        return _this;
    }
    /**
     * 检查权限
     */
    FileManagerAdapter.prototype.checkPermissions = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            var operation;
            return __generator(this, function (_a) {
                operation = params.operation;
                // 检查操作权限
                switch (operation) {
                    case 'read':
                    case 'list':
                        // 读取操作通常允许
                        return [2 /*return*/, {
                                allowed: true,
                                requiresUserConfirmation: false,
                            }];
                    case 'create':
                    case 'update':
                        // 写入操作可能需要确认
                        return [2 /*return*/, {
                                allowed: true,
                                requiresUserConfirmation: true,
                                confirmationPrompt: "Are you sure you want to ".concat(operation, " file: ").concat(params.filePath, "?"),
                            }];
                    case 'delete':
                        // 删除操作需要确认
                        return [2 /*return*/, {
                                allowed: true,
                                requiresUserConfirmation: true,
                                confirmationPrompt: "WARNING: This will permanently delete ".concat(params.filePath, ". Are you sure?"),
                            }];
                    case 'copy':
                    case 'move':
                        // 文件操作需要确认
                        return [2 /*return*/, {
                                allowed: true,
                                requiresUserConfirmation: true,
                                confirmationPrompt: "Are you sure you want to ".concat(operation, " ").concat(params.filePath, " to ").concat(params.targetPath, "?"),
                            }];
                    default:
                        return [2 /*return*/, {
                                allowed: false,
                                reason: "Unknown operation: ".concat(operation),
                            }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 验证参数
     */
    FileManagerAdapter.prototype.validateParameters = function (params, context) {
        return __awaiter(this, void 0, void 0, function () {
            var operation, filePath, targetPath, content;
            return __generator(this, function (_a) {
                operation = params.operation, filePath = params.filePath, targetPath = params.targetPath, content = params.content;
                // 基本验证
                if (!operation) {
                    return [2 /*return*/, {
                            valid: false,
                            error: 'Operation type is required',
                        }];
                }
                // 操作特定验证
                switch (operation) {
                    case 'create':
                        if (!filePath) {
                            return [2 /*return*/, {
                                    valid: false,
                                    error: 'filePath is required for create operation',
                                }];
                        }
                        break;
                    case 'read':
                    case 'update':
                    case 'delete':
                        if (!filePath) {
                            return [2 /*return*/, {
                                    valid: false,
                                    error: 'filePath is required for read/update/delete operations',
                                }];
                        }
                        break;
                    case 'list':
                        // filePath 是可选的（默认为当前目录）
                        break;
                    case 'copy':
                    case 'move':
                        if (!filePath || !targetPath) {
                            return [2 /*return*/, {
                                    valid: false,
                                    error: 'filePath and targetPath are required for copy/move operations',
                                }];
                        }
                        break;
                    default:
                        return [2 /*return*/, {
                                valid: false,
                                error: "Unsupported operation: ".concat(operation),
                            }];
                }
                // 路径安全验证
                if (filePath && !this.isSafePath(filePath, context.workspaceRoot)) {
                    return [2 /*return*/, {
                            valid: false,
                            error: "Unsafe file path: ".concat(filePath),
                        }];
                }
                if (targetPath && !this.isSafePath(targetPath, context.workspaceRoot)) {
                    return [2 /*return*/, {
                            valid: false,
                            error: "Unsafe target path: ".concat(targetPath),
                        }];
                }
                return [2 /*return*/, {
                        valid: true,
                        sanitizedParams: params,
                    }];
            });
        });
    };
    /**
     * 执行文件操作
     */
    FileManagerAdapter.prototype.execute = function (params, context, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, operation, result, _a, listResult, duration, error_1, duration;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        operation = params.operation;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 18, , 19]);
                        // 报告开始进度
                        this.reportProgress(onProgress, {
                            type: 'file_operation_start',
                            progress: 0.1,
                            message: "Starting ".concat(operation, " operation"),
                            data: { operation: operation, filePath: params.filePath },
                        });
                        result = void 0;
                        _a = operation;
                        switch (_a) {
                            case 'create': return [3 /*break*/, 2];
                            case 'read': return [3 /*break*/, 4];
                            case 'update': return [3 /*break*/, 6];
                            case 'delete': return [3 /*break*/, 8];
                            case 'list': return [3 /*break*/, 10];
                            case 'copy': return [3 /*break*/, 12];
                            case 'move': return [3 /*break*/, 14];
                        }
                        return [3 /*break*/, 16];
                    case 2:
                        this.reportProgress(onProgress, {
                            type: 'file_creating',
                            progress: 0.3,
                            message: "Creating file: ".concat(params.filePath),
                        });
                        return [4 /*yield*/, this.fileManager.createFile(params.filePath, params.content || '')];
                    case 3:
                        result = _b.sent();
                        return [3 /*break*/, 17];
                    case 4:
                        this.reportProgress(onProgress, {
                            type: 'file_reading',
                            progress: 0.3,
                            message: "Reading file: ".concat(params.filePath),
                        });
                        return [4 /*yield*/, this.fileManager.readFileWithLimits(params.filePath, params.offset || 1, params.limit || 1000)];
                    case 5:
                        result = _b.sent();
                        return [3 /*break*/, 17];
                    case 6:
                        this.reportProgress(onProgress, {
                            type: 'file_updating',
                            progress: 0.3,
                            message: "Updating file: ".concat(params.filePath),
                        });
                        return [4 /*yield*/, this.fileManager.editFileWithDiff(params.filePath, params.content || '')];
                    case 7:
                        result = _b.sent();
                        return [3 /*break*/, 17];
                    case 8:
                        this.reportProgress(onProgress, {
                            type: 'file_deleting',
                            progress: 0.3,
                            message: "Deleting file: ".concat(params.filePath),
                        });
                        return [4 /*yield*/, this.fileManager.deleteFile(params.filePath)];
                    case 9:
                        result = _b.sent();
                        return [3 /*break*/, 17];
                    case 10:
                        this.reportProgress(onProgress, {
                            type: 'directory_listing',
                            progress: 0.3,
                            message: "Listing directory: ".concat(params.filePath || '.'),
                        });
                        return [4 /*yield*/, this.fileManager.listDirectory(params.filePath || '.')];
                    case 11:
                        listResult = _b.sent();
                        // 包装为FileOperationResult
                        result = {
                            success: true,
                            filePath: params.filePath || '.',
                            message: "Directory listed successfully with ".concat(listResult.files.length, " entries"),
                            // 将列表数据放在diff字段中（类型断言，因为FileDiff期望不同的结构）
                            diff: {
                                filePath: params.filePath || '.',
                                oldContent: '',
                                newContent: '',
                                changes: [],
                                summary: "Directory listing with ".concat(listResult.files.length, " files, ").concat(listResult.directories, " directories"),
                                // 添加额外字段存储实际列表数据
                                data: listResult
                            }
                        };
                        return [3 /*break*/, 17];
                    case 12:
                        this.reportProgress(onProgress, {
                            type: 'file_copying',
                            progress: 0.3,
                            message: "Copying file: ".concat(params.filePath, " -> ").concat(params.targetPath),
                        });
                        return [4 /*yield*/, this.fileManager.copyFile(params.filePath, params.targetPath)];
                    case 13:
                        result = _b.sent();
                        return [3 /*break*/, 17];
                    case 14:
                        this.reportProgress(onProgress, {
                            type: 'file_moving',
                            progress: 0.3,
                            message: "Moving file: ".concat(params.filePath, " -> ").concat(params.targetPath),
                        });
                        return [4 /*yield*/, this.fileManager.moveFile(params.filePath, params.targetPath)];
                    case 15:
                        result = _b.sent();
                        return [3 /*break*/, 17];
                    case 16: throw new Error("Unsupported operation: ".concat(operation));
                    case 17:
                        // 报告完成进度
                        this.reportProgress(onProgress, {
                            type: 'file_operation_complete',
                            progress: 1.0,
                            message: "Completed ".concat(operation, " operation"),
                            data: { success: result.success, filePath: params.filePath },
                        });
                        duration = Date.now() - startTime;
                        // 返回结果
                        if (result.success) {
                            return [2 /*return*/, this.createSuccessResult({
                                    result: result,
                                    // 如果有更多统计信息可以添加到这里
                                }, duration, {
                                    operation: operation,
                                    filePath: params.filePath,
                                    targetPath: params.targetPath,
                                })];
                        }
                        else {
                            return [2 /*return*/, this.createErrorResult(result.error || "File operation failed: ".concat(operation), duration, {
                                    operation: operation,
                                    filePath: params.filePath,
                                    targetPath: params.targetPath,
                                })];
                        }
                        return [3 /*break*/, 19];
                    case 18:
                        error_1 = _b.sent();
                        duration = Date.now() - startTime;
                        this.reportProgress(onProgress, {
                            type: 'file_operation_error',
                            progress: 1.0,
                            message: "File operation failed: ".concat(error_1.message),
                        });
                        return [2 /*return*/, this.createErrorResult("File operation failed: ".concat(error_1.message), duration, {
                                operation: operation,
                                filePath: params.filePath,
                                targetPath: params.targetPath,
                            })];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查是否为只读操作
     */
    FileManagerAdapter.prototype.isReadOnly = function (context) {
        // 读取和列表是只读操作
        return false; // 实际检查应该在 validateParameters 中
    };
    /**
     * 检查是否为破坏性操作
     */
    FileManagerAdapter.prototype.isDestructive = function (context) {
        return true; // 文件操作可能是破坏性的
    };
    /**
     * 获取显示名称
     */
    FileManagerAdapter.prototype.getDisplayName = function (params) {
        var operation = (params === null || params === void 0 ? void 0 : params.operation) || 'file';
        return "".concat(operation.charAt(0).toUpperCase() + operation.slice(1), " File");
    };
    /**
     * 获取活动描述
     */
    FileManagerAdapter.prototype.getActivityDescription = function (params) {
        var operation = params.operation, filePath = params.filePath, targetPath = params.targetPath;
        switch (operation) {
            case 'create':
                return "Creating file: ".concat(filePath);
            case 'read':
                return "Reading file: ".concat(filePath);
            case 'update':
                return "Updating file: ".concat(filePath);
            case 'delete':
                return "Deleting file: ".concat(filePath);
            case 'list':
                return "Listing directory: ".concat(filePath || 'current directory');
            case 'copy':
                return "Copying: ".concat(filePath, " \u2192 ").concat(targetPath);
            case 'move':
                return "Moving: ".concat(filePath, " \u2192 ").concat(targetPath);
            default:
                return "File operation: ".concat(operation);
        }
    };
    /**
     * 检查路径安全性
     */
    FileManagerAdapter.prototype.isSafePath = function (path, workspaceRoot) {
        try {
            var fullPath = require('path').resolve(workspaceRoot, path);
            var normalizedPath = require('path').normalize(fullPath);
            // 检查是否在工作区内
            return normalizedPath.startsWith(workspaceRoot);
        }
        catch (error) {
            return false;
        }
    };
    /**
     * 工厂方法：创建文件管理工具适配器
     */
    FileManagerAdapter.create = function (context) {
        return new FileManagerAdapter(context);
    };
    return FileManagerAdapter;
}(ToolAdapter_1.BaseToolAdapter));
exports.FileManagerAdapter = FileManagerAdapter;
