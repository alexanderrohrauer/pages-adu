"use client";

import { ChevronUp } from "lucide-react";
import type { User } from "next-auth";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SidebarUserNav({ user }: { user: User }) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-8 rounded-lg bg-transparent px-2 transition-colors duration-150"
              data-testid="user-nav-button"
            >
              <img
                src={user.image ?? ""}
                alt="User image"
                className="ring-sidebar-border/50 size-5 shrink-0 rounded-full ring-1"
              />
              <span className="truncate text-[13px]" data-testid="user-email">
                {user.name ?? user.email}
              </span>
              <ChevronUp className="text-sidebar-foreground/50 ml-auto size-3.5" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border-border/60 bg-card/95 w-(--radix-popper-anchor-width) rounded-lg border shadow-[var(--shadow-float)] backdrop-blur-xl"
            data-testid="user-nav-menu"
            side="top"
          >
            <DropdownMenuItem
              className="cursor-pointer text-[13px]"
              data-testid="user-nav-item-theme"
              onSelect={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {`Toggle ${resolvedTheme === "light" ? "dark" : "light"} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button
                className="w-full cursor-pointer text-[13px]"
                onClick={() => signOut({ callbackUrl: "/" })}
                type="button"
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
