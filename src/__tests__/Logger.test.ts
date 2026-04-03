/**
 * Logger unit tests
 */
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect } from "expect";
import { Logger, LogLevel } from "../utils/Logger";
describe("Logger", () => {
    let logger: Logger;
    let consoleLogSpy: jest.SpyInstance;
    beforeEach(() => {
        logger = Logger.getInstance();
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    });
    afterEach(() => {
        consoleLogSpy.mockRestore();
    });
    describe("Singleton pattern", () => {
        it("should return the same instance", () => {
            const instance1 = Logger.getInstance();
            const instance2 = Logger.getInstance();
            expect(instance1).toBe(instance2);
        });
    });
    describe("Log levels", () => {
        it("should log info messages by default", () => {
            logger.info("Test info message");
            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        });
        it("should not log debug messages by default", () => {
            logger.debug("Test debug message");
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });
        it("should log debug messages when level is set to DEBUG", () => {
            logger.configure({ level: LogLevel.DEBUG });
            logger.debug("Test debug message");
            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        });
    });
    describe("Message formatting", () => {
        it("should include timestamp by default", () => {
