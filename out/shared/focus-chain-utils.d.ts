/**
 * Shared utility functions for focus chain pattern matching
 * Used by both extension and webview
 *  */
/**
 * Checks if a trimmed line matches focus chain item patterns
 * @param line The trimmed line to check
 * @returns true if the line is a focus chain item (- [ ], - [x], or - [X])
 */
export declare function isFocusChainItem(line: string): boolean;
/**
 * Checks if a trimmed line is a completed focus chain item
 * @param line The trimmed line to check
 * @returns true if the line is a completed focus chain item (- [x] or - [X])
 */
export declare function isCompletedFocusChainItem(line: string): boolean;
/**
 * Flexible regex pattern for matching focus chain items with spacing variations
 * Matches patterns like "- [x] text", "- [X] text", "- [ ] text", "-  [ ]  text", etc.
 */
export declare const FOCUS_CHAIN_ITEM_REGEX: RegExp;
/**
 * Parse focus chain item using flexible regex (allows spacing variations)
 * @param line The trimmed line to parse
 * @returns Object with checked status and text, or null if not a focus chain item
 */
export declare function parseFocusChainItem(line: string): {
    checked: boolean;
    text: string;
} | null;
//# sourceMappingURL=focus-chain-utils.d.ts.map