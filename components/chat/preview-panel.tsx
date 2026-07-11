"use client";

import { RotateCw, SquareArrowOutUpRight, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveChangeRequest } from "@/hooks/use-active-change-request";
import { usePreviewPanel } from "@/hooks/use-preview-panel";
import { useMemo } from "react";

const PROXY_BASE = process.env.NEXT_PUBLIC_SERVICE_PROXY_URL ?? "";

export function PreviewPanel() {
  const { isOpen, close, setIFrameRef, reload } = usePreviewPanel();
  const { activeChangeRequest } = useActiveChangeRequest();

  // TODO activeChangeRequest is not set when creating a new change-request. Use the technical-name from the artifact, not from the activeChangeRequest.
  const technicalName = activeChangeRequest?.technicalName;

  const url = useMemo(
    () => `${PROXY_BASE}/sandbox/${technicalName}/`,
    [technicalName]
  );

  if (!isOpen) return null;

  return (
    <div className="flex h-full w-full max-w-2/3 flex-col border-l">
      <div className="flex items-center justify-between border-b p-2">
        <span className="text-sm font-medium">Preview</span>
        <div>
          <Button size="icon-xs" variant="ghost" onClick={() => reload()}>
            <RotateCw />
          </Button>
          <Button asChild size="icon-xs" variant="ghost">
            <a href={url} target="_blank">
              <SquareArrowOutUpRight />
            </a>
          </Button>
          <Button onClick={close} size="icon-xs" variant="ghost">
            <XIcon />
          </Button>
        </div>
      </div>
      {technicalName ? (
        <iframe
          className="h-full w-full flex-1 border-0"
          src={url}
          title="Sandbox preview"
          ref={(ref) => setIFrameRef(ref)}
        />
      ) : (
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
          Sandbox not deployed yet
        </div>
      )}
    </div>
  );
}
