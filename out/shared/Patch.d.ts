/**
 * Apply Patch constants
 */
export declare const PATCH_MARKERS: {
    readonly BEGIN: "*** Begin Patch";
    readonly END: "*** End Patch";
    readonly ADD: "*** Add File: ";
    readonly UPDATE: "*** Update File: ";
    readonly DELETE: "*** Delete File: ";
    readonly MOVE: "*** Move to: ";
    readonly SECTION: "@@";
    readonly END_FILE: "*** End of File";
};
/**
 * Expected bash wrappers for apply patch content
 */
export declare const BASH_WRAPPERS: readonly ["%%bash", "apply_patch", "EOF", "```"];
/**
 * Domains of patch actions
 */
export declare enum PatchActionType {
    ADD = "add",
    DELETE = "delete",// TODO: Implement delete action in diff editor.
    UPDATE = "update"
}
export interface PatchChunk {
    origIndex: number;
    delLines: string[];
    insLines: string[];
}
export interface PatchAction {
    type: PatchActionType;
    newFile?: string;
    chunks: PatchChunk[];
    movePath?: string;
}
/**
 * Warning information for skipped/problematic chunks
 */
export interface PatchWarning {
    path: string;
    chunkIndex?: number;
    message: string;
    context?: string;
}
/**
 * Apply Patch structure
 */
export interface Patch {
    actions: Record<string, PatchAction>;
    warnings?: PatchWarning[];
}
export declare class DiffError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=Patch.d.ts.map