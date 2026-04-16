"use strict";
/**
 * DebugAnalyzerTool - 调试分析器工具
 *
 * 分析代码错误、堆栈跟踪、诊断问题并提供修复建议：
 * 1. 错误消息解析和分类
 * 2. 堆栈跟踪分析和定位
 * 3. 问题根源诊断
 * 4. 修复建议生成
 * 5. 代码修复验证
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
exports.DebugAnalyzerTool = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const EnhancedBaseTool_1 = require("../../tool/EnhancedBaseTool");
const ZodCompatibility_1 = require("../../tool/ZodCompatibility");
const Tool_1 = require("../../tool/Tool");
/**
 * 调试分析器工具
 */
class DebugAnalyzerTool extends EnhancedBaseTool_1.EnhancedBaseTool {
    // ==================== 工具定义 ====================
    /**
     * 工具ID
     */
    static TOOL_ID = 'debug_analyzer';
    /**
     * 工具名称
     */
    static TOOL_NAME = 'Debug Analyzer';
    /**
     * 工具描述
     */
    static TOOL_DESCRIPTION = 'Analyzes code errors, stack traces, diagnoses issues and provides fix suggestions';
    /**
     * 工具类别
     */
    static TOOL_CATEGORY = Tool_1.ToolCategory.DEVELOPMENT;
    /**
     * 工具能力
     */
    static TOOL_CAPABILITIES = {
        isConcurrencySafe: true,
        isReadOnly: true,
        isDestructive: false,
        requiresWorkspace: true,
        supportsStreaming: true,
        requiresFileAccess: true,
        canModifyFiles: false,
        canReadFiles: true,
        canExecuteCommands: false,
        canAccessNetwork: false,
        requiresModel: true,
    };
    /**
     * 权限级别
     */
    static PERMISSION_LEVEL = Tool_1.PermissionLevel.READ;
    // ==================== 抽象属性实现 ====================
    id = DebugAnalyzerTool.TOOL_ID;
    name = DebugAnalyzerTool.TOOL_NAME;
    description = DebugAnalyzerTool.TOOL_DESCRIPTION;
    version = '1.0.0';
    author = 'CodeLine Team';
    category = DebugAnalyzerTool.TOOL_CATEGORY;
    // 工具能力getter已经在EnhancedBaseTool中实现
    // inputSchema getter已经在EnhancedBaseTool中实现
    // ==================== 日志方法 ====================
    logInfo(message) {
        console.log(`[DebugAnalyzerTool] INFO: ${message}`);
    }
    logWarn(message) {
        console.warn(`[DebugAnalyzerTool] WARN: ${message}`);
    }
    logError(message) {
        console.error(`[DebugAnalyzerTool] ERROR: ${message}`);
    }
    // ==================== 核心执行方法 ====================
    /**
     * 执行工具核心逻辑
     */
    async executeCore(input, context) {
        // 使用现有的executeImplementation方法，传递适配的上下文
        return await this.executeImplementation(input, context);
    }
    // ==================== 错误模式数据库 ====================
    errorPatterns = {
        syntax_error: [
            { pattern: /(SyntaxError|ParseError)/i, description: '语法解析错误' },
            { pattern: /(Unexpected token|Expected)/i, description: '意外的令牌或期望的语法' },
            { pattern: /(missing|expected) (semicolon|parenthesis|bracket|brace)/i, description: '缺少分号、括号或大括号' },
            { pattern: /Invalid or unexpected token/i, description: '无效或意外的令牌' },
        ],
        type_error: [
            { pattern: /TypeError/i, description: '类型错误' },
            { pattern: /is not a function/i, description: '尝试调用非函数' },
            { pattern: /Cannot read property/i, description: '无法读取属性' },
            { pattern: /Cannot set property/i, description: '无法设置属性' },
            { pattern: /is not iterable/i, description: '对象不可迭代' },
            { pattern: /is not a constructor/i, description: '尝试使用非构造函数' },
        ],
        reference_error: [
            { pattern: /ReferenceError/i, description: '引用错误' },
            { pattern: /is not defined/i, description: '变量未定义' },
            { pattern: /Cannot access/i, description: '无法访问变量' },
        ],
        range_error: [
            { pattern: /RangeError/i, description: '范围错误' },
            { pattern: /Maximum call stack size exceeded/i, description: '调用栈溢出' },
            { pattern: /Invalid array length/i, description: '无效数组长度' },
        ],
        network_error: [
            { pattern: /(NetworkError|FetchError|RequestError)/i, description: '网络错误' },
            { pattern: /(timeout|timed out)/i, description: '请求超时' },
            { pattern: /(ECONNREFUSED|ECONNRESET)/i, description: '连接被拒绝或重置' },
            { pattern: /(404|500|503)/, description: 'HTTP错误状态码' },
        ],
        file_system_error: [
            { pattern: /(ENOENT|ENOTDIR|EISDIR|EEXIST)/i, description: '文件系统错误' },
            { pattern: /(file not found|no such file)/i, description: '文件未找到' },
            { pattern: /(permission denied|access denied)/i, description: '权限被拒绝' },
        ],
    };
    // ==================== 参数模式 ====================
    /**
     * 创建参数模式
     */
    createParameterSchema() {
        return ZodCompatibility_1.z.object({
            errorInput: ZodCompatibility_1.z.string()
                .min(1, 'Error input is required')
                .max(10000, 'Error input too long')
                .describe('Error message or stack trace'),
            targetFilePath: ZodCompatibility_1.z.string()
                .optional()
                .describe('Target file path (optional, for context analysis)'),
            errorType: ZodCompatibility_1.z.enum([
                'syntax_error', 'type_error', 'reference_error', 'range_error',
                'uri_error', 'eval_error', 'assertion_error', 'network_error',
                'file_system_error', 'permission_error', 'resource_error',
                'logic_error', 'runtime_error', 'unknown_error'
            ])
                .optional()
                .describe('Error type (if known)'),
            language: ZodCompatibility_1.z.string()
                .default('typescript')
                .describe('Programming language'),
            analyzeStacktrace: ZodCompatibility_1.z.boolean()
                .default(true)
                .describe('Whether to analyze stack trace'),
            provideFixes: ZodCompatibility_1.z.boolean()
                .default(true)
                .describe('Whether to provide fix suggestions'),
            validateFixes: ZodCompatibility_1.z.boolean()
                .default(false)
                .describe('Whether to validate fixes'),
            analysisDepth: ZodCompatibility_1.z.enum(['shallow', 'normal', 'deep'])
                .default('normal')
                .describe('Analysis depth'),
            context: ZodCompatibility_1.z.object({
                operation: ZodCompatibility_1.z.string().optional(),
                inputData: ZodCompatibility_1.z.any().optional(),
                environment: ZodCompatibility_1.z.record(ZodCompatibility_1.z.string()).optional(),
                relatedFiles: ZodCompatibility_1.z.array(ZodCompatibility_1.z.string()).optional(),
            })
                .optional()
                .describe('Additional context information'),
        });
    }
    // ==================== 工具执行 ====================
    /**
     * 执行工具
     */
    async executeImplementation(params, context) {
        const startTime = Date.now();
        try {
            this.logInfo(`Starting debug analysis for error: ${params.errorInput.substring(0, 200)}...`);
            // 1. 分析错误类型
            const errorAnalysis = await this.analyzeError(params);
            // 2. 分析堆栈跟踪（如果需要）
            let stacktraceAnalysis;
            if (params.analyzeStacktrace && this.containsStacktrace(params.errorInput)) {
                stacktraceAnalysis = await this.analyzeStacktrace(params, context);
            }
            // 3. 诊断根本原因
            const rootCause = await this.diagnoseRootCause(params, errorAnalysis, stacktraceAnalysis, context);
            // 4. 生成修复建议（如果需要）
            let fixes = { quickFixes: [], preventiveMeasures: [], testingSuggestions: [] };
            if (params.provideFixes) {
                fixes = await this.generateFixes(params, errorAnalysis, rootCause, stacktraceAnalysis, context);
            }
            // 5. 验证修复（如果需要）
            let validation;
            if (params.validateFixes && fixes.quickFixes.length > 0) {
                validation = await this.validateFixes(fixes.quickFixes, params, context);
            }
            // 6. 计算统计信息
            const statistics = this.calculateStatistics(startTime, errorAnalysis, fixes);
            // 7. 生成调试建议
            const debugSuggestions = await this.generateDebugSuggestions(params, errorAnalysis, rootCause);
            const result = {
                success: true,
                errorType: errorAnalysis.type,
                severity: errorAnalysis.severity,
                errorSummary: errorAnalysis.summary,
                rootCause,
                stacktraceAnalysis,
                fixes,
                validation,
                statistics,
                debugSuggestions,
            };
            this.logInfo(`Debug analysis completed successfully`);
            this.logInfo(`Error type: ${errorAnalysis.type}, Severity: ${errorAnalysis.severity}`);
            this.logInfo(`Fixes generated: ${fixes.quickFixes.length}`);
            return result;
        }
        catch (error) {
            this.logError(`Debug analysis failed: ${error.message}`);
            return {
                success: false,
                errorType: 'unknown_error',
                severity: 'high',
                errorSummary: `Analysis failed: ${error.message}`,
                rootCause: {
                    description: 'Debug analyzer encountered an error',
                    possibleCauses: ['Internal tool error', 'Invalid input format', 'Resource constraints'],
                    mostLikelyCause: 'Internal tool error',
                    confidence: 0.3,
                },
                fixes: {
                    quickFixes: [],
                    preventiveMeasures: ['Check the analyzer tool logs', 'Simplify the error input'],
                    testingSuggestions: [],
                },
                statistics: {
                    analysisTime: Date.now() - startTime,
                    patternsIdentified: 0,
                    fixesGenerated: 0,
                    complexityScore: 0,
                },
                debugSuggestions: ['Retry with simplified error input', 'Check the original error in detail'],
                error: error.message,
            };
        }
    }
    // ==================== 私有方法 ====================
    /**
     * 分析错误
     */
    async analyzeError(params) {
        const errorInput = params.errorInput.toLowerCase();
        // 如果指定了错误类型，使用它
        if (params.errorType) {
            const severity = this.determineSeverity(params.errorType, errorInput);
            return {
                type: params.errorType,
                severity,
                summary: this.generateErrorSummary(params.errorType, errorInput),
                patterns: [{ pattern: 'user_specified', description: 'User specified error type' }],
            };
        }
        // 自动检测错误类型
        let detectedType = 'unknown_error';
        let detectedPatterns = [];
        // 检查每种错误类型的模式
        for (const [errorType, patterns] of Object.entries(this.errorPatterns)) {
            for (const pattern of patterns) {
                if (pattern.pattern.test(params.errorInput)) {
                    detectedType = errorType;
                    detectedPatterns.push({
                        pattern: pattern.pattern.toString(),
                        description: pattern.description,
                    });
                    break;
                }
            }
            if (detectedType !== 'unknown_error') {
                break;
            }
        }
        // 如果未检测到，尝试更通用的模式
        if (detectedType === 'unknown_error') {
            if (errorInput.includes('error') || errorInput.includes('exception')) {
                detectedType = 'runtime_error';
                detectedPatterns.push({
                    pattern: 'generic_error',
                    description: 'Generic error or exception',
                });
            }
        }
        const severity = this.determineSeverity(detectedType, errorInput);
        const summary = this.generateErrorSummary(detectedType, errorInput);
        this.logInfo(`Error analysis: type=${detectedType}, severity=${severity}, patterns=${detectedPatterns.length}`);
        return {
            type: detectedType,
            severity,
            summary,
            patterns: detectedPatterns,
        };
    }
    /**
     * 确定错误严重级别
     */
    determineSeverity(errorType, errorInput) {
        const lowerInput = errorInput.toLowerCase();
        // 基于错误类型
        switch (errorType) {
            case 'syntax_error':
                // 语法错误通常是严重的，因为代码无法运行
                return 'critical';
            case 'type_error':
            case 'reference_error':
                // 类型和引用错误通常是高优先级的
                return 'high';
            case 'range_error':
                // 范围错误可能是高或中等，取决于上下文
                if (lowerInput.includes('maximum call stack')) {
                    return 'high'; // 递归溢出是严重的
                }
                return 'medium';
            case 'network_error':
            case 'file_system_error':
            case 'permission_error':
                // 资源相关错误严重性取决于上下文
                if (lowerInput.includes('econnrefused') || lowerInput.includes('permission denied')) {
                    return 'high';
                }
                return 'medium';
            case 'logic_error':
                // 逻辑错误通常是中等，因为它们可能不会立即崩溃
                return 'medium';
            default:
                return 'medium';
        }
    }
    /**
     * 生成错误摘要
     */
    generateErrorSummary(errorType, errorInput) {
        const firstLine = errorInput.split('\n')[0].trim();
        switch (errorType) {
            case 'syntax_error':
                return `语法错误：${firstLine.substring(0, 100)}`;
            case 'type_error':
                return `类型错误：${firstLine.substring(0, 100)}`;
            case 'reference_error':
                return `引用错误：${firstLine.substring(0, 100)}`;
            case 'range_error':
                return `范围错误：${firstLine.substring(0, 100)}`;
            case 'network_error':
                return `网络错误：${firstLine.substring(0, 100)}`;
            case 'file_system_error':
                return `文件系统错误：${firstLine.substring(0, 100)}`;
            default:
                return `错误：${firstLine.substring(0, 100)}`;
        }
    }
    /**
     * 检查是否包含堆栈跟踪
     */
    containsStacktrace(errorInput) {
        const stacktraceIndicators = [
            'at ',
            'stack trace',
            'stacktrace',
            'called from',
            'in ',
            'line ',
            ':line ',
        ];
        return stacktraceIndicators.some(indicator => errorInput.toLowerCase().includes(indicator.toLowerCase()));
    }
    /**
     * 分析堆栈跟踪
     */
    async analyzeStacktrace(params, context) {
        const frames = this.parseStacktrace(params.errorInput, context);
        // 识别错误位置（通常是第一个非内部/非库的帧）
        let errorLocation;
        for (const frame of frames) {
            if (!frame.isInternal && !frame.isThirdParty) {
                errorLocation = frame;
                break;
            }
        }
        // 如果没有找到，使用第一个帧
        if (!errorLocation && frames.length > 0) {
            errorLocation = frames[0];
        }
        // 检查异步调用
        const hasAsyncCalls = frames.some(frame => frame.functionName.includes('async') ||
            frame.functionName.includes('Promise') ||
            frame.functionName.includes('await'));
        // 检查第三方代码
        const hasThirdPartyCode = frames.some(frame => frame.isThirdParty);
        this.logInfo(`Stacktrace analysis: ${frames.length} frames, error location: ${errorLocation?.filePath}:${errorLocation?.lineNumber}`);
        return {
            frames,
            errorLocation,
            callDepth: frames.length,
            hasThirdPartyCode,
            hasAsyncCalls,
        };
    }
    /**
     * 解析堆栈跟踪
     */
    parseStacktrace(errorInput, context) {
        const frames = [];
        const lines = errorInput.split('\n');
        // 常见的堆栈跟踪模式
        const stacktracePatterns = [
            // Node.js/JavaScript 格式: at functionName (file:line:col)
            /at\s+([\w$.]+)\s+\(([^:]+):(\d+):(\d+)\)/,
            // 简化的格式: at file:line:col
            /at\s+([^:]+):(\d+):(\d+)/,
            // 匿名函数: at <anonymous> (file:line:col)
            /at\s+<anonymous>\s+\(([^:]+):(\d+):(\d+)\)/,
            // 内部代码: at internal/module/run_main.js
            /at\s+internal\/.+/,
            // Python 格式: File "file", line X, in function
            /File\s+"([^"]+)",\s+line\s+(\d+),\s+in\s+([\w_]+)/,
            // Java 格式: at package.class.method(file.java:line)
            /at\s+([\w.$]+)\(([\w.]+\.java):(\d+)\)/,
        ];
        for (const line of lines) {
            const trimmedLine = line.trim();
            for (const pattern of stacktracePatterns) {
                const match = trimmedLine.match(pattern);
                if (match) {
                    let functionName = 'anonymous';
                    let filePath = '';
                    let lineNumber = 0;
                    let columnNumber;
                    // 根据模式提取信息
                    if (pattern.toString().includes('File.*line')) {
                        // Python 格式
                        filePath = match[1];
                        lineNumber = parseInt(match[2], 10);
                        functionName = match[3] || 'anonymous';
                    }
                    else if (pattern.toString().includes('at.*\\(.*:.*:.*\\)')) {
                        // JavaScript 格式 with function name
                        functionName = match[1] || 'anonymous';
                        filePath = match[2];
                        lineNumber = parseInt(match[3], 10);
                        columnNumber = match[4] ? parseInt(match[4], 10) : undefined;
                    }
                    else if (pattern.toString().includes('at.*:.*:')) {
                        // 简化的 JavaScript 格式
                        filePath = match[1];
                        lineNumber = parseInt(match[2], 10);
                        columnNumber = match[3] ? parseInt(match[3], 10) : undefined;
                    }
                    // 确定是否为内部或第三方代码
                    const isInternal = filePath.includes('internal/') ||
                        filePath.includes('node_modules') ||
                        filePath.startsWith('<') ||
                        filePath.includes('(native)');
                    const isThirdParty = filePath.includes('node_modules/') ||
                        filePath.includes('.cache/') ||
                        filePath.includes('/.pnpm/') ||
                        filePath.includes('/.yarn/');
                    // 获取源代码片段（如果可能）
                    let sourceCode;
                    if (context.workspaceRoot && filePath && !isInternal && !isThirdParty) {
                        try {
                            const fullPath = path.isAbsolute(filePath) ? filePath : path.join(context.workspaceRoot, filePath);
                            if (fs.existsSync(fullPath)) {
                                const content = fs.readFileSync(fullPath, 'utf8');
                                const lines = content.split('\n');
                                if (lineNumber >= 1 && lineNumber <= lines.length) {
                                    const start = Math.max(0, lineNumber - 3);
                                    const end = Math.min(lines.length, lineNumber + 2);
                                    sourceCode = lines.slice(start, end).join('\n');
                                }
                            }
                        }
                        catch (error) {
                            // 忽略获取源代码的错误
                        }
                    }
                    const frame = {
                        functionName,
                        filePath,
                        lineNumber,
                        columnNumber,
                        sourceCode,
                        isInternal,
                        isThirdParty,
                    };
                    frames.push(frame);
                    break;
                }
            }
        }
        // 如果没有解析到帧，尝试简单的行号提取
        if (frames.length === 0) {
            const lineNumberMatch = errorInput.match(/line\s+(\d+)/i);
            if (lineNumberMatch && context && context.targetFilePath) {
                const lineNumber = parseInt(lineNumberMatch[1], 10);
                frames.push({
                    functionName: 'unknown',
                    filePath: context.targetFilePath,
                    lineNumber,
                    isInternal: false,
                    isThirdParty: false,
                });
            }
        }
        return frames;
    }
    /**
     * 诊断根本原因
     */
    async diagnoseRootCause(params, errorAnalysis, stacktraceAnalysis, context) {
        const possibleCauses = [];
        let mostLikelyCause = 'Unknown cause';
        let confidence = 0.5;
        // 基于错误类型添加可能的原因
        switch (errorAnalysis.type) {
            case 'syntax_error':
                possibleCauses.push('Missing punctuation (semicolon, comma, parenthesis)');
                possibleCauses.push('Invalid language construct');
                possibleCauses.push('Mismatched quotes or brackets');
                possibleCauses.push('Reserved keyword misuse');
                mostLikelyCause = 'Missing or misplaced punctuation';
                confidence = 0.7;
                break;
            case 'type_error':
                possibleCauses.push('Variable used before declaration');
                possibleCauses.push('Incorrect function call syntax');
                possibleCauses.push('Property access on null/undefined');
                possibleCauses.push('Type mismatch in operation');
                mostLikelyCause = 'Property access on null or undefined value';
                confidence = 0.6;
                break;
            case 'reference_error':
                possibleCauses.push('Variable not declared');
                possibleCauses.push('Typo in variable name');
                possibleCauses.push('Variable out of scope');
                possibleCauses.push('Module import/export issue');
                mostLikelyCause = 'Variable not declared or out of scope';
                confidence = 0.8;
                break;
            case 'range_error':
                possibleCauses.push('Recursive function without base case');
                possibleCauses.push('Infinite loop');
                possibleCauses.push('Array allocation with negative size');
                possibleCauses.push('Invalid numeric range');
                mostLikelyCause = 'Recursive function overflow';
                confidence = 0.65;
                break;
            case 'network_error':
                possibleCauses.push('Server unavailable');
                possibleCauses.push('Network connectivity issue');
                possibleCauses.push('Invalid URL or endpoint');
                possibleCauses.push('Authentication failure');
                mostLikelyCause = 'Server unavailable or network issue';
                confidence = 0.6;
                break;
            case 'file_system_error':
                possibleCauses.push('File not found');
                possibleCauses.push('Permission denied');
                possibleCauses.push('Disk full');
                possibleCauses.push('Invalid file path');
                mostLikelyCause = 'File not found or permission issue';
                confidence = 0.75;
                break;
        }
        // 基于堆栈跟踪添加原因
        if (stacktraceAnalysis?.errorLocation) {
            const location = stacktraceAnalysis.errorLocation;
            possibleCauses.push(`Error in ${location.functionName} at ${location.filePath}:${location.lineNumber}`);
            mostLikelyCause = `Bug in ${location.functionName} function`;
            confidence = Math.min(confidence + 0.1, 0.9);
        }
        // 基于上下文添加原因
        if (params.context?.operation) {
            possibleCauses.push(`Issue with operation: ${params.context.operation}`);
        }
        // 如果没有找到可能的原因，添加通用原因
        if (possibleCauses.length === 0) {
            possibleCauses.push('Logic error in code');
            possibleCauses.push('Resource constraint exceeded');
            possibleCauses.push('External dependency failure');
            possibleCauses.push('Race condition or timing issue');
            mostLikelyCause = 'Logic error or resource issue';
            confidence = 0.4;
        }
        const description = `The error appears to be caused by ${mostLikelyCause.toLowerCase()}. ` +
            `This is a ${errorAnalysis.severity} severity ${errorAnalysis.type.replace('_', ' ')}.`;
        return {
            description,
            possibleCauses,
            mostLikelyCause,
            confidence,
        };
    }
    /**
     * 生成修复建议
     */
    async generateFixes(params, errorAnalysis, rootCause, stacktraceAnalysis, context) {
        const quickFixes = [];
        const preventiveMeasures = [];
        const testingSuggestions = [];
        // 基于错误类型生成修复
        switch (errorAnalysis.type) {
            case 'syntax_error':
                quickFixes.push(...this.generateSyntaxErrorFixes(params, stacktraceAnalysis));
                preventiveMeasures.push('Use a linter or code formatter');
                preventiveMeasures.push('Enable syntax highlighting in editor');
                testingSuggestions.push('Test code compilation before runtime');
                break;
            case 'type_error':
                quickFixes.push(...this.generateTypeErrorFixes(params, stacktraceAnalysis));
                preventiveMeasures.push('Use TypeScript or type checking');
                preventiveMeasures.push('Add runtime type validation');
                testingSuggestions.push('Test with edge case inputs');
                break;
            case 'reference_error':
                quickFixes.push(...this.generateReferenceErrorFixes(params, stacktraceAnalysis));
                preventiveMeasures.push('Use const/let instead of var');
                preventiveMeasures.push('Enable strict mode in JavaScript');
                testingSuggestions.push('Test variable scope and declarations');
                break;
            case 'range_error':
                quickFixes.push(...this.generateRangeErrorFixes(params, stacktraceAnalysis));
                preventiveMeasures.push('Add recursion depth limits');
                preventiveMeasures.push('Validate array bounds before access');
                testingSuggestions.push('Test with large inputs and edge cases');
                break;
            default:
                quickFixes.push(...this.generateGenericFixes(params, errorAnalysis, stacktraceAnalysis));
                preventiveMeasures.push('Add comprehensive error handling');
                preventiveMeasures.push('Log errors with context information');
                testingSuggestions.push('Test error scenarios and recovery');
        }
        // 基于根本原因添加修复
        if (rootCause.mostLikelyCause) {
            quickFixes.push({
                description: `Address the root cause: ${rootCause.mostLikelyCause}`,
                code: '// TODO: Implement fix based on root cause analysis\n// Consider the specific issue identified',
                type: 'logic',
                complexity: 'moderate',
                confidence: rootCause.confidence,
            });
        }
        // 基于堆栈位置添加修复
        if (stacktraceAnalysis?.errorLocation) {
            const location = stacktraceAnalysis.errorLocation;
            quickFixes.push({
                description: `Fix issue at ${location.filePath}:${location.lineNumber}`,
                code: location.sourceCode ?
                    `// Review this code:\n${location.sourceCode}\n// Fix the identified issue` :
                    '// Review the code at the specified location',
                location: {
                    filePath: location.filePath,
                    lineNumber: location.lineNumber,
                },
                type: 'location_specific',
                complexity: 'moderate',
                confidence: 0.7,
            });
        }
        return {
            quickFixes,
            preventiveMeasures,
            testingSuggestions,
        };
    }
    /**
     * 生成语法错误修复
     */
    generateSyntaxErrorFixes(params, stacktraceAnalysis) {
        const fixes = [];
        const errorInput = params.errorInput.toLowerCase();
        // 检查常见的语法错误模式
        if (errorInput.includes('missing') && errorInput.includes('semicolon')) {
            fixes.push({
                description: 'Add missing semicolon',
                code: '; // Add semicolon at end of statement',
                type: 'syntax',
                complexity: 'simple',
                confidence: 0.9,
            });
        }
        if (errorInput.includes('unexpected token')) {
            fixes.push({
                description: 'Fix unexpected token',
                code: '// Check for misplaced or extra characters\n// Verify quotes, brackets, and operators',
                type: 'syntax',
                complexity: 'simple',
                confidence: 0.7,
            });
        }
        if (errorInput.includes('expected')) {
            fixes.push({
                description: 'Add expected syntax element',
                code: '// Add the expected syntax element (parenthesis, bracket, etc.)',
                type: 'syntax',
                complexity: 'simple',
                confidence: 0.6,
            });
        }
        return fixes;
    }
    /**
     * 生成类型错误修复
     */
    generateTypeErrorFixes(params, stacktraceAnalysis) {
        const fixes = [];
        const errorInput = params.errorInput.toLowerCase();
        if (errorInput.includes('is not a function')) {
            fixes.push({
                description: 'Check if variable is a function before calling',
                code: `if (typeof variable === 'function') {
  variable();
} else {
  console.error('variable is not a function');
}`,
                type: 'type',
                complexity: 'simple',
                confidence: 0.8,
            });
        }
        if (errorInput.includes('cannot read property')) {
            fixes.push({
                description: 'Add null/undefined check before property access',
                code: `if (object && object.property !== undefined) {
  // Access property
  const value = object.property;
} else {
  // Handle missing property
  console.error('Property not available');
}`,
                type: 'type',
                complexity: 'simple',
                confidence: 0.85,
            });
        }
        return fixes;
    }
    /**
     * 生成引用错误修复
     */
    generateReferenceErrorFixes(params, stacktraceAnalysis) {
        const fixes = [];
        const errorInput = params.errorInput.toLowerCase();
        if (errorInput.includes('is not defined')) {
            fixes.push({
                description: 'Declare variable before use',
                code: `// Add declaration
let variableName; // or const variableName = value;`,
                type: 'reference',
                complexity: 'simple',
                confidence: 0.9,
            });
            fixes.push({
                description: 'Check variable scope',
                code: `// Ensure variable is in scope
// Move declaration to appropriate scope`,
                type: 'reference',
                complexity: 'moderate',
                confidence: 0.7,
            });
        }
        return fixes;
    }
    /**
     * 生成范围错误修复
     */
    generateRangeErrorFixes(params, stacktraceAnalysis) {
        const fixes = [];
        const errorInput = params.errorInput.toLowerCase();
        if (errorInput.includes('maximum call stack')) {
            fixes.push({
                description: 'Add base case to recursive function',
                code: `function recursiveFunction(param) {
  // Add base case
  if (param <= 0) {
    return; // Base case to stop recursion
  }
  
  // Recursive case
  recursiveFunction(param - 1);
}`,
                type: 'logic',
                complexity: 'simple',
                confidence: 0.8,
            });
        }
        return fixes;
    }
    /**
     * 生成通用修复
     */
    generateGenericFixes(params, errorAnalysis, stacktraceAnalysis) {
        return [
            {
                description: 'Add error handling with try-catch',
                code: `try {
  // Code that might throw error
} catch (error) {
  console.error('Error occurred:', error);
  // Handle error appropriately
}`,
                type: 'generic',
                complexity: 'simple',
                confidence: 0.6,
            },
            {
                description: 'Add input validation',
                code: `// Validate inputs before processing
if (!input || typeof input !== 'object') {
  throw new Error('Invalid input');
}`,
                type: 'validation',
                complexity: 'simple',
                confidence: 0.7,
            },
        ];
    }
    /**
     * 验证修复
     */
    async validateFixes(fixes, params, context) {
        const results = [];
        let fixesValidated = false;
        // 简化验证：检查修复是否看起来合理
        for (let i = 0; i < fixes.length; i++) {
            const fix = fixes[i];
            let valid = false;
            let reason = '';
            // 基本验证规则
            if (!fix.code || fix.code.trim().length === 0) {
                reason = 'Empty fix code';
            }
            else if (fix.code.length > 10000) {
                reason = 'Fix code too long';
            }
            else if (fix.confidence < 0.1) {
                reason = 'Very low confidence';
            }
            else {
                valid = true;
                reason = 'Fix appears reasonable';
            }
            results.push({ fixIndex: i, valid, reason });
            if (valid) {
                fixesValidated = true;
            }
        }
        return {
            fixesValidated,
            results,
        };
    }
    /**
     * 计算统计信息
     */
    calculateStatistics(startTime, errorAnalysis, fixes) {
        const analysisTime = Date.now() - startTime;
        return {
            analysisTime,
            patternsIdentified: errorAnalysis.patterns?.length || 0,
            fixesGenerated: fixes.quickFixes.length,
            complexityScore: this.calculateComplexityScore(errorAnalysis, fixes),
        };
    }
    /**
     * 计算复杂度分数
     */
    calculateComplexityScore(errorAnalysis, fixes) {
        let score = 0;
        // 基于错误类型
        switch (errorAnalysis.type) {
            case 'syntax_error':
                score += 0.2;
                break;
            case 'type_error':
            case 'reference_error':
                score += 0.4;
                break;
            case 'range_error':
            case 'logic_error':
                score += 0.6;
                break;
            case 'network_error':
            case 'file_system_error':
                score += 0.5;
                break;
            default:
                score += 0.3;
        }
        // 基于修复数量
        if (fixes.quickFixes.length > 5) {
            score += 0.3;
        }
        else if (fixes.quickFixes.length > 2) {
            score += 0.2;
        }
        else {
            score += 0.1;
        }
        // 基于严重性
        switch (errorAnalysis.severity) {
            case 'critical':
                score += 0.4;
                break;
            case 'high':
                score += 0.3;
                break;
            case 'medium':
                score += 0.2;
                break;
            default:
                score += 0.1;
        }
        return Math.min(score, 1.0);
    }
    /**
     * 生成调试建议
     */
    async generateDebugSuggestions(params, errorAnalysis, rootCause) {
        const suggestions = [];
        suggestions.push(`Review the error details: ${errorAnalysis.summary}`);
        if (rootCause.mostLikelyCause) {
            suggestions.push(`Focus on: ${rootCause.mostLikelyCause}`);
        }
        // 基于错误类型的特定建议
        switch (errorAnalysis.type) {
            case 'syntax_error':
                suggestions.push('Check for missing punctuation (semicolons, commas, brackets)');
                suggestions.push('Verify that all quotes are properly closed');
                break;
            case 'type_error':
                suggestions.push('Add type checks before property access or function calls');
                suggestions.push('Use console.log to inspect variable types');
                break;
            case 'reference_error':
                suggestions.push('Check variable declarations and scope');
                suggestions.push('Look for typos in variable names');
                break;
            case 'range_error':
                suggestions.push('Add bounds checking for arrays and numbers');
                suggestions.push('Check for infinite loops or recursion');
                break;
            case 'network_error':
                suggestions.push('Test network connectivity and server availability');
                suggestions.push('Verify URLs and API endpoints');
                break;
            case 'file_system_error':
                suggestions.push('Check file permissions and existence');
                suggestions.push('Verify file paths are correct');
                break;
        }
        // 通用调试建议
        suggestions.push('Use console.log or debugger to trace execution');
        suggestions.push('Check the browser/terminal console for more details');
        suggestions.push('Review recent code changes that might have introduced the bug');
        if (params.analysisDepth === 'shallow') {
            suggestions.push('Consider re-running with analysisDepth: "deep" for more detailed analysis');
        }
        return suggestions;
    }
    // ==================== 工具元数据 ====================
    /**
     * 获取工具ID
     */
    getToolId() {
        return DebugAnalyzerTool.TOOL_ID;
    }
    /**
     * 获取工具名称
     */
    getToolName() {
        return DebugAnalyzerTool.TOOL_NAME;
    }
    /**
     * 获取工具描述
     */
    getToolDescription() {
        return DebugAnalyzerTool.TOOL_DESCRIPTION;
    }
    /**
     * 获取工具类别
     */
    getToolCategory() {
        return DebugAnalyzerTool.TOOL_CATEGORY;
    }
    /**
     * 获取工具能力
     */
    getToolCapabilities() {
        return DebugAnalyzerTool.TOOL_CAPABILITIES;
    }
    /**
     * 获取权限级别
     */
    getPermissionLevel() {
        return DebugAnalyzerTool.PERMISSION_LEVEL;
    }
}
exports.DebugAnalyzerTool = DebugAnalyzerTool;
exports.default = DebugAnalyzerTool;
//# sourceMappingURL=DebugAnalyzerTool.js.map