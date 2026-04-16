import { ClineMessage } from "./ExtensionMessage";
/**
 * Combines sequences of hook and hook_output messages, and reorders
 * PreToolUse hooks to appear before their associated tool messages.
 *
 * Process:
 * 1. Deduplicate tool/command messages by timestamp (preserve newest variant)
 * 2. Combine hooks with their hook_output messages
 * 3. Build mapping of tools to their PreToolUse hooks
 * 4. Reorder so PreToolUse hooks appear before their tools
 *
 * @param messages Array of ClineMessage objects to process
 * @returns New array with hooks combined and PreToolUse hooks reordered
 */
export declare function combineHookSequences(messages: ClineMessage[]): ClineMessage[];
export declare const HOOK_OUTPUT_STRING = "__HOOK_OUTPUT__";
//# sourceMappingURL=combineHookSequences.d.ts.map