import { Secrets, SettingsKey } from "@shared/storage/state-keys";
import { ApiProvider } from "../api";
export declare const ProviderToApiKeyMap: Partial<Record<ApiProvider, keyof Secrets | (keyof Secrets)[]>>;
/**
 * Get the provider-specific model ID key for a given provider and mode.
 * Different providers store their model IDs in different state keys.
 */
export declare function getProviderModelIdKey(provider: ApiProvider, mode: "act" | "plan"): SettingsKey;
export declare function getProviderDefaultModelId(provider: ApiProvider): string | null;
//# sourceMappingURL=provider-keys.d.ts.map