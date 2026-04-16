/**
 * useScrollBehavior Hook
 * Handles auto-scrolling, manual scrolling, and scroll-to-message functionality
 */

import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { ClineMessage } from '@/context/ExtensionStateContext'
import { ScrollBehavior, MessageGroup } from '../types/chatTypes'
import type { ListRange, VirtuosoHandle } from 'react-virtuoso'

// Height of the sticky user message header (padding + content)
const STICKY_HEADER_HEIGHT = 32

/**
 * Custom hook for managing scroll behavior
 * Handles auto-scrolling, manual scrolling, and scroll-to-message functionality
 */
export function useScrollBehavior(
  messages: ClineMessage[],
  visibleMessages: ClineMessage[],
  groupedMessages: MessageGroup[],
  expandedRows: Record<number, boolean>,
  setExpandedRows: Dispatch<SetStateAction<Record<number, boolean>>>,
): ScrollBehavior & {
  showScrollToBottom: boolean
  setShowScrollToBottom: Dispatch<SetStateAction<boolean>>
  isAtBottom: boolean
  setIsAtBottom: Dispatch<SetStateAction<boolean>>
  pendingScrollToMessage: number | null
  setPendingScrollToMessage: Dispatch<SetStateAction<number | null>>
  scrolledPastUserMessage: ClineMessage | null
  handleRangeChanged: (range: ListRange) => void
} {
  // Refs
  const virtuosoRef = useRef<VirtuosoHandle>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const disableAutoScrollRef = useRef(false)

  // State
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [pendingScrollToMessage, setPendingScrollToMessage] = useState<number | null>(null)
  const [scrolledPastUserMessage, setScrolledPastUserMessage] = useState<ClineMessage | null>(null)

  // Find all user feedback messages
  const userFeedbackMessages = useMemo(() => {
    return visibleMessages.filter((msg) => msg.say === 'user_feedback')
  }, [visibleMessages])

  // Track scroll position to detect which user message has been scrolled past
  const checkScrolledPastUserMessage = useCallback(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || userFeedbackMessages.length === 0) {
      setScrolledPastUserMessage(null)
      return
    }

    const containerRect = scrollContainer.getBoundingClientRect()
    let mostRecentScrolledPast: ClineMessage | null = null
    let foundAnyVisibleElement = false

    for (let i = userFeedbackMessages.length - 1; i >= 0; i--) {
      const msg = userFeedbackMessages[i]
      const messageElement = scrollContainer.querySelector(`[data-message-ts="${msg.ts}"]`) as HTMLElement

      if (messageElement) {
        foundAnyVisibleElement = true
        const messageRect = messageElement.getBoundingClientRect()
        const threshold = 10
        if (messageRect.bottom < containerRect.top + threshold) {
          mostRecentScrolledPast = msg
          break
        }
      } else {
        if (foundAnyVisibleElement) {
          mostRecentScrolledPast = msg
          break
        }
      }
    }

    setScrolledPastUserMessage(mostRecentScrolledPast)
  }, [userFeedbackMessages])

  // Use scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) {
      return
    }

    const findScrollableElement = () => {
      const virtuosoScroller = scrollContainer.querySelector('[data-virtuoso-scroller="true"]') as HTMLElement
      if (virtuosoScroller) {
        return virtuosoScroller
      }
      const scrollable = scrollContainer.querySelector('.scrollable') as HTMLElement
      return scrollable || scrollContainer
    }

    const scrollableElement = findScrollableElement()

    const handleScroll = () => {
      checkScrolledPastUserMessage()
    }

    scrollableElement.addEventListener('scroll', handleScroll, { passive: true })
    checkScrolledPastUserMessage()

    return () => {
      scrollableElement.removeEventListener('scroll', handleScroll)
    }
  }, [checkScrolledPastUserMessage])

  // Handler for when visible range changes in Virtuoso
  const handleRangeChanged = useCallback((_range: ListRange) => {
    // Range changed callback - kept for compatibility
  }, [])

  // Smooth scroll to bottom with debounce
  const scrollToBottomSmooth = useMemo(
    () =>
      (() => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null
        return () => {
          if (timeoutId) clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            virtuosoRef.current?.scrollTo({
              top: Number.MAX_SAFE_INTEGER,
              behavior: 'smooth',
            })
          }, 10)
        }
      })(),
    [],
  )

  // Auto scroll to bottom
  const scrollToBottomAuto = useCallback(() => {
    virtuosoRef.current?.scrollTo({
      top: Number.MAX_SAFE_INTEGER,
      behavior: 'auto',
    })
  }, [])

  // Scroll to specific message
  const scrollToMessage = useCallback(
    (messageIndex: number) => {
      setPendingScrollToMessage(messageIndex)

      const targetMessage = messages[messageIndex]
      if (!targetMessage) {
        setPendingScrollToMessage(null)
        return
      }

      const visibleIndex = visibleMessages.findIndex((msg) => msg.ts === targetMessage.ts)
      if (visibleIndex === -1) {
        setPendingScrollToMessage(null)
        return
      }

      let groupIndex = -1

      for (let i = 0; i < groupedMessages.length; i++) {
        const group = groupedMessages[i]
        if (Array.isArray(group)) {
          const messageInGroup = group.some((msg) => msg.ts === targetMessage.ts)
          if (messageInGroup) {
            groupIndex = i
            break
          }
        } else {
          if (group.ts === targetMessage.ts) {
            groupIndex = i
            break
          }
        }
      }

      if (groupIndex !== -1) {
        setPendingScrollToMessage(null)
        disableAutoScrollRef.current = true

        const isFirstUserMessage =
          groupIndex === 0 || !visibleMessages.slice(0, visibleIndex).some((msg) => msg.say === 'user_feedback')

        const stickyHeaderOffset = isFirstUserMessage ? 0 : STICKY_HEADER_HEIGHT

        requestAnimationFrame(() => {
          virtuosoRef.current?.scrollToIndex({
            index: groupIndex,
            align: 'start',
            behavior: 'smooth',
            offset: -stickyHeaderOffset,
          })
        })
      }
    },
    [messages, visibleMessages, groupedMessages],
  )

  // Toggle row expansion
  const toggleRowExpansion = useCallback(
    (ts: number) => {
      const isCollapsing = expandedRows[ts] ?? false
      const lastGroup = groupedMessages.at(-1)
      const isLast = Array.isArray(lastGroup) ? lastGroup[0].ts === ts : lastGroup?.ts === ts
      const secondToLastGroup = groupedMessages.at(-2)
      const isSecondToLast = Array.isArray(secondToLastGroup)
        ? secondToLastGroup[0].ts === ts
        : secondToLastGroup?.ts === ts

      const isLastCollapsedApiReq =
        isLast &&
        !Array.isArray(lastGroup) &&
        lastGroup?.say === 'api_req_started' &&
        !expandedRows[lastGroup.ts]

      setExpandedRows((prev) => ({
        ...prev,
        [ts]: !prev[ts],
      }))

      // Disable auto scroll when user expands row
      if (!isCollapsing) {
        disableAutoScrollRef.current = true
      }

      // Only scroll on collapse, never on expand
      if (isCollapsing && isAtBottom) {
        setTimeout(() => {
          scrollToBottomAuto()
        }, 0)
      }
      
      if (isCollapsing && (isLast || isSecondToLast)) {
        if (isSecondToLast && !isLastCollapsedApiReq) {
          return
        }
        setTimeout(() => {
          scrollToBottomAuto()
        }, 0)
      }
    },
    [groupedMessages, expandedRows, scrollToBottomAuto, isAtBottom, setExpandedRows],
  )

  // Handle row height change
  const handleRowHeightChange = useCallback(
    (isTaller: boolean) => {
      if (!disableAutoScrollRef.current) {
        if (isTaller) {
          scrollToBottomSmooth()
        } else {
          setTimeout(() => {
            scrollToBottomAuto()
          }, 0)
        }
      }
    },
    [scrollToBottomSmooth, scrollToBottomAuto],
  )

  // Auto-scroll on messages change
  useEffect(() => {
    if (!disableAutoScrollRef.current) {
      scrollToBottomSmooth()
      setTimeout(() => {
        if (!disableAutoScrollRef.current) {
          scrollToBottomAuto()
        }
      }, 40)
      setTimeout(() => {
        if (!disableAutoScrollRef.current) {
          scrollToBottomAuto()
        }
      }, 70)
    }
  }, [groupedMessages.length, scrollToBottomSmooth, scrollToBottomAuto])

  // Handle pending scroll to message
  useEffect(() => {
    if (pendingScrollToMessage !== null) {
      scrollToMessage(pendingScrollToMessage)
    }
  }, [pendingScrollToMessage, groupedMessages, scrollToMessage])

  // Update scroll button visibility
  useEffect(() => {
    if (!messages?.length) {
      setShowScrollToBottom(false)
    }
  }, [messages.length])

  // Handle wheel event for manual scroll detection
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY && event.deltaY < 0) {
        if (scrollContainerRef.current?.contains(event.target as Node)) {
          // User scrolled up
          disableAutoScrollRef.current = true
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return {
    virtuosoRef,
    scrollContainerRef,
    disableAutoScrollRef,
    scrollToBottomSmooth,
    scrollToBottomAuto,
    scrollToMessage,
    toggleRowExpansion,
    handleRowHeightChange,
    showScrollToBottom,
    setShowScrollToBottom,
    isAtBottom,
    setIsAtBottom,
    pendingScrollToMessage,
    setPendingScrollToMessage,
    scrolledPastUserMessage,
    handleRangeChanged,
  }
}
