"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Artifact } from "@/lib/db/schema";
import { BASE_PATH, fetcher } from "@/lib/fetch";

export function ArtifactsOverview() {
  const router = useRouter();
  const {
    data: artifacts,
    isLoading,
    mutate,
  } = useSWR<Artifact[]>("/api/artifacts", fetcher);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/artifacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create artifact");
      }
      const artifact: Artifact = await res.json();
      await mutate();
      setOpen(false);
      setName("");
      router.push(`/new?artifactId=${artifact.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Artifacts</h1>
          <p className="text-muted-foreground text-sm">
            Projects group your change-requests and each have their own
            repository.
          </p>
        </div>
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusIcon className="size-4" />
              New Artifact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Artifact</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="artifact-name">Name</Label>
              <Input
                autoFocus
                id="artifact-name"
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
                placeholder="My Website"
                value={name}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={isCreating || !name.trim()}
                onClick={handleCreate}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}

      {!isLoading && artifacts?.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No artifacts yet. Create one to get started.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {artifacts?.map((artifact) => (
          <button
            className="hover:bg-accent flex flex-col items-start gap-0.5 rounded-lg border p-4 text-left transition-colors"
            key={artifact.id}
            onClick={() => router.push(`/new?artifactId=${artifact.id}`)}
            type="button"
          >
            <span className="font-medium">{artifact.name}</span>
            <span className="text-muted-foreground text-xs">
              {artifact.technicalName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
