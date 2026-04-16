/**
 * Tool Adapter for wrapping CodeLine tools as Claude Code tools
 * 
 * This adapter converts CodeLine's existing tool system to the format
 * expected by Claude Code QueryEngine.
 */

import { ToolDefinition, ToolExecutionContext, ToolProgress } from './query-engine';

// ============================================================================
// CodeLine Tool Interface (Simplified based on analysis)
// ============================================================================

export interface CodeLineTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  
  // Execution methods
  execute(input: any, context: CodeLineToolContext): Promise<CodeLineToolResult>;
  
  // Validation
  validateInput?(input: any): ValidationResult;
  validateOutput?(output: any): ValidationResult;
  
  // Permissions
  permissions?: string[];
  requiresApproval?: boolean;
}

export interface CodeLineToolContext {
  workspaceRoot: string;
  currentFile?: string;
  vscode?: any;
  state?: any;
  onProgress?: (progress: CodeLineProgress) => void;
}

export interface CodeLineToolResult {
  success: boolean;
  output: any;
  error?: string;
  warnings?: string[];
  metadata?: {
    executionTime?: number;
    requiresApproval?: boolean;
    [key: string]: any;
  };
}

export interface CodeLineProgress {
  percentage: number;
  message: string;
  eta?: number;
  indeterminate?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

// ============================================================================
// Tool Adapter Implementation
// ============================================================================

/**
 * Adapts a CodeLine tool to Claude Code tool format
 */
export function adaptCodeLineToolToClaude(
  codeLineTool: CodeLineTool,
  getContext?: () => CodeLineToolContext
): ToolDefinition {
  return {
    name: codeLineTool.id,
    description: codeLineTool.description,
    
    // Simplified input schema - in reality would use Zod
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: true
    },
    
    // Simplified output schema
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        output: {},
        error: { type: 'string', optional: true }
      }
    },
    
    permissions: codeLineTool.permissions || [],
    
    execute: async (input: any, context: ToolExecutionContext): Promise<any> => {
      try {
        // Create CodeLine tool context
        const codeLineContext: CodeLineToolContext = {
          workspaceRoot: context.projectRoot || '',
          currentFile: context.currentFile,
          vscode: getContext?.().vscode,
          state: getContext?.().state,
          onProgress: (progress: CodeLineProgress) => {
            // Forward progress to Claude Code context
            if (context.onProgress) {
              const claudeProgress: ToolProgress = {
                percentage: progress.percentage,
                message: progress.message,
                eta: progress.eta,
                indeterminate: progress.indeterminate
              };
              context.onProgress(claudeProgress);
            }
          }
        };
        
        // Validate input if validation method exists
        if (codeLineTool.validateInput) {
          const validation = codeLineTool.validateInput(input);
          if (!validation.valid) {
            throw new Error(`Input validation failed: ${validation.errors?.join(', ')}`);
          }
        }
        
        // Execute the CodeLine tool
        const startTime = Date.now();
        const result = await codeLineTool.execute(input, codeLineContext);
        const executionTime = Date.now() - startTime;
        
        // Validate output if validation method exists
        if (codeLineTool.validateOutput && result.success) {
          const validation = codeLineTool.validateOutput(result.output);
          if (!validation.valid) {
            console.warn(`Output validation warnings: ${validation.warnings?.join(', ')}`);
          }
        }
        
        // Return in Claude Code format
        return {
          success: result.success,
          output: result.output,
          error: result.error,
          warnings: result.warnings,
          metadata: {
            ...result.metadata,
            executionTime,
            toolId: codeLineTool.id,
            requiresApproval: codeLineTool.requiresApproval
          }
        };
        
      } catch (error) {
        return {
          success: false,
          output: null,
          error: error instanceof Error ? error.message : String(error),
          metadata: {
            toolId: codeLineTool.id,
            error: true
          }
        };
      }
    }
  };
}

// ============================================================================
// Common CodeLine Tool Implementations
// ============================================================================

/**
 * Create a file read tool based on CodeLine's file operations
 */
export function createFileReadTool(): CodeLineTool {
  return {
    id: 'readFile',
    name: 'Read File',
    description: 'Read the contents of a file',
    category: 'file',
    icon: '📄',
    
    async execute(input: any, context: CodeLineToolContext): Promise<CodeLineToolResult> {
      const { path } = input;
      
      if (!path) {
        return {
          success: false,
          output: null,
          error: 'File path is required'
        };
      }
      
      try {
        // This would use CodeLine's actual file reading logic
        // For now, simulate with VS Code API
        if (context.vscode) {
          return new Promise((resolve) => {
            context.vscode.postMessage({
              command: 'readFile',
              path
            });
            
            // Listen for response
            const listener = (event: MessageEvent) => {
              const data = event.data;
              if (data.command === 'fileRead' && data.path === path) {
                window.removeEventListener('message', listener);
                resolve({
                  success: true,
                  output: {
                    path,
                    content: data.content,
                    size: data.content?.length || 0
                  }
                });
              }
            };
            
            window.addEventListener('message', listener);
          });
        }
        
        // Fallback simulation
        return {
          success: true,
          output: {
            path,
            content: `Content of ${path} (simulated)`,
            size: 100
          }
        };
        
      } catch (error) {
        return {
          success: false,
          output: null,
          error: `Failed to read file: ${error}`
        };
      }
    }
  };
}

/**
 * Create a file write tool based on CodeLine's file operations
 */
export function createFileWriteTool(): CodeLineTool {
  return {
    id: 'writeFile',
    name: 'Write File',
    description: 'Write content to a file',
    category: 'file',
    icon: '✏️',
    requiresApproval: true,
    
    async execute(input: any, context: CodeLineToolContext): Promise<CodeLineToolResult> {
      const { path, content } = input;
      
      if (!path || content === undefined) {
        return {
          success: false,
          output: null,
          error: 'File path and content are required'
        };
      }
      
      try {
        // Report progress
        if (context.onProgress) {
          context.onProgress({
            percentage: 0,
            message: 'Starting file write...',
            indeterminate: true
          });
        }
        
        // This would use CodeLine's actual file writing logic
        // For now, simulate with VS Code API
        if (context.vscode) {
          return new Promise((resolve) => {
            context.vscode.postMessage({
              command: 'writeFile',
              path,
              content
            });
            
            // Listen for response
            const listener = (event: MessageEvent) => {
              const data = event.data;
              if (data.command === 'fileWritten' && data.path === path) {
                window.removeEventListener('message', listener);
                
                if (context.onProgress) {
                  context.onProgress({
                    percentage: 100,
                    message: 'File write completed',
                    eta: 0
                  });
                }
                
                resolve({
                  success: true,
                  output: {
                    path,
                    size: content.length,
                    success: true
                  }
                });
              }
            };
            
            window.addEventListener('message', listener);
          });
        }
        
        // Fallback simulation
        if (context.onProgress) {
          context.onProgress({
            percentage: 100,
            message: 'File write completed (simulated)',
            eta: 0
          });
        }
        
        return {
          success: true,
          output: {
            path,
            size: content.length,
            success: true
          }
        };
        
      } catch (error) {
        return {
          success: false,
          output: null,
          error: `Failed to write file: ${error}`
        };
      }
    }
  };
}

/**
 * Create a terminal command execution tool
 */
export function createTerminalTool(): CodeLineTool {
  return {
    id: 'executeCommand',
    name: 'Execute Command',
    description: 'Execute a terminal command',
    category: 'terminal',
    icon: '💻',
    requiresApproval: true,
    
    async execute(input: any, context: CodeLineToolContext): Promise<CodeLineToolResult> {
      const { command, workingDirectory } = input;
      
      if (!command) {
        return {
          success: false,
          output: null,
          error: 'Command is required'
        };
      }
      
      try {
        // Report progress
        if (context.onProgress) {
          context.onProgress({
            percentage: 0,
            message: 'Starting command execution...',
            indeterminate: true
          });
        }
        
        // This would use CodeLine's actual command execution logic
        if (context.vscode) {
          return new Promise((resolve) => {
            context.vscode.postMessage({
              command: 'executeCommand',
              cmd: command,
              cwd: workingDirectory || context.workspaceRoot
            });
            
            // Listen for response
            const listener = (event: MessageEvent) => {
              const data = event.data;
              if (data.command === 'commandResult' && data.cmd === command) {
                window.removeEventListener('message', listener);
                
                if (context.onProgress) {
                  context.onProgress({
                    percentage: 100,
                    message: 'Command execution completed',
                    eta: 0
                  });
                }
                
                resolve({
                  success: data.success || false,
                  output: {
                    stdout: data.stdout || '',
                    stderr: data.stderr || '',
                    exitCode: data.exitCode || 0,
                    command
                  },
                  error: data.error
                });
              }
            };
            
            window.addEventListener('message', listener);
          });
        }
        
        // Fallback simulation
        if (context.onProgress) {
          context.onProgress({
            percentage: 50,
            message: 'Executing command...',
            eta: 2
          });
          
          setTimeout(() => {
            if (context.onProgress) {
              context.onProgress({
                percentage: 100,
                message: 'Command execution completed (simulated)',
                eta: 0
              });
            }
          }, 1000);
        }
        
        // Simulate async execution
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
          success: true,
          output: {
            stdout: `Output from: ${command}`,
            stderr: '',
            exitCode: 0,
            command
          }
        };
        
      } catch (error) {
        return {
          success: false,
          output: null,
          error: `Command execution failed: ${error}`
        };
      }
    }
  };
}

/**
 * Create a project analysis tool (CodeLine's specialty)
 */
export function createProjectAnalysisTool(): CodeLineTool {
  return {
    id: 'analyzeProject',
    name: 'Analyze Project',
    description: 'Analyze project structure and dependencies',
    category: 'analysis',
    icon: '🔍',
    
    async execute(input: any, context: CodeLineToolContext): Promise<CodeLineToolResult> {
      try {
        // Report progress
        if (context.onProgress) {
          context.onProgress({
            percentage: 0,
            message: 'Starting project analysis...',
            indeterminate: true
          });
        }
        
        // This would use CodeLine's EnhancedProjectAnalyzer
        if (context.vscode) {
          return new Promise((resolve) => {
            context.vscode.postMessage({
              command: 'analyzeProject'
            });
            
            // Listen for response
            const listener = (event: MessageEvent) => {
              const data = event.data;
              if (data.command === 'projectAnalysis') {
                window.removeEventListener('message', listener);
                
                if (context.onProgress) {
                  context.onProgress({
                    percentage: 100,
                    message: 'Project analysis completed',
                    eta: 0
                  });
                }
                
                resolve({
                  success: true,
                  output: data.analysis || {}
                });
              }
            };
            
            window.addEventListener('message', listener);
          });
        }
        
        // Fallback simulation
        if (context.onProgress) {
          for (let i = 0; i <= 100; i += 20) {
            setTimeout(() => {
              if (context.onProgress) {
                context.onProgress({
                  percentage: i,
                  message: `Analyzing project... (${i}%)`,
                  eta: (100 - i) / 20
                });
              }
            }, i * 50);
          }
        }
        
        // Simulate analysis
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        return {
          success: true,
          output: {
            projectType: 'TypeScript',
            files: 42,
            dependencies: 15,
            structure: {
              src: ['core/', 'ui/', 'utils/'],
              tests: ['unit/', 'integration/'],
              config: ['package.json', 'tsconfig.json']
            },
            issues: [],
            suggestions: ['Consider adding more tests', 'Update dependencies']
          }
        };
        
      } catch (error) {
        return {
          success: false,
          output: null,
          error: `Project analysis failed: ${error}`
        };
      }
    }
  };
}

// ============================================================================
// Tool Factory
// ============================================================================

/**
 * Create default set of CodeLine tools adapted for Claude Code
 */
export function createDefaultCodeLineTools(getContext?: () => CodeLineToolContext): ToolDefinition[] {
  const codeLineTools = [
    createFileReadTool(),
    createFileWriteTool(),
    createTerminalTool(),
    createProjectAnalysisTool()
  ];
  
  return codeLineTools.map(tool => adaptCodeLineToolToClaude(tool, getContext));
}

/**
 * Get tool by ID
 */
export function getToolById(toolId: string, getContext?: () => CodeLineToolContext): ToolDefinition | undefined {
  const tools: Record<string, () => CodeLineTool> = {
    'readFile': createFileReadTool,
    'writeFile': createFileWriteTool,
    'executeCommand': createTerminalTool,
    'analyzeProject': createProjectAnalysisTool
  };
  
  const creator = tools[toolId];
  if (creator) {
    return adaptCodeLineToolToClaude(creator(), getContext);
  }
  
  return undefined;
}