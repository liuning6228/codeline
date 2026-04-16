"use strict";
/**
 * 命令解析器
 * 解析Shell命令，提取命令结构、参数和语义信息
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandParser = exports.CommandType = void 0;
exports.createCommandParser = createCommandParser;
/**
 * 命令类型
 */
var CommandType;
(function (CommandType) {
    CommandType["FILE_OPERATION"] = "file_operation";
    CommandType["PROCESS_MANAGEMENT"] = "process_management";
    CommandType["NETWORK"] = "network";
    CommandType["SYSTEM_INFO"] = "system_info";
    CommandType["PACKAGE_MANAGEMENT"] = "package_management";
    CommandType["VERSION_CONTROL"] = "version_control";
    CommandType["BUILD_TOOL"] = "build_tool";
    CommandType["TEXT_PROCESSING"] = "text_processing";
    CommandType["OTHER"] = "other";
})(CommandType || (exports.CommandType = CommandType = {}));
/**
 * 命令解析器
 */
class CommandParser {
    static DANGEROUS_PATTERNS = [
        { pattern: /rm\s+-rf\s+\/\S*/i, risk: 10, type: CommandType.FILE_OPERATION },
        { pattern: /dd\s+if=\/dev\/zero/i, risk: 9, type: CommandType.FILE_OPERATION },
        { pattern: /mkfs\.?\s+/i, risk: 9, type: CommandType.FILE_OPERATION },
        { pattern: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\};\s*:/i, risk: 10, type: CommandType.PROCESS_MANAGEMENT }, // fork bomb
        { pattern: /chmod\s+-R\s+777\s+\//i, risk: 8, type: CommandType.FILE_OPERATION },
        { pattern: /chown\s+-R\s+root:root\s+\//i, risk: 8, type: CommandType.FILE_OPERATION },
        { pattern: /wget\s+.*\|\s*sh/i, risk: 9, type: CommandType.NETWORK },
        { pattern: /curl\s+.*\|\s*sh/i, risk: 9, type: CommandType.NETWORK },
        { pattern: /sudo\s+/i, risk: 7, type: CommandType.SYSTEM_INFO },
        { pattern: /^kill\s+-9/i, risk: 7, type: CommandType.PROCESS_MANAGEMENT },
        { pattern: /^find\s+.*\s+-exec\s+/i, risk: 6, type: CommandType.FILE_OPERATION }
    ];
    static READ_ONLY_COMMANDS = [
        'ls', 'cat', 'grep', 'find', 'file', 'stat', 'read', 'echo', 'print', 'pwd',
        'whoami', 'hostname', 'uname', 'date', 'cal', 'df', 'du', 'free', 'ps', 'top',
        'netstat', 'ifconfig', 'ping', 'traceroute', 'dig', 'nslookup', 'curl', 'wget',
        'git', 'svn', 'hg', 'make', 'gcc', 'clang', 'python', 'node', 'npm', 'yarn'
    ];
    static COMMAND_SEMANTICS = {
        // 文件操作
        'cp': { type: CommandType.FILE_OPERATION, riskLevel: 3, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'medium' },
        'mv': { type: CommandType.FILE_OPERATION, riskLevel: 4, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'medium' },
        'rm': { type: CommandType.FILE_OPERATION, riskLevel: 7, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'high' },
        'mkdir': { type: CommandType.FILE_OPERATION, riskLevel: 2, readOnly: false, systemImpact: false, suggestedSandboxLevel: 'low' },
        'touch': { type: CommandType.FILE_OPERATION, riskLevel: 1, readOnly: false, systemImpact: false, suggestedSandboxLevel: 'low' },
        // 文本处理
        'grep': { type: CommandType.TEXT_PROCESSING, riskLevel: 1, readOnly: true, systemImpact: false, suggestedSandboxLevel: 'none' },
        'sed': { type: CommandType.TEXT_PROCESSING, riskLevel: 3, readOnly: false, systemImpact: false, suggestedSandboxLevel: 'low' },
        'awk': { type: CommandType.TEXT_PROCESSING, riskLevel: 2, readOnly: true, systemImpact: false, suggestedSandboxLevel: 'none' },
        'cut': { type: CommandType.TEXT_PROCESSING, riskLevel: 1, readOnly: true, systemImpact: false, suggestedSandboxLevel: 'none' },
        'sort': { type: CommandType.TEXT_PROCESSING, riskLevel: 1, readOnly: true, systemImpact: false, suggestedSandboxLevel: 'none' },
        // 版本控制
        'git': { type: CommandType.VERSION_CONTROL, riskLevel: 4, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'medium' },
        // 包管理
        'npm': { type: CommandType.PACKAGE_MANAGEMENT, riskLevel: 5, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'medium' },
        'yarn': { type: CommandType.PACKAGE_MANAGEMENT, riskLevel: 5, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'medium' },
        'pip': { type: CommandType.PACKAGE_MANAGEMENT, riskLevel: 5, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'medium' },
        // 构建工具
        'make': { type: CommandType.BUILD_TOOL, riskLevel: 4, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'medium' },
        'cmake': { type: CommandType.BUILD_TOOL, riskLevel: 3, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'medium' },
        // 进程管理
        'kill': { type: CommandType.PROCESS_MANAGEMENT, riskLevel: 8, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'high' },
        'pkill': { type: CommandType.PROCESS_MANAGEMENT, riskLevel: 8, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'high' },
        // 网络
        'ssh': { type: CommandType.NETWORK, riskLevel: 6, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'high' },
        'scp': { type: CommandType.NETWORK, riskLevel: 5, readOnly: false, systemImpact: true, suggestedSandboxLevel: 'medium' },
    };
    /**
     * 解析命令字符串
     */
    parse(command) {
        const trimmed = command.trim();
        // 基本解析
        const parts = this.tokenize(trimmed);
        const parsed = {
            raw: trimmed,
            command: '',
            args: [],
            options: {},
            redirects: { append: false },
            pipeline: [],
            background: false,
            env: {}
        };
        if (parts.length === 0) {
            return parsed;
        }
        // 解析环境变量
        let startIndex = 0;
        while (startIndex < parts.length && parts[startIndex].includes('=')) {
            const [key, value] = parts[startIndex].split('=', 2);
            parsed.env[key] = value;
            startIndex++;
        }
        if (startIndex >= parts.length) {
            return parsed;
        }
        // 检查是否后台运行
        if (parts[parts.length - 1] === '&') {
            parsed.background = true;
            parts.pop();
        }
        // 解析命令和参数
        parsed.command = parts[startIndex];
        parsed.args = parts.slice(startIndex + 1);
        // 提取选项
        this.extractOptions(parsed);
        // 解析重定向
        this.extractRedirects(parsed);
        // 解析管道
        this.extractPipeline(parsed);
        // 语义分析
        parsed.semantic = this.analyzeSemantics(parsed);
        return parsed;
    }
    /**
     * 分析命令语义
     */
    analyzeSemantics(parsed) {
        const command = parsed.command.toLowerCase();
        const baseSemantic = CommandParser.COMMAND_SEMANTICS[command] || {
            type: CommandType.OTHER,
            riskLevel: 3,
            readOnly: CommandParser.READ_ONLY_COMMANDS.includes(command),
            systemImpact: false,
            suggestedSandboxLevel: 'medium'
        };
        // 检查危险模式
        let riskLevel = baseSemantic.riskLevel || 3;
        let dangerousPattern = '';
        for (const { pattern, risk } of CommandParser.DANGEROUS_PATTERNS) {
            if (pattern.test(parsed.raw)) {
                if (risk > riskLevel) {
                    riskLevel = risk;
                    dangerousPattern = pattern.source;
                }
            }
        }
        // 根据参数调整风险
        if (parsed.args.some(arg => arg.includes('*') || arg.includes('?'))) {
            riskLevel = Math.max(riskLevel, 4);
        }
        if (parsed.args.some(arg => arg.startsWith('-'))) {
            const dangerousFlags = ['R', 'r', 'f', 'force', 'recursive'];
            for (const flag of dangerousFlags) {
                if (parsed.args.some(arg => arg.includes(flag))) {
                    riskLevel = Math.max(riskLevel, 5);
                    break;
                }
            }
        }
        // 确定沙箱级别
        let suggestedSandboxLevel = 'medium';
        if (riskLevel >= 8) {
            suggestedSandboxLevel = 'high';
        }
        else if (riskLevel >= 5) {
            suggestedSandboxLevel = 'medium';
        }
        else if (riskLevel >= 3) {
            suggestedSandboxLevel = 'low';
        }
        else {
            suggestedSandboxLevel = 'none';
        }
        // 生成关键词
        const keywords = [command];
        if (parsed.args.length > 0) {
            keywords.push(...parsed.args.slice(0, 3));
        }
        // 生成描述
        let description = `执行 ${command} 命令`;
        if (dangerousPattern) {
            description += ` (检测到危险模式: ${dangerousPattern})`;
        }
        return {
            type: baseSemantic.type || CommandType.OTHER,
            riskLevel,
            readOnly: baseSemantic.readOnly || false,
            systemImpact: baseSemantic.systemImpact || false,
            suggestedSandboxLevel,
            keywords,
            description
        };
    }
    /**
     * 验证命令安全性
     */
    validateSafety(parsed) {
        const semantic = parsed.semantic || this.analyzeSemantics(parsed);
        const warnings = [];
        if (semantic.riskLevel >= 8) {
            warnings.push(`高风险命令 (等级: ${semantic.riskLevel})`);
        }
        if (semantic.riskLevel >= 5 && !semantic.readOnly) {
            warnings.push('此命令可能修改系统状态');
        }
        // 检查参数中的潜在问题
        for (const arg of parsed.args) {
            if (arg.includes('..') && (arg.includes('/') || arg.includes('\\'))) {
                warnings.push('参数可能包含路径遍历攻击');
            }
            if (arg.includes(';') || arg.includes('|') || arg.includes('&') || arg.includes('`')) {
                warnings.push('参数可能包含命令注入字符');
            }
        }
        return {
            safe: semantic.riskLevel < 7,
            warnings,
            riskLevel: semantic.riskLevel
        };
    }
    /**
     * 获取命令建议
     */
    getSuggestions(parsed) {
        const suggestions = [];
        const semantic = parsed.semantic || this.analyzeSemantics(parsed);
        if (semantic.riskLevel >= 7) {
            suggestions.push('考虑使用沙箱环境执行此命令');
            suggestions.push('在执行前确认命令的意图');
        }
        if (!semantic.readOnly) {
            suggestions.push('此命令会修改文件系统，建议先备份重要数据');
        }
        if (parsed.args.some(arg => arg.includes('*'))) {
            suggestions.push('通配符可能匹配意外文件，建议先列出匹配的文件');
        }
        return suggestions;
    }
    // ==================== 私有方法 ====================
    tokenize(command) {
        const tokens = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let escapeNext = false;
        for (let i = 0; i < command.length; i++) {
            const char = command[i];
            if (escapeNext) {
                current += char;
                escapeNext = false;
                continue;
            }
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            if (char === '"' || char === "'") {
                if (!inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                }
                else if (char === quoteChar) {
                    inQuotes = false;
                    quoteChar = '';
                }
                else {
                    current += char;
                }
                continue;
            }
            if (char === ' ' && !inQuotes) {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                continue;
            }
            current += char;
        }
        if (current) {
            tokens.push(current);
        }
        return tokens;
    }
    extractOptions(parsed) {
        const options = {};
        const remainingArgs = [];
        for (let i = 0; i < parsed.args.length; i++) {
            const arg = parsed.args[i];
            if (arg.startsWith('--')) {
                // 长选项 --option=value 或 --option value
                const option = arg.slice(2);
                if (option.includes('=')) {
                    const [key, value] = option.split('=', 2);
                    options[key] = value;
                }
                else {
                    options[option] = true;
                }
            }
            else if (arg.startsWith('-') && arg.length > 1) {
                // 短选项 -abc 或 -a value
                const flags = arg.slice(1).split('');
                for (const flag of flags) {
                    options[flag] = true;
                }
            }
            else {
                remainingArgs.push(arg);
            }
        }
        parsed.options = options;
        parsed.args = remainingArgs;
    }
    extractRedirects(parsed) {
        const redirects = parsed.redirects;
        const remainingArgs = [];
        for (let i = 0; i < parsed.args.length; i++) {
            const arg = parsed.args[i];
            if (arg === '>' || arg === '>>') {
                if (i + 1 < parsed.args.length) {
                    redirects.stdout = parsed.args[i + 1];
                    redirects.append = arg === '>>';
                    i++; // 跳过文件名
                }
            }
            else if (arg === '2>') {
                if (i + 1 < parsed.args.length) {
                    redirects.stderr = parsed.args[i + 1];
                    i++;
                }
            }
            else if (arg === '<') {
                if (i + 1 < parsed.args.length) {
                    redirects.stdin = parsed.args[i + 1];
                    i++;
                }
            }
            else {
                remainingArgs.push(arg);
            }
        }
        parsed.args = remainingArgs;
    }
    extractPipeline(parsed) {
        const pipelineParts = [];
        let currentPart = [];
        for (const arg of [...parsed.args, '|']) {
            if (arg === '|') {
                if (currentPart.length > 0) {
                    pipelineParts.push(currentPart.join(' '));
                    currentPart = [];
                }
            }
            else {
                currentPart.push(arg);
            }
        }
        // 移除最后一个空部分
        if (pipelineParts.length > 0) {
            // 第一个命令已经解析过了，所以从第二个开始
            parsed.pipeline = pipelineParts.slice(1).map(part => this.parse(part));
            // 更新args为管道第一部分
            parsed.args = pipelineParts[0]?.split(' ') || [];
        }
    }
}
exports.CommandParser = CommandParser;
/**
 * 创建命令解析器实例
 */
function createCommandParser() {
    return new CommandParser();
}
//# sourceMappingURL=CommandParser.js.map