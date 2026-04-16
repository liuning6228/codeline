"use strict";
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
class ApprovalWorkflow {
    pendingItems = new Map();
    historyItems = [];
    listeners = [];
    /**
     * 提议一个新操作，等待用户批准
     */
    proposeOperation(type, description, data, options = {}) {
        const id = this.generateId();
        const item = {
            id,
            type,
            description,
            data,
            status: 'pending',
            createdAt: new Date(),
            tags: []
        };
        this.pendingItems.set(id, item);
        // 通知监听器
        this.notifyListeners(item);
        // 如果设置了自动批准延迟，设置定时器
        if (options.autoApproveDelay && options.autoApproveDelay > 0) {
            setTimeout(() => {
                if (this.pendingItems.has(id)) {
                    this.approveItem(id, { auto: true, reason: 'Auto-approved after delay' });
                }
            }, options.autoApproveDelay);
        }
        // 如果设置了超时时间，设置超时处理
        if (options.timeout && options.timeout > 0) {
            setTimeout(() => {
                if (this.pendingItems.has(id)) {
                    this.rejectItem(id, { reason: 'Operation timeout' });
                }
            }, options.timeout);
        }
        return id;
    }
    /**
     * 批准一个待处理项
     */
    async approveItem(itemId, options = {}) {
        const item = this.pendingItems.get(itemId);
        if (!item) {
            throw new Error(`Approval item not found: ${itemId}`);
        }
        // 更新状态
        item.status = 'approved';
        item.resolvedAt = new Date();
        // 移动到历史记录
        this.moveToHistory(itemId);
        const result = {
            success: true,
            itemId,
            action: 'approved',
            timestamp: new Date(),
            reason: options.reason || (options.auto ? 'Auto-approved' : 'Manually approved')
        };
        this.notifyListeners(item);
        return result;
    }
    /**
     * 拒绝一个待处理项
     */
    async rejectItem(itemId, options = {}) {
        const item = this.pendingItems.get(itemId);
        if (!item) {
            throw new Error(`Approval item not found: ${itemId}`);
        }
        // 更新状态
        item.status = 'rejected';
        item.resolvedAt = new Date();
        item.rejectionReason = options.reason || (options.auto ? 'Auto-rejected' : 'Manually rejected');
        // 移动到历史记录
        this.moveToHistory(itemId);
        const result = {
            success: true,
            itemId,
            action: 'rejected',
            timestamp: new Date(),
            reason: item.rejectionReason
        };
        this.notifyListeners(item);
        return result;
    }
    /**
     * 批量批准多个待处理项
     */
    async approveItems(itemIds, reason) {
        const results = [];
        for (const itemId of itemIds) {
            try {
                const result = await this.approveItem(itemId, { reason });
                results.push(result);
            }
            catch (error) {
                results.push({
                    success: false,
                    itemId,
                    action: 'approved',
                    timestamp: new Date(),
                    reason: error.message
                });
            }
        }
        return results;
    }
    /**
     * 批量拒绝多个待处理项
     */
    async rejectItems(itemIds, reason) {
        const results = [];
        for (const itemId of itemIds) {
            try {
                const result = await this.rejectItem(itemId, { reason });
                results.push(result);
            }
            catch (error) {
                results.push({
                    success: false,
                    itemId,
                    action: 'rejected',
                    timestamp: new Date(),
                    reason: error.message
                });
            }
        }
        return results;
    }
    /**
     * 标记项为已执行
     */
    markAsExecuted(itemId, result) {
        const item = this.historyItems.find(i => i.id === itemId);
        if (item && item.status === 'approved') {
            item.status = 'executed';
            item.executedAt = new Date();
            item.executionResult = result;
            this.notifyListeners(item);
        }
    }
    /**
     * 标记项为执行失败
     */
    markAsFailed(itemId, error) {
        const item = this.historyItems.find(i => i.id === itemId);
        if (item && item.status === 'approved') {
            item.status = 'failed';
            item.executedAt = new Date();
            item.executionResult = { error: error.message || String(error) };
            this.notifyListeners(item);
        }
    }
    /**
     * 获取所有待处理项
     */
    getPendingItems() {
        return Array.from(this.pendingItems.values());
    }
    /**
     * 获取批准历史
     */
    getHistory(limit) {
        const sorted = [...this.historyItems].sort((a, b) => (b.resolvedAt || b.createdAt).getTime() - (a.resolvedAt || a.createdAt).getTime());
        return limit ? sorted.slice(0, limit) : sorted;
    }
    /**
     * 按标签获取待处理项
     */
    getPendingItemsByTag(tag) {
        return this.getPendingItems().filter(item => item.tags && item.tags.includes(tag));
    }
    /**
     * 获取项统计信息
     */
    getStats() {
        const pending = this.getPendingItems();
        const history = this.getHistory();
        return {
            total: pending.length + history.length,
            pending: pending.length,
            approved: history.filter(i => i.status === 'approved').length,
            rejected: history.filter(i => i.status === 'rejected').length,
            executed: history.filter(i => i.status === 'executed').length,
            failed: history.filter(i => i.status === 'failed').length
        };
    }
    /**
     * 清理旧的历史记录
     */
    cleanupHistory(maxAgeDays = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - maxAgeDays);
        const before = this.historyItems.length;
        this.historyItems = this.historyItems.filter(item => (item.resolvedAt || item.createdAt) >= cutoff);
        return before - this.historyItems.length;
    }
    /**
     * 清除所有待处理项
     */
    clearPending() {
        const count = this.pendingItems.size;
        this.pendingItems.clear();
        return count;
    }
    /**
     * 添加状态变化监听器
     */
    addListener(listener) {
        this.listeners.push(listener);
    }
    /**
     * 移除状态变化监听器
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    }
    /**
     * 导出批准历史到JSON
     */
    exportHistory() {
        return JSON.stringify(this.historyItems, null, 2);
    }
    /**
     * 导入批准历史从JSON
     */
    importHistory(json) {
        const items = JSON.parse(json);
        // 恢复日期对象
        items.forEach(item => {
            item.createdAt = new Date(item.createdAt);
            if (item.resolvedAt)
                item.resolvedAt = new Date(item.resolvedAt);
            if (item.executedAt)
                item.executedAt = new Date(item.executedAt);
        });
        this.historyItems.push(...items);
    }
    // ===== 私有方法 =====
    generateId() {
        return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    moveToHistory(itemId) {
        const item = this.pendingItems.get(itemId);
        if (item) {
            this.pendingItems.delete(itemId);
            this.historyItems.push(item);
        }
    }
    notifyListeners(item) {
        this.listeners.forEach(listener => {
            try {
                listener(item);
            }
            catch (error) {
                console.error('Error in approval listener:', error);
            }
        });
    }
    /**
     * 生成批准项的HTML摘要（用于UI显示）
     */
    generateHtmlSummary(item) {
        const statusClass = `approval-status-${item.status}`;
        const typeIcon = this.getTypeIcon(item.type);
        const statusText = this.getStatusText(item.status);
        let details = '';
        if (item.type === 'file') {
            const diff = item.data;
            details = `
        <div class="approval-file-details">
          <div class="approval-file-path">📄 ${diff.filePath}</div>
          <div class="approval-file-summary">${diff.summary}</div>
        </div>
      `;
        }
        else if (item.type === 'terminal') {
            const command = item.data;
            details = `
        <div class="approval-terminal-details">
          <div class="approval-command">💻 $ ${command.command}</div>
          <div class="approval-cwd">📁 ${command.cwd || 'workspace'}</div>
        </div>
      `;
        }
        else if (item.type === 'browser') {
            const browserOp = item.data;
            details = `
        <div class="approval-browser-details">
          <div class="approval-browser-action">🌐 ${browserOp.action || 'Browser operation'}</div>
          <div class="approval-browser-url">🔗 ${browserOp.url || 'No URL'}</div>
        </div>
      `;
        }
        return `
      <div class="approval-item ${statusClass}" data-id="${item.id}">
        <div class="approval-header">
          <span class="approval-type-icon">${typeIcon}</span>
          <span class="approval-description">${item.description}</span>
          <span class="approval-status ${statusClass}">${statusText}</span>
        </div>
        ${details}
        <div class="approval-meta">
          <span class="approval-time">🕐 ${item.createdAt.toLocaleTimeString()}</span>
          ${item.tags && item.tags.length > 0 ? `
            <span class="approval-tags">
              ${item.tags.map(tag => `<span class="approval-tag">${tag}</span>`).join('')}
            </span>
          ` : ''}
        </div>
      </div>
    `;
    }
    /**
     * 生成批量批准操作的HTML摘要
     */
    generateBatchHtmlSummary(items) {
        const types = items.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {});
        const typeSummary = Object.entries(types)
            .map(([type, count]) => `${count} ${type}`)
            .join(', ');
        return `
      <div class="approval-batch-summary">
        <div class="approval-batch-count">📦 ${items.length} operations</div>
        <div class="approval-batch-types">${typeSummary}</div>
        <div class="approval-batch-time">🕐 ${new Date().toLocaleTimeString()}</div>
      </div>
    `;
    }
    getTypeIcon(type) {
        const icons = {
            'file': '📄',
            'terminal': '💻',
            'browser': '🌐',
            'mcp': '🔧'
        };
        return icons[type] || '📝';
    }
    getStatusText(status) {
        const texts = {
            'pending': '⏳ Pending',
            'approved': '✅ Approved',
            'rejected': '❌ Rejected',
            'executed': '🚀 Executed',
            'failed': '💥 Failed'
        };
        return texts[status] || status;
    }
}
exports.ApprovalWorkflow = ApprovalWorkflow;
//# sourceMappingURL=approvalWorkflow.js.map