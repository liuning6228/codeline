/**
 * 浏览器自动化适配器
 * 将现有的 BrowserAutomator 模块适配到统一的工具接口
 */

import * as vscode from 'vscode';
import { BrowserAutomator, BrowserAction, BrowserResult } from '../../browser/browserAutomator';
import { BaseToolAdapter } from './ToolAdapter';
import { ToolContext, ToolResult, PermissionResult, ValidationResult, ToolProgress, ToolCategory } from '../ToolInterface';

/**
 * 浏览器自动化参数类型
 */
export interface BrowserAutomationParams {
  /** 操作模式 */
  mode: 'navigate' | 'extract' | 'test' | 'sequence';
  /** URL地址 */
  url?: string;
  /** 动作序列（仅用于sequence模式） */
  actions?: BrowserAction[];
  /** 选择器（用于extract/test模式） */
  selector?: string;
  /** 文本内容（用于test模式） */
  text?: string;
  /** 等待选择器 */
  waitForSelector?: string;
  /** 是否等待导航完成 */
  waitForNavigation?: boolean;
  /** 评估函数 */
  evaluateFn?: string;
  /** 输出格式 */
  outputFormat?: 'text' | 'html' | 'json';
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 用户代理 */
  userAgent?: string;
}

/**
 * 浏览器自动化结果类型
 */
export interface BrowserAutomationResultData {
  /** 浏览器执行结果 */
  result: BrowserResult;
  /** 提取的数据 */
  extractedData?: any;
  /** 页面信息 */
  pageInfo?: {
    url: string;
    title?: string;
    contentLength: number;
    contentType?: string;
  };
}

/**
 * 浏览器自动化适配器
 */
export class BrowserAutomatorAdapter extends BaseToolAdapter<BrowserAutomationParams, BrowserAutomationResultData> {
  private browserAutomator: BrowserAutomator;
  
  constructor(context: ToolContext) {
    super(
      'browser-automator',
      'Browser Automator',
      'Automate web browser interactions: navigation, content extraction, testing',
      '1.0.0',
      'CodeLine Team',
      ['browser', 'web', 'automation', 'scraping', 'testing', 'navigation'],
      {
        mode: {
          type: 'string',
          description: 'Browser automation mode',
          required: true,
          validation: (value) => ['navigate', 'extract', 'test', 'sequence'].includes(value),
          default: 'navigate',
        },
        url: {
          type: 'string',
          description: 'URL to navigate to or process',
          required: true,
        },
        actions: {
          type: 'array',
          description: 'Sequence of browser actions (for sequence mode)',
          required: false,
        },
        selector: {
          type: 'string',
          description: 'CSS selector for extraction/testing',
          required: false,
        },
        text: {
          type: 'string',
          description: 'Text content for testing',
          required: false,
        },
        waitForSelector: {
          type: 'string',
          description: 'Wait for selector to appear',
          required: false,
        },
        waitForNavigation: {
          type: 'boolean',
          description: 'Wait for navigation to complete',
          required: false,
          default: false,
        },
        evaluateFn: {
          type: 'string',
          description: 'JavaScript function to evaluate on page',
          required: false,
        },
        outputFormat: {
          type: 'string',
          description: 'Output format',
          required: false,
          validation: (value) => !value || ['text', 'html', 'json'].includes(value),
          default: 'text',
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds',
          required: false,
          default: 30000,
        },
        userAgent: {
          type: 'string',
          description: 'Custom user agent string',
          required: false,
        },
      }
    );
    
    this.browserAutomator = new BrowserAutomator();
  }
  
  /**
   * 检查权限 - 浏览器自动化需要特别注意
   */
  async checkPermissions(params: BrowserAutomationParams, context: ToolContext): Promise<PermissionResult> {
    const { url, mode } = params;
    
    // 检查URL安全性
    if (url && !this.isUrlSafe(url)) {
      return {
        allowed: false,
        reason: `Unsafe URL detected: ${url}`,
        requiresUserConfirmation: true,
        confirmationPrompt: `The URL ${url} may be unsafe. Are you sure you want to access it?`,
      };
    }
    
    // 检查模式安全性
    if (mode === 'sequence') {
      return {
        allowed: true,
        requiresUserConfirmation: true,
        confirmationPrompt: `Browser automation sequence may perform multiple actions. Are you sure you want to proceed?`,
      };
    }
    
    // 需要用户确认浏览器自动化
    return {
      allowed: true,
      requiresUserConfirmation: true,
      confirmationPrompt: `Are you sure you want to automate browser interaction with ${url}?`,
    };
  }
  
  /**
   * 验证参数
   */
  async validateParameters(params: BrowserAutomationParams, context: ToolContext): Promise<ValidationResult> {
    const { mode, url, actions, selector, text } = params;
    
    // 基本验证
    if (!mode) {
      return {
        valid: false,
        error: 'Mode is required',
      };
    }
    
    // URL验证
    if (!url) {
      return {
        valid: false,
        error: 'URL is required',
      };
    }
    
    // 模式特定验证
    switch (mode) {
      case 'navigate':
        // 只需要URL
        break;
        
      case 'extract':
        if (!selector) {
          return {
            valid: false,
            error: 'Selector is required for extract mode',
          };
        }
        break;
        
      case 'test':
        if (!selector && !text) {
          return {
            valid: false,
            error: 'Either selector or text is required for test mode',
          };
        }
        break;
        
      case 'sequence':
        if (!actions || !Array.isArray(actions) || actions.length === 0) {
          return {
            valid: false,
            error: 'Actions array is required for sequence mode',
          };
        }
        
        // 验证每个动作
        for (let i = 0; i < actions.length; i++) {
          const action = actions[i];
          if (!action.type) {
            return {
              valid: false,
              error: `Action at index ${i} is missing type`,
            };
          }
        }
        break;
        
      default:
        return {
          valid: false,
          error: `Invalid mode: ${mode}`,
        };
    }
    
    // 清理参数
    const sanitizedParams: BrowserAutomationParams = {
      ...params,
      outputFormat: params.outputFormat || 'text',
      timeout: params.timeout || 30000,
      waitForNavigation: params.waitForNavigation !== undefined ? params.waitForNavigation : false,
    };
    
    // 确保URL有协议
    if (sanitizedParams.url && !sanitizedParams.url.startsWith('http://') && !sanitizedParams.url.startsWith('https://')) {
      sanitizedParams.url = 'https://' + sanitizedParams.url;
    }
    
    return {
      valid: true,
      sanitizedParams,
    };
  }
  
  /**
   * 执行浏览器自动化
   */
  async execute(
    params: BrowserAutomationParams,
    context: ToolContext,
    onProgress?: (progress: ToolProgress) => void
  ): Promise<ToolResult<BrowserAutomationResultData>> {
    const startTime = Date.now();
    const { mode, url, actions } = params;
    
    try {
      // 报告开始进度
      this.reportProgress(onProgress, {
        type: 'browser_automation_start',
        progress: 0.1,
        message: 'Starting browser automation',
        data: { mode, url },
      });
      
      // 构建浏览器选项
      const browserOptions = {
        timeout: params.timeout,
        userAgent: params.userAgent,
      };
      
      let browserResult: BrowserResult;
      let extractedData: any;
      
      // 执行特定模式
      switch (mode) {
        case 'navigate':
          this.reportProgress(onProgress, {
            type: 'browser_navigating',
            progress: 0.3,
            message: `Navigating to: ${url}`,
          });
          
          browserResult = await this.browserAutomator.executeSequence(url!, [{
            type: 'navigate',
            url,
            waitForNavigation: params.waitForNavigation,
          }]);
          break;
          
        case 'extract':
          this.reportProgress(onProgress, {
            type: 'browser_extracting',
            progress: 0.3,
            message: `Extracting content from: ${url}`,
            data: { selector: params.selector },
          });
          
          browserResult = await this.browserAutomator.executeSequence(url!, [{
            type: 'extract',
            url,
            selector: params.selector,
            outputFormat: params.outputFormat,
          }]);
          
          // 尝试解析提取的数据
          if (browserResult.success && browserResult.output) {
            try {
              if (params.outputFormat === 'json') {
                extractedData = JSON.parse(browserResult.output);
              } else {
                extractedData = browserResult.output;
              }
            } catch (e) {
              // 无法解析，保持原始输出
              extractedData = browserResult.output;
            }
          }
          break;
          
        case 'test':
          this.reportProgress(onProgress, {
            type: 'browser_testing',
            progress: 0.3,
            message: `Testing on: ${url}`,
          });
          
          const testActions: BrowserAction[] = [{
            type: 'test',
            url,
            selector: params.selector,
            text: params.text,
            waitForSelector: params.waitForSelector,
          }];
          
          if (params.evaluateFn) {
            testActions.push({
              type: 'test',
              evaluateFn: params.evaluateFn,
            });
          }
          
          browserResult = await this.browserAutomator.executeSequence(url!, testActions);
          break;
          
        case 'sequence':
          this.reportProgress(onProgress, {
            type: 'browser_sequence_start',
            progress: 0.2,
            message: `Executing sequence of ${actions!.length} actions`,
            data: { actionCount: actions!.length },
          });
          
          // 执行动作序列
          browserResult = await this.browserAutomator.executeSequence(url!, actions!);
          
          // 报告序列进度
          if (actions!.length > 1) {
            for (let i = 0; i < actions!.length; i++) {
              const progressValue = 0.2 + (0.6 * (i + 1)) / actions!.length;
              
              this.reportProgress(onProgress, {
                type: 'browser_sequence_progress',
                progress: progressValue,
                message: `Action ${i + 1}/${actions!.length} complete`,
                data: { 
                  index: i,
                  total: actions!.length,
                  actionType: actions![i].type,
                },
              });
            }
          }
          break;
          
        default:
          throw new Error(`Unsupported mode: ${mode}`);
      }
      
      // 提取页面信息
      let pageInfo = undefined;
      if (browserResult.success && browserResult.output) {
        // 尝试从输出中提取页面信息
        const output = browserResult.output;
        const titleMatch = output.match(/Title:\s*"([^"]+)"/i) || output.match(/<title[^>]*>([^<]+)<\/title>/i);
        const contentLengthMatch = output.match(/Content length:\s*(\d+)/i);
        
        pageInfo = {
          url: browserResult.url || url!,
          title: titleMatch ? titleMatch[1].trim() : undefined,
          contentLength: contentLengthMatch ? parseInt(contentLengthMatch[1]) : output.length,
          contentType: params.outputFormat || 'text/html',
        };
      }
      
      // 报告完成进度
      this.reportProgress(onProgress, {
        type: 'browser_automation_complete',
        progress: 1.0,
        message: `Browser automation ${browserResult.success ? 'completed' : 'failed'}`,
        data: { 
          success: browserResult.success,
          url: browserResult.url || url,
        },
      });
      
      const duration = Date.now() - startTime;
      
      // 返回结果
      if (browserResult.success) {
        return this.createSuccessResult(
          {
            result: browserResult,
            extractedData,
            pageInfo,
          },
          duration,
          {
            mode,
            url: browserResult.url || url,
            actionCount: mode === 'sequence' ? actions!.length : 1,
          }
        );
      } else {
        return this.createErrorResult(
          `Browser automation failed: ${browserResult.error || 'Unknown error'}`,
          duration,
          {
            mode,
            url: browserResult.url || url,
            error: browserResult.error,
          }
        );
      }
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.reportProgress(onProgress, {
        type: 'browser_automation_error',
        progress: 1.0,
        message: `Browser automation failed: ${error.message}`,
      });
      
      return this.createErrorResult(
        `Browser automation failed: ${error.message}`,
        duration,
        {
          mode,
          url,
        }
      );
    }
  }
  
  /**
   * 检查是否为只读操作
   */
  isReadOnly(context: ToolContext): boolean {
    return true; // 浏览器自动化通常是只读的（除非有表单提交等操作）
  }
  
  /**
   * 获取显示名称
   */
  getDisplayName(params?: BrowserAutomationParams): string {
    const mode = params?.mode || 'navigate';
    const modeNames: Record<string, string> = {
      navigate: 'Browser Navigation',
      extract: 'Content Extraction',
      test: 'Browser Testing',
      sequence: 'Automation Sequence',
    };
    return modeNames[mode] || 'Browser Automation';
  }
  
  /**
   * 获取活动描述
   */
  getActivityDescription(params: BrowserAutomationParams): string {
    const { mode, url } = params;
    
    switch (mode) {
      case 'navigate':
        return `Navigating to: ${url}`;
      case 'extract':
        return `Extracting content from: ${url}`;
      case 'test':
        return `Testing on: ${url}`;
      case 'sequence':
        return `Executing automation sequence on: ${url}`;
      default:
        return `Browser automation: ${mode}`;
    }
  }
  
  /**
   * 检查URL安全性
   */
  private isUrlSafe(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // 不安全的主机名或协议
      const unsafePatterns = [
        /localhost/i,
        /127\.0\.0\.1/i,
        /192\.168\./i,
        /10\./i,
        /172\.(1[6-9]|2[0-9]|3[0-1])\./i,
        /\.internal$/i,
        /\.local$/i,
      ];
      
      for (const pattern of unsafePatterns) {
        if (pattern.test(hostname)) {
          return false;
        }
      }
      
      // 检查协议
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return false;
      }
      
      return true;
    } catch (error) {
      // URL解析失败
      return false;
    }
  }
  
  /**
   * 工厂方法：创建浏览器自动化适配器
   */
  static create(context: ToolContext): BrowserAutomatorAdapter {
    return new BrowserAutomatorAdapter(context);
  }
}