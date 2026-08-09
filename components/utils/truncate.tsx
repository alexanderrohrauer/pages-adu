import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TruncateProps extends React.PropsWithChildren {
  className?: string;
  tooltipSide?: "top" | "bottom" | "left" | "right";
}

export function Truncate({ children, className, tooltipSide }: TruncateProps) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [enableTooltip, setEnableTooltip] = useState(false);

  useEffect(() => {
    if (spanRef.current) {
      if (spanRef.current.scrollWidth > spanRef.current.clientWidth) {
        setEnableTooltip(true);
      }
    }
  }, [spanRef]);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("truncate", className)} ref={spanRef}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent hidden={!enableTooltip} side={tooltipSide}>
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
