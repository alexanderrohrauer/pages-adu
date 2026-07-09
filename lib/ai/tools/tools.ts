import { tool } from "ai";
import { z } from "zod";
import { setArtifactSandboxUrl } from "@/lib/db/queries";

export function writeSandboxUrlTool(artifactId: string) {
  return tool({
    description:
      "After building and starting the artifact's sandbox container (docker compose build && docker compose up -d, per the .adu/deployment-targets/docker templates), write its URL into the artifact in the database. The URL should be the internal, service-to-service address (docker container name + port), e.g. http://<technicalName>-website-1:4321 — not a localhost/host-published URL.",
    inputSchema: z.object({
      sandboxUrl: z
        .string()
        .describe(
          "The internal url the sandbox container is reachable at, e.g. http://<technicalName>-website-1:4321"
        ),
    }),
    execute: async ({ sandboxUrl }) => {
      await setArtifactSandboxUrl(artifactId, sandboxUrl);
      return { sandboxUrl };
    },
  });
}

export function openPreviewPanel() {
  return tool({
    description:
      "This tool opens the preview-panel with the website in sandbox-mode.",
    inputSchema: z.object({}),
    execute: async () => ({ opened: true }),
  });
}

export function reloadPreviewPanel() {
  return tool({
    description:
      "This tool reloads the preview-panel with the website in sandbox-mode.",
    inputSchema: z.object({}),
    execute: async () => ({ reloaded: true }),
  });
}
