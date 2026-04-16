export interface ClineRecommendedModel {
    id: string;
    name: string;
    description: string;
    tags: string[];
}
export interface ClineRecommendedModelsData {
    recommended: ClineRecommendedModel[];
    free: ClineRecommendedModel[];
}
/**
 * Hardcoded fallback shown when upstream recommended models are not enabled or unavailable.
 */
export declare const CLINE_RECOMMENDED_MODELS_FALLBACK: ClineRecommendedModelsData;
//# sourceMappingURL=recommended-models.d.ts.map