import { ClineSyncStorage } from "./ClineStorage";
export interface ClineFileStorageOptions {
    /**
     * File permissions mode (e.g., 0o600 for owner read/write only).
     * If not set, uses the system default.
     */
    fileMode?: number;
}
/**
 * Synchronous file-backed JSON storage.
 * Stores any JSON-serializable values with sync read and write.
 * Used for VSCode Memento compatibility and CLI environments.
 */
export declare class ClineFileStorage<T = any> extends ClineSyncStorage<T> {
    protected name: string;
    private data;
    private readonly fsPath;
    private readonly fileMode?;
    constructor(filePath: string, name?: string, options?: ClineFileStorageOptions);
    protected _get(key: string): T | undefined;
    protected _set(key: string, value: T | undefined): void;
    protected _delete(key: string): void;
    /**
     * Set multiple keys in a single write operation.
     * More efficient than calling set() for each key individually,
     * since it only writes to disk once.
     */
    setBatch(entries: Record<string, T | undefined>): Thenable<void>;
    protected _keys(): readonly string[];
    private readFromDisk;
    private writeToDisk;
}
//# sourceMappingURL=ClineFileStorage.d.ts.map