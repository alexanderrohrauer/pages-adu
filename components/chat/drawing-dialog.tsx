"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { useRef, useState } from "react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { exportToBlob } from "@excalidraw/excalidraw";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  }
);

interface DrawingDialogProps extends React.PropsWithChildren {
  onSave?(file: File): void;
}

export function DrawingDialog(props: DrawingDialogProps) {
  const [open, setOpen] = useState(false);
  const excalidrawAPI = useRef<ExcalidrawImperativeAPI>();

  const exportImage = async () => {
    const elements = excalidrawAPI.current!.getSceneElements();
    if (!elements || !elements.length) {
      return;
    }
    const result: Blob = await exportToBlob({
      elements,
      appState: {
        //...initialData.appState,
        exportWithDarkMode: false,
      },
      files: excalidrawAPI.current!.getFiles(),
    });
    props.onSave?.(new File([result], "drawing.png", { type: "image/png" }));
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent
        className="h-screen w-screen max-w-none!"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add a drawing</DialogTitle>
          <DialogDescription>Draw your visual goals here.</DialogDescription>
        </DialogHeader>
        <div className="mx-auto h-[calc(80vh-36px)] w-[95vw]">
          <Excalidraw excalidrawAPI={(api) => (excalidrawAPI.current = api)} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={exportImage}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
