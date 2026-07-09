import { redirect } from "next/navigation";
import { ChatShell } from "@/components/chat/chat-shell";
import { PreviewPanel } from "@/components/chat/preview-panel";

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
    <div className="flex min-h-0 flex-1">
      <div className="min-w-0 flex-1">
        <ChatShell />
      </div>
      <PreviewPanel />
    </div>
  );
}
