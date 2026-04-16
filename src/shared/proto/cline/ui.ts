// Temporary implementation for Cline UI proto types

import { StringRequest, BooleanRequest, EmptyRequest, KeyValuePair } from './common';

// Enum for ClineMessage type
export enum ClineMessageType {
  ASK = 0,
  SAY = 1,
}

// Enum for ClineAsk types
export enum ClineAsk {
  UNRECOGNIZED = -1,
  FOLLOWUP = 0,
  PLAN_MODE_RESPOND = 1,
  COMMAND = 2,
  COMMAND_OUTPUT = 3,
  COMPLETION_RESULT = 4,
  TOOL = 5,
  API_REQ_FAILED = 6,
  RESUME_TASK = 7,
  RESUME_COMPLETED_TASK = 8,
  MISTAKE_LIMIT_REACHED = 9,
  BROWSER_ACTION_LAUNCH = 10,
  USE_MCP_SERVER = 11,
  NEW_TASK = 12,
  CONDENSE = 13,
  REPORT_BUG = 14,
  SUMMARIZE_TASK = 15,
  ACT_MODE_RESPOND = 16,
  USE_SUBAGENTS = 17,
}

// Enum for ClineSay types
export enum ClineSay {
  UNRECOGNIZED = -1,
  TASK = 0,
  ERROR = 1,
  API_REQ_STARTED = 2,
  API_REQ_FINISHED = 3,
  TEXT = 4,
  REASONING = 5,
  COMPLETION_RESULT_SAY = 6,
  USER_FEEDBACK = 7,
  USER_FEEDBACK_DIFF = 8,
  API_REQ_RETRIED = 9,
  COMMAND_SAY = 10,
  COMMAND_OUTPUT_SAY = 11,
  TOOL_SAY = 12,
  SHELL_INTEGRATION_WARNING = 13,
  BROWSER_ACTION_LAUNCH_SAY = 14,
  BROWSER_ACTION = 15,
  BROWSER_ACTION_RESULT = 16,
  MCP_SERVER_REQUEST_STARTED = 17,
  MCP_SERVER_RESPONSE = 18,
  MCP_NOTIFICATION = 19,
  USE_MCP_SERVER_SAY = 20,
  DIFF_ERROR = 21,
  DELETED_API_REQS = 22,
  CLINEIGNORE_ERROR = 23,
  CHECKPOINT_CREATED = 24,
  LOAD_MCP_DOCUMENTATION = 25,
  INFO = 26,
  TASK_PROGRESS = 27,
  ERROR_RETRY = 28,
  GENERATE_EXPLANATION = 29,
  HOOK_STATUS = 30,
  HOOK_OUTPUT_STREAM = 31,
  COMMAND_PERMISSION_DENIED = 32,
  CONDITIONAL_RULES_APPLIED = 33,
  SUBAGENT_STATUS = 34,
  USE_SUBAGENTS_SAY = 35,
  SUBAGENT_USAGE = 36,
}

// Enum for ClineSayTool tool types
export enum ClineSayToolType {
  EDITED_EXISTING_FILE = 0,
  NEW_FILE_CREATED = 1,
  READ_FILE = 2,
  LIST_FILES_TOP_LEVEL = 3,
  LIST_FILES_RECURSIVE = 4,
  LIST_CODE_DEFINITION_NAMES = 5,
  SEARCH_FILES = 6,
  WEB_FETCH = 7,
  FILE_DELETED = 8,
}

// Enum for browser actions
export enum BrowserAction {
  LAUNCH = 0,
  CLICK = 1,
  TYPE = 2,
  SCROLL_DOWN = 3,
  SCROLL_UP = 4,
  CLOSE = 5,
}

// Enum for MCP server request types
export enum McpServerRequestType {
  USE_MCP_TOOL = 0,
  ACCESS_MCP_RESOURCE = 1,
}

// Enum for API request cancel reasons
export enum ClineApiReqCancelReason {
  STREAMING_FAILED = 0,
  USER_CANCELLED = 1,
  RETRIES_EXHAUSTED = 2,
}

// Message for conversation history deleted range
export interface ConversationHistoryDeletedRange {
  start_index: number;
  end_index: number;
}

// Message for ClineSayTool
export interface ClineSayTool {
  tool: ClineSayToolType;
  path?: string;
  diff?: string;
  content?: string;
  regex?: string;
  file_pattern?: string;
  operation_is_located_in_workspace?: boolean;
}

// Message for ClineSayBrowserAction
export interface ClineSayBrowserAction {
  action: BrowserAction;
  coordinate?: string;
  text?: string;
}

// Message for BrowserActionResult
export interface BrowserActionResult {
  screenshot?: string;
  logs?: string;
  current_url?: string;
  current_mouse_position?: string;
}

// Main ClineMessage type
export interface ClineMessage {
  ts: number;
  type: ClineMessageType;
  ask?: ClineAsk;
  say?: ClineSay;
  text?: string;
  reasoning?: string;
  images?: string[];
  files?: string[];
  partial?: boolean;
  last_checkpoint_hash?: string;
  is_checkpoint_checked_out?: boolean;
  is_operation_outside_workspace?: boolean;
  conversation_history_index?: number;
  conversation_history_deleted_range?: ConversationHistoryDeletedRange;
  say_tool?: ClineSayTool;
  say_browser_action?: ClineSayBrowserAction;
  browser_action_result?: BrowserActionResult;
  [key: string]: any; // For other optional fields
}

export interface ShowWebviewEvent {
  preserve_editor_focus: boolean;
}

// Placeholder interfaces for other message types
export interface ClineAskUseMcpServer {
  [key: string]: any;
}

export interface ClinePlanModeResponse {
  [key: string]: any;
}

export interface ClineAskQuestion {
  [key: string]: any;
}

export interface ClineAskNewTask {
  [key: string]: any;
}

export interface ClineApiReqInfo {
  [key: string]: any;
}

export interface ClineModelInfo {
  [key: string]: any;
}

// Export types needed by UiService
export type UiService = {
  scrollToSettings: (request: StringRequest) => Promise<KeyValuePair>;
  setTerminalExecutionMode: (request: BooleanRequest) => Promise<KeyValuePair>;
  onDidShowAnnouncement: (request: EmptyRequest) => Promise<boolean>;
  subscribeToAddToInput: (request: EmptyRequest) => AsyncGenerator<string>;
  subscribeToMcpButtonClicked: (request: EmptyRequest) => AsyncGenerator<void>;
  subscribeToHistoryButtonClicked: (request: EmptyRequest) => AsyncGenerator<void>;
  subscribeToChatButtonClicked: (request: EmptyRequest) => AsyncGenerator<void>;
  subscribeToAccountButtonClicked: (request: EmptyRequest) => AsyncGenerator<void>;
  subscribeToSettingsButtonClicked: (request: EmptyRequest) => AsyncGenerator<void>;
  subscribeToWorktreesButtonClicked: (request: EmptyRequest) => AsyncGenerator<void>;
  subscribeToPartialMessage: (request: EmptyRequest) => AsyncGenerator<ClineMessage>;
  initializeWebview: (request: EmptyRequest) => Promise<void>;
  subscribeToRelinquishControl: (request: EmptyRequest) => AsyncGenerator<void>;
  subscribeToShowWebview: (request: EmptyRequest) => AsyncGenerator<ShowWebviewEvent>;
  getWebviewHtml: (request: EmptyRequest) => Promise<string>;
  openUrl: (request: StringRequest) => Promise<void>;
  openWalkthrough: (request: EmptyRequest) => Promise<void>;
};