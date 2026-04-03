/**
 * Logger utility for consistent logging throughout the application
 */
export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}
/**
 * Logger configuration interface
 */
interface LoggerConfig {
    level: LogLevel;
    timestamp: boolean;
    colors: boolean;
}
/**
 * Singleton Logger class
 */
export class Logger {
    private static instance: Logger;
    private config: LoggerConfig;
    private constructor() {
        this.config = {
            level: LogLevel.INFO,
            timestamp: true,
            colors: process.stdout.isTTY
        };
    }
    /**
     * Get singleton instance
     */
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * Configure the logger
     */
    public configure(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }
    /**
     * Log debug message
     */
    public debug(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.log(LogLevel.DEBUG, message, args);
        }
    }
    /**
     * Log info message
     */
    public info(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.INFO)) {
            this.log(LogLevel.INFO, message, args);
        }
    }
    /**
     * Log warning message
     */
    public warn(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.WARN)) {
            this.log(LogLevel.WARN, message, args);
        }
    }
    /**
     * Log error message
     */
    public error(message: string, ...args: any[]): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.log(LogLevel.ERROR, message, args);
        }
    }
    /**
     * Check if message should be logged based on log level
     */
    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);
        
        return messageLevelIndex >= currentLevelIndex;
    }
    /**
     * Format and output log message
     */
    private log(level: LogLevel, message: string, args: any[]): void {
        const timestamp = this.config.timestamp ? this.formatTimestamp() : "";
        const levelStr = this.formatLevel(level);
        const formattedMessage = this.formatMessage(message, args);
        
        const logLine = `${timestamp}${levelStr} ${formattedMessage}`;
        console.log(logLine);
    }
    /**
     * Format timestamp
     */
    private formatTimestamp(): string {
        const now = new Date();
        return `[${now.toISOString()}] `;
    }
    /**
     * Format log level with colors if enabled
     */
    private formatLevel(level: LogLevel): string {
        if (!this.config.colors) {
            return `[${level.padEnd(5)}]`;
        }
        const colors = {
            [LogLevel.DEBUG]: "\x1b[36m", // Cyan
            [LogLevel.INFO]: "\x1b[32m",  // Green
            [LogLevel.WARN]: "\x1b[33m",  // Yellow
            [LogLevel.ERROR]: "\x1b[31m"  // Red
        };
        const reset = "\x1b[0m";
        return `${colors[level]}[${level.padEnd(5)}]${reset}`;
    }
    /**
     * Format message and arguments
     */
    private formatMessage(message: string, args: any[]): string {
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
        } catch {
            // Fallback if JSON.stringify fails
            return `${message} ${args.join(" ")}`;
        }
    }
}
