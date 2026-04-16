import { ClineMessage } from "./ExtensionMessage";
/**
 * Consolidates error_retry messages in a retry sequence, keeping only the latest one,
 * and removes successful retry messages entirely.
 *
 * When an API request fails and auto-retry is enabled, multiple error_retry messages are created
 * (e.g., "Attempt 1 of 3", "Attempt 2 of 3", "Attempt 3 of 3"), interleaved with api_req_retried
 * messages. This function:
 * 1. Filters out earlier retry messages, showing only the most recent one
 * 2. Removes error_retry messages entirely when followed by a successful api_req_started
 *    (indicating the retry succeeded)
 *
 * @param messages - An array of ClineMessage objects to process.
 * @returns A new array of ClineMessage objects with error_retry sequences consolidated.
 *
 * @example
 * // During retry sequence - shows only latest attempt:
 * const messages: ClineMessage[] = [
 *   { type: 'say', say: 'error_retry', text: '{"attempt":1,"maxAttempts":3}', ts: 1000 },
 *   { type: 'say', say: 'api_req_retried', ts: 1001 },
 *   { type: 'say', say: 'error_retry', text: '{"attempt":2,"maxAttempts":3}', ts: 1002 },
 *   { type: 'say', say: 'api_req_retried', ts: 1003 },
 *   { type: 'say', say: 'error_retry', text: '{"attempt":3,"maxAttempts":3}', ts: 1004 },
 * ];
 * const result = combineErrorRetryMessages(messages);
 * // Result: [{ type: 'say', say: 'error_retry', text: '{"attempt":3,"maxAttempts":3}', ts: 1004 }]
 *
 * @example
 * // After successful retry - removes error_retry entirely:
 * const messages: ClineMessage[] = [
 *   { type: 'say', say: 'error_retry', text: '{"attempt":1,"maxAttempts":3}', ts: 1000 },
 *   { type: 'say', say: 'api_req_retried', ts: 1001 },
 *   { type: 'say', say: 'api_req_started', text: '{}', ts: 1002 },
 * ];
 * const result = combineErrorRetryMessages(messages);
 * // Result: [{ type: 'say', say: 'api_req_started', text: '{}', ts: 1002 }]
 */
export declare function combineErrorRetryMessages(messages: ClineMessage[]): ClineMessage[];
//# sourceMappingURL=combineErrorRetryMessages.d.ts.map