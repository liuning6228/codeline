export interface ClineStorageChangeEvent {
    readonly key: string;
}
export type StorageEventListener = (event: ClineStorageChangeEvent) => Promise<void>;
/**
 * Memento-compatible interface for sync key-value storage.
 * VSCode's Memento and ClineSyncStorage both satisfy this interface.
 */
export interface ClineMemento {
    get<T>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    update(key: string, value: any): Thenable<void>;
    keys(): readonly string[];
    /**
     * Set multiple keys in a single operation.
     * More efficient than calling update() for each key individually.
     */
    setBatch(entries: Record<string, any>): Thenable<void>;
}
/**
 * An abstract storage class that provides a template for storage operations.
 * Subclasses must implement the protected abstract methods to define their storage logic.
 * The public methods (get, store, delete) are final and cannot be overridden.
 */
export declare abstract class ClineStorage {
    /**
     * The name of the storage, used for logging purposes.
     */
    protected name: string;
    /**
     * List of subscribers to storage change events.
     */
    private readonly subscribers;
    /**
     * Subscribe to storage change events.
     */
    onDidChange(callback: StorageEventListener): () => void;
    /**
     * Get a value from storage. This method is final and cannot be overridden.
     * Subclasses should implement _get() to define their storage retrieval logic.
     */
    get(key: string): Promise<string | undefined>;
    _dangerousStore(key: string, value: string): Promise<void>;
    /**
     * Store a value in storage. This method is final and cannot be overridden.
     * Subclasses should implement _store() to define their storage logic.
     * This method automatically fires change events after storing.
     */
    store(key: string, value: string): Promise<void>;
    /**
     * Delete a value from storage. This method is final and cannot be overridden.
     * Subclasses should implement _delete() to define their deletion logic.
     * This method automatically fires change events after deletion.
     */
    delete(key: string): Promise<void>;
    /**
     * Abstract method that subclasses must implement to retrieve values from their storage.
     */
    protected abstract _get(key: string): Promise<string | undefined>;
    /**
     * Abstract method that subclasses must implement to store values in their storage.
     */
    protected abstract _store(key: string, value: string): Promise<void>;
    /**
     * Abstract method that subclasses must implement to delete values from their storage.
     */
    protected abstract _delete(key: string): Promise<void>;
}
/**
 * Abstract base class for synchronous JSON storage.
 * Unlike ClineStorage (string key-value, async), this stores any JSON-serializable
 * values and provides synchronous access - required for VSCode Memento compatibility.
 */
export type SyncStorageEventListener = (event: ClineStorageChangeEvent) => void;
export declare abstract class ClineSyncStorage<T = any> {
    protected abstract name: string;
    /**
     * List of subscribers to storage change events.
     */
    private readonly changeSubscribers;
    /**
     * Subscribe to storage change events. Returns an unsubscribe function.
     */
    onDidChange(callback: SyncStorageEventListener): () => void;
    /**
     * Notify all subscribers of a key change.
     */
    protected fireChange(key: string): void;
    get<V = T>(key: string): V | undefined;
    get<V = T>(key: string, defaultValue: V): V;
    /**
     * Memento-compatible update method. Calls set() internally.
     */
    update(key: string, value: any): Thenable<void>;
    set(key: string, value: T | undefined): void;
    delete(key: string): void;
    keys(): readonly string[];
    protected abstract _get(key: string): T | undefined;
    protected abstract _set(key: string, value: T | undefined): void;
    protected abstract _delete(key: string): void;
    protected abstract _keys(): readonly string[];
}
/**
 * A simple in-memory implementation of ClineStorage using a Map.
 */
export declare class ClineInMemoryStorage extends ClineStorage {
    /**
     * A simple in-memory cache to store key-value pairs.
     */
    private readonly _cache;
    protected _get(key: string): Promise<string | undefined>;
    protected _store(key: string, value: string): Promise<void>;
    protected _delete(key: string): Promise<void>;
}
//# sourceMappingURL=ClineStorage.d.ts.map