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
import {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";

const INITIAL_DATA: ExcalidrawInitialDataState = {
  elements: [
    {
      id: "4kL1iKuAikZ6bmAsUPSSa",
      type: "frame",
      x: 280.30078125,
      y: 74.09375,
      width: 949.6171875,
      height: 513.375,
      angle: 0,
      strokeColor: "#bbb",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      index: null,
      roundness: null,
      seed: 2069513084,
      version: 171,
      versionNonce: 940607228,
      isDeleted: false,
      boundElements: null,
      updated: 1786277604740,
      link: null,
      locked: true,
      name: "Window",
    },
  ],
};

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

    const { exportToBlob } = await import("@excalidraw/excalidraw");

    const result: Blob = await exportToBlob({
      elements,
      appState: {
        //...initialData.appState,
        exportWithDarkMode: false,
      },
      files: excalidrawAPI.current!.getFiles(),
    });
    console.log(excalidrawAPI.current!.getSceneElements());
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
          <Excalidraw
            initialData={INITIAL_DATA}
            excalidrawAPI={(api) => (excalidrawAPI.current = api)}
          />
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
