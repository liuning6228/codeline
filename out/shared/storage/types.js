"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_REASONING_EFFORT_OPTIONS = void 0;
exports.isOpenaiReasoningEffort = isOpenaiReasoningEffort;
exports.normalizeOpenaiReasoningEffort = normalizeOpenaiReasoningEffort;
exports.OPENAI_REASONING_EFFORT_OPTIONS = ["none", "low", "medium", "high", "xhigh"];
function isOpenaiReasoningEffort(value) {
    return typeof value === "string" && exports.OPENAI_REASONING_EFFORT_OPTIONS.includes(value);
}
function normalizeOpenaiReasoningEffort(effort) {
    const value = (effort || "medium").toLowerCase();
    return isOpenaiReasoningEffort(value) ? value : "medium";
}
//# sourceMappingURL=types.js.map