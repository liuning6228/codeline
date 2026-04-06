/**
 * 沙箱决策模块
 * 决定是否在沙箱中执行命令
 */

import { BashToolInput } from './BashTool';

/**
 * 判断是否应该在沙箱中执行命令
 */
export function shouldUseSandbox(input: BashToolInput): boolean {
  const { command, dangerouslyDisableSandbox } = input;
  
  // 1. 如果用户明确禁用沙箱
  if (dangerouslyDisableSandbox === true) {
    return false;
  }
  
  // 2. 检查命令是否包含危险操作
  if (containsDangerousOperation(command)) {
    return true;
  }
  
  // 3. 检查命令是否是只读操作
  if (isReadOnlyCommand(command)) {
    return false;
  }
  
  // 4. 检查命令是否修改文件系统
  if (modifiesFileSystem(command)) {
    return true;
  }
  
  // 5. 检查命令是否执行外部程序
  if (executesExternalProgram(command)) {
    return true;
  }
  
  // 6. 默认情况下，对于复杂命令使用沙箱
  if (isComplexCommand(command)) {
    return true;
  }
  
  return false;
}

/**
 * 检查是否包含危险操作
 */
function containsDangerousOperation(command: string): boolean {
  const dangerousPatterns = [
    // 文件操作
    /rm\s+-rf/i,
    /dd\s+if=/i,
    /dd\s+of=/i,
    /mkfs/i,
    /fdisk/i,
    /format/i,
    
    // 权限操作
    /chmod\s+[0-7]{3,4}/i,
    /chown\s+root/i,
    /chgrp\s+root/i,
    
    // 网络操作
    /wget\s+.*\|\s*sh/i,
    /curl\s+.*\|\s*sh/i,
    /nc\s+/i,
    /nmap\s+/i,
    
    // 进程操作
    /kill\s+/i,
    /pkill\s+/i,
    /killall\s+/i,
    
    // 系统操作
    /shutdown/i,
    /reboot/i,
    /halt/i,
    /init\s+/i,
    /telinit\s+/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(command));
}

/**
 * 检查是否是只读命令
 */
function isReadOnlyCommand(command: string): boolean {
  const readOnlyPatterns = [
    /^ls\b/i,
    /^cat\b/i,
    /^head\b/i,
    /^tail\b/i,
    /^grep\b/i,
    /^find\b/i, // 注意：没有 -exec 或 -delete 的 find
    /^file\b/i,
    /^stat\b/i,
    /^wc\b/i,
    /^du\b/i,
    /^df\b/i,
    /^ps\b/i,
    /^pwd\b/i,
    /^echo\b/i,
    /^date\b/i,
    /^which\b/i,
    /^whereis\b/i,
    /^type\b/i,
    /^alias\b/i,
    /^env\b/i,
    /^printenv\b/i,
  ];
  
  for (const pattern of readOnlyPatterns) {
    if (pattern.test(command.trim())) {
      // 特殊处理：检查 find 命令是否有危险选项
      if (pattern.source.includes('find')) {
        if (/find\s+.*\s+-exec\b/i.test(command) || 
            /find\s+.*\s+-delete\b/i.test(command)) {
          return false;
        }
      }
      return true;
    }
  }
  
  return false;
}

/**
 * 检查是否修改文件系统
 */
function modifiesFileSystem(command: string): boolean {
  const modifyPatterns = [
    // 文件创建和修改
    />\s+/i,           // 输出重定向
    />>\s+/i,          // 追加重定向
    /touch\s+/i,
    /mkdir\s+/i,
    /rmdir\s+/i,
    
    // 文件编辑
    /sed\s+/i,
    /awk\s+/i,
    /perl\s+/i,
    /python\s+/i,
    /ruby\s+/i,
    
    // 文件移动和复制
    /mv\s+/i,
    /cp\s+/i,
    /ln\s+/i,
    
    // 包管理
    /apt\s+/i,
    /apt-get\s+/i,
    /yum\s+/i,
    /dnf\s+/i,
    /pacman\s+/i,
    /npm\s+/i,
    /yarn\s+/i,
    /pnpm\s+/i,
    /cargo\s+/i,
    /pip\s+/i,
    /pip3\s+/i,
    
    // 版本控制
    /git\s+/i,
    /svn\s+/i,
    /hg\s+/i,
  ];
  
  return modifyPatterns.some(pattern => pattern.test(command));
}

/**
 * 检查是否执行外部程序
 */
function executesExternalProgram(command: string): boolean {
  const executePatterns = [
    // 脚本执行
    /\.\s+/i,          // source
    /source\s+/i,
    /bash\s+/i,
    /sh\s+/i,
    /zsh\s+/i,
    /ksh\s+/i,
    /fish\s+/i,
    
    // 程序执行
    /node\s+/i,
    /python\s+/i,
    /python3\s+/i,
    /ruby\s+/i,
    /perl\s+/i,
    /java\s+/i,
    /go\s+/i,
    /rust\s+/i,
    /c\+\+\s+/i,
    /g\+\+\s+/i,
    
    // 构建工具
    /make\s+/i,
    /cmake\s+/i,
    /ninja\s+/i,
    /gradle\s+/i,
    /maven\s+/i,
    /ant\s+/i,
  ];
  
  return executePatterns.some(pattern => pattern.test(command));
}

/**
 * 检查是否是复杂命令
 */
function isComplexCommand(command: string): boolean {
  // 检查命令长度
  if (command.length > 1000) {
    return true;
  }
  
  // 检查命令复杂度（特殊字符数量）
  const specialChars = ['|', '&', ';', '>', '<', '`', '$', '(', ')', '{', '}'];
  const specialCharCount = specialChars.reduce(
    (count, char) => count + (command.split(char).length - 1), 
    0
  );
  
  if (specialCharCount > 10) {
    return true;
  }
  
  // 检查管道数量
  const pipeCount = (command.match(/\|/g) || []).length;
  if (pipeCount > 3) {
    return true;
  }
  
  // 检查重定向数量
  const redirectCount = (command.match(/[><]/g) || []).length;
  if (redirectCount > 3) {
    return true;
  }
  
  return false;
}

/**
 * 检查是否包含被排除的命令（不应在沙箱中运行）
 */
export function containsExcludedCommand(command: string): boolean {
  // 被排除的命令列表（这些命令应该在宿主环境中运行）
  const excludedCommands = [
    // 编辑器
    'vim',
    'vi',
    'nano',
    'emacs',
    
    // 终端多路复用器
    'tmux',
    'screen',
    
    // 交互式程序
    'less',
    'more',
    'man',
    'info',
    
    // 开发工具
    'docker',
    'docker-compose',
    'kubectl',
    'terraform',
  ];
  
  const firstWord = command.trim().split(/\s+/)[0];
  return excludedCommands.includes(firstWord);
}