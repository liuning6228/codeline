/**
 * EnhancedDiffEditRow 组件
 * Phase 4 任务4.3: 增强差异对比界面
 * 
 * 提供更强大的diff视图，支持：
 * - 并排diff显示
 * - 语法高亮
 * - 行号显示
 * - 合并冲突解决
 * - 可折叠代码块
 * - 搜索和导航
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Code, 
  FileDiff, 
  GitMerge, 
  GitPullRequest,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  AlertCircle,
  FileText,
  FilePlus,
  FileMinus,
  FileX,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StringRequest } from "@shared/proto/cline/common";
import { FileServiceClient } from "@/services/grpc-client";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DiffLine {
  /** 行号 */
  lineNumber: number;
  /** 原始内容 */
  original?: string;
  /** 新内容 */
  modified?: string;
  /** 行类型: 'added', 'removed', 'unchanged', 'conflict' */
  type: 'added' | 'removed' | 'unchanged' | 'conflict';
  /** 是否已解决冲突 */
  conflictResolved?: boolean;
  /** 冲突解决选择: 'ours', 'theirs', 'both', 'custom' */
  resolution?: 'ours' | 'theirs' | 'both' | 'custom';
}

interface EnhancedDiffFile {
  /** 文件路径 */
  path: string;
  /** 操作类型: 'Add', 'Update', 'Delete' */
  action: 'Add' | 'Update' | 'Delete';
  /** 原始内容 */
  originalContent?: string;
  /** 新内容 */
  newContent?: string;
  /** 解析后的diff行 */
  diffLines: DiffLine[];
  /** 添加的行数 */
  additions: number;
  /** 删除的行数 */
  deletions: number;
  /** 文件扩展名，用于语法高亮 */
  extension?: string;
  /** 是否二进制文件 */
  isBinary?: boolean;
  /** 合并冲突标记 */
  hasConflicts?: boolean;
}

interface EnhancedDiffEditRowProps {
  /** diff文本 */
  patch: string;
  /** 文件路径 */
  path: string;
  /** 是否加载中 */
  isLoading?: boolean;
  /** 开始行号 */
  startLineNumbers?: number[];
  /** 是否并排显示 */
  sideBySide?: boolean;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 是否显示语法高亮 */
  syntaxHighlight?: boolean;
  /** 是否可交互 */
  interactive?: boolean;
  /** 是否可解决冲突 */
  conflictResolvable?: boolean;
  /** 变更回调 */
  onChange?: (filePath: string, resolvedContent: string) => void;
}

/**
 * 解析diff文本为增强格式
 */
const parseEnhancedDiff = (patch: string, filePath: string): EnhancedDiffFile => {
  const lines = patch.split('\n');
  let action: 'Add' | 'Update' | 'Delete' = 'Update';
  let originalContent = '';
  let newContent = '';
  let diffLines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let hasConflicts = false;
  
  // 简单的diff解析（简化版，实际需要更复杂的解析）
  let lineNumber = 1;
  let originalLineNumber = 1;
  let newLineNumber = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('---')) {
      // 原始文件标记
      continue;
    } else if (line.startsWith('+++')) {
      // 新文件标记
      continue;
    } else if (line.startsWith('@@')) {
      // diff范围标记
      // 例如: @@ -1,5 +1,7 @@
      continue;
    } else if (line.startsWith('+')) {
      // 添加的行
      diffLines.push({
        lineNumber: lineNumber++,
        modified: line.substring(1),
        type: 'added',
      });
      additions++;
      newLineNumber++;
    } else if (line.startsWith('-')) {
      // 删除的行
      diffLines.push({
        lineNumber: lineNumber++,
        original: line.substring(1),
        type: 'removed',
      });
      deletions++;
      originalLineNumber++;
    } else if (line.startsWith('<<<<<<<')) {
      // 合并冲突开始
      hasConflicts = true;
      diffLines.push({
        lineNumber: lineNumber++,
        original: line,
        type: 'conflict',
      });
    } else if (line.startsWith('=======')) {
      // 合并冲突分隔符
      diffLines.push({
        lineNumber: lineNumber++,
        original: line,
        type: 'conflict',
      });
    } else if (line.startsWith('>>>>>>>')) {
      // 合并冲突结束
      diffLines.push({
        lineNumber: lineNumber++,
        original: line,
        type: 'conflict',
      });
    } else {
      // 未改变的行
      diffLines.push({
        lineNumber: lineNumber++,
        original: line,
        modified: line,
        type: 'unchanged',
      });
      originalLineNumber++;
      newLineNumber++;
    }
  }
  
  // 判断操作类型
  if (additions > 0 && deletions === 0 && !patch.includes('---')) {
    action = 'Add';
  } else if (additions === 0 && deletions > 0) {
    action = 'Delete';
  }
  
  // 获取文件扩展名
  const extension = filePath.split('.').pop()?.toLowerCase();
  
  return {
    path: filePath,
    action,
    diffLines,
    additions,
    deletions,
    hasConflicts,
    extension,
  };
};

/**
 * 获取文件图标
 */
const getFileIcon = (action: 'Add' | 'Update' | 'Delete') => {
  switch (action) {
    case 'Add':
      return <FilePlus className="w-4 h-4" />;
    case 'Delete':
      return <FileX className="w-4 h-4" />;
    default:
      return <FileDiff className="w-4 h-4" />;
  }
};

/**
 * 获取操作颜色
 */
const getActionColor = (action: 'Add' | 'Update' | 'Delete') => {
  switch (action) {
    case 'Add':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Delete':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

/**
 * 获取行类型颜色
 */
const getLineTypeColor = (type: DiffLine['type']) => {
  switch (type) {
    case 'added':
      return 'bg-green-50 border-l-4 border-l-green-500';
    case 'removed':
      return 'bg-red-50 border-l-4 border-l-red-500 line-through opacity-70';
    case 'conflict':
      return 'bg-yellow-50 border-l-4 border-l-yellow-500';
    default:
      return '';
  }
};

/**
 * 获取语言名称用于语法高亮
 */
const getLanguageName = (extension?: string) => {
  if (!extension) return 'text';
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rb': 'ruby',
    'php': 'php',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'yml': 'yaml',
    'yaml': 'yaml',
    'xml': 'xml',
    'sh': 'bash',
    'bash': 'bash',
  };
  
  return languageMap[extension] || 'text';
};

/**
 * EnhancedDiffEditRow 主组件
 */
export const EnhancedDiffEditRow: React.FC<EnhancedDiffEditRowProps> = ({
  patch,
  path,
  isLoading = false,
  startLineNumbers,
  sideBySide = false,
  showLineNumbers = true,
  syntaxHighlight = true,
  interactive = true,
  conflictResolvable = false,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'unified' | 'sideBySide'>('unified');
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [resolvedConflicts, setResolvedConflicts] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // 解析diff
  const diffFile = useMemo(() => {
    return parseEnhancedDiff(patch, path);
  }, [patch, path]);
  
  // 搜索功能
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results: number[] = [];
    
    diffFile.diffLines.forEach((line, index) => {
      const content = line.original || line.modified || '';
      if (content.toLowerCase().includes(query)) {
        results.push(index);
      }
    });
    
    setSearchResults(results);
    setCurrentSearchIndex(0);
  }, [searchQuery, diffFile.diffLines]);
  
  // 处理复制
  const handleCopy = useCallback(() => {
    const content = diffFile.diffLines
      .map(line => {
        const prefix = line.type === 'added' ? '+' : 
                      line.type === 'removed' ? '-' : ' ';
        return `${prefix} ${line.original || line.modified || ''}`;
      })
      .join('\n');
    
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [diffFile.diffLines]);
  
  // 处理冲突解决
  const handleResolveConflict = useCallback((lineIndex: number, resolution: DiffLine['resolution']) => {
    setResolvedConflicts(prev => ({
      ...prev,
      [lineIndex]: true,
    }));
    
    // TODO: 实际生成解决后的内容
    if (onChange) {
      // 这里应该生成解决冲突后的内容
      const resolvedContent = diffFile.diffLines
        .map((line, idx) => {
          if (idx === lineIndex) {
            // 根据resolution返回相应的内容
            return `// 冲突已解决: ${resolution}`;
          }
          return line.original || line.modified || '';
        })
        .join('\n');
      
      onChange(diffFile.path, resolvedContent);
    }
  }, [diffFile, onChange]);
  
  // 导航到下一个搜索结果
  const navigateToNextResult = useCallback(() => {
    if (searchResults.length === 0) return;
    
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    
    // 滚动到该行
    const lineIndex = searchResults[nextIndex];
    const element = containerRef.current?.querySelector(`[data-line-index="${lineIndex}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [searchResults, currentSearchIndex]);
  
  // 导航到上一个搜索结果
  const navigateToPrevResult = useCallback(() => {
    if (searchResults.length === 0) return;
    
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIndex);
    
    // 滚动到该行
    const lineIndex = searchResults[prevIndex];
    const element = containerRef.current?.querySelector(`[data-line-index="${lineIndex}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [searchResults, currentSearchIndex]);
  
  // 打开文件
  const handleOpenFile = useCallback(() => {
    FileServiceClient.openFileRelativePath(StringRequest.create({ value: path })).catch((err) =>
      console.error("Failed to open file:", err)
    );
  }, [path]);
  
  // 渲染单行
  const renderLine = useCallback((line: DiffLine, index: number) => {
    const isSearchResult = searchResults.includes(index);
    const isCurrentSearchResult = searchResults[currentSearchIndex] === index;
    const isConflictResolved = resolvedConflicts[index];
    
    const lineContent = line.original || line.modified || '';
    
    // 行号显示
    const lineNumberElement = showLineNumbers && (
      <div className="w-12 text-right pr-2 text-gray-500 select-none font-mono text-xs">
        {line.type === 'unchanged' || line.type === 'removed' ? index + 1 : ''}
        {line.type === 'added' ? '' : ''}
      </div>
    );
    
    // 语法高亮
    const contentElement = syntaxHighlight && diffFile.extension ? (
      <SyntaxHighlighter
        language={getLanguageName(diffFile.extension)}
        style={vscDarkPlus}
        customStyle={{
          background: 'transparent',
          padding: 0,
          margin: 0,
          fontSize: '12px',
        }}
        lineProps={{ style: { whiteSpace: 'pre-wrap' } }}
      >
        {lineContent}
      </SyntaxHighlighter>
    ) : (
      <pre className="font-mono text-xs whitespace-pre-wrap break-words">
        {lineContent}
      </pre>
    );
    
    // 冲突解决按钮
    const conflictResolutionButtons = conflictResolvable && line.type === 'conflict' && !isConflictResolved && (
      <div className="flex gap-1 mt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleResolveConflict(index, 'ours')}
          className="text-xs h-6"
        >
          保留我们的
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleResolveConflict(index, 'theirs')}
          className="text-xs h-6"
        >
          保留他们的
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleResolveConflict(index, 'both')}
          className="text-xs h-6"
        >
          保留两者
        </Button>
      </div>
    );
    
    return (
      <div
        key={index}
        data-line-index={index}
        className={cn(
          "flex items-start p-1 font-mono text-sm",
          getLineTypeColor(line.type),
          isSearchResult && "bg-yellow-100",
          isCurrentSearchResult && "ring-2 ring-yellow-400",
          isConflictResolved && "bg-green-100 opacity-70"
        )}
      >
        {lineNumberElement}
        <div className="flex-1 min-w-0">
          <div className="flex items-start">
            <div className="w-6 text-center text-xs text-gray-400 select-none">
              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
            </div>
            <div className="flex-1 min-w-0">
              {contentElement}
            </div>
          </div>
          {conflictResolutionButtons}
        </div>
      </div>
    );
  }, [searchResults, currentSearchIndex, resolvedConflicts, showLineNumbers, syntaxHighlight, diffFile.extension, conflictResolvable, handleResolveConflict]);
  
  // 渲染并排视图
  const renderSideBySide = useCallback(() => {
    const leftLines: DiffLine[] = [];
    const rightLines: DiffLine[] = [];
    
    diffFile.diffLines.forEach(line => {
      if (line.type === 'removed' || line.type === 'unchanged') {
        leftLines.push(line);
      }
      if (line.type === 'added' || line.type === 'unchanged') {
        rightLines.push({ ...line, original: line.modified });
      }
      // 对于冲突行，两边都显示
      if (line.type === 'conflict') {
        leftLines.push(line);
        rightLines.push(line);
      }
    });
    
    return (
      <div className="flex border rounded overflow-hidden">
        {/* 左侧 - 原始内容 */}
        <div className="flex-1 border-r">
          <div className="bg-gray-50 p-2 border-b text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>原始</span>
            <span className="text-red-600 ml-auto">{diffFile.deletions} 删除</span>
          </div>
          <div className="max-h-96 overflow-auto">
            {leftLines.map((line, index) => renderLine(line, index))}
          </div>
        </div>
        
        {/* 右侧 - 新内容 */}
        <div className="flex-1">
          <div className="bg-gray-50 p-2 border-b text-sm font-semibold flex items-center gap-2">
            <FileDiff className="w-4 h-4" />
            <span>新内容</span>
            <span className="text-green-600 ml-auto">{diffFile.additions} 添加</span>
          </div>
          <div className="max-h-96 overflow-auto">
            {rightLines.map((line, index) => renderLine(line, index))}
          </div>
        </div>
      </div>
    );
  }, [diffFile, renderLine]);
  
  // 渲染统一视图
  const renderUnified = useCallback(() => (
    <div className="border rounded overflow-hidden">
      <div className="bg-gray-50 p-2 border-b text-sm font-semibold flex items-center gap-2">
        <FileDiff className="w-4 h-4" />
        <span>统一视图</span>
        <span className="text-green-600">{diffFile.additions} 添加</span>
        <span className="text-red-600 ml-2">{diffFile.deletions} 删除</span>
        {diffFile.hasConflicts && (
          <span className="text-yellow-600 ml-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            有冲突
          </span>
        )}
      </div>
      <div className="max-h-96 overflow-auto" ref={containerRef}>
        {diffFile.diffLines.map((line, index) => renderLine(line, index))}
      </div>
    </div>
  ), [diffFile, renderLine]);
  
  // 文件头部信息
  const fileHeader = (
    <div className={cn(
      "flex items-center justify-between p-3 cursor-pointer rounded-t",
      getActionColor(diffFile.action),
      isExpanded && "border-b"
    )}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {getFileIcon(diffFile.action)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">
              {diffFile.path}
            </h3>
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-medium",
              diffFile.action === 'Add' ? 'bg-green-100 text-green-800' :
              diffFile.action === 'Delete' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            )}>
              {diffFile.action === 'Add' ? '新增文件' :
               diffFile.action === 'Delete' ? '删除文件' : '修改文件'}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <FilePlus className="w-3 h-3" />
              {diffFile.additions} 添加
            </span>
            <span className="flex items-center gap-1">
              <FileMinus className="w-3 h-3" />
              {diffFile.deletions} 删除
            </span>
            {diffFile.extension && (
              <span className="flex items-center gap-1">
                <Code className="w-3 h-3" />
                {diffFile.extension}
              </span>
            )}
            {diffFile.hasConflicts && (
              <span className="flex items-center gap-1 text-yellow-600">
                <GitMerge className="w-3 h-3" />
                有冲突
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </div>
    </div>
  );
  
  // 工具栏
  const toolbar = isExpanded && (
    <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode(viewMode === 'unified' ? 'sideBySide' : 'unified')}
          className="h-7 px-2 text-xs"
        >
          {viewMode === 'unified' ? <Maximize2 className="w-3 h-3 mr-1" /> : <Minimize2 className="w-3 h-3 mr-1" />}
          {viewMode === 'unified' ? '并排视图' : '统一视图'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLineNumbers(!showLineNumbers)}
          className="h-7 px-2 text-xs"
        >
          {showLineNumbers ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          行号
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs"
        >
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? '已复制' : '复制'}
        </Button>
        
        {interactive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenFile}
            className="h-7 px-2 text-xs"
          >
            打开文件
          </Button>
        )}
      </div>
      
      {/* 搜索框 */}
      <div className="flex items-center gap-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 pr-2 py-1 text-xs border rounded w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        {searchResults.length > 0 && (
          <>
            <span className="text-xs text-gray-500">
              {currentSearchIndex + 1}/{searchResults.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToPrevResult}
              className="h-7 px-1 text-xs"
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToNextResult}
              className="h-7 px-1 text-xs"
            >
              ↓
            </Button>
          </>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <div onClick={() => setIsExpanded(!isExpanded)}>
        {fileHeader}
      </div>
      
      {isExpanded && (
        <>
          {toolbar}
          <div className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                加载中...
              </div>
            ) : viewMode === 'sideBySide' ? (
              renderSideBySide()
            ) : (
              renderUnified()
            )}
          </div>
          
          {/* 统计信息 */}
          <div className="flex items-center justify-between p-2 bg-gray-50 border-t text-xs text-gray-600">
            <div>
              总计: {diffFile.diffLines.length} 行
              {diffFile.hasConflicts && (
                <span className="ml-2 text-yellow-600">
                  ({Object.keys(resolvedConflicts).length} 个冲突已解决)
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-green-600">+{diffFile.additions}</span>
              <span className="text-red-600">-{diffFile.deletions}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedDiffEditRow;