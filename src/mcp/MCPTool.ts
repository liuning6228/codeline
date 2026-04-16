/**
 * MCP工具接口定义
 * 从mcpManager.ts提取以支持独立导入
 */

export interface MCPTool {
  /** 工具ID */
  id: string;
  
  /** 工具名称 */
  name: string;
  
  /** 工具描述 */
  description: string;
  
  /** 工具版本 */
  version: string;
  
  /** 作者（可选） */
  author?: string;
  
  /** 工具能力列表 */
  capabilities: string[];
  
  /** 执行方法（可选） */
  execute?(params: Record<string, any>): Promise<any>;
  
  /** 验证方法（可选） */
  validate?(params: Record<string, any>): boolean;
  
  /** 工具配置（可选） */
  configuration?: Record<string, any>;
}