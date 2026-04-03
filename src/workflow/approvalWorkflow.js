"use strict";
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
exports.ApprovalWorkflow = void 0;
/**
 * 用户批准工作流管理器
 *
 * 实现Cline风格的"提议-批准"工作流，让用户可以：
 * 1. 预览AI提议的操作
 * 2. 批量批准或拒绝操作
 * 3. 查看批准历史
 * 4. 配置批准策略
 */
var ApprovalWorkflow = /** @class */ (function () {
    function ApprovalWorkflow() {
        this.pendingItems = new Map();
        this.historyItems = [];
        this.listeners = [];
    }
    /**
     * 提议一个新操作，等待用户批准
     */
    ApprovalWorkflow.prototype.proposeOperation = function (type, description, data, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var id = this.generateId();
        var item = {
            id: id,
            type: type,
            description: description,
            data: data,
            status: 'pending',
            createdAt: new Date(),
            tags: []
        };
        this.pendingItems.set(id, item);
        // 通知监听器
        this.notifyListeners(item);
        // 如果设置了自动批准延迟，设置定时器
        if (options.autoApproveDelay && options.autoApproveDelay > 0) {
            setTimeout(function () {
                if (_this.pendingItems.has(id)) {
                    _this.approveItem(id, { auto: true, reason: 'Auto-approved after delay' });
                }
            }, options.autoApproveDelay);
        }
        // 如果设置了超时时间，设置超时处理
        if (options.timeout && options.timeout > 0) {
            setTimeout(function () {
                if (_this.pendingItems.has(id)) {
                    _this.rejectItem(id, { reason: 'Operation timeout' });
                }
            }, options.timeout);
        }
        return id;
    };
    /**
     * 批准一个待处理项
     */
    ApprovalWorkflow.prototype.approveItem = function (itemId_1) {
        return __awaiter(this, arguments, void 0, function (itemId, options) {
            var item, result;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                item = this.pendingItems.get(itemId);
                if (!item) {
                    throw new Error("Approval item not found: ".concat(itemId));
                }
                // 更新状态
                item.status = 'approved';
                item.resolvedAt = new Date();
                // 移动到历史记录
                this.moveToHistory(itemId);
                result = {
                    success: true,
                    itemId: itemId,
                    action: 'approved',
                    timestamp: new Date(),
                    reason: options.reason || (options.auto ? 'Auto-approved' : 'Manually approved')
                };
                this.notifyListeners(item);
                return [2 /*return*/, result];
            });
        });
    };
    /**
     * 拒绝一个待处理项
     */
    ApprovalWorkflow.prototype.rejectItem = function (itemId_1) {
        return __awaiter(this, arguments, void 0, function (itemId, options) {
            var item, result;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                item = this.pendingItems.get(itemId);
                if (!item) {
                    throw new Error("Approval item not found: ".concat(itemId));
                }
                // 更新状态
                item.status = 'rejected';
                item.resolvedAt = new Date();
                item.rejectionReason = options.reason || (options.auto ? 'Auto-rejected' : 'Manually rejected');
                // 移动到历史记录
                this.moveToHistory(itemId);
                result = {
                    success: true,
                    itemId: itemId,
                    action: 'rejected',
                    timestamp: new Date(),
                    reason: item.rejectionReason
                };
                this.notifyListeners(item);
                return [2 /*return*/, result];
            });
        });
    };
    /**
     * 批量批准多个待处理项
     */
    ApprovalWorkflow.prototype.approveItems = function (itemIds, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, itemIds_1, itemId, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, itemIds_1 = itemIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < itemIds_1.length)) return [3 /*break*/, 6];
                        itemId = itemIds_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.approveItem(itemId, { reason: reason })];
                    case 3:
                        result = _a.sent();
                        results.push(result);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        results.push({
                            success: false,
                            itemId: itemId,
                            action: 'approved',
                            timestamp: new Date(),
                            reason: error_1.message
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 批量拒绝多个待处理项
     */
    ApprovalWorkflow.prototype.rejectItems = function (itemIds, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, itemIds_2, itemId, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, itemIds_2 = itemIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < itemIds_2.length)) return [3 /*break*/, 6];
                        itemId = itemIds_2[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.rejectItem(itemId, { reason: reason })];
                    case 3:
                        result = _a.sent();
                        results.push(result);
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        results.push({
                            success: false,
                            itemId: itemId,
                            action: 'rejected',
                            timestamp: new Date(),
                            reason: error_2.message
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 标记项为已执行
     */
    ApprovalWorkflow.prototype.markAsExecuted = function (itemId, result) {
        var item = this.historyItems.find(function (i) { return i.id === itemId; });
        if (item && item.status === 'approved') {
            item.status = 'executed';
            item.executedAt = new Date();
            item.executionResult = result;
            this.notifyListeners(item);
        }
    };
    /**
     * 标记项为执行失败
     */
    ApprovalWorkflow.prototype.markAsFailed = function (itemId, error) {
        var item = this.historyItems.find(function (i) { return i.id === itemId; });
        if (item && item.status === 'approved') {
            item.status = 'failed';
            item.executedAt = new Date();
            item.executionResult = { error: error.message || String(error) };
            this.notifyListeners(item);
        }
    };
    /**
     * 获取所有待处理项
     */
    ApprovalWorkflow.prototype.getPendingItems = function () {
        return Array.from(this.pendingItems.values());
    };
    /**
     * 获取批准历史
     */
    ApprovalWorkflow.prototype.getHistory = function (limit) {
        var sorted = __spreadArray([], this.historyItems, true).sort(function (a, b) {
            return (b.resolvedAt || b.createdAt).getTime() - (a.resolvedAt || a.createdAt).getTime();
        });
        return limit ? sorted.slice(0, limit) : sorted;
    };
    /**
     * 按标签获取待处理项
     */
    ApprovalWorkflow.prototype.getPendingItemsByTag = function (tag) {
        return this.getPendingItems().filter(function (item) {
            return item.tags && item.tags.includes(tag);
        });
    };
    /**
     * 获取项统计信息
     */
    ApprovalWorkflow.prototype.getStats = function () {
        var pending = this.getPendingItems();
        var history = this.getHistory();
        return {
            total: pending.length + history.length,
            pending: pending.length,
            approved: history.filter(function (i) { return i.status === 'approved'; }).length,
            rejected: history.filter(function (i) { return i.status === 'rejected'; }).length,
            executed: history.filter(function (i) { return i.status === 'executed'; }).length,
            failed: history.filter(function (i) { return i.status === 'failed'; }).length
        };
    };
    /**
     * 清理旧的历史记录
     */
    ApprovalWorkflow.prototype.cleanupHistory = function (maxAgeDays) {
        if (maxAgeDays === void 0) { maxAgeDays = 30; }
        var cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - maxAgeDays);
        var before = this.historyItems.length;
        this.historyItems = this.historyItems.filter(function (item) {
            return (item.resolvedAt || item.createdAt) >= cutoff;
        });
        return before - this.historyItems.length;
    };
    /**
     * 清除所有待处理项
     */
    ApprovalWorkflow.prototype.clearPending = function () {
        var count = this.pendingItems.size;
        this.pendingItems.clear();
        return count;
    };
    /**
     * 添加状态变化监听器
     */
    ApprovalWorkflow.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };
    /**
     * 移除状态变化监听器
     */
    ApprovalWorkflow.prototype.removeListener = function (listener) {
        var index = this.listeners.indexOf(listener);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    };
    /**
     * 导出批准历史到JSON
     */
    ApprovalWorkflow.prototype.exportHistory = function () {
        return JSON.stringify(this.historyItems, null, 2);
    };
    /**
     * 导入批准历史从JSON
     */
    ApprovalWorkflow.prototype.importHistory = function (json) {
        var _a;
        var items = JSON.parse(json);
        // 恢复日期对象
        items.forEach(function (item) {
            item.createdAt = new Date(item.createdAt);
            if (item.resolvedAt)
                item.resolvedAt = new Date(item.resolvedAt);
            if (item.executedAt)
                item.executedAt = new Date(item.executedAt);
        });
        (_a = this.historyItems).push.apply(_a, items);
    };
    // ===== 私有方法 =====
    ApprovalWorkflow.prototype.generateId = function () {
        return "approval_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    ApprovalWorkflow.prototype.moveToHistory = function (itemId) {
        var item = this.pendingItems.get(itemId);
        if (item) {
            this.pendingItems.delete(itemId);
            this.historyItems.push(item);
        }
    };
    ApprovalWorkflow.prototype.notifyListeners = function (item) {
        this.listeners.forEach(function (listener) {
            try {
                listener(item);
            }
            catch (error) {
                console.error('Error in approval listener:', error);
            }
        });
    };
    /**
     * 生成批准项的HTML摘要（用于UI显示）
     */
    ApprovalWorkflow.prototype.generateHtmlSummary = function (item) {
        var statusClass = "approval-status-".concat(item.status);
        var typeIcon = this.getTypeIcon(item.type);
        var statusText = this.getStatusText(item.status);
        var details = '';
        if (item.type === 'file') {
            var diff = item.data;
            details = "\n        <div class=\"approval-file-details\">\n          <div class=\"approval-file-path\">\uD83D\uDCC4 ".concat(diff.filePath, "</div>\n          <div class=\"approval-file-summary\">").concat(diff.summary, "</div>\n        </div>\n      ");
        }
        else if (item.type === 'terminal') {
            var command = item.data;
            details = "\n        <div class=\"approval-terminal-details\">\n          <div class=\"approval-command\">\uD83D\uDCBB $ ".concat(command.command, "</div>\n          <div class=\"approval-cwd\">\uD83D\uDCC1 ").concat(command.cwd || 'workspace', "</div>\n        </div>\n      ");
        }
        else if (item.type === 'browser') {
            var browserOp = item.data;
            details = "\n        <div class=\"approval-browser-details\">\n          <div class=\"approval-browser-action\">\uD83C\uDF10 ".concat(browserOp.action || 'Browser operation', "</div>\n          <div class=\"approval-browser-url\">\uD83D\uDD17 ").concat(browserOp.url || 'No URL', "</div>\n        </div>\n      ");
        }
        return "\n      <div class=\"approval-item ".concat(statusClass, "\" data-id=\"").concat(item.id, "\">\n        <div class=\"approval-header\">\n          <span class=\"approval-type-icon\">").concat(typeIcon, "</span>\n          <span class=\"approval-description\">").concat(item.description, "</span>\n          <span class=\"approval-status ").concat(statusClass, "\">").concat(statusText, "</span>\n        </div>\n        ").concat(details, "\n        <div class=\"approval-meta\">\n          <span class=\"approval-time\">\uD83D\uDD50 ").concat(item.createdAt.toLocaleTimeString(), "</span>\n          ").concat(item.tags && item.tags.length > 0 ? "\n            <span class=\"approval-tags\">\n              ".concat(item.tags.map(function (tag) { return "<span class=\"approval-tag\">".concat(tag, "</span>"); }).join(''), "\n            </span>\n          ") : '', "\n        </div>\n      </div>\n    ");
    };
    /**
     * 生成批量批准操作的HTML摘要
     */
    ApprovalWorkflow.prototype.generateBatchHtmlSummary = function (items) {
        var types = items.reduce(function (acc, item) {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {});
        var typeSummary = Object.entries(types)
            .map(function (_a) {
            var type = _a[0], count = _a[1];
            return "".concat(count, " ").concat(type);
        })
            .join(', ');
        return "\n      <div class=\"approval-batch-summary\">\n        <div class=\"approval-batch-count\">\uD83D\uDCE6 ".concat(items.length, " operations</div>\n        <div class=\"approval-batch-types\">").concat(typeSummary, "</div>\n        <div class=\"approval-batch-time\">\uD83D\uDD50 ").concat(new Date().toLocaleTimeString(), "</div>\n      </div>\n    ");
    };
    ApprovalWorkflow.prototype.getTypeIcon = function (type) {
        var icons = {
            'file': '📄',
            'terminal': '💻',
            'browser': '🌐',
            'mcp': '🔧'
        };
        return icons[type] || '📝';
    };
    ApprovalWorkflow.prototype.getStatusText = function (status) {
        var texts = {
            'pending': '⏳ Pending',
            'approved': '✅ Approved',
            'rejected': '❌ Rejected',
            'executed': '🚀 Executed',
            'failed': '💥 Failed'
        };
        return texts[status] || status;
    };
    return ApprovalWorkflow;
}());
exports.ApprovalWorkflow = ApprovalWorkflow;
