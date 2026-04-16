// Temporary implementation for Cline state types
// Note: Full types are in state.proto, this is a minimal implementation

export interface State {
  mode: string
  showWelcome: boolean
  shouldShowAnnouncement: boolean
  showSettings: boolean
  showHistory: boolean
  showAccount: boolean
  showWorktrees: boolean
  showMcp: boolean
  mcpTab: string
  settingsTargetSection: string
  didHydrateState: boolean
  showAnnouncement: boolean
  dismissedBanners: string[]
  hasShownKanbanModal: boolean
  showKanbanModal: boolean
  activeOrganization: any | null
  clineUser: any | null
  organizations: any[]
  version: string
  distinctId: string
  [key: string]: any
}

export const State = {
  create: (data: any): State => data
}

export interface McpDisplayMode {
  // Placeholder for MCP display mode
  [key: string]: any
}

export const McpDisplayMode = {
  create: (data: any): McpDisplayMode => data
}

export interface UpdateSettingsRequest {
  // Placeholder for update settings request
  [key: string]: any
}

export const UpdateSettingsRequest = {
  create: (data: any): UpdateSettingsRequest => data
}

export interface PlanActMode {
  // Placeholder for plan act mode
  [key: string]: any
}

export const PlanActMode = {
  create: (data: any): PlanActMode => data
}

export interface TogglePlanActModeRequest {
  // Placeholder for toggle plan act mode request
  [key: string]: any
}

export const TogglePlanActModeRequest = {
  create: (data: any): TogglePlanActModeRequest => data
}

export interface ResetStateRequest {
  // Placeholder for reset state request
  [key: string]: any
}

export const ResetStateRequest = {
  create: (data: any): ResetStateRequest => data
}