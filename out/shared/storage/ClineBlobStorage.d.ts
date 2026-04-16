import { ClineStorage } from "./ClineStorage";
export interface BlobStoreSettings {
    bucket: string;
    adapterType: "s3" | "r2" | string;
    accessKeyId: string;
    secretAccessKey: string;
    region?: string;
    endpoint?: string;
    accountId?: string;
    /** Interval between sync attempts in milliseconds (default: 30000 = 30s) */
    intervalMs?: number;
    /** Maximum number of retries before giving up on an item (default: 5) */
    maxRetries?: number;
    /** Batch size - how many items to process per interval (default: 10) */
    batchSize?: number;
    /** Maximum queue size before eviction (default: 1000) */
    maxQueueSize?: number;
    /** Maximum age for failed items in milliseconds (default: 7 days) */
    maxFailedAgeMs?: number;
    /** Whether to backfill existing unsynced items on startup (default: false) */
    backfillEnabled?: boolean;
}
/**
 * S3/R2 blob storage implementation of ClineStorage.
 * Uses AWS S3 or Cloudflare R2 as the backend storage.
 */
export declare class ClineBlobStorage extends ClineStorage {
    name: string;
    private static store;
    static get instance(): ClineBlobStorage;
    private adapter;
    private settings;
    private initialized;
    /**
     * Initialize the storage adapter with the given settings.
     * Can be called multiple times - will reinitialize if settings change.
     */
    init(settings?: BlobStoreSettings): void;
    /**
     * Check if the storage is properly initialized and ready to use.
     */
    isReady(): boolean;
    static isConfigured(settings: BlobStoreSettings): boolean;
    protected _get(key: string): Promise<string | undefined>;
    protected _store(key: string, value: string): Promise<void>;
    protected _delete(key: string): Promise<void>;
}
/**
 * Get the blob storage instance if S3/R2 storage is configured.
 * Returns null if not configured.
 */
export declare const blobStorage: ClineBlobStorage;
//# sourceMappingURL=ClineBlobStorage.d.ts.map