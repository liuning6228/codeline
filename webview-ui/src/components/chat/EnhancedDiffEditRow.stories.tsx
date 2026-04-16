/**
 * EnhancedDiffEditRow 故事示例
 * 展示Phase 4任务4.3的增强差异对比界面
 */

import type { Meta, StoryObj } from '@storybook/react';
import { EnhancedDiffEditRow } from './EnhancedDiffEditRow';

const meta: Meta<typeof EnhancedDiffEditRow> = {
  title: 'Chat/EnhancedDiffEditRow',
  component: EnhancedDiffEditRow,
  tags: ['autodocs'],
  argTypes: {
    patch: {
      control: 'text',
      description: 'diff文本',
    },
    path: {
      control: 'text',
      description: '文件路径',
    },
    sideBySide: {
      control: 'boolean',
      description: '是否并排显示',
    },
    showLineNumbers: {
      control: 'boolean',
      description: '是否显示行号',
    },
    syntaxHighlight: {
      control: 'boolean',
      description: '是否语法高亮',
    },
    interactive: {
      control: 'boolean',
      description: '是否可交互',
    },
    conflictResolvable: {
      control: 'boolean',
      description: '是否可解决冲突',
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedDiffEditRow>;

// 示例diff文本
const exampleDiff = `--- a/src/components/Button.tsx
+++ b/src/components/Button.tsx
@@ -1,15 +1,25 @@
 import React from 'react';
 import { cn } from '@/lib/utils';
+import { Loader2 } from 'lucide-react';
 
 interface ButtonProps {
   children: React.ReactNode;
   variant?: 'primary' | 'secondary' | 'outline';
   size?: 'sm' | 'md' | 'lg';
+  loading?: boolean;
+  disabled?: boolean;
   onClick?: () => void;
 }

-export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', onClick }) => {
-  const baseClasses = 'rounded font-medium transition-colors';
+export const Button: React.FC<ButtonProps> = ({
+  children,
+  variant = 'primary',
+  size = 'md',
+  loading = false,
+  disabled = false,
+  onClick,
+}) => {
+  const baseClasses = 'rounded font-medium transition-colors flex items-center justify-center gap-2';
   
   const variantClasses = {
     primary: 'bg-blue-600 text-white hover:bg-blue-700',
@@ -24,7 +34,16 @@ export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', s
     lg: 'px-6 py-3 text-lg',
   };
   
-  return (
+  const isDisabled = disabled || loading;
+  
+  const handleClick = () => {
+    if (!isDisabled && onClick) {
+      onClick();
+    }
+  };
+  
+  return isDisabled ? (
+    <button
     <button
       className={cn(baseClasses, variantClasses[variant], sizeClasses[size])}
       onClick={onClick}
@@ -32,4 +51,17 @@ export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', s
       {children}
     </button>
   );
+      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], 'opacity-50 cursor-not-allowed')}
+      disabled
+    >
+      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
+      {children}
+    </button>
+  ) : (
+    <button
+      className={cn(baseClasses, variantClasses[variant], sizeClasses[size])}
+      onClick={handleClick}
+    >
+      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
+      {children}
+    </button>
+  );
 };`;

// 有冲突的diff示例
const conflictDiff = `<<<<<<< HEAD
import React from 'react';
import { Button as BaseButton } from './BaseButton';
import { cn } from '@/lib/utils';
=======
import React, { useState } from 'react';
import { Button as OldButton } from './OldButton';
import { mergeClasses } from '@/utils/styles';
>>>>>>> feature/new-button

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  
  onClick?: () => void;
}

<<<<<<< HEAD
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', onClick }) => {
  return (
    <BaseButton
      variant={variant}
      onClick={onClick}
      className={cn('custom-styles')}
    >
      {children}
    </BaseButton>
  );
=======
export const NewButton: React.FC<ButtonProps> = ({ children, variant = 'primary', onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <OldButton
      variant={variant}
      onClick={onClick}
      className={mergeClasses('new-styles', isHovered && 'hover-effect')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </OldButton>
  );
>>>>>>> feature/new-button
}`;

// 新增文件示例
const newFileDiff = `+++ b/src/components/NewComponent.tsx
@@ -0,0 +1,20 @@
+import React from 'react';
+
+interface NewComponentProps {
+  title: string;
+  description?: string;
+}
+
+export const NewComponent: React.FC<NewComponentProps> = ({ title, description }) => {
+  return (
+    <div className="p-4 border rounded-lg">
+      <h2 className="text-xl font-bold mb-2">{title}</h2>
+      {description && (
+        <p className="text-gray-600">{description}</p>
+      )}
+      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
+        点击我
+      </button>
+    </div>
+  );
+};`;

// 删除文件示例
const deleteFileDiff = `--- a/src/components/OldComponent.tsx
+++ /dev/null
@@ -1,15 +0,0 @@
-import React from 'react';
-
-interface OldComponentProps {
-  name: string;
-}
-
-export const OldComponent: React.FC<OldComponentProps> = ({ name }) => {
-  return (
-    <div>
-      <h1>老组件: {name}</h1>
-      <p>这个组件已经过时了，将被删除。</p>
-    </div>
-  );
-};`;

// 基础示例
export const Default: Story = {
  args: {
    patch: exampleDiff,
    path: 'src/components/Button.tsx',
    sideBySide: false,
    showLineNumbers: true,
    syntaxHighlight: true,
    interactive: true,
    conflictResolvable: false,
  },
};

// 并排视图
export const SideBySideView: Story = {
  args: {
    patch: exampleDiff,
    path: 'src/components/Button.tsx',
    sideBySide: true,
    showLineNumbers: true,
    syntaxHighlight: true,
    interactive: true,
  },
};

// 有冲突的diff
export const WithConflicts: Story = {
  args: {
    patch: conflictDiff,
    path: 'src/components/Button.tsx',
    conflictResolvable: true,
    interactive: true,
  },
};

// 新增文件
export const NewFile: Story = {
  args: {
    patch: newFileDiff,
    path: 'src/components/NewComponent.tsx',
    interactive: true,
  },
};

// 删除文件
export const DeletedFile: Story = {
  args: {
    patch: deleteFileDiff,
    path: 'src/components/OldComponent.tsx',
    interactive: true,
  },
};

// 无语法高亮
export const NoSyntaxHighlight: Story = {
  args: {
    patch: exampleDiff,
    path: 'src/components/Button.tsx',
    syntaxHighlight: false,
    showLineNumbers: true,
  },
};

// 无行号
export const NoLineNumbers: Story = {
  args: {
    patch: exampleDiff,
    path: 'src/components/Button.tsx',
    showLineNumbers: false,
    syntaxHighlight: true,
  },
};

// 不可交互
export const NonInteractive: Story = {
  args: {
    patch: exampleDiff,
    path: 'src/components/Button.tsx',
    interactive: false,
  },
};

// 组合示例：显示所有功能
export const FeatureShowcase = {
  render: () => {
    const diffs = [
      { title: '修改文件', diff: exampleDiff, path: 'src/components/Button.tsx' },
      { title: '有冲突', diff: conflictDiff, path: 'src/components/Button.tsx' },
      { title: '新增文件', diff: newFileDiff, path: 'src/components/NewComponent.tsx' },
      { title: '删除文件', diff: deleteFileDiff, path: 'src/components/OldComponent.tsx' },
    ];
    
    return (
      <div className="space-y-6 p-4 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">EnhancedDiffEditRow 功能展示</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diffs.map((item, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">{item.title}</h3>
              <EnhancedDiffEditRow
                patch={item.diff}
                path={item.path}
                interactive={true}
                sideBySide={index === 0} // 第一个示例用并排视图
                conflictResolvable={index === 1} // 第二个示例可解决冲突
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">功能列表</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>并排和统一两种diff视图</li>
            <li>语法高亮（支持多种编程语言）</li>
            <li>可显示/隐藏行号</li>
            <li>搜索和导航功能</li>
            <li>合并冲突解决界面</li>
            <li>文件操作识别（新增、修改、删除）</li>
            <li>可折叠代码块</li>
            <li>复制diff内容</li>
            <li>直接打开文件</li>
          </ul>
        </div>
      </div>
    );
  },
};