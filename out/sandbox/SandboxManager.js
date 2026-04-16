"use strict";
/**
 * 沙箱管理器
 * 提供安全的命令执行环境，支持资源限制和隔离
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
exports.getDefaultSandboxManager = getDefaultSandboxManager;
exports.setDefaultSandboxManager = setDefaultSandboxManager;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * 沙箱管理器
 * 提供不同级别的命令执行隔离环境
 */
class SandboxManager {
    config;
    sandboxCounter = 0;
    activeSandboxes = new Map();
    outputChannel;
    constructor(config) {
        this.config = {
            defaultSandboxLevel: 'medium',
            enabled: true,
            sandboxRoot: path.join(os.tmpdir(), 'codeline-sandbox'),
            enableLogging: true,
            maxConcurrentSandboxes: 5,
            resourceLimits: {
                none: {},
                low: {
                    maxMemoryMB: 512,
                    maxCPUTimeSeconds: 30,
                    maxProcesses: 10,
                    maxFileSizeMB: 10,
                    allowedPaths: [process.cwd()],
                    allowNetwork: false,
                    allowEnvAccess: true,
                    allowExternalPrograms: false
                },
                medium: {
                    maxMemoryMB: 256,
                    maxCPUTimeSeconds: 15,
                    maxProcesses: 5,
                    maxFileSizeMB: 5,
                    allowedPaths: [process.cwd()],
                    allowNetwork: false,
                    allowEnvAccess: false,
                    allowExternalPrograms: false
                },
                high: {
                    maxMemoryMB: 128,
                    maxCPUTimeSeconds: 10,
                    maxProcesses: 3,
                    maxFileSizeMB: 1,
                    allowedPaths: [],
                    allowNetwork: false,
                    allowEnvAccess: false,
                    allowExternalPrograms: false
                }
            },
            ...config
        };
        this.outputChannel = vscode.window.createOutputChannel('CodeLine Sandbox');
        this.initializeSandboxRoot();
    }
    /**
     * 初始化沙箱根目录
     */
    initializeSandboxRoot() {
        try {
            if (!fs.existsSync(this.config.sandboxRoot)) {
                fs.mkdirSync(this.config.sandboxRoot, { recursive: true });
                this.log(`沙箱根目录已创建: ${this.config.sandboxRoot}`);
            }
            // 确保目录可写
            fs.accessSync(this.config.sandboxRoot, fs.constants.W_OK);
        }
        catch (error) {
            this.log(`沙箱根目录初始化失败: ${error}`);
            // 使用临时目录作为后备
            this.config.sandboxRoot = os.tmpdir();
        }
    }
    /**
     * 执行命令（带沙箱）
     */
    async executeCommand(command, options = {}) {
        const startTime = Date.now();
        const sandboxLevel = options.sandboxLevel || this.config.defaultSandboxLevel;
        // 如果不启用沙箱或级别为'none'，直接执行
        if (!this.config.enabled || sandboxLevel === 'none') {
            return this.executeWithoutSandbox(command, options, startTime, sandboxLevel);
        }
        // 检查并发限制
        if (this.activeSandboxes.size >= this.config.maxConcurrentSandboxes) {
            return {
                success: false,
                stdout: '',
                stderr: `达到最大并发沙箱限制 (${this.config.maxConcurrentSandboxes})`,
                duration: Date.now() - startTime,
                sandboxLevel
            };
        }
        // 创建沙箱环境
        const sandboxId = `sandbox-${++this.sandboxCounter}-${Date.now()}`;
        const sandboxPath = path.join(this.config.sandboxRoot, sandboxId);
        try {
            // 准备沙箱环境
            await this.prepareSandboxEnvironment(sandboxPath, sandboxLevel, options);
            // 在沙箱中执行命令
            const result = await this.executeInSandbox(command, sandboxPath, sandboxLevel, options, startTime);
            return result;
        }
        catch (error) {
            return {
                success: false,
                stdout: '',
                stderr: `沙箱执行失败: ${error.message}`,
                duration: Date.now() - startTime,
                sandboxLevel
            };
        }
        finally {
            // 清理沙箱（异步）
            this.cleanupSandbox(sandboxPath).catch(err => {
                this.log(`沙箱清理失败 ${sandboxId}: ${err}`);
            });
        }
    }
    /**
     * 无沙箱执行命令
     */
    async executeWithoutSandbox(command, options, startTime, sandboxLevel) {
        return new Promise((resolve) => {
            const cwd = options.cwd || process.cwd();
            const env = options.env || process.env;
            const timeout = options.timeout || 30000;
            this.log(`无沙箱执行命令: ${command}`);
            const childProcess = cp.exec(command, { cwd, env, timeout }, (error, stdout, stderr) => {
                const duration = Date.now() - startTime;
                resolve({
                    success: !error,
                    stdout: stdout || '',
                    stderr: stderr || '',
                    exitCode: error?.code || 0,
                    duration,
                    sandboxLevel
                });
            });
            // 处理实时输出
            if (options.onOutput) {
                childProcess.stdout?.on('data', (data) => {
                    options.onOutput?.(data.toString());
                });
            }
            if (options.onError) {
                childProcess.stderr?.on('data', (data) => {
                    options.onError?.(data.toString());
                });
            }
        });
    }
    /**
     * 准备沙箱环境
     */
    async prepareSandboxEnvironment(sandboxPath, sandboxLevel, options) {
        // 创建沙箱目录
        fs.mkdirSync(sandboxPath, { recursive: true });
        const limits = this.config.resourceLimits[sandboxLevel];
        // 创建基本文件系统结构
        const dirs = ['bin', 'lib', 'usr', 'tmp', 'home'];
        for (const dir of dirs) {
            const dirPath = path.join(sandboxPath, dir);
            fs.mkdirSync(dirPath, { recursive: true });
        }
        // 根据允许的路径创建符号链接或复制文件
        if (limits.allowedPaths && limits.allowedPaths.length > 0) {
            const allowedDir = path.join(sandboxPath, 'allowed');
            fs.mkdirSync(allowedDir, { recursive: true });
            for (const allowedPath of limits.allowedPaths) {
                try {
                    if (fs.existsSync(allowedPath)) {
                        const targetName = path.basename(allowedPath);
                        const linkPath = path.join(allowedDir, targetName);
                        // 尝试创建符号链接，如果失败则创建目录
                        try {
                            fs.symlinkSync(allowedPath, linkPath);
                        }
                        catch {
                            // 符号链接失败，创建空目录
                            fs.mkdirSync(linkPath, { recursive: true });
                        }
                    }
                }
                catch (error) {
                    this.log(`无法创建允许路径链接 ${allowedPath}: ${error}`);
                }
            }
        }
        // 创建资源限制配置文件
        const limitsConfig = {
            sandboxLevel,
            timestamp: new Date().toISOString(),
            limits
        };
        fs.writeFileSync(path.join(sandboxPath, '.sandbox-config.json'), JSON.stringify(limitsConfig, null, 2));
        this.log(`沙箱环境已准备: ${sandboxPath} (级别: ${sandboxLevel})`);
    }
    /**
     * 在沙箱中执行命令
     */
    async executeInSandbox(command, sandboxPath, sandboxLevel, options, startTime) {
        return new Promise((resolve) => {
            const limits = this.config.resourceLimits[sandboxLevel];
            const cwd = path.join(sandboxPath, 'home');
            const env = this.createSandboxEnvironment(limits);
            // 构建受限命令
            const restrictedCommand = this.applyResourceLimits(command, limits);
            this.log(`沙箱执行命令: ${restrictedCommand}`);
            const childProcess = cp.exec(restrictedCommand, {
                cwd,
                env,
                timeout: options.timeout || limits.maxCPUTimeSeconds ? limits.maxCPUTimeSeconds * 1000 : 30000
            }, (error, stdout, stderr) => {
                const duration = Date.now() - startTime;
                resolve({
                    success: !error,
                    stdout: stdout || '',
                    stderr: stderr || '',
                    exitCode: error?.code || 0,
                    duration,
                    sandboxLevel,
                    terminatedByLimits: error?.signal === 'SIGKILL' || error?.signal === 'SIGTERM'
                });
            });
            // 记录进程ID
            if (childProcess.pid) {
                this.activeSandboxes.set(sandboxPath, childProcess);
            }
            // 处理实时输出
            if (options.onOutput) {
                childProcess.stdout?.on('data', (data) => {
                    options.onOutput?.(data.toString());
                });
            }
            if (options.onError) {
                childProcess.stderr?.on('data', (data) => {
                    options.onError?.(data.toString());
                });
            }
            // 监控资源使用
            this.monitorResourceUsage(childProcess, limits, sandboxPath);
            // 进程结束时清理
            childProcess.on('exit', () => {
                this.activeSandboxes.delete(sandboxPath);
            });
        });
    }
    /**
     * 创建沙箱环境变量
     */
    createSandboxEnvironment(limits) {
        const env = { ...process.env };
        // 限制环境变量访问
        if (!limits.allowEnvAccess) {
            // 只保留基本的环境变量
            const allowedVars = ['PATH', 'HOME', 'LANG', 'TERM', 'SHELL', 'USER', 'LOGNAME'];
            Object.keys(env).forEach(key => {
                if (!allowedVars.includes(key)) {
                    delete env[key];
                }
            });
        }
        // 设置沙箱特定的环境变量
        env.CODELINE_SANDBOX = '1';
        env.SANDBOX_LEVEL = limits.maxMemoryMB ? 'restricted' : 'minimal';
        // 限制PATH以防执行外部程序
        if (!limits.allowExternalPrograms) {
            env.PATH = '/bin:/usr/bin';
        }
        return env;
    }
    /**
     * 应用资源限制到命令
     */
    applyResourceLimits(command, limits) {
        let wrappedCommand = command;
        // 使用ulimit设置资源限制（如果支持）
        const ulimitParts = [];
        if (limits.maxMemoryMB) {
            // 转换为KB
            const memoryKB = limits.maxMemoryMB * 1024;
            ulimitParts.push(`-v ${memoryKB}`); // 虚拟内存限制
        }
        if (limits.maxProcesses) {
            ulimitParts.push(`-u ${limits.maxProcesses}`); // 进程数限制
        }
        if (limits.maxFileSizeMB) {
            // 转换为512字节块
            const fileSizeBlocks = limits.maxFileSizeMB * 2048;
            ulimitParts.push(`-f ${fileSizeBlocks}`); // 文件大小限制
        }
        if (ulimitParts.length > 0) {
            wrappedCommand = `ulimit ${ulimitParts.join(' ')} && ${wrappedCommand}`;
        }
        // 使用timeout命令设置CPU时间限制
        if (limits.maxCPUTimeSeconds) {
            wrappedCommand = `timeout ${limits.maxCPUTimeSeconds}s ${wrappedCommand}`;
        }
        return wrappedCommand;
    }
    /**
     * 监控资源使用
     */
    monitorResourceUsage(childProcess, limits, sandboxPath) {
        // 简单实现：定期检查进程状态
        const checkInterval = setInterval(() => {
            if (!childProcess.pid) {
                clearInterval(checkInterval);
                return;
            }
            // 这里可以添加更复杂的资源监控逻辑
            // 例如使用ps命令检查内存使用等
        }, 1000);
        childProcess.on('exit', () => {
            clearInterval(checkInterval);
        });
    }
    /**
     * 清理沙箱
     */
    async cleanupSandbox(sandboxPath) {
        try {
            if (fs.existsSync(sandboxPath)) {
                // 递归删除沙箱目录
                const deleteRecursive = (dir) => {
                    if (fs.existsSync(dir)) {
                        fs.readdirSync(dir).forEach(file => {
                            const curPath = path.join(dir, file);
                            if (fs.lstatSync(curPath).isDirectory()) {
                                deleteRecursive(curPath);
                            }
                            else {
                                fs.unlinkSync(curPath);
                            }
                        });
                        fs.rmdirSync(dir);
                    }
                };
                deleteRecursive(sandboxPath);
                this.log(`沙箱已清理: ${sandboxPath}`);
            }
        }
        catch (error) {
            this.log(`沙箱清理错误 ${sandboxPath}: ${error}`);
            // 如果无法删除，至少尝试重命名以防止重用
            try {
                const oldPath = sandboxPath + '.deleted';
                fs.renameSync(sandboxPath, oldPath);
            }
            catch (renameError) {
                // 忽略重命名错误
            }
        }
    }
    /**
     * 获取当前活跃沙箱数量
     */
    getActiveSandboxCount() {
        return this.activeSandboxes.size;
    }
    /**
     * 获取沙箱配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 更新沙箱配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.log(`沙箱配置已更新`);
    }
    /**
     * 启用/禁用沙箱
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        this.log(`沙箱已${enabled ? '启用' : '禁用'}`);
    }
    /**
     * 日志记录
     */
    log(message) {
        if (this.config.enableLogging) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] ${message}`;
            this.outputChannel.appendLine(logMessage);
        }
    }
    /**
     * 销毁沙箱管理器
     */
    dispose() {
        // 终止所有活跃沙箱
        for (const [sandboxPath, process] of this.activeSandboxes) {
            try {
                process.kill('SIGKILL');
            }
            catch (error) {
                // 忽略终止错误
            }
        }
        this.activeSandboxes.clear();
        this.outputChannel.dispose();
    }
}
exports.SandboxManager = SandboxManager;
/**
 * 默认沙箱管理器实例
 */
let defaultSandboxManager;
/**
 * 获取默认沙箱管理器
 */
function getDefaultSandboxManager() {
    if (!defaultSandboxManager) {
        defaultSandboxManager = new SandboxManager();
    }
    return defaultSandboxManager;
}
/**
 * 设置默认沙箱管理器
 */
function setDefaultSandboxManager(manager) {
    defaultSandboxManager = manager;
}
//# sourceMappingURL=SandboxManager.js.map