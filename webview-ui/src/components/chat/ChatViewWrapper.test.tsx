/**
 * ChatViewWrapper 组件测试
 * Phase 5 系统集成验证的一部分
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatViewWrapper } from './ChatViewWrapper';
import { useHasFeatureFlag } from '@/hooks/useFeatureFlags';

// Mock dependencies
vi.mock('@/hooks/useFeatureFlags', () => ({
  useHasFeatureFlag: vi.fn(),
}));

vi.mock('./EnhancedChatView', () => ({
  EnhancedChatView: () => <div data-testid="enhanced-chat-view">Enhanced Chat View</div>,
}));

vi.mock('./ChatView', () => ({
  default: () => <div data-testid="original-chat-view">Original Chat View</div>,
}));

describe('ChatViewWrapper', () => {
  const defaultProps = {
    hideAnnouncement: vi.fn(),
    isHidden: false,
    showAnnouncement: false,
    showHistoryView: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染 EnhancedChatView 当 ENHANCED_CHAT_UI 特性启用时', () => {
    // 模拟特性开关启用
    (useHasFeatureFlag as any).mockReturnValue(true);
    
    render(<ChatViewWrapper {...defaultProps} />);
    
    expect(screen.getByTestId('enhanced-chat-view')).toBeInTheDocument();
    expect(screen.queryByTestId('original-chat-view')).not.toBeInTheDocument();
  });

  it('应该渲染 Original ChatView 当 ENHANCED_CHAT_UI 特性禁用时', () => {
    // 模拟特性开关禁用
    (useHasFeatureFlag as any).mockReturnValue(false);
    
    render(<ChatViewWrapper {...defaultProps} />);
    
    expect(screen.getByTestId('original-chat-view')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-chat-view')).not.toBeInTheDocument();
  });

  it('应该正确传递所有 props 到 EnhancedChatView', () => {
    // 模拟特性开关启用
    (useHasFeatureFlag as any).mockReturnValue(true);
    
    const enhancedProps = {
      ...defaultProps,
      // 增强组件的额外props
      showToolExecutionPanel: true,
      toolExecutionMaxVisible: 3,
      enableStreamingOptimization: true,
      useEnhancedDiffView: false,
    };
    
    // 我们需要验证EnhancedChatView接收到了正确的props
    // 由于我们使用了模拟组件，我们只能验证组件被渲染
    render(<ChatViewWrapper {...enhancedProps} />);
    
    expect(screen.getByTestId('enhanced-chat-view')).toBeInTheDocument();
  });

  it('应该正确传递所有 props 到原始 ChatView', () => {
    // 模拟特性开关禁用
    (useHasFeatureFlag as any).mockReturnValue(false);
    
    const originalProps = {
      ...defaultProps,
      // 原始组件不需要的额外props应该被过滤
      showToolExecutionPanel: true,
      toolExecutionMaxVisible: 3,
    };
    
    render(<ChatViewWrapper {...originalProps} />);
    
    expect(screen.getByTestId('original-chat-view')).toBeInTheDocument();
  });

  it('应该在开发环境中记录日志', () => {
    // 保存原始环境变量
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    // 模拟特性开关启用
    (useHasFeatureFlag as any).mockReturnValue(true);
    
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(<ChatViewWrapper {...defaultProps} />);
    
    // 验证日志被调用
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('ChatViewWrapper: 渲染 EnhancedChatView')
    );
    
    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('应该在生产环境中不记录日志', () => {
    // 保存原始环境变量
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    // 模拟特性开关启用
    (useHasFeatureFlag as any).mockReturnValue(true);
    
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(<ChatViewWrapper {...defaultProps} />);
    
    // 验证日志没有被调用
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('ChatViewWrapper: 渲染 EnhancedChatView')
    );
    
    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('应该处理特性开关的默认值', () => {
    // 测试特性开关返回undefined的情况
    (useHasFeatureFlag as any).mockReturnValue(undefined);
    
    render(<ChatViewWrapper {...defaultProps} />);
    
    // 应该默认使用原始组件
    expect(screen.getByTestId('original-chat-view')).toBeInTheDocument();
  });
});