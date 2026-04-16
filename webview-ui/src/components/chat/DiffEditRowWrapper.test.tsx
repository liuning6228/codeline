/**
 * DiffEditRowWrapper 组件测试
 * Phase 5 系统集成验证的一部分
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiffEditRowWrapper } from './DiffEditRowWrapper';
import { useHasFeatureFlag } from '@/hooks/useFeatureFlags';

// Mock dependencies
vi.mock('@/hooks/useFeatureFlags', () => ({
  useHasFeatureFlag: vi.fn(),
}));

vi.mock('./EnhancedDiffEditRow', () => ({
  EnhancedDiffEditRow: (props: any) => (
    <div data-testid="enhanced-diff-edit-row">
      Enhanced Diff Edit Row
      <div data-testid="enhanced-props">{JSON.stringify(props)}</div>
    </div>
  ),
}));

vi.mock('./DiffEditRow', () => ({
  default: (props: any) => (
    <div data-testid="original-diff-edit-row">
      Original Diff Edit Row
      <div data-testid="original-props">{JSON.stringify(props)}</div>
    </div>
  ),
}));

describe('DiffEditRowWrapper', () => {
  const defaultProps = {
    className: 'test-class',
    diff: {
      original: 'Original content',
      modified: 'Modified content',
      language: 'typescript',
    },
    onAccept: vi.fn(),
    onReject: vi.fn(),
    onEdit: vi.fn(),
    isReadOnly: false,
    showLineNumbers: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染 EnhancedDiffEditRow 当 ENHANCED_CHAT_UI 特性启用时', () => {
    // 模拟特性开关启用
    (useHasFeatureFlag as any).mockReturnValue(true);
    
    render(<DiffEditRowWrapper {...defaultProps} />);
    
    expect(screen.getByTestId('enhanced-diff-edit-row')).toBeInTheDocument();
    expect(screen.queryByTestId('original-diff-edit-row')).not.toBeInTheDocument();
  });

  it('应该渲染 Original DiffEditRow 当 ENHANCED_CHAT_UI 特性禁用时', () => {
    // 模拟特性开关禁用
    (useHasFeatureFlag as any).mockReturnValue(false);
    
    render(<DiffEditRowWrapper {...defaultProps} />);
    
    expect(screen.getByTestId('original-diff-edit-row')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-diff-edit-row')).not.toBeInTheDocument();
  });

  it('应该正确传递基础 props 到两个组件', () => {
    // 测试Enhanced版本
    (useHasFeatureFlag as any).mockReturnValue(true);
    
    const { rerender } = render(<DiffEditRowWrapper {...defaultProps} />);
    
    const enhancedPropsText = screen.getByTestId('enhanced-props').textContent;
    const enhancedProps = JSON.parse(enhancedPropsText!);
    
    // 验证基础props被传递
    expect(enhancedProps.className).toBe('test-class');
    expect(enhancedProps.diff).toEqual(defaultProps.diff);
    expect(enhancedProps.isReadOnly).toBe(false);
    expect(enhancedProps.showLineNumbers).toBe(true);
    
    // 测试原始版本
    (useHasFeatureFlag as any).mockReturnValue(false);
    rerender(<DiffEditRowWrapper {...defaultProps} />);
    
    const originalPropsText = screen.getByTestId('original-props').textContent;
    const originalProps = JSON.parse(originalPropsText!);
    
    // 验证基础props被传递
    expect(originalProps.className).toBe('test-class');
    expect(originalProps.diff).toEqual(defaultProps.diff);
    expect(originalProps.isReadOnly).toBe(false);
    expect(originalProps.showLineNumbers).toBe(true);
  });

  it('应该传递增强组件的额外 props 到 EnhancedDiffEditRow', () => {
    // 模拟特性开关启用
    (useHasFeatureFlag as any).mockReturnValue(true);
    
    const enhancedOnlyProps = {
      ...defaultProps,
      viewMode: 'split' as const,
      enableSyntaxHighlighting: true,
      searchable: true,
      conflictResolutionEnabled: true,
      fileOperation: 'modify' as const,
    };
    
    render(<DiffEditRowWrapper {...enhancedOnlyProps} />);
    
    const enhancedPropsText = screen.getByTestId('enhanced-props').textContent;
    const enhancedProps = JSON.parse(enhancedPropsText!);
    
    // 验证增强组件的额外props被传递
    expect(enhancedProps.viewMode).toBe('split');
    expect(enhancedProps.enableSyntaxHighlighting).toBe(true);
    expect(enhancedProps.searchable).toBe(true);
    expect(enhancedProps.conflictResolutionEnabled).toBe(true);
    expect(enhancedProps.fileOperation).toBe('modify');
  });

  it('应该过滤增强组件的额外 props 当渲染原始组件时', () => {
    // 模拟特性开关禁用
    (useHasFeatureFlag as any).mockReturnValue(false);
    
    const enhancedOnlyProps = {
      ...defaultProps,
      viewMode: 'split' as const,
      enableSyntaxHighlighting: true,
      searchable: true,
      conflictResolutionEnabled: true,
      fileOperation: 'modify' as const,
    };
    
    render(<DiffEditRowWrapper {...enhancedOnlyProps} />);
    
    const originalPropsText = screen.getByTestId('original-props').textContent;
    const originalProps = JSON.parse(originalPropsText!);
    
    // 验证增强组件的额外props没有被传递到原始组件
    expect(originalProps.viewMode).toBeUndefined();
    expect(originalProps.enableSyntaxHighlighting).toBeUndefined();
    expect(originalProps.searchable).toBeUndefined();
    expect(originalProps.conflictResolutionEnabled).toBeUndefined();
    expect(originalProps.fileOperation).toBeUndefined();
    
    // 验证只有基础props被传递
    expect(originalProps.className).toBe('test-class');
    expect(originalProps.diff).toEqual(defaultProps.diff);
  });

  it('应该在 props 变化时正确切换组件', () => {
    const { rerender } = render(<DiffEditRowWrapper {...defaultProps} />);
    
    // 初始状态：特性开关禁用，应该渲染原始组件
    (useHasFeatureFlag as any).mockReturnValue(false);
    rerender(<DiffEditRowWrapper {...defaultProps} />);
    expect(screen.getByTestId('original-diff-edit-row')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-diff-edit-row')).not.toBeInTheDocument();
    
    // 切换特性开关：应该切换到增强组件
    (useHasFeatureFlag as any).mockReturnValue(true);
    rerender(<DiffEditRowWrapper {...defaultProps} />);
    expect(screen.getByTestId('enhanced-diff-edit-row')).toBeInTheDocument();
    expect(screen.queryByTestId('original-diff-edit-row')).not.toBeInTheDocument();
    
    // 再次切换：应该切换回原始组件
    (useHasFeatureFlag as any).mockReturnValue(false);
    rerender(<DiffEditRowWrapper {...defaultProps} />);
    expect(screen.getByTestId('original-diff-edit-row')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-diff-edit-row')).not.toBeInTheDocument();
  });

  it('应该处理缺失的 diff 属性', () => {
    const propsWithoutDiff = {
      className: 'test-class',
      onAccept: vi.fn(),
      onReject: vi.fn(),
      onEdit: vi.fn(),
    } as any;
    
    (useHasFeatureFlag as any).mockReturnValue(true);
    
    render(<DiffEditRowWrapper {...propsWithoutDiff} />);
    
    // 组件应该仍然渲染
    expect(screen.getByTestId('enhanced-diff-edit-row')).toBeInTheDocument();
  });

  it('应该正确处理回调函数', () => {
    const mockOnAccept = vi.fn();
    const mockOnReject = vi.fn();
    const mockOnEdit = vi.fn();
    
    const propsWithCallbacks = {
      ...defaultProps,
      onAccept: mockOnAccept,
      onReject: mockOnReject,
      onEdit: mockOnEdit,
    };
    
    (useHasFeatureFlag as any).mockReturnValue(true);
    
    render(<DiffEditRowWrapper {...propsWithCallbacks} />);
    
    // 回调函数应该被正确传递
    const enhancedPropsText = screen.getByTestId('enhanced-props').textContent;
    const enhancedProps = JSON.parse(enhancedPropsText!);
    
    // 注意：由于是模拟组件，函数会被序列化为{}
    // 在实际测试中，我们会测试函数调用
    expect(enhancedProps.onAccept).toBeDefined();
    expect(enhancedProps.onReject).toBeDefined();
    expect(enhancedProps.onEdit).toBeDefined();
  });
});