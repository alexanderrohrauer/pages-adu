import Link from "next/link";
import { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { MoreHorizontalIcon, ShareIcon, TrashIcon } from "lucide-react";
import { ChangeRequest } from "@/lib/db/schema";

const PureHistoryItem = ({
  changeRequest,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  changeRequest: ChangeRequest;
  isActive: boolean;
  onDelete: (changeRequestId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className="text-sidebar-foreground/50 hover:text-sidebar-foreground data-active:text-sidebar-foreground/50 data-[active=true]:text-sidebar-foreground data-[active=true]:border-sidebar-foreground/50 h-8 rounded-none text-[13px] transition-all duration-150 hover:bg-transparent data-active:bg-transparent data-active:font-normal data-[active=true]:border-b data-[active=true]:border-dashed data-[active=true]:font-medium"
        isActive={isActive}
      >
        <Link
          href={`/change-request/${changeRequest.id}`}
          onClick={() => setOpenMobile(false)}
        >
          <span className="truncate">{changeRequest.title}</span>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5 rounded-md ring-0 transition-colors duration-150 focus-visible:ring-0"
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <ShareIcon />
              <span>Share</span>
            </DropdownMenuSubTrigger>
          </DropdownMenuSub>

          <DropdownMenuItem
            onSelect={() => onDelete(changeRequest.id)}
            variant="destructive"
          >
            <TrashIcon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const SidebarHistoryItem = memo(
  PureHistoryItem,
  (prevProps, nextProps) => {
    return prevProps.isActive === nextProps.isActive;
  }
);
