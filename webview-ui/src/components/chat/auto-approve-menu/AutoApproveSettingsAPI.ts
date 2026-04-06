/**
 * 自动批准设置API
 * 用于与后端通信更新自动批准设置
 */

import { AutoApprovalSettings } from './types'

// 使用全局vscode对象进行消息传递
declare const vscode: any

/**
 * 更新自动批准设置
 * @param settings 要更新的自动批准设置
 * @throws 如果更新失败则抛出错误
 */
export async function updateAutoApproveSettings(settings: AutoApprovalSettings) {
  try {
    // 发送消息到扩展
    if (typeof vscode !== 'undefined' && vscode.postMessage) {
      return new Promise<void>((resolve, reject) => {
        // 创建超时处理
        const timeoutId = setTimeout(() => {
          reject(new Error('更新自动批准设置超时'))
        }, 5000)
        
        // 监听响应
        const messageHandler = (event: MessageEvent) => {
          const message = event.data
          if (message.command === 'autoApproveSettingsUpdated' && message.version === settings.version) {
            clearTimeout(timeoutId)
            window.removeEventListener('message', messageHandler)
            resolve()
          } else if (message.command === 'autoApproveSettingsUpdateError') {
            clearTimeout(timeoutId)
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error || '更新自动批准设置失败'))
          }
        }
        
        window.addEventListener('message', messageHandler)
        
        // 发送更新请求
        vscode.postMessage({
          command: 'updateAutoApproveSettings',
          settings
        })
      })
    } else {
      console.warn('vscode API不可用，无法更新自动批准设置')
      throw new Error('vscode API不可用')
    }
  } catch (error) {
    console.error('更新自动批准设置失败:', error)
    throw error
  }
}

/**
 * 加载自动批准设置
 * @returns 自动批准设置
 */
export async function loadAutoApproveSettings(): Promise<AutoApprovalSettings> {
  try {
    if (typeof vscode !== 'undefined' && vscode.postMessage) {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('加载自动批准设置超时'))
        }, 5000)
        
        const messageHandler = (event: MessageEvent) => {
          const message = event.data
          if (message.command === 'autoApproveSettingsLoaded') {
            clearTimeout(timeoutId)
            window.removeEventListener('message', messageHandler)
            resolve(message.settings)
          } else if (message.command === 'autoApproveSettingsLoadError') {
            clearTimeout(timeoutId)
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error || '加载自动批准设置失败'))
          }
        }
        
        window.addEventListener('message', messageHandler)
        
        vscode.postMessage({
          command: 'loadAutoApproveSettings'
        })
      })
    } else {
      console.warn('vscode API不可用，返回默认设置')
      // 返回默认设置
      const { DEFAULT_AUTO_APPROVAL_SETTINGS } = await import('./types')
      return DEFAULT_AUTO_APPROVAL_SETTINGS
    }
  } catch (error) {
    console.error('加载自动批准设置失败:', error)
    throw error
  }
}