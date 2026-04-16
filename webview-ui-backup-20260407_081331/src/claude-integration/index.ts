/**
 * Claude Code Integration Module
 * 
 * Main entry point for Claude Code architecture integration into CodeLine.
 * Provides QueryEngine, tool adapters, and plugin system.
 */

export { 
  QueryEngineWrapper, 
  createQueryEngine, 
  type QueryEngineConfig,
  type ToolDefinition,
  type ToolExecutionContext,
  type ToolProgress,
  type QueryResult,
  type StreamingQueryResult
} from './query-engine';

export {
  adaptCodeLineToolToClaude,
  createDefaultCodeLineTools,
  getToolById,
  type CodeLineTool,
  type CodeLineToolContext,
  type CodeLineToolResult,
  type CodeLineProgress
} from './tool-adapter';

export {
  PluginManager,
  createPluginManager,
  type ClaudeCodePlugin,
  type PluginContext,
  type PluginConfig,
  type PluginLogger,
  type PluginStorage
} from './plugin-loader';

// Format adapters for converting between Claude Code and Cline UI
export {
  adaptClaudeFileEditToClineDiff,
  adaptClaudeProgressToClineUI,
  adaptClaudeResultToClineUI,
  adaptClaudeErrorToClineUI,
  adaptClaudeOutputToClineFormat,
  type ClaudeFileEditResult,
  type ClineDiffFormat,
  type ClaudeToolProgress,
  type ClineProgressIndicator,
  type ClaudeToolResult,
  type ClineToolResult,
  type ClaudeError,
  type ClineErrorDisplay
} from '../adapters/format-adapters';

// VS Code API adapters for replacing Cline's GRPC
export {
  VSCodeAdapterFactory,
  type FileServiceAdapter,
  type ToolServiceAdapter,
  type UiServiceAdapter,
  type StateServiceAdapter,
  type VSCodeFileServiceAdapter,
  type VSCodeToolServiceAdapter,
  type VSCodeUiServiceAdapter,
  type VSCodeStateServiceAdapter
} from '../adapters/cline-to-vscode';

/**
 * Initialize Claude Code integration
 * 
 * This function sets up the complete Claude Code architecture:
 * 1. Creates QueryEngine with default tools
 * 2. Loads plugins from .claude-code/plugins
 * 3. Sets up VS Code API adapters
 * 4. Returns the integration instance
 */
export async function initializeClaudeCodeIntegration(
  workspaceRoot: string,
  vscodeApi: any,
  config?: Partial<QueryEngineConfig>
): Promise<{
  queryEngine: QueryEngineWrapper;
  pluginManager: PluginManager;
  tools: ToolDefinition[];
}> {
  console.log('Initializing Claude Code integration...');
  
  // Initialize VS Code adapter factory
  const { VSCodeAdapterFactory } = await import('../adapters/cline-to-vscode');
  VSCodeAdapterFactory.initialize(vscodeApi);
  
  // Create plugin manager
  const pluginManager = await createPluginManager(workspaceRoot, vscodeApi);
  const pluginTools = pluginManager.getAllTools();
  
  // Create default CodeLine tools
  const { createDefaultCodeLineTools } = await import('./tool-adapter');
  const codeLineTools = createDefaultCodeLineTools(() => ({
    workspaceRoot,
    vscode: vscodeApi,
    state: {}
  }));
  
  // Combine all tools
  const allTools = [...codeLineTools, ...pluginTools];
  
  // Create QueryEngine configuration
  const engineConfig: QueryEngineConfig = {
    model: {
      provider: config?.model?.provider || 'openai',
      name: config?.model?.name || 'gpt-4',
      apiKey: config?.model?.apiKey,
      baseUrl: config?.model?.baseUrl
    },
    tools: allTools,
    context: {
      maxTokens: config?.context?.maxTokens || 8000,
      includeFileContents: config?.context?.includeFileContents ?? true,
      includeTerminalOutput: config?.context?.includeTerminalOutput ?? true
    },
    systemPrompt: config?.systemPrompt || `You are CodeLine, an AI programming assistant integrated with VS Code.
You have access to the user's workspace and can read/write files, execute commands, and analyze code.
You are running on the Claude Code architecture with plugin support.
Provide helpful, concise responses and use tools when appropriate.`,
    memory: {
      enabled: true,
      maxHistory: 10
    }
  };
  
  // Create QueryEngine
  const queryEngine = createQueryEngine(engineConfig);
  
  console.log(`Claude Code integration initialized with ${allTools.length} tools`);
  console.log(`Loaded ${pluginManager.getLoadedPlugins().length} plugins`);
  
  return {
    queryEngine,
    pluginManager,
    tools: allTools
  };
}

/**
 * Create a simplified integration for testing/development
 */
export function createSimpleIntegration(vscodeApi: any): QueryEngineWrapper {
  const { createQueryEngine } = require('./query-engine');
  const { createDefaultCodeLineTools } = require('./tool-adapter');
  
  const tools = createDefaultCodeLineTools(() => ({
    workspaceRoot: '/mock/workspace',
    vscode: vscodeApi,
    state: {}
  }));
  
  const config: QueryEngineConfig = {
    model: {
      provider: 'openai',
      name: 'gpt-4'
    },
    tools,
    systemPrompt: 'You are CodeLine, a helpful AI assistant.'
  };
  
  return createQueryEngine(config);
}