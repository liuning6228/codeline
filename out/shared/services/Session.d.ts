export interface ToolCallRecord {
    name: string;
    success?: boolean;
    startTime: number;
    lastUpdateTime: number;
}
export interface ResourceUsage {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    userCpuMs: number;
    systemCpuMs: number;
}
export interface SessionStats {
    sessionId: string;
    totalToolCalls: number;
    successfulToolCalls: number;
    failedToolCalls: number;
    sessionStartTime: number;
    apiTimeMs: number;
    toolTimeMs: number;
    resources: ResourceUsage;
    peakMemoryBytes: number;
}
/**
 * Session singleton for tracking current session statistics.
 * Used by CLI to display interaction summary.
 */
export declare class Session {
    private static instance;
    private sessionId;
    private sessionStartTime;
    private toolCalls;
    private apiTimeMs;
    private toolTimeMs;
    private currentApiCallStart;
    private inFlightToolCalls;
    private initialCpuUsage;
    private peakMemoryBytes;
    private constructor();
    /**
     * Update peak memory if current usage is higher.
     */
    private updatePeakMemory;
    /**
     * Get current resource usage for this process.
     */
    getResourceUsage(): ResourceUsage;
    /**
     * Get the singleton instance, creating it if necessary.
     */
    static get(): Session;
    /**
     * Reset the session (creates a new session with fresh ID and stats).
     */
    static reset(): Session;
    /**
     * Get the current session ID.
     */
    getSessionId(): string;
    /**
     * Record the start of an API call.
     */
    startApiCall(): void;
    /**
     * Record the end of an API call.
     */
    endApiCall(): void;
    /**
     * Update a tool call - starts tracking if new, updates lastUpdateTime if existing.
     * @param callId - Unique identifier for this tool call
     * @param toolName - The name of the tool (required when starting a new call)
     * @param success - Optional success status (only set when finalizing)
     */
    updateToolCall(callId: string, toolName: string, success?: boolean): void;
    /**
     * Add API time directly (useful when timing is tracked elsewhere).
     */
    addApiTime(ms: number): void;
    /**
     * Finalize a request - moves all in-flight tool calls to completed and calculates durations.
     * Call this when an API request completes to close out all pending tool calls.
     */
    finalizeRequest(): void;
    /**
     * Get all session statistics.
     * Includes in-flight tool calls in the totals using their lastUpdateTime as end time.
     */
    getStats(): SessionStats;
    /**
     * Get the wall time (time since session started) in milliseconds.
     */
    getWallTimeMs(): number;
    /**
     * Get the session start time as a Date object.
     */
    getStartTime(): Date;
    /**
     * Get the current time (session end time) as a Date object.
     */
    getEndTime(): Date;
    /**
     * Format a timestamp for display (e.g., "2:34:56 PM").
     */
    formatTime(date: Date): string;
    /**
     * Get the agent active time (API time + tool time) in milliseconds.
     * Includes in-flight tool calls.
     */
    getAgentActiveTimeMs(): number;
    /**
     * Get the success rate as a percentage (0-100).
     * Includes in-flight tool calls.
     */
    getSuccessRate(): number;
}
//# sourceMappingURL=Session.d.ts.map