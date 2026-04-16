export interface Task {
    id: string;
    title: string;
    [key: string]: any;
}
export declare const Task: {
    create: (data: any) => Task;
};
export interface NewTaskRequest {
    [key: string]: any;
}
export declare const NewTaskRequest: {
    create: (data: any) => NewTaskRequest;
};
export interface NewTaskResponse {
    taskId: string;
    [key: string]: any;
}
export declare const NewTaskResponse: {
    create: (data: any) => NewTaskResponse;
};
export interface TaskStatus {
    status: string;
    [key: string]: any;
}
export declare const TaskStatus: {
    create: (data: any) => TaskStatus;
};
export interface AskResponseRequest {
    [key: string]: any;
}
export declare const AskResponseRequest: {
    create: (data: any) => AskResponseRequest;
};
export interface AskResponseResponse {
    [key: string]: any;
}
export declare const AskResponseResponse: {
    create: (data: any) => AskResponseResponse;
};
export interface GetTaskHistoryRequest {
    [key: string]: any;
}
export declare const GetTaskHistoryRequest: {
    create: (data: any) => GetTaskHistoryRequest;
};
export interface TaskFavoriteRequest {
    [key: string]: any;
}
export declare const TaskFavoriteRequest: {
    create: (data: any) => TaskFavoriteRequest;
};
export interface TaskHistoryResponse {
    [key: string]: any;
}
export declare const TaskHistoryResponse: {
    create: (data: any) => TaskHistoryResponse;
};
//# sourceMappingURL=task.d.ts.map