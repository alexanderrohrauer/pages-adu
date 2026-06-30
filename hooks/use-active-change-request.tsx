"use client";

import { useParams } from "next/navigation";
import type React from "react";
import { createContext, useContext } from "react";
import useSWR from "swr";
import type { ChangeRequest } from "@/lib/db/schema";

const fetcher = async (url: string): Promise<ChangeRequest> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch change request");
  return res.json();
};

type ActiveChangeRequestContextValue = {
  activeChangeRequest: ChangeRequest | null;
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
  const id = typeof params?.id === "string" ? params.id : undefined;

  const { data, isLoading } = useSWR<ChangeRequest>(
    id ? `/api/change-requests/${id}` : null,
    fetcher
  );

  return (
    <ActiveChangeRequestContext.Provider
      value={{ activeChangeRequest: data ?? null, isLoading }}
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
