"use client";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";
import { usePreviewPanel } from "@/hooks/use-preview-panel";

export function AppTopBar() {
  const previewPanel = usePreviewPanel();
  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="gap-2 px-4">
        <Button className="max-w-max" onClick={() => previewPanel.open()}>
          <Box /> Open Preview
        </Button>
      </div>
    </header>
  );
}
