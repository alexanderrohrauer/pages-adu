"use client";
import { Button } from "@/components/ui/button";
import { Box, ChevronDown, SquareArrowOutUpRight } from "lucide-react";
import { usePreviewPanel } from "@/hooks/use-preview-panel";
import * as React from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveChangeRequest } from "@/hooks/use-active-change-request";

export function AppTopBar() {
  const previewPanel = usePreviewPanel();
  const { activeChangeRequest, activeArtifact } = useActiveChangeRequest();
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <span className="text-sm font-medium">
        {activeArtifact?.name}
        {activeChangeRequest && (
          <span className="text-muted-foreground">
            {" "}
            | {activeChangeRequest.title}
          </span>
        )}
      </span>

      <div className="flex gap-2">
        {!!activeChangeRequest?.links?.length && (
          <ButtonGroup>
            <Button asChild variant="outline">
              <a href={activeChangeRequest.links[0].link} target="_blank">
                <SquareArrowOutUpRight />
                {activeChangeRequest.links[0].label}
              </a>
            </Button>
            {activeChangeRequest?.links?.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="More Options"
                  >
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-max">
                  {activeChangeRequest.links.slice(1).map((link) => (
                    <DropdownMenuItem
                      key={link.link}
                      asChild
                      className="cursor-pointer"
                    >
                      <a href={link.link} target="_blank">
                        <SquareArrowOutUpRight />
                        <span>{link.label}</span>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </ButtonGroup>
        )}

        <Button className="max-w-max" onClick={() => previewPanel.open()}>
          <Box /> Open Preview
        </Button>
      </div>
    </header>
  );
}
