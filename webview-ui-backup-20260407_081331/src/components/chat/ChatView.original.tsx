import { useState, useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import MessageList from './MessageList'
import ChatHeader from './ChatHeader'
import TaskSection from '../task/TaskSection'
import { useTaskState } from '../../hooks/useTaskState'
import vscode from '../../lib/vscode'
import { TaskEventUnion } from '../task/taskTypes'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

const ChatView = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m CodeLine, your AI coding assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 任务状态管理
  const {
    taskState,
    handleTaskEvent,
    startTask,
    cancelTask,
    retryStep,
    clearTask,
    setTaskDescription,
  } = useTaskState()

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 监听来自 VS Code 扩展的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      console.log('Received message from VSCode:', message)
      
      switch (message.command) {
        case 'taskResult':
          // 处理任务结果
          console.log('Task result:', message.result)
          // 可以根据需要将任务结果添加到消息中
          break
          
        case 'taskError':
          // 处理任务错误
          console.error('Task error:', message.error)
          // 显示错误消息
          break
          
        case 'task_event':
          // 处理任务事件
          if (message.event) {
            handleTaskEvent(message.event as TaskEventUnion)
          }
          break
          
        case 'task_progress':
          // 处理任务进度更新
          console.log('Task progress:', message.progress, message.message)
          // 可以更新进度显示
          break
          
        case 'history':
          // 处理历史记录
          if (message.messages) {
            setMessages(message.messages)
          }
          break
          
        case 'configUpdated':
          // 处理配置更新
          console.log('Config updated:', message.config)
          break
          
        case 'typing':
          // 处理打字指示器
          setIsProcessing(message.isTyping || false)
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [handleTaskEvent])

  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)
    
    // 通过 VS Code API 发送消息
    vscode.sendMessage(content)

    // 检查消息是否看起来像任务描述
    const isTaskDescription = content.length > 20 && (
      content.toLowerCase().includes('create') ||
      content.toLowerCase().includes('implement') ||
      content.toLowerCase().includes('fix') ||
      content.toLowerCase().includes('add') ||
      content.toLowerCase().includes('refactor') ||
      content.toLowerCase().includes('update')
    )
    
    if (isTaskDescription && vscode.isInVSCode()) {
      // 如果是任务描述，启动任务
      setTaskDescription(content)
      startTask(content)
      
      // 通过 VS Code API 执行任务
      vscode.executeTask(content)
    } else {
      // 模拟 AI 回复（如果没有 VS Code 环境）
      if (!vscode.isInVSCode()) {
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I received your message: "${content}". This is a simulated response. In the real implementation, this would connect to an AI model.`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
          setIsProcessing(false)
        }, 1000)
      }
    }
  }

  // 清除聊天记录
  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat cleared. How can I help you today?',
        timestamp: new Date()
      }
    ])
    vscode.clearChat()
  }

  // 处理任务取消
  const handleCancelTask = () => {
    if (vscode.isInVSCode()) {
      // 通过 VS Code API 取消任务
      // 注意：需要扩展支持取消命令
      vscode.postMessage({
        command: 'cancelTask',
        taskId: taskState.taskId
      })
    }
    cancelTask()
  }

  // 处理步骤重试
  const handleRetryStep = (stepIndex: number) => {
    if (vscode.isInVSCode()) {
      // 通过 VS Code API 重试步骤
      vscode.postMessage({
        command: 'retryStep',
        taskId: taskState.taskId,
        stepIndex
      })
    }
    retryStep(stepIndex)
  }

  // 处理清除任务
  const handleClearTask = () => {
    clearTask()
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader onClearChat={handleClearChat} />
      
      <div className="flex-1 overflow-auto">
        {/* 消息列表 */}
        <div className="p-4">
          <MessageList messages={messages} />
          {isProcessing && (
            <div className="flex items-center space-x-2 p-4 text-gray-400">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
              <span className="ml-2 text-sm">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* 任务区域 */}
        <TaskSection
          taskState={taskState}
          config={{
            showProgressBar: true,
            showStepsList: true,
            showEventsLog: true,
            autoScroll: true,
            maxVisibleSteps: 5,
            maxVisibleEvents: 10,
          }}
          onCancelTask={handleCancelTask}
          onRetryStep={handleRetryStep}
          onClearTask={handleClearTask}
        />
      </div>

      <div className="border-t border-border p-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isProcessing}
        />
      </div>
    </div>
  )
}

export default ChatView