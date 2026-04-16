import { SyncQueue } from "./queue";
import type { SyncWorkerOptions } from "./worker";
import { SyncWorker } from "./worker";
export type { SyncQueueItem, SyncQueueStatus } from "./queue";
export { SyncQueue } from "./queue";
export type { SyncWorkerEvent, SyncWorkerOptions } from "./worker";
export { disposeSyncWorker, SyncWorker } from "./worker";
/**
 * Get the global SyncQueue instance.
 * Returns null if S3 storage is not configured.
 */
declare function getSyncQueue(): SyncQueue | null;
/**
 * Initialize the sync system (queue + worker).
 * Should be called during extension activation if S3 storage is configured.
 *
 * @param options Worker configuration options (includes blob store settings)
 * @returns The SyncWorker instance, or null if S3 is not configured
 */
declare function init(options?: SyncWorkerOptions): SyncWorker | null;
/**
 * Dispose the sync system.
 * Should be called during extension deactivation.
 */
declare function dispose(): Promise<void>;
/**
 * Convenience function to enqueue data for sync.
 * This is a fire-and-forget operation - errors are logged but not thrown.
 *
 * @param taskId Task identifier
 * @param key File key (e.g., "api_conversation_history.json")
 * @param data Data to sync
 */
declare function enqueue(taskId: string, key: string, data: string): void;
export declare function syncWorker(): {
    init: typeof init;
    dispose: typeof dispose;
    getSyncQueue: typeof getSyncQueue;
    enqueue: typeof enqueue;
};
//# sourceMappingURL=sync.d.ts.map