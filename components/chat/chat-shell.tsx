"use client";

import {
  AttachmentPrimitive,
  AuiIf,
  ComposerPrimitive,
  groupPartByType,
  MessagePartPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
} from "@assistant-ui/react";
import { ArrowUpIcon, PaperclipIcon, Pencil, XIcon } from "lucide-react";
import {
  Reasoning,
  ReasoningContent,
  ReasoningRoot,
  ReasoningText,
  ReasoningTrigger,
} from "@/components/assistant-ui/reasoning";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { Button } from "@/components/ui/button";
import { DrawingDialog } from "@/components/chat/drawing-dialog";

export function ChatShell() {
  const aui = useAui();
  return (
    <ThreadPrimitive.Root className="flex h-full max-w-full flex-col">
      <ThreadPrimitive.Viewport className="relative flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <p className="text-muted-foreground text-sm">
            Welcome! Start your change-request below.
          </p>
        </AuiIf>

        <ThreadPrimitive.Messages
          components={{ UserMessage, AssistantMessage }}
        />

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 pt-2">
          <ComposerPrimitive.Root className="bg-muted flex w-full flex-col rounded-3xl border">
            <ComposerPrimitive.Attachments>
              {({ attachment }) => (
                <AttachmentPrimitive.Root className="bg-background m-2 mb-0 flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs">
                  <AttachmentPrimitive.unstable_Thumb className="bg-muted flex size-5 items-center justify-center rounded text-[10px] font-medium" />
                  <span className="max-w-[140px] truncate">
                    <AttachmentPrimitive.Name />
                  </span>
                  <AttachmentPrimitive.Remove className="text-muted-foreground hover:text-foreground ml-0.5 transition-colors">
                    <XIcon className="size-3" />
                  </AttachmentPrimitive.Remove>
                </AttachmentPrimitive.Root>
              )}
            </ComposerPrimitive.Attachments>
            <ComposerPrimitive.Input
              placeholder="Describe your change-request..."
              className="min-h-10 w-full resize-none bg-transparent px-5 pt-3.5 pb-2.5 text-sm focus:outline-none"
              rows={1}
            />
            <div className="flex items-center justify-between px-2.5 pb-2.5">
              <div className="flex flex-row items-start space-x-1">
                <ComposerPrimitive.AddAttachment className="text-muted-foreground hover:text-foreground flex size-8 items-center justify-center rounded-full transition-colors">
                  <PaperclipIcon className="size-4" />
                </ComposerPrimitive.AddAttachment>
                <DrawingDialog
                  onSave={(file) => aui.composer().addAttachment(file)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil />
                  </Button>
                </DrawingDialog>
              </div>
              <ComposerPrimitive.Send className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full disabled:opacity-30">
                <ArrowUpIcon className="size-4" />
              </ComposerPrimitive.Send>
            </div>
          </ComposerPrimitive.Root>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}
function UserMessage() {
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
            if (part.type === "text") return <UserText />;
            return null;
          }}
        </MessagePrimitive.Parts>
      </div>
    </MessagePrimitive.Root>
  );
}
function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-start gap-3">
      <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-xs font-medium">
        AI
      </div>
      <div className="bg-muted max-w-[75%] rounded-2xl px-4 py-2.5 text-sm">
        <MessagePrimitive.GroupedParts
          groupBy={groupPartByType({
            reasoning: ["group-reasoning"],
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
function UserText() {
  return (
    <p>
      <MessagePartPrimitive.Text />
    </p>
  );
}
