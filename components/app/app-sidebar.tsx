"use client";

import {
  FolderKanbanIcon,
  MessageSquareIcon,
  PanelLeftIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarChangeRequests } from "@/components/chat/sidebar-change-requests";
import { SidebarUserNav } from "@/components/chat/sidebar-user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function AppSidebar() {
  const router = useRouter();
  const { setOpenMobile, toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pt-3 pb-0">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-center justify-between">
            <div className="group/logo relative flex items-center justify-center">
              <SidebarMenuButton
                asChild
                className="size-8 items-center justify-center px-0! group-data-[collapsible=icon]:group-hover/logo:opacity-0"
                tooltip="Chatbot"
              >
                <Link href="/public" onClick={() => setOpenMobile(false)}>
                  <MessageSquareIcon className="text-sidebar-foreground/50 size-4" />
                </Link>
              </SidebarMenuButton>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    className="pointer-events-none absolute inset-0 size-8 opacity-0 group-data-[collapsible=icon]:pointer-events-auto group-data-[collapsible=icon]:group-hover/logo:opacity-100"
                    onClick={() => toggleSidebar()}
                  >
                    <PanelLeftIcon className="size-4" />
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent className="hidden md:block" side="right">
                  Open sidebar
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <SidebarTrigger className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors duration-150" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground h-8 rounded-lg border text-[13px] transition-colors duration-150"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/");
                  }}
                  tooltip="Artifacts"
                >
                  <FolderKanbanIcon className="size-4" />
                  <span className="font-medium">Artifacts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarChangeRequests />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t pt-2 pb-3">
        <SidebarUserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
