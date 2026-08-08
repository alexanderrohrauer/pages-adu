"use client";

import { useParams, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { createContext, useContext } from "react";
import useSWR from "swr";
import type { Artifact, ChangeRequest } from "@/lib/db/schema";
import { fetcher } from "@/lib/fetch";

type ActiveChangeRequest = ChangeRequest & { technicalName?: string };

type ActiveChangeRequestContextValue = {
  activeChangeRequest: ActiveChangeRequest | null;
  activeArtifact: Artifact | null;
  isLoading: boolean;
};

const ActiveChangeRequestContext =
  createContext<ActiveChangeRequestContextValue | null>(null);

export function ActiveChangeRequestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params?.id === "string" ? params.id : undefined;

  const { data, isLoading } = useSWR<ActiveChangeRequest>(
    id ? `/api/change-requests/${id}` : null,
    fetcher
  );

  const artifactId = useMemo(
    () => searchParams.get("artifactId") ?? data?.artifactId,
    [data?.artifactId, searchParams]
  );

  const { data: activeArtifact } = useSWR<Artifact>(
    artifactId ? `/api/artifacts/${artifactId}` : null,
    fetcher
  );

  return (
    <ActiveChangeRequestContext.Provider
      value={{
        activeChangeRequest: data ?? null,
        isLoading,
        activeArtifact: activeArtifact ?? null,
      }}
    >
      {children}
    </ActiveChangeRequestContext.Provider>
  );
}

export function useActiveChangeRequest() {
  const context = useContext(ActiveChangeRequestContext);
  if (!context) {
    throw new Error(
      "useActiveChangeRequest must be used within an ActiveChangeRequestProvider"
    );
  }
  return context;
}
