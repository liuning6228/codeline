import { LanguageModelChatSelector } from "@shared/proto/cline/models";
/**
 * Represents a VS Code language model in the native VS Code format
 */
export interface VsCodeNativeModel {
    vendor?: string;
    family?: string;
    version?: string;
    id?: string;
}
/**
 * Converts VS Code native model format to protobuf format
 */
export declare function convertVsCodeNativeModelsToProtoModels(models: VsCodeNativeModel[]): LanguageModelChatSelector[];
//# sourceMappingURL=vscode-lm-models-conversion.d.ts.map