/**
 * 测试环境设置
 * 为CodeLine新架构提供测试支持
 */

import * as vscode from 'vscode';
import { ToolUseContext, ToolPermissionContext, PermissionMode } from '../core/tool/Tool';

// ==================== Mock VSCode API ====================

/**
 * 模拟的VSCode扩展上下文
 */
export class MockExtensionContext implements vscode.ExtensionContext {
  subscriptions: { dispose(): any }[] = [];
  workspaceState: vscode.Memento = new MockMemento();
  globalState: vscode.Memento & { setKeysForSync(keys: readonly string[]): void } = new MockMemento() as vscode.Memento & { setKeysForSync(keys: readonly string[]): void };
  secrets: vscode.SecretStorage = new MockSecretStorage();
  extensionUri: vscode.Uri = vscode.Uri.file('/mock/extension');
  extensionPath: string = '/mock/extension';
  environmentVariableCollection: vscode.GlobalEnvironmentVariableCollection = {} as any;
  extensionMode: vscode.ExtensionMode = vscode.ExtensionMode.Test;
  logUri: vscode.Uri = vscode.Uri.file('/mock/logs');
  logPath: string = '/mock/logs';
  storageUri: vscode.Uri | undefined = vscode.Uri.file('/mock/storage');
  storagePath: string | undefined = '/mock/storage';
  globalStorageUri: vscode.Uri = vscode.Uri.file('/mock/global-storage');
  globalStoragePath: string = '/mock/global-storage';
  extension: any = {}; // 缺少的属性
  languageModelAccessInformation: any = {}; // 缺少的属性
  
  asAbsolutePath(relativePath: string): string {
    return `/mock/extension/${relativePath}`;
  }
}

/**
 * 模拟的Memento存储
 */
class MockMemento implements vscode.Memento {
  private storage = new Map<string, any>();
  
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.storage.has(key) ? this.storage.get(key) : defaultValue;
  }
  
  update(key: string, value: any): Thenable<void> {
    this.storage.set(key, value);
    return Promise.resolve();
  }
  
  keys(): readonly string[] {
    return Array.from(this.storage.keys());
  }
  
  setKeysForSync(keys: readonly string[]): void {
    // Mock 实现
    console.log('MockMemento.setKeysForSync called with keys:', keys);
  }
}

/**
 * 模拟的Secret存储
 */
class MockSecretStorage implements vscode.SecretStorage {
  private storage = new Map<string, string>();
  
  get(key: string): Thenable<string | undefined> {
    return Promise.resolve(this.storage.get(key));
  }
  
  store(key: string, value: string): Thenable<void> {
    this.storage.set(key, value);
    return Promise.resolve();
  }
  
  delete(key: string): Thenable<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }
  
  onDidChange: vscode.Event<vscode.SecretStorageChangeEvent> = createMockEvent();
  
  keys(): Thenable<string[]> {
    return Promise.resolve(Array.from(this.storage.keys()));
  }
}

/**
 * 模拟的事件
 * 注意：vscode.Event<T> 是一个函数类型，所以我们创建一个可调用的对象
 */
function createMockEvent<T>(): vscode.Event<T> {
  const listeners: ((e: T) => any)[] = [];
  
  const eventFn = function(listener: (e: T) => any, thisArgs?: any, disposables?: vscode.Disposable[]): vscode.Disposable {
    listeners.push(listener);
    return {
      dispose: () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  } as vscode.Event<T>;
  
  // 添加一个辅助方法来触发事件（用于测试）
  (eventFn as any).fire = function(e: T) {
    listeners.forEach(listener => listener(e));
  };
  
  return eventFn;
}

// 为了向后兼容，保留 MockEvent 类（但不再直接实现 vscode.Event）
class MockEvent<T> {
  private listeners: ((e: T) => any)[] = [];
  
  // 这个方法将被用作事件函数
  subscribe = createMockEvent<T>();
  
  // 触发事件
  fire(e: T): void {
    this.listeners.forEach(listener => listener(e));
  }
}

// ==================== Mock Output Channel ====================

/**
 * 模拟的输出通道
 */
export class MockOutputChannel implements vscode.OutputChannel {
  name: string;
  private content: string[] = [];
  
  constructor(name: string) {
    this.name = name;
  }
  
  append(value: string): void {
    this.content.push(value);
  }
  
  appendLine(value: string): void {
    this.content.push(value + '\n');
  }
  
  clear(): void {
    this.content = [];
  }
  
  show(preserveFocus?: boolean): void;
  show(column?: vscode.ViewColumn, preserveFocus?: boolean): void;
  show(column?: any, preserveFocus?: any): void {
    // Mock implementation
  }
  
  hide(): void {
    // Mock implementation
  }
  
  dispose(): void {
    this.content = [];
  }
  
  replace(value: string): void {
    this.content = [value];
  }
  
  getContent(): string {
    return this.content.join('');
  }
}

// ==================== 测试工具上下文 ====================

/**
 * 创建测试用的工具执行上下文
 */
export function createTestToolContext(options: {
  workspaceRoot?: string;
  permissionMode?: PermissionMode;
  enableOutput?: boolean;
} = {}): ToolUseContext {
  const workspaceRoot = options.workspaceRoot || '/mock/workspace';
  const permissionMode = options.permissionMode || 'default';
  const enableOutput = options.enableOutput !== false;
  
  const extensionContext = new MockExtensionContext();
  const outputChannel = enableOutput ? new MockOutputChannel('Test Output') : {
    name: 'Test Output',
    append: () => {},
    appendLine: () => {},
    clear: () => {},
    show: () => {},
    hide: () => {},
    dispose: () => {},
    replace: () => {}
  } as vscode.OutputChannel;
  
  const permissionContext: ToolPermissionContext = {
    mode: permissionMode,
    alwaysAllowRules: {},
    alwaysDenyRules: {},
    alwaysAskRules: {},
    isBypassPermissionsModeAvailable: true
  };
  
  return {
    workspaceRoot,
    extensionContext,
    outputChannel,
    abortController: new AbortController(),
    permissionContext,
    
    // 用户交互
    showInformationMessage: async (message: string, ...items: string[]) => {
      console.log(`[INFO] ${message}`, items);
      return items[0];
    },
    showWarningMessage: async (message: string, ...items: string[]) => {
      console.log(`[WARN] ${message}`, items);
      return items[0];
    },
    showErrorMessage: async (message: string, ...items: string[]) => {
      console.log(`[ERROR] ${message}`, items);
      return items[0];
    },
    
    // 文件操作
    readFile: async (path: string) => {
      // Mock实现
      return `Mock content for ${path}`;
    },
    writeFile: async (path: string, content: string) => {
      // Mock实现
      console.log(`Writing to ${path}: ${content.substring(0, 100)}...`);
    },
    fileExists: async (path: string) => {
      // Mock实现
      return path.includes('exists');
    },
    
    // 状态管理
    setStatus: (status: string) => {
      console.log(`[STATUS] ${status}`);
    },
    updateProgress: (progress) => {
      console.log(`[PROGRESS] ${JSON.stringify(progress)}`);
    }
  };
}

/**
 * 创建模拟的命令执行函数
 */
export function createMockCommandExecutor() {
  const commandHistory: Array<{ command: string; options?: any }> = [];
  const commandResults = new Map<string, any>();
  
  return {
    executeCommand: async (command: string, options?: any) => {
      commandHistory.push({ command, options });
      
      // 检查预定义的结果
      if (commandResults.has(command)) {
        return commandResults.get(command);
      }
      
      // 默认模拟结果
      return {
        success: true,
        output: `Mock output for: ${command}`,
        error: undefined,
        exitCode: 0,
        duration: 100,
        command,
        timestamp: new Date()
      };
    },
    
    getCommandHistory: () => [...commandHistory],
    
    setCommandResult: (command: string, result: any) => {
      commandResults.set(command, result);
    },
    
    clearHistory: () => {
      commandHistory.length = 0;
      commandResults.clear();
    }
  };
}

// ==================== 测试工具基类 ====================

/**
 * 测试工具基类
 */
export abstract class TestTool {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  protected log(message: string, ...args: any[]): void {
    console.log(`[${this.id}] ${message}`, ...args);
  }
  
  protected error(message: string, ...args: any[]): void {
    console.error(`[${this.id}] ${message}`, ...args);
  }
}

// ==================== 测试辅助函数 ====================

/**
 * 断言工具执行成功
 */
export async function assertToolSuccess(
  toolExecution: Promise<any>,
  timeoutMs: number = 5000
): Promise<any> {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Tool execution timeout')), timeoutMs);
  });
  
  try {
    const result = await Promise.race([toolExecution, timeoutPromise]);
    return result;
  } catch (error) {
    throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 断言工具执行失败
 */
export async function assertToolFailure(
  toolExecution: Promise<any>,
  expectedError?: string | RegExp,
  timeoutMs: number = 5000
): Promise<Error> {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Tool execution timeout')), timeoutMs);
  });
  
  try {
    await Promise.race([toolExecution, timeoutPromise]);
    throw new Error('Expected tool execution to fail, but it succeeded');
  } catch (error) {
    if (expectedError) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (typeof expectedError === 'string') {
        if (!errorMessage.includes(expectedError)) {
          throw new Error(`Expected error to contain "${expectedError}", but got: ${errorMessage}`);
        }
      } else if (expectedError instanceof RegExp) {
        if (!expectedError.test(errorMessage)) {
          throw new Error(`Expected error to match ${expectedError}, but got: ${errorMessage}`);
        }
      }
    }
    return error as Error;
  }
}

/**
 * 收集工具进度
 */
export async function collectToolProgress(
  progressStream: AsyncIterable<any>,
  maxItems: number = 100
): Promise<any[]> {
  const progress: any[] = [];
  
  for await (const item of progressStream) {
    progress.push(item);
    if (progress.length >= maxItems) {
      break;
    }
  }
  
  return progress;
}

/**
 * 等待条件成立
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const result = await condition();
    if (result) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

// ==================== 测试数据生成器 ====================

/**
 * 生成随机字符串
 */
export function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成随机文件路径
 */
export function randomFilePath(extension: string = '.txt'): string {
  const dirs = ['src', 'test', 'lib', 'docs', 'config'];
  const files = ['main', 'utils', 'helper', 'service', 'component'];
  const dir = dirs[Math.floor(Math.random() * dirs.length)];
  const file = files[Math.floor(Math.random() * files.length)];
  return `/${dir}/${file}_${randomString(5)}${extension}`;
}

/**
 * 生成随机命令
 */
export function randomCommand(): string {
  const commands = [
    'ls -la',
    'git status',
    'npm install',
    'echo "test"',
    'cat README.md',
    'find . -name "*.ts"',
    'grep -r "function" src/'
  ];
  return commands[Math.floor(Math.random() * commands.length)];
}

// ==================== 测试配置 ====================

/**
 * 测试配置
 */
export interface TestConfig {
  workspaceRoot: string;
  enableLogging: boolean;
  mockFileSystem: boolean;
  timeoutMs: number;
}

/**
 * 默认测试配置
 */
export const DEFAULT_TEST_CONFIG: TestConfig = {
  workspaceRoot: '/test/workspace',
  enableLogging: false,
  mockFileSystem: true,
  timeoutMs: 10000
};

/**
 * 创建测试配置
 */
export function createTestConfig(overrides: Partial<TestConfig> = {}): TestConfig {
  return { ...DEFAULT_TEST_CONFIG, ...overrides };
}

// ==================== 导出 ====================
// 注意：MockExtensionContext 和 MockOutputChannel 已经在定义时导出
// 这里只导出其他类
export {
  MockMemento,
  MockSecretStorage,
  MockEvent
};