"use strict";
/**
 * Shared configuration types that can be safely imported by both the extension and webview.
 * This file should not contain any Node.js-specific imports or runtime code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
var Environment;
(function (Environment) {
    Environment["production"] = "production";
    Environment["staging"] = "staging";
    Environment["local"] = "local";
    Environment["selfHosted"] = "selfHosted";
})(Environment || (exports.Environment = Environment = {}));
//# sourceMappingURL=config-types.js.map