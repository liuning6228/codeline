"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskTimestamp = getTaskTimestamp;
/**
 * Parse task timestamp from taskId.
 * Task IDs are generated using Date.now().toString().
 */
function getTaskTimestamp(taskId) {
    const timestamp = parseInt(taskId, 10);
    return Number.isNaN(timestamp) ? undefined : timestamp;
}
//# sourceMappingURL=utils.js.map