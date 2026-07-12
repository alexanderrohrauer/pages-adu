import { tool } from "ai";
import { z } from "zod";
import { updateChangeRequestPath } from "@/lib/db/queries";

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

export function setChangeRequestPath(changeRequestId: string) {
  return tool({
    description:
      'Persists the website path (e.g. "/about") that this change-request is about. Call this once you know which page of the website the requested change applies to — for example based on the path currently open in the live preview (given to you as context), or because the user told you explicitly.',
    inputSchema: z.object({
      path: z.string({
        description:
          'The path on the website this change-request is about, e.g. "/about".',
      }),
    }),
    execute: async ({ path }) => {
      await updateChangeRequestPath(changeRequestId, path);
      return { path };
    },
  });
}
