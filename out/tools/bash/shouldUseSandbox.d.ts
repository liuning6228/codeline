/**
 * 沙箱决策模块
 * 决定是否在沙箱中执行命令
 */
import { BashToolInput } from './BashTool';
/**
 * 判断是否应该在沙箱中执行命令
 */
export declare function shouldUseSandbox(input: BashToolInput): boolean;
/**
 * 检查是否包含被排除的命令（不应在沙箱中运行）
 */
export declare function containsExcludedCommand(command: string): boolean;
//# sourceMappingURL=shouldUseSandbox.d.ts.map