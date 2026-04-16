/**
 * 自动批准操作常量定义
 * 借鉴cline的ACTION_METADATA，适配CodeLine的权限系统
 */

import { ActionMetadata } from './types'

export const ACTION_METADATA: ActionMetadata[] = [
  {
    id: 'readFiles',
    label: '读取项目文件',
    shortName: '读取',
    icon: 'codicon-search',
    description: '允许读取工作目录中的文件和目录',
    subAction: {
      id: 'readFilesExternally',
      label: '读取所有文件',
      shortName: '读取（全部）',
      icon: 'codicon-folder-opened',
      description: '允许读取工作目录外部的文件',
      parentActionId: 'readFiles',
    },
  },
  {
    id: 'editFiles',
    label: '编辑项目文件',
    shortName: '编辑',
    icon: 'codicon-edit',
    description: '允许编辑工作目录中的文件',
    subAction: {
      id: 'editFilesExternally',
      label: '编辑所有文件',
      shortName: '编辑（全部）',
      icon: 'codicon-files',
      description: '允许编辑工作目录外部的文件',
      parentActionId: 'editFiles',
    },
  },
  {
    id: 'executeSafeCommands',
    label: '执行安全命令',
    shortName: '安全命令',
    icon: 'codicon-terminal',
    description: '允许执行被标记为安全的命令',
    subAction: {
      id: 'executeAllCommands',
      label: '执行所有命令',
      shortName: '所有命令',
      icon: 'codicon-terminal-bash',
      description: '允许执行所有命令（包括潜在危险的命令）',
      parentActionId: 'executeSafeCommands',
    },
  },
  {
    id: 'useBrowser',
    label: '使用浏览器',
    shortName: '浏览器',
    icon: 'codicon-globe',
    description: '允许使用浏览器进行网页操作',
  },
  {
    id: 'useMcp',
    label: '使用MCP服务器',
    shortName: 'MCP',
    icon: 'codicon-server',
    description: '允许使用MCP（Model Context Protocol）服务器',
  },
]

export const NOTIFICATIONS_SETTING: ActionMetadata = {
  id: 'enableNotifications',
  label: '启用通知',
  shortName: '通知',
  icon: 'codicon-bell',
  description: '显示批准和任务完成的通知',
}