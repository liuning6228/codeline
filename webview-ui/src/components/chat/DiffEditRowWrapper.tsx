/**
 * DiffEditRowWrapper 组件
 * 
 * 根据特性开关选择渲染 EnhancedDiffEditRow 或 DiffEditRow
 * Phase 5 系统集成的一部分
 */

import React from 'react';
import { useHasFeatureFlag } from '@/hooks/useFeatureFlag';
import { FeatureFlag } from '@shared/services/feature-flags/feature-flags';
import { DiffEditRow } from './DiffEditRow';
import EnhancedDiffEditRow from './EnhancedDiffEditRow';

interface DiffEditRowWrapperProps {
  /** diff文本 */
  patch: string;
  /** 文件路径 */
  path: string;
  /** 是否加载中 */
  isLoading?: boolean;
  /** 开始行号 */
  startLineNumbers?: number[];
  /** 是否并排显示 (EnhancedDiffEditRow特有) */
  sideBySide?: boolean;
  /** 是否显示行号 (EnhancedDiffEditRow特有) */
  showLineNumbers?: boolean;
  /** 是否显示语法高亮 (EnhancedDiffEditRow特有) */
  syntaxHighlight?: boolean;
  /** 是否可交互 (EnhancedDiffEditRow特有) */
  interactive?: boolean;
  /** 是否可解决冲突 (EnhancedDiffEditRow特有) */
  conflictResolvable?: boolean;
  /** 变更回调 (EnhancedDiffEditRow特有) */
  onChange?: (path: string, newContent: string) => void;
}

/**
 * 判断是否应该使用增强diff界面
 * 逻辑：如果特性开关启用，则使用EnhancedDiffEditRow
 */
const shouldUseEnhancedDiffEditRow = (): boolean => {
  // 首先检查特性开关
  const featureFlagEnabled = useHasFeatureFlag(FeatureFlag.ENHANCED_CHAT_UI);
  
  // 也可以检查环境变量作为后备方案
  const envEnabled = process.env.REACT_APP_ENABLE_ENHANCED_CHAT === 'true';
  
  return featureFlagEnabled || envEnabled;
};

/**
 * DiffEditRow包装器组件
 * 根据配置选择渲染哪个版本的diff界面
 */
const DiffEditRowWrapper: React.FC<DiffEditRowWrapperProps> = (props) => {
  const useEnhancedDiffEditRow = shouldUseEnhancedDiffEditRow();
  
  // 在开发环境中记录选择，便于调试
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎛️ DiffEditRowWrapper: ${useEnhancedDiffEditRow ? '使用EnhancedDiffEditRow' : '使用DiffEditRow'}`);
  }
  
  if (useEnhancedDiffEditRow) {
    // 提取EnhancedDiffEditRow特有的props
    const {
      sideBySide = true,
      showLineNumbers = true,
      syntaxHighlight = true,
      interactive = true,
      conflictResolvable = true,
      onChange,
      ...commonProps
    } = props;
    
    return (
      <EnhancedDiffEditRow
        {...commonProps}
        sideBySide={sideBySide}
        showLineNumbers={showLineNumbers}
        syntaxHighlight={syntaxHighlight}
        interactive={interactive}
        conflictResolvable={conflictResolvable}
        onChange={onChange}
      />
    );
  }
  
  // 默认使用原始DiffEditRow
  // 只传递DiffEditRow支持的props
  const { patch, path, isLoading, startLineNumbers } = props;
  return (
    <DiffEditRow
      patch={patch}
      path={path}
      isLoading={isLoading}
      startLineNumbers={startLineNumbers}
    />
  );
};

export default DiffEditRowWrapper;