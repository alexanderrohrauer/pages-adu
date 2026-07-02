"use client";

import { ChevronRightIcon, PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { User } from "next-auth";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SidebarChangeRequestProps {
  user: User | undefined;
}

export function SidebarChangeRequests({ user }: SidebarChangeRequestProps) {
  const params = useParams();
  const router = useRouter();
  const activeId = typeof params?.id === "string" ? params.id : undefined;

  const { data: artifacts } = useSWR<Artifact[]>(
    user ? "/api/artifacts" : null,
    fetcher
  );
  const { data: changeRequests, mutate } = useSWR<ChangeRequest[]>(
    user ? "/api/change-requests" : null,
    fetcher
  );

  if (!user) return null;

  const handleDelete = async (id: string) => {
    await fetch(`/api/change-requests/${id}`, { method: "DELETE" });
    mutate();
    if (activeId === id) router.push("/");
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Artifacts</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
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
                  <SidebarMenuAction asChild title="New Change-Request">
                    <Link href={`/new?artifactId=${artifact.id}`}>
                      <PlusIcon className="size-3.5" />
                    </Link>
                  </SidebarMenuAction>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {items.map((cr) => (
                        <SidebarMenuSubItem key={cr.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={cr.id === activeId}
                          >
                            <Link href={`/change-request/${cr.id}`}>
                              <span className="truncate">{cr.title}</span>
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
