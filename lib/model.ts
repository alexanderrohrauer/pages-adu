import { LanguageModelMiddleware, wrapLanguageModel } from "ai";
import { claudeCode, createAiSdkMcpServer } from "ai-sdk-provider-claude-code";
import path from "path";
import { ADU_TOOLS_MCP_SERVER_NAME } from "@/lib/mcp";
import { Artifact, ChangeRequest } from "@/lib/db/schema";
import {
  askForClarification,
  openPreviewPanel,
  reloadPreviewPanel,
  setChangeRequestLinks,
  setChangeRequestPath,
  setChangeRequestTitle,
} from "@/lib/tools";
import { loadConfig } from "@/lib/config";

export const mcpServers = (config: any, aduTools?: Record<string, any>) => {
  const aduToolsMcpServer =
    aduTools && createAiSdkMcpServer(ADU_TOOLS_MCP_SERVER_NAME, aduTools);

  const servers = {
    "docs-unit": {
      type: "sse",
      url: `${process.env.DOCS_UNIT_URL!}/sse`,
    },
    ...config.mcpServers,
  };

  if (aduToolsMcpServer) servers[ADU_TOOLS_MCP_SERVER_NAME] = aduToolsMcpServer;
  return servers;
};

// No matter what shape a file part's data has when it's handed to
// streamText, the `ai` package's own doStream/doGenerate prep (inside
// streamText itself, not something route code can skip) re-tags it into
// `{ type: 'data', data } | { type: 'url', url }` right before calling the
// model. The installed ai-sdk-provider-claude-code (built against the older,
// untagged `DataContent | URL` FilePart spec) only recognizes a bare base64
// string/Uint8Array and silently drops anything else — so this middleware
// flattens the tagged shape back to a bare value at the last possible point,
// transformParams, immediately before the wrapped model's doStream runs.
const inlineFileDataMiddleware: LanguageModelMiddleware = {
  transformParams: async ({ params }) => {
    for (const message of params.prompt) {
      if (!Array.isArray(message.content)) continue;
      for (const part of message.content) {
        if (part.type !== "file") continue;
        const data = part.data as unknown;
        if (typeof data !== "object" || data === null || !("type" in data)) {
          continue;
        }
        if (data.type === "data") {
          part.data = (data as unknown as { data: unknown }).data as never;
        } else if (data.type === "url") {
          const url = (data as unknown as { url: URL }).url;
          if (url.protocol === "data:") {
            const match = /^data:[^;,]+;base64,(.+)$/is.exec(url.href);
            if (match) part.data = match[1] as never;
          }
        }
      }
    }
    return params;
  },
};

export async function loadModel(
  systemPrompt: string,
  artifact: Artifact,
  changeRequest: ChangeRequest,
  additionalTools?: any
) {
  const config = await loadConfig();

  const changeRequestId = changeRequest?.id ?? "debug-change-request-id";

  const aduTools: Record<string, any> = {
    ...additionalTools,
    openPreviewPanel: openPreviewPanel(),
    reloadPreviewPanel: reloadPreviewPanel(),
    askForClarification: askForClarification(),
    setChangeRequestPath: setChangeRequestPath(changeRequestId),
    setChangeRequestLinks: setChangeRequestLinks(changeRequestId),
    setChangeRequestTitle: setChangeRequestTitle(changeRequestId),
  };

  const cwd = path.join(process.env.WORKDIR!, artifact.technicalName);

  return wrapLanguageModel({
    model: claudeCode(process.env.CLAUDE_MODEL ?? "sonnet", {
      cwd,
      permissionMode: "bypassPermissions",
      streamingInput: "always",
      systemPrompt,
      settingSources: ["user", "project"],
      skills: "all",
      // @ts-ignore
      mcpServers: mcpServers(config, aduTools),
      pathToClaudeCodeExecutable: process.env.PATH_TO_CLAUDE_CODE_EXE,
    }),
    middleware: inlineFileDataMiddleware,
  });
}
