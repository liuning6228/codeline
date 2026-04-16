/**
 * 模拟ToolRegistry - 用于测试EnhancedEngineAdapter
 */
export interface MockTool {
  name: string;
  description: string;
  parameters: any;
  execute: (args: any) => Promise<any>;
  category: string;
}

export class MockToolRegistry {
  private tools: Map<string, MockTool> = new Map();
  private categories: Set<string> = new Set();
  
  constructor() {
    this.initializeDefaultTools();
  }
  
  private initializeDefaultTools(): void {
    // 添加一些模拟工具
    this.registerTool({
      name: 'read_file',
      description: '读取文件内容',
      parameters: { path: 'string' },
      execute: async (args: any) => {
        console.log('MockToolRegistry: 执行read_file工具', args);
        return { content: '模拟文件内容', success: true };
      },
      category: 'file'
    });
    
    this.registerTool({
      name: 'write_file',
      description: '写入文件内容',
      parameters: { path: 'string', content: 'string' },
      execute: async (args: any) => {
        console.log('MockToolRegistry: 执行write_file工具', args);
        return { success: true, bytesWritten: args.content?.length || 0 };
      },
      category: 'file'
    });
    
    this.registerTool({
      name: 'execute_command',
      description: '执行终端命令',
      parameters: { command: 'string' },
      execute: async (args: any) => {
        console.log('MockToolRegistry: 执行execute_command工具', args);
        return { stdout: '命令执行成功', stderr: '', exitCode: 0 };
      },
      category: 'terminal'
    });
    
    this.categories.add('file');
    this.categories.add('terminal');
  }
  
  registerTool(tool: MockTool): void {
    this.tools.set(tool.name, tool);
    this.categories.add(tool.category);
    console.log(`MockToolRegistry: 注册工具 ${tool.name} (类别: ${tool.category})`);
  }
  
  getTool(name: string): MockTool | undefined {
    return this.tools.get(name);
  }
  
  getAllTools(): MockTool[] {
    return Array.from(this.tools.values());
  }
  
  getToolsByCategory(category: string): MockTool[] {
    return this.getAllTools().filter(tool => tool.category === category);
  }
  
  getCategories(): string[] {
    return Array.from(this.categories);
  }
  
  async executeTool(name: string, args: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`工具 ${name} 未找到`);
    }
    
    console.log(`MockToolRegistry: 执行工具 ${name}`, args);
    return await tool.execute(args);
  }
}