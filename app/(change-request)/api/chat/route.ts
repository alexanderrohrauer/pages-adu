import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  convertToModelMessages,
  streamText,
  wrapLanguageModel,
  type LanguageModelMiddleware,
} from "ai";
import { claudeCode } from "ai-sdk-provider-claude-code";
import path from "path";

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
  const { messages, system, tools } = await req.json();
  const modelMessages = await convertToModelMessages(messages);
  const result = streamText({
    model: wrapLanguageModel({
      model: claudeCode("sonnet", {
        cwd: path.join(process.env.WORKDIR!, "starter-kit-astro-apollo"),
        permissionMode: "acceptEdits",
        streamingInput: "always",
      }),
      middleware: inlineFileDataMiddleware,
    }),
    system,
    messages: modelMessages,
    tools: frontendTools(tools),
  });
  return result.toUIMessageStreamResponse();
}
