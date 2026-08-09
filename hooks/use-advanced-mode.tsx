"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "advancedMode";

type AdvancedModeContextValue = {
  advancedMode: boolean;
  setAdvancedMode: (advancedMode: boolean) => void;
};

const AdvancedModeContext = createContext<AdvancedModeContextValue | null>(
  null
);

export function AdvancedModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [advancedMode, setAdvancedModeState] = useState(false);

  useEffect(() => {
    setAdvancedModeState(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const setAdvancedMode = (value: boolean) => {
    setAdvancedModeState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  };

  const value = useMemo(
    () => ({ advancedMode, setAdvancedMode }),
    [advancedMode]
  );

  return (
    <AdvancedModeContext.Provider value={value}>
      {children}
    </AdvancedModeContext.Provider>
  );
}

export function useAdvancedMode() {
  const context = useContext(AdvancedModeContext);
  if (!context) {
    throw new Error(
      "useAdvancedMode must be used within an AdvancedModeProvider"
    );
  }
  return context;
}
