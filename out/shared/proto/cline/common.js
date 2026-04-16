"use strict";
// Temporary implementation for Cline proto types
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringArrayRequest = exports.State = exports.KeyValuePair = exports.Int64Request = exports.BooleanRequest = exports.StringRequest = exports.EmptyRequest = void 0;
exports.EmptyRequest = {
    create: () => ({})
};
exports.StringRequest = {
    create: (value) => ({ value })
};
exports.BooleanRequest = {
    create: (value) => ({ value })
};
exports.Int64Request = {
    create: (value) => ({ value })
};
exports.KeyValuePair = {
    create: (key, value) => ({ key, value })
};
exports.State = {
    create: (data) => data
};
exports.StringArrayRequest = {
    create: (values) => ({ values })
};
//# sourceMappingURL=common.js.map