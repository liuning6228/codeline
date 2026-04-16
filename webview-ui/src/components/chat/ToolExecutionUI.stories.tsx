/**
 * ToolExecutionUI 故事示例
 * 展示Phase 4任务4.2的ToolExecutionUI组件
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ToolExecutionUI, ToolExecutionUIContainer } from './ToolExecutionUI';
import { ToolExecutionInfo } from './ToolExecutionUI';

const meta: Meta<typeof ToolExecutionUI> = {
  title: 'Chat/ToolExecutionUI',
  component: ToolExecutionUI,
  tags: ['autodocs'],
  argTypes: {
    executionInfo: {
      control: 'object',
      description: '工具执行信息',
    },
    interactive: {
      control: 'boolean',
      description: '是否可交互',
    },
    defaultExpanded: {
      control: 'boolean',
      description: '是否默认展开',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToolExecutionUI>;

// 模拟工具执行数据
const createMockExecutionInfo = (overrides: Partial<ToolExecutionInfo> = {}): ToolExecutionInfo => {
  const baseTime = Date.now() - 30000; // 30秒前开始
  const toolId = overrides.toolId || 'enhanced-bash';
  const toolName = overrides.toolName || '增强Bash终端';
  
  return {
    toolId,
    toolName,
    executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    startTime: baseTime,
    endTime: overrides.endTime || (overrides.status === 'completed' ? baseTime + 15000 : undefined),
    status: overrides.status || 'running',
    input: overrides.input || {
      command: 'npm install && npm run build',
      description: '构建项目',
      timeout: 30000,
    },
    output: overrides.output || (overrides.status === 'completed' ? '构建成功！\n创建了12个文件\n删除了3个旧文件\n测试通过率：95%' : undefined),
    error: overrides.error,
    progressHistory: overrides.progressHistory || [
      { type: 'tool_start', data: {}, timestamp: baseTime },
      { type: 'enhanced_bash_output', data: { output: '开始安装依赖...' }, progress: 0.1, message: '开始安装依赖...', timestamp: baseTime + 1000 },
      { type: 'enhanced_bash_output', data: { output: '依赖安装完成' }, progress: 0.3, message: '依赖安装完成', timestamp: baseTime + 5000 },
      { type: 'enhanced_bash_output', data: { output: '开始编译TypeScript...' }, progress: 0.5, message: '开始编译TypeScript...', timestamp: baseTime + 8000 },
    ],
    resourceUsage: overrides.resourceUsage || {
      cpu: 45,
      memory: 128 * 1024 * 1024, // 128MB
      executionTime: overrides.status === 'completed' ? 15000 : undefined,
    },
    sandboxEnabled: overrides.sandboxEnabled !== undefined ? overrides.sandboxEnabled : true,
    permissionStatus: overrides.permissionStatus || {
      allowed: true,
      requiresConfirmation: true,
      confirmed: true,
      riskLevel: 3,
      ruleMatch: [
        { ruleId: 'rule-001', action: 'allow', pattern: 'npm install*' },
      ],
    },
  };
};

// 运行中的工具执行
export const RunningTool: Story = {
  args: {
    executionInfo: createMockExecutionInfo({
      status: 'running',
    }),
    interactive: true,
    defaultExpanded: true,
  },
};

// 成功完成的工具执行
export const CompletedTool: Story = {
  args: {
    executionInfo: createMockExecutionInfo({
      status: 'completed',
      endTime: Date.now() - 5000,
    }),
    interactive: true,
    defaultExpanded: false,
  },
};

// 失败的工具执行
export const FailedTool: Story = {
  args: {
    executionInfo: createMockExecutionInfo({
      status: 'failed',
      endTime: Date.now() - 3000,
      error: '权限不足：无法写入目录 /usr/local/lib\n请使用sudo或更改目录权限',
    }),
    interactive: true,
    defaultExpanded: true,
  },
};

// 被取消的工具执行
export const CancelledTool: Story = {
  args: {
    executionInfo: createMockExecutionInfo({
      status: 'cancelled',
      endTime: Date.now() - 2000,
      error: '用户取消了执行',
    }),
    interactive: true,
    defaultExpanded: false,
  },
};

// 沙箱中运行的工具
export const SandboxedTool: Story = {
  args: {
    executionInfo: createMockExecutionInfo({
      status: 'running',
      sandboxEnabled: true,
      permissionStatus: {
        allowed: true,
        requiresConfirmation: false,
        riskLevel: 7,
      },
    }),
    interactive: true,
    defaultExpanded: true,
  },
};

// 高风险需要确认的工具
export const HighRiskTool: Story = {
  args: {
    executionInfo: createMockExecutionInfo({
      status: 'running',
      sandboxEnabled: true,
      permissionStatus: {
        allowed: true,
        requiresConfirmation: true,
        confirmed: false,
        riskLevel: 9,
        ruleMatch: [
          { ruleId: 'rule-009', action: 'ask', pattern: 'rm -rf *' },
        ],
      },
    }),
    interactive: true,
    defaultExpanded: true,
  },
};

// 容器组件示例
export const ContainerExample = {
  render: () => {
    const executions = [
      createMockExecutionInfo({ 
        status: 'running',
        toolId: 'enhanced-bash',
        toolName: 'Bash命令执行',
      }),
      createMockExecutionInfo({ 
        status: 'completed',
        toolId: 'file-reader',
        toolName: '文件读取',
        endTime: Date.now() - 10000,
      }),
      createMockExecutionInfo({ 
        status: 'failed',
        toolId: 'code-analyzer',
        toolName: '代码分析',
        endTime: Date.now() - 5000,
        error: '无法解析TypeScript语法',
      }),
      createMockExecutionInfo({ 
        status: 'cancelled',
        toolId: 'web-fetcher',
        toolName: '网页抓取',
        endTime: Date.now() - 3000,
      }),
      createMockExecutionInfo({ 
        status: 'completed',
        toolId: 'git-operator',
        toolName: 'Git操作',
        endTime: Date.now() - 15000,
      }),
    ];
    
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <ToolExecutionUIContainer 
          executions={executions}
          maxVisible={3}
          onExecutionAction={(action, executionId, data) => {
            console.log('Action:', action, 'Execution:', executionId, 'Data:', data);
          }}
        />
      </div>
    );
  },
};

// 不同工具类型的示例
export const DifferentToolTypes = {
  render: () => {
    const toolTypes = [
      { id: 'enhanced-bash', name: '增强Bash终端', icon: 'terminal' },
      { id: 'file-editor', name: '文件编辑器', icon: 'file-text' },
      { id: 'code-generator', name: '代码生成器', icon: 'code' },
      { id: 'web-scraper', name: '网页抓取器', icon: 'globe' },
      { id: 'git-operator', name: 'Git操作', icon: 'git-branch' },
      { id: 'database-query', name: '数据库查询', icon: 'database' },
    ];
    
    const executions = toolTypes.map((tool, index) => 
      createMockExecutionInfo({
        toolId: tool.id,
        toolName: tool.name,
        status: index % 3 === 0 ? 'running' : 
                index % 3 === 1 ? 'completed' : 'failed',
        endTime: index % 3 !== 0 ? Date.now() - (index * 5000) : undefined,
        sandboxEnabled: index % 2 === 0,
      })
    );
    
    return (
      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold mb-4">不同工具类型的执行状态</h2>
        <ToolExecutionUIContainer 
          executions={executions}
          maxVisible={6}
        />
      </div>
    );
  },
};

// 实时流式输出示例
export const StreamingOutputExample = {
  render: () => {
    const baseTime = Date.now() - 20000;
    
    // 模拟流式输出
    const streamingProgress = Array.from({ length: 15 }, (_, i) => ({
      type: i % 5 === 0 ? 'enhanced_bash_error' : 'enhanced_bash_output',
      data: { output: `输出行 ${i + 1}: ${'x'.repeat(Math.random() * 50 + 10)}` },
      progress: Math.min(0.95, (i + 1) * 0.06),
      message: `处理中... 进度 ${Math.min(95, (i + 1) * 6)}%`,
      timestamp: baseTime + i * 1000,
    }));
    
    const executionInfo = createMockExecutionInfo({
      status: 'running',
      progressHistory: [
        { type: 'tool_start', data: {}, timestamp: baseTime },
        ...streamingProgress,
      ],
      resourceUsage: {
        cpu: 65,
        memory: 256 * 1024 * 1024,
      },
    });
    
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <ToolExecutionUI 
          executionInfo={executionInfo}
          interactive={true}
          defaultExpanded={true}
          onCancel={(id) => console.log('取消执行:', id)}
          onViewDetails={(id) => console.log('查看详情:', id)}
          onRetry={(id, input) => console.log('重试执行:', id, input)}
          onCopyOutput={(output) => {
            console.log('复制输出:', output.substring(0, 50) + '...');
            alert('输出已复制到剪贴板！');
          }}
        />
      </div>
    );
  },
};

// 性能监控示例
export const PerformanceMonitoring = {
  render: () => {
    const highPerfExec = createMockExecutionInfo({
      status: 'running',
      toolName: '高性能代码分析',
      resourceUsage: {
        cpu: 89,
        memory: 512 * 1024 * 1024,
        executionTime: 45000,
      },
      progressHistory: [
        { type: 'tool_start', data: {}, timestamp: Date.now() - 45000 },
        { type: 'tool_progress', data: {}, progress: 0.25, message: '分析抽象语法树...', timestamp: Date.now() - 35000 },
        { type: 'tool_progress', data: {}, progress: 0.5, message: '计算代码复杂度...', timestamp: Date.now() - 25000 },
        { type: 'tool_progress', data: {}, progress: 0.75, message: '检测设计模式...', timestamp: Date.now() - 15000 },
        { type: 'tool_progress', data: {}, progress: 0.9, message: '生成分析报告...', timestamp: Date.now() - 5000 },
      ],
    });
    
    return (
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <h3 className="text-sm font-semibold">性能监控示例</h3>
        <p className="text-sm text-gray-600">
          此示例展示了一个高资源消耗的工具执行，包含详细的性能指标。
        </p>
        <ToolExecutionUI 
          executionInfo={highPerfExec}
          interactive={true}
          defaultExpanded={true}
        />
      </div>
    );
  },
};