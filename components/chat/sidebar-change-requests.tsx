"use client";

import { ChevronRightIcon, PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { Artifact, ChangeRequest } from "@/lib/db/schema";
import { BASE_PATH, fetcher } from "@/lib/fetch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActiveChangeRequest } from "@/hooks/use-active-change-request";
import { Truncate } from "@/components/utils/truncate";

export function SidebarChangeRequests() {
  const params = useParams();
  const router = useRouter();
  const activeId = typeof params?.id === "string" ? params.id : undefined;

  const { data: artifacts } = useSWR<Artifact[]>("/api/artifacts", fetcher);
  const { data: changeRequests, mutate } = useSWR<ChangeRequest[]>(
    "/api/change-requests",
    fetcher
  );

  const { activeChangeRequest } = useActiveChangeRequest();

  const handleDelete = async (id: string) => {
    await fetch(`${BASE_PATH}/api/change-requests/${id}`, { method: "DELETE" });
    mutate();
    if (activeId === id) router.push("/");
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Artifacts</SidebarGroupLabel>
      <SidebarGroupContent>
        {activeChangeRequest && (
          <SidebarMenuButton
            className="border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hidden h-8 rounded-lg border text-[13px] transition-colors duration-15 group-data-[collapsible=icon]:block"
            tooltip="Create change-request"
            asChild
          >
            <Link href={`/new?artifactId=${activeChangeRequest.artifactId}`}>
              <PlusIcon className="m-auto size-4" />
            </Link>
          </SidebarMenuButton>
        )}
        <SidebarMenu className="group-data-[collapsible=icon]:hidden">
          {artifacts?.map((artifact) => {
            const items =
              changeRequests?.filter((cr) => cr.artifactId === artifact.id) ??
              [];
            return (
              <Collapsible
                className="group/collapsible"
                defaultOpen
                key={artifact.id}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="pr-8 text-[13px] font-medium">
                      <ChevronRightIcon className="size-3.5 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      <span className="truncate">{artifact.name}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuAction asChild title="New Change-Request">
                        <Link href={`/new?artifactId=${artifact.id}`}>
                          <PlusIcon className="size-3.5" />
                        </Link>
                      </SidebarMenuAction>
                    </TooltipTrigger>
                    <TooltipContent>Create change-request</TooltipContent>
                  </Tooltip>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {items.map((cr) => (
                        <SidebarMenuSubItem key={cr.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={cr.id === activeId}
                          >
                            <Link href={`/change-request/${cr.id}`}>
                              <Truncate tooltipSide="right">
                                {cr.title}
                              </Truncate>
                            </Link>
                          </SidebarMenuSubButton>
                          <SidebarMenuAction
                            className="text-sidebar-foreground/40 hover:text-destructive"
                            onClick={() => handleDelete(cr.id)}
                            showOnHover
                          >
                            <TrashIcon className="size-3.5" />
                          </SidebarMenuAction>
                        </SidebarMenuSubItem>
                      ))}
                      {items.length === 0 && (
                        <SidebarMenuSubItem>
                          <span className="text-sidebar-foreground/40 px-2 text-xs">
                            No change-requests yet
                          </span>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
