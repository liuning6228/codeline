"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncWorker = exports.disposeSyncWorker = exports.SyncQueue = void 0;
exports.syncWorker = syncWorker;
/**
 * Sync module - provides queue-based syncing to S3/R2 storage.
 *
 * This module coordinates the SyncQueue and SyncWorker for robust
 * data synchronization that doesn't block the main extension flow.
 *
 * Uses JSON file storage for:
 * - Data persistence across restarts
 * - No native module dependencies (VS Code compatible)
 * - Atomic file writes for safety
 */
const path = __importStar(require("node:path"));
const host_provider_1 = require("@/hosts/host-provider");
const Logger_1 = require("@/shared/services/Logger");
const ClineBlobStorage_1 = require("../../storage/ClineBlobStorage");
const backfill_1 = require("./backfill");
const queue_1 = require("./queue");
const worker_1 = require("./worker");
// Re-export types and functions
var queue_2 = require("./queue");
Object.defineProperty(exports, "SyncQueue", { enumerable: true, get: function () { return queue_2.SyncQueue; } });
var worker_2 = require("./worker");
Object.defineProperty(exports, "disposeSyncWorker", { enumerable: true, get: function () { return worker_2.disposeSyncWorker; } });
Object.defineProperty(exports, "SyncWorker", { enumerable: true, get: function () { return worker_2.SyncWorker; } });
let syncQueueInstance = null;
/**
 * Get the sync queue file path.
 */
function getSyncQueuePath() {
    return path.join(host_provider_1.HostProvider.get().globalStorageFsPath, "cache", "sync-queue.json");
}
/**
 * Get the global SyncQueue instance.
 * Returns null if S3 storage is not configured.
 */
function getSyncQueue() {
    if (!ClineBlobStorage_1.blobStorage.isReady()) {
        return null;
    }
    if (!syncQueueInstance) {
        syncQueueInstance = queue_1.SyncQueue.getInstance(getSyncQueuePath());
    }
    return syncQueueInstance;
}
/**
 * Initialize the sync system (queue + worker).
 * Should be called during extension activation if S3 storage is configured.
 *
 * @param options Worker configuration options (includes blob store settings)
 * @returns The SyncWorker instance, or null if S3 is not configured
 */
function init(options) {
    if (!options?.userDistinctId) {
        return null;
    }
    // Initialize blob storage with the provided settings
    ClineBlobStorage_1.blobStorage.init(options);
    if (!ClineBlobStorage_1.blobStorage.isReady()) {
        return null;
    }
    const queue = getSyncQueue();
    if (!queue) {
        return null;
    }
    const worker = (0, worker_1.initSyncWorker)(queue, options);
    worker.start();
    if (options.backfillEnabled) {
        (0, backfill_1.backfillTasks)().catch((err) => Logger_1.Logger.error("Backfill tasks failed:", err));
    }
    return worker;
}
/**
 * Dispose the sync system.
 * Should be called during extension deactivation.
 */
async function dispose() {
    await (0, worker_1.disposeSyncWorker)();
    if (syncQueueInstance) {
        syncQueueInstance.close();
        syncQueueInstance = null;
    }
    queue_1.SyncQueue.reset();
}
/**
 * Convenience function to enqueue data for sync.
 * This is a fire-and-forget operation - errors are logged but not thrown.
 *
 * @param taskId Task identifier
 * @param key File key (e.g., "api_conversation_history.json")
 * @param data Data to sync
 */
function enqueue(taskId, key, data) {
    try {
        const queue = getSyncQueue();
        if (!queue || !data || !key) {
            return;
        }
        queue.enqueue(taskId, key, data);
    }
    catch (err) {
        Logger_1.Logger.error(`Failed to enqueue ${taskId}/${key} for sync:`, err);
    }
}
function syncWorker() {
    return {
        init,
        dispose,
        getSyncQueue,
        enqueue,
    };
}
//# sourceMappingURL=sync.js.map