/**
 * MCP集成接口定义
 * 用于MCP系统与外部系统的集成配置
 */

export interface MCPIntegration {
  /** 集成ID */
  id: string;
  
  /** 集成名称 */
  name: string;
  
  /** 集成类型 */
  type: string;
  
  /** 是否启用 */
  enabled: boolean;
  
  /** 集成配置 */
  configuration: Record<string, any>;
  
  /** 健康检查方法（可选） */
  healthCheck?(): Promise<boolean>;
  
  /** 初始化方法（可选） */
  initialize?(): Promise<void>;
  
  /** 清理方法（可选） */
  cleanup?(): Promise<void>;
  
  /** 版本信息 */
  version: string;
}