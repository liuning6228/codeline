/**
 * Backfill utility for syncing existing task data to S3/R2 storage.
 *
 * This module provides functions to backfill historic task data that was
 * created before S3 storage was configured, or to re-sync data after
 * configuration changes.
 */
/**
 * Result of a backfill operation for a single task.
 */
export interface BackfillTaskResult {
    taskId: string;
    success: boolean;
    filesQueued: string[];
    error?: string;
}
/**
 * Result of a full backfill operation.
 */
export interface BackfillResult {
    totalTasks: number;
    successCount: number;
    failCount: number;
    skippedCount: number;
    results: BackfillTaskResult[];
}
/**
 * Options for backfill operations.
 */
export interface BackfillOptions {
    /** Only backfill tasks newer than this timestamp */
    sinceTimestamp?: number;
    /** Only backfill these specific task IDs */
    taskIds?: string[];
    /** Callback for progress updates */
    onProgress?: (current: number, total: number, taskId: string) => void;
}
/**
 * Backfill a single task's data to S3/R2.
 *
 * @param taskId Task identifier
 */
export declare function backfillTask(taskId: string): Promise<BackfillTaskResult>;
/**
 * Backfill all existing tasks to S3/R2 storage.
 *
 * @param options Backfill options
 */
export declare function backfillTasks(options?: BackfillOptions): Promise<BackfillResult | undefined>;
//# sourceMappingURL=backfill.d.ts.map