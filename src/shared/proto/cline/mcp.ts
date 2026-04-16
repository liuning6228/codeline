// Temporary implementation for Cline MCP types

export interface McpServer {
  name: string
  // Add other fields as needed
  [key: string]: any
}

export const McpServer = {
  create: (data: any): McpServer => data
}

export interface McpServerStatus {
  // Placeholder for MCP server status
  [key: string]: any
}

export const McpServerStatus = {
  create: (data: any): McpServerStatus => data
}

export interface McpResourceTemplate {
  // Placeholder for MCP resource template
  [key: string]: any
}

export const McpResourceTemplate = {
  create: (data: any): McpResourceTemplate => data
}

export interface McpTool {
  // Placeholder for MCP tool
  [key: string]: any
}

export const McpTool = {
  create: (data: any): McpTool => data
}

export interface AddRemoteMcpServerRequest {
  // Placeholder for add remote MCP server request
  [key: string]: any
}

export const AddRemoteMcpServerRequest = {
  create: (data: any): AddRemoteMcpServerRequest => data
}

export interface McpServers {
  // Placeholder for MCP servers
  [key: string]: any
}

export const McpServers = {
  create: (data: any): McpServers => data
}

export interface ToggleToolAutoApproveRequest {
  // Placeholder for toggle tool auto-approve request
  [key: string]: any
}

export const ToggleToolAutoApproveRequest = {
  create: (data: any): ToggleToolAutoApproveRequest => data
}

export interface ToggleMcpServerRequest {
  // Placeholder for toggle MCP server request
  [key: string]: any
}

export const ToggleMcpServerRequest = {
  create: (data: any): ToggleMcpServerRequest => data
}

export interface UpdateMcpTimeoutRequest {
  // Placeholder for update MCP timeout request
  [key: string]: any
}

export const UpdateMcpTimeoutRequest = {
  create: (data: any): UpdateMcpTimeoutRequest => data
}