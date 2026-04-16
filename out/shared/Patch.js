"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffError = exports.PatchActionType = exports.BASH_WRAPPERS = exports.PATCH_MARKERS = void 0;
/**
 * Apply Patch constants
 */
exports.PATCH_MARKERS = {
    BEGIN: "*** Begin Patch",
    END: "*** End Patch",
    ADD: "*** Add File: ",
    UPDATE: "*** Update File: ",
    DELETE: "*** Delete File: ",
    MOVE: "*** Move to: ",
    SECTION: "@@",
    END_FILE: "*** End of File",
};
/**
 * Expected bash wrappers for apply patch content
 */
exports.BASH_WRAPPERS = ["%%bash", "apply_patch", "EOF", "```"];
/**
 * Domains of patch actions
 */
var PatchActionType;
(function (PatchActionType) {
    PatchActionType["ADD"] = "add";
    PatchActionType["DELETE"] = "delete";
    PatchActionType["UPDATE"] = "update";
})(PatchActionType || (exports.PatchActionType = PatchActionType = {}));
class DiffError extends Error {
    constructor(message) {
        super(message);
        this.name = "DiffError";
    }
}
exports.DiffError = DiffError;
//# sourceMappingURL=Patch.js.map