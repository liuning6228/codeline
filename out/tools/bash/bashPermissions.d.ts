/**
 * BashTool 权限检查模块
 * 简化版本，提供基本的命令安全性检查
 */
import { ExtendedToolContext } from '../../core/tool/BaseTool';
import { PermissionResult } from '../ToolInterface';
import { BashToolInput } from './BashTool';
/**
 * 检查 Bash 命令权限
 */
export declare function checkBashPermissions(params: BashToolInput, context: ExtendedToolContext): Promise<PermissionResult>;
/**
 * 检查命令是否有 CD 操作
 */
export declare function commandHasAnyCd(command: string): boolean;
/**
 * 匹配通配符模式
 */
export declare function matchWildcardPattern(pattern: string, command: string): boolean;
/**
 * 提取权限规则前缀
 */
export declare function permissionRuleExtractPrefix(pattern: string): string | null;
/**
 * 为精确命令生成建议
 */
export declare function suggestionForExactCommand(command: string): any[];
//# sourceMappingURL=bashPermissions.d.ts.map