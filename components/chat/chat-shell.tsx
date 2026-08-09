"use client";

import {
  AttachmentPrimitive,
  AuiIf,
  ComposerPrimitive,
  ThreadPrimitive,
  useAui,
} from "@assistant-ui/react";
import {
  ArrowUpIcon,
  PaperclipIcon,
  Pencil,
  SquareIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DrawingDialog } from "@/components/chat/drawing-dialog";
import { usePreviewPanel } from "@/hooks/use-preview-panel";
import { claudeCodeToolName } from "@/lib/ai/tools/tool-names";
import { useAdHocTool } from "@/components/assistant-ui/assistant-ui-tools";
import { FormToolComponent } from "@/components/tools/form-tool";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StartScreenCard } from "@/components/chat/start-screen-card";
import { AssistantMessage, UserMessage } from "@/components/chat/messages";

interface ChatShellProps {
  suggestions: string[];
}

export function ChatShell(props: ChatShellProps) {
  const previewPanel = usePreviewPanel();
  const aui = useAui();

  useAdHocTool(
    claudeCodeToolName("openPreviewPanel"),
    () => previewPanel.open(),
    <p>Opening preview-panel...</p>
  );
  useAdHocTool(
    claudeCodeToolName("reloadPreviewPanel"),
    () => previewPanel.reload(),
    <p>Reloading preview-panel...</p>
  );

  useAdHocTool(
    claudeCodeToolName("setChangeRequestPath"),
    // Reload after path was set:
    () => previewPanel.reload(),
    <p>Setting website-path for change-request</p>
  );

  return (
    <ThreadPrimitive.Root className="@container/chat-shell flex h-full max-w-full flex-col">
      <ThreadPrimitive.Viewport className="relative flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <StartScreenCard suggestions={props.suggestions} />

        <ThreadPrimitive.Messages
          components={{ UserMessage, AssistantMessage }}
        />

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 pt-2">
          <ComposerPrimitive.Root className="bg-muted flex w-full flex-col rounded-3xl border">
            <FormToolComponent />
            <ComposerPrimitive.Attachments>
              {({ attachment }) => (
                <AttachmentPrimitive.Root className="bg-background m-2 mb-0 flex w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs">
                  <AttachmentPrimitive.unstable_Thumb className="bg-muted flex size-5 items-center justify-center rounded text-[10px] font-medium" />
                  <span className="max-w-35 truncate">
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PaperclipIcon className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>Add an attachment</TooltipContent>
                  </Tooltip>
                </ComposerPrimitive.AddAttachment>

                <DrawingDialog
                  onSave={(file) => aui.composer().addAttachment(file)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Pencil />
                      </TooltipTrigger>
                      <TooltipContent>Add a sketch</TooltipContent>
                    </Tooltip>
                  </Button>
                </DrawingDialog>
              </div>
              <AuiIf condition={(s) => !s.thread.isRunning}>
                <ComposerPrimitive.Send className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full disabled:opacity-30">
                  <ArrowUpIcon className="size-4" />
                </ComposerPrimitive.Send>
              </AuiIf>
              <AuiIf condition={(s) => s.thread.isRunning}>
                <ComposerPrimitive.Cancel className="bg-primary text-primary-foreground relative flex size-8 items-center justify-center rounded-full">
                  <Spinner className="text-primary-foreground/40 absolute inset-0 size-8" />
                  <SquareIcon className="size-3 fill-current" />
                </ComposerPrimitive.Cancel>
              </AuiIf>
            </div>
            <span className="text-secondary-foreground px-4 pb-3 text-xs">
              Shift + Enter inserts a new line.
            </span>
          </ComposerPrimitive.Root>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
}
