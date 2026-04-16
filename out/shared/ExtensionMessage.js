"use strict";
// type that represents json data that is sent from extension to webview, called ExtensionMessage and has 'type' enum which can be 'plusButtonClicked' or 'settingsButtonClicked' or 'hello'
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPLETION_RESULT_CHANGES_FLAG = exports.browserActions = exports.COMMAND_CANCEL_TOKEN = exports.DEFAULT_PLATFORM = void 0;
exports.DEFAULT_PLATFORM = "unknown";
exports.COMMAND_CANCEL_TOKEN = "__cline_command_cancel__";
// must keep in sync with system prompt
exports.browserActions = ["launch", "click", "type", "scroll_down", "scroll_up", "close"];
exports.COMPLETION_RESULT_CHANGES_FLAG = "HAS_CHANGES";
//# sourceMappingURL=ExtensionMessage.js.map