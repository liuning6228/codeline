import { Mode } from "../storage/types";
export interface ClineMessageModelInfo {
    modelId: string;
    providerId: string;
    mode: Mode;
}
interface ClineTokensInfo {
    prompt: number;
    completion: number;
    cached: number;
}
export interface ClineMessageMetricsInfo {
    tokens?: ClineTokensInfo;
    cost?: number;
}
export {};
//# sourceMappingURL=metrics.d.ts.map