import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { loadConfig } from "@/lib/config";
const llmsTxt = fs.readFileSync(
  path.join(process.cwd(), "app/llms.txt", "llms.txt.hbs"),
  "utf8"
);

export async function GET() {
  const config = await loadConfig();
  const template = Handlebars.compile(llmsTxt);
  const rendered = template(config);

  return new Response(rendered);
}
