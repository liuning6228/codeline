import { Tool as AnthropicTool } from "@anthropic-ai/sdk/resources/index";
import { FunctionDeclaration as GoogleTool } from "@google/genai";
import { ChatCompletionTool as OpenAITool } from "openai/resources/chat/completions";
export type ClineTool = OpenAITool | AnthropicTool | GoogleTool;
export declare enum ClineDefaultTool {
    ASK = "ask_followup_question",
    ATTEMPT = "attempt_completion",
    BASH = "execute_command",
    FILE_EDIT = "replace_in_file",
    FILE_READ = "read_file",
    FILE_NEW = "write_to_file",
    SEARCH = "search_files",
    LIST_FILES = "list_files",
    LIST_CODE_DEF = "list_code_definition_names",
    BROWSER = "browser_action",
    MCP_USE = "use_mcp_tool",
    MCP_ACCESS = "access_mcp_resource",
    MCP_DOCS = "load_mcp_documentation",
    NEW_TASK = "new_task",
    PLAN_MODE = "plan_mode_respond",
    ACT_MODE = "act_mode_respond",
    TODO = "focus_chain",
    WEB_FETCH = "web_fetch",
    WEB_SEARCH = "web_search",
    CONDENSE = "condense",
    SUMMARIZE_TASK = "summarize_task",
    REPORT_BUG = "report_bug",
    NEW_RULE = "new_rule",
    APPLY_PATCH = "apply_patch",
    GENERATE_EXPLANATION = "generate_explanation",
    USE_SKILL = "use_skill",
    USE_SUBAGENTS = "use_subagents"
}
export declare const toolUseNames: ClineDefaultTool[];
export declare function setDynamicToolUseNames(namespace: string, names: string[]): void;
export declare function getToolUseNames(): string[];
export declare const READ_ONLY_TOOLS: readonly [ClineDefaultTool.LIST_FILES, ClineDefaultTool.FILE_READ, ClineDefaultTool.SEARCH, ClineDefaultTool.LIST_CODE_DEF, ClineDefaultTool.BROWSER, ClineDefaultTool.ASK, ClineDefaultTool.WEB_SEARCH, ClineDefaultTool.WEB_FETCH, ClineDefaultTool.USE_SKILL, ClineDefaultTool.USE_SUBAGENTS];
//# sourceMappingURL=tools.d.ts.map