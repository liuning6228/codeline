import { RemoteConfigFields } from "@/shared/storage/state-keys";
export interface OpenTelemetryClientConfig {
    /**
     * Whether telemetry is enabled via OTEL_TELEMETRY_ENABLED
     */
    enabled: boolean;
    /**
     * Metrics exporter type(s) - can be comma-separated for multiple exporters
     * Examples: "console", "otlp", "prometheus", "console,otlp"
     */
    metricsExporter?: string;
    /**
     * Logs/events exporter type(s) - can be comma-separated for multiple exporters
     * Examples: "console", "otlp"
     */
    logsExporter?: string;
    /**
     * Protocol for OTLP exporters: "grpc", "http/json", "http/protobuf"
     */
    otlpProtocol?: string;
    /**
     * General OTLP endpoint (used if specific endpoints not set)
     */
    otlpEndpoint?: string;
    /**
     * General OTLP headers
     */
    otlpHeaders?: Record<string, string>;
    /**
     * Metrics-specific OTLP protocol
     */
    otlpMetricsProtocol?: string;
    /**
     * Metrics-specific OTLP endpoint
     */
    otlpMetricsEndpoint?: string;
    otlpMetricsHeaders?: Record<string, string>;
    /**
     * Logs-specific OTLP protocol
     */
    otlpLogsProtocol?: string;
    /**
     * Logs-specific OTLP endpoint
     */
    otlpLogsEndpoint?: string;
    otlpLogsHeaders?: Record<string, string>;
    /**
     * Metric export interval in milliseconds (for console exporter)
     */
    metricExportInterval?: number;
    /**
     * Whether to use insecure (non-TLS) connections for gRPC OTLP exporters
     * Set to "true" for local development without TLS
     * Default: false (uses TLS)
     */
    otlpInsecure?: boolean;
    /**
     * Maximum batch size for log records (default: 512)
     */
    logBatchSize?: number;
    /**
     * Maximum time to wait before exporting logs in milliseconds (default: 5000)
     */
    logBatchTimeout?: number;
    /**
     * Maximum queue size for log records (default: 2048)
     */
    logMaxQueueSize?: number;
}
/**
 * Helper type for a valid OpenTelemetry client configuration.
 * Must have telemetry enabled and at least one exporter configured.
 */
export interface OpenTelemetryClientValidConfig extends OpenTelemetryClientConfig {
    enabled: true;
}
export declare function remoteConfigToOtelConfig(settings: Partial<RemoteConfigFields>): OpenTelemetryClientConfig;
export declare function isOpenTelemetryConfigValid(config: OpenTelemetryClientConfig): config is OpenTelemetryClientValidConfig;
/**
 * Gets validated OpenTelemetry configuration if available.
 * Returns null if configuration is invalid or disabled.
 *
 * Configuration does not change at runtime - requires VSCode reload to pick up new values.
 *
 * @returns Valid OpenTelemetry configuration or null if disabled/invalid
 * @see .env.example for configuration options
 */
export declare function getValidOpenTelemetryConfig(): OpenTelemetryClientValidConfig | null;
export declare function getValidRuntimeOpenTelemetryConfig(): OpenTelemetryClientValidConfig | null;
//# sourceMappingURL=otel-config.d.ts.map