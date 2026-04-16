/**
 * 自动批准设置模态框
 * 显示自动批准选项的详细设置
 */

import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react'
import React, { useEffect, useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import AutoApproveMenuItem from './AutoApproveMenuItem'
import { updateAutoApproveSettings } from './AutoApproveSettingsAPI'
import { ActionMetadata, AutoApprovalSettings } from './types'

const breakpoint = 500

interface AutoApproveModalProps {
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
  buttonRef: React.RefObject<HTMLDivElement>
  ACTION_METADATA: ActionMetadata[]
  settings?: AutoApprovalSettings
}

const AutoApproveModal: React.FC<AutoApproveModalProps> = ({ 
  isVisible, 
  setIsVisible, 
  buttonRef, 
  ACTION_METADATA,
  settings 
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const itemsContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useClickAway(modalRef, (e) => {
    // 如果点击的是切换模态框的按钮，则跳过
    if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
      return
    }
    setIsVisible(false)
  })

  // 跟踪容器宽度以实现响应式布局
  useEffect(() => {
    if (!isVisible) {
      return
    }

    const updateWidth = () => {
      if (itemsContainerRef.current) {
        setContainerWidth(itemsContainerRef.current.offsetWidth)
      }
    }

    // 初始测量
    updateWidth()

    // 设置resize观察者
    const resizeObserver = new ResizeObserver(updateWidth)
    if (itemsContainerRef.current) {
      resizeObserver.observe(itemsContainerRef.current)
    }

    // 清理
    return () => {
      resizeObserver.disconnect()
    }
  }, [isVisible])

  if (!isVisible) {
    return null
  }

  return (
    <div ref={modalRef}>
      {/* 扩展的菜单内容 - 直接渲染在栏下方 */}
      <div
        className="overflow-y-auto pb-4 px-4 overscroll-contain"
        style={{
          maxHeight: '60vh',
          backgroundColor: 'var(--vscode-sideBar-background)',
        }}
      >
        <div className="mb-3 text-muted-foreground text-xs cursor-pointer" onClick={() => setIsVisible(false)}>
          让CodeLine执行这些操作时无需请求批准。
          <a
            className="text-link hover:text-link-hover ml-1"
            href="https://docs.codeline.ai/features/auto-approve"
            rel="noopener"
            style={{ fontSize: 'inherit' }}
            target="_blank"
          >
            文档
          </a>
        </div>

        <div
          className="relative mb-3 w-full"
          ref={itemsContainerRef}
          style={{
            columnCount: containerWidth > breakpoint ? 2 : 1,
            columnGap: '8px',
          }}
        >
          {/* 垂直分隔线 - 仅在双列模式下可见 */}
          {containerWidth > breakpoint && (
            <div
              className="absolute left-1/2 top-0 bottom-0 opacity-20"
              style={{
                background: 'var(--vscode-panel-border)',
                transform: 'translateX(-50%)', // 居中线条
              }}
            />
          )}

          {/* 所有选项在单个列表中 - CSS Grid将处理列分布 */}
          {ACTION_METADATA.map((action) => (
            <AutoApproveMenuItem 
              key={action.id} 
              action={action} 
              settings={settings}
            />
          ))}
        </div>

        {/* 分隔线 */}
        <div
          style={{
            height: '1px',
            background: 'var(--vscode-panel-border)',
            opacity: 0.3,
            margin: '12px 0',
          }}
        />

        {/* 通知开关 */}
        <div className="flex items-center gap-2">
          <VSCodeCheckbox
            checked={settings?.enableNotifications || false}
            onChange={async (e: any) => {
              const checked = e.target.checked === true
              if (settings) {
                await updateAutoApproveSettings({
                  ...settings,
                  version: (settings.version ?? 1) + 1,
                  enableNotifications: checked,
                })
              }
            }}
          >
            <span className="text-sm">启用通知</span>
          </VSCodeCheckbox>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          出于安全和隐私考虑，通知可能显示简化的工具详情。
        </div>
      </div>
    </div>
  )
}

export default AutoApproveModal