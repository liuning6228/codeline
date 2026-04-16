export declare const OPENAI_REASONING_EFFORT_OPTIONS: readonly ["none", "low", "medium", "high", "xhigh"];
export type OpenaiReasoningEffort = (typeof OPENAI_REASONING_EFFORT_OPTIONS)[number];
export declare function isOpenaiReasoningEffort(value: unknown): value is OpenaiReasoningEffort;
export declare function normalizeOpenaiReasoningEffort(effort?: string): OpenaiReasoningEffort;
export type Mode = "plan" | "act";
//# sourceMappingURL=types.d.ts.map