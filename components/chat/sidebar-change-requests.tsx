"use client";

import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { TrashIcon } from "lucide-react";
import type { User } from "next-auth";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarChangeRequestProps {
  user: User | undefined;
}

export function SidebarChangeRequests({ user }: SidebarChangeRequestProps) {
  if (!user) return null;

  return (
    <ThreadListPrimitive.Root>
      <SidebarGroup>
        <SidebarGroupLabel>Change-Requests</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <ThreadListPrimitive.Items>
              {() => <ChangeRequestItem />}
            </ThreadListPrimitive.Items>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </ThreadListPrimitive.Root>
  );
}

function ChangeRequestItem() {
  return (
    <ThreadListItemPrimitive.Root asChild>
      <SidebarMenuItem>
        <ThreadListItemPrimitive.Trigger asChild>
          <SidebarMenuButton className="pr-8 text-[13px]">
            <ThreadListItemPrimitive.Title />
          </SidebarMenuButton>
        </ThreadListItemPrimitive.Trigger>
        <ThreadListItemPrimitive.Delete asChild>
          <SidebarMenuAction
            className="text-sidebar-foreground/40 hover:text-destructive"
            showOnHover
          >
            <TrashIcon className="size-3.5" />
          </SidebarMenuAction>
        </ThreadListItemPrimitive.Delete>
      </SidebarMenuItem>
    </ThreadListItemPrimitive.Root>
  );
}
