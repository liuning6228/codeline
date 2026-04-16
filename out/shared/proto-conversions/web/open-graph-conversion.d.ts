interface DomainOpenGraphData {
    type?: string;
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
}
interface ProtoOpenGraphData {
    type?: string;
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    siteName?: string;
}
/**
 * Converts domain OpenGraphData objects to proto OpenGraphData objects
 * @param ogData Domain OpenGraphData object
 * @returns Proto OpenGraphData object
 */
export declare function convertDomainOpenGraphDataToProto(ogData: DomainOpenGraphData): ProtoOpenGraphData;
export {};
//# sourceMappingURL=open-graph-conversion.d.ts.map