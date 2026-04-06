/**
 * Chat Types for CodeLine
 * Based on Cline's chat type system
 */

import type { RefObject, MutableRefObject } from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'
import type { ClineMessage } from '@/context/ExtensionStateContext'

/**
 * Chat state interface
 */
export interface ChatState {
  // Input state
  inputValue: string
  setInputValue: (value: string) => void
  
  // Quote/reply state
  activeQuote: string | null
  setActiveQuote: (quote: string | null) => void
  
  // Focus state
  isTextAreaFocused: boolean
  setIsTextAreaFocused: (focused: boolean) => void
  
  // Selection state
  selectedImages: string[]
  setSelectedImages: (images: string[]) => void
  selectedFiles: string[]
  setSelectedFiles: (files: string[]) => void
  
  // UI state
  sendingDisabled: boolean
  setSendingDisabled: (disabled: boolean) => void
  enableButtons: boolean
  setEnableButtons: (enabled: boolean) => void
  primaryButtonText: string | undefined
  setPrimaryButtonText: (text: string | undefined) => void
  secondaryButtonText: string | undefined
  setSecondaryButtonText: (text: string | undefined) => void
  
  // Expanded rows
  expandedRows: Record<number, boolean>
  setExpandedRows: (rows: Record<number, boolean>) => void
  
  // Refs
  textAreaRef: RefObject<HTMLTextAreaElement>
  
  // Derived values
  lastMessage: ClineMessage | undefined
  secondLastMessage: ClineMessage | undefined
  clineAsk: string | undefined
  task: ClineMessage | undefined
  
  // Handlers
  handleFocusChange: (isFocused: boolean) => void
  clearExpandedRows: () => void
  resetState: () => void
}

/**
 * Message handlers interface
 */
export interface MessageHandlers {
  handleSendMessage: (text: string, images: string[], files: string[]) => Promise<void>
  executeButtonAction: (actionType: ButtonActionType, text?: string, images?: string[], files?: string[]) => Promise<void>
  handleTaskCloseButtonClick: () => void
  startNewTask: () => Promise<void>
}

/**
 * Scroll behavior interface
 */
export interface ScrollBehavior {
  virtuosoRef: RefObject<VirtuosoHandle>
  scrollContainerRef: RefObject<HTMLDivElement>
  disableAutoScrollRef: MutableRefObject<boolean>
  scrollToBottomSmooth: () => void
  scrollToBottomAuto: () => void
  scrollToMessage: (messageIndex: number) => void
  toggleRowExpansion: (ts: number) => void
  handleRowHeightChange: (isTaller: boolean) => void
}

/**
 * Button action types
 */
export type ButtonActionType = 
  | 'approve' 
  | 'reject' 
  | 'proceed' 
  | 'retry' 
  | 'cancel' 
  | 'new_task' 
  | 'utility'

/**
 * Visible message group type
 */
export type MessageGroup = ClineMessage | ClineMessage[]

/**
 * Chat view props
 */
export interface ChatViewProps {
  isHidden?: boolean
}

/**
 * Message handler callback types
 */
export type AskResponseType = 
  | 'messageResponse'
  | 'yesButtonClicked'
  | 'noButtonClicked'
