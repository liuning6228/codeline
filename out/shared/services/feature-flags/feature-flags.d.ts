export declare enum FeatureFlag {
    WEBTOOLS = "webtools",
    WORKTREES = "worktree-exp",
    ONBOARDING_MODELS = "onboarding_models",
    REMOTE_BANNERS = "remote-banners",
    EXTENSION_REMOTE_BANNERS_TTL = "extension_remote_banners_ttl",
    REMOTE_WELCOME_BANNERS = "remote-welcome-banners",
    CLINE_RECOMMENDED_MODELS_UPSTREAM = "cline-recommended-models-upstream",
    EXTENSION_CLINE_MODELS_ENDPOINT = "extension_cline_models_endpoint",
    OPENAI_RESPONSES_WEBSOCKET_MODE = "openai-responses-websocket-mode",
    ENHANCED_CHAT_UI = "enhanced-chat-ui"
}
export declare const FeatureFlagDefaultValue: Partial<Record<FeatureFlag, any>>;
export declare const FEATURE_FLAGS: FeatureFlag[];
//# sourceMappingURL=feature-flags.d.ts.map