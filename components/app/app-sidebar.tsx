"use client";

import { FolderKanbanIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SidebarChangeRequests } from "@/components/chat/sidebar-change-requests";
import { SidebarSettings } from "@/components/chat/sidebar-settings";
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

export function AppSidebar() {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pt-3 pb-0">
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-center justify-end">
            <SidebarTrigger className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors duration-150" />
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
        <SidebarSettings />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
