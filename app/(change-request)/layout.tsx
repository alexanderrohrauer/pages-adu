import type React from "react";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app/app-sidebar";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ActiveChangeRequestProvider } from "@/hooks/use-active-change-request";
import { AppTopBar } from "@/components/app/app-top-bar";
import { PreviewPanelProvider } from "@/hooks/use-preview-panel";
import { cookies } from "next/headers";

async function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  const providedCookies = await cookies();
  const previewOpen = Boolean(providedCookies.get("PAGES_PREVIEW_OPEN"));
  return (
    <SidebarProvider className="h-dvh overflow-hidden">
      <PreviewPanelProvider previewPanelOpen={previewOpen}>
        <AppSidebar />
        <SidebarInset className="min-h-0">
          <ActiveChangeRequestProvider>
            <AppTopBar />
            <Toaster
              position="top-center"
              theme="system"
              toastOptions={{
                className:
                  "!bg-card !text-foreground !border-border/50 !shadow-[var(--shadow-float)]",
              }}
            />
            {children}
          </ActiveChangeRequestProvider>
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
