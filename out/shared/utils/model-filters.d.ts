import type { ApiProvider } from "@shared/api";
export declare function isClineFreeModelException(modelId: string): boolean;
/**
 * Filters OpenRouter model IDs based on provider-specific rules.
 * For Cline provider: excludes :free models (except known exception models)
 * For OpenRouter/Vercel: excludes cline/ prefixed models
 * @param modelIds Array of model IDs to filter
 * @param provider The current API provider
 * @param allowedFreeModelIds Optional list of Cline free model IDs to keep visible
 * @returns Filtered array of model IDs
 */
export declare function filterOpenRouterModelIds(modelIds: string[], provider: ApiProvider, allowedFreeModelIds?: string[]): string[];
//# sourceMappingURL=model-filters.d.ts.map