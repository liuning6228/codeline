/**
 * ChatViewWrapper 组件
 * 
 * 根据特性开关选择渲染 EnhancedChatView 或 ChatView
 * Phase 5 系统集成的一部分
 */

import React from 'react';
import { useHasFeatureFlag } from '@/hooks/useFeatureFlag';
import { FeatureFlag } from '@shared/services/feature-flags/feature-flags';
import ChatView from './ChatView';
import EnhancedChatView from './EnhancedChatView';

interface ChatViewWrapperProps {
  isHidden: boolean;
  showAnnouncement: boolean;
  hideAnnouncement: () => void;
  showHistoryView: () => void;
}

/**
 * 判断是否应该使用增强聊天界面
 * 逻辑：如果特性开关启用，则使用EnhancedChatView
 */
const shouldUseEnhancedChatView = (): boolean => {
  // 首先检查特性开关
  const featureFlagEnabled = useHasFeatureFlag(FeatureFlag.ENHANCED_CHAT_UI);
  
  // 也可以检查环境变量作为后备方案
  const envEnabled = process.env.REACT_APP_ENABLE_ENHANCED_CHAT === 'true';
  
  return featureFlagEnabled || envEnabled;
};

/**
 * ChatView包装器组件
 * 根据配置选择渲染哪个版本的聊天界面
 */
const ChatViewWrapper: React.FC<ChatViewWrapperProps> = (props) => {
  const useEnhancedChat = shouldUseEnhancedChatView();
  
  // 在开发环境中记录选择，便于调试
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎛️ ChatViewWrapper: ${useEnhancedChat ? '使用EnhancedChatView' : '使用ChatView'}`);
  }
  
  if (useEnhancedChat) {
    return (
      <EnhancedChatView
        {...props}
        // 传递EnhancedChatView的增强配置
        showToolExecutionPanel={true}
        toolExecutionMaxVisible={3}
        enableStreamingOptimization={true}
        useEnhancedDiffView={true}
      />
    );
  }
  
  // 默认使用原始ChatView
  return <ChatView {...props} />;
};

export default ChatViewWrapper;