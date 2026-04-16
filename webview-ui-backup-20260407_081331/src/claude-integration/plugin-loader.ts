/**
 * Plugin Loader for Claude Code plugins
 * 
 * Simplified implementation based on Claude Code's plugin architecture.
 * Supports loading plugins from .claude-code/plugins directory.
 */

import { ToolDefinition } from './query-engine';

// ============================================================================
// Plugin Types
// ============================================================================

export interface ClaudeCodePlugin {
  /** Plugin identifier */
  id: string;
  
  /** Plugin name */
  name: string;
  
  /** Plugin description */
  description: string;
  
  /** Plugin version */
  version: string;
  
  /** Plugin author */
  author?: string;
  
  /** Minimum Claude Code version required */
  minVersion?: string;
  
  /** Plugin dependencies */
  dependencies?: string[];
  
  /** Tools provided by this plugin */
  tools?: ToolDefinition[];
  
  /** Initialize plugin */
  initialize?(context: PluginContext): Promise<void>;
  
  /** Cleanup plugin resources */
  cleanup?(): Promise<void>;
  
  /** Plugin metadata */
  metadata?: Record<string, any>;
}

export interface PluginContext {
  /** Workspace root path */
  workspaceRoot: string;
  
  /** VS Code API (if available) */
  vscode?: any;
  
  /** Plugin configuration */
  config: PluginConfig;
  
  /** Logger */
  logger: PluginLogger;
  
  /** Register a tool */
  registerTool(tool: ToolDefinition): void;
  
  /** Unregister a tool */
  unregisterTool(toolName: string): void;
  
  /** Get plugin storage */
  getStorage(): PluginStorage;
}

export interface PluginConfig {
  /** Plugin-specific configuration */
  [key: string]: any;
}

export interface PluginLogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

export interface PluginStorage {
  get<T>(key: string, defaultValue?: T): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// ============================================================================
// Plugin Manager
// ============================================================================

export class PluginManager {
  private plugins: Map<string, ClaudeCodePlugin> = new Map();
  private loadedPlugins: Map<string, boolean> = new Map();
  private registeredTools: Map<string, ToolDefinition> = new Map();
  private pluginContexts: Map<string, PluginContext> = new Map();
  
  constructor(
    private workspaceRoot: string,
    private vscodeApi?: any
  ) {}
  
  /**
   * Discover plugins in .claude-code/plugins directory
   */
  async discoverPlugins(): Promise<string[]> {
    const pluginDir = `${this.workspaceRoot}/.claude-code/plugins`;
    const discoveredPlugins: string[] = [];
    
    try {
      // This would actually read the filesystem
      // For now, simulate discovery
      
      // Check if plugin directory exists
      const pluginsExist = await this.checkDirectoryExists(pluginDir);
      if (!pluginsExist) {
        console.log(`Plugin directory not found: ${pluginDir}`);
        return discoveredPlugins;
      }
      
      // Simulate finding some plugins
      const simulatedPlugins = [
        'file-utils',
        'code-analysis',
        'git-tools'
      ];
      
      for (const pluginName of simulatedPlugins) {
        const pluginPath = `${pluginDir}/${pluginName}/plugin.json`;
        const exists = await this.checkFileExists(pluginPath);
        
        if (exists) {
          discoveredPlugins.push(pluginPath);
        }
      }
      
      console.log(`Discovered ${discoveredPlugins.length} plugins`);
      return discoveredPlugins;
      
    } catch (error) {
      console.error('Failed to discover plugins:', error);
      return [];
    }
  }
  
  /**
   * Load a plugin from path
   */
  async loadPlugin(pluginPath: string): Promise<ClaudeCodePlugin | null> {
    try {
      // Check if already loaded
      const pluginId = this.extractPluginId(pluginPath);
      if (this.loadedPlugins.has(pluginId)) {
        console.log(`Plugin ${pluginId} already loaded`);
        return this.plugins.get(pluginId) || null;
      }
      
      // Load plugin manifest
      const manifest = await this.loadPluginManifest(pluginPath);
      if (!manifest) {
        console.error(`Failed to load manifest from ${pluginPath}`);
        return null;
      }
      
      // Create plugin context
      const context: PluginContext = {
        workspaceRoot: this.workspaceRoot,
        vscode: this.vscodeApi,
        config: manifest.config || {},
        logger: this.createLogger(manifest.id),
        registerTool: (tool: ToolDefinition) => {
          this.registerTool(tool, manifest.id);
        },
        unregisterTool: (toolName: string) => {
          this.unregisterTool(toolName, manifest.id);
        },
        getStorage: () => this.createStorage(manifest.id)
      };
      
      this.pluginContexts.set(manifest.id, context);
      
      // Initialize plugin if it has initialize method
      if (manifest.initialize) {
        await manifest.initialize(context);
      }
      
      // Register plugin tools
      if (manifest.tools && Array.isArray(manifest.tools)) {
        for (const tool of manifest.tools) {
          this.registerTool(tool, manifest.id);
        }
      }
      
      // Mark as loaded
      this.plugins.set(manifest.id, manifest);
      this.loadedPlugins.set(manifest.id, true);
      
      console.log(`Successfully loaded plugin: ${manifest.name} (${manifest.version})`);
      return manifest;
      
    } catch (error) {
      console.error(`Failed to load plugin ${pluginPath}:`, error);
      return null;
    }
  }
  
  /**
   * Load all discovered plugins
   */
  async loadAllPlugins(): Promise<ClaudeCodePlugin[]> {
    const pluginPaths = await this.discoverPlugins();
    const loadedPlugins: ClaudeCodePlugin[] = [];
    
    for (const pluginPath of pluginPaths) {
      const plugin = await this.loadPlugin(pluginPath);
      if (plugin) {
        loadedPlugins.push(plugin);
      }
    }
    
    console.log(`Loaded ${loadedPlugins.length} plugins total`);
    return loadedPlugins;
  }
  
  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        console.warn(`Plugin ${pluginId} not found`);
        return false;
      }
      
      // Call cleanup if available
      if (plugin.cleanup) {
        await plugin.cleanup();
      }
      
      // Unregister all tools from this plugin
      for (const [toolName, tool] of this.registeredTools.entries()) {
        if (tool.metadata?.pluginId === pluginId) {
          this.registeredTools.delete(toolName);
        }
      }
      
      // Remove plugin
      this.plugins.delete(pluginId);
      this.loadedPlugins.delete(pluginId);
      this.pluginContexts.delete(pluginId);
      
      console.log(`Unloaded plugin: ${pluginId}`);
      return true;
      
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }
  
  /**
   * Get all registered tools from plugins
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.registeredTools.values());
  }
  
  /**
   * Get tool by name
   */
  getTool(toolName: string): ToolDefinition | undefined {
    return this.registeredTools.get(toolName);
  }
  
  /**
   * Get loaded plugins
   */
  getLoadedPlugins(): ClaudeCodePlugin[] {
    return Array.from(this.plugins.values());
  }
  
  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(pluginId: string): boolean {
    return this.loadedPlugins.has(pluginId) && this.loadedPlugins.get(pluginId) === true;
  }
  
  // ==========================================================================
  // Internal Methods
  // ==========================================================================
  
  private extractPluginId(pluginPath: string): string {
    // Extract plugin ID from path
    const parts = pluginPath.split('/');
    const pluginDir = parts[parts.length - 2]; // Get directory name
    return pluginDir || pluginPath;
  }
  
  private async loadPluginManifest(pluginPath: string): Promise<ClaudeCodePlugin | null> {
    // This would actually load the plugin.json file
    // For now, simulate loading based on plugin name
    
    const pluginId = this.extractPluginId(pluginPath);
    
    // Simulated plugin manifests
    const simulatedPlugins: Record<string, ClaudeCodePlugin> = {
      'file-utils': {
        id: 'file-utils',
        name: 'File Utilities',
        description: 'Additional file operations and utilities',
        version: '1.0.0',
        author: 'CodeLine Team',
        tools: [
          {
            name: 'searchFiles',
            description: 'Search for files by pattern',
            inputSchema: { type: 'object', properties: { pattern: { type: 'string' } } },
            outputSchema: { type: 'object', properties: { files: { type: 'array' } } },
            execute: async (input) => ({
              success: true,
              output: { files: ['file1.ts', 'file2.js'] }
            })
          },
          {
            name: 'fileStats',
            description: 'Get file statistics',
            inputSchema: { type: 'object', properties: { path: { type: 'string' } } },
            outputSchema: { type: 'object', properties: { stats: { type: 'object' } } },
            execute: async (input) => ({
              success: true,
              output: { 
                stats: { 
                  path: input.path, 
                  size: 1024, 
                  modified: new Date().toISOString() 
                }
              }
            })
          }
        ]
      },
      'code-analysis': {
        id: 'code-analysis',
        name: 'Code Analysis',
        description: 'Static code analysis tools',
        version: '1.0.0',
        author: 'CodeLine Team',
        tools: [
          {
            name: 'lintCode',
            description: 'Lint code files',
            inputSchema: { type: 'object', properties: { path: { type: 'string' } } },
            outputSchema: { type: 'object', properties: { issues: { type: 'array' } } },
            execute: async (input) => ({
              success: true,
              output: { 
                issues: [
                  { line: 10, column: 5, message: 'Unused variable', severity: 'warning' },
                  { line: 15, column: 12, message: 'Missing type annotation', severity: 'info' }
                ]
              }
            })
          },
          {
            name: 'complexityAnalysis',
            description: 'Analyze code complexity',
            inputSchema: { type: 'object', properties: { path: { type: 'string' } } },
            outputSchema: { type: 'object', properties: { metrics: { type: 'object' } } },
            execute: async (input) => ({
              success: true,
              output: { 
                metrics: { 
                  cyclomaticComplexity: 8,
                  cognitiveComplexity: 12,
                  linesOfCode: 45
                }
              }
            })
          }
        ]
      },
      'git-tools': {
        id: 'git-tools',
        name: 'Git Tools',
        description: 'Git repository operations',
        version: '1.0.0',
        author: 'CodeLine Team',
        dependencies: ['git'],
        tools: [
          {
            name: 'gitStatus',
            description: 'Check git repository status',
            inputSchema: { type: 'object', properties: { path: { type: 'string' } } },
            outputSchema: { type: 'object', properties: { status: { type: 'object' } } },
            execute: async (input) => ({
              success: true,
              output: { 
                status: {
                  branch: 'main',
                  ahead: 0,
                  behind: 0,
                  changes: { staged: 2, unstaged: 1 }
                }
              }
            })
          },
          {
            name: 'gitDiff',
            description: 'Show git diff',
            inputSchema: { type: 'object', properties: { path: { type: 'string' } } },
            outputSchema: { type: 'object', properties: { diff: { type: 'string' } } },
            execute: async (input) => ({
              success: true,
              output: { 
                diff: 'diff --git a/file.txt b/file.txt\nindex 1234567..89abcde 100644\n--- a/file.txt\n+++ b/file.txt\n@@ -1,3 +1,4 @@\n Hello World\n+New line added\n Another line\n'
              }
            })
          }
        ]
      }
    };
    
    return simulatedPlugins[pluginId] || null;
  }
  
  private registerTool(tool: ToolDefinition, pluginId: string): void {
    // Add plugin metadata to tool
    const enhancedTool = {
      ...tool,
      metadata: {
        ...tool.metadata,
        pluginId,
        registeredAt: new Date().toISOString()
      }
    };
    
    this.registeredTools.set(tool.name, enhancedTool);
    console.log(`Registered tool: ${tool.name} from plugin: ${pluginId}`);
  }
  
  private unregisterTool(toolName: string, pluginId: string): void {
    const tool = this.registeredTools.get(toolName);
    if (tool?.metadata?.pluginId === pluginId) {
      this.registeredTools.delete(toolName);
      console.log(`Unregistered tool: ${toolName} from plugin: ${pluginId}`);
    }
  }
  
  private createLogger(pluginId: string): PluginLogger {
    return {
      info: (message, ...args) => console.log(`[${pluginId}] INFO: ${message}`, ...args),
      warn: (message, ...args) => console.warn(`[${pluginId}] WARN: ${message}`, ...args),
      error: (message, ...args) => console.error(`[${pluginId}] ERROR: ${message}`, ...args),
      debug: (message, ...args) => console.debug(`[${pluginId}] DEBUG: ${message}`, ...args)
    };
  }
  
  private createStorage(pluginId: string): PluginStorage {
    const storageKey = `plugin_storage_${pluginId}`;
    
    return {
      get: async <T>(key: string, defaultValue?: T): Promise<T | undefined> => {
        try {
          const storage = JSON.parse(localStorage.getItem(storageKey) || '{}');
          return storage[key] !== undefined ? storage[key] : defaultValue;
        } catch (error) {
          console.error(`Failed to get storage key ${key} for plugin ${pluginId}:`, error);
          return defaultValue;
        }
      },
      
      set: async <T>(key: string, value: T): Promise<void> => {
        try {
          const storage = JSON.parse(localStorage.getItem(storageKey) || '{}');
          storage[key] = value;
          localStorage.setItem(storageKey, JSON.stringify(storage));
        } catch (error) {
          console.error(`Failed to set storage key ${key} for plugin ${pluginId}:`, error);
          throw error;
        }
      },
      
      delete: async (key: string): Promise<void> => {
        try {
          const storage = JSON.parse(localStorage.getItem(storageKey) || '{}');
          delete storage[key];
          localStorage.setItem(storageKey, JSON.stringify(storage));
        } catch (error) {
          console.error(`Failed to delete storage key ${key} for plugin ${pluginId}:`, error);
          throw error;
        }
      },
      
      clear: async (): Promise<void> => {
        try {
          localStorage.removeItem(storageKey);
        } catch (error) {
          console.error(`Failed to clear storage for plugin ${pluginId}:`, error);
          throw error;
        }
      }
    };
  }
  
  private async checkDirectoryExists(path: string): Promise<boolean> {
    // Simulated check
    return true;
  }
  
  private async checkFileExists(path: string): Promise<boolean> {
    // Simulated check
    return true;
  }
}

// ============================================================================
// Plugin Loader Factory
// ============================================================================

/**
 * Create and initialize plugin manager
 */
export async function createPluginManager(
  workspaceRoot: string,
  vscodeApi?: any
): Promise<PluginManager> {
  const manager = new PluginManager(workspaceRoot, vscodeApi);
  
  try {
    // Load plugins automatically
    await manager.loadAllPlugins();
    console.log('Plugin manager initialized successfully');
  } catch (error) {
    console.error('Failed to initialize plugin manager:', error);
  }
  
  return manager;
}