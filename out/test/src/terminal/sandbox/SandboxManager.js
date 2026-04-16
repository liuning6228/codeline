"use strict";
/**
 * 沙箱管理器
 * 提供安全的命令执行环境，限制资源访问和操作
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxManager = void 0;
exports.createSandboxManager = createSandboxManager;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const TerminalProcess_1 = require("../executor/TerminalProcess");
/**
 * 沙箱管理器
 */
class SandboxManager {
    config;
    tempDirs = [];
    constructor(config) {
        this.config = {
            workspaceRoot: process.cwd(),
            allowedPaths: [process.cwd()],
            forbiddenPatterns: [
                /rm\s+-rf\s+\/\S*/i,
                /dd\s+if=\/dev\/zero/i,
                /mkfs\.?\s+/i,
                /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\};\s*:/i, // fork bomb
                /chmod\s+-R\s+777\s+\//i,
                /wget\s+.*\|\s*sh/i,
                /curl\s+.*\|\s*sh/i
            ],
            maxExecutionTime: 30000,
            maxOutputSize: 1024 * 1024, // 1MB
            allowNetwork: false,
            allowedEnvVars: ['PATH', 'HOME', 'USER', 'LANG', 'TERM'],
            ...config
        };
    }
    /**
     * 检查命令是否安全
     */
    validateCommand(command) {
        const violations = [];
        // 检查禁止模式
        for (const pattern of this.config.forbiddenPatterns) {
            if (pattern.test(command)) {
                violations.push(`命令匹配禁止模式: ${pattern.source}`);
            }
        }
        // 检查路径遍历
        if (command.includes('..') && command.includes('/')) {
            violations.push('命令可能包含路径遍历攻击');
        }
        // 检查危险的系统调用
        const dangerousSyscalls = ['ptrace', 'mount', 'umount', 'chroot', 'setuid', 'setgid'];
        for (const syscall of dangerousSyscalls) {
            if (command.includes(syscall)) {
                violations.push(`命令包含危险系统调用: ${syscall}`);
            }
        }
        return {
            safe: violations.length === 0,
            violations,
            suggestedCommand: violations.length > 0 ? this.sanitizeCommand(command) : undefined
        };
    }
    /**
     * 在沙箱中执行命令
     */
    async executeInSandbox(command, options) {
        // 验证命令
        const validation = this.validateCommand(command);
        if (!validation.safe) {
            return {
                success: false,
                error: new Error(`命令安全检查失败: ${validation.violations.join(', ')}`),
                violations: validation.violations
            };
        }
        // 创建临时工作目录
        const tempDir = await this.createTempWorkspace();
        try {
            // 准备环境变量
            const env = this.prepareEnvironment();
            // 配置进程
            const processConfig = {
                command: validation.suggestedCommand || command,
                cwd: tempDir,
                env,
                timeout: this.config.maxExecutionTime,
                shell: true,
                maxBuffer: this.config.maxOutputSize,
                ...options
            };
            // 启动进程
            const process = new TerminalProcess_1.TerminalProcess(processConfig);
            // 监控资源使用
            const startTime = Date.now();
            let outputSize = 0;
            process.on('output', (event) => {
                outputSize += event.data.length;
                if (outputSize > this.config.maxOutputSize) {
                    process.stop('SIGKILL');
                    throw new Error(`输出超出限制: ${outputSize} > ${this.config.maxOutputSize}`);
                }
            });
            const result = await process.start();
            const resourceUsage = {
                cpuTime: Date.now() - startTime,
                memoryUsage: 0, // 在实际实现中需要更精确的监控
                diskRead: 0,
                diskWrite: 0
            };
            return {
                success: result.state === 'completed' && result.exitCode === 0,
                result: {
                    exitCode: result.exitCode,
                    stdout: result.stdout,
                    stderr: result.stderr,
                    duration: result.duration
                },
                resourceUsage
            };
        }
        catch (error) {
            return {
                success: false,
                error: error
            };
        }
        finally {
            // 清理临时目录
            await this.cleanupTempWorkspace(tempDir);
        }
    }
    /**
     * 创建受限文件系统视图
     */
    async createRestrictedFSView(targetDir) {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sandbox-'));
        this.tempDirs.push(tempDir);
        // 创建符号链接到允许的路径
        for (const allowedPath of this.config.allowedPaths) {
            const targetPath = path.join(tempDir, path.relative(this.config.workspaceRoot, allowedPath));
            await fs.mkdir(path.dirname(targetPath), { recursive: true });
            try {
                await fs.symlink(allowedPath, targetPath);
            }
            catch (error) {
                console.warn(`无法创建符号链接 ${allowedPath} -> ${targetPath}:`, error);
            }
        }
        return tempDir;
    }
    /**
     * 清理所有临时资源
     */
    async cleanup() {
        for (const dir of this.tempDirs) {
            try {
                await fs.rm(dir, { recursive: true, force: true });
            }
            catch (error) {
                console.warn(`清理临时目录失败 ${dir}:`, error);
            }
        }
        this.tempDirs = [];
    }
    // ==================== 私有方法 ====================
    sanitizeCommand(command) {
        // 简单的命令清理：移除危险选项
        let sanitized = command;
        // 替换危险模式
        sanitized = sanitized.replace(/rm\s+-rf\s+\/\S*/gi, 'rm -rf ./temp/*');
        sanitized = sanitized.replace(/dd\s+if=\/dev\/zero/gi, '# 危险的dd命令已被移除');
        sanitized = sanitized.replace(/wget\s+.*\|\s*sh/gi, '# 远程脚本执行已被阻止');
        sanitized = sanitized.replace(/curl\s+.*\|\s*sh/gi, '# 远程脚本执行已被阻止');
        return sanitized;
    }
    async createTempWorkspace() {
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeline-sandbox-'));
        this.tempDirs.push(tempDir);
        // 创建基本目录结构
        await fs.mkdir(path.join(tempDir, 'workspace'), { recursive: true });
        await fs.mkdir(path.join(tempDir, 'tmp'), { recursive: true });
        // 设置权限（在实际实现中需要更严格的权限控制）
        await fs.chmod(tempDir, 0o755);
        return path.join(tempDir, 'workspace');
    }
    prepareEnvironment() {
        const env = {};
        // 只允许白名单中的环境变量
        for (const key of this.config.allowedEnvVars) {
            if (process.env[key] !== undefined) {
                env[key] = process.env[key];
            }
        }
        // 添加沙箱特定环境变量
        env['SANDBOX'] = '1';
        env['SANDBOX_ROOT'] = this.config.workspaceRoot;
        env['SANDBOX_ALLOWED_PATHS'] = this.config.allowedPaths.join(':');
        // 限制PATH以防止执行系统命令
        env['PATH'] = '/usr/local/bin:/usr/bin:/bin';
        return env;
    }
    async cleanupTempWorkspace(dir) {
        try {
            const parentDir = path.dirname(dir);
            await fs.rm(parentDir, { recursive: true, force: true });
            // 从跟踪列表中移除
            const index = this.tempDirs.indexOf(parentDir);
            if (index > -1) {
                this.tempDirs.splice(index, 1);
            }
        }
        catch (error) {
            console.warn(`清理临时工作空间失败 ${dir}:`, error);
        }
    }
}
exports.SandboxManager = SandboxManager;
/**
 * 创建沙箱管理器实例
 */
function createSandboxManager(config) {
    return new SandboxManager(config);
}
//# sourceMappingURL=SandboxManager.js.map