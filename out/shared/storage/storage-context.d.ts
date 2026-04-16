import { ClineFileStorage } from "./ClineFileStorage";
import { ClineMemento } from "./ClineStorage";
/**
 * The storage backend context object used by StateManager and other components.
 * Global, workspace and secret key-value storage goes through this component.
 *
 * This replaces the previous pattern of passing VSCode's ExtensionContext around
 * for storage access. All platforms (VSCode, CLI, JetBrains) use the same
 * file-backed implementation.
 */
export interface StorageContext {
    /** Global state — settings, task history references, UI state, etc. */
    readonly globalState: ClineMemento;
    /**
     * The backing store for global state. Prefer `globalState` when possible.
     *
     * This split exists because CLI needs to intercept the ClineMemento interface to global state,
     * but state resets need to write through to the backing store.
     */
    readonly globalStateBackingStore: ClineFileStorage;
    /** Secrets — API keys and other sensitive values. File uses restricted permissions (0o600). */
    readonly secrets: ClineFileStorage<string>;
    /** Workspace-scoped state — per-project toggles, rules, etc. */
    readonly workspaceState: ClineFileStorage;
    /** The resolved path to the data directory (~/.cline/data) */
    readonly dataDir: string;
    /** The resolved path to the workspace storage directory (contains workspaceState.json) */
    readonly workspaceStoragePath: string;
}
export interface StorageContextOptions {
    /**
     * Override the Cline home directory. Defaults to CLINE_DIR env var or ~/.cline.
     */
    clineDir?: string;
    /**
     * The workspace/project directory path. Used to compute a hash-based
     * workspace storage subdirectory. Defaults to process.cwd().
     */
    workspacePath?: string;
    /**
     * Explicit workspace storage directory override.
     * When set, this path is used directly instead of computing a hash.
     * Used by JetBrains (via WORKSPACE_STORAGE_DIR env var).
     *
     * TODO: Unify JetBrains workspace path scheme with the hash-based approach
     * once the JetBrains client side is cleaned up.
     */
    workspaceStorageDir?: string;
}
/**
 * Creates a StorageContext backed by JSON files on disk.
 *
 * All path computation is contained here — callers should not
 * construct paths to these storage files themselves.
 *
 * File layout:
 *   ~/.cline/data/globalState.json    — global state
 *   ~/.cline/data/secrets.json        — secrets (mode 0o600)
 *   ~/.cline/data/workspaces/<hash>/workspaceState.json — per-workspace state
 *
 * @param opts Configuration options for path resolution
 * @returns A StorageContext ready for use by StateManager
 */
export declare function createStorageContext(opts?: StorageContextOptions): StorageContext;
//# sourceMappingURL=storage-context.d.ts.map