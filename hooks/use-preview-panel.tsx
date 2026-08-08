"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type PreviewPanelContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setIFrameRef: (iframeRef: HTMLIFrameElement | null) => void;
  reload: () => void;
};

const PreviewPanelContext = createContext<PreviewPanelContextValue | null>(
  null
);

export function PreviewPanelProvider({
  children,
  previewPanelOpen,
}: {
  children: React.ReactNode;
  previewPanelOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(previewPanelOpen);
  const iFrameRef = useRef<HTMLIFrameElement | null>(null);

  const setCookie = () => (document.cookie = `PAGES_PREVIEW_OPEN=${isOpen}`);

  const open = () => {
    setIsOpen(true);
    setCookie();
  };

  const close = () => {
    setIsOpen(false);
    setCookie();
  };

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      reload: () => {
        open();
        const iframe = iFrameRef.current;
        if (!iframe) return;
        const url = new URL(iframe.src);
        url.searchParams.set("_r", Date.now().toString());
        iframe.src = url.toString();
      },
      setIFrameRef: (iframeRef: HTMLIFrameElement | null) => {
        iFrameRef.current = iframeRef;
      },
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
