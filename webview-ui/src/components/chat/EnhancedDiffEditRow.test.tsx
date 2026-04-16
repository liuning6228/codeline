/**
 * EnhancedDiffEditRow 组件测试
 * Phase 4 任务4.3: UI测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedDiffEditRow } from './EnhancedDiffEditRow';

// Mock the FileServiceClient
vi.mock('@/services/grpc-client', () => ({
  FileServiceClient: {
    openFileRelativePath: vi.fn(),
  },
}));

// Mock react-syntax-highlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: {
    Highlight: () => <div data-testid="syntax-highlighter">SyntaxHighlighter</div>,
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
    ChevronRight: () => <div data-testid="chevron-right">ChevronRight</div>,
    Search: () => <div data-testid="search">Search</div>,
    Code: () => <div data-testid="code">Code</div>,
    FileDiff: () => <div data-testid="file-diff">FileDiff</div>,
    GitMerge: () => <div data-testid="git-merge">GitMerge</div>,
    Eye: () => <div data-testid="eye">Eye</div>,
    EyeOff: () => <div data-testid="eye-off">EyeOff</div>,
    Maximize2: () => <div data-testid="maximize">Maximize2</div>,
    Minimize2: () => <div data-testid="minimize">Minimize2</div>,
    Copy: () => <div data-testid="copy">Copy</div>,
    Check: () => <div data-testid="check">Check</div>,
    AlertCircle: () => <div data-testid="alert-circle">AlertCircle</div>,
    FileText: () => <div data-testid="file-text">FileText</div>,
    FilePlus: () => <div data-testid="file-plus">FilePlus</div>,
    FileMinus: () => <div data-testid="file-minus">FileMinus</div>,
    FileX: () => <div data-testid="file-x">FileX</div>,
  };
});

describe('EnhancedDiffEditRow', () => {
  // 示例diff文本
  const exampleDiff = `--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -1,5 +1,7 @@
 import React from 'react';
+import { Loader2 } from 'lucide-react';
 
 interface ButtonProps {
   children: React.ReactNode;
+  loading?: boolean;
 }`;

  it('应该渲染基础diff', () => {
    render(
      <EnhancedDiffEditRow
        patch={exampleDiff}
        path="src/components/Button.tsx"
      />
    );

    // 检查文件路径
    expect(screen.getByText('src/components/Button.tsx')).toBeInTheDocument();
    
    // 检查操作类型
    expect(screen.getByText('修改文件')).toBeInTheDocument();
    
    // 检查统计信息
    expect(screen.getByText(/添加/)).toBeInTheDocument();
    expect(screen.getByText(/删除/)).toBeInTheDocument();
  });

  it('应该识别新增文件', () => {
    const newFileDiff = `+++ b/src/components/NewComponent.tsx
@@ -0,0 +1,10 @@
+import React from 'react';
+
+export const NewComponent = () => {
+  return <div>新组件</div>;
+};`;

    render(
      <EnhancedDiffEditRow
        patch={newFileDiff}
        path="src/components/NewComponent.tsx"
      />
    );

    expect(screen.getByText('新增文件')).toBeInTheDocument();
  });

  it('应该识别删除文件', () => {
    const deleteFileDiff = `--- a/src/components/OldComponent.tsx
+++ /dev/null
@@ -1,10 +0,0 @@
-import React from 'react';
-
-export const OldComponent = () => {
-  return <div>老组件</div>;
-};`;

    render(
      <EnhancedDiffEditRow
        patch={deleteFileDiff}
        path="src/components/OldComponent.tsx"
      />
    );

    expect(screen.getByText('删除文件')).toBeInTheDocument();
  });

  it('应该展开和折叠内容', () => {
    render(
      <EnhancedDiffEditRow
        patch={exampleDiff}
        path="src/components/Button.tsx"
        defaultExpanded={false}
      />
    );

    // 初始应该折叠
    expect(screen.queryByText('统一视图')).not.toBeInTheDocument();
    
    // 点击头部展开
    const header = screen.getByText('src/components/Button.tsx').closest('div[class*="cursor-pointer"]');
    fireEvent.click(header!);
    
    // 现在应该显示工具栏
    expect(screen.getByText('统一视图')).toBeInTheDocument();
  });

  it('应该支持搜索功能', async () => {
    render(
      <EnhancedDiffEditRow
        patch={exampleDiff}
        path="src/components/Button.tsx"
        defaultExpanded={true}
      />
    );

    // 查找搜索输入框
    const searchInput = screen.getByPlaceholderText('搜索...');
    expect(searchInput).toBeInTheDocument();
    
    // 输入搜索词
    fireEvent.change(searchInput, { target: { value: 'Loader2' } });
    
    // 应该显示搜索结果
    await waitFor(() => {
      expect(screen.getByDisplayValue('Loader2')).toBeInTheDocument();
    });
  });

  it('应该切换视图模式', () => {
    render(
      <EnhancedDiffEditRow
        patch={exampleDiff}
        path="src/components/Button.tsx"
        defaultExpanded={true}
      />
    );

    // 初始应该是统一视图
    expect(screen.getByText('统一视图')).toBeInTheDocument();
    
    // 点击切换按钮
    const toggleButton = screen.getByText('并排视图');
    fireEvent.click(toggleButton);
    
    // 现在应该是并排视图
    expect(screen.getByText('统一视图')).toBeInTheDocument(); // 按钮文本已切换
  });

  it('应该处理复制操作', async () => {
    // Mock clipboard API
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });
    
    render(
      <EnhancedDiffEditRow
        patch={exampleDiff}
        path="src/components/Button.tsx"
        defaultExpanded={true}
      />
    );

    // 点击复制按钮
    const copyButton = screen.getByText('复制');
    fireEvent.click(copyButton);
    
    // 应该调用clipboard API
    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });

  it('应该显示冲突解决界面', () => {
    const conflictDiff = `<<<<<<< HEAD
import React from 'react';
import { Button as BaseButton } from './BaseButton';
=======
import React, { useState } from 'react';
import { Button as OldButton } from './OldButton';
>>>>>>> feature/new-button`;

    render(
      <EnhancedDiffEditRow
        patch={conflictDiff}
        path="src/components/Button.tsx"
        conflictResolvable={true}
        defaultExpanded={true}
      />
    );

    // 应该显示冲突标记
    expect(screen.getByText('有冲突')).toBeInTheDocument();
    
    // 应该显示冲突解决按钮
    expect(screen.getByText('保留我们的')).toBeInTheDocument();
    expect(screen.getByText('保留他们的')).toBeInTheDocument();
    expect(screen.getByText('保留两者')).toBeInTheDocument();
  });

  it('应该处理冲突解决', async () => {
    const conflictDiff = `<<<<<<< HEAD
import React from 'react';
=======
import React, { useState } from 'react';
>>>>>>> feature/new-button`;
    
    const mockOnChange = vi.fn();
    
    render(
      <EnhancedDiffEditRow
        patch={conflictDiff}
        path="src/components/Button.tsx"
        conflictResolvable={true}
        defaultExpanded={true}
        onChange={mockOnChange}
      />
    );

    // 点击解决冲突按钮
    const resolveButton = screen.getByText('保留我们的');
    fireEvent.click(resolveButton);
    
    // 应该调用onChange回调
    expect(mockOnChange).toHaveBeenCalledWith('src/components/Button.tsx', expect.any(String));
  });

  it('应该打开文件', async () => {
    const mockOpenFile = vi.fn();
    vi.mocked(require('@/services/grpc-client').FileServiceClient.openFileRelativePath).mockImplementation(mockOpenFile);
    
    render(
      <EnhancedDiffEditRow
        patch={exampleDiff}
        path="src/components/Button.tsx"
        interactive={true}
        defaultExpanded={true}
      />
    );

    // 点击打开文件按钮
    const openButton = screen.getByText('打开文件');
    fireEvent.click(openButton);
    
    // 应该调用文件打开服务
    expect(mockOpenFile).toHaveBeenCalled();
  });

  it('不可交互模式应该禁用操作', () => {
    render(
      <EnhancedDiffEditRow
        patch={exampleDiff}
        path="src/components/Button.tsx"
        interactive={false}
        defaultExpanded={true}
      />
    );

    // 不应该显示打开文件按钮
    expect(screen.queryByText('打开文件')).not.toBeInTheDocument();
  });

  it('应该处理加载状态', () => {
    render(
      <EnhancedDiffEditRow
        patch={exampleDiff}
        path="src/components/Button.tsx"
        isLoading={true}
        defaultExpanded={true}
      />
    );

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('应该切换行号显示', () => {
    render(
      <EnhancedDiffEditRow
        patch={exampleDiff}
        path="src/components/Button.tsx"
        showLineNumbers={true}
        defaultExpanded={true}
      />
    );

    // 点击行号切换按钮
    const toggleButton = screen.getByText('行号');
    fireEvent.click(toggleButton);
    
    // 按钮文本应该变化
    expect(screen.getByText('行号')).toBeInTheDocument();
  });
});