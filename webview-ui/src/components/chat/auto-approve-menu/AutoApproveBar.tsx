/**
 * 自动批准设置栏
 * 显示在聊天输入框上方，用于快速设置自动批准权限
 * 借鉴cline的AutoApproveBar实现
 */

import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import AutoApproveModal from './AutoApproveModal'
import { ACTION_METADATA } from './constants'
import { AutoApprovalSettings } from './types'

interface AutoApproveBarProps {
  style?: React.CSSProperties
  settings?: AutoApprovalSettings
}

const AutoApproveBar = ({ style, settings }: AutoApproveBarProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  // 获取已启用操作的文本描述
  const getEnabledActionsText = () => {
    if (!settings?.actions) {
      return <span className="text-muted-foreground truncate">无</span>
    }

    const enabledActionsNames = Object.keys(settings.actions).filter(
      (key) => settings.actions[key as keyof typeof settings.actions],
    )
    
    const enabledActions = enabledActionsNames.map((action) => {
      return ACTION_METADATA.flatMap((a) => [a, a.subAction]).find((a) => a?.id === action)
    })

    // 如果子操作已启用，则过滤掉父操作（只显示子操作）
    const actionsToShow = enabledActions.filter((action) => {
      if (!action?.shortName) {
        return false
      }

      // 如果这是父操作且其子操作已启用，跳过它
      if (action.subAction?.id && enabledActionsNames.includes(action.subAction.id)) {
        return false
      }

      return true
    })

    if (actionsToShow.length === 0) {
      return <span className="text-muted-foreground truncate">无</span>
    }

    return (
      <span className="text-muted-foreground group-hover:text-foreground truncate">
        {actionsToShow.map((action, index) => (
          <span key={action?.id}>
            {action?.shortName}
            {index < actionsToShow.length - 1 && '、'}
          </span>
        ))}
      </span>
    )
  }

  // 样式定义 - 使用VS Code主题变量
  const borderColor = 'var(--vscode-panel-border)'
  const bgColor = 'var(--vscode-sideBar-background)'

  return (
    <div
      className="mx-4 select-none break-words relative"
      style={{
        borderTop: `1px solid ${borderColor}`,
        borderRadius: '4px 4px 0 0',
        background: bgColor,
        ...style,
      }}
    >
      {/* 左侧边框渐变 */}
      <div
        className="absolute left-0 pointer-events-none"
        style={{
          width: '1px',
          top: '3px',
          height: '100%',
          background: `linear-gradient(to bottom, ${borderColor} 0%, transparent 50%)`,
        }}
      />
      
      {/* 右侧边框渐变 */}
      <div
        className="absolute right-0 top-0 pointer-events-none"
        style={{
          width: '1px',
          top: '3px',
          height: '100%',
          background: `linear-gradient(to bottom, ${borderColor} 0%, transparent 50%)`,
        }}
      />

      <div
        aria-label={isModalVisible ? '关闭自动批准设置' : '打开自动批准设置'}
        className="group cursor-pointer py-2 px-4 flex items-center justify-between gap-2"
        onClick={() => {
          setIsModalVisible((prev) => !prev)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            setIsModalVisible((prev) => !prev)
          }
        }}
        ref={buttonRef}
        tabIndex={0}
      >
        <div className="flex flex-nowrap items-center gap-2 min-w-0 flex-1">
          <span className="whitespace-nowrap text-sm font-medium">自动批准：</span>
          {getEnabledActionsText()}
        </div>
        {isModalVisible ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
      </div>

      <AutoApproveModal
        ACTION_METADATA={ACTION_METADATA}
        buttonRef={buttonRef}
        isVisible={isModalVisible}
        setIsVisible={setIsModalVisible}
        settings={settings}
      />
    </div>
  )
}

export default AutoApproveBar