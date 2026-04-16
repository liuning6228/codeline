/**
 * Sync queue item status.
 */
export type SyncQueueStatus = "pending" | "synced" | "failed";
/**
 * Represents an item in the sync queue.
 */
export interface SyncQueueItem {
    /** Unique ID (taskId/key) */
    id: string;
    /** Task ID this item belongs to */
    taskId: string;
    /** File key within the task (e.g., "api_conversation_history.json") */
    key: string;
    /** The data to sync */
    data: string;
    /** Timestamp when the item was enqueued */
    timestamp: number;
    /** Current sync status */
    status: SyncQueueStatus;
    /** Number of retry attempts */
    retryCount: number;
    /** Last error message if failed */
    lastError: string | null;
}
/**
 * A JSON file-backed queue for syncing task data to remote storage.
 *
 * Uses atomic file writes for:
 * - Data persistence across restarts
 * - No native module dependencies (VS Code compatible)
 *
 * Benefits:
 * - Guaranteed delivery even if remote storage is temporarily down
 * - Supports backfill of historic tasks
 * - No blocking on remote storage operations
 */
export declare class SyncQueue {
    private queuePath;
    private data;
    private static instance;
    private writeTimeout;
    private isDirty;
    /**
     * Get the singleton instance.
     * @param queuePath Path to the JSON queue file
     */
    static getInstance(queuePath: string): SyncQueue;
    /**
     * Reset the singleton (for testing).
     */
    static reset(): void;
    private constructor();
    /**
     * Load queue data from disk.
     */
    private load;
    /**
     * Schedule a debounced write to disk.
     */
    private scheduleWrite;
    /**
     * Immediately write queue data to disk.
     */
    private flush;
    /**
     * Close the queue and flush pending writes.
     */
    close(): void;
    /**
     * Queue data for sync. If an item with the same taskId/key exists,
     * it will be replaced (upsert behavior).
     *
     * @param taskId Task identifier
     * @param key File key (e.g., "api_conversation_history.json")
     * @param data Data to sync
     */
    enqueue(taskId: string, key: string, data: string): void;
    /**
     * Get all pending items that need to be synced.
     */
    getPending(): SyncQueueItem[];
    /**
     * Get all items regardless of status.
     */
    getAll(): SyncQueueItem[];
    /**
     * Get failed items that may need manual intervention or retry.
     */
    getFailed(): SyncQueueItem[];
    /**
     * Get a specific item by taskId and key.
     */
    getItem(taskId: string, key: string): SyncQueueItem | undefined;
    /**
     * Mark an item as successfully synced.
     *
     * @param taskId Task identifier
     * @param key File key
     * @param remove Whether to remove the item after marking synced (default: false)
     */
    markSynced(taskId: string, key: string, remove?: boolean): void;
    /**
     * Mark an item as failed with an error message.
     * Increments retry count for tracking.
     *
     * @param taskId Task identifier
     * @param key File key
     * @param error Error message
     */
    markFailed(taskId: string, key: string, error: string): void;
    /**
     * Reset a failed item back to pending for retry.
     *
     * @param taskId Task identifier
     * @param key File key
     */
    resetToPending(taskId: string, key: string): void;
    /**
     * Remove an item from the queue entirely.
     *
     * @param taskId Task identifier
     * @param key File key
     */
    remove(taskId: string, key: string): void;
    /**
     * Remove all items for a task.
     * Use this when a task is deleted.
     *
     * @param taskId Task identifier
     */
    removeTask(taskId: string): void;
    /**
     * Get statistics about the queue.
     */
    getStats(): {
        pending: number;
        synced: number;
        failed: number;
        total: number;
    };
    /**
     * Clean up synced items older than the specified age.
     *
     * @param maxAgeMs Maximum age in milliseconds (default: 7 days)
     * @returns Number of items cleaned up
     */
    cleanupOldSynced(maxAgeMs?: number): number;
    /**
     * Clean up failed items that have exceeded max retries.
     * This prevents the queue from growing forever when blob storage is misconfigured.
     *
     * @param maxRetries Maximum retry count before eviction (default: 5)
     * @param maxAgeMs Maximum age for failed items in milliseconds (default: 7 days)
     * @returns Number of items cleaned up
     */
    cleanupFailedItems(maxRetries?: number, maxAgeMs?: number): number;
    /**
     * Enforce a maximum queue size by removing oldest items.
     * Prioritizes removing: synced > failed (exceeded retries) > failed > pending
     *
     * @param maxSize Maximum number of items to keep (default: 1000)
     * @returns Number of items evicted
     */
    enforceMaxSize(maxSize?: number): number;
    /**
     * Bulk enqueue multiple items.
     * More efficient than calling enqueue() multiple times.
     *
     * @param items Array of items to enqueue
     */
    enqueueBulk(items: Array<{
        taskId: string;
        key: string;
        data: string;
    }>): void;
    /**
     * Get pending items with a limit (for batch processing).
     *
     * @param limit Maximum number of items to return
     */
    getPendingBatch(limit: number): SyncQueueItem[];
}
//# sourceMappingURL=queue.d.ts.map