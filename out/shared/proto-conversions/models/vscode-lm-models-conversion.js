"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertVsCodeNativeModelsToProtoModels = convertVsCodeNativeModelsToProtoModels;
/**
 * Converts VS Code native model format to protobuf format
 */
function convertVsCodeNativeModelsToProtoModels(models) {
    return (models || []).map((model) => ({
        vendor: model.vendor || "",
        family: model.family || "",
        version: model.version || "",
        id: model.id || "",
    }));
}
//# sourceMappingURL=vscode-lm-models-conversion.js.map