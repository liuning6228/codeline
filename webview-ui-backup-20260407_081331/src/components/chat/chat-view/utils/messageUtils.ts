/**
 * Utility functions for message filtering, grouping, and manipulation
 * Simplified version for CodeLine
 */

import type { ClineMessage } from '@/context/ExtensionStateContext'

/**
 * Low-stakes tool types that should be grouped together
 */
const LOW_STAKES_TOOLS = new Set([
  'readFile',
  'listFilesTopLevel',
  'listFilesRecursive',
  'listCodeDefinitionNames',
  'searchFiles',
])

/**
 * Tool info interface
 */
export interface ClineSayTool {
  tool: string
  path?: string
  content?: string
  [key: string]: any
}

/**
 * Check if a tool message is a low-stakes tool
 */
export function isLowStakesTool(message: ClineMessage): boolean {
  if (message.say !== 'tool' && message.ask !== 'tool') {
    return false
  }
  try {
    const tool = JSON.parse(message.text || '{}') as ClineSayTool
    return LOW_STAKES_TOOLS.has(tool.tool)
  } catch {
    return false
  }
}

/**
 * Check if a message group is a tool group (array with _isToolGroup marker)
 */
export function isToolGroup(item: ClineMessage | ClineMessage[]): item is ClineMessage[] & { _isToolGroup: true } {
  return Array.isArray(item) && (item as any)._isToolGroup === true
}

/**
 * Filter messages that should be visible in the chat
 */
export function filterVisibleMessages(messages: ClineMessage[]): ClineMessage[] {
  return messages.filter((message, index, arr) => {
    switch (message.ask) {
      case 'completion_result':
        if (message.text === '') {
          return false
        }
        break
      case 'api_req_failed':
      case 'resume_task':
      case 'resume_completed_task':
        return false
      case 'use_subagents':
        if (arr.slice(index + 1).some((candidate) => candidate.type === 'say' && candidate.say === 'subagent')) {
          return false
        }
        break
    }
    switch (message.say) {
      case 'api_req_finished':
      case 'api_req_retried':
      case 'deleted_api_reqs':
      case 'subagent_usage':
      case 'task_progress':
        return false
      case 'api_req_started': {
        try {
          const info = JSON.parse(message.text || '{}')
          if (info.cancelReason || info.streamingFailedMessage) {
            break
          }
        } catch {
          break
        }
        return false
      }
      case 'text':
        if ((message.text ?? '') === '' && (message.images?.length ?? 0) === 0) {
          return false
        }
        break
      case 'mcp_server_request_started':
        return false
      case 'use_subagents':
        if (arr.slice(index + 1).some((candidate) => candidate.type === 'say' && candidate.say === 'subagent')) {
          return false
        }
        break
    }
    return true
  })
}

/**
 * Check if a message is part of a browser session
 */
export function isBrowserSessionMessage(message: ClineMessage): boolean {
  if (message.type === 'ask') {
    return ['browser_action_launch'].includes(message.ask!)
  }
  if (message.type === 'say') {
    return [
      'browser_action_launch',
      'api_req_started',
      'text',
      'browser_action',
      'browser_action_result',
      'checkpoint_created',
      'reasoning',
      'error_retry',
    ].includes(message.say!)
  }
  return false
}

/**
 * Group messages, combining browser session messages into arrays
 */
export function groupMessages(visibleMessages: ClineMessage[]): (ClineMessage | ClineMessage[])[] {
  const result: (ClineMessage | ClineMessage[])[] = []
  let currentGroup: ClineMessage[] = []
  let isInBrowserSession = false

  const endBrowserSession = () => {
    if (currentGroup.length > 0) {
      result.push([...currentGroup])
      currentGroup = []
      isInBrowserSession = false
    }
  }

  for (const message of visibleMessages) {
    if (message.ask === 'browser_action_launch' || message.say === 'browser_action_launch') {
      endBrowserSession()
      isInBrowserSession = true
      currentGroup.push(message)
    } else if (isInBrowserSession) {
      if (message.say === 'api_req_started') {
        const lastApiReqStarted = [...currentGroup].reverse().find((m) => m.say === 'api_req_started')
        if (lastApiReqStarted?.text != null) {
          const info = JSON.parse(lastApiReqStarted.text)
          const isCancelled = info.cancelReason != null
          if (isCancelled) {
            endBrowserSession()
            result.push(message)
            continue
          }
        }
      }

      if (isBrowserSessionMessage(message)) {
        currentGroup.push(message)

        if (message.say === 'browser_action') {
          const browserAction = JSON.parse(message.text || '{}')
          if (browserAction.action === 'close') {
            endBrowserSession()
          }
        }
      } else {
        endBrowserSession()
        result.push(message)
      }
    } else {
      result.push(message)
    }
  }

  if (currentGroup.length > 0) {
    result.push([...currentGroup])
  }

  return result
}

/**
 * Group consecutive low-stakes tools into arrays
 */
export function groupLowStakesTools(groupedMessages: (ClineMessage | ClineMessage[])[]): (ClineMessage | ClineMessage[])[] {
  const result: (ClineMessage | ClineMessage[])[] = []
  let toolGroup: ClineMessage[] = []
  let hasTools = false

  const commitToolGroup = () => {
    if (toolGroup.length > 0 && hasTools) {
      const group = toolGroup as ClineMessage[] & { _isToolGroup: boolean }
      group._isToolGroup = true
      result.push(group)
    }
    toolGroup = []
    hasTools = false
  }

  for (const item of groupedMessages) {
    if (Array.isArray(item)) {
      commitToolGroup()
      result.push(item)
      continue
    }

    const message = item

    if (isLowStakesTool(message)) {
      hasTools = true
      toolGroup.push(message)
      continue
    }

    if (message.say === 'reasoning' && hasTools) {
      toolGroup.push(message)
      continue
    }

    if (message.say === 'api_req_started' && hasTools) {
      toolGroup.push(message)
      continue
    }

    if (message.say === 'checkpoint_created' && hasTools) {
      toolGroup.push(message)
      continue
    }

    commitToolGroup()
    result.push(message)
  }

  commitToolGroup()

  return result
}

/**
 * Get the task message from the messages array
 */
export function getTaskMessage(messages: ClineMessage[]): ClineMessage | undefined {
  return messages[0]
}

/**
 * Check if we should show the scroll to bottom button
 */
export function shouldShowScrollButton(disableAutoScroll: boolean, isAtBottom: boolean): boolean {
  return disableAutoScroll && !isAtBottom
}

/**
 * Process messages (filter, group, etc.)
 */
export function processMessages(messages: ClineMessage[]): (ClineMessage | ClineMessage[])[] {
  const visible = filterVisibleMessages(messages)
  const grouped = groupMessages(visible)
  return groupLowStakesTools(grouped)
}
