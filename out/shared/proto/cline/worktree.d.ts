export interface Worktree {
    name: string;
    [key: string]: any;
}
export declare const Worktree: {
    create: (data: any) => Worktree;
};
export interface GetWorktreesRequest {
    [key: string]: any;
}
export declare const GetWorktreesRequest: {
    create: (data: any) => GetWorktreesRequest;
};
export interface GetWorktreesResponse {
    worktrees: Worktree[];
    [key: string]: any;
}
export declare const GetWorktreesResponse: {
    create: (data: any) => GetWorktreesResponse;
};
export interface CreateWorktreeRequest {
    [key: string]: any;
}
export declare const CreateWorktreeRequest: {
    create: (data: any) => CreateWorktreeRequest;
};
export interface SwitchWorktreeRequest {
    [key: string]: any;
}
export declare const SwitchWorktreeRequest: {
    create: (data: any) => SwitchWorktreeRequest;
};
export interface TrackWorktreeViewOpenedRequest {
    [key: string]: any;
}
export declare const TrackWorktreeViewOpenedRequest: {
    create: (data: any) => TrackWorktreeViewOpenedRequest;
};
export interface CreateWorktreeIncludeRequest {
    [key: string]: any;
}
export declare const CreateWorktreeIncludeRequest: {
    create: (data: any) => CreateWorktreeIncludeRequest;
};
export interface DeleteWorktreeRequest {
    [key: string]: any;
}
export declare const DeleteWorktreeRequest: {
    create: (data: any) => DeleteWorktreeRequest;
};
export interface MergeWorktreeRequest {
    [key: string]: any;
}
export declare const MergeWorktreeRequest: {
    create: (data: any) => MergeWorktreeRequest;
};
export interface MergeWorktreeResult {
    [key: string]: any;
}
export declare const MergeWorktreeResult: {
    create: (data: any) => MergeWorktreeResult;
};
//# sourceMappingURL=worktree.d.ts.map