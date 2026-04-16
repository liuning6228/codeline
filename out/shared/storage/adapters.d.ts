import type { BlobStoreSettings } from "./ClineBlobStorage";
export interface StorageAdapter {
    read(path: string): Promise<string | undefined>;
    write(path: string, value: string): Promise<void>;
    remove(path: string): Promise<void>;
}
export declare function getStorageAdapter(settings: BlobStoreSettings): StorageAdapter | undefined;
//# sourceMappingURL=adapters.d.ts.map