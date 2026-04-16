/**
 * Format Adapters for converting between Claude Code and Cline UI formats
 * 
 * These adapters ensure that Claude Code's tool outputs are displayed correctly
 * in the Cline UI components.
 */

// ============================================================================
// File Edit Format Adapter
// ============================================================================

export interface ClaudeFileEditResult {
  operation: 'add' | 'update' | 'delete' | 'rename';
  path: string;
  oldPath?: string; // For rename operations
  content?: string; // New content for add/update
  diff?: string;    // Unified diff format
  additions?: number;
  deletions?: number;
  diffLines?: string[]; // Line-by-line diff
}

export interface ClineDiffFormat {
  action: 'Add' | 'Update' | 'Delete';
  path: string;
  lines: string[];
  additions: number;
  deletions: number;
  oldPath?: string;
  newContent?: string;
}

/**
 * Convert Claude Code file edit result to Cline Diff format
 */
export function adaptClaudeFileEditToClineDiff(claudeResult: ClaudeFileEditResult): ClineDiffFormat {
  let action: 'Add' | 'Update' | 'Delete';
  
  switch (claudeResult.operation) {
    case 'add':
      action = 'Add';
      break;
    case 'update':
      action = 'Update';
      break;
    case 'delete':
      action = 'Delete';
      break;
    case 'rename':
      action = 'Update'; // Rename is treated as update in Cline UI
      break;
    default:
      action = 'Update';
  }
  
  // Parse diff lines if available
  let lines: string[] = [];
  if (claudeResult.diffLines) {
    lines = claudeResult.diffLines;
  } else if (claudeResult.diff) {
    // Parse unified diff format into line-by-line
    lines = parseUnifiedDiff(claudeResult.diff);
  } else if (claudeResult.content) {
    // For new files, show all lines as additions
    lines = claudeResult.content.split('\n').map(line => `+ ${line}`);
  }
  
  return {
    action,
    path: claudeResult.path,
    lines,
    additions: claudeResult.additions || 0,
    deletions: claudeResult.deletions || 0,
    oldPath: claudeResult.oldPath,
    newContent: claudeResult.content
  };
}

function parseUnifiedDiff(diff: string): string[] {
  const lines = diff.split('\n');
  const result: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('+')) {
      result.push(line);
    } else if (line.startsWith('-')) {
      result.push(line);
    } else if (line.startsWith('@@')) {
      // Skip diff header lines
      continue;
    } else if (line.startsWith(' ')) {
      // Context lines
      result.push(line);
    }
  }
  
  return result;
}

// ============================================================================
// Tool Progress Format Adapter
// ============================================================================

export interface ClaudeToolProgress {
  progress: number; // 0-100
  message: string;
  eta?: number; // Estimated time remaining in seconds
  indeterminate?: boolean;
  toolName?: string;
  step?: string;
}

export interface ClineProgressIndicator {
  percentage: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // In seconds
  isIndeterminate: boolean;
}

/**
 * Convert Claude Code tool progress to Cline progress indicator
 */
export function adaptClaudeProgressToClineUI(claudeProgress: ClaudeToolProgress): ClineProgressIndicator {
  return {
    percentage: claudeProgress.progress,
    message: claudeProgress.message,
    estimatedTimeRemaining: claudeProgress.eta,
    isIndeterminate: claudeProgress.indeterminate || false
  };
}

// ============================================================================
// Tool Result Format Adapter
// ============================================================================

export interface ClaudeToolResult {
  success: boolean;
  output: any;
  error?: string;
  warnings?: string[];
  metadata?: {
    executionTime?: number;
    toolName?: string;
    [key: string]: any;
  };
}

export interface ClineToolResult {
  type: 'fileList' | 'searchResults' | 'commandOutput' | 'browserResult' | 'custom';
  title?: string;
  data: any;
  format: 'list' | 'table' | 'code' | 'markdown' | 'json';
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

/**
 * Convert Claude Code tool result to Cline tool result format
 */
export function adaptClaudeResultToClineUI(claudeResult: ClaudeToolResult, toolName: string): ClineToolResult {
  // Determine result type based on tool name and output structure
  let type: ClineToolResult['type'] = 'custom';
  let format: ClineToolResult['format'] = 'json';
  let data = claudeResult.output;
  
  // Map common tool types to Cline UI formats
  if (toolName.includes('readFile') || toolName.includes('writeFile') || toolName.includes('search')) {
    type = 'fileList';
    format = 'list';
  } else if (toolName.includes('bash') || toolName.includes('execute') || toolName.includes('command')) {
    type = 'commandOutput';
    format = 'code';
  } else if (toolName.includes('browser') || toolName.includes('navigate')) {
    type = 'browserResult';
    format = 'markdown';
  }
  
  // Add actions for common operations
  const actions: ClineToolResult['actions'] = [];
  
  if (type === 'fileList' && Array.isArray(data)) {
    actions.push({
      label: 'Open All',
      action: 'openFiles',
      data: data.map((item: any) => item.path || item)
    });
  }
  
  if (type === 'commandOutput' && typeof data === 'string') {
    actions.push({
      label: 'Copy Output',
      action: 'copyToClipboard',
      data
    });
  }
  
  return {
    type,
    title: `${toolName} Result`,
    data,
    format,
    actions
  };
}

// ============================================================================
// Error Format Adapter
// ============================================================================

export interface ClaudeError {
  message: string;
  code?: string;
  details?: any;
  stack?: string;
}

export interface ClineErrorDisplay {
  title: string;
  message: string;
  details?: string;
  actions: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

/**
 * Convert Claude Code error to Cline error display format
 */
export function adaptClaudeErrorToClineUI(claudeError: ClaudeError, context?: string): ClineErrorDisplay {
  const title = context ? `${context} Error` : 'Error';
  
  // Extract user-friendly message
  let message = claudeError.message;
  let details = claudeError.details ? JSON.stringify(claudeError.details, null, 2) : undefined;
  
  // Clean up technical error messages for users
  if (message.includes('ENOENT')) {
    message = 'File not found';
  } else if (message.includes('EACCES')) {
    message = 'Permission denied';
  } else if (message.includes('timeout')) {
    message = 'Operation timed out';
  }
  
  const actions: ClineErrorDisplay['actions'] = [
    {
      label: 'Retry',
      action: 'retry'
    },
    {
      label: 'Copy Error',
      action: 'copyToClipboard',
      data: JSON.stringify(claudeError, null, 2)
    }
  ];
  
  return {
    title,
    message,
    details,
    actions
  };
}

// ============================================================================
// Combined Adapter Functions
// ============================================================================

/**
 * Main adapter function that routes different Claude Code outputs to appropriate Cline formats
 */
export function adaptClaudeOutputToClineFormat(
  claudeOutput: any,
  outputType: 'fileEdit' | 'toolResult' | 'progress' | 'error',
  context?: any
): any {
  switch (outputType) {
    case 'fileEdit':
      return adaptClaudeFileEditToClineDiff(claudeOutput);
    case 'toolResult':
      return adaptClaudeResultToClineUI(claudeOutput, context?.toolName || 'unknown');
    case 'progress':
      return adaptClaudeProgressToClineUI(claudeOutput);
    case 'error':
      return adaptClaudeErrorToClineUI(claudeOutput, context);
    default:
      return claudeOutput;
  }
}