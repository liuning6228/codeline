/**
 * Workspace root types and interfaces for multi-workspace support
 */
export declare enum VcsType {
    None = "none",
    Git = "git",
    Mercurial = "mercurial"
}
export interface WorkspaceRoot {
    path: string;
    name?: string;
    vcs: VcsType;
    commitHash?: string;
}
//# sourceMappingURL=types.d.ts.map