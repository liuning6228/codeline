/**
 * CodeGeneratorTool - 代码生成器工具
 *
 * 基于用户需求生成代码，支持多种编程语言和模式
 * 功能：
 * 1. 根据描述生成完整代码文件
 * 2. 生成函数/类/接口定义
 * 3. 支持模板和代码模式
 * 4. 语法检查和格式化
 * 5. 集成代码片段库
 */
import { EnhancedBaseTool, type EnhancedToolContext } from '../../tool/EnhancedBaseTool';
import { ToolCategory, ToolCapabilities, PermissionLevel } from '../../tool/Tool';
/**
 * 代码生成器工具参数
 */
export interface CodeGeneratorParameters {
    /** 代码描述/需求 */
    description: string;
    /** 目标编程语言 */
    language: string;
    /** 代码类型：function, class, interface, module, file, test, documentation */
    codeType: 'function' | 'class' | 'interface' | 'module' | 'file' | 'test' | 'documentation' | 'snippet';
    /** 目标文件路径（可选，如果为空则生成到临时文件） */
    targetFilePath?: string;
    /** 代码模板（可选，指定特定模板） */
    template?: string;
    /** 代码风格：functional, oop, procedural, declarative */
    style?: 'functional' | 'oop' | 'procedural' | 'declarative';
    /** 是否包含测试 */
    includeTests?: boolean;
    /** 是否包含文档 */
    includeDocumentation?: boolean;
    /** 是否包含示例用法 */
    includeExamples?: boolean;
    /** 代码复杂性：simple, moderate, complex */
    complexity?: 'simple' | 'moderate' | 'complex';
    /** 附加约束和需求 */
    constraints?: string[];
}
/**
 * 代码生成器工具结果
 */
export interface CodeGeneratorResult {
    /** 生成的代码 */
    generatedCode: string;
    /** 文件路径（如果保存到文件） */
    filePath?: string;
    /** 语言 */
    language: string;
    /** 代码类型 */
    codeType: string;
    /** 代码质量评估 */
    quality: {
        syntaxValid: boolean;
        followsBestPractices: boolean;
        hasComments: boolean;
        complexityScore: number;
    };
    /** 生成统计 */
    statistics: {
        linesOfCode: number;
        functions: number;
        classes: number;
        comments: number;
        generationTime: number;
    };
    /** 建议和改进 */
    suggestions: string[];
    /** 测试代码（如果包含测试） */
    testCode?: string;
    /** 文档（如果包含文档） */
    documentation?: string;
    /** 示例用法（如果包含示例） */
    examples?: string[];
}
/**
 * 代码生成器工具
 */
export declare class CodeGeneratorTool extends EnhancedBaseTool<CodeGeneratorParameters, CodeGeneratorResult> {
    /**
     * 工具ID
     */
    static readonly TOOL_ID = "code_generator";
    /**
     * 工具名称
     */
    static readonly TOOL_NAME = "Code Generator";
    /**
     * 工具描述
     */
    static readonly TOOL_DESCRIPTION = "Generates code based on requirements, supporting multiple programming languages and patterns";
    /**
     * 工具类别
     */
    static readonly TOOL_CATEGORY: ToolCategory;
    /**
     * 工具能力
     */
    static readonly TOOL_CAPABILITIES: ToolCapabilities;
    /**
     * 权限级别
     */
    static readonly PERMISSION_LEVEL = PermissionLevel.WRITE;
    readonly id = "code_generator";
    readonly name = "Code Generator";
    readonly description = "Generates code based on requirements, supporting multiple programming languages and patterns";
    readonly version = "1.0.0";
    readonly author = "CodeLine Team";
    readonly category: ToolCategory;
    protected logInfo(message: string): void;
    protected logWarn(message: string): void;
    protected logError(message: string): void;
    /**
     * 执行工具核心逻辑
     */
    protected executeCore(input: CodeGeneratorParameters, context: EnhancedToolContext): Promise<CodeGeneratorResult>;
    /**
     * 创建参数模式
     */
    protected createParameterSchema(): any;
    /**
     * 执行工具
     */
    protected executeImplementation(params: CodeGeneratorParameters, context: any): Promise<CodeGeneratorResult>;
    /**
     * 准备生成上下文
     */
    private prepareGenerationContext;
    /**
     * 生成代码
     */
    private generateCode;
    /**
     * 构建生成提示
     */
    private buildGenerationPrompt;
    /**
     * 调用模型生成代码
     */
    private callModelForCodeGeneration;
    /**
     * 从模板生成代码
     */
    private generateFromTemplate;
    /**
     * 生成函数模板
     */
    private generateFunctionTemplate;
    /**
     * 生成类模板
     */
    private generateClassTemplate;
    /**
     * 生成接口模板
     */
    private generateInterfaceTemplate;
    /**
     * 生成模块模板
     */
    private generateModuleTemplate;
    /**
     * 生成测试模板
     */
    private generateTestTemplate;
    /**
     * 生成文档模板
     */
    private generateDocumentationTemplate;
    /**
     * 生成文件模板
     */
    private generateFileTemplate;
    /**
     * 提取函数名
     */
    private extractFunctionName;
    /**
     * 提取类名
     */
    private extractClassName;
    /**
     * 提取接口名
     */
    private extractInterfaceName;
    /**
     * 提取模块名
     */
    private extractModuleName;
    /**
     * 提取测试名
     */
    private extractTestName;
    /**
     * 首字母大写
     */
    private capitalizeFirstLetter;
    /**
     * 后处理代码
     */
    private postProcessCode;
    /**
     * 验证语法
     */
    private validateSyntax;
    /**
     * 保存到文件
     */
    private saveToFile;
    /**
     * 生成测试代码
     */
    private generateTestCode;
    /**
     * 生成文档
     */
    private generateDocumentation;
    /**
     * 生成示例
     */
    private generateExamples;
    /**
     * 分析代码质量
     */
    private analyzeCodeQuality;
    /**
     * 计算统计信息
     */
    private calculateStatistics;
    /**
     * 生成改进建议
     */
    private generateSuggestions;
    /**
     * 获取工具ID
     */
    getToolId(): string;
    /**
     * 获取工具名称
     */
    getToolName(): string;
    /**
     * 获取工具描述
     */
    getToolDescription(): string;
    /**
     * 获取工具类别
     */
    getToolCategory(): ToolCategory;
    /**
     * 获取工具能力
     */
    getToolCapabilities(): ToolCapabilities;
    /**
     * 获取权限级别
     */
    getPermissionLevel(): PermissionLevel;
}
export default CodeGeneratorTool;
//# sourceMappingURL=CodeGeneratorTool.d.ts.map