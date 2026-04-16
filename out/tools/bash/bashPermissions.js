"use strict";
/**
 * BashTool 权限检查模块
 * 简化版本，提供基本的命令安全性检查
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBashPermissions = checkBashPermissions;
exports.commandHasAnyCd = commandHasAnyCd;
exports.matchWildcardPattern = matchWildcardPattern;
exports.permissionRuleExtractPrefix = permissionRuleExtractPrefix;
exports.suggestionForExactCommand = suggestionForExactCommand;
/**
 * 检查 Bash 命令权限
 */
async function checkBashPermissions(params, context) {
    const { command } = params;
    // 1. 检查危险命令模式
    const dangerousPatterns = [
        // 系统破坏性命令
        /rm\s+-rf\s+\/\S*/i, // rm -rf /
        /rm\s+-rf\s+\/\*/i, // rm -rf /*
        /dd\s+if=\/dev\/zero/i, // dd if=/dev/zero
        /dd\s+of=\/dev\/sd[a-z]/i, // dd to disk
        /mkfs\.?\s+/i, // mkfs
        /fdisk\s+/i, // fdisk
        /parted\s+/i, // parted
        /format\s+/i, // format
        // 权限修改命令
        /chmod\s+-R\s+777\s+\//i, // chmod -R 777 /
        /chown\s+-R\s+root:root\s+\//i, // chown -R root:root /
        // 恶意命令
        /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\};\s*:/i, // fork bomb
        // 从网络下载并执行的命令
        /wget\s+.*\|\s*sh/i, // wget ... | sh
        /curl\s+.*\|\s*sh/i, // curl ... | sh
        // 系统服务操作
        /systemctl\s+stop\s+.*-service/i,
        /service\s+.*\s+stop/i,
        // 网络操作
        /iptables\s+-F/i, // flush iptables
        /ufw\s+disable/i, // disable firewall
    ];
    for (const pattern of dangerousPatterns) {
        if (pattern.test(command)) {
            return {
                allowed: false,
                reason: `检测到危险命令: ${command}`,
                requiresUserConfirmation: false,
            };
        }
    }
    // 2. 检查可疑命令（需要用户确认）
    const suspiciousPatterns = [
        /rm\s+-rf/i, // 递归删除
        /chmod\s+-R/i, // 递归修改权限
        /chown\s+-R/i, // 递归修改所有者
        /find\s+.*\s+-exec\s+rm/i, // find 配合 rm
        /find\s+.*\s+-delete/i, // find 删除
        /tar\s+.*\s+--overwrite/i, // tar 覆盖
        /git\s+reset\s+--hard/i, // git 硬重置
        /git\s+clean\s+-fdx/i, // git 清理
    ];
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(command)) {
            return {
                allowed: true,
                requiresUserConfirmation: true,
                confirmationPrompt: `检测到潜在危险操作: ${command}\n是否继续执行？`,
            };
        }
    }
    // 3. 检查是否为只读命令
    if (isReadOnlyCommand(command)) {
        return {
            allowed: true,
            requiresUserConfirmation: false,
        };
    }
    // 4. 默认需要用户确认
    return {
        allowed: true,
        requiresUserConfirmation: true,
        confirmationPrompt: `是否执行命令: ${command}`,
    };
}
/**
 * 检查命令是否为只读操作
 */
function isReadOnlyCommand(command) {
    // 只读命令模式
    const readOnlyPatterns = [
        /^ls\b/i,
        /^cat\b/i,
        /^head\b/i,
        /^tail\b/i,
        /^grep\b/i,
        /^find\b/i, // 没有 -exec 或 -delete 的 find
        /^file\b/i,
        /^stat\b/i,
        /^wc\b/i,
        /^du\b/i,
        /^df\b/i,
        /^ps\b/i,
        /^top\b/i,
        /^htop\b/i,
        /^free\b/i,
        /^uptime\b/i,
        /^uname\b/i,
        /^whoami\b/i,
        /^pwd\b/i,
        /^echo\b/i,
        /^printf\b/i,
        /^date\b/i,
        /^cal\b/i,
        /^which\b/i,
        /^whereis\b/i,
        /^locate\b/i,
        /^type\b/i,
        /^alias\b/i,
        /^env\b/i,
        /^set\b/i,
        /^printenv\b/i,
    ];
    // 检查命令是否匹配只读模式
    for (const pattern of readOnlyPatterns) {
        if (pattern.test(command.trim())) {
            // 确保 find 命令没有危险选项
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
 * 检查命令是否有 CD 操作
 */
function commandHasAnyCd(command) {
    const cdPatterns = [
        /^cd\b/i,
        /&&\s+cd\b/i,
        /;\s+cd\b/i,
        /\|\s+cd\b/i,
        /\|\|\s+cd\b/i,
    ];
    return cdPatterns.some(pattern => pattern.test(command));
}
/**
 * 匹配通配符模式
 */
function matchWildcardPattern(pattern, command) {
    // 将通配符模式转换为正则表达式
    const regexPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 转义正则特殊字符
        .replace(/\*/g, '.*') // * 匹配任意字符
        .replace(/\?/g, '.'); // ? 匹配单个字符
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(command);
}
/**
 * 提取权限规则前缀
 */
function permissionRuleExtractPrefix(pattern) {
    // 如果模式以 * 结尾，返回前缀
    if (pattern.endsWith('*')) {
        return pattern.slice(0, -1).trim();
    }
    // 如果模式包含通配符，返回 null
    if (pattern.includes('*') || pattern.includes('?')) {
        return null;
    }
    // 精确匹配，返回完整模式
    return pattern;
}
/**
 * 为精确命令生成建议
 */
function suggestionForExactCommand(command) {
    return [
        {
            type: 'exact',
            pattern: command,
            action: 'allow',
            description: `总是允许命令: ${command}`,
        },
        {
            type: 'exact',
            pattern: command,
            action: 'deny',
            description: `总是拒绝命令: ${command}`,
        },
        {
            type: 'exact',
            pattern: command,
            action: 'ask',
            description: `总是询问命令: ${command}`,
        },
    ];
}
//# sourceMappingURL=bashPermissions.js.map