export interface BrowserSettings {
    viewport: {
        width: number;
        height: number;
    };
    remoteBrowserHost?: string;
    remoteBrowserEnabled?: boolean;
    chromeExecutablePath?: string;
    disableToolUse?: boolean;
    customArgs?: string;
}
export declare const DEFAULT_BROWSER_SETTINGS: BrowserSettings;
export declare const BROWSER_VIEWPORT_PRESETS: {
    readonly "Large Desktop (1280x800)": {
        readonly width: 1280;
        readonly height: 800;
    };
    readonly "Small Desktop (900x600)": {
        readonly width: 900;
        readonly height: 600;
    };
    readonly "Tablet (768x1024)": {
        readonly width: 768;
        readonly height: 1024;
    };
    readonly "Mobile (360x640)": {
        readonly width: 360;
        readonly height: 640;
    };
};
//# sourceMappingURL=BrowserSettings.d.ts.map