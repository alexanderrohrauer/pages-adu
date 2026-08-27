import { constants, promises as fs } from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { loadConfig } from "@/lib/config";
import { mcpServers } from "@/lib/model";

// Plain, no-AI diagnostics page. Every check below is a direct call — a
// filesystem `access()`, an MCP handshake, or a shell command — so the
// result is deterministic and this file reads top to bottom.
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

type Check = { name: string; ok: boolean; detail: string };

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// 1. Filesystem permissions -------------------------------------------------
async function checkDir(name: string, dir: string): Promise<Check> {
  try {
    await fs.access(dir, constants.R_OK | constants.W_OK);
    return { name, ok: true, detail: `${dir} — read + write OK` };
  } catch (err) {
    return { name, ok: false, detail: `${dir} — ${(err as Error).message}` };
  }
}

async function filesystemChecks(): Promise<Check[]> {
  const skillsDir = path.join(os.homedir(), ".claude", "skills");
  const checks: Promise<Check>[] = [
    checkDir("Claude Code skills folder", skillsDir),
  ];

  if (process.env.WORKDIR) {
    checks.unshift(checkDir("WORKDIR", path.resolve(process.env.WORKDIR)));
  } else {
    checks.unshift(
      Promise.resolve({
        name: "WORKDIR",
        ok: false,
        detail: "WORKDIR environment variable is not set",
      })
    );
  }

  return Promise.all(checks);
}

// 2. MCP servers ----------------------------------------------------------
type McpServerConfig = {
  type?: string;
  url?: string;
  headers?: Record<string, string>;
};

async function checkMcpServer(
  name: string,
  config: McpServerConfig
): Promise<Check> {
  if (!config.url) {
    return {
      name,
      ok: false,
      detail: "in-process server — not reachable over the network from here",
    };
  }

  const requestInit = config.headers ? { headers: config.headers } : undefined;
  const transport =
    config.type === "sse"
      ? new SSEClientTransport(new URL(config.url), { requestInit })
      : new StreamableHTTPClientTransport(new URL(config.url), { requestInit });

  const client = new Client({ name: "debug-page", version: "1.0.0" });

  try {
    await withTimeout(client.connect(transport), 8000);
    const { tools } = await withTimeout(client.listTools(), 8000);
    const names = tools.map((tool) => tool.name);
    return {
      name,
      ok: true,
      detail: `${config.type ?? "http"} · ${tools.length} tool(s)${
        names.length ? `: ${names.join(", ")}` : ""
      }`,
    };
  } catch (err) {
    return { name, ok: false, detail: (err as Error).message };
  } finally {
    await client.close().catch(() => {});
  }
}

async function mcpChecks(): Promise<Check[]> {
  const config = await loadConfig();
  const servers: Record<string, McpServerConfig> = mcpServers(config);

  return Promise.all(
    Object.entries(servers).map(([name, cfg]) => checkMcpServer(name, cfg))
  );
}

// 3. Docker / shell -------------------------------------------------------
async function checkCommand(
  name: string,
  command: string,
  args: string[]
): Promise<Check> {
  try {
    const { stdout } = await execFileAsync(command, args, { timeout: 10_000 });
    return { name, ok: true, detail: stdout.trim() || "(no output)" };
  } catch (err) {
    return { name, ok: false, detail: (err as Error).message.trim() };
  }
}

async function shellChecks(): Promise<Check[]> {
  return Promise.all([
    checkCommand("docker", "docker", [
      "version",
      "--format",
      "{{.Server.Version}}",
    ]),
    checkCommand("docker compose", "docker", ["compose", "version"]),
    checkCommand("docker ps", "docker", [
      "ps",
      "--format",
      "{{.Names}} — {{.Status}}",
    ]),
  ]);
}

// Rendering -------------------------------------------------------------
function CheckList({ title, checks }: { title: string; checks: Check[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-base">{title}</h2>
      <table className="w-full border-collapse">
        <tbody>
          {checks.map((check) => (
            <tr key={check.name} className="border-t border-gray-400">
              <td className="p-2 align-top">{check.ok ? "✅" : "❌"}</td>
              <td className="p-2 align-top font-semibold whitespace-nowrap">
                {check.name}
              </td>
              <td className="p-6 align-top">
                <pre className="m-0 wrap-break-word whitespace-pre-wrap">
                  {check.detail}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default async function DebugPage() {
  const [filesystem, mcp, shell] = await Promise.all([
    filesystemChecks(),
    mcpChecks(),
    shellChecks(),
  ]);

  return (
    <main className="mx-0 my-auto max-w-240 p-8 font-[ui-monospace] text-[0.8125rem] leading-6">
      <h1 className="mb-6 text-[1.25rem]">System Debug Report</h1>
      <CheckList title="Filesystem permissions" checks={filesystem} />
      <CheckList title="MCP servers" checks={mcp} />
      <CheckList title="Docker / shell access" checks={shell} />
    </main>
  );
}
