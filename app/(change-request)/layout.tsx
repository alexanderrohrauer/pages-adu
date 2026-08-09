import type React from "react";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app/app-sidebar";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ActiveChangeRequestProvider } from "@/hooks/use-active-change-request";
import { AppTopBar } from "@/components/app/app-top-bar";
import { PreviewPanelProvider } from "@/hooks/use-preview-panel";
import { AdvancedModeProvider } from "@/hooks/use-advanced-mode";
import { cookies } from "next/headers";

async function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  const providedCookies = await cookies();
  const previewOpen =
    providedCookies.get("PAGES_PREVIEW_OPEN")?.value === "true";
  return (
    <SidebarProvider className="h-dvh overflow-hidden">
      <AdvancedModeProvider>
        <PreviewPanelProvider previewPanelOpen={previewOpen}>
          <ActiveChangeRequestProvider>
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
              {children}
            </SidebarInset>
          </ActiveChangeRequestProvider>
        </PreviewPanelProvider>
      </AdvancedModeProvider>
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
