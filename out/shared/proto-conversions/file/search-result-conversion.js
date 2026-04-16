"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSearchResultsToProtoFileInfos = convertSearchResultsToProtoFileInfos;
exports.convertProtoFileInfosToSearchResults = convertProtoFileInfosToSearchResults;
/**
 * Converts domain search result objects to proto FileInfo objects
 */
function convertSearchResultsToProtoFileInfos(results) {
    return results.map((result) => ({
        path: result.path,
        type: result.type,
        label: result.label,
        workspaceName: result.workspaceName,
    }));
}
/**
 * Converts proto FileInfo objects to domain search result objects
 */
function convertProtoFileInfosToSearchResults(protoResults) {
    return protoResults.map((protoResult) => ({
        path: protoResult.path,
        type: protoResult.type,
        label: protoResult.label,
        workspaceName: protoResult.workspaceName,
    }));
}
//# sourceMappingURL=search-result-conversion.js.map