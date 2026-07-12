import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  convertToModelMessages,
  type LanguageModelMiddleware,
  streamText,
  wrapLanguageModel,
} from "ai";
import { claudeCode, createAiSdkMcpServer } from "ai-sdk-provider-claude-code";
import path from "path";
import { auth } from "@/app/(auth)/auth";
import { NCS_TOOLS_MCP_SERVER_NAME } from "@/lib/ai/tools/tool-names";
import { openPreviewPanel, reloadPreviewPanel } from "@/lib/ai/tools/tools";
import { getArtifactById, getChangeRequestById } from "@/lib/db/queries";

export const maxDuration = 30;

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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, system, tools, id } = await req.json();

  const changeRequest = id ? await getChangeRequestById(id) : null;
  if (!changeRequest || changeRequest.userId !== session.user.id) {
    return new Response("Change-request not found", { status: 404 });
  }
  const artifact = await getArtifactById(changeRequest.artifactId);
  if (!artifact) {
    return new Response("Artifact not found", { status: 404 });
  }

  const ncsTools: Record<string, any> = {
    // @ts-ignore
    ...frontendTools(tools),
    openPreviewPanel: openPreviewPanel(),
    reloadPreviewPanel: reloadPreviewPanel(),
  };
  const ncsToolsMcpServer = createAiSdkMcpServer(
    NCS_TOOLS_MCP_SERVER_NAME,
    ncsTools
  );

  const modelMessages = await convertToModelMessages(messages);
  const result = streamText({
    model: wrapLanguageModel({
      model: claudeCode("sonnet", {
        cwd: path.join(process.env.WORKDIR!, artifact.technicalName),
        permissionMode: "bypassPermissions",
        streamingInput: "always",
        systemPrompt: `You are an assistant for generating digital artifacts.
        The Core-Unit is a common part of the whole system. It can be e.g. a CMS-system when designing websites.
        The technical information about the Core-Unit can be found in the "core-unit-docs" MCP-server. Read this CAREFULLY before making architectural decisions. 
        There is also a CMS (use the CMS MCP-server for accessing it).`,
        mcpServers: {
          cms: {
            type: "http",
            url: "http://127.0.0.1:80/cms/mcp",
            headers: {
              Authorization: `Bearer ${process.env.CMS_MCP_TOKEN}`,
            },
          },
          "core-unit-docs": {
            type: "sse",
            url: "http://127.0.0.1:8082/sse",
          },
          [NCS_TOOLS_MCP_SERVER_NAME]: ncsToolsMcpServer,
        },
      }),
      middleware: inlineFileDataMiddleware,
    }),
    system,
    messages: modelMessages,
  });
  return result.toUIMessageStreamResponse();
}
