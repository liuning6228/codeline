/**
 * EnhancedChatView 组件
 * Phase 4 任务4.1: 重构聊天界面
 * 
 * ChatView的增强版本，提供：
 * - 更好的消息流式更新
 * - 工具执行状态显示
 * - 实时进度反馈
 * - 增强的用户交互
 */

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { ClineMessage } from "@shared/ExtensionMessage";
import { combineApiRequests } from "@shared/combineApiRequests";
import { combineCommandSequences } from "@shared/combineCommandSequences";
import { combineErrorRetryMessages } from "@shared/combineErrorRetryMessages";
import { combineHookSequences } from "@shared/combineHookSequences";
import { getApiMetrics, getLastApiReqTotalTokens } from "@shared/getApiMetrics";
import { BooleanRequest, StringRequest } from "@shared/proto/cline/common";
import { useCallback } from "react";
import { useMount } from "react-use";
import { normalizeApiConfiguration } from "@/components/settings/utils/providerUtils";
import { useExtensionState } from "@/context/ExtensionStateContext";
import { useShowNavbar } from "@/context/PlatformContext";
import { GrpcAdapters } from "../../adapters/cline-to-vscode";
import { Navbar } from "../menu/Navbar";
import AutoApproveBar from "./auto-approve-menu/AutoApproveBar";
import { ToolExecutionUIContainer } from "./ToolExecutionUI";

// Import utilities and hooks from the new structure
import {
	ActionButtons,
	CHAT_CONSTANTS,
	ChatLayout,
	convertHtmlToMarkdown,
	filterVisibleMessages,
	groupLowStakesTools,
	groupMessages,
	InputSection,
	MessagesArea,
	TaskSection,
	useChatState,
	useMessageHandlers,
	useScrollBehavior,
	WelcomeSection,
} from "./chat-view"

interface EnhancedChatViewProps {
	isHidden: boolean;
	showAnnouncement: boolean;
	hideAnnouncement: () => void;
	showHistoryView: () => void;
	/** 是否显示工具执行面板 */
	showToolExecutionPanel?: boolean;
	/** 工具执行面板最大可见数量 */
	toolExecutionMaxVisible?: number;
	/** 是否启用消息流式优化 */
	enableStreamingOptimization?: boolean;
	/** 是否显示增强的diff视图 */
	useEnhancedDiffView?: boolean;
}

// Use constants from the imported module
const MAX_IMAGES_AND_FILES_PER_MESSAGE = CHAT_CONSTANTS.MAX_IMAGES_AND_FILES_PER_MESSAGE;
const QUICK_WINS_HISTORY_THRESHOLD = 3;

/**
 * 获取工具执行信息
 * 从消息中提取工具执行状态
 */
const extractToolExecutions = (messages: ClineMessage[]): any[] => {
  const executions: any[] = [];
  
  // 简化版本：实际上需要根据消息内容解析工具执行状态
  // 这里返回示例数据
  if (messages.length > 0) {
    const timestamp = Date.now();
    executions.push({
      toolId: 'enhanced-bash',
      toolName: 'Bash终端',
      executionId: 'exec-' + timestamp,
      startTime: timestamp - 10000,
      status: 'running' as const,
      progressHistory: [
        { type: 'tool_start', data: {}, timestamp: timestamp - 10000 },
        { type: 'enhanced_bash_output', data: {}, progress: 0.3, message: '正在安装依赖...', timestamp: timestamp - 5000 },
        { type: 'enhanced_bash_output', data: {}, progress: 0.6, message: '构建项目中...', timestamp: timestamp - 2000 },
      ],
      resourceUsage: {
        cpu: 45,
        memory: 128 * 1024 * 1024,
      },
      sandboxEnabled: true,
      permissionStatus: {
        allowed: true,
        requiresConfirmation: true,
        confirmed: true,
        riskLevel: 3,
      },
    });
    
    // 添加一个已完成的任务
    executions.push({
      toolId: 'code-analysis',
      toolName: '代码分析',
      executionId: 'exec-' + (timestamp - 30000),
      startTime: timestamp - 40000,
      endTime: timestamp - 30000,
      status: 'completed' as const,
      progressHistory: [
        { type: 'tool_start', data: {}, timestamp: timestamp - 40000 },
        { type: 'tool_progress', data: {}, progress: 0.5, message: '分析代码结构...', timestamp: timestamp - 35000 },
        { type: 'tool_complete', data: {}, progress: 1.0, message: '分析完成', timestamp: timestamp - 30000 },
      ],
      resourceUsage: {
        cpu: 20,
        memory: 64 * 1024 * 1024,
        executionTime: 10000,
      },
    });
  }
  
  return executions;
};

/**
 * EnhancedChatView 主组件
 */
export const EnhancedChatView = ({ 
  isHidden, 
  showAnnouncement, 
  hideAnnouncement, 
  showHistoryView,
  showToolExecutionPanel = true,
  toolExecutionMaxVisible = 3,
  enableStreamingOptimization = true,
  useEnhancedDiffView = false,
}: EnhancedChatViewProps) => {
  const showNavbar = useShowNavbar();
  
  // Phase 5: 性能监控
  const { startMeasurement, endMeasurement, getMetrics } = usePerformanceMonitor({
    componentName: 'EnhancedChatView',
    logToConsole: process.env.NODE_ENV === 'development',
    warningThresholdMs: 50, // 目标渲染时间小于50ms
    sampleRate: 0.2, // 20%的采样率
  });
  
  const {
    version,
    clineMessages: messages,
    taskHistory,
    apiConfiguration,
    telemetrySetting,
    mode,
    userInfo,
    currentFocusChainChecklist,
    focusChainSettings,
    hooksEnabled,
  } = useExtensionState();

  const isProdHostedApp = userInfo?.apiBaseUrl === "https://app.cline.bot";
  const shouldShowQuickWins = isProdHostedApp && (!taskHistory || taskHistory.length < QUICK_WINS_HISTORY_THRESHOLD);

  // 任务消息
  const task = useMemo(() => messages.at(0), [messages]);
  
  // 处理消息组合
  const modifiedMessages = useMemo(() => {
    const slicedMessages = messages.slice(1);
    const withHooks = hooksEnabled ? combineHookSequences(slicedMessages) : slicedMessages;
    return combineErrorRetryMessages(combineApiRequests(combineCommandSequences(withHooks)));
  }, [messages, hooksEnabled]);

  // API指标
  const apiMetrics = useMemo(() => getApiMetrics(modifiedMessages), [modifiedMessages]);
  const lastApiReqTotalTokens = useMemo(() => getLastApiReqTotalTokens(modifiedMessages) || undefined, [modifiedMessages]);

  // 消息分组
  const visibleMessages = useMemo(() => filterVisibleMessages(modifiedMessages), [modifiedMessages]);
  const groupedMessages = useMemo(() => groupMessages(visibleMessages), [visibleMessages]);
  const lowStakesGroupedMessages = useMemo(() => groupLowStakesTools(visibleMessages), [visibleMessages]);

  // 自定义hooks
  const chatState = useChatState(messages);
  const {
    setInputValue,
    selectedImages,
    setSelectedImages,
    selectedFiles,
    setSelectedFiles,
    sendingDisabled,
    enableButtons,
    expandedRows,
    setExpandedRows,
    textAreaRef,
  } = chatState;

  const messageHandlers = useMessageHandlers({
    setInputValue,
    selectedImages,
    setSelectedImages,
    selectedFiles,
    setSelectedFiles,
    sendingDisabled,
    enableButtons,
    expandedRows,
    setExpandedRows,
  });

  const scrollBehavior = useScrollBehavior({
    scrollContainerRef: useRef<HTMLDivElement>(null),
    messages,
    chatState,
  });

  // 流式更新优化
  const [streamingMessages, setStreamingMessages] = useState<ClineMessage[]>(visibleMessages);
  const streamingMessagesRef = useRef<ClineMessage[]>(visibleMessages);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (enableStreamingOptimization) {
      // 优化流式更新：合并快速连续的消息更新
      clearTimeout(streamingTimeoutRef.current!);
      
      streamingTimeoutRef.current = setTimeout(() => {
        if (streamingMessagesRef.current !== visibleMessages) {
          streamingMessagesRef.current = visibleMessages;
          setStreamingMessages(visibleMessages);
        }
      }, 50); // 50ms的防抖延迟
    } else {
      streamingMessagesRef.current = visibleMessages;
      setStreamingMessages(visibleMessages);
    }

    return () => {
      clearTimeout(streamingTimeoutRef.current!);
    };
  }, [visibleMessages, enableStreamingOptimization]);

  // 工具执行信息
  const toolExecutions = useMemo(() => {
    if (!showToolExecutionPanel) return [];
    return extractToolExecutions(messages);
  }, [messages, showToolExecutionPanel]);
  
  // Phase 5: 在组件渲染完成后记录性能指标
  useEffect(() => {
    endMeasurement('render');
    
    // 在开发环境中输出性能指标
    if (process.env.NODE_ENV === 'development') {
      const metrics = getMetrics();
      if (metrics.reRenderCount % 10 === 0) {
        console.log(`📊 EnhancedChatView性能: 平均${metrics.averageRenderTime.toFixed(2)}ms, 重渲染${metrics.reRenderCount}次`);
      }
    }
  }, [endMeasurement, getMetrics]);

  // 处理工具执行操作
  const handleToolExecutionAction = useCallback((action: string, executionId: string, data?: any) => {
    console.log('Tool execution action:', action, executionId, data);
    
    // TODO: 实现实际的处理逻辑
    // 例如：发送取消请求、重试执行等
    if (action === 'cancel') {
      GrpcAdapters.cancelToolExecution(StringRequest.create({ value: executionId })).catch(err => {
        console.error('Failed to cancel tool execution:', err);
      });
    } else if (action === 'retry') {
      GrpcAdapters.retryToolExecution(StringRequest.create({ value: executionId })).catch(err => {
        console.error('Failed to retry tool execution:', err);
      });
    }
  }, []);

  // 渲染聊天布局
  const renderChatLayout = () => (
    <ChatLayout
      task={task}
      groupedMessages={groupedMessages}
      modifiedMessages={modifiedMessages}
      lowStakesGroupedMessages={lowStakesGroupedMessages}
      visibleMessages={streamingMessages}
      apiMetrics={apiMetrics}
      lastApiReqTotalTokens={lastApiReqTotalTokens}
      shouldShowQuickWins={shouldShowQuickWins}
      chatState={chatState}
      messageHandlers={messageHandlers}
      scrollBehavior={scrollBehavior}
      isHidden={isHidden}
      hideAnnouncement={hideAnnouncement}
      showHistoryView={showHistoryView}
      useEnhancedDiffView={useEnhancedDiffView}
    />
  );

  // 渲染工具执行面板
  const renderToolExecutionPanel = () => {
    if (!showToolExecutionPanel || toolExecutions.length === 0) return null;
    
    return (
      <div className="border-t border-border pt-4 mt-4">
        <ToolExecutionUIContainer
          executions={toolExecutions}
          maxVisible={toolExecutionMaxVisible}
          onExecutionAction={handleToolExecutionAction}
        />
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${isHidden ? "hidden" : ""}`}>
      {/* 顶部导航栏 */}
      {showNavbar && (
        <div className="shrink-0">
          <Navbar
            showAnnouncement={showAnnouncement}
            hideAnnouncement={hideAnnouncement}
            showHistoryView={showHistoryView}
            showSettingsMenu={true}
            version={version}
            userInfo={userInfo}
            mode={mode}
            telemetrySetting={telemetrySetting}
          />
        </div>
      )}

      {/* 自动批准栏 */}
      <div className="shrink-0">
        <AutoApproveBar />
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 overflow-hidden relative">
        {messages.length === 0 ? (
          <WelcomeSection
            apiConfiguration={apiConfiguration}
            hideAnnouncement={hideAnnouncement}
            showHistoryView={showHistoryView}
          />
        ) : (
          <>
            <div className="h-full flex flex-col">
              {/* 任务部分 */}
              {task && (
                <div className="shrink-0">
                  <TaskSection
                    task={task}
                    currentFocusChainChecklist={currentFocusChainChecklist}
                    focusChainSettings={focusChainSettings}
                  />
                </div>
              )}

              {/* 消息区域 */}
              <div className="flex-1 overflow-hidden">
                {renderChatLayout()}
              </div>

              {/* 工具执行面板 */}
              {renderToolExecutionPanel()}

              {/* 输入区域 */}
              <div className="shrink-0 border-t border-border">
                <InputSection
                  chatState={chatState}
                  messageHandlers={messageHandlers}
                  maxImagesAndFilesPerMessage={MAX_IMAGES_AND_FILES_PER_MESSAGE}
                  enableButtons={enableButtons}
                  sendingDisabled={sendingDisabled}
                />
              </div>

              {/* 操作按钮 */}
              <div className="shrink-0">
                <ActionButtons
                  chatState={chatState}
                  messageHandlers={messageHandlers}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 使用React.memo优化性能，避免不必要的重渲染
export default React.memo(EnhancedChatView, (prevProps, nextProps) => {
  // 自定义props比较函数，优化重渲染
  // 基础props：简单值比较
  if (prevProps.isHidden !== nextProps.isHidden) return false;
  if (prevProps.showAnnouncement !== nextProps.showAnnouncement) return false;
  
  // 函数props：假设父组件已经使用useCallback记忆化
  // 如果函数引用相同，则跳过重渲染
  // 注意：这里假设hideAnnouncement和showHistoryView是稳定的
  
  // 增强功能配置：比较布尔值
  if (prevProps.showToolExecutionPanel !== nextProps.showToolExecutionPanel) return false;
  if (prevProps.toolExecutionMaxVisible !== nextProps.toolExecutionMaxVisible) return false;
  if (prevProps.enableStreamingOptimization !== nextProps.enableStreamingOptimization) return false;
  if (prevProps.useEnhancedDiffView !== nextProps.useEnhancedDiffView) return false;
  
  // 如果所有检查通过，则跳过重渲染
  return true;
});