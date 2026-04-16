"use strict";
/**
 * TerminalProcess - 终端进程执行器
 * 提供流式命令执行、输出捕获和进程管理
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
exports.TerminalProcess = exports.ProcessState = void 0;
exports.createTerminalProcess = createTerminalProcess;
exports.executeCommand = executeCommand;
const child_process = __importStar(require("child_process"));
const events_1 = require("events");
/**
 * 进程状态
 */
var ProcessState;
(function (ProcessState) {
    ProcessState["PENDING"] = "pending";
    ProcessState["RUNNING"] = "running";
    ProcessState["COMPLETED"] = "completed";
    ProcessState["FAILED"] = "failed";
    ProcessState["CANCELLED"] = "cancelled";
    ProcessState["TIMEOUT"] = "timeout";
})(ProcessState || (exports.ProcessState = ProcessState = {}));
/**
 * 终端进程类
 */
class TerminalProcess extends events_1.EventEmitter {
    process = null;
    config;
    state = ProcessState.PENDING;
    startTime = null;
    endTime = null;
    stdout = '';
    stderr = '';
    timeoutId = null;
    isDisposed = false;
    constructor(config) {
        super();
        this.config = {
            shell: true,
            encoding: 'utf8',
            maxBuffer: 1024 * 1024, // 1MB
            ...config
        };
    }
    /**
     * 启动进程
     */
    start() {
        if (this.state !== ProcessState.PENDING) {
            return Promise.reject(new Error(`Process already ${this.state}`));
        }
        return new Promise((resolve, reject) => {
            try {
                this.startTime = new Date();
                this.state = ProcessState.RUNNING;
                // 设置超时
                if (this.config.timeout && this.config.timeout > 0) {
                    this.timeoutId = setTimeout(() => {
                        this.handleTimeout();
                    }, this.config.timeout);
                }
                // 启动进程
                this.process = child_process.spawn(this.config.command, this.config.args || [], {
                    cwd: this.config.cwd,
                    env: { ...process.env, ...this.config.env },
                    shell: this.config.shell,
                    stdio: ['pipe', 'pipe', 'pipe']
                });
                // 捕获输出
                this.process.stdout?.on('data', (data) => {
                    const output = data.toString(this.config.encoding);
                    this.stdout += output;
                    this.emit('output', {
                        type: 'stdout',
                        data: output,
                        timestamp: new Date()
                    });
                });
                this.process.stderr?.on('data', (data) => {
                    const output = data.toString(this.config.encoding);
                    this.stderr += output;
                    this.emit('output', {
                        type: 'stderr',
                        data: output,
                        timestamp: new Date()
                    });
                });
                // 进程结束
                this.process.on('close', (exitCode, signal) => {
                    this.handleClose(exitCode, signal);
                    resolve(this.getResult());
                });
                this.process.on('error', (error) => {
                    this.handleError(error);
                    reject(error);
                });
                // 发出启动事件
                this.emit('start', { pid: this.process.pid, command: this.config.command });
            }
            catch (error) {
                this.handleError(error);
                reject(error);
            }
        });
    }
    /**
     * 停止进程
     */
    stop(signal = 'SIGTERM') {
        if (!this.process || this.state !== ProcessState.RUNNING) {
            return false;
        }
        try {
            this.process.kill(signal);
            this.state = ProcessState.CANCELLED;
            this.cleanup();
            this.emit('cancelled', { signal });
            return true;
        }
        catch (error) {
            console.error('Failed to stop process:', error);
            return false;
        }
    }
    /**
     * 获取进程状态
     */
    getState() {
        return this.state;
    }
    /**
     * 获取进程ID
     */
    getPid() {
        return this.process?.pid ?? null;
    }
    /**
     * 获取输出
     */
    getOutput() {
        return {
            stdout: this.stdout,
            stderr: this.stderr
        };
    }
    /**
     * 获取运行时间
     */
    getDuration() {
        if (!this.startTime)
            return null;
        const end = this.endTime || new Date();
        return end.getTime() - this.startTime.getTime();
    }
    /**
     * 写入输入（如果进程支持）
     */
    writeInput(data) {
        if (!this.process || !this.process.stdin || this.state !== ProcessState.RUNNING) {
            return false;
        }
        try {
            this.process.stdin.write(data);
            return true;
        }
        catch (error) {
            console.error('Failed to write to stdin:', error);
            return false;
        }
    }
    /**
     * 关闭输入流
     */
    endInput() {
        if (!this.process || !this.process.stdin || this.state !== ProcessState.RUNNING) {
            return false;
        }
        try {
            this.process.stdin.end();
            return true;
        }
        catch (error) {
            console.error('Failed to end stdin:', error);
            return false;
        }
    }
    /**
     * 清理资源
     */
    dispose() {
        if (this.isDisposed)
            return;
        this.stop();
        this.cleanup();
        this.removeAllListeners();
        this.isDisposed = true;
    }
    // ==================== 私有方法 ====================
    handleClose(exitCode, signal) {
        this.endTime = new Date();
        this.cleanupTimeout();
        if (this.state === ProcessState.CANCELLED) {
            // 已处理取消
            return;
        }
        this.state = exitCode === 0 ? ProcessState.COMPLETED : ProcessState.FAILED;
        this.emit('close', { exitCode, signal, duration: this.getDuration() });
    }
    handleError(error) {
        this.endTime = new Date();
        this.state = ProcessState.FAILED;
        this.cleanupTimeout();
        this.emit('error', error);
    }
    handleTimeout() {
        this.endTime = new Date();
        this.state = ProcessState.TIMEOUT;
        // 尝试终止进程
        if (this.process) {
            this.process.kill('SIGKILL');
        }
        this.cleanup();
        this.emit('timeout', { duration: this.getDuration() });
    }
    cleanup() {
        this.cleanupTimeout();
        if (this.process) {
            // 移除事件监听器以避免内存泄漏
            this.process.removeAllListeners();
            this.process = null;
        }
    }
    cleanupTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    getResult() {
        const duration = this.getDuration() || 0;
        return {
            exitCode: this.process?.exitCode ?? null,
            signal: this.process?.signalCode ?? null,
            stdout: this.stdout,
            stderr: this.stderr,
            duration,
            state: this.state,
            ...(this.state === ProcessState.FAILED && { error: new Error('Process failed') })
        };
    }
}
exports.TerminalProcess = TerminalProcess;
/**
 * 创建终端进程
 */
function createTerminalProcess(config) {
    return new TerminalProcess(config);
}
/**
 * 执行命令并返回结果
 */
async function executeCommand(command, options) {
    const process = new TerminalProcess({
        command,
        ...options
    });
    // 收集输出
    const outputChunks = [];
    process.on('output', (event) => {
        outputChunks.push(event.data);
    });
    try {
        const result = await process.start();
        return result;
    }
    finally {
        process.dispose();
    }
}
//# sourceMappingURL=TerminalProcess.js.map