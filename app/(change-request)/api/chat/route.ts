import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText } from "ai";
import { claudeCode } from "ai-sdk-provider-claude-code";
import path from "path";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();
  const result = streamText({
    model: claudeCode("sonnet", {
      cwd: path.join(process.env.WORKDIR!, "starter-kit-astro-apollo"),
      permissionMode: "acceptEdits",
    }),
    system,
    messages: await convertToModelMessages(messages),
    tools: frontendTools(tools),
  });
  return result.toUIMessageStreamResponse();
}
