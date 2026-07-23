"use client";

import { useParams } from "next/navigation";
import type React from "react";
import { createContext, useContext } from "react";
import useSWR from "swr";
import type { ChangeRequest } from "@/lib/db/schema";
import { BASE_PATH } from "@/lib/fetch";

type ActiveChangeRequest = ChangeRequest & { technicalName?: string };

const fetcher = async (url: string): Promise<ActiveChangeRequest> => {
  const res = await fetch(`${BASE_PATH}${url}`);
  if (!res.ok) throw new Error("Failed to fetch change request");
  return res.json();
};

type ActiveChangeRequestContextValue = {
  activeChangeRequest: ActiveChangeRequest | null;
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

  const { data, isLoading } = useSWR<ActiveChangeRequest>(
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
