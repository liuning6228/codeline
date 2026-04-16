/**
 * Logger utility for consistent logging throughout the application
 */
export declare enum LogLevel {
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
export declare class Logger {
    private static instance;
    private config;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): Logger;
    /**
     * Configure the logger
     */
    configure(config: Partial<LoggerConfig>): void;
    /**
     * Log debug message
     */
    debug(message: string, ...args: any[]): void;
    /**
     * Log info message
     */
    info(message: string, ...args: any[]): void;
    /**
     * Log warning message
     */
    warn(message: string, ...args: any[]): void;
    /**
     * Log error message
     */
    error(message: string, ...args: any[]): void;
    /**
     * Check if message should be logged based on log level
     */
    private shouldLog;
    /**
     * Format and output log message
     */
    private log;
    /**
     * Format timestamp
     */
    private formatTimestamp;
    /**
     * Format log level with colors if enabled
     */
    private formatLevel;
    /**
     * Format message and arguments
     */
    private formatMessage;
}
export {};
//# sourceMappingURL=Logger.d.ts.map