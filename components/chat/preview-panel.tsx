"use client";

import { useAssistantInstructions } from "@assistant-ui/react";
import { RotateCw, SquareArrowOutUpRight, XIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { useActiveChangeRequest } from "@/hooks/use-active-change-request";
import { usePreviewPanel } from "@/hooks/use-preview-panel";
import type { Artifact } from "@/lib/db/schema";
import { fetcher } from "@/lib/fetch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResizablePanel } from "@/components/ui/resizable";

interface PreviewPanelProps {
  serviceProxyUrl: string;
}

export function PreviewPanel({ serviceProxyUrl }: PreviewPanelProps) {
  const { isOpen, close, setIFrameRef, reload } = usePreviewPanel();
  const { activeChangeRequest } = useActiveChangeRequest();
  const searchParams = useSearchParams();
  const artifactId = searchParams.get("artifactId");

  // On the "new" change-request page there is no activeChangeRequest yet,
  // so fall back to the artifact selected via ?artifactId= in the URL.
  const { data: artifacts } = useSWR<Artifact[]>("/api/artifacts", fetcher);

  const technicalName =
    activeChangeRequest?.technicalName ??
    artifacts?.find((artifact) => artifact.id === artifactId)?.technicalName;

  const [currentPath, setCurrentPath] = useState<string>(
    activeChangeRequest?.path ?? "/"
  );

  useEffect(() => {
    if (activeChangeRequest?.path) setCurrentPath(activeChangeRequest!.path!);
  }, [activeChangeRequest]);

  const url = useMemo(
    () => `${serviceProxyUrl}/sandbox/${technicalName}${currentPath}`,
    [currentPath, technicalName, serviceProxyUrl]
  );

  useAssistantInstructions({
    instruction: `The user currently has the path "${currentPath}" open in the live preview of the website. If the change-request concerns a specific page, use the setChangeRequestPath tool to record this path against the change-request.`,
    disabled: !currentPath,
  });

  if (!isOpen) return null;

  return (
    <ResizablePanel
      defaultSize="63%"
      minSize="33%"
      className="flex size-full flex-col border-l"
    >
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex space-x-3">
          <span className="text-sm font-medium">Preview</span>
          {activeChangeRequest?.path && (
            <span className="text-sm font-medium">
              <span className="text-secondary-foreground font-normal">
                https://www.example.com
              </span>
              {activeChangeRequest?.path}
            </span>
          )}
        </div>
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon-xs" variant="ghost" onClick={() => reload()}>
                <RotateCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reload preview</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon-xs" variant="ghost">
                <a href={url} target="_blank">
                  <SquareArrowOutUpRight />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open preview in new tab</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={close} size="icon-xs" variant="ghost">
                <XIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close preview</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {technicalName ? (
        <iframe
          className="h-full w-full flex-1 border-0"
          src={url}
          title="Sandbox preview"
          ref={(ref) => setIFrameRef(ref)}
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      ) : (
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
          Sandbox not deployed yet
        </div>
      )}
    </ResizablePanel>
  );
}
