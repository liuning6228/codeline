"use strict";
/**
 * Constants for identifying user-generated content and system-generated markers
 * in task conversations. These are used to parse and filter content appropriately.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_CONTENT_MARKERS = exports.USER_CONTENT_TAGS = void 0;
/**
 * Tags that wrap user-generated content in the conversation.
 * Used to identify content that comes from the user vs system-generated content.
 */
exports.USER_CONTENT_TAGS = ["<task>", "<feedback>", "<answer>", "<user_message>"];
/**
 * Markers for system-generated content that should be excluded when parsing user input.
 * These indicate content added by the system rather than the user.
 */
exports.SYSTEM_CONTENT_MARKERS = [
    "[TASK RESUMPTION]",
    "<hook_context",
    "[Response interrupted",
    "Task was interrupted",
];
//# sourceMappingURL=constants.js.map