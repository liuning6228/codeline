"use strict";
/**
 * 增强文件读取工具示例
 * 演示如何使用EnhancedBaseTool创建同时支持新旧接口的工具
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
exports.createFileReadTool = exports.EnhancedFileReadTool = void 0;
exports.testEnhancedTool = testEnhancedTool;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const EnhancedBaseTool_1 = require("../../core/tool/EnhancedBaseTool");
const ZodCompatibility_1 = require("../../core/tool/ZodCompatibility");
const Tool_1 = require("../../core/tool/Tool");
/**
 * 增强文件读取工具
 * 演示EnhancedBaseTool的双接口兼容特性
 */
class EnhancedFileReadTool extends EnhancedBaseTool_1.EnhancedBaseTool {
    id = 'enhanced-file-read';
    name = '增强文件读取工具';
    description = '读取文件内容并返回统计信息，演示EnhancedBaseTool的双接口兼容性';
    version = '1.0.0';
    author = 'CodeLine开发团队';
    category = Tool_1.ToolCategory.FILE;
    // 自定义Zod schema
    customZodSchema = ZodCompatibility_1.z.object({
        filePath: ZodCompatibility_1.z.string().describe('要读取的文件路径'),
        encoding: ZodCompatibility_1.z.enum(['utf-8', 'utf-16', 'ascii', 'base64']).optional().describe('文件编码格式'),
        includeLineCount: ZodCompatibility_1.z.boolean().optional().describe('是否包含行数统计')
    });
    // 自定义parameterSchema（旧接口）
    customParameterSchema = {
        filePath: {
            type: 'string',
            description: '要读取的文件路径',
            required: true
        },
        encoding: {
            type: 'string',
            description: '文件编码格式',
            required: false,
            enum: ['utf-8', 'utf-16', 'ascii', 'base64']
        },
        includeLineCount: {
            type: 'boolean',
            description: '是否包含行数统计',
            required: false,
            default: false
        }
    };
    // 自定义能力
    customCapabilities = [
        'read-only',
        'requires-workspace'
    ];
    constructor() {
        super({
            enableZodValidation: true,
            maintainLegacyCompatibility: true,
            permissionLevel: 'basic',
            supportMCP: false,
            defaultTimeout: 10000
        });
    }
    /**
     * 核心执行方法
     */
    async executeCore(input, context) {
        const workspaceRoot = context.workspaceRoot || context.cwd;
        const fullPath = path.isAbsolute(input.filePath)
            ? input.filePath
            : path.join(workspaceRoot, input.filePath);
        const encoding = input.encoding || 'utf-8';
        const includeLineCount = input.includeLineCount || false;
        try {
            // 读取文件
            const uri = vscode.Uri.file(fullPath);
            const fileContent = await vscode.workspace.fs.readFile(uri);
            // 解码内容
            let content;
            if (encoding === 'base64') {
                content = Buffer.from(fileContent).toString('base64');
            }
            else {
                content = Buffer.from(fileContent).toString(encoding);
            }
            // 计算行数
            let lineCount;
            if (includeLineCount) {
                lineCount = content.split('\n').length;
            }
            return {
                content: content.substring(0, 1000) + (content.length > 1000 ? '... (截断)' : ''), // 限制输出大小
                size: fileContent.length,
                lineCount,
                encoding,
                success: true
            };
        }
        catch (error) {
            throw new Error(`读取文件失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 重写inputSchema获取器
     */
    get inputSchema() {
        return this.customZodSchema;
    }
    /**
     * 重写parameterSchema获取器
     */
    get parameterSchema() {
        return this.customParameterSchema;
    }
    /**
     * 重写capabilities获取器
     */
    get capabilities() {
        return {
            isConcurrencySafe: true,
            isReadOnly: true,
            isDestructive: false,
            requiresWorkspace: true,
            supportsStreaming: false
        };
    }
    /**
     * 重写权限检查方法
     */
    async checkPermissionsForNew(input, context) {
        // 对于文件读取操作，检查文件是否在workspace内
        const workspaceRoot = context.workspaceRoot || context.cwd;
        const fullPath = path.isAbsolute(input.filePath)
            ? input.filePath
            : path.join(workspaceRoot, input.filePath);
        // 检查文件是否在workspace内（简单的路径检查）
        const isInWorkspace = fullPath.startsWith(workspaceRoot);
        return {
            allowed: isInWorkspace,
            requiresUserConfirmation: !isInWorkspace,
            reason: isInWorkspace
                ? '文件在workspace内，允许读取'
                : '文件不在workspace内，需要用户确认',
            level: isInWorkspace ? 'read' : 'write',
            autoApprove: isInWorkspace
        };
    }
    /**
     * 工具使用报告
     */
    getToolReport() {
        return {
            toolName: this.name,
            compatibility: this.getCompatibilityReport(),
            features: {
                supportsZodValidation: true,
                supportsLegacyInterface: true,
                supportsPermissionChecks: true,
                exampleUsage: {
                    newInterface: `const tool = new EnhancedFileReadTool();
const result = await tool.execute({ filePath: 'README.md' }, context);`,
                    oldInterface: `const tool = new EnhancedFileReadTool();
const result = await tool.executeForOld({ filePath: 'README.md' }, context);`
                }
            }
        };
    }
}
exports.EnhancedFileReadTool = EnhancedFileReadTool;
/**
 * 使用createEnhancedTool工厂函数创建工具
 */
const createFileReadTool = () => {
    return (0, EnhancedBaseTool_1.createEnhancedTool)({
        id: 'factory-file-read',
        name: '工厂创建的文件读取工具',
        description: '使用createEnhancedTool工厂函数创建的示例工具',
        category: Tool_1.ToolCategory.FILE,
        version: '1.0.0',
        author: 'CodeLine开发团队',
        inputSchema: ZodCompatibility_1.z.object({
            filePath: ZodCompatibility_1.z.string().describe('要读取的文件路径'),
            encoding: ZodCompatibility_1.z.enum(['utf-8', 'utf-16', 'ascii', 'base64']).optional(),
            includeLineCount: ZodCompatibility_1.z.boolean().optional()
        }),
        capabilities: ['read-only', 'requires-workspace'],
        execute: async (input, context) => {
            // 直接实现执行逻辑
            const workspaceRoot = context.workspaceRoot || context.cwd;
            const fullPath = path.isAbsolute(input.filePath)
                ? input.filePath
                : path.join(workspaceRoot, input.filePath);
            const encoding = input.encoding || 'utf-8';
            const includeLineCount = input.includeLineCount || false;
            try {
                // 读取文件
                const uri = vscode.Uri.file(fullPath);
                const fileContent = await vscode.workspace.fs.readFile(uri);
                // 解码内容
                let content;
                if (encoding === 'base64') {
                    content = Buffer.from(fileContent).toString('base64');
                }
                else {
                    content = Buffer.from(fileContent).toString(encoding);
                }
                // 计算行数
                let lineCount;
                if (includeLineCount) {
                    lineCount = content.split('\n').length;
                }
                return {
                    content: content.substring(0, 1000) + (content.length > 1000 ? '... (截断)' : ''), // 限制输出大小
                    size: fileContent.length,
                    lineCount,
                    encoding,
                    success: true
                };
            }
            catch (error) {
                throw new Error(`读取文件失败: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    });
};
exports.createFileReadTool = createFileReadTool;
/**
 * 测试函数：演示EnhancedBaseTool的使用
 */
async function testEnhancedTool() {
    console.log('=== 测试EnhancedBaseTool双接口兼容性 ===');
    // 创建工具实例
    const tool = new EnhancedFileReadTool();
    // 1. 测试兼容性报告
    console.log('1. 兼容性报告:');
    console.log(tool.getCompatibilityReport());
    // 2. 测试获取新旧接口实例
    console.log('\n2. 获取新旧接口实例:');
    const newTool = tool.getNewToolInstance();
    const oldTool = tool.getOldToolInstance();
    console.log('新接口工具ID:', newTool.id);
    console.log('旧接口工具ID:', oldTool.id);
    // 3. 测试工厂函数
    console.log('\n3. 测试工厂函数:');
    const factoryTool = (0, exports.createFileReadTool)();
    console.log('工厂工具ID:', factoryTool.id);
    return {
        tool,
        newTool,
        oldTool,
        factoryTool
    };
}
// 如果直接运行此文件，执行测试
if (require.main === module) {
    testEnhancedTool().catch(console.error);
}
//# sourceMappingURL=EnhancedFileReadTool.js.map