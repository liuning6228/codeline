import { TelemetrySettingEnum } from "@shared/proto/cline/state";
import { TelemetrySetting } from "../../TelemetrySetting";
/**
 * Converts a domain TelemetrySetting string to a proto TelemetrySettingEnum
 */
export declare function convertDomainTelemetrySettingToProto(setting: TelemetrySetting): TelemetrySettingEnum;
/**
 * Converts a proto TelemetrySettingEnum to a domain TelemetrySetting string
 */
export declare function convertProtoTelemetrySettingToDomain(setting: TelemetrySettingEnum): TelemetrySetting;
//# sourceMappingURL=telemetry-setting-conversion.d.ts.map