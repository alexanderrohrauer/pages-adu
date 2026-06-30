"use client";

import type { ChatStatus } from "ai";
import type { ComponentProps, HTMLAttributes } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import {
  useCallback,
  useState,
  type FormEventHandler,
  type KeyboardEventHandler,
} from "react";

export type PromptInputProps = Omit<
  HTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  onSubmit?: () => void;
};

export const PromptInput = ({
  className,
  onSubmit,
  children,
  ...props
}: PromptInputProps) => {
  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit?.();
    },
    [onSubmit]
  );

  return (
    <form
      className={cn("w-full", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <InputGroup className="overflow-hidden">{children}</InputGroup>
    </form>
  );
};

export type PromptInputTextareaProps = ComponentProps<
  typeof InputGroupTextarea
>;

export const PromptInputTextarea = ({
  onChange,
  onKeyDown,
  className,
  placeholder = "What would you like to know?",
  ...props
}: PromptInputTextareaProps) => {
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (
        e.key === "Enter" &&
        !isComposing &&
        !e.nativeEvent.isComposing &&
        !e.shiftKey
      ) {
        e.preventDefault();
        const submitButton = e.currentTarget.form?.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement | null;
        if (!submitButton?.disabled) {
          e.currentTarget.form?.requestSubmit();
        }
      }
    },
    [onKeyDown, isComposing]
  );

  return (
    <InputGroupTextarea
      className={cn("field-sizing-content max-h-48 min-h-16", className)}
      name="message"
      onCompositionEnd={() => setIsComposing(false)}
      onCompositionStart={() => setIsComposing(true)}
      onKeyDown={handleKeyDown}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  );
};

export type PromptInputFooterProps = Omit<
  ComponentProps<typeof InputGroupAddon>,
  "align"
>;

export const PromptInputFooter = ({
  className,
  ...props
}: PromptInputFooterProps) => (
  <InputGroupAddon
    align="block-end"
    className={cn("justify-between gap-1", className)}
    {...props}
  />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <div
    className={cn("flex min-w-0 items-center gap-1", className)}
    {...props}
  />
);

export type PromptInputSubmitProps = ComponentProps<typeof InputGroupButton> & {
  status?: ChatStatus;
  onStop?: () => void;
};

export const PromptInputSubmit = ({
  className,
  variant = "default",
  size = "icon-sm",
  status: _status,
  onStop: _onStop,
  children,
  ...props
}: PromptInputSubmitProps) => (
  <InputGroupButton
    className={cn(className)}
    size={size}
    type="submit"
    variant={variant}
    {...props}
  >
    {children}
  </InputGroupButton>
);
