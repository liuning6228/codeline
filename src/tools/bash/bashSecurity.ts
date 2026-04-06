/**
 * BashTool 安全验证模块
 * 提供命令安全性检查和验证
 */

import { ExtendedToolContext } from '../../core/tool/BaseTool';
import { ValidationResult } from '../ToolInterface';
import { BashToolInput } from './BashTool';

/**
 * 异步检查命令安全性
 */
export async function bashCommandIsSafeAsync(
  params: BashToolInput,
  context: ExtendedToolContext
): Promise<ValidationResult> {
  const { command } = params;
  
  try {
    // 1. 检查危险模式
    const dangerousPatterns = [
      // 命令替换和进程替换
      /\$\(.*\)/,                     // $(command)
      /`.*`/,                         // `command`
      /<\(.*\)/,                      // <(process)
      />\(.*\)/,                      // >(process)
      
      // 危险的重定向
      />\s*&/,                        // >& 文件描述符重定向
      /<\s*&/,                        // <& 文件描述符重定向
      />>\s*&/,                       // >>& 追加重定向
      
      // 变量替换
      /\$\{.*\}/,                     // ${variable}
      /\$\[.*\]/,                     // $[arithmetic]
      
      // Here document
      /<<\s*EOF/,                     // here document
      /<<\s*'EOF'/,                   // quoted here document
      /<<\s*"EOF"/,                   // double-quoted here document
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return {
          valid: false,
          error: `检测到危险语法模式: ${pattern.source}`,
        };
      }
    }
    
    // 2. 检查恶意代码模式
    const maliciousPatterns = [
      // 代码注入
      /eval\s+/,                      // eval
      /exec\s+/,                      // exec
      /source\s+/,                    // source
      /\.\s+/,                        // . (source)
      
      // 网络操作
      /wget\s+.*\|\s*sh/,            // wget | sh
      /curl\s+.*\|\s*sh/,            // curl | sh
      /bash\s+-c/,                   // bash -c
      /sh\s+-c/,                     // sh -c
      
      // 环境变量操作
      /export\s+.*=/,                // export variable
      /unset\s+/,                    // unset variable
      
      // 后台进程
      /&\s*$/,                        // & at end (background)
      /nohup\s+/,                     // nohup
    ];
    
    for (const pattern of maliciousPatterns) {
      if (pattern.test(command)) {
        return {
          valid: false,
          error: `检测到潜在恶意代码模式: ${pattern.source}`,
        };
      }
    }
    
    // 3. 检查特殊字符
    const specialChars = ['\x00', '\x1b', '\x07']; // NULL, ESC, BEL
    for (const char of specialChars) {
      if (command.includes(char)) {
        return {
          valid: false,
          error: '检测到控制字符',
        };
      }
    }
    
    // 4. 检查命令长度
    if (command.length > 10000) {
      return {
        valid: false,
        error: '命令过长（最大10000字符）',
      };
    }
    
    // 5. 检查多行命令
    if (command.includes('\n')) {
      // 允许简单的多行命令（使用续行符）
      const lines = command.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line.endsWith('\\')) {
          return {
            valid: false,
            error: '多行命令必须使用续行符（\\）',
          };
        }
      }
    }
    
    // 6. 检查转义序列
    const escapeSequences = [
      /\\x[0-9a-fA-F]{2}/,           // \xHH 十六进制转义
      /\\u[0-9a-fA-F]{4}/,           // \uHHHH Unicode转义
      /\\U[0-9a-fA-F]{8}/,           // \UHHHHHHHH Unicode转义
    ];
    
    for (const pattern of escapeSequences) {
      if (pattern.test(command)) {
        return {
          valid: false,
          error: '检测到转义序列',
        };
      }
    }
    
    return {
      valid: true,
    };
    
  } catch (error: any) {
    return {
      valid: false,
      error: `安全检查失败: ${error.message}`,
    };
  }
}

/**
 * 检查命令是否安全（同步版本）
 */
export function bashCommandIsSafe(
  command: string,
  context: ExtendedToolContext
): ValidationResult {
  // 基本安全检查
  if (!command || command.trim().length === 0) {
    return {
      valid: false,
      error: '命令不能为空',
    };
  }
  
  // 检查危险关键字
  const dangerousKeywords = [
    'rm -rf',
    'dd if=',
    'mkfs',
    'fdisk',
    ':(){ :|:& };:',
    'chmod 777',
    'chown root',
  ];
  
  for (const keyword of dangerousKeywords) {
    if (command.includes(keyword)) {
      return {
        valid: false,
        error: `检测到危险关键字: ${keyword}`,
      };
    }
  }
  
  return {
    valid: true,
  };
}

/**
 * 剥离安全的 Here Document 替换
 */
export function stripSafeHeredocSubstitutions(command: string): string {
  // 简化的 here document 处理
  // 在实际实现中，这里应该解析 here document 并移除安全的部分
  return command.replace(/<<\s*['"]?EOF['"]?.*?EOF/gs, '<<EOF');
}

/**
 * 检查命令操作符权限
 */
export function checkCommandOperatorPermissions(
  command: string,
  context: ExtendedToolContext
): ValidationResult {
  // 检查管道操作符
  if (command.includes('|')) {
    const parts = command.split('|');
    if (parts.length > 10) {
      return {
        valid: false,
        error: '管道链过长（最大10个命令）',
      };
    }
  }
  
  // 检查逻辑操作符
  if (command.includes('&&') || command.includes('||')) {
    // 检查嵌套深度
    const andCount = (command.match(/&&/g) || []).length;
    const orCount = (command.match(/\|\|/g) || []).length;
    
    if (andCount + orCount > 5) {
      return {
        valid: false,
        error: '逻辑操作符过多（最大5个）',
      };
    }
  }
  
  // 检查重定向操作符
  if (command.includes('>') || command.includes('<')) {
    // 检查重定向到敏感位置
    const sensitiveRedirects = [
      />\s*\/dev\/null/i,
      />\s*\/dev\/zero/i,
      /<\s*\/dev\/urandom/i,
      />>\s*\/etc\//i,
      />\s*\/etc\//i,
    ];
    
    for (const pattern of sensitiveRedirects) {
      if (pattern.test(command)) {
        return {
          valid: false,
          error: '检测到敏感位置的重定向',
        };
      }
    }
  }
  
  return {
    valid: true,
  };
}

/**
 * 验证危险模式
 */
export function validateDangerousPatterns(
  command: string,
  context: ExtendedToolContext
): string[] {
  const warnings: string[] = [];
  
  // 检查反引号命令替换
  const backtickMatches = command.match(/`[^`]*`/g);
  if (backtickMatches) {
    warnings.push(`发现命令替换: ${backtickMatches.join(', ')}`);
  }
  
  // 检查变量替换
  const varMatches = command.match(/\$\{[^}]*\}/g);
  if (varMatches) {
    warnings.push(`发现变量替换: ${varMatches.join(', ')}`);
  }
  
  // 检查进程替换
  const processMatches = command.match(/[<>]\([^)]*\)/g);
  if (processMatches) {
    warnings.push(`发现进程替换: ${processMatches.join(', ')}`);
  }
  
  // 检查环境变量赋值
  const exportMatches = command.match(/export\s+\w+\s*=/g);
  if (exportMatches) {
    warnings.push(`发现环境变量设置: ${exportMatches.join(', ')}`);
  }
  
  return warnings;
}

/**
 * 检查是否有格式错误的令牌
 */
export function hasMalformedTokens(command: string): boolean {
  // 检查不匹配的引号
  const singleQuotes = (command.match(/'/g) || []).length;
  const doubleQuotes = (command.match(/"/g) || []).length;
  
  if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
    return true;
  }
  
  // 检查不匹配的括号
  const openParen = (command.match(/\(/g) || []).length;
  const closeParen = (command.match(/\)/g) || []).length;
  
  if (openParen !== closeParen) {
    return true;
  }
  
  // 检查不匹配的花括号
  const openBrace = (command.match(/{/g) || []).length;
  const closeBrace = (command.match(/}/g) || []).length;
  
  if (openBrace !== closeBrace) {
    return true;
  }
  
  return false;
}