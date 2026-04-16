/**
 * 模拟PromptEngine - 用于测试EnhancedEngineAdapter
 */
export class MockPromptEngine {
  async generatePrompt(context: any, task: string, options?: any): Promise<string> {
    console.log('MockPromptEngine: 生成提示词', task);
    
    const basePrompt = `你是一个专业的编程助手，正在处理以下任务：
任务：${task}

项目上下文：
- 语言统计：${JSON.stringify(context.languageStats || {})}
- 依赖项：${context.dependencies?.join(', ') || '无'}
- 文件结构：${JSON.stringify(context.projectStructure || {})}

请基于以上上下文，提供高质量的代码解决方案。`;

    return basePrompt;
  }
  
  async parseResponse(response: string, format: 'code' | 'text' | 'mixed' = 'mixed'): Promise<any> {
    console.log('MockPromptEngine: 解析响应', format);
    
    if (format === 'code') {
      return {
        type: 'code',
        content: response,
        language: 'typescript',
        blocks: [{ type: 'code', language: 'typescript', content: response }]
      };
    }
    
    return {
      type: 'mixed',
      content: response,
      blocks: [
        { type: 'text', content: '解释部分：' },
        { type: 'code', language: 'typescript', content: '// 代码示例\n' + response }
      ]
    };
  }
}