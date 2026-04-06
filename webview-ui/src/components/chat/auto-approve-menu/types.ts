/**
 * 自动批准设置类型定义
 * 借鉴cline的AutoApprovalSettings，适配CodeLine的权限系统
 */

export interface AutoApprovalSettings {
  version: number
  enabled: boolean
  favorites: string[] // 保留字段，向后兼容
  maxRequests: number // 保留字段，向后兼容
  
  // 单个操作权限
  actions: {
    readFiles: boolean // 读取工作目录中的文件和目录
    readFilesExternally?: boolean // 读取工作目录外部的文件
    editFiles: boolean // 编辑工作目录中的文件
    editFilesExternally?: boolean // 编辑工作目录外部的文件
    executeSafeCommands?: boolean // 执行安全命令
    executeAllCommands?: boolean // 执行所有命令
    useBrowser: boolean // 使用浏览器
    useMcp: boolean // 使用MCP服务器
  }
  
  // 全局设置
  enableNotifications: boolean // 显示批准和任务完成的通知
}

export const DEFAULT_AUTO_APPROVAL_SETTINGS: AutoApprovalSettings = {
  version: 1,
  enabled: true,
  favorites: [],
  maxRequests: 20,
  actions: {
    readFiles: true,
    readFilesExternally: false,
    editFiles: false,
    editFilesExternally: false,
    executeSafeCommands: true,
    executeAllCommands: false,
    useBrowser: false,
    useMcp: false,
  },
  enableNotifications: false,
}

// 操作元数据
export interface ActionMetadata {
  id: keyof AutoApprovalSettings['actions'] | 'enableNotifications'
  label: string
  shortName: string
  icon: string
  description?: string
  subAction?: ActionMetadata
  parentActionId?: string
}