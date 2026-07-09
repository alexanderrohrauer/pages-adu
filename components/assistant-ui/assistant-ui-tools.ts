import React, { useEffect, useRef } from "react";
import { useAssistantToolUI } from "@assistant-ui/react";

export function useAdHocTool(
  toolName: string,
  action: () => void,
  fallback: React.ReactNode
) {
  const openedToolCallIds = useRef(new Set<string>());
  useAssistantToolUI({
    toolName: toolName,
    // Named (not a bare arrow function) so react-hooks recognizes this as a
    // component and allows the useEffect below.
    render: function OpenPreviewPanelToolUI({ toolCallId }) {
      useEffect(() => {
        if (openedToolCallIds.current.has(toolCallId)) return;
        openedToolCallIds.current.add(toolCallId);
        action();
      }, [toolCallId]);
      return fallback;
    },
  });
}
