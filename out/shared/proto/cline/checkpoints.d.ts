export interface Checkpoint {
    id: string;
    [key: string]: any;
}
export declare const Checkpoint: {
    create: (data: any) => Checkpoint;
};
export interface ListCheckpointsRequest {
    [key: string]: any;
}
export declare const ListCheckpointsRequest: {
    create: (data: any) => ListCheckpointsRequest;
};
export interface ListCheckpointsResponse {
    checkpoints: Checkpoint[];
    [key: string]: any;
}
export declare const ListCheckpointsResponse: {
    create: (data: any) => ListCheckpointsResponse;
};
export interface CheckpointRestoreRequest {
    [key: string]: any;
}
export declare const CheckpointRestoreRequest: {
    create: (data: any) => CheckpointRestoreRequest;
};
//# sourceMappingURL=checkpoints.d.ts.map