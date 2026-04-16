/**
 * `BUILD_CONSTANTS` represent the variables that will be overwriten at build-time with predefined values.
 * Once the extension has been built, the values in this object will be fixed.
 *
 * @see [esbuild.mjs](../../esbuild.mjs)
 * @see {@link https://esbuild.github.io/api/#define|docs}
 */
export declare const BUILD_CONSTANTS: {
    TELEMETRY_SERVICE_API_KEY: string | undefined;
    ERROR_SERVICE_API_KEY: string | undefined;
    ENABLE_ERROR_AUTOCAPTURE: string | undefined;
    OTEL_TELEMETRY_ENABLED: string | undefined;
    OTEL_METRICS_EXPORTER: string | undefined;
    OTEL_LOGS_EXPORTER: string | undefined;
    OTEL_EXPORTER_OTLP_PROTOCOL: string | undefined;
    OTEL_EXPORTER_OTLP_ENDPOINT: string | undefined;
    OTEL_EXPORTER_OTLP_HEADERS: string | undefined;
    OTEL_METRIC_EXPORT_INTERVAL: string | undefined;
};
//# sourceMappingURL=constants.d.ts.map