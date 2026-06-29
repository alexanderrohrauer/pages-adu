import { chatModels } from "@/lib/ai/models";

export async function GET() {
  const capabilities = Object.fromEntries(
    chatModels.map((m) => [m.id, m.capabilities])
  );

  return Response.json(capabilities, {
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
  });
}
