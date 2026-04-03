var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
""(__makeTemplateObject(["typescript\n/**\n * Logger utility for consistent logging throughout the application\n */\n\nexport enum LogLevel {\n    DEBUG = \"DEBUG\",\n    INFO = \"INFO\",\n    WARN = \"WARN\",\n    ERROR = \"ERROR\"\n}\n\n/**\n * Logger configuration interface\n */\ninterface LoggerConfig {\n    level: LogLevel;\n    timestamp: boolean;\n    colors: boolean;\n}\n\n/**\n * Singleton Logger class\n */\nexport class Logger {\n    private static instance: Logger;\n    private config: LoggerConfig;\n\n    private constructor() {\n        this.config = {\n            level: LogLevel.INFO,\n            timestamp: true,\n            colors: process.stdout.isTTY\n        };\n    }\n\n    /**\n     * Get singleton instance\n     */\n    public static getInstance(): Logger {\n        if (!Logger.instance) {\n            Logger.instance = new Logger();\n        }\n        return Logger.instance;\n    }\n\n    /**\n     * Configure the logger\n     */\n    public configure(config: Partial<LoggerConfig>): void {\n        this.config = { ...this.config, ...config };\n    }\n\n    /**\n     * Log debug message\n     */\n    public debug(message: string, ...args: any[]): void {\n        if (this.shouldLog(LogLevel.DEBUG)) {\n            this.log(LogLevel.DEBUG, message, args);\n        }\n    }\n\n    /**\n     * Log info message\n     */\n    public info(message: string, ...args: any[]): void {\n        if (this.shouldLog(LogLevel.INFO)) {\n            this.log(LogLevel.INFO, message, args);\n        }\n    }\n\n    /**\n     * Log warning message\n     */\n    public warn(message: string, ...args: any[]): void {\n        if (this.shouldLog(LogLevel.WARN)) {\n            this.log(LogLevel.WARN, message, args);\n        }\n    }\n\n    /**\n     * Log error message\n     */\n    public error(message: string, ...args: any[]): void {\n        if (this.shouldLog(LogLevel.ERROR)) {\n            this.log(LogLevel.ERROR, message, args);\n        }\n    }\n\n    /**\n     * Check if message should be logged based on log level\n     */\n    private shouldLog(level: LogLevel): boolean {\n        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];\n        const currentLevelIndex = levels.indexOf(this.config.level);\n        const messageLevelIndex = levels.indexOf(level);\n        \n        return messageLevelIndex >= currentLevelIndex;\n    }\n\n    /**\n     * Format and output log message\n     */\n    private log(level: LogLevel, message: string, args: any[]): void {\n        const timestamp = this.config.timestamp ? this.formatTimestamp() : \"\";\n        const levelStr = this.formatLevel(level);\n        const formattedMessage = this.formatMessage(message, args);\n        \n        const logLine = "], ["typescript\n/**\n * Logger utility for consistent logging throughout the application\n */\n\nexport enum LogLevel {\n    DEBUG = \"DEBUG\",\n    INFO = \"INFO\",\n    WARN = \"WARN\",\n    ERROR = \"ERROR\"\n}\n\n/**\n * Logger configuration interface\n */\ninterface LoggerConfig {\n    level: LogLevel;\n    timestamp: boolean;\n    colors: boolean;\n}\n\n/**\n * Singleton Logger class\n */\nexport class Logger {\n    private static instance: Logger;\n    private config: LoggerConfig;\n\n    private constructor() {\n        this.config = {\n            level: LogLevel.INFO,\n            timestamp: true,\n            colors: process.stdout.isTTY\n        };\n    }\n\n    /**\n     * Get singleton instance\n     */\n    public static getInstance(): Logger {\n        if (!Logger.instance) {\n            Logger.instance = new Logger();\n        }\n        return Logger.instance;\n    }\n\n    /**\n     * Configure the logger\n     */\n    public configure(config: Partial<LoggerConfig>): void {\n        this.config = { ...this.config, ...config };\n    }\n\n    /**\n     * Log debug message\n     */\n    public debug(message: string, ...args: any[]): void {\n        if (this.shouldLog(LogLevel.DEBUG)) {\n            this.log(LogLevel.DEBUG, message, args);\n        }\n    }\n\n    /**\n     * Log info message\n     */\n    public info(message: string, ...args: any[]): void {\n        if (this.shouldLog(LogLevel.INFO)) {\n            this.log(LogLevel.INFO, message, args);\n        }\n    }\n\n    /**\n     * Log warning message\n     */\n    public warn(message: string, ...args: any[]): void {\n        if (this.shouldLog(LogLevel.WARN)) {\n            this.log(LogLevel.WARN, message, args);\n        }\n    }\n\n    /**\n     * Log error message\n     */\n    public error(message: string, ...args: any[]): void {\n        if (this.shouldLog(LogLevel.ERROR)) {\n            this.log(LogLevel.ERROR, message, args);\n        }\n    }\n\n    /**\n     * Check if message should be logged based on log level\n     */\n    private shouldLog(level: LogLevel): boolean {\n        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];\n        const currentLevelIndex = levels.indexOf(this.config.level);\n        const messageLevelIndex = levels.indexOf(level);\n        \n        return messageLevelIndex >= currentLevelIndex;\n    }\n\n    /**\n     * Format and output log message\n     */\n    private log(level: LogLevel, message: string, args: any[]): void {\n        const timestamp = this.config.timestamp ? this.formatTimestamp() : \"\";\n        const levelStr = this.formatLevel(level);\n        const formattedMessage = this.formatMessage(message, args);\n        \n        const logLine = "]));
$;
{
    timestamp;
}
$;
{
    levelStr;
}
$;
{
    formattedMessage;
}
";\n        console.log(logLine);\n    }\n\n    /**\n     * Format timestamp\n     */\n    private formatTimestamp(): string {\n        const now = new Date();\n        return "[$];
{
    now.toISOString();
}
";\n    }\n\n    /**\n     * Format log level with colors if enabled\n     */\n    private formatLevel(level: LogLevel): string {\n        if (!this.config.colors) {\n            return "[$];
{
    level.padEnd(5);
}
";\n        }\n\n        const colors = {\n            [LogLevel.DEBUG]: \"\u001B[36m\", // Cyan\n            [LogLevel.INFO]: \"\u001B[32m\",  // Green\n            [LogLevel.WARN]: \"\u001B[33m\",  // Yellow\n            [LogLevel.ERROR]: \"\u001B[31m\"  // Red\n        };\n\n        const reset = \"\u001B[0m\";\n        return ";
$;
{
    colors[level];
}
[$, { level: level, : .padEnd(5) }];
$;
{
    reset;
}
";\n    }\n\n    /**\n     * Format message and arguments\n     */\n    private formatMessage(message: string, args: any[]): string {\n        if (args.length === 0) {\n            return message;\n        }\n\n        try {\n            // Handle error objects specially\n            const formattedArgs = args.map(arg => {\n                if (arg instanceof Error) {\n                    return {\n                        message: arg.message,\n                        stack: arg.stack,\n                        name: arg.name\n                    };\n                }\n                return arg;\n            });\n\n            return ";
$;
{
    message;
}
$;
{
    JSON.stringify(formattedArgs, null, 2);
}
";\n        } catch {\n            // Fallback if JSON.stringify fails\n            return ";
$;
{
    message;
}
$;
{
    args.join(" ");
}
";\n        }\n    }\n}\n"(__makeTemplateObject([""], [""]));
