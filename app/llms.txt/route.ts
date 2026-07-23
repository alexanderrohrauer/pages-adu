import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { connection } from "next/server";
import { loadConfig } from "@/lib/config";
const llmsTxt = fs.readFileSync(
  path.join(process.cwd(), "app/llms.txt", "llms.txt.hbs"),
  "utf8"
);

export async function GET() {
  // config/config.js is injected at container runtime (see docker-compose.yml)
  // and can't be baked into a build-time static prerender.
  await connection();
  const config = await loadConfig();
  const template = Handlebars.compile(llmsTxt);
  const rendered = template(config);

  return new Response(rendered);
}
