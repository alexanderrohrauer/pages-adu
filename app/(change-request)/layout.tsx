import type React from "react";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app/app-sidebar";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ActiveChangeRequestProvider } from "@/hooks/use-active-change-request";
import { auth } from "@/app/(auth)/auth";

async function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <SidebarProvider>
      <AppSidebar user={session?.user} />
      <SidebarInset>
        <Toaster
          position="top-center"
          theme="system"
          toastOptions={{
            className:
              "!bg-card !text-foreground !border-border/50 !shadow-[var(--shadow-float)]",
          }}
        />
        <ActiveChangeRequestProvider>{children}</ActiveChangeRequestProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DataStreamProvider>
      <Suspense fallback={<div className="bg-sidebar flex h-dvh" />}>
        <ChatLayoutInner>{children}</ChatLayoutInner>
      </Suspense>
    </DataStreamProvider>
  );
}
