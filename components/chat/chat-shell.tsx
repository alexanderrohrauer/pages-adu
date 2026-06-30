"use client";
import {
  AuiIf,
  ComposerPrimitive,
  ThreadPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { ArrowUpIcon } from "lucide-react";

export function ChatShell() {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <p>Welcome! Ask a question to get started.</p>
        </AuiIf>

        <ThreadPrimitive.Messages>
          {({ message }) => {
            if (message.role === "user") return <UserMessage />;
            return <AssistantMessage />;
          }}
        </ThreadPrimitive.Messages>

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 pt-2">
          <ComposerPrimitive.Root className="bg-muted flex w-full flex-col rounded-3xl border">
            <ComposerPrimitive.Input
              placeholder="Ask anything..."
              className="min-h-10 w-full resize-none bg-transparent px-5 pt-3.5 pb-2.5 text-sm focus:outline-none"
              rows={1}
            />
            <div className="flex items-center justify-end px-2.5 pb-2.5">
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
    <MessagePrimitive.Root className="flex justify-end">
      <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl px-4 py-2.5 text-sm">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-start">
      <div className="bg-muted max-w-[80%] rounded-2xl px-4 py-2.5 text-sm">
        <MessagePrimitive.Parts />
      </div>
    </MessagePrimitive.Root>
  );
}
