import { tool } from "ai";
import { z } from "zod";

// TODO implement "writeSandboxPath" into changerequests., Fix sandbox url not correctly written to db when building locally

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
