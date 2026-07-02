import { redirect } from "next/navigation";
import { ChatShell } from "@/components/chat/chat-shell";

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
    <div className="h-screen">
      <ChatShell />
    </div>
  );
}
