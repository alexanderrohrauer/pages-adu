import { redirect } from "next/navigation";
import { ChatShell } from "@/components/chat/chat-shell";
import { PreviewPanel } from "@/components/chat/preview-panel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default async function NewChangeRequest({
  searchParams,
}: {
  searchParams: Promise<{ artifactId?: string }>;
}) {
  const { artifactId } = await searchParams;
  if (!artifactId) {
    redirect("/");
  }

  return (
    <ResizablePanelGroup className="flex min-h-0 flex-1">
      <ResizablePanel minSize="33%" className="min-w-0 flex-1">
        <ChatShell />
      </ResizablePanel>
      <PreviewPanel serviceProxyUrl={process.env.SERVICE_PROXY_URL!} />
      <ResizableHandle />
    </ResizablePanelGroup>
  );
}
