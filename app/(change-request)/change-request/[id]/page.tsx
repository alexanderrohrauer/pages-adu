import { ChatShell } from "@/components/chat/chat-shell";
import { PreviewPanel } from "@/components/chat/preview-panel";

export default function ChangeRequest() {
  return (
    <div className="flex h-screen">
      <div className="min-w-0 flex-1">
        <ChatShell />
      </div>
      <PreviewPanel />
    </div>
  );
}
