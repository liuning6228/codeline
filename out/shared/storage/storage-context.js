"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorageContext = createStorageContext;
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const ClineFileStorage_1 = require("./ClineFileStorage");
const SETTINGS_SUBFOLDER = "data";
/**
 * Create a short deterministic hash of a string for use in directory names.
 * Produces an up-to-8-character hex string.
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
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
function createStorageContext(opts = {}) {
    const clineDir = opts.clineDir || process.env.CLINE_DIR || node_path_1.default.join(node_os_1.default.homedir(), ".cline");
    const dataDir = node_path_1.default.join(clineDir, SETTINGS_SUBFOLDER);
    // Resolve workspace storage directory
    let workspaceDir;
    if (opts.workspaceStorageDir) {
        // Explicit override (JetBrains via env var, or test overrides)
        workspaceDir = opts.workspaceStorageDir;
    }
    else {
        // Hash-based workspace isolation (CLI, VSCode)
        const workspacePath = opts.workspacePath || process.cwd();
        const workspaceHash = hashString(workspacePath);
        workspaceDir = node_path_1.default.join(dataDir, "workspaces", workspaceHash);
    }
    // Ensure directories exist
    node_fs_1.default.mkdirSync(dataDir, { recursive: true });
    node_fs_1.default.mkdirSync(workspaceDir, { recursive: true });
    const globalState = new ClineFileStorage_1.ClineFileStorage(node_path_1.default.join(dataDir, "globalState.json"), "GlobalState");
    return {
        globalState,
        globalStateBackingStore: globalState,
        secrets: new ClineFileStorage_1.ClineFileStorage(node_path_1.default.join(dataDir, "secrets.json"), "Secrets", {
            fileMode: 0o600, // Owner read/write only — protects API keys
        }),
        workspaceState: new ClineFileStorage_1.ClineFileStorage(node_path_1.default.join(workspaceDir, "workspaceState.json"), "WorkspaceState"),
        dataDir,
        workspaceStoragePath: workspaceDir,
    };
}
//# sourceMappingURL=storage-context.js.map