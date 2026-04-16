/**
 * Simple Logger utility for the extension's backend code.
 */
export declare class Logger {
    #private;
    private static isVerbose;
    private static subscribers;
    private static output;
    /**
     * Register a callback to receive log output messages.
     */
    static subscribe(outputFn: (msg: string) => void): void;
    static error(message: string, ...args: any[]): void;
    static warn(message: string, ...args: any[]): void;
    static log(message: string, ...args: any[]): void;
    static debug(message: string, ...args: any[]): void;
    static info(message: string, ...args: any[]): void;
    static trace(message: string, ...args: any[]): void;
}
//# sourceMappingURL=Logger.d.ts.map