"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.posthogConfig = void 0;
exports.isPostHogConfigValid = isPostHogConfigValid;
const constants_1 = require("../../constants");
/**
 * NOTE: Ensure that dev environment is not used in production.
 * process.env.CI will always be true in the CI environment, during both testing and publishing step,
 * so it is not a reliable indicator of the environment.
 */
const useDevEnv = process.env.IS_DEV === "true" || process.env.CLINE_ENVIRONMENT === "local";
/**
 * PostHog configuration for Production Environment.
 * NOTE: The production environment variables will be injected at build time in CI/CD pipeline.
 * IMPORTANT: The secrets must be added to the GitHub Secrets and matched with the environment variables names
 * defined in the .github/workflows/publish.yml workflow.
 * NOTE: The development environment variables should be retrieved from 1password shared vault.
 */
exports.posthogConfig = {
    apiKey: constants_1.BUILD_CONSTANTS.TELEMETRY_SERVICE_API_KEY,
    errorTrackingApiKey: constants_1.BUILD_CONSTANTS.ERROR_SERVICE_API_KEY,
    host: "https://data.cline.bot",
    uiHost: useDevEnv ? "https://us.i.posthog.com" : "https://us.posthog.com",
    enableErrorAutocapture: constants_1.BUILD_CONSTANTS.ENABLE_ERROR_AUTOCAPTURE === "true",
};
const isTestEnv = process.env.E2E_TEST === "true" || process.env.IS_TEST === "true";
function isPostHogConfigValid(config) {
    // Allow invalid config in test environment to enable mocking and stubbing
    if (isTestEnv) {
        return false;
    }
    return (typeof config.apiKey === "string" &&
        typeof config.errorTrackingApiKey === "string" &&
        typeof config.host === "string" &&
        typeof config.uiHost === "string");
}
//# sourceMappingURL=posthog-config.js.map