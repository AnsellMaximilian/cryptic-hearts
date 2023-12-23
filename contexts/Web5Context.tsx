"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Web5 } from "@web5/api";

export interface Web5ContextData {
  currentDid: string | null;
  loading: boolean;
  setCurrentDid: (did: string | null) => void;
  web5: Web5 | null;
  setWeb5: (web5: Web5 | null) => void;
}

export const Web5Context = createContext<Web5ContextData>({
  currentDid: null,
  loading: true,
  setCurrentDid: () => {},
  web5: null,
  setWeb5: () => {},
});

export const Web5ContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentDid, setCurrentDid] = useState<string | null>(null);
  const [web5, setWeb5] = useState<Web5 | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const currentRoute = usePathname();

  useEffect(() => {
    (async () => {
      const { web5, did } = await Web5.connect();
      setCurrentDid(did);
      setWeb5(web5);
    })();
  }, []);

  return (
    <Web5Context.Provider
      value={{
        currentDid,
        setCurrentDid,
        loading,
        web5,
        setWeb5,
      }}
    >
      {children}
    </Web5Context.Provider>
  );
};

export const useWeb5 = (): Web5ContextData => {
  const context = useContext(Web5Context);
  if (!context) {
    throw new Error("useWeb5 must be used within a Web5ContextProvider");
  }
  return context;
};
