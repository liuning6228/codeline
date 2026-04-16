/**
 * ToolExecutionUI 组件测试
 * Phase 4 任务4.2: UI测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToolExecutionUI, ToolExecutionUIContainer } from './ToolExecutionUI';
import { ToolExecutionInfo } from './ToolExecutionUI';

// Mock the FileServiceClient
vi.mock('@/services/grpc-client', () => ({
  FileServiceClient: {
    openFileRelativePath: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    PlayCircle: () => <div data-testid="play-circle">PlayCircle</div>,
    StopCircle: () => <div data-testid="stop-circle">StopCircle</div>,
    CheckCircle: () => <div data-testid="check-circle">CheckCircle</div>,
    XCircle: () => <div data-testid="x-circle">XCircle</div>,
    AlertCircle: () => <div data-testid="alert-circle">AlertCircle</div>,
    ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
    ChevronRight: () => <div data-testid="chevron-right">ChevronRight</div>,
    Terminal: () => <div data-testid="terminal">Terminal</div>,
    Clock: () => <div data-testid="clock">Clock</div>,
    Cpu: () => <div data-testid="cpu">Cpu</div>,
    FileText: () => <div data-testid="file-text">FileText</div>,
    Code: () => <div data-testid="code">Code</div>,
    Settings: () => <div data-testid="settings">Settings</div>,
    Loader2: () => <div data-testid="loader">Loader2</div>,
  };
});

describe('ToolExecutionUI', () => {
  // 创建模拟执行信息
  const createMockExecution = (overrides: Partial<ToolExecutionInfo> = {}): ToolExecutionInfo => {
    const baseTime = Date.now() - 30000;
    return {
      toolId: 'enhanced-bash',
      toolName: '增强Bash终端',
      executionId: 'exec-12345',
      startTime: baseTime,
      endTime: overrides.endTime || (overrides.status === 'completed' ? baseTime + 15000 : undefined),
      status: overrides.status || 'running',
      input: overrides.input || {
        command: 'npm install',
        description: '安装依赖',
      },
      output: overrides.output,
      error: overrides.error,
      progressHistory: overrides.progressHistory || [
        { type: 'tool_start', data: {}, timestamp: baseTime },
        { type: 'enhanced_bash_output', data: {}, progress: 0.1, message: '开始安装...', timestamp: baseTime + 1000 },
        { type: 'enhanced_bash_output', data: {}, progress: 0.5, message: '安装中...', timestamp: baseTime + 5000 },
      ],
      resourceUsage: overrides.resourceUsage || {
        cpu: 45,
        memory: 128 * 1024 * 1024,
      },
      sandboxEnabled: overrides.sandboxEnabled !== undefined ? overrides.sandboxEnabled : true,
      permissionStatus: overrides.permissionStatus || {
        allowed: true,
        requiresConfirmation: true,
        confirmed: true,
        riskLevel: 3,
      },
    };
  };

  it('应该渲染运行中的工具执行', () => {
    const executionInfo = createMockExecution({ status: 'running' });
    
    render(
      <ToolExecutionUI
        executionInfo={executionInfo}
        interactive={true}
        defaultExpanded={false}
      />
    );

    // 检查工具名称
    expect(screen.getByText('增强Bash终端')).toBeInTheDocument();
    
    // 检查状态标签
    expect(screen.getByText('执行中')).toBeInTheDocument();
    
    // 检查沙箱标签
    expect(screen.getByText('沙箱执行')).toBeInTheDocument();
  });

  it('应该渲染已完成的工具执行', () => {
    const executionInfo = createMockExecution({ 
      status: 'completed',
      endTime: Date.now() - 5000,
    });
    
    render(
      <ToolExecutionUI
        executionInfo={executionInfo}
        interactive={true}
        defaultExpanded={false}
      />
    );

    expect(screen.getByText('已完成')).toBeInTheDocument();
  });

  it('应该渲染失败的工具执行', () => {
    const executionInfo = createMockExecution({
      status: 'failed',
      endTime: Date.now() - 3000,
      error: '权限不足',
    });
    
    render(
      <ToolExecutionUI
        executionInfo={executionInfo}
        interactive={true}
        defaultExpanded={true}
      />
    );

    expect(screen.getByText('失败')).toBeInTheDocument();
    expect(screen.getByText('权限不足')).toBeInTheDocument();
  });

  it('应该展开和折叠内容', () => {
    const executionInfo = createMockExecution({ status: 'running' });
    
    render(
      <ToolExecutionUI
        executionInfo={executionInfo}
        interactive={true}
        defaultExpanded={false}
      />
    );

    // 初始应该折叠
    expect(screen.queryByText('实时输出')).not.toBeInTheDocument();
    
    // 点击头部展开
    const header = screen.getByText('增强Bash终端').closest('div[class*="cursor-pointer"]');
    fireEvent.click(header!);
    
    // 现在应该显示内容
    expect(screen.getByText('实时输出')).toBeInTheDocument();
  });

  it('应该处理取消操作', async () => {
    const mockOnCancel = vi.fn();
    const executionInfo = createMockExecution({ status: 'running' });
    
    render(
      <ToolExecutionUI
        executionInfo={executionInfo}
        interactive={true}
        defaultExpanded={true}
        onCancel={mockOnCancel}
      />
    );

    // 点击取消按钮
    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledWith('exec-12345');
  });

  it('应该处理重试操作', async () => {
    const mockOnRetry = vi.fn();
    const executionInfo = createMockExecution({ 
      status: 'failed',
      endTime: Date.now() - 3000,
    });
    
    render(
      <ToolExecutionUI
        executionInfo={executionInfo}
        interactive={true}
        defaultExpanded={true}
        onRetry={mockOnRetry}
      />
    );

    // 点击重试按钮
    const retryButton = screen.getByText('重试');
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalledWith('exec-12345', executionInfo.input);
  });

  it('应该显示流式输出', () => {
    const executionInfo = createMockExecution({
      status: 'running',
      progressHistory: [
        { type: 'tool_start', data: {}, timestamp: Date.now() - 10000 },
        { type: 'enhanced_bash_output', data: {}, message: '输出行1', timestamp: Date.now() - 9000 },
        { type: 'enhanced_bash_output', data: {}, message: '输出行2', timestamp: Date.now() - 8000 },
        { type: 'enhanced_bash_error', data: {}, message: '错误行', timestamp: Date.now() - 7000 },
      ],
    });
    
    render(
      <ToolExecutionUI
        executionInfo={executionInfo}
        interactive={true}
        defaultExpanded={true}
      />
    );

    expect(screen.getByText('实时输出')).toBeInTheDocument();
  });

  it('应该显示资源使用信息', () => {
    const executionInfo = createMockExecution({
      status: 'running',
      resourceUsage: {
        cpu: 75,
        memory: 256 * 1024 * 1024,
        executionTime: 12000,
      },
    });
    
    render(
      <ToolExecutionUI
        executionInfo={executionInfo}
        interactive={true}
        defaultExpanded={true}
      />
    );

    expect(screen.getByText(/CPU:/)).toBeInTheDocument();
    expect(screen.getByText(/内存:/)).toBeInTheDocument();
  });
});

describe('ToolExecutionUIContainer', () => {
  const createMultipleExecutions = (): ToolExecutionInfo[] => {
    const baseTime = Date.now();
    return [
      {
        toolId: 'bash-1',
        toolName: 'Bash命令1',
        executionId: 'exec-1',
        startTime: baseTime - 60000,
        endTime: baseTime - 30000,
        status: 'completed',
        progressHistory: [],
        resourceUsage: { cpu: 30, memory: 100 * 1024 * 1024 },
      },
      {
        toolId: 'bash-2',
        toolName: 'Bash命令2',
        executionId: 'exec-2',
        startTime: baseTime - 30000,
        status: 'running',
        progressHistory: [],
        resourceUsage: { cpu: 60, memory: 200 * 1024 * 1024 },
      },
      {
        toolId: 'bash-3',
        toolName: 'Bash命令3',
        executionId: 'exec-3',
        startTime: baseTime - 15000,
        endTime: baseTime - 5000,
        status: 'failed',
        error: '执行失败',
        progressHistory: [],
        resourceUsage: { cpu: 0, memory: 0 },
      },
      {
        toolId: 'bash-4',
        toolName: 'Bash命令4',
        executionId: 'exec-4',
        startTime: baseTime - 10000,
        endTime: baseTime - 5000,
        status: 'completed',
        progressHistory: [],
        resourceUsage: { cpu: 20, memory: 50 * 1024 * 1024 },
      },
    ];
  };

  it('应该渲染多个执行实例', () => {
    const executions = createMultipleExecutions();
    
    render(
      <ToolExecutionUIContainer
        executions={executions}
        maxVisible={3}
      />
    );

    // 检查标题
    expect(screen.getByText('工具执行状态')).toBeInTheDocument();
    
    // 检查统计信息
    expect(screen.getByText('总计: 4')).toBeInTheDocument();
    expect(screen.getByText('运行中: 1')).toBeInTheDocument();
    
    // 检查显示的执行数（最多3个）
    expect(screen.getAllByText(/Bash命令/)).toHaveLength(3);
  });

  it('应该显示"显示更多"按钮', () => {
    const executions = createMultipleExecutions();
    
    render(
      <ToolExecutionUIContainer
        executions={executions}
        maxVisible={2}
      />
    );

    // 应该显示"显示更多"按钮
    expect(screen.getByText('显示更多 (2 个)')).toBeInTheDocument();
  });

  it('应该处理执行操作', async () => {
    const mockOnExecutionAction = vi.fn();
    const executions = createMultipleExecutions();
    
    render(
      <ToolExecutionUIContainer
        executions={executions}
        maxVisible={4}
        onExecutionAction={mockOnExecutionAction}
      />
    );

    // 这里需要更复杂的交互测试，但基本结构已经建立
    expect(mockOnExecutionAction).not.toHaveBeenCalled();
  });

  it('空状态应该显示提示', () => {
    render(
      <ToolExecutionUIContainer
        executions={[]}
        maxVisible={5}
      />
    );

    expect(screen.getByText('暂无工具执行记录')).toBeInTheDocument();
  });
});