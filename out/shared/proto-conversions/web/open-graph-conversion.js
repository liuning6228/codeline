"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDomainOpenGraphDataToProto = convertDomainOpenGraphDataToProto;
function createProtoOpenGraphData(data) {
    return data;
}
/**
 * Converts domain OpenGraphData objects to proto OpenGraphData objects
 * @param ogData Domain OpenGraphData object
 * @returns Proto OpenGraphData object
 */
function convertDomainOpenGraphDataToProto(ogData) {
    return createProtoOpenGraphData({
        title: ogData.title || "",
        description: ogData.description || "",
        image: ogData.image || "",
        url: ogData.url || "",
        siteName: ogData.siteName || "",
        type: ogData.type || "",
    });
}
//# sourceMappingURL=open-graph-conversion.js.map