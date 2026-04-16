"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
/**
 * Logger utility for consistent logging throughout the application
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Singleton Logger class
 */
class Logger {
    static instance;
    config;
    constructor() {
        this.config = {
            level: LogLevel.INFO,
            timestamp: true,
            colors: process.stdout.isTTY
        };
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * Configure the logger
     */
    configure(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Log debug message
     */
    debug(message, ...args) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.log(LogLevel.DEBUG, message, args);
        }
    }
    /**
     * Log info message
     */
    info(message, ...args) {
        if (this.shouldLog(LogLevel.INFO)) {
            this.log(LogLevel.INFO, message, args);
        }
    }
    /**
     * Log warning message
     */
    warn(message, ...args) {
        if (this.shouldLog(LogLevel.WARN)) {
            this.log(LogLevel.WARN, message, args);
        }
    }
    /**
     * Log error message
     */
    error(message, ...args) {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.log(LogLevel.ERROR, message, args);
        }
    }
    /**
     * Check if message should be logged based on log level
     */
    shouldLog(level) {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
    /**
     * Format and output log message
     */
    log(level, message, args) {
        const timestamp = this.config.timestamp ? this.formatTimestamp() : "";
        const levelStr = this.formatLevel(level);
        const formattedMessage = this.formatMessage(message, args);
        const logLine = `${timestamp}${levelStr} ${formattedMessage}`;
        console.log(logLine);
    }
    /**
     * Format timestamp
     */
    formatTimestamp() {
        const now = new Date();
        return `[${now.toISOString()}] `;
    }
    /**
     * Format log level with colors if enabled
     */
    formatLevel(level) {
        if (!this.config.colors) {
            return `[${level.padEnd(5)}]`;
        }
        const colors = {
            [LogLevel.DEBUG]: "\x1b[36m", // Cyan
            [LogLevel.INFO]: "\x1b[32m", // Green
            [LogLevel.WARN]: "\x1b[33m", // Yellow
            [LogLevel.ERROR]: "\x1b[31m" // Red
        };
        const reset = "\x1b[0m";
        return `${colors[level]}[${level.padEnd(5)}]${reset}`;
    }
    /**
     * Format message and arguments
     */
    formatMessage(message, args) {
        if (args.length === 0) {
            return message;
        }
        try {
            // Handle error objects specially
            const formattedArgs = args.map(arg => {
                if (arg instanceof Error) {
                    return {
                        message: arg.message,
                        stack: arg.stack,
                        name: arg.name
                    };
                }
                return arg;
            });
            return `${message} ${JSON.stringify(formattedArgs, null, 2)}`;
        }
        catch {
            // Fallback if JSON.stringify fails
            return `${message} ${args.join(" ")}`;
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map