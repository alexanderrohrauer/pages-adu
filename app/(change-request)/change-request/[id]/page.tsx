import type { Metadata } from "next";
import { ChatShell } from "@/components/chat/chat-shell";
import { PreviewPanel } from "@/components/chat/preview-panel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { loadConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Change-request | PAGES",
};
export default async function ChangeRequest() {
  const config = await loadConfig();
  return (
    <ResizablePanelGroup className="flex min-h-0 flex-1">
      <ResizablePanel minSize="33%" className="min-w-0 flex-1">
        <ChatShell suggestions={config.promptSuggestions} />
      </ResizablePanel>
      <PreviewPanel serviceProxyUrl={process.env.SERVICE_PROXY_URL!} />
      <ResizableHandle />
    </ResizablePanelGroup>
  );
}
