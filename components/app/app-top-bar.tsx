"use client";
import { Button } from "@/components/ui/button";
import { Box, SquareArrowOutUpRight } from "lucide-react";
import { usePreviewPanel } from "@/hooks/use-preview-panel";

// TODO AI should set visual-editor url in CMS when creating the collection + set important links (like to the CMS collection) in the db
export function AppTopBar() {
  const previewPanel = usePreviewPanel();
  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex gap-2 px-4">
        <Button asChild variant="outline">
          <a href={"http://localhost/cms"} target="_blank">
            <SquareArrowOutUpRight />
            Open CMS
          </a>
        </Button>
        <Button className="max-w-max" onClick={() => previewPanel.open()}>
          <Box /> Open Preview
        </Button>
      </div>
    </header>
  );
}
