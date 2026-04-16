/**
 * BashTool 安全验证模块
 * 提供命令安全性检查和验证
 */
import { ExtendedToolContext } from '../../core/tool/BaseTool';
import { ValidationResult } from '../ToolInterface';
import { BashToolInput } from './BashTool';
/**
 * 异步检查命令安全性
 */
export declare function bashCommandIsSafeAsync(params: BashToolInput, context: ExtendedToolContext): Promise<ValidationResult>;
/**
 * 检查命令是否安全（同步版本）
 */
export declare function bashCommandIsSafe(command: string, context: ExtendedToolContext): ValidationResult;
/**
 * 剥离安全的 Here Document 替换
 */
export declare function stripSafeHeredocSubstitutions(command: string): string;
/**
 * 检查命令操作符权限
 */
export declare function checkCommandOperatorPermissions(command: string, context: ExtendedToolContext): ValidationResult;
/**
 * 验证危险模式
 */
export declare function validateDangerousPatterns(command: string, context: ExtendedToolContext): string[];
/**
 * 检查是否有格式错误的令牌
 */
export declare function hasMalformedTokens(command: string): boolean;
//# sourceMappingURL=bashSecurity.d.ts.map