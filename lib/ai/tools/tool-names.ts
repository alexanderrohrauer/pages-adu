// Shared between the server (mounting these tools as an in-process MCP
// server for the claude-code SDK) and the client (matching tool-call names
// in the streamed message parts via useAssistantToolUI). Not server-only —
// the client bundle imports this directly.
export const NCS_TOOLS_MCP_SERVER_NAME = "ncsTools";

// The claude-agent-sdk namespaces every SDK MCP server's tools as
// `mcp__<serverName>__<toolName>` in the tool-call parts it emits, so the
// frontend must match on the namespaced name, not the bare tool name.
export function claudeCodeToolName(toolName: string): string {
  return `mcp__${NCS_TOOLS_MCP_SERVER_NAME}__${toolName}`;
}
