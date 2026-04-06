/**
 * BashTool 导出
 * 包含原始BashTool和增强版EnhancedBashTool
 */

export { BashTool } from './BashTool';
export { EnhancedBashTool } from './EnhancedBashTool';
export { checkBashPermissions } from './bashPermissions';
// export { bashSecurity } from './bashSecurity';
// export { commandSemantics } from './commandSemantics';
export { shouldUseSandbox } from './shouldUseSandbox';
// export { utils } from './utils';

// 默认导出增强版BashTool
import { EnhancedBashTool } from './EnhancedBashTool';
export default EnhancedBashTool;