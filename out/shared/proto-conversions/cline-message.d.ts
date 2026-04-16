import { ClineMessage as AppClineMessage } from "@shared/ExtensionMessage";
import { ClineMessage as ProtoClineMessage } from "@shared/proto/cline/ui";
/**
 * Convert application ClineMessage to proto ClineMessage
 */
export declare function convertClineMessageToProto(message: AppClineMessage): ProtoClineMessage;
/**
 * Convert proto ClineMessage to application ClineMessage
 */
export declare function convertProtoToClineMessage(protoMessage: ProtoClineMessage): AppClineMessage;
//# sourceMappingURL=cline-message.d.ts.map