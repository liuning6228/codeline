export interface AutoApprovalSettings {
    version: number;
    enabled: boolean;
    favorites: string[];
    maxRequests: number;
    actions: {
        readFiles: boolean;
        readFilesExternally?: boolean;
        editFiles: boolean;
        editFilesExternally?: boolean;
        executeSafeCommands?: boolean;
        executeAllCommands?: boolean;
        useBrowser: boolean;
        useMcp: boolean;
    };
    enableNotifications: boolean;
}
export declare const DEFAULT_AUTO_APPROVAL_SETTINGS: AutoApprovalSettings;
//# sourceMappingURL=AutoApprovalSettings.d.ts.map