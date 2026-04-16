"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClineFileStorage = void 0;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const Logger_1 = require("../services/Logger");
const ClineStorage_1 = require("./ClineStorage");
/**
 * Synchronous file-backed JSON storage.
 * Stores any JSON-serializable values with sync read and write.
 * Used for VSCode Memento compatibility and CLI environments.
 */
class ClineFileStorage extends ClineStorage_1.ClineSyncStorage {
    name;
    data;
    fsPath;
    fileMode;
    constructor(filePath, name = "ClineFileStorage", options) {
        super();
        this.fsPath = filePath;
        this.name = name;
        this.fileMode = options?.fileMode;
        this.data = this.readFromDisk();
    }
    _get(key) {
        return this.data[key];
    }
    _set(key, value) {
        // Use setBatch for consistency - all writes go through one path
        this.setBatch({ [key]: value });
    }
    _delete(key) {
        this.setBatch({ [key]: undefined });
    }
    /**
     * Set multiple keys in a single write operation.
     * More efficient than calling set() for each key individually,
     * since it only writes to disk once.
     */
    setBatch(entries) {
        const changedKeys = [];
        for (const [key, value] of Object.entries(entries)) {
            if (value === undefined) {
                if (key in this.data) {
                    delete this.data[key];
                    changedKeys.push(key);
                }
            }
            else {
                this.data[key] = value;
                changedKeys.push(key);
            }
        }
        if (changedKeys.length > 0) {
            this.writeToDisk();
            for (const key of changedKeys) {
                this.fireChange(key);
            }
        }
        return Promise.resolve();
    }
    _keys() {
        return Object.keys(this.data);
    }
    readFromDisk() {
        try {
            if (fs.existsSync(this.fsPath)) {
                return JSON.parse(fs.readFileSync(this.fsPath, "utf-8"));
            }
        }
        catch (error) {
            Logger_1.Logger.error(`[${this.name}] failed to read from ${this.fsPath}:`, error);
        }
        return {};
    }
    writeToDisk() {
        try {
            const dir = path.dirname(this.fsPath);
            fs.mkdirSync(dir, { recursive: true });
            atomicWriteFileSync(this.fsPath, JSON.stringify(this.data, null, 2), this.fileMode);
        }
        catch (error) {
            Logger_1.Logger.error(`[${this.name}] failed to write to ${this.fsPath}:`, error);
        }
    }
}
exports.ClineFileStorage = ClineFileStorage;
/**
 * Synchronously, atomically write data to a file using temp file + rename pattern.
 * Prefer core/storage's async atomicWriteFile to this.
 */
function atomicWriteFileSync(filePath, data, mode) {
    const tmpPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).substring(7)}.json`;
    try {
        fs.writeFileSync(tmpPath, data, {
            flag: "wx",
            encoding: "utf-8",
            mode,
        });
        // Rename temp file to target (atomic in most cases)
        fs.renameSync(tmpPath, filePath);
    }
    catch (error) {
        // Clean up temp file if it exists
        try {
            fs.unlinkSync(tmpPath);
        }
        catch { }
        throw error;
    }
}
//# sourceMappingURL=ClineFileStorage.js.map