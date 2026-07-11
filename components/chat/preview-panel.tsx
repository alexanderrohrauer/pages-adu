"use client";

import { RotateCw, SquareArrowOutUpRight, XIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { useActiveChangeRequest } from "@/hooks/use-active-change-request";
import { usePreviewPanel } from "@/hooks/use-preview-panel";
import type { Artifact } from "@/lib/db/schema";

const PROXY_BASE = process.env.NEXT_PUBLIC_SERVICE_PROXY_URL ?? "";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function PreviewPanel() {
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
