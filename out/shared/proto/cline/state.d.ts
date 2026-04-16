export interface State {
    mode: string;
    showWelcome: boolean;
    shouldShowAnnouncement: boolean;
    showSettings: boolean;
    showHistory: boolean;
    showAccount: boolean;
    showWorktrees: boolean;
    showMcp: boolean;
    mcpTab: string;
    settingsTargetSection: string;
    didHydrateState: boolean;
    showAnnouncement: boolean;
    dismissedBanners: string[];
    hasShownKanbanModal: boolean;
    showKanbanModal: boolean;
    activeOrganization: any | null;
    clineUser: any | null;
    organizations: any[];
    version: string;
    distinctId: string;
    [key: string]: any;
}
export declare const State: {
    create: (data: any) => State;
};
export interface McpDisplayMode {
    [key: string]: any;
}
export declare const McpDisplayMode: {
    create: (data: any) => McpDisplayMode;
};
export interface UpdateSettingsRequest {
    [key: string]: any;
}
export declare const UpdateSettingsRequest: {
    create: (data: any) => UpdateSettingsRequest;
};
export interface PlanActMode {
    [key: string]: any;
}
export declare const PlanActMode: {
    create: (data: any) => PlanActMode;
};
export interface TogglePlanActModeRequest {
    [key: string]: any;
}
export declare const TogglePlanActModeRequest: {
    create: (data: any) => TogglePlanActModeRequest;
};
export interface ResetStateRequest {
    [key: string]: any;
}
export declare const ResetStateRequest: {
    create: (data: any) => ResetStateRequest;
};
//# sourceMappingURL=state.d.ts.map