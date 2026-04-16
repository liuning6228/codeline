export interface WebviewMessage {
    type: "grpc_request" | "grpc_request_cancel";
    grpc_request?: GrpcRequest;
    grpc_request_cancel?: GrpcCancel;
}
export type GrpcRequest = {
    service: string;
    method: string;
    message: any;
    request_id: string;
    is_streaming: boolean;
};
export type GrpcCancel = {
    request_id: string;
};
export type ClineAskResponse = "yesButtonClicked" | "noButtonClicked" | "messageResponse";
export type ClineCheckpointRestore = "task" | "workspace" | "taskAndWorkspace";
export type TaskFeedbackType = "thumbs_up" | "thumbs_down";
//# sourceMappingURL=WebviewMessage.d.ts.map