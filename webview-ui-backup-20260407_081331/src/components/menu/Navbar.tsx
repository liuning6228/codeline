/**
 * CodeLine Navbar Component
 * Re-implementation of Cline's Navbar with pixel-perfect consistency
 * 
 * Features:
 * - Top-right navigation icons (Chat, MCP, History, Settings)
 * - Tooltips on hover
 * - VS Code API integration instead of GRPC
 */

import { HistoryIcon, PlusIcon, SettingsIcon } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useExtensionState } from "../../context/ExtensionStateContext"

// Custom MCP Server Icon using VSCode codicon (same as Cline)
const McpServerIcon = ({ className, size }: { className?: string; size?: number }) => (
  <span
    className={`codicon codicon-server flex items-center ${className || ""}`}
    style={{ fontSize: size ? `${size}px` : "12.5px", marginBottom: "1px" }}
  />
)

export const Navbar = () => {
  const { 
    navigateToChat, 
    navigateToMcp, 
    navigateToHistory, 
    navigateToSettings 
  } = useExtensionState()

  const SETTINGS_TABS = useMemo(
    () => [
      {
        id: "chat",
        name: "Chat",
        tooltip: "New Task",
        icon: PlusIcon,
        navigate: () => {
          // Clear current task and navigate to chat view
          // Replace Cline's TaskServiceClient.clearTask with VS Code API
          if (typeof vscode !== 'undefined') {
            vscode.postMessage({
              command: 'clearTask',
              data: {}
            })
          }
          navigateToChat()
        },
      },
      {
        id: "mcp",
        name: "MCP",
        tooltip: "MCP Servers",
        icon: McpServerIcon,
        navigate: navigateToMcp,
      },
      {
        id: "history",
        name: "History",
        tooltip: "History",
        icon: HistoryIcon,
        navigate: navigateToHistory,
      },
      // Note: Account tab removed per requirements
      {
        id: "settings",
        name: "Settings",
        tooltip: "Settings",
        icon: SettingsIcon,
        navigate: navigateToSettings,
      },
    ],
    [navigateToChat, navigateToMcp, navigateToHistory, navigateToSettings]
  )

  return (
    <nav
      className="flex-none inline-flex justify-end bg-transparent gap-2 mb-1 z-10 border-none items-center mr-4!"
      id="codeline-navbar-container">
      {SETTINGS_TABS.map((tab) => (
        <Tooltip key={`navbar-tooltip-${tab.id}`}>
          <TooltipTrigger asChild>
            <Button
              aria-label={tab.tooltip}
              className="p-0 h-7"
              data-testid={`tab-${tab.id}`}
              key={`navbar-button-${tab.id}`}
              onClick={() => tab.navigate()}
              size="icon"
              variant="icon">
              <tab.icon className="stroke-1 [svg]:size-4" size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {tab.tooltip}
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  )
}