import { loadConfig } from "@/lib/config";

export async function GET() {
  const config = await loadConfig();
  return Response.json(config.docsEndpoints);
}
