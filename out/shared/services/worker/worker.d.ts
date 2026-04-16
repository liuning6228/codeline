import { BlobStoreSettings } from "../../storage/ClineBlobStorage";
import { SyncQueue, SyncQueueItem } from "./queue";
export declare const SEVEN_DAYS_MS: number;
/**
 * Configuration options for SyncWorker.
 */
export interface SyncWorkerOptions extends BlobStoreSettings {
    userDistinctId: string;
}
/**
 * Get blob store settings from environment variables.
 * Used as a fallback when remote config is not available.
 */
export declare function getBlobStoreSettingsFromEnv(): BlobStoreSettings;
declare enum WorkerEvent {
    WorkerSyncStarted = "sync_started",
    WorkerSyncCompleted = "sync_completed",
    WorkerItemSynced = "item_synced",
    WorkerItemFailed = "item_failed",
    WorkerStarted = "worker_started",
    WorkerStopped = "worker_stopped"
}
/**
 * Event types emitted by SyncWorker.
 */
export type SyncWorkerEvent = {
    type: WorkerEvent.WorkerSyncStarted;
    itemCount: number;
} | {
    type: WorkerEvent.WorkerSyncCompleted;
    successCount: number;
    failCount: number;
} | {
    type: WorkerEvent.WorkerItemSynced;
    item: SyncQueueItem;
} | {
    type: WorkerEvent.WorkerItemFailed;
    item: SyncQueueItem;
    error: string;
} | {
    type: WorkerEvent.WorkerStarted;
} | {
    type: WorkerEvent.WorkerStopped;
};
export type SyncWorkerEventListener = (event: SyncWorkerEvent) => void;
export declare class SyncWorker {
    private queue;
    private interval;
    private isProcessing;
    private options;
    private listeners;
    constructor(queue: SyncQueue, options: SyncWorkerOptions);
    /**
     * Subscribe to worker events.
     * @returns Unsubscribe function
     */
    onEvent(listener: SyncWorkerEventListener): () => void;
    private emit;
    /**
     * Start the background worker.
     */
    start(): void;
    /**
     * Stop the background worker.
     * @param waitForCurrent If true, waits for current processing to complete
     */
    stop(waitForCurrent?: boolean): Promise<void>;
    /**
     * Check if the worker is:
     * - currently running
     * - currently processing items
     */
    getStatus(): {
        isRunning: boolean;
        isProcessing: boolean;
    };
    private processQueue;
}
/**
 * Initialize the global SyncWorker instance.
 * Should be called once during extension activation.
 *
 * @param queue The SyncQueue instance
 * @param options Worker configuration options (required, includes blob store settings)
 */
export declare function initSyncWorker(queue: SyncQueue, options: SyncWorkerOptions): SyncWorker;
/**
 * Stop and dispose the global SyncWorker instance.
 * Should be called during extension deactivation.
 */
export declare function disposeSyncWorker(): Promise<void>;
export {};
//# sourceMappingURL=worker.d.ts.map