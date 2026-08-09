import { useAdvancedMode } from "@/hooks/use-advanced-mode";
import {
  groupPartByType,
  MessagePartPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import {
  Reasoning,
  ReasoningContent,
  ReasoningRoot,
  ReasoningText,
  ReasoningTrigger,
} from "@/components/assistant-ui/reasoning";
import { cn } from "@/lib/utils";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";

export function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex flex-col items-end gap-1">
      <MessagePrimitive.Attachments>
        {({ attachment }) => {
          const first = attachment.content?.[0];
          if (attachment.type === "image" && first?.type === "image") {
            return (
              <img
                src={first.image}
                alt={attachment.name}
                className="max-h-48 max-w-[80%] rounded-xl object-contain"
              />
            );
          }
          return (
            <div className="bg-muted flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs">
              <span className="font-medium">{attachment.name}</span>
            </div>
          );
        }}
      </MessagePrimitive.Attachments>
      <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl px-4 py-2.5 text-sm">
        <MessagePrimitive.Parts>
          {({ part }) => {
            if (part.type === "text")
              return (
                <p>
                  <MessagePartPrimitive.Text />
                </p>
              );
            return null;
          }}
        </MessagePrimitive.Parts>
      </div>
    </MessagePrimitive.Root>
  );
}

export function AssistantMessage() {
  const { advancedMode } = useAdvancedMode();

  return (
    <MessagePrimitive.Root className="flex justify-start gap-3">
      <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-xs font-medium">
        AI
      </div>
      <div className="bg-muted max-w-[85%] rounded-2xl px-4 py-2.5 text-sm @2xl/chat-shell:max-w-[75%]">
        <MessagePrimitive.GroupedParts
          groupBy={groupPartByType({
            reasoning: ["group-reasoning"],
            "tool-call": ["group-tool-calls"],
          })}
        >
          {({ part, children }) => {
            switch (part.type) {
              case "group-reasoning": {
                const running = part.status.type === "running";
                return (
                  <ReasoningRoot streaming={running}>
                    <ReasoningTrigger active={running} />
                    <ReasoningContent aria-busy={running}>
                      <ReasoningText>{children}</ReasoningText>
                    </ReasoningContent>
                  </ReasoningRoot>
                );
              }
              case "group-tool-calls":
                return (
                  <div
                    className={cn(
                      !advancedMode && "[&>*:not(:last-child)]:hidden"
                    )}
                  >
                    {children}
                  </div>
                );
              case "text":
                return <MarkdownText />;
              case "reasoning":
                return <Reasoning {...part} />;
              case "tool-call":
                return part.toolUI ?? <ToolFallback {...part} />;
              default:
                return null;
            }
          }}
        </MessagePrimitive.GroupedParts>
      </div>
    </MessagePrimitive.Root>
  );
}
