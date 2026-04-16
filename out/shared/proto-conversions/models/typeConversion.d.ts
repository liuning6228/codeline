import { LiteLLMModelInfo, ModelInfo, OcaModelInfo, OpenAiCompatibleModelInfo } from "@shared/api";
import { OpenRouterModelInfo, LiteLLMModelInfo as ProtoLiteLLMModelInfo, OcaModelInfo as ProtoOcaModelInfo, OpenAiCompatibleModelInfo as ProtoOpenAiCompatibleModelInfo } from "@shared/proto/cline/models";
/**
 * Convert protobuf OpenRouterModelInfo to application ModelInfo
 */
export declare function fromProtobufModelInfo(protoInfo: OpenRouterModelInfo): ModelInfo;
/**
 * Convert application ModelInfo to protobuf OpenRouterModelInfo
 */
export declare function toProtobufModelInfo(modelInfo: ModelInfo): OpenRouterModelInfo;
/**
 * Convert protobuf OpenAiCompatibleModelInfo to application OpenAiCompatibleModelInfo
 */
export declare function fromProtobufOpenAiCompatibleModelInfo(protoInfo: ProtoOpenAiCompatibleModelInfo): OpenAiCompatibleModelInfo;
/**
 * Convert protobuf LiteLLMModelInfo to application LiteLLMModelInfo
 */
export declare function fromProtobufLiteLLMModelInfo(protoInfo: ProtoLiteLLMModelInfo): LiteLLMModelInfo;
/**
 * Convert protobuf OcaModelInfo to application OcaModelInfo
 */
export declare function fromProtobufOcaModelInfo(protoInfo: ProtoOcaModelInfo): OcaModelInfo;
/**
 * Convert a record of protobuf models to application models
 */
export declare function fromProtobufModels(protoModels: Record<string, OpenRouterModelInfo>): Record<string, ModelInfo>;
/**
 * Convert a record of application models to protobuf models
 */
export declare function toProtobufModels(models: Record<string, ModelInfo>): Record<string, OpenRouterModelInfo>;
//# sourceMappingURL=typeConversion.d.ts.map