/**
 * 命令语义分析模块
 * 解析命令退出码的特殊含义
 */

/**
 * 命令语义分析结果
 */
export interface CommandSemanticResult {
  /** 是否是错误 */
  isError: boolean;
  /** 解释消息 */
  message?: string;
  /** 退出码 */
  exitCode: number;
}

/**
 * 命令语义分析函数
 */
export type CommandSemantic = (
  exitCode: number,
  stdout: string,
  stderr: string
) => CommandSemanticResult;

/**
 * 默认语义：只有0表示成功，其他都是错误
 */
const DEFAULT_SEMANTIC: CommandSemantic = (exitCode, _stdout, _stderr) => ({
  isError: exitCode !== 0,
  message: exitCode !== 0 ? `命令失败，退出码: ${exitCode}` : undefined,
  exitCode,
});

/**
 * 命令特定语义映射
 */
const COMMAND_SEMANTICS: Map<string, CommandSemantic> = new Map([
  // grep: 0=找到匹配, 1=没有匹配, 2+=错误
  [
    'grep',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode >= 2,
      message: exitCode === 1 ? '没有找到匹配项' : undefined,
      exitCode,
    }),
  ],

  // ripgrep: 与 grep 相同
  [
    'rg',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode >= 2,
      message: exitCode === 1 ? '没有找到匹配项' : undefined,
      exitCode,
    }),
  ],

  // find: 0=成功, 1=部分成功（部分目录无法访问）, 2+=错误
  [
    'find',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode >= 2,
      message: exitCode === 1 ? '部分目录无法访问' : undefined,
      exitCode,
    }),
  ],

  // diff: 0=没有差异, 1=有差异, 2+=错误
  [
    'diff',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode >= 2,
      message: exitCode === 1 ? '文件有差异' : undefined,
      exitCode,
    }),
  ],

  // test/[ : 0=条件为真, 1=条件为假, 2+=错误
  [
    'test',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode >= 2,
      message: exitCode === 1 ? '条件为假' : undefined,
      exitCode,
    }),
  ],

  // [ : test 的别名
  [
    '[',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode >= 2,
      message: exitCode === 1 ? '条件为假' : undefined,
      exitCode,
    }),
  ],

  // git: 特定退出码处理
  [
    'git',
    (exitCode, stdout, stderr) => {
      // git 的常见退出码
      if (exitCode === 0) {
        return { isError: false, exitCode };
      }
      
      // git diff 的退出码
      if (stdout.includes('diff') || stderr.includes('diff')) {
        return {
          isError: exitCode >= 2,
          message: exitCode === 1 ? '有文件差异' : undefined,
          exitCode,
        };
      }
      
      // git grep 的退出码
      if (stdout.includes('grep') || stderr.includes('grep')) {
        return {
          isError: exitCode >= 2,
          message: exitCode === 1 ? '没有找到匹配项' : undefined,
          exitCode,
        };
      }
      
      // 默认处理
      return {
        isError: true,
        message: `git 命令失败，退出码: ${exitCode}`,
        exitCode,
      };
    },
  ],

  // ls: 通常只有真正的错误才会失败
  [
    'ls',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode !== 0,
      message: exitCode !== 0 ? `ls 失败，退出码: ${exitCode}` : undefined,
      exitCode,
    }),
  ],

  // cat: 通常只有真正的错误才会失败
  [
    'cat',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode !== 0,
      message: exitCode !== 0 ? `cat 失败，退出码: ${exitCode}` : undefined,
      exitCode,
    }),
  ],

  // wc: 通常只有真正的错误才会失败
  [
    'wc',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode !== 0,
      message: exitCode !== 0 ? `wc 失败，退出码: ${exitCode}` : undefined,
      exitCode,
    }),
  ],

  // head/tail: 通常只有真正的错误才会失败
  [
    'head',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode !== 0,
      message: exitCode !== 0 ? `head 失败，退出码: ${exitCode}` : undefined,
      exitCode,
    }),
  ],
  [
    'tail',
    (exitCode, _stdout, _stderr) => ({
      isError: exitCode !== 0,
      message: exitCode !== 0 ? `tail 失败，退出码: ${exitCode}` : undefined,
      exitCode,
    }),
  ],
]);

/**
 * 启发式提取基础命令
 */
function heuristicallyExtractBaseCommand(command: string): string {
  if (!command || command.trim().length === 0) {
    return '';
  }
  
  // 移除前导的环境变量赋值
  let remaining = command.trim();
  while (remaining.match(/^[A-Za-z_]\w*=/) && remaining.includes(' ')) {
    remaining = remaining.substring(remaining.indexOf(' ') + 1);
  }
  
  // 提取第一个单词（直到空格或特殊字符）
  const firstWordMatch = remaining.match(/^(\S+)/);
  if (!firstWordMatch) {
    return '';
  }
  
  let baseCommand = firstWordMatch[1];
  
  // 处理管道：获取第一个管道前的命令
  if (baseCommand.includes('|')) {
    const pipeParts = baseCommand.split('|');
    baseCommand = pipeParts[0].trim();
  }
  
  // 处理逻辑操作符
  if (baseCommand.includes('&&') || baseCommand.includes('||')) {
    const logicParts = baseCommand.split(/&&|\|\|/);
    baseCommand = logicParts[0].trim();
  }
  
  // 处理分号
  if (baseCommand.includes(';')) {
    const semicolonParts = baseCommand.split(';');
    baseCommand = semicolonParts[0].trim();
  }
  
  // 清理命令（可能包含路径）
  if (baseCommand.includes('/')) {
    const pathParts = baseCommand.split('/');
    baseCommand = pathParts[pathParts.length - 1];
  }
  
  return baseCommand.toLowerCase();
}

/**
 * 获取命令的语义解释
 */
export function getCommandSemantic(command: string): CommandSemantic {
  const baseCommand = heuristicallyExtractBaseCommand(command);
  const semantic = COMMAND_SEMANTICS.get(baseCommand);
  return semantic !== undefined ? semantic : DEFAULT_SEMANTIC;
}

/**
 * 解释命令结果
 */
export function interpretCommandResult(
  command: string,
  exitCode: number,
  stdout: string,
  stderr: string
): CommandSemanticResult {
  const semantic = getCommandSemantic(command);
  return semantic(exitCode, stdout, stderr);
}

/**
 * 检查命令是否是搜索或读取操作
 */
export function isSearchOrReadBashCommand(command: string): {
  isSearch: boolean;
  isRead: boolean;
  isList: boolean;
} {
  const searchCommands = new Set(['grep', 'rg', 'ag', 'ack', 'find', 'locate']);
  const readCommands = new Set(['cat', 'head', 'tail', 'less', 'more', 'wc', 'stat', 'file']);
  const listCommands = new Set(['ls', 'tree', 'du']);
  
  const baseCommand = heuristicallyExtractBaseCommand(command);
  
  return {
    isSearch: searchCommands.has(baseCommand),
    isRead: readCommands.has(baseCommand),
    isList: listCommands.has(baseCommand),
  };
}

/**
 * 检查命令是否是静默命令（成功时不产生输出）
 */
export function isSilentBashCommand(command: string): boolean {
  const silentCommands = new Set([
    'mv', 'cp', 'rm', 'mkdir', 'rmdir', 'chmod', 'chown', 'chgrp',
    'touch', 'ln', 'cd', 'export', 'unset', 'wait',
  ]);
  
  const baseCommand = heuristicallyExtractBaseCommand(command);
  return silentCommands.has(baseCommand);
}

/**
 * 检查命令是否包含睡眠模式
 */
export function detectBlockedSleepPattern(command: string): string | null {
  const sleepPattern = /^sleep\s+(\d+)\s*$/;
  const match = command.match(sleepPattern);
  
  if (match) {
    const seconds = parseInt(match[1], 10);
    if (seconds >= 2) {
      return `检测到休眠命令: sleep ${seconds}`;
    }
  }
  
  return null;
}