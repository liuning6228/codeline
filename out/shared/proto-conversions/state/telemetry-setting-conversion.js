"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDomainTelemetrySettingToProto = convertDomainTelemetrySettingToProto;
exports.convertProtoTelemetrySettingToDomain = convertProtoTelemetrySettingToDomain;
const state_1 = require("@shared/proto/cline/state");
/**
 * Converts a domain TelemetrySetting string to a proto TelemetrySettingEnum
 */
function convertDomainTelemetrySettingToProto(setting) {
    switch (setting) {
        case "unset":
            return state_1.TelemetrySettingEnum.UNSET;
        case "enabled":
            return state_1.TelemetrySettingEnum.ENABLED;
        case "disabled":
            return state_1.TelemetrySettingEnum.DISABLED;
        default:
            return state_1.TelemetrySettingEnum.UNSET;
    }
}
/**
 * Converts a proto TelemetrySettingEnum to a domain TelemetrySetting string
 */
function convertProtoTelemetrySettingToDomain(setting) {
    switch (setting) {
        case state_1.TelemetrySettingEnum.UNSET:
            return "unset";
        case state_1.TelemetrySettingEnum.ENABLED:
            return "enabled";
        case state_1.TelemetrySettingEnum.DISABLED:
            return "disabled";
        default:
            return "unset";
    }
}
//# sourceMappingURL=telemetry-setting-conversion.js.map