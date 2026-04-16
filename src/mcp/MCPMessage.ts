/**
 * MCP消息类型定义
 * 从MCPHandler.ts提取以支持独立导入
 */

export interface MCPMessage {
  /** 消息类型 */
  type: string;
  
  /** 消息数据 */
  data: Record<string, any>;
  
  /** 消息ID（可选） */
  messageId?: string;
  
  /** 时间戳（可选） */
  timestamp?: number;
}