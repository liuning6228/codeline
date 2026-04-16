// 简化版本 - 避免复杂的导入
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

function createProtoOpenGraphData(data: Partial<ProtoOpenGraphData>): ProtoOpenGraphData {
  return data as ProtoOpenGraphData;
}

/**
 * Converts domain OpenGraphData objects to proto OpenGraphData objects
 * @param ogData Domain OpenGraphData object
 * @returns Proto OpenGraphData object
 */
export function convertDomainOpenGraphDataToProto(ogData: DomainOpenGraphData): ProtoOpenGraphData {
	return createProtoOpenGraphData({
		title: ogData.title || "",
		description: ogData.description || "",
		image: ogData.image || "",
		url: ogData.url || "",
		siteName: ogData.siteName || "",
		type: ogData.type || "",
	})
}
