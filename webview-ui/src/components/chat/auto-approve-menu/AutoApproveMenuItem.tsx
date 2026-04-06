/**
 * 自动批准菜单项组件
 * 单个操作的开关控件
 */

import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react'
import { useState } from 'react'
import { updateAutoApproveSettings } from './AutoApproveSettingsAPI'
import { ActionMetadata, AutoApprovalSettings } from './types'

interface AutoApproveMenuItemProps {
  action: ActionMetadata
  settings?: AutoApprovalSettings
}

const AutoApproveMenuItem = ({ action, settings }: AutoApproveMenuItemProps) => {
  const [isChecked, setIsChecked] = useState(() => {
    if (!settings?.actions) return false
    
    if (action.id === 'enableNotifications') {
      return settings.enableNotifications || false
    }
    
    return settings.actions[action.id as keyof AutoApprovalSettings['actions']] || false
  })

  const handleToggle = async (checked: boolean) => {
    setIsChecked(checked)
    
    if (!settings) {
      console.warn('无法更新自动批准设置：设置未初始化')
      return
    }

    const updatedSettings = { ...settings }
    
    if (action.id === 'enableNotifications') {
      updatedSettings.enableNotifications = checked
    } else {
      updatedSettings.actions[action.id as keyof AutoApprovalSettings['actions']] = checked
      
      // 处理父操作和子操作的互斥逻辑
      if (action.subAction) {
        // 如果启用父操作，也启用子操作（根据cline的逻辑）
        if (checked) {
          updatedSettings.actions[action.subAction.id as keyof AutoApprovalSettings['actions']] = checked
        }
      } else if (action.parentActionId) {
        // 如果这是子操作且被启用，确保父操作也被启用
        if (checked) {
          updatedSettings.actions[action.parentActionId as keyof AutoApprovalSettings['actions']] = checked
        }
      }
    }
    
    updatedSettings.version = (updatedSettings.version ?? 1) + 1
    
    try {
      await updateAutoApproveSettings(updatedSettings)
    } catch (error) {
      console.error('更新自动批准设置失败:', error)
      // 恢复状态
      setIsChecked(!checked)
    }
  }

  return (
    <div className="mb-2">
      <VSCodeCheckbox
        checked={isChecked}
        onChange={(e: any) => {
          const checked = e.target.checked === true
          handleToggle(checked)
        }}
        style={{
          marginBottom: action.subAction ? '2px' : '4px',
        }}
      >
        <div className="flex items-center gap-2">
          <span className={`codicon ${action.icon} text-sm`} />
          <span className="text-sm font-medium">{action.label}</span>
        </div>
      </VSCodeCheckbox>
      
      {action.description && (
        <div className="ml-7 text-xs text-muted-foreground mb-1">
          {action.description}
        </div>
      )}
      
      {/* 子操作（如果有） */}
      {action.subAction && (
        <div className="ml-6 mt-1">
          <AutoApproveMenuItem 
            action={action.subAction} 
            settings={settings}
          />
        </div>
      )}
    </div>
  )
}

export default AutoApproveMenuItem