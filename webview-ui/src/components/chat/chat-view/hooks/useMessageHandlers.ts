/**
 * useMessageHandlers Hook
 * Handles sending messages, button clicks, and task management
 */

import { useCallback, useRef } from 'react'
import { useExtensionState, ClineMessage } from '@/context/ExtensionStateContext'
import { ChatState, MessageHandlers, ButtonActionType } from '../types/chatTypes'

/**
 * Custom hook for managing message handlers
 * Handles sending messages, button clicks, and task management
 */
export function useMessageHandlers(messages: ClineMessage[], chatState: ChatState): MessageHandlers {
  const { sendMessage: contextSendMessage, clearMessages, setMode, mode } = useExtensionState()
  
  const {
    setInputValue,
    activeQuote,
    setActiveQuote,
    setSelectedImages,
    setSelectedFiles,
    setSendingDisabled,
    setEnableButtons,
    clineAsk,
    lastMessage,
  } = chatState
  
  const cancelInFlightRef = useRef(false)

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (text: string, images: string[], files: string[]) => {
      let messageToSend = text.trim()
      const hasContent = messageToSend || images.length > 0 || files.length > 0

      // Prepend the active quote if it exists
      if (activeQuote && hasContent) {
        const prefix = '[context] \n> '
        const formattedQuote = activeQuote
        const suffix = '\n[/context] \n\n'
        messageToSend = `${prefix} ${formattedQuote} ${suffix} ${messageToSend}`
      }

      if (hasContent) {
        console.log('[ChatView] handleSendMessage - Sending message:', messageToSend)
        let messageSent = false

        if (messages.length === 0) {
          // New task
          contextSendMessage(messageToSend, images)
          messageSent = true
        } else if (clineAsk) {
          // Handle different ask types
          if (clineAsk === 'resume_task' || clineAsk === 'resume_completed_task') {
            // Resume task
            contextSendMessage(messageToSend, images)
            messageSent = true
          } else {
            // All other ask types use messageResponse
            switch (clineAsk) {
              case 'followup':
              case 'plan_mode_respond':
              case 'tool':
              case 'browser_action_launch':
              case 'command':
              case 'command_output':
              case 'use_mcp_server':
              case 'use_subagents':
              case 'completion_result':
              case 'mistake_limit_reached':
              case 'api_req_failed':
              case 'new_task':
              case 'condense':
              case 'report_bug':
                contextSendMessage(messageToSend, images)
                messageSent = true
                break
            }
          }
        } else if (messages.length > 0) {
          // No clineAsk set - check if task is actively running
          const lastMsg = messages[messages.length - 1]
          const isTaskRunning =
            lastMsg.partial === true || (lastMsg.type === 'say' && lastMsg.say === 'api_req_started')

          if (isTaskRunning) {
            // Task is running - send message as interruption/feedback
            contextSendMessage(messageToSend, images)
            messageSent = true
          }
        }

        // Only clear input and disable UI if message was actually sent
        if (messageSent) {
          setInputValue('')
          setActiveQuote(null)
          setSendingDisabled(true)
          setSelectedImages([])
          setSelectedFiles([])
          setEnableButtons(false)
        }
      }
    },
    [
      messages.length,
      clineAsk,
      activeQuote,
      setInputValue,
      setActiveQuote,
      setSendingDisabled,
      setSelectedImages,
      setSelectedFiles,
      setEnableButtons,
      contextSendMessage,
    ],
  )

  // Start a new task
  const startNewTask = useCallback(async () => {
    setActiveQuote(null)
    clearMessages()
  }, [setActiveQuote, clearMessages])

  // Clear input state helper
  const clearInputState = useCallback(() => {
    setInputValue('')
    setActiveQuote(null)
    setSelectedImages([])
    setSelectedFiles([])
  }, [setInputValue, setActiveQuote, setSelectedImages, setSelectedFiles])

  // Execute button action based on type
  const executeButtonAction = useCallback(
    async (actionType: ButtonActionType, text?: string, images?: string[], files?: string[]) => {
      const trimmedInput = text?.trim()
      const hasContent = trimmedInput || (images && images.length > 0) || (files && files.length > 0)

      switch (actionType) {
        case 'retry':
          // For API retry, always send simple approval without content
          contextSendMessage('', [])
          clearInputState()
          break
          
        case 'approve':
          if (hasContent) {
            contextSendMessage(trimmedInput || '', images || [])
          } else {
            contextSendMessage('', [])
          }
          clearInputState()
          break

        case 'reject':
          if (hasContent) {
            contextSendMessage(trimmedInput || '', images || [])
          } else {
            contextSendMessage('', [])
          }
          clearInputState()
          break

        case 'proceed':
          if (hasContent) {
            contextSendMessage(trimmedInput || '', images || [])
          } else {
            contextSendMessage('', [])
          }
          clearInputState()
          break

        case 'new_task':
          if (clineAsk === 'new_task') {
            contextSendMessage(lastMessage?.text || '', [])
          } else {
            await startNewTask()
          }
          break

        case 'cancel': {
          if (cancelInFlightRef.current) {
            return
          }
          cancelInFlightRef.current = true
          setSendingDisabled(true)
          setEnableButtons(false)
          try {
            // Cancel task - would need backend support
            clearMessages()
          } finally {
            cancelInFlightRef.current = false
            setSendingDisabled(false)
            setEnableButtons(true)
          }
          break
        }

        case 'utility':
          // Handle utility actions like condense, report_bug
          if (clineAsk === 'condense' || clineAsk === 'report_bug') {
            contextSendMessage(lastMessage?.text || '', [])
          }
          break
      }
    },
    [
      clineAsk,
      lastMessage,
      clearInputState,
      startNewTask,
      setSendingDisabled,
      setEnableButtons,
      contextSendMessage,
      clearMessages,
    ],
  )

  // Handle task close button click
  const handleTaskCloseButtonClick = useCallback(() => {
    startNewTask()
  }, [startNewTask])

  return {
    handleSendMessage,
    executeButtonAction,
    handleTaskCloseButtonClick,
    startNewTask,
  }
}
