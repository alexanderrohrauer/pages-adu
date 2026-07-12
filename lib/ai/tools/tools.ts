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

export function askForClarification() {
  return tool({
    description:
      "This tool is used whenever you need the user to clarify questions in a structured manner. It renders a form, that the user can answer. Supply a JSONSchema that corresponds to the form.",
    inputSchema: z.object({
      question: z.string({
        description: "This is the question you would like to answer.",
      }),
      jsonSchema: z
        .object({})
        .describe(
          "This is the JSONSchema for the rjsf library, that is used to construct the form."
        ),
    }),
    execute: async ({ question, jsonSchema }) => ({ question, jsonSchema }),
  });
}
