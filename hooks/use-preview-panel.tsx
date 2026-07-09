"use client";

import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

type PreviewPanelContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const PreviewPanelContext = createContext<PreviewPanelContextValue | null>(
  null
);

export function PreviewPanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return (
    <PreviewPanelContext.Provider value={value}>
      {children}
    </PreviewPanelContext.Provider>
  );
}

export function usePreviewPanel() {
  const context = useContext(PreviewPanelContext);
  if (!context) {
    throw new Error(
      "usePreviewPanel must be used within a PreviewPanelProvider"
    );
  }
  return context;
}
