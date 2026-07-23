import type React from "react";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app/app-sidebar";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ActiveChangeRequestProvider } from "@/hooks/use-active-change-request";
import { AppTopBar } from "@/components/app/app-top-bar";
import { PreviewPanelProvider } from "@/hooks/use-preview-panel";

function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-dvh overflow-hidden">
      <PreviewPanelProvider>
        <AppSidebar />
        <SidebarInset className="min-h-0">
          <AppTopBar />
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
      </PreviewPanelProvider>
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
