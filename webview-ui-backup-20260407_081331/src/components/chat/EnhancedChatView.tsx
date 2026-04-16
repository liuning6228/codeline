/**
 * 增强版聊天视图
 * 集成工具执行状态显示和流式输出支持
 */

import { useState, useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import MessageList from './MessageList'
import ChatHeader from './ChatHeader'
import TaskSection from '../task/TaskSection'
import ToolExecutionManager, { useToolExecutionManager } from '../tools/ToolExecutionManager'
import { useTaskState } from '../../hooks/useTaskState'
import vscode from '../../lib/vscode'
import { TaskEventUnion } from '../task/taskTypes'
import { ToolExecutionState } from '../tools/ToolExecution'
import AutoApproveBar from './auto-approve-menu/AutoApproveBar'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    toolExecutions?: string[] // 关联的工具执行ID
    riskLevel?: number
    warnings?: string[]
    suggestions?: string[]
  }
}

const EnhancedChatView = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m CodeLine, your enhanced AI coding assistant with tool execution monitoring. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showToolExecutions, setShowToolExecutions] = useState(true)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configData, setConfigData] = useState<any>(null)
  const [autoApprovalSettings, setAutoApprovalSettings] = useState<any>(null)
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

  // 工具执行管理
  const {
    executions: toolExecutions,
    addExecution,
    updateExecution,
    removeExecution,
    handleProgressEvent,
    clearAll: clearAllToolExecutions
  } = useToolExecutionManager()

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 配置管理函数
  const loadConfig = () => {
    vscode.postMessage({ command: 'loadConfig' })
  }

  const saveConfig = (config: any) => {
    vscode.postMessage({ command: 'saveConfig', config })
  }

  const openConfigModal = () => {
    loadConfig()
    setShowConfigModal(true)
  }

  const closeConfigModal = () => {
    setShowConfigModal(false)
  }

  const handleConfigChange = (path: string, value: any) => {
    setConfigData((prev: any) => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 监听来自 VS Code 扩展的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      console.log('EnhancedChatView: Received message from VSCode:', message)
      
      switch (message.command) {
        case 'taskResult':
          console.log('Task result:', message.result)
          break
          
        case 'taskError':
          console.error('Task error:', message.error)
          break
          
        case 'task_event':
          if (message.event) {
            handleTaskEvent(message.event as TaskEventUnion)
          }
          break
          
        case 'task_progress':
          console.log('Task progress:', message.progress, message.message)
          break
          
        case 'history':
          if (message.messages) {
            setMessages(message.messages)
          }
          break
          
        case 'configUpdated':
          console.log('Config updated:', message.config)
          break
          
        case 'configLoaded':
          console.log('Config loaded:', message.config)
          setConfigData(message.config)
          break
          
        case 'configSaved':
          console.log('Config saved:', message.success)
          if (message.success) {
            vscode.postMessage({ command: 'showNotification', text: 'Configuration saved successfully' })
            setShowConfigModal(false)
          } else {
            vscode.postMessage({ command: 'showNotification', text: 'Failed to save configuration', type: 'error' })
          }
          break
          
        // 自动批准设置相关消息
        case 'autoApproveSettingsLoaded':
          console.log('Auto approve settings loaded:', message.settings)
          if (message.success) {
            setAutoApprovalSettings(message.settings)
          } else {
            console.error('Failed to load auto approve settings:', message.error)
          }
          break
          
        case 'autoApproveSettingsUpdated':
          console.log('Auto approve settings updated:', message.success)
          if (message.success) {
            vscode.postMessage({ command: 'showNotification', text: 'Auto-approval settings saved' })
            // 重新加载设置以获取最新版本
            vscode.postMessage({ command: 'loadAutoApproveSettings' })
          } else {
            vscode.postMessage({ command: 'showNotification', text: 'Failed to save auto-approval settings', type: 'error' })
          }
          break
          
        case 'autoApproveSettingsChanged':
          console.log('Auto approve settings changed:', message.settings)
          setAutoApprovalSettings(message.settings)
          break
          
        case 'typing':
          setIsProcessing(message.isTyping || false)
          break

        // 工具执行相关消息
        case 'tool_execution_start':
          console.log('Tool execution started:', message)
          handleToolExecutionStart(message)
          break
          
        case 'tool_execution_progress':
          console.log('Tool execution progress:', message)
          handleToolExecutionProgress(message)
          break
          
        case 'tool_execution_complete':
          console.log('Tool execution completed:', message)
          handleToolExecutionComplete(message)
          break
          
        case 'tool_execution_error':
          console.error('Tool execution error:', message)
          handleToolExecutionError(message)
          break

        // Bash工具特定消息
        case 'enhanced_bash_start':
        case 'enhanced_bash_parsed':
        case 'enhanced_bash_sandbox':
        case 'enhanced_bash_executing':
        case 'enhanced_bash_output':
        case 'enhanced_bash_complete':
        case 'enhanced_bash_error':
          console.log('Enhanced Bash event:', message)
          handleToolProgressEvent(message)
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [handleTaskEvent])

  // 加载自动批准设置
  useEffect(() => {
    vscode.postMessage({ command: 'loadAutoApproveSettings' })
  }, [])

  // 处理工具执行开始
  const handleToolExecutionStart = (message: any) => {
    const { executionId, toolId, toolName, command, params } = message
    
    const execution: ToolExecutionState = {
      executionId,
      toolId,
      toolName: toolName || getToolName(toolId),
      status: 'executing',
      progress: 0.1,
      message: `开始执行 ${toolName || toolId}`,
      startTime: new Date(),
      streaming: false,
      metadata: { command, params }
    }
    
    addExecution(execution)
    
    // 更新当前消息的元数据（如果有关联）
    updateCurrentMessageWithToolExecution(executionId)
  }

  // 处理工具执行进度
  const handleToolExecutionProgress = (message: any) => {
    const { executionId, progress, message: progressMessage, data } = message
    
    handleProgressEvent({
      executionId,
      type: 'tool_progress',
      progress: progress || 0,
      message: progressMessage || '正在执行...',
      data,
      timestamp: new Date()
    })
  }

  // 处理工具执行完成
  const handleToolExecutionComplete = (message: any) => {
    const { executionId, result, duration } = message
    
    const execution = toolExecutions.find(exec => exec.executionId === executionId)
    if (!execution) return
    
    updateExecution(executionId, {
      status: 'completed',
      progress: 1.0,
      message: `执行完成 (${duration || 0}ms)`,
      endTime: new Date(),
      duration,
      output: result,
      warnings: result?.warnings,
      suggestions: result?.suggestions,
      riskLevel: result?.riskLevel,
      metadata: { ...execution.metadata, result }
    })
    
    // 如果有关联的消息，更新消息内容
    updateMessageWithToolResult(executionId, result)
  }

  // 处理工具执行错误
  const handleToolExecutionError = (message: any) => {
    const { executionId, error } = message
    
    updateExecution(executionId, {
      status: 'failed',
      progress: 1.0,
      message: `执行失败: ${error || '未知错误'}`,
      endTime: new Date(),
      error,
      metadata: { error }
    })
  }

  // 处理工具进度事件（特定于EnhancedBashTool）
  const handleToolProgressEvent = (message: any) => {
    const { type, data, progress, message: eventMessage } = message
    
    // 从数据中提取执行ID
    const executionId = data?.executionId || 
                      `bash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    handleProgressEvent({
      executionId,
      type,
      progress: progress || getDefaultProgress(type),
      message: eventMessage || getDefaultMessage(type, data),
      data,
      timestamp: new Date()
    })
  }

  // 获取默认进度值
  const getDefaultProgress = (type: string): number => {
    switch (type) {
      case 'enhanced_bash_start': return 0.1
      case 'enhanced_bash_parsed': return 0.2
      case 'enhanced_bash_sandbox':
      case 'enhanced_bash_executing': return 0.3
      case 'enhanced_bash_output': return 0.5
      case 'enhanced_bash_complete':
      case 'enhanced_bash_error': return 1.0
      default: return 0
    }
  }

  // 获取默认消息
  const getDefaultMessage = (type: string, data: any): string => {
    switch (type) {
      case 'enhanced_bash_start':
        return `开始执行: ${data?.command?.substring(0, 50)}${data?.command?.length > 50 ? '...' : ''}`
      case 'enhanced_bash_parsed':
        return `命令解析: ${data?.semantic?.type || '未知类型'}`
      case 'enhanced_bash_sandbox':
        return `沙箱执行 (级别: ${data?.sandboxLevel || 'medium'})`
      case 'enhanced_bash_executing':
        return '直接执行命令'
      case 'enhanced_bash_output':
        return '接收命令输出'
      case 'enhanced_bash_complete':
        return `执行完成 (${data?.duration || 0}ms)`
      case 'enhanced_bash_error':
        return `执行失败: ${data?.error || '未知错误'}`
      default:
        return '工具执行中...'
    }
  }

  // 获取工具名称
  const getToolName = (toolId: string): string => {
    switch (toolId) {
      case 'enhanced-bash':
      case 'bash':
        return 'Bash 命令执行'
      case 'file':
        return '文件操作'
      case 'git':
        return 'Git 操作'
      case 'search':
        return '代码搜索'
      default:
        return `${toolId} 工具`
    }
  }

  // 更新当前消息的元数据以关联工具执行
  const updateCurrentMessageWithToolExecution = (executionId: string) => {
    setMessages(prev => {
      if (prev.length === 0) return prev
      
      const lastMessage = prev[prev.length - 1]
      if (lastMessage.role !== 'user') return prev
      
      const updatedMessages = [...prev]
      const lastIndex = updatedMessages.length - 1
      
      updatedMessages[lastIndex] = {
        ...lastMessage,
        metadata: {
          ...lastMessage.metadata,
          toolExecutions: [...(lastMessage.metadata?.toolExecutions || []), executionId]
        }
      }
      
      return updatedMessages
    })
  }

  // 更新消息以包含工具执行结果
  const updateMessageWithToolResult = (executionId: string, result: any) => {
    setMessages(prev => prev.map(message => {
      if (message.metadata?.toolExecutions?.includes(executionId)) {
        return {
          ...message,
          metadata: {
            ...message.metadata,
            riskLevel: result?.riskLevel,
            warnings: result?.warnings,
            suggestions: result?.suggestions
          }
        }
      }
      return message
    }))
  }

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
      content.toLowerCase().includes('update') ||
      content.toLowerCase().includes('run') ||
      content.toLowerCase().includes('execute') ||
      content.toLowerCase().includes('install')
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
    clearAllToolExecutions()
    vscode.clearChat()
  }

  // 处理任务取消
  const handleCancelTask = () => {
    if (vscode.isInVSCode()) {
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

  // 处理工具执行取消
  const handleToolCancel = (executionId: string) => {
    if (vscode.isInVSCode()) {
      vscode.postMessage({
        command: 'cancelToolExecution',
        executionId
      })
    }
  }

  // 处理工具执行重试
  const handleToolRetry = (executionId: string) => {
    if (vscode.isInVSCode()) {
      vscode.postMessage({
        command: 'retryToolExecution',
        executionId
      })
    }
  }

  // 处理工具执行清除
  const handleToolClear = (executionId: string) => {
    removeExecution(executionId)
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader 
        onClearChat={handleClearChat}
        additionalActions={
          <>
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded ${
                showToolExecutions 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setShowToolExecutions(!showToolExecutions)}
            >
              {showToolExecutions ? '隐藏工具执行' : '显示工具执行'}
            </button>
            <button
              type="button"
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 ml-2"
              onClick={openConfigModal}
            >
              ⚙️ 配置
            </button>
          </>
        }
      />
      
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
        
        {/* 工具执行状态区域 */}
        {showToolExecutions && toolExecutions.length > 0 && (
          <div className="border-t">
            <div className="p-4">
              <ToolExecutionManager
                initialExecutions={toolExecutions}
                autoClearCompleted={true}
                autoClearDelay={10000}
                maxVisibleExecutions={3}
                onCancel={handleToolCancel}
                onRetry={handleToolRetry}
                onClear={handleToolClear}
              />
            </div>
          </div>
        )}
        
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
      
      {/* 自动批准设置栏 */}
      <AutoApproveBar settings={autoApprovalSettings} />
      
      {/* 聊天输入 */}
      <div className="border-t">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isProcessing}
          placeholder="Ask CodeLine to run commands, analyze code, or help with development tasks..."
        />
      </div>
      
      {/* 配置模态框 */}
      {showConfigModal && configData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">⚙️ CodeLine 配置管理</h2>
                <button
                  onClick={closeConfigModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* 权限配置 */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">🔒 权限配置</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        默认权限模式
                      </label>
                      <select 
                        className="w-full border rounded p-2"
                        value={configData?.permissions?.defaultMode || 'auto'}
                        onChange={(e) => handleConfigChange('permissions.defaultMode', e.target.value)}
                      >
                        <option value="auto">自动决策</option>
                        <option value="always">总是允许</option>
                        <option value="ask">总是询问</option>
                        <option value="deny">总是拒绝</option>
                        <option value="sandbox">沙箱模式</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          checked={configData?.permissions?.enableClassifier || false}
                          onChange={(e) => handleConfigChange('permissions.enableClassifier', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">启用AI风险分类器</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        风险阈值 (0-10)
                      </label>
                      <input 
                        type="range"
                        min="0"
                        max="10"
                        value={configData?.permissions?.riskThreshold || 7}
                        onChange={(e) => handleConfigChange('permissions.riskThreshold', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        当前值: {configData?.permissions?.riskThreshold || 7}/10
                        (≥{configData?.permissions?.riskThreshold || 7} 自动拒绝)
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 工具配置 */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">🛠️ 工具配置</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        默认超时时间 (毫秒)
                      </label>
                      <input 
                        type="number"
                        value={configData?.tools?.default?.defaultTimeout || 30000}
                        onChange={(e) => handleConfigChange('tools.default.defaultTimeout', parseInt(e.target.value))}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          checked={configData?.tools?.default?.requireApproval || true}
                          onChange={(e) => handleConfigChange('tools.default.requireApproval', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">需要用户批准</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* UI配置 */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">🎨 UI配置</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          checked={configData?.ui?.darkTheme || true}
                          onChange={(e) => handleConfigChange('ui.darkTheme', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">暗色主题</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          checked={configData?.ui?.showProgress || true}
                          onChange={(e) => handleConfigChange('ui.showProgress', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">显示进度条</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        最大输出行数
                      </label>
                      <input 
                        type="number"
                        value={configData?.ui?.maxOutputLines || 1000}
                        onChange={(e) => handleConfigChange('ui.maxOutputLines', parseInt(e.target.value))}
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={closeConfigModal}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      saveConfig(configData);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded transition"
                  >
                    保存配置
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedChatView