import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText } from "ai";
import { getArtifactById, getChangeRequestById } from "@/lib/db/queries";
import { loadSystemPrompt } from "@/lib/prompts";
import { loadModel } from "@/lib/model";

export async function POST(req: Request) {
  const { messages, system, tools, id } = await req.json();

  const changeRequest = id ? await getChangeRequestById(id) : null;
  if (!changeRequest) {
    return new Response("Change-request not found", { status: 404 });
  }
  const artifact = await getArtifactById(changeRequest.artifactId);
  if (!artifact) {
    return new Response("Artifact not found", { status: 404 });
  }

  const systemPrompt = await loadSystemPrompt(artifact, changeRequest);
  const modelMessages = await convertToModelMessages(messages);

  const model = await loadModel(
    systemPrompt,
    artifact,
    changeRequest,
    frontendTools(tools)
  );
  const result = streamText({
    model,
    system,
    messages: modelMessages,
  });
  return result.toUIMessageStreamResponse();
}
