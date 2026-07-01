"use client";

import {
  AssistantRuntimeProvider,
  useRemoteThreadListRuntime,
  useThreadListItem,
  type RemoteThreadListAdapter,
  type ThreadHistoryAdapter,
  type MessageFormatAdapter,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { createAssistantStream } from "assistant-stream";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function makeHistoryAdapter(
  remoteId: string | undefined
): ThreadHistoryAdapter {
  return {
    async load() {
      return { messages: [] };
    },
    async append() {},
    withFormat<TMsg, TFmt extends Record<string, unknown>>(
      formatAdapter: MessageFormatAdapter<TMsg, TFmt>
    ) {
      return {
        async load() {
          if (!remoteId)
            return {
              messages: [] as ReturnType<typeof formatAdapter.decode>[],
            };
          const res = await fetch(
            `${BASE}/api/change-requests/${remoteId}/messages`
          );
          if (!res.ok)
            return {
              messages: [] as ReturnType<typeof formatAdapter.decode>[],
            };
          const entries: Array<{
            id: string;
            parent_id: string | null;
            format: string;
            content: TFmt;
          }> = await res.json();
          return {
            messages: entries
              .filter((e) => e.format === formatAdapter.format)
              .map((e) => formatAdapter.decode(e)),
          };
        },
        async append(
          item: Parameters<typeof formatAdapter.decode>[0] extends never
            ? never
            : { parentId: string | null; message: TMsg }
        ) {
          if (!remoteId) return;
          const id = formatAdapter.getId(item.message);
          const content = formatAdapter.encode(item);
          await fetch(`${BASE}/api/change-requests/${remoteId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id,
              parent_id: item.parentId,
              format: formatAdapter.format,
              content,
            }),
          });
        },
      };
    },
  };
}

function useChatRuntimeHook() {
  const { remoteId } = useThreadListItem();
  const history = useMemo(() => makeHistoryAdapter(remoteId), [remoteId]);
  return useChatRuntime({
    transport: new AssistantChatTransport({ api: `${BASE}/api/chat` }),
    adapters: { history },
  });
}

function makeAdapter(basePath: string): RemoteThreadListAdapter {
  return {
    async list(params) {
      const url = new URL(`${basePath}/api/change-requests`, location.href);
      if (params?.after) url.searchParams.set("after", params.after);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to list change-requests");
      const items: Array<{ id: string; title: string; createdAt: string }> =
        await res.json();
      return {
        threads: items.map((item) => ({
          remoteId: item.id,
          externalId: item.id,
          title: item.title,
          status: "regular" as const,
          lastMessageAt: new Date(item.createdAt),
        })),
      };
    },

    async initialize(_threadId) {
      const res = await fetch(`${basePath}/api/change-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Change-Request" }),
      });
      if (!res.ok) throw new Error("Failed to create change-request");
      const { id } = await res.json();
      return { remoteId: id, externalId: id };
    },

    async fetch(remoteId) {
      const res = await fetch(`${basePath}/api/change-requests/${remoteId}`);
      if (!res.ok) throw new Error("Failed to fetch change-request");
      const item: { id: string; title: string; createdAt: string } =
        await res.json();
      return {
        remoteId: item.id,
        externalId: item.id,
        title: item.title,
        status: "regular" as const,
        lastMessageAt: new Date(item.createdAt),
      };
    },

    async delete(remoteId) {
      await fetch(`${basePath}/api/change-requests/${remoteId}`, {
        method: "DELETE",
      });
    },

    async rename(remoteId, newTitle) {
      await fetch(`${basePath}/api/change-requests/${remoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
    },

    async archive(remoteId) {
      await fetch(`${basePath}/api/change-requests/${remoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
    },

    async unarchive(remoteId) {
      await fetch(`${basePath}/api/change-requests/${remoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      });
    },

    async generateTitle(_remoteId, messages) {
      const firstUserMsg = messages.find((m) => m.role === "user");
      const text =
        firstUserMsg?.content
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("") ?? "New Change-Request";
      const title = text.slice(0, 60).trim() || "New Change-Request";
      return createAssistantStream((controller) => {
        controller.appendText(title);
        controller.close();
      });
    },
  };
}

export function AuiRuntime({ children }: React.PropsWithChildren) {
  const router = useRouter();
  const params = useParams();
  const threadId = typeof params?.id === "string" ? params.id : undefined;

  const adapter = useMemo(() => makeAdapter(BASE), []);

  const runtime = useRemoteThreadListRuntime({
    runtimeHook: useChatRuntimeHook,
    adapter,
    threadId,
    onThreadIdChange(id) {
      if (id) {
        router.push(`${BASE}/change-request/${id}`);
      } else {
        router.push(`${BASE}/new`);
      }
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
